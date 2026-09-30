import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
// the films: node record.mjs [--film=check|password] [stills]
const FILMS = {
  check: { page: 'explainer.html', audio: 'soundtrack.wav', out: 'check-open-on-pos.mp4' },
  password: { page: 'password.html', audio: 'soundtrack-password.wav', out: 'forgotten-password.mp4' },
};
const args = process.argv.slice(2);
const FILM = FILMS[(args.find((a) => a.startsWith('--film=')) || '--film=check').slice(7)];
const rest = args.filter((a) => !a.startsWith('--film='));
const FFMPEG = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const FPS = 60, SS = 2, only = rest[0];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: SS });
await page.goto('file://' + path.join(HERE, FILM.page) + '?record=1');
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = r))); });
if (only) { // stills for review: node record.mjs [--film=…] 1,5,8
  for (const t of only.split(',')) { await page.evaluate((t) => render(t), +t); await page.screenshot({ path: path.join(HERE, `still-${t}.png`) }); }
  await browser.close(); process.exit(0);
}
const dur = await page.evaluate(() => window.DURATION);
const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-vf', 'scale=1080:1440:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart', path.join(HERE, 'silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round(dur * FPS);
for (let i = 0; i < N; i++) {
  await page.evaluate((t) => render(t), i / FPS);
  const buf = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
// lay the soundtrack (python3 video/audio.py) under the picture, normalised for phones and social
const mux = spawn(FFMPEG, ['-y', '-i', path.join(HERE, 'silent.mp4'), '-i', path.join(HERE, FILM.audio),
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
  '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(HERE, FILM.out)], { stdio: 'inherit' });
await new Promise(r => mux.on('close', r));
fs.unlinkSync(path.join(HERE, 'silent.mp4'));
