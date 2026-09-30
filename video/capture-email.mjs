// Renders the real reset-code email (reference/email/password-reset-code.html) as a
// phone would show it: 393 px wide at 3x, into assets/reset/email.png. The email's
// header and footer carry the venue's name; the captured one came from Gatz, so it
// is set to the film's venue, as the guest at Dreams & Beats would receive it.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(process.argv[2] || path.join(HERE, '..'), 'reference/email/password-reset-code.html');
const VENUE = 'Dreams &amp; Beats';
const html = fs.readFileSync(SRC, 'utf8').replace(/>Gatz</g, `>${VENUE}<`).replace(/Sent by Gatz via/g, `Sent by ${VENUE} via`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
await p.setContent(html); await p.waitForTimeout(300);
const h = await p.evaluate(() => document.documentElement.scrollHeight);
await p.screenshot({ path: path.join(HERE, 'assets/reset/email.png'), fullPage: true });
const box = (re) => p.evaluate((src) => { const re = new RegExp(src); const el = [...document.querySelectorAll('td,div,p,span')].reverse().find((e) => re.test(e.textContent.trim()) && e.children.length === 0); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.textContent.trim() }; }, re.source);
const card = await p.evaluate(() => [...document.querySelectorAll("table")].map((t) => { const r = t.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
console.log(JSON.stringify({ height: h, card, code: await box(/^\d{6}$/), venue: await box(/^Dreams & Beats$/) })); await b.close();
