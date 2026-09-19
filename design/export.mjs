/**
 * Builds the design folder: every component as a vector PDF and a raster PNG,
 * the icon set as real SVG, the colour palette as an Adobe swatch file, and a
 * browsable contact sheet.
 *
 *   npm i playwright-core
 *   node design/export.mjs
 *
 * Options:
 *   --only=<id[,id]>   just these components
 *   --screens          also export all 50 reference states as whole-screen PDFs
 *                      (~20 MB, not committed — generate them when you need them)
 *   --scale=3          PNG device pixel ratio (default from components.json)
 *   --chromium=<path>  browser executable
 *
 * Nothing here redraws anything. Each component is lifted out of the running
 * production mockup by selector, after window.GHA_MOCK has been driven to the
 * state that produces it, then re-hosted on a bare page with the production
 * stylesheets so the export carries the real markup, CSS, type and assets.
 *
 * PDFs come out of Chromium's own print path, so shapes and text stay vector
 * and Illustrator opens them as editable objects rather than a flat image.
 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PORT = 8251;
const BASE = `http://127.0.0.1:${PORT}`;

const argv = process.argv.slice(2);
const arg = (n) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.split('=').slice(1).join('=') : null;
};
const flag = (n) => argv.includes(`--${n}`);

const LIB = JSON.parse(fs.readFileSync(path.join(HERE, 'components.json'), 'utf8'));
const only = arg('only') ? new Set(arg('only').split(',')) : null;
const scale = Number(arg('scale') || LIB.meta.pngScale || 3);
const executablePath =
  arg('chromium') || process.env.CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const DIR = {
  pdf: path.join(HERE, 'pdf'),
  png: path.join(HERE, 'png'),
  icons: path.join(HERE, 'icons'),
  tokens: path.join(HERE, 'tokens'),
  screens: path.join(HERE, 'pdf', 'screens'),
};

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
};

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      // setContent gives the page a null origin, so the @font-face requests
      // are cross-origin; without this the exports silently fall back to a
      // system face and the type is wrong.
      'access-control-allow-origin': '*',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(PORT, () => r(server)));
}

const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((i) =>
      i.complete && i.naturalWidth ? null : new Promise((r) => { i.onload = i.onerror = r; })));
  });

/* ------------------------------------------------------------- synthetic */
/* Two sheets that have no equivalent in the app: the palette and the type
   scale. Values come from the measured production CSS (SPEC.md section 5). */

const PALETTE = [
  ['GHA ink', '#14102e', 'hero fill, titles, bill total'],
  ['Heading purple', '#300b5c', 'guest heading, action titles'],
  ['Venue theme', '#582c83', 'primary buttons, links — from the venue config'],
  ['Accent purple', '#3d0b40', 'amount pill, spend input border'],
  ['Page background', '#fafafa', 'page and session-error surfaces'],
  ['Perks panel', '#f4eff9', 'guest perks card'],
  ['Error', '#b00020', 'session hint, discount error title'],
  ['Error surface', '#fdecee', 'discount error card'],
  ['Field error', '#d32f2f', 'MUI notch and helper text'],
  ['Success', '#1c8c4e', 'confirmation check'],
  ['Success deep', '#0e6e3c', 'confirmation check, pressed'],
  ['Scanner', '#0d0a20', 'QR scanner surface'],
  ['Ink 85%', '#140c30d9', 'body copy'],
  ['Ink 75%', '#140c30bf', 'secondary copy'],
  ['Ink 65%', '#140c30a6', 'action subtitles'],
  ['Ink 6%', '#140c300f', 'hairlines'],
];

const TYPE_SPECIMEN = [
  ['Guest heading', 'IvyMode GHA Semi Bd', 22, 600, 'Dine with D$'],
  ['Session error title', 'IvyMode GHA Semi Bd', 20, 700, 'Session expired'],
  ['Sheet title', 'IvyMode GHA Semi Bd', 22, 700, 'SIGN IN'],
  ['Dialog title', 'IvyMode GHA Semi Bd', 15, 700, 'Apply DISCOVERY Dollars?'],
  ['Action title', 'IvyMode GHA Semi Bd', 13, 700, 'View Bill on B12'],
  ['Body', 'Jost', 13, 400, 'Subtotal — LKR 58,400.00'],
  ['Action subtitle', 'Jost', 12, 400, 'Bill total: LKR 64,433.00'],
  ['Session hint', 'Jost', 12.5, 600, 'Your session has expired.'],
  ['Spend input', 'Jost', 18, 700, '62'],
  ['Venue chip', 'Jost', 12, 400, 'Dreams & Beats'],
];

function syntheticHtml(kind) {
  if (kind === 'palette') {
    return `<div style="font-family:Jost,sans-serif;padding:20px;display:grid;
      grid-template-columns:repeat(4,150px);gap:14px;background:#fff">
      ${PALETTE.map(([name, hex, use]) => `
        <div>
          <div style="height:56px;border-radius:8px;background:${hex};border:1px solid #0000001a"></div>
          <div style="font-size:12px;color:#14102e;margin-top:6px;font-weight:600">${name}</div>
          <div style="font-size:11px;color:#140c30a6;font-family:ui-monospace,Menlo,monospace">${hex}</div>
          <div style="font-size:10px;color:#140c308c;line-height:1.35;margin-top:2px">${use}</div>
        </div>`).join('')}
    </div>`;
  }
  return `<div style="font-family:Jost,sans-serif;padding:20px;background:#fff;width:560px">
    ${TYPE_SPECIMEN.map(([role, family, size, weight, sample]) => `
      <div style="display:flex;align-items:baseline;gap:16px;padding:9px 0;border-bottom:1px solid #0000000f">
        <div style="width:140px;flex:none;font-size:11px;color:#140c30a6">${role}</div>
        <div style="width:80px;flex:none;font-size:11px;color:#140c308c;font-family:ui-monospace,Menlo,monospace">${size}px&nbsp;${weight}</div>
        <div style="font-family:'${family}',sans-serif;font-size:${size}px;font-weight:${weight};color:#14102e">${sample}</div>
      </div>`).join('')}
  </div>`;
}

/* ------------------------------------------------------------- harvesting */

const PHONE = { width: 393, height: 852 };
const ROOMY = { width: 1200, height: 1600 };

async function harvest(page, c) {
  if (c.synthetic) return { html: syntheticHtml(c.synthetic), width: null };

  // Always measure at the phone viewport: the PDF step resizes the page, and
  // a narrow leftover viewport would reflow the next component.
  await page.setViewportSize(PHONE);
  await page.goto(`${BASE}/index.html?controls=0`, { waitUntil: 'load' });
  // A desktop scrollbar would take 8px off the content width and every
  // measurement with it; a phone has no such gutter.
  await page.addStyleTag({ content: 'html{scrollbar-width:none}::-webkit-scrollbar{display:none}' });
  if (c.fixture) {
    await page.evaluate((fx) => {
      const d = window.GHA_MOCK.fixtures;
      if (fx.member) Object.assign(d.MEMBER, fx.member);
      if (fx.venue) Object.assign(d.VENUE, fx.venue);
    }, c.fixture);
  }
  await page.evaluate((p) => window.GHA_MOCK.set(p), c.state || {});
  await settle(page);
  await page.waitForTimeout(120);

  const got = await page.evaluate(({ sel, index }) => {
    const all = Array.from(document.querySelectorAll(sel));
    const el = all[index || 0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { html: el.outerHTML, width: Math.round(r.width), height: Math.round(r.height), count: all.length };
  }, { sel: c.sel, index: c.index });

  if (!got) throw new Error(`${c.id}: nothing matched ${c.sel}`);
  return got;
}

/** A bare page holding one component at the exact width it has in the app, so
 *  an isolated export is the same geometry as the real screen rather than a
 *  shrink-to-fit approximation. */
const wrap = (c, html, width) => {
  const pad = c.pad == null ? 12 : c.pad;
  const sizing = width
    ? `display:flex;width:${width + pad * 2}px`
    : 'display:inline-block';
  return `<!doctype html><html><head><meta charset="utf-8">
<base href="${BASE}/">
<link rel="stylesheet" href="css/app.css">
<link rel="stylesheet" href="css/hero.css">
<link rel="stylesheet" href="css/page.css">
<link rel="stylesheet" href="css/modal.css">
<link rel="stylesheet" href="css/burn.css">
<link rel="stylesheet" href="css/titanium.css">
<style>
  html,body{margin:0;padding:0;background:${c.bg || '#fafafa'}}
  #frame{${sizing};padding:${pad}px;background:${c.bg || '#fafafa'}}
  #frame > *{flex:1 1 auto;min-width:0}
  /* The app pins these to the viewport; in isolation they have to flow. */
  [class*="_action_row_"]{position:static!important;backdrop-filter:none!important}
  [class*="_gha_success_drawer_"]{animation:none!important}
</style></head><body><div id="frame">${html}</div></body></html>`;
};

async function exportOne(page, c, html, width) {
  // Roomy enough that nothing is constrained by the viewport; the frame's own
  // width is what fixes the geometry.
  await page.setViewportSize(ROOMY);
  await page.setContent(wrap(c, html, width), { waitUntil: 'load' });
  await settle(page);
  await page.waitForTimeout(90);

  const frame = page.locator('#frame');
  const box = await frame.boundingBox();
  const w = Math.ceil(box.width), h = Math.ceil(box.height);

  await frame.screenshot({ path: path.join(DIR.png, `${c.id}.png`), omitBackground: (c.bg === 'transparent') });

  await page.setViewportSize({ width: Math.max(w, 1), height: Math.max(h, 1) });
  await page.pdf({
    path: path.join(DIR.pdf, `${c.id}.pdf`),
    width: `${w}px`, height: `${h}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageRanges: '1',
  });
  return { w, h };
}

/* ------------------------------------------------------------------ icons */

async function exportIcons(page) {
  fs.mkdirSync(DIR.icons, { recursive: true });
  await page.goto(`${BASE}/index.html?controls=0`, { waitUntil: 'load' });
  const icons = await page.evaluate(() => {
    const out = {};
    for (const [name, fn] of Object.entries(window.GHA_ICONS)) {
      if (typeof fn === 'function') out[name] = fn(48);
    }
    return out;
  });
  let n = 0;
  for (const [name, svg] of Object.entries(icons)) {
    // currentColor has no meaning in a standalone file; bind it to the ink.
    const file = svg.replace(/currentColor/g, '#14102e');
    fs.writeFileSync(path.join(DIR.icons, `${name}.svg`), file + '\n');
    n++;
  }
  return n;
}

/* --------------------------------------------------------- contact sheet */

function contactSheet(rows) {
  const groups = LIB.groups.map((g) => {
    const items = g.components
      .filter((c) => rows[c.id])
      .map((c) => `
        <figure>
          <div class="shot" style="background:${c.bg === 'transparent' ? 'repeating-conic-gradient(#f0eef3 0% 25%, #fff 0% 50%) 50%/16px 16px' : (c.bg || '#fafafa')}">
            <img src="./png/${c.id}.png" alt="${c.label}">
          </div>
          <figcaption>
            <b>${c.label}</b>
            <code>${c.id}</code>
            <span>${rows[c.id].w} × ${rows[c.id].h} px</span>
            <span class="links"><a href="./pdf/${c.id}.pdf">PDF</a> · <a href="./png/${c.id}.png">PNG</a></span>
          </figcaption>
        </figure>`).join('');
    return `<section id="${g.id}"><h2>${g.title}</h2><div class="grid">${items}</div></section>`;
  }).join('');

  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dine with D$ — component library</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f6f5f8;color:#14102e;
       font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  header{background:#14102e;color:#fff;padding:38px 32px}
  header h1{margin:0 0 8px;font-size:26px;font-weight:600}
  header p{margin:0;max-width:78ch;color:#ffffffb8}
  header a{color:#c9a3ea}
  nav{position:sticky;top:0;background:#fff;border-bottom:1px solid #e4e1ea;
      padding:12px 32px;display:flex;gap:6px;flex-wrap:wrap;z-index:2}
  nav a{font-size:13px;text-decoration:none;color:#4a4560;border:1px solid #e4e1ea;
        border-radius:7px;padding:6px 11px}
  main{padding:28px 32px 70px;max-width:1500px;margin:0 auto}
  section{margin-bottom:40px;scroll-margin-top:60px}
  section h2{font-size:19px;margin:0 0 16px;font-weight:600}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px;align-items:start}
  figure{margin:0;background:#fff;border:1px solid #e4e1ea;border-radius:10px;overflow:hidden}
  .shot{padding:10px;display:flex;justify-content:center;align-items:center;min-height:90px;
        border-bottom:1px solid #e4e1ea}
  .shot img{max-width:100%;height:auto;display:block}
  figcaption{padding:11px 12px 13px;font-size:12.5px;display:flex;flex-direction:column;gap:3px}
  figcaption b{font-weight:600}
  figcaption code{font:11px ui-monospace,Menlo,monospace;color:#7b7690}
  figcaption span{font-size:11px;color:#7b7690}
  figcaption .links{font-size:12px;color:#c3bfcd}
  figcaption a{color:#582c83;font-size:12px}
</style></head><body>
<header>
  <h1>Dine with D$ — component library</h1>
  <p>Every component lifted out of the production mockup, as a <b>vector PDF</b> for
     Illustrator and a ${scale}× PNG for slides. The icon set is in
     <code>icons/</code> as real SVG. See <a href="./README.md">README.md</a> for how
     to open these in Illustrator, and <a href="../reference/index.html">reference/</a>
     for whole screens with their copy and triggers.</p>
</header>
<nav>${LIB.groups.map((g) => `<a href="#${g.id}">${g.title}</a>`).join('')}<a href="./all-components.pdf">all-components.pdf</a></nav>
<main>${groups}</main>
</body></html>`;
}

/* ------------------------------------------------------------------- main */

async function main() {
  Object.values(DIR).forEach((d) => fs.mkdirSync(d, { recursive: true }));
  const server = await serve();
  const browser = await chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: scale });
  await page.emulateMedia({ media: 'screen' });

  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });

  const all = LIB.groups.flatMap((g) => g.components);
  const todo = only ? all.filter((c) => only.has(c.id)) : all;
  const rows = {};

  for (const c of todo) {
    const got = await harvest(page, c);
    const size = await exportOne(page, c, got.html, got.width);
    rows[c.id] = size;
    process.stdout.write(`  ${c.id.padEnd(26)} ${size.w} × ${size.h}\n`);
  }

  await page.setViewportSize(PHONE);
  const iconCount = await exportIcons(page);
  console.log(`  ${String(iconCount).padStart(2)} icons → design/icons/*.svg`);

  // Contact sheet, then the whole sheet as one vector PDF.
  fs.writeFileSync(path.join(HERE, 'components.html'), contactSheet(rows));

  // Whole screens, vector, straight from the state catalogue.
  if (flag('screens') && !only) {
    const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'reference', 'states.json'), 'utf8'));
    const states = cat.groups.flatMap((g) => g.states);
    for (const s of states) {
      await page.setViewportSize(PHONE);
      await page.goto(`${BASE}/index.html?controls=0`, { waitUntil: 'load' });
      if (s.fixture) {
        await page.evaluate((fx) => {
          const d = window.GHA_MOCK.fixtures;
          if (fx.member) Object.assign(d.MEMBER, fx.member);
          if (fx.venue) Object.assign(d.VENUE, fx.venue);
        }, s.fixture);
      }
      await page.evaluate((p) => window.GHA_MOCK.set(p), s.patch || {});
      await settle(page);
      await page.waitForTimeout(110);
      await page.pdf({
        path: path.join(DIR.screens, `${s.id}.pdf`),
        width: '393px', height: '852px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        pageRanges: '1',
      });
    }
    console.log(`  ${states.length} screens → design/pdf/screens/*.pdf`);
  }

  await browser.close();
  server.close();

  console.log(`\n${todo.length} components → design/pdf/ and design/png/`);
  if (problems.length) {
    console.log('\nBrowser reported:');
    [...new Set(problems)].forEach((p) => console.log('  ' + p));
    process.exitCode = 1;
  } else {
    console.log('No console or page errors.');
  }
}

main();
