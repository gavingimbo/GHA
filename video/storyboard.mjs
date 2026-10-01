// The storyboard, made from the films themselves: every shot each film lists in
// window.SHOTS is rendered at its moment, the words are read off the frame, and the
// board is written to storyboard/index.html with its frames beside it.
//   node video/storyboard.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'storyboard');
const FFMPEG = process.env.FFMPEG || '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const FILMS = [
  { key: 'password', page: 'password.html', mp4: 'forgotten-password.mp4', name: 'When a guest forgets their password',
    about: 'A guest can’t sign in. Show them Forgot Password?, then the four steps exactly as MyMenu ships them: send the code, verify it, choose a new password, sign back in at the same table. Then the two things that go wrong.' },
  { key: 'check', page: 'explainer.html', mp4: 'check-open-on-pos.mp4', name: 'When the check is open on the POS',
    about: 'A guest shows you “Failed to apply discount on POS”. What it means, then three steps: find the check on the POS, tap Cancel/Exit, ask the guest to tap Retry. The same fix works for DISCOVERY Dollars.' },
];
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
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
const jpeg = (png, file, w) => new Promise((r) => {
  const p = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-i', '-', '-vf', `scale=${w}:-2:flags=lanczos`, '-q:v', '3', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  p.stdin.end(png); p.on('close', r);
});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tc = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

const boards = [];
for (const film of FILMS) {
  await page.goto(`http://127.0.0.1:${server.address().port}/video/${film.page}?t=0`);
  await page.evaluate(async () => { await document.fonts.ready; if (window.READY) await window.READY; });
  const { shots, dur } = await page.evaluate(() => ({ shots: window.SHOTS, dur: window.DURATION }));
  const out = [];
  for (const [i, shot] of shots.entries()) {
    await page.evaluate((t) => render(t), shot.t);
    const words = await page.evaluate((id) => [...document.getElementById(id).querySelectorAll('.ln > *')]
      .map((el) => ({ cls: el.className || (el.tagName === 'IMG' ? 'logo' : ''), text: el.textContent.trim() })), shot.id);
    const name = `${film.key}-${String(i + 1).padStart(2, '0')}.jpg`;
    await jpeg(await page.screenshot({ type: 'png' }), path.join(OUT, 'frames', name), 1280);
    if (i === 0) await jpeg(await page.screenshot({ type: 'png' }), path.join(OUT, 'frames', `${film.key}-cover.jpg`), 1920);
    out.push({ ...shot, n: i + 1, frame: `frames/${name}`, words });
    process.stdout.write(`  ${name}\n`);
  }
  boards.push({ ...film, dur, shots: out });
}
await browser.close(); server.close();

// ------------------------------------------------------------------ the board
const wordsHtml = (words) => {
  const lines = []; let say = [], sup = [];
  for (const w of words) {
    if (w.cls === 'step') lines.push(`<p class="w-step">${esc(w.text)}</p>`);
    else if (w.cls === 'say') say.push(esc(w.text));
    else if (w.cls === 'sup') sup.push(esc(w.text));
  }
  if (say.length) lines.push(`<p class="w-say">${say.join(' ')}</p>`);
  if (sup.length) lines.push(`<p class="w-sup">${sup.join(' ')}</p>`);
  if (words.some((w) => w.cls === 'logo')) lines.push('<p class="w-logo">Cinnamon DISCOVERY logo</p>');
  return lines.join('');
};
const shotHtml = (s) => `
      <li class="shot">
        <figure><img src="${s.frame}" width="1280" height="720" loading="lazy" alt="Shot ${s.n}: ${esc(s.words.filter((w) => w.cls === 'say').map((w) => w.text).join(' '))}"></figure>
        <div class="shot-meta"><span class="n">${String(s.n).padStart(2, '0')}</span><span class="tc">${tc(s.from)} – ${tc(s.to)}</span>${s.kind ? `<span class="kind">${esc(s.kind)}</span>` : ''}</div>
        <div class="words">${wordsHtml(s.words)}</div>
        <dl><dt>On screen</dt><dd>${esc(s.action)}</dd>${s.sound ? `<dt>Sound</dt><dd>${esc(s.sound)}</dd>` : ''}</dl>
      </li>`;
const filmHtml = (b) => `
  <section class="film" id="${b.key}">
    <header class="film-head">
      <p class="eyebrow">${b.key === 'password' ? 'Film 1' : 'Film 2'} · 16:9 · ${Math.round(b.dur)} s · ${b.shots.length} shots</p>
      <h2>${esc(b.name)}</h2>
      <p class="about">${esc(b.about)}</p>
    </header>
    <figure class="cover">
      <img src="frames/${b.key}-cover.jpg" width="1920" height="1080" alt="Cover and thumbnail: ${esc(b.name)}">
      <figcaption>Cover and thumbnail. The film opens on this frame, and it is the file’s cover art.</figcaption>
    </figure>
    <ol class="shots">${b.shots.map(shotHtml).join('')}
    </ol>
  </section>`;
const html = `<title>Dine with D$ Storyboard</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600&display=swap">
<style>
/* A production board for two team films: the shots in order, each frame as it plays,
   with the words on screen, what happens and what you hear. Cinnamon's working set for
   digital pages: Fraunces for statements, Manrope for everything else; Cinnamon Purple
   for the one accent. */
:root{
  --bg:#FAFAFA; --card:#FFFFFF; --ink:#14102E; --muted:#5E5873; --line:#E6E2EC; --accent:#612D87; --dune:#A39383;
  --display:"Fraunces", Georgia, serif; --body:"Manrope", system-ui, -apple-system, sans-serif;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --bg:#121018; --card:#1B1824; --ink:#EEEAF4; --muted:#A9A2B8; --line:#2C2738; --accent:#C49BE8; --dune:#C2B3A4; color-scheme:dark } }
:root[data-theme="dark"]{ --bg:#121018; --card:#1B1824; --ink:#EEEAF4; --muted:#A9A2B8; --line:#2C2738; --accent:#C49BE8; --dune:#C2B3A4; color-scheme:dark }
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:400 16px/1.55 var(--body);margin:0}
.wrap{max-width:1280px;margin:0 auto;padding-inline:clamp(16px,4vw,48px);padding-block:40px 80px}
.top{display:flex;flex-direction:column;gap:12px;margin-bottom:28px;max-width:70ch}
.top .eyebrow{color:var(--accent)}
h1{font:600 clamp(32px,4.4vw,52px)/1.08 var(--display);margin:0;text-wrap:balance;letter-spacing:-.01em}
.top p{margin:0;color:var(--muted)}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 40px}
nav a{color:var(--ink);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:500;font-size:14px}
nav a:hover,nav a:focus-visible{border-color:var(--accent);color:var(--accent);outline:none}
.eyebrow{font:600 12px/1.4 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--dune);margin:0}
.film{display:flex;flex-direction:column;gap:24px;padding-top:40px;border-top:1px solid var(--line);margin-top:40px}
.film-head{display:flex;flex-direction:column;gap:8px;max-width:70ch}
h2{font:600 clamp(26px,3.2vw,38px)/1.12 var(--display);margin:0;text-wrap:balance}
.about{margin:0;color:var(--muted)}
figure{margin:0}
img{display:block;width:100%;height:auto;max-width:100%;border-radius:10px;background:#FAFAFA;box-shadow:0 0 0 1px var(--line)}
.cover figcaption{margin-top:10px;color:var(--muted);font-size:14px}
.shots{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:28px 24px}
.shot{display:flex;flex-direction:column;gap:10px;min-width:0}
.shot-meta{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;font-variant-numeric:tabular-nums}
.shot-meta .n{font:600 13px var(--body);color:var(--accent);letter-spacing:.06em}
.shot-meta .tc{font-size:13px;color:var(--muted)}
.shot-meta .kind{font:600 11px var(--body);letter-spacing:.12em;text-transform:uppercase;color:var(--dune)}
.words{display:flex;flex-direction:column;gap:4px}
.words p{margin:0}
.w-step{font:600 11px var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.w-say{font:600 21px/1.2 var(--display);text-wrap:balance}
.w-sup{color:var(--muted);font-size:15px}
.w-logo{color:var(--dune);font-size:13px}
dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}
dt{color:var(--dune);font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding-top:2px}
dd{margin:0;min-width:0}
@media (prefers-reduced-motion:no-preference){ nav a{transition:border-color .15s,color .15s} }
</style>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">Cinnamon DISCOVERY · Dine with DISCOVERY Dollars · Team guides</p>
    <h1>Two team films, shot by shot</h1>
    <p>For F&amp;B team members on the floor. Each film is 16:9 and told from the team member’s side: one statement set left beside the product, or centred over the POS. Every frame below is rendered from the film itself.</p>
  </header>
  <nav aria-label="Films">${boards.map((b) => `<a href="#${b.key}">${esc(b.name)}</a>`).join('')}</nav>
${boards.map(filmHtml).join('\n')}
</div>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), '<!doctype html>\n' + html);
console.log(`storyboard: ${boards.reduce((n, b) => n + b.shots.length, 0)} shots → video/storyboard/`);
