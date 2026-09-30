// Captures the real app states the explainer uses, at 3x, from the mockup.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'assets');
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]); if (rel.endsWith('/')) rel += 'index.html';
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(8193, r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
await page.goto('http://127.0.0.1:8193/index.html?controls=0', { waitUntil: 'load' });
const base = { signedIn: true, screen: 'burn', loadingProfile: false, billStatus: 'ready', burned: null, spend: 62, controlsHidden: true, mockOpen: false };
const settle = async () => { await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = i.onerror = r))); }); await page.waitForTimeout(300); };
const rects = {};
for (const [name, ds] of [['failed','failed'],['checking','checking'],['ok','ok']]) {
  await page.evaluate((p) => window.GHA_MOCK.set(p), { ...base, discountState: ds });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle();
  // Before the retry succeeds the POS has not taken the discount, so its bill row is not shown.
  if (ds !== 'ok') await page.evaluate(() => [...document.querySelectorAll('[class*="_bill_row_"]')].filter(x => /Discount/.test(x.textContent)).forEach(x => x.remove()));
  await page.screenshot({ path: path.join(OUT, `screen-${name}.png`) });
  rects[name] = await page.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const rows = [...document.querySelectorAll('[class*="_bill_row_"]')];
    return {
      card: r(document.querySelector('[class*="_discount_error_card_"]')),
      reason: r(document.querySelector('[class*="_discount_error_reason_"]')),
      retry: r(document.querySelector('[data-act="retry-discount"]')),
      checking: r(document.querySelector('[class*="_discount_checking_card_"]')),
      discountRow: r(rows.find(x => /Discount/.test(x.textContent))),
      billTop: r([...document.querySelectorAll('h1,h2,h3')].find((e) => /^Your bill/.test(e.textContent.trim()))),
      billCard: r(document.querySelector('[class*="_bill_card_"]')),
    };
  });
}
fs.writeFileSync(path.join(OUT, 'rects.json'), JSON.stringify(rects, null, 2));
console.log(JSON.stringify(rects, null, 1));
await browser.close(); server.close();
