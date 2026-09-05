/** Minimal 1.6px stroke icon set. Nothing decorative — state and navigation only. */
(function () {
  'use strict';
  const s = (d, extra) =>
    '<svg viewBox="0 0 24 24" width="' + (extra && extra.size || 22) + '" height="' + (extra && extra.size || 22) +
    '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    d + '</svg>';

  window.CD = window.CD || {};
  window.CD.icons = {
    back: () => s('<path d="M15 5l-7 7 7 7"/>'),
    close: () => s('<path d="M6 6l12 12M18 6L6 18"/>'),
    check: (o) => s('<path d="M5 12.5l4.5 4.5L19 7.5"/>', o),
    chevronDown: () => s('<path d="M6 9.5l6 6 6-6"/>', { size: 18 }),
    chevronUp: () => s('<path d="M6 14.5l6-6 6 6"/>', { size: 18 }),
    eye: () => s('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: () => s('<path d="M3 3l18 18"/><path d="M10.6 6.1A8.9 8.9 0 0112 6c6 0 9.5 6 9.5 6a16 16 0 01-3.4 4M6.4 8A16 16 0 002.5 12S6 18 12 18a8.7 8.7 0 003.3-.63"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>'),
    mail: () => s('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.8 7.3l7.3 5.2a1.6 1.6 0 001.8 0l7.3-5.2"/>'),
    lock: () => s('<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/>'),
    key: () => s('<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H20M17 12v3M20 12v2.5"/>'),
    face: () => s('<path d="M4 8.5V6.5A2.5 2.5 0 016.5 4h2M15.5 4h2A2.5 2.5 0 0120 6.5v2M20 15.5v2a2.5 2.5 0 01-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 014 17.5v-2"/><path d="M9 10.5v1.2M15 10.5v1.2M9.4 15.2a3.8 3.8 0 005.2 0"/>'),
    alert: () => s('<path d="M12 8.5v4.2M12 16.2v.1"/><circle cx="12" cy="12" r="8.5"/>'),
    info: () => s('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 7.9v.1"/>'),
    clock: () => s('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    qr: () => s('<rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><path d="M14 14h2.5v2.5H14zM19.5 14H20v2.5M14 19.5h2.5M19.5 19.5H20"/>'),
    server: () => s('<path d="M12 12.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>'),
    receipt: () => s('<path d="M6 3.8h12v16.4l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8.5h6M9 12h6"/>'),
    sparkle: () => s('<path d="M12 4l1.7 4.6L18.5 10l-4.8 1.4L12 16l-1.7-4.6L5.5 10l4.8-1.4z"/>')
  };
})();
