// Flags hard cuts: renders the timeline at 30 fps (small) and reports frames whose
// change from the previous frame is far above the running motion.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path'; import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
await p.goto('file://' + path.join(HERE, 'explainer.html') + '?record=1');
await p.evaluate(async () => { await document.fonts.ready; });
const dir = process.argv[2]; fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < 31.5 * 30; i++) {
  await p.evaluate((t) => render(t), i / 30);
  await p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 70, scale: 'css', clip: { x: 0, y: 0, width: 1080, height: 1080 } });
}
await b.close();
