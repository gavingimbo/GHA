/**
 * Renders index.html to an H.264 MP4, frame by frame.
 *
 *   npm i --no-save playwright-core
 *   pip install imageio-ffmpeg        # or have ffmpeg on PATH
 *   node video/render.mjs [--fps=60] [--out=video/out/dine-with-d-30s.mp4] [--stills=1.2,5,14]
 *
 * The page exposes window.seek(t), a pure function of time, so every frame is
 * rendered deterministically: seek, screenshot, pipe PNG into ffmpeg. A
 * soundtrack at video/audio/score.wav is muxed in when present (see score.py).
 */
import { chromium } from 'playwright-core';
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const arg = (n, d) => { const h = argv.find((a) => a.startsWith(`--${n}=`)); return h ? h.split('=').slice(1).join('=') : d; };
const FPS = Number(arg('fps', 60));
const OUT = path.resolve(arg('out', path.join(HERE, 'out', 'dine-with-d-30s.mp4')));
const STILLS = arg('stills', null);
const chromiumPath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const ffmpeg = process.env.FFMPEG || (() => {
  try { execSync('ffmpeg -version', { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  return execSync(`python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`).toString().trim();
})();

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: chromiumPath, args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/video/index.html?render=1`, { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
const stage = await page.$('#stage');
const shot = async (t) => { await page.evaluate((t) => window.seek(t), t); return stage.screenshot({ type: 'png' }); };

if (STILLS) {
  const dir = path.join(HERE, 'out', 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of STILLS.split(',').map(Number)) fs.writeFileSync(path.join(dir, `t${t.toFixed(2)}.png`), await shot(t));
  console.log(`stills → ${dir}`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);
  const score = path.join(HERE, 'audio', 'score.wav');
  const audio = fs.existsSync(score) ? ['-i', score, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : [];
  const ff = spawn(ffmpeg, [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-tune', 'film',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart', OUT,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const started = Date.now();
  for (let f = 0; f < frames; f++) {
    const buf = await shot(f / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % FPS === 0) process.stdout.write(`\r${(f / FPS).toFixed(0)}s / ${duration}s  (${((Date.now() - started) / 1000).toFixed(0)}s elapsed)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`\n→ ${OUT}`);
}
await browser.close();
server.close();
