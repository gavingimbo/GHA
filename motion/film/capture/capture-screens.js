// Captures the film's phone screens from the production MyMenu mockup in the repo root.
// The mockup itself is not edited. Its fixture (js/data.js) is patched at request time to
// the film's values: Gavin Matthew, member ID 839283945, Titanium.
//
//   DISCOUNT_PCT=50 node motion/film/capture/capture-screens.js
//
// DISCOUNT_PCT is the Titanium member discount shown on the bill. It defaults to 50.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.resolve(__dirname, '../public/ui');
const PORT = 8232;
const SCALE = 2;
const CHROMIUM = '/opt/pw-browsers/chromium';
const EMAIL = 'gavin@gavinmatthew.com';
const PASSWORD = 'password1';
const PCT = Number(process.env.DISCOUNT_PCT || 50);
const SUBTOTAL = 58400;
const W = 393;
const H = 852;
const PAGE_H = 1184; // the bill page's full height, so the whole page captures in one image

const states = JSON.parse(fs.readFileSync(path.join(ROOT, 'reference/states.json'), 'utf8'));
const byId = {};
states.groups.forEach((g) => g.states.forEach((s) => (byId[s.id] = s)));

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function patchData(src) {
  const discount = Math.round(SUBTOTAL * PCT) / 100;
  const eligible = SUBTOTAL - discount;
  const service = Math.round(eligible * 10) / 100;
  const vat = Math.round((eligible + service) * 18) / 100;
  const edits = [
    ["cardNumber: '1346942045'", "cardNumber: '839283945'"],
    ["name: 'GHA DISCOVERY 15%', amount: 8760", `name: 'GHA DISCOVERY ${PCT}%', amount: ${discount}`],
    ["name: 'Service Charge 10%', amount: 4964", `name: 'Service Charge 10%', amount: ${service}`],
    ["name: 'VAT 18%', amount: 9829", `name: 'VAT 18%', amount: ${vat}`],
  ];
  let out = src;
  for (const [a, b] of edits) {
    if (out.split(a).length !== 2) throw new Error('fixture edit did not match exactly once: ' + a);
    out = out.replace(a, b);
  }
  return out;
}

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const HIDE_MOCK = '.mock_fab, .mock_panel { display: none !important; }';
const pad = (n) => String(n).padStart(2, '0');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.route(/\/js\/data\.js(\?.*)?$/, async (route) => {
    await route.fulfill({ body: patchData(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8')), contentType: 'text/javascript' });
  });

  const layout = { discountPct: PCT, w: W, h: H, pageH: PAGE_H };

  // Loads the mockup in a state, optionally at a given viewport height and scroll offset
  async function open(id, { height = H, patch = {}, scrollY = 0 } = {}) {
    await page.setViewportSize({ width: W, height });
    await page.goto(`http://127.0.0.1:${PORT}/index.html?controls=0`, { waitUntil: 'load' });
    await page.addStyleTag({ content: HIDE_MOCK });
    await page.evaluate((p) => window.GHA_MOCK.set(p), { ...(byId[id].patch || {}), ...patch });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(300);
    if (scrollY) { await page.evaluate((y) => window.scrollTo(0, y), scrollY); await page.waitForTimeout(150); }
  }
  const shot = async (name) => { await page.screenshot({ path: path.join(OUT, name + '.png') }); console.log('captured', name); };
  const box = async (locator) => {
    const b = await locator.boundingBox();
    const sy = await page.evaluate(() => window.scrollY);
    return b && { x: Math.round(b.x), y: Math.round(b.y + sy), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const byText = (re) => page.locator('button, a, div, span').filter({ hasText: re }).last();

  // 1. Landing, with the Sign in button
  await open('guest-landing');
  await shot('landing');
  layout.landingSignIn = await box(page.getByRole('button', { name: /sign in to continue/i }).first());

  // 2. Sign-in sheet: empty, email typed one character at a time, then the password
  await open('guest-signin');
  await shot('signin-0');
  const inputs = page.locator('input');
  for (let k = 1; k <= EMAIL.length; k++) { await inputs.nth(0).fill(EMAIL.slice(0, k)); await shot('signin-e' + pad(k)); }
  for (let k = 1; k <= PASSWORD.length; k++) { await page.locator('input[type="password"]').fill(PASSWORD.slice(0, k)); await shot('signin-p' + pad(k)); }
  layout.signinField = await box(inputs.nth(0));
  layout.passwordField = await box(page.locator('input[type="password"]'));
  layout.signinSubmit = await box(page.getByRole('button', { name: /^sign in$/i }).last());
  layout.emailLength = EMAIL.length;
  layout.passwordLength = PASSWORD.length;

  // 3. Submitting, loading, member landing
  await open('guest-signin-submitting'); await shot('signin-submitting');
  await open('member-loading'); await shot('member-loading');
  await open('member-landing-view-bill'); await shot('member');
  layout.viewBill = await box(byText(/view bill on/i));

  // 4. The bill page, full height, with 0 and 60 typed into the D$ field
  await open('burn-default', { height: PAGE_H, patch: { spend: 0 } }); await shot('bill-0');
  await open('burn-default', { height: PAGE_H, patch: { spend: 60 } }); await shot('bill-60');
  layout.rows = await page.evaluate(() => {
    const find = (txt) => { const e = [...document.querySelectorAll('*')].filter((x) => x.children.length === 0 && x.textContent.trim().startsWith(txt))[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { y: Math.round(r.top + window.scrollY), h: Math.round(r.height) }; };
    const input = document.querySelector('input'); const ir = input.getBoundingClientRect();
    return { items: find('Items'), subtotal: find('Subtotal'), discount: find('Discount'), total: find('Total'), spend: find('Spend'), apply: find('APPLY'),
      spendInput: { y: Math.round(ir.top + window.scrollY), h: Math.round(ir.height), x: Math.round(ir.left), w: Math.round(ir.width) } };
  });

  // 5. Apply dialogs, captured as the phone shows them with the page scrolled to the bottom
  const maxScroll = PAGE_H - H;
  layout.maxScroll = maxScroll;
  await open('burn-confirm-dialog', { patch: { spend: 60 }, scrollY: maxScroll }); await shot('dialog');
  layout.dialogButtons = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return { text: b.textContent.trim().slice(0, 30), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }));
  await open('burn-confirm-submitting', { patch: { spend: 60 }, scrollY: maxScroll }); await shot('dialog-submitting');
  await open('burn-confirm-success', { patch: { spend: 60 }, scrollY: maxScroll }); await shot('dialog-success');

  fs.writeFileSync(path.join(OUT, 'layout.json'), JSON.stringify(layout, null, 2));
  await browser.close(); server.close();
  if (problems.length) console.log('page problems:\n' + problems.join('\n'));
  console.log('done; layout.json written');
})().catch((e) => { console.error(e); process.exit(1); });
