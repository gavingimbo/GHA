/**
 * Renders every state in states.json out of the production mockup and writes
 * reference/shots/<id>.png (viewport) plus <id>-full.png for the states marked
 * "full": true.
 *
 *   npm i playwright-core          # or use the Chromium already on the machine
 *   node reference/capture.mjs
 *
 * Options:
 *   --only=<id[,id]>   capture just these states
 *   --scale=1|2|3      device pixel ratio (default from states.json meta)
 *   --chromium=<path>  browser executable
 *
 * The mockup exposes window.GHA_MOCK (js/app.js) so every state can be driven
 * directly, including the ones the on-page mock panel does not cover. Nothing
 * here edits the page: the mock FAB is hidden and the scroll containers are
 * unclipped for full-length shots via injected CSS only.
 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SHOTS = path.join(HERE, 'shots');
const PORT = 8231;

const argv = process.argv.slice(2);
const arg = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : null;
};

const CATALOGUE = JSON.parse(fs.readFileSync(path.join(HERE, 'states.json'), 'utf8'));
const only = arg('only') ? new Set(arg('only').split(',')) : null;
const scale = Number(arg('scale') || CATALOGUE.meta.scale || 2);
const executablePath =
  arg('chromium') ||
  process.env.CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

/** Neutralises the fixed/clipped containers so a full-length shot shows the
 *  whole screen instead of one viewport of it. Injected per shot, never saved. */
const UNCLIP = `
  html, body { overflow: visible !important; height: auto !important; }
  .modal_backdrop { position: static !important; inset: auto !important; }
  .modal_sheet { height: auto !important; overflow: visible !important; }
  [class*="gha_modal_root"] { height: auto !important; }
  [class*="gha_signup_body"], [class*="gha_terms_body"] {
    overflow: visible !important; max-height: none !important;
  }
`;

const HIDE_MOCK = `.mock_fab, .mock_panel { display: none !important; }`;

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

/** Waits for fonts and every <img> to actually decode — tier cards and the
 *  venue cover otherwise land in the shot as empty boxes. */
const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth
          ? null
          : new Promise((r) => { img.onload = img.onerror = r; })
      )
    );
    return imgs.length;
  });

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ executablePath });
  const { width, height } = CATALOGUE.meta.viewport;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });

  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));

  const states = CATALOGUE.groups.flatMap((g) => g.states.map((s) => ({ ...s, group: g.id })));
  const todo = only ? states.filter((s) => only.has(s.id)) : states;
  let written = 0;

  for (const s of todo) {
    // Reload per state so nothing leaks between captures — a fixture override
    // such as the member tier would otherwise persist.
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
    await page.addStyleTag({ content: HIDE_MOCK });

    if (s.fixture) {
      await page.evaluate((fx) => {
        const d = window.GHA_MOCK.fixtures;
        if (fx.member) Object.assign(d.MEMBER, fx.member);
        if (fx.venue) Object.assign(d.VENUE, fx.venue);
      }, s.fixture);
    }
    await page.evaluate((patch) => window.GHA_MOCK.set(patch), s.patch || {});
    await settle(page);
    await page.waitForTimeout(140);            // let the CSS transitions land

    await page.screenshot({ path: path.join(SHOTS, `${s.id}.png`) });
    written++;

    if (s.full) {
      await page.addStyleTag({ content: UNCLIP });
      await page.evaluate(() => window.scrollTo(0, 0));
      await settle(page);
      await page.waitForTimeout(120);
      await page.screenshot({ path: path.join(SHOTS, `${s.id}-full.png`), fullPage: true });
      written++;
    }
    process.stdout.write(`  ${s.id}${s.full ? ' (+full)' : ''}\n`);
  }

  await browser.close();
  server.close();

  console.log(`\n${todo.length} states, ${written} images → reference/shots/`);
  if (problems.length) {
    console.log('\nBrowser reported:');
    [...new Set(problems)].forEach((p) => console.log('  ' + p));
    process.exitCode = 1;
  } else {
    console.log('No console errors, page errors or failed requests.');
  }
}

main();
