// Checks every statement in both films, at rest: no line wraps, every line fits the
// frame, and nothing is clipped by its mask (each line is screenshotted with its
// mask on and off; any pixel that differs was being cut off).
//   node video/check-type.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]); if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
let problems = 0;
for (const film of (process.argv[2] ? [process.argv[2]] : ['password.html', 'explainer.html'])) {
  await page.goto(`http://127.0.0.1:${server.address().port}/video/${film}?t=1`);
  await page.evaluate(async () => { await document.fonts.ready; if (window.READY) await window.READY; });
  // a quiet stage: only the words, every line at rest
  const ids = await page.evaluate(() => {
    document.querySelectorAll('#stage > :not(.title):not(.panel)').forEach((e) => { e.style.display = 'none'; });
    document.querySelectorAll('.panel').forEach((p) => { p.style.transform = 'none'; p.style.display = 'block'; });
    document.querySelectorAll('.ln > *').forEach((e) => { e.style.transform = 'none'; });
    const all = [...document.querySelectorAll('.title')];
    all.forEach((t, i) => { if (!t.id) t.id = `title-${i}`; });
    return all.map((t) => t.id);
  });
  for (const id of ids) {
    const info = await page.evaluate((id) => {
      document.querySelectorAll('.title').forEach((t) => { t.style.visibility = t.id === id ? 'visible' : 'hidden'; });
      const el = document.getElementById(id);
      document.querySelectorAll('.panel').forEach((p) => { p.style.display = p.contains(el) ? 'block' : 'none'; });
      return [...document.getElementById(id).querySelectorAll('.ln > *')].map((el) => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2;
        const r = el.getBoundingClientRect();
        // the room a line has: its column, less the mask's own side padding
        const col = el.closest('.title').getBoundingClientRect().width - 48;
        return { text: el.textContent, w: r.width, h: r.height, lh, col };
      });
    }, id);
    for (const l of info) {
      if (l.text && l.h > l.lh * 1.5) { problems++; console.log(`${film} #${id}: wraps — "${l.text}"`); }
      if (l.w > l.col) { problems++; console.log(`${film} #${id}: ${Math.round(l.w)} px wide in a ${Math.round(l.col)} px column — "${l.text}"`); }
    }
    const box = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 60), width: 1920, height: Math.min(1080 - Math.max(0, r.top - 60), r.height + 120) }; }, id);
    const masked = await page.screenshot({ clip: box });
    await page.evaluate(() => document.querySelectorAll('.ln').forEach((e) => { e.style.overflow = 'visible'; }));
    const open = await page.screenshot({ clip: box });
    await page.evaluate(() => document.querySelectorAll('.ln').forEach((e) => { e.style.overflow = ''; }));
    if (!masked.equals(open)) { problems++; console.log(`${film} #${id}: clipped by its mask — "${info.map((l) => l.text).join(' / ')}"`); }
  }
  console.log(`${film}: ${ids.length} titles checked`);
}
await browser.close(); server.close();
console.log(problems ? `${problems} problem(s)` : 'every line whole, unwrapped and inside the frame');
process.exit(problems ? 1 : 0);
