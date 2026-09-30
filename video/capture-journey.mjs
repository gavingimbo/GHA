// Captures the journey screens the film opens with (guest landing, member landing),
// at 3x, with the rects of the buttons the guest taps.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..'), OUT = path.join(HERE, 'assets');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml' };
const server = http.createServer((q, r) => { let rel = decodeURIComponent(q.url.split('?')[0]); if (rel.endsWith('/')) rel += 'index.html';
  const f = path.join(ROOT, rel); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => server.listen(8194, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
await page.goto('http://127.0.0.1:8194/index.html?controls=0', { waitUntil: 'load' });
const settle = async () => { await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = i.onerror = r))); }); await page.waitForTimeout(300); };
const rects = {};
for (const [name, st, find] of [
  ['guest', { signedIn: false, screen: 'page', modal: null }, () => [...document.querySelectorAll('button')].find(e => /Sign in/.test(e.textContent))],
  ['member', { signedIn: true, screen: 'page', loadingProfile: false, posVariant: 'view_bill', billStatus: 'ready', sessionHint: null, burned: null }, () => document.querySelector('[class*="_action_card_"]')],
]) {
  await page.evaluate((p) => window.GHA_MOCK.set({ ...p, controlsHidden: true, mockOpen: false }), st);
  await page.evaluate(() => window.scrollTo(0, 0)); await settle();
  await page.screenshot({ path: path.join(OUT, `screen-${name}.png`) });
  rects[name] = await page.evaluate((src) => { const el = eval(`(${src})`)(); const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, find.toString());
}
console.log(JSON.stringify(rects)); await b.close(); server.close();
