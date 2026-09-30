import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FPS = 60, SS = 2, only = process.argv[2];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: SS });
await page.goto('file://' + path.join(HERE, 'explainer.html') + '?record=1');
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = r))); });
if (only) { // stills for review: node record.mjs 1,5,8
  for (const t of only.split(',')) { await page.evaluate((t) => render(t), +t); await page.screenshot({ path: path.join(HERE, `still-${t}.png`) }); }
  await browser.close(); process.exit(0);
}
const dur = await page.evaluate(() => window.DURATION);
const ff = spawn('/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-vf', 'scale=1080:1080:flags=lanczos', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart', path.join(HERE, 'check-open-on-pos.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round(dur * FPS);
for (let i = 0; i < N; i++) {
  await page.evaluate((t) => render(t), i / FPS);
  const buf = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
