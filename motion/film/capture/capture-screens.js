// Captures the film's screens from the production MyMenu mockup in the repo root.
// The mockup itself is not edited. Its fixture (js/data.js) is patched at request
// time to the film's values: Gavin Matthew, member ID 839283945, Titanium at 50%.
//
//   node motion/film/capture/capture-screens.js
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.resolve(__dirname, '../public/ui');
const PORT = 8232;
const EMAIL = 'gavin@gavinmatthew.com';
const SCALE = 2;
const CHROMIUM = '/opt/pw-browsers/chromium';

const states = JSON.parse(fs.readFileSync(path.join(ROOT, 'reference/states.json'), 'utf8'));
const byId = {};
states.groups.forEach((g) => g.states.forEach((s) => (byId[s.id] = s)));

const CUSTOM = {
  'burn-spend-60': { from: 'burn-default', patch: { spend: 60 } },
  'signin-email': { from: 'guest-signin', fill: [EMAIL] },
  'signin-password': { from: 'guest-signin', fill: [EMAIL, '••••••••'] },
};

const TO_CAPTURE = [
  'guest-landing',
  'guest-signin',
  'signin-email',
  'signin-password',
  'guest-signin-submitting',
  'member-landing-view-bill',
  'burn-default',
  'burn-spend-60',
  'burn-zero-earn',
  'burn-confirm-dialog',
  'burn-confirm-submitting',
  'burn-confirm-success',
];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

// Fixture patch: name and member ID, Titanium at 50% (LKR 58,400 subtotal).
function patchData(src) {
  const edits = [
    ["cardNumber: '1346942045'", "cardNumber: '839283945'"],
    ["name: 'GHA DISCOVERY 15%', amount: 8760", "name: 'GHA DISCOVERY 50%', amount: 29200"],
    ["name: 'Service Charge 10%', amount: 4964", "name: 'Service Charge 10%', amount: 2920"],
    ["name: 'VAT 18%', amount: 9829", "name: 'VAT 18%', amount: 5781.6"],
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
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const HIDE_MOCK = '.mock_fab, .mock_panel { display: none !important; }';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const { width, height } = states.meta.viewport;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: SCALE });
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });

  await page.route(/\/js\/data\.js(\?.*)?$/, async (route) => {
    const src = fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8');
    await route.fulfill({ body: patchData(src), contentType: 'text/javascript' });
  });

  for (const id of TO_CAPTURE) {
    const custom = CUSTOM[id];
    const base = custom ? byId[custom.from] : byId[id];
    if (!base) throw new Error('unknown state ' + id);
    const patch = custom && custom.patch ? { ...base.patch, ...custom.patch } : base.patch || {};

    await page.goto(`http://127.0.0.1:${PORT}/index.html?controls=0`, { waitUntil: 'load' });
    await page.addStyleTag({ content: HIDE_MOCK });
    await page.evaluate((p) => window.GHA_MOCK.set(p), patch);
    if (custom && custom.fill) {
      const inputs = page.locator('input');
      await inputs.nth(0).fill(custom.fill[0]);
      if (custom.fill[1]) await page.locator('input[type="password"]').fill(custom.fill[1]);
    }
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${id}.png`) });
    console.log('captured', id);
  }

  await browser.close();
  server.close();
  if (problems.length) console.log('page problems:\n' + problems.join('\n'));
})().catch((e) => { console.error(e); process.exit(1); });
