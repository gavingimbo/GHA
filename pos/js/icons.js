/**
 * Icon set used by the live page. The react-icons markup is reproduced exactly
 * (same viewBox and path data) so glyph weight and optical size match.
 */
(function () {
  const md = (path, size) =>
    `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="${path}"></path></svg>`;

  const icons = {
    // Restaurant / venue chip.
    restaurant: (s = 14) =>
      md('M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z', s),

    // Discount / percentage.
    discount: (s = 13) =>
      md('M7.5 11C9.43 11 11 9.43 11 7.5S9.43 4 7.5 4 4 5.57 4 7.5 5.57 11 7.5 11zm0-5C8.33 6 9 6.67 9 7.5S8.33 9 7.5 9 6 8.33 6 7.5 6.67 6 7.5 6zM4.002 18.583L18.59 3.996l1.414 1.414L5.417 19.997zM16.5 13c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z', s),

    // Wallet (ionicons io5).
    wallet: (s = 13) =>
      `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="${s}" width="${s}" xmlns="http://www.w3.org/2000/svg"><rect width="416" height="288" x="48" y="144" fill="none" stroke-linejoin="round" stroke-width="32" rx="48" ry="48"></rect><path fill="none" stroke-linejoin="round" stroke-width="32" d="M411.36 144v-30A50 50 0 00352 64.9L88.64 109.85A50 50 0 0048 159v49"></path><path d="M368 320a32 32 0 1132-32 32 32 0 01-32 32z"></path></svg>`,

    close: (s = 22) =>
      md('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z', s),

    eye: (s = 22) =>
      `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="${s}" width="${s}" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"></path><circle cx="256" cy="256" r="80" fill="none" stroke-miterlimit="10" stroke-width="32"></circle></svg>`,

    eyeOff: (s = 22) =>
      `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="${s}" width="${s}" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M432 448L80 64"></path><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.06c19.94-28.57 41.78-52.73 65.24-72.21C143.18 149.26 200 128 255.66 128c41.49 0 81.5 12.28 118.92 36.5 34.07 22 64.74 53.51 88.7 91v.06c-19.94 28.57-41.78 52.73-65.24 72.21C349.71 362.74 300 384 255.66 384z"></path><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 320a64 64 0 1164-64 64.07 64.07 0 01-64 64z"></path></svg>`,

    chevronDown: (s = 18) =>
      md('M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z', s),
    chevronUp: (s = 18) =>
      md('M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z', s),

    back: (s = 18) => md('M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z', s),

    logout: (s = 18) =>
      md('M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z', s),

    copy: (s = 14) =>
      md('M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z', s),

    info: (s = 18) =>
      md('M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z', s),

    check: (s = 20) =>
      md('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', s),

    alert: (s = 22) =>
      md('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z', s),

    card: (s = 18) =>
      md('M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z', s),
  };

  window.GHA_ICONS = icons;
})();
