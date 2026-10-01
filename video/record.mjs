import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
// the films: node record.mjs [--film=check|password] [stills]
const FILMS = {
  check: { page: 'explainer.html', audio: 'soundtrack.wav', out: 'check-open-on-pos.mp4' },
  password: { page: 'password.html', audio: 'soundtrack-password.wav', out: 'forgotten-password.mp4' },
};
const args = process.argv.slice(2);
const FILM = FILMS[(args.find((a) => a.startsWith('--film=')) || '--film=check').slice(7)];
const PREVIEW = args.includes('--preview');                 // 1x, 30 fps, silent: for checking motion
const rest = args.filter((a) => !a.startsWith('--'));
const FFMPEG = process.env.FFMPEG || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const FPS = PREVIEW ? 30 : 60, SS = PREVIEW ? 1 : 2, only = rest[0];

// served over http so the films can drive the mockup inside their phones (same origin)
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]); if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/video/`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SS });   // 16:9
page.on('pageerror', (e) => console.error('pageerror:', e.message));
await page.goto(BASE + FILM.page + '?record=1');
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = i.onerror = r)));
  if (window.READY) await window.READY;
});
const done = async () => { await browser.close(); server.close(); };
if (only) { // stills for review: node record.mjs [--film=…] 1,5,8
  for (const t of only.split(',')) { await page.evaluate((t) => render(t), +t); await page.screenshot({ path: path.join(HERE, `still-${t}.png`) }); }
  await done(); process.exit(0);
}
const dur = await page.evaluate(() => window.DURATION);
// the cover is the first frame, and the thumbnail: saved at 1920 x 1080 and set as the file's cover art
const THUMB = path.join(HERE, 'thumbnails', path.basename(FILM.out, '.mp4') + '.png');
if (!PREVIEW) {
  fs.mkdirSync(path.dirname(THUMB), { recursive: true });
  await page.evaluate(() => render(0));
  const big = await page.screenshot({ type: 'png' });
  const sh = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-i', '-', '-vf', 'scale=1920:1080:flags=lanczos', THUMB], { stdio: ['pipe', 'inherit', 'inherit'] });
  sh.stdin.end(big); await new Promise(r => sh.on('close', r));
}
const SILENT = path.join(HERE, PREVIEW ? `preview-${path.basename(FILM.out)}` : 'silent.mp4');
const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', PREVIEW ? '24' : '14', '-preset', PREVIEW ? 'veryfast' : 'slow', '-movflags', '+faststart', SILENT], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round(dur * FPS);
for (let i = 0; i < N; i++) {
  await page.evaluate((t) => render(t), i / FPS);
  const buf = await page.screenshot(PREVIEW ? { type: 'jpeg', quality: 88 } : { type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) console.log(`  ${(i / FPS).toFixed(0)} s / ${dur} s`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await done();
if (PREVIEW) process.exit(0);
// lay the soundtrack (python3 video/audio.py) under the picture, normalised for phones and social
const AV = path.join(HERE, 'av.mp4');
const mux = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-i', SILENT, '-i', path.join(HERE, FILM.audio),
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
  '-c:a', 'aac', '-b:a', '192k', '-shortest', AV], { stdio: 'inherit' });
await new Promise(r => mux.on('close', r));
// then the cover art, in its own pass (-shortest would cut the film to the one-frame picture)
const art = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-i', AV, '-i', THUMB, '-map', '0', '-map', '1', '-c', 'copy', '-c:v:1', 'png',
  '-disposition:v:1', 'attached_pic', '-movflags', '+faststart', path.join(HERE, FILM.out)], { stdio: 'inherit' });
await new Promise(r => art.on('close', r));
fs.unlinkSync(SILENT); fs.unlinkSync(AV);
