// Renders the real reset-code email (reference/email/password-reset-code.html) as a
// phone would show it: 393 px wide at 3x, into assets/reset/email.png.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(process.argv[2] || path.join(HERE, '..'), 'reference/email/password-reset-code.html');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
await p.goto('file://' + SRC); await p.waitForTimeout(300);
const h = await p.evaluate(() => document.documentElement.scrollHeight);
await p.screenshot({ path: path.join(HERE, 'assets/reset/email.png'), fullPage: true });
const code = await p.evaluate(() => { const el = [...document.querySelectorAll('td,div,p,span')].find((e) => /^\s*\d{6}\s*$/.test(e.textContent)); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.textContent.trim() }; });
console.log(JSON.stringify({ height: h, code })); await b.close();
