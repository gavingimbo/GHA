// Captures the password-recovery states at 3x from the app, with the rects of
// everything the film points at. Pass the app root (a checkout with the in-sheet reset).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));
const OUT = path.join(HERE, 'assets', 'reset'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml' };
const server = http.createServer((q, r) => { let rel = decodeURIComponent(q.url.split('?')[0]); if (rel.endsWith('/')) rel += 'index.html';
  const f = path.join(ROOT, rel); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => server.listen(8195, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
await page.goto('http://127.0.0.1:8195/index.html?controls=0', { waitUntil: 'load' });
const settle = async () => { await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = i.onerror = r))); }); await page.waitForTimeout(350); };
const G = { signedIn: false, screen: 'page', modal: 'signin', controlsHidden: true, mockOpen: false };
const OTP = { ...G, signinMode: 'reset_otp', resetEmail: 'gavin@example.com' };
const states = {
  signin:     { ...G, signinMode: 'signin', loginValue: 'gavin@example.com', passwordValue: 'Hillcrest9', resendIn: 0 },
  forgot:     { ...G, signinMode: 'forgot', resetEmail: 'gavin@example.com' },
  otp:        { ...OTP, resendIn: 57 },
  typing:     { ...OTP, resendIn: 50, otp: '800368', newPassword: 'hill 94', newPasswordFocused: true, validated: true },
  full:       { ...OTP, resendIn: 44, otp: '800368', newPassword: 'Hillcrest94!', confirmPassword: 'Hillcrest94!', newPasswordFocused: true, validated: true },
  submitting: { ...OTP, resendIn: 43, otp: '800368', newPassword: 'Hillcrest94!', confirmPassword: 'Hillcrest94!', newPasswordFocused: true, validated: true, submitting: true },
  expired:    { ...OTP, resendIn: 0, otp: '800368', newPassword: 'Hillcrest94!', confirmPassword: 'Hillcrest94!', newPasswordFocused: true, validated: true, otpErrored: true, submitError: 'That code has expired. Tap Resend code to get a new one.' },
  member:     { signedIn: true, screen: 'page', modal: null, loadingProfile: false, posVariant: 'view_bill', billStatus: 'ready', sessionHint: null, burned: null, controlsHidden: true, mockOpen: false },
};
const rects = {};
for (const [name, st] of Object.entries(states)) {
  await page.evaluate(() => window.GHA_MOCK.reset && window.GHA_MOCK.reset());
  await page.evaluate((p) => window.GHA_MOCK.set(p), st);
  await page.evaluate(() => window.scrollTo(0, 0)); await settle();
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  rects[name] = await page.evaluate(() => {
    const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const byText = (sel, re) => [...document.querySelectorAll(sel)].find((e) => re.test(e.textContent.trim()) && e.children.length < 3);
    const boxes = [...document.querySelectorAll('input')].filter((i) => i.maxLength === 1 || i.getAttribute('inputmode') === 'numeric');
    return {
      forgot: R(byText('a,button,span', /^Forgot Password\?$/)),
      send: R(byText('button', /SEND CODE/i)),
      signin: R(byText('button', /^SIGN IN$/i)),
      reset: R(byText('button', /RESET PASSWORD|Submitting/i)),
      resend: R(byText('a,button,span', /^Resend code/)),
      boxes: boxes.map(R),
      error: R(byText('p,div,span', /expired\. Tap Resend/)),
      newpw: R([...document.querySelectorAll('input')].find((i) => i.type === 'password')),
      rules: R(byText('p,div,span,ul', /^Your password must have/)),
    };
  });
}
fs.writeFileSync(path.join(OUT, 'rects.json'), JSON.stringify(rects, null, 1));
console.log(JSON.stringify(rects));
await b.close(); server.close();
