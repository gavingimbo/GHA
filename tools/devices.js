/**
 * iOS/iPadOS viewport table, in CSS points (portrait).
 *
 * Pixel dimensions = points x dpr. Landscape swaps width and height, in both
 * the image and the media query. Deduplicate by the `width x height @ dpr`
 * triple, never by device name: a dozen iPhone models share three triples, so
 * one link per name would double the <head> for no benefit.
 *
 * This table is the single source for both the generated startup images and
 * the <link rel="apple-touch-startup-image"> list in index.html.
 *
 * Source: joe-bell/skills - apple-web-app (references/ios-devices.md),
 * itself derived from ios-resolution.com. Last checked 2026-09-04.
 */

export const triples = [
  // iPhone
  { width: 320, height: 568, dpr: 2, devices: "SE (1st gen), 5/5s/5c" },
  { width: 375, height: 667, dpr: 2, devices: "6s, 7, 8, SE 2, SE 3" },
  { width: 414, height: 736, dpr: 3, devices: "6s Plus, 7 Plus, 8 Plus" },
  { width: 375, height: 812, dpr: 3, devices: "X, XS, 11 Pro, 12 mini, 13 mini" },
  { width: 414, height: 896, dpr: 2, devices: "XR, 11" },
  { width: 414, height: 896, dpr: 3, devices: "XS Max, 11 Pro Max" },
  { width: 390, height: 844, dpr: 3, devices: "12, 12 Pro, 13, 13 Pro, 14, 16e, 17e" },
  { width: 428, height: 926, dpr: 3, devices: "12 Pro Max, 13 Pro Max, 14 Plus" },
  { width: 393, height: 852, dpr: 3, devices: "14 Pro, 15, 15 Pro, 16" },
  { width: 430, height: 932, dpr: 3, devices: "14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus" },
  { width: 402, height: 874, dpr: 3, devices: "16 Pro, 17, 17 Pro" },
  { width: 440, height: 956, dpr: 3, devices: "16 Pro Max, 17 Pro Max" },
  { width: 420, height: 912, dpr: 3, devices: "iPhone Air" },

  // iPad
  { width: 768, height: 1024, dpr: 2, devices: "iPad 3-6, mini 2-5, Air 1-2, Pro 9.7\"" },
  { width: 810, height: 1080, dpr: 2, devices: "iPad 7, 8, 9" },
  { width: 820, height: 1180, dpr: 2, devices: "iPad 10, 11, Air 4-8 (11\")" },
  { width: 744, height: 1133, dpr: 2, devices: "iPad mini 6, mini 7" },
  { width: 834, height: 1112, dpr: 2, devices: "iPad Pro 10.5\", Air 3" },
  { width: 834, height: 1194, dpr: 2, devices: "iPad Pro 11\" gen 1-4" },
  { width: 834, height: 1210, dpr: 2, devices: "iPad Pro 11\" gen 5-6 (M4, M5)" },
  { width: 1024, height: 1366, dpr: 2, devices: "iPad Pro 12.9\" (all), Air 13\"" },
  { width: 1032, height: 1376, dpr: 2, devices: "iPad Pro 13\" (M4, M5)" },
];

/** Bump when splash artwork changes; iOS caches startup images aggressively. */
export const splashVersion = "v1";

/** Must equal the manifest background_color, theme-color and <body> background. */
export const background = "#ffffff";

/** Opaque tile behind the app icon. */
export const iconBackground = "#300b5c";

/**
 * Full-bleed brand tile with the letterform on top. `letterScale` is the cap
 * height as a fraction of the canvas; the maskable variant pulls it in to sit
 * inside Android's inner-80% safe zone.
 */
export const iconSizes = [
  { name: "apple-touch-icon-180.png", size: 180, letterScale: 0.54 },
  { name: "icon-192.png", size: 192, letterScale: 0.54 },
  { name: "icon-512.png", size: 512, letterScale: 0.54 },
  { name: "icon-1024.png", size: 1024, letterScale: 0.54 },
  { name: "icon-maskable-512.png", size: 512, letterScale: 0.38 },
];

/**
 * Portrait and landscape entries for one triple. Landscape swaps both the
 * image dimensions and the device-width/device-height in the media query.
 */
export function splashEntries(triple) {
  const { width, height, dpr } = triple;
  return [
    {
      orientation: "portrait",
      file: `splash-${width}x${height}@${dpr}x-portrait.png`,
      cssWidth: width,
      cssHeight: height,
      dpr,
      media:
        `(device-width: ${width}px) and (device-height: ${height}px) ` +
        `and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
    },
    {
      orientation: "landscape",
      file: `splash-${width}x${height}@${dpr}x-landscape.png`,
      cssWidth: height,
      cssHeight: width,
      dpr,
      media:
        `(device-width: ${height}px) and (device-height: ${width}px) ` +
        `and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: landscape)`,
    },
  ];
}

export const allSplashEntries = triples.flatMap(splashEntries);
