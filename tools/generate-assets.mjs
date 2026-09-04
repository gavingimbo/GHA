/**
 * Renders every icon and startup image from ONE vector mark, at build time.
 *
 * One artwork source means the sizes can never drift apart, and the splash
 * background is the same colour as the manifest and <body>, so splash -> first
 * paint is seamless.
 *
 * Usage:
 *   npm install playwright   # or: PLAYWRIGHT_MODULE=/path/to/playwright
 *   node tools/generate-assets.mjs
 *
 * Writes:
 *   assets/icons/*.png
 *   assets/splash/*.png
 *   tools/splash-links.html   (paste-ready <link> list, same device table)
 */

import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  allSplashEntries,
  background,
  iconBackground,
  iconSizes,
  splashVersion,
} from "./devices.js";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconDir = resolve(root, "assets/icons");
const splashDir = resolve(root, "assets/splash");

/** The single source mark: brand disc + Inter "D", matching the page. */
const markMarkup = (diameter) => `
  <div class="mark" style="
    width:${diameter}px;
    height:${diameter}px;
    font-size:${diameter * 0.5}px;
    border-radius:50%;
  "><span>D</span></div>`;

/**
 * Fetch Inter once and inline it as a data URI. Every render page then needs
 * zero network, which is the difference between seconds and many minutes
 * across 49 images.
 */
async function loadFontFace() {
  const api = "https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap";
  const chromeUA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const css = await fetch(api, { headers: { "User-Agent": chromeUA } }).then((r) => r.text());
  const url = css.match(/src:\s*url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error("could not find a woff2 source in the Google Fonts CSS");

  const woff2 = Buffer.from(await fetch(url).then((r) => r.arrayBuffer())).toString("base64");
  return `@font-face{font-family:"Inter";font-style:normal;font-weight:600;` +
         `src:url(data:font/woff2;base64,${woff2}) format("woff2")}`;
}

const shell = (fontFace, body, css) => `<!doctype html>
<html><head><meta charset="utf-8">
<style>
${fontFace}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:100%;height:100%;overflow:hidden}
  body{display:grid;place-items:center;
       font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
       letter-spacing:-0.006em}
  .mark{display:flex;align-items:center;justify-content:center;
        background:radial-gradient(120% 120% at 30% 10%, #7d47aa, #300b5c 74%);
        color:#fff;font-weight:600;line-height:1}
  .mark span{display:block;transform:translateY(-2%)}
  ${css}
</style></head><body>${body}</body></html>`;

/**
 * Icons: an opaque full-bleed brand tile carrying the letterform. Square, not
 * pre-rounded, and with no transparency: iOS applies its own mask and shadow,
 * and composites any alpha on black.
 */
const iconPage = (fontFace, { size, letterScale }) =>
  shell(fontFace, markMarkup(size), `
    body{background:${iconBackground};
         background-image:radial-gradient(120% 120% at 30% 10%, #7d47aa, ${iconBackground} 74%)}
    .mark{background:none;box-shadow:none;border-radius:0;font-size:${size * letterScale}px}
  `);

/**
 * Splash: flat `background`, identical to the manifest background_color and to
 * <body>'s background-color, so splash -> first paint is seamless. Flat, not
 * the page's decorative gradient: a gradient defeats PNG compression and would
 * bloat 44 images to megabytes for a wash that is barely visible.
 */
const splashPage = (fontFace, { cssWidth }) =>
  shell(fontFace, markMarkup(Math.round(Math.min(cssWidth * 0.22, 96))), `
    body{background:${background}}
  `);

/** deviceScaleFactor is fixed per context, so keep one context per ratio. */
async function contextFor(browser, contexts, dpr) {
  if (!contexts.has(dpr)) {
    contexts.set(dpr, await browser.newContext({ deviceScaleFactor: dpr }));
  }
  return contexts.get(dpr);
}

async function shoot(context, { html, width, height, path }) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, type: "png" });
  await page.close();
}

const splashLinks = () =>
  allSplashEntries
    .map(
      (entry) =>
        `    <link rel="apple-touch-startup-image"\n` +
        `          href="./assets/splash/${entry.file}?${splashVersion}"\n` +
        `          media="${entry.media}">`,
    )
    .join("\n");

async function main() {
  await mkdir(iconDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });

  const fontFace = await loadFontFace();
  const browser = await chromium.launch();
  const contexts = new Map();

  for (const icon of iconSizes) {
    await shoot(await contextFor(browser, contexts, 1), {
      html: iconPage(fontFace, icon),
      width: icon.size,
      height: icon.size,
      path: resolve(iconDir, icon.name),
    });
    console.log(`icon   ${icon.name}`);
  }

  for (const entry of allSplashEntries) {
    await shoot(await contextFor(browser, contexts, entry.dpr), {
      html: splashPage(fontFace, entry),
      width: entry.cssWidth,
      height: entry.cssHeight,
      path: resolve(splashDir, entry.file),
    });
  }
  console.log(`splash ${allSplashEntries.length} images`);

  await browser.close();

  await writeFile(resolve(root, "tools/splash-links.html"), `${splashLinks()}\n`);
  console.log("wrote  tools/splash-links.html");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
