// Flags hard cuts: renders the timeline at 30 fps (small) and reports frames whose
// change from the previous frame is far above the running motion.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path'; import fs from 'node:fs';
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
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1440 } });
await p.goto('file://' + path.join(HERE, FILM.page) + '?record=1');
await p.evaluate(async () => { await document.fonts.ready; });
const dir = rest[0]; fs.mkdirSync(dir, { recursive: true });
const dur = await p.evaluate(() => window.DURATION);
for (let i = 0; i < dur * 30; i++) {
  await p.evaluate((t) => render(t), i / 30);
  await p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 70, scale: 'css', clip: { x: 0, y: 0, width: 1080, height: 1440 } });
}
await b.close();
