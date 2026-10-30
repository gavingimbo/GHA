import React from 'react';
import {interpolate, staticFile} from 'remotion';
import {COLOUR, FONT} from './theme';
import {EASE, reveal} from './Words';

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const P = COLOUR.purple;

// Intro: a guest's chat about where to eat
const MSGS: [number, boolean, string][] = [
  [0.3, false, 'Long lunch tomorrow?'],
  [0.9, true, 'London Grill. 1 PM.'],
  [1.6, false, 'Late dinner after the show?'],
  [2.2, true, 'Royal Thai. Booked.'],
  [2.9, false, 'Sunday brunch?'],
  [3.5, true, 'Always.'],
];
export const Chat: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 4.7) / 0.4);
  return (
    <div style={{position: 'absolute', left: 560, top: 150, width: 800, opacity: 1 - out, transform: `translateY(${-out * 40 - Math.max(0, t - 2) * 18}px) scale(${1 + 0.03 * clamp(t / 5)})`}}>
      {MSGS.map(([at, me, text]) => {
        const p = EASE(clamp((t - at) / 0.35));
        return (
          <div key={text} style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 18, opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`, transformOrigin: me ? 'right' : 'left'}}>
            <div style={{padding: '22px 34px', borderRadius: 40, fontFamily: FONT.body, fontSize: 44, background: me ? P : '#efedf2', color: me ? '#fff' : COLOUR.ink, borderBottomRightRadius: me ? 10 : 40, borderBottomLeftRadius: me ? 40 : 10}}>{text}</div>
          </div>
        );
      })}
    </div>
  );
};

// The scale, on purple: an eyebrow, then one large sentence with the figures counting in it.
const LILAC = '#cbb3e3';
export const Stats: React.FC<{t: number}> = ({t}) => {
  const drone = 1.04 - 0.04 * clamp((t - 4.9) / 3.1);
  const n = (from: number, v: number) => Math.round(interpolate(t, [from, from + 0.9], [0, v], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE}));
  const big = {fontFamily: FONT.display, fontWeight: 300, fontSize: 150, lineHeight: 1.08, letterSpacing: -3, color: '#fff'} as const;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${drone})`}}>
      <Skyline t={t} />
      <div style={{position: 'absolute', left: 200, top: 250}}>
        <div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 26, letterSpacing: 8, textTransform: 'uppercase', color: LILAC, marginBottom: 40, ...reveal(t, 5.0, 8.0)}}>Colombo's hallmark dining</div>
        <div style={{...big, ...reveal(t, 5.2, 8.0)}}><span style={{display: 'inline-block', minWidth: 90}}>{n(5.3, 4)}</span> hotels.</div>
        <div style={{...big, color: LILAC, ...reveal(t, 5.6, 8.0)}}><span style={{display: 'inline-block', minWidth: 170, color: '#fff'}}>{n(5.7, 24)}</span> restaurants and bars.</div>
      </div>
    </div>
  );
};

// Behind the phone: a quiet, moving outline illustration of the table. Faint, so the screen stays clear.
export const Ambient: React.FC<{t: number; px: number}> = ({t, px}) => {
  const vis = clamp((t - 14.2) / 0.8) * (1 - clamp((t - 52.6) / 0.6));
  if (vis <= 0) return null;
  const st = {fill: 'none', stroke: P, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const items: [number, number, number, string][] = [
    [180, 160, 1, 'plate'], [1650, 840, 1.2, 'plate'], [760, 110, 0.7, 'plate'], [1880, 120, 0.8, 'plate'],
    [420, 900, 0.8, 'glass'], [1500, 170, 0.9, 'glass'], [1080, 930, 0.8, 'glass'], [60, 980, 0.9, 'wine'],
    [900, 990, 0.9, 'leaf'], [1770, 470, 1, 'leaf'], [300, 420, 0.7, 'leaf'], [1300, 60, 0.6, 'leaf'],
    [120, 600, 1, 'cutlery'], [1150, 80, 0.8, 'cutlery'], [1860, 650, 0.8, 'spoon'], [620, 960, 0.8, 'spoon'],
    [1400, 960, 0.9, 'cup'], [520, 70, 0.8, 'cup'], [1700, 300, 0.8, 'cinnamon'], [240, 760, 0.8, 'cinnamon'],
    [980, 40, 0.7, 'anise'], [1260, 820, 0.7, 'anise'], [40, 330, 0.8, 'bottle'], [1560, 640, 0.6, 'anise'],
  ];
  const draw = (k: string) =>
    k === 'plate' ? <><circle r="70" {...st} /><circle r="48" {...st} /></> :
    k === 'glass' ? <path d="M-28 -70 H28 Q30 -10 0 10 Q-30 -10 -28 -70 M0 10 V60 M-26 60 H26" {...st} /> :
    k === 'wine' ? <path d="M-34 -60 Q-40 10 0 20 Q40 10 34 -60 Z M-30 -30 H30 M0 20 V70 M-28 70 H28" {...st} /> :
    k === 'leaf' ? <path d="M-60 40 Q-10 -60 60 -40 Q10 60 -60 40 Z M-60 40 L40 -30" {...st} /> :
    k === 'spoon' ? <path d="M0 -70 Q22 -70 22 -40 Q22 -12 0 -12 Q-22 -12 -22 -40 Q-22 -70 0 -70 M0 -12 V70" {...st} /> :
    k === 'cup' ? <path d="M-50 -30 H40 V10 Q40 40 -5 40 Q-50 40 -50 10 Z M40 -20 Q66 -20 66 0 Q66 16 40 16 M-80 52 H70" {...st} /> :
    k === 'cinnamon' ? <path d="M-80 -14 H80 M-80 14 H80 M-80 -14 Q-94 0 -80 14 M80 -14 Q94 0 80 14 M-40 -14 Q-50 0 -40 14" {...st} /> :
    k === 'anise' ? <path d={Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return `M0 0 Q${Math.cos(a - 0.3) * 30} ${Math.sin(a - 0.3) * 30} ${Math.cos(a) * 50} ${Math.sin(a) * 50} Q${Math.cos(a + 0.3) * 30} ${Math.sin(a + 0.3) * 30} 0 0`; }).join(' ')} {...st} /> :
    k === 'bottle' ? <path d="M-10 -90 H10 V-50 Q30 -36 30 -10 V80 H-30 V-10 Q-30 -36 -10 -50 Z M-30 10 H30" {...st} /> :
    <path d="M-20 -70 V70 M-30 -70 V-30 Q-20 -18 -10 -30 V-70 M20 -70 Q34 -40 20 -10 V70" {...st} />;
  return (
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: 0.15 * vis}}>
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor={P} stopOpacity="0.5" /><stop offset="1" stopColor={P} stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={px} cy={560} r={520} fill="url(#glow)" />
      {items.map(([x, y, k, kind], i) => (
        <g key={i} transform={`translate(${x + Math.sin(t * 0.3 + i) * 18} ${y + Math.cos(t * 0.25 + i * 2) * 14}) rotate(${(t * 4 * (i % 2 ? 1 : -1) + i * 37) % 360}) scale(${k})`}>{draw(kind)}</g>
      ))}
    </svg>
  );
};

// Drone move into a restaurant, drawn in outline. The server holds out the QR.
export const Restaurant: React.FC<{t: number}> = ({t}) => {
  const vis = clamp((t - 11.8) / 0.4) * (1 - clamp((t - 15.4) / 0.5));
  if (vis <= 0) return null;
  const draw = EASE(clamp((t - 11.9) / 1.4));
  const zoom = 1 + 2.1 * EASE(clamp((t - 12.6) / 2.6));
  const dash = {strokeDasharray: 1600, strokeDashoffset: 1600 * (1 - draw)};
  const s = {fill: 'none', stroke: P, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...dash};
  const table = (x: number, y: number, k: number) => (
    <g key={x + '' + y} transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx="0" cy="0" rx="90" ry="26" {...s} />
      <path d="M0 26 V110 M-40 110 H40" {...s} />
      <path d="M-130 -10 v-70 q0-14 14-14 h20 q14 0 14 14 v70 M-130 30 v80 M-82 30 v80" {...s} />
      <path d="M130 -10 v-70 q0-14 -14-14 h-20 q-14 0 -14 14 v70 M130 30 v80 M82 30 v80" {...s} />
      <path d="M-20 -26 v-22 M20 -26 v-22 M-28 -48 h16 M12 -48 h16" {...s} />
    </g>
  );
  return (
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: vis, transform: `scale(${zoom})`, transformOrigin: '1180px 560px'}}>
      <path d="M0 760 L1920 760 M200 1080 L700 760 M1720 1080 L1220 760 M640 0 V760 M1280 0 V760" {...s} strokeWidth={1.4} opacity={0.5} />
      {[[360, 0], [960, 0], [1560, 0]].map(([x]) => (
        <path key={x} d={`M${x} 0 V150 M${x - 60} 210 Q${x} 140 ${x + 60} 210 Z M${x} 210 v14`} {...s} />
      ))}
      {table(420, 800, 1.1)}
      {table(820, 700, 0.8)}
      {table(1580, 820, 1.1)}
      {/* The server, holding the QR */}
      <g transform="translate(1180 330)">
        <circle cx="0" cy="0" r="46" {...s} />
        <path d="M-70 90 Q0 60 70 90 L95 430 H-95 Z M-30 70 L0 120 L30 70 M0 120 V430" {...s} />
        <path d="M70 110 Q120 190 60 240" {...s} />
        <rect x="-5" y="170" width="120" height="150" rx="12" {...s} />
      </g>
      <g opacity={EASE(clamp((t - 12.8) / 0.5))}>
        <rect x="1180" y="505" width="104" height="130" rx="8" fill="#fff" stroke={P} strokeWidth={2} />
        <image href={staticFile('qr.svg')} x="1190" y="525" width="84" height="84" />
      </g>
    </svg>
  );
};

// The close: every outlet in the programme, by hotel
const HOTELS: [string, string[]][] = [
  ['Cinnamon Grand Colombo', ['The London Grill', 'Plates', 'Lagoon', 'Nuga Gama', 'Breeze Bar', 'Cheers']],
  ['Cinnamon Life at City of Dreams Sri Lanka', ['Gatz', 'Staten', 'Bistro', 'Yoroko', 'Indiya', 'Sapphire Dragon', 'Pool+Bar 09', 'Dreams & Beats', 'Flux', 'Cloud Wine', 'Quizine']],
  ['Cinnamon Lakeside Colombo', ['The Dining Room', 'Royal Thai', 'Long Feng', 'Colombar', 'Pool Bar']],
  ['Cinnamon Red Colombo', ['Flavoured', 'CloudRed']],
];
// The close: one row per hotel, its outlets gliding past like a slow drone pass
export const Outlets: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: FONT.display, fontWeight: 300, fontSize: 88, color: '#fff', letterSpacing: -2, ...reveal(t, 52.8, 56.7)}}>
      Earn at one table. <span style={{color: LILAC}}>Spend at the next.</span>
    </div>
    {HOTELS.map(([hotel, outlets], i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      const shift = dir * (t - 52.6) * 70 + (dir > 0 ? -600 : 0);
      const names = [...outlets, ...outlets, ...outlets];
      return (
        <div key={hotel} style={{position: 'absolute', left: 0, right: 0, top: 330 + i * 150, height: 120, ...reveal(t, 53.0 + i * 0.15, 56.7)}}>
          <div style={{position: 'absolute', left: 140, top: 18, width: 470, whiteSpace: 'nowrap', fontFamily: FONT.body, fontWeight: 600, fontSize: 16, lineHeight: 1.5, letterSpacing: 2.4, textTransform: 'uppercase', color: LILAC}}>{hotel}</div>
          <div style={{position: 'absolute', left: 640, right: 0, top: -14, height: 90, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 85%, transparent)'}}>
            <div style={{whiteSpace: 'nowrap', transform: `translateX(${shift}px)`, fontFamily: FONT.display, fontWeight: 300, fontSize: 56, color: '#fff'}}>
              {names.map((n, k) => (
                <span key={k}>{n}<span style={{color: LILAC, opacity: 0.5, margin: '0 34px'}}>·</span></span>
              ))}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// Four tiers, one table: the real tier cards fan out, no percentages
const TIERS: [string, string][] = [['silver', 'Silver'], ['gold', 'Gold'], ['platinum', 'Platinum'], ['titanium', 'Titanium']];
export const Tiers: React.FC<{t: number}> = ({t}) => {
  const fan = EASE(clamp((t - 8.1) / 0.9));
  const out = clamp((t - 10.1) / 0.3);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `scale(${1.04 - 0.04 * clamp((t - 7.96) / 2.4)})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT.display, fontWeight: 300, fontSize: 76, color: '#fff', letterSpacing: -1, ...reveal(t, 8.0, 10.4)}}>
        Four tiers. <span style={{color: LILAC}}>One table.</span>
      </div>
      {TIERS.map(([file, name], i) => {
        const x = (i - 1.5) * 380 * fan;
        const r = (i - 1.5) * 4 * fan;
        return (
          <div key={file} style={{position: 'absolute', left: 960 - 170 + x, top: 400, width: 340, transform: `rotate(${r}deg) translateY(${Math.abs(i - 1.5) * 14 * fan}px)`, opacity: clamp((t - 8.0 - i * 0.08) / 0.3)}}>
            <img src={staticFile(`img/${file}.webp`)} style={{width: 340, height: 214, objectFit: 'cover', borderRadius: 18, boxShadow: '0 30px 60px rgba(40,20,60,0.25)'}} />
            <div style={{textAlign: 'center', marginTop: 26, fontFamily: FONT.body, fontWeight: 500, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: LILAC, opacity: fan}}>{name}</div>
          </div>
        );
      })}
    </div>
  );
};

// Colombo skyline in outline: Lotus Tower, the twin towers, Cinnamon Life's curved towers, the sea line.
// It draws itself in behind the figures and drifts slowly, like a drone passing along Galle Face.
export const Skyline: React.FC<{t: number}> = ({t}) => {
  const draw = EASE(clamp((t - 4.9) / 1.8));
  const drift = (t - 4.9) * -14;
  const st = {fill: 'none', stroke: '#fff', strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, strokeDasharray: 3000, strokeDashoffset: 3000 * (1 - draw)};
  return (
    <svg viewBox="0 0 2200 400" style={{position: 'absolute', left: -100, bottom: 0, width: 2200, height: 400, opacity: 0.3, transform: `translateX(${drift}px)`}}>
      <path d="M0 380 H2200" {...st} />
      {/* low-rise run */}
      <path d="M40 380 V330 H120 V300 H190 V340 H260 V310 H330 V380" {...st} />
      {/* Lotus Tower */}
      <path d="M470 380 L478 150 L462 135 L475 128 L470 112 L486 120 L490 104 L494 120 L510 112 L505 128 L518 135 L502 150 L510 380 M490 104 V40" {...st} />
      {/* World Trade Center twin towers */}
      <path d="M640 380 V150 H700 V380 M730 380 V150 H790 V380 M640 190 H700 M730 190 H790" {...st} />
      {/* Cinnamon Life towers, curved */}
      <path d="M900 380 C900 260 930 160 960 110 H1020 C1010 170 1010 270 1020 380 M1060 380 C1060 270 1080 190 1110 150 H1170 C1160 210 1160 290 1170 380" {...st} />
      {/* mid-rise towers */}
      <path d="M1260 380 V200 H1320 V380 M1350 380 V240 L1380 220 L1410 240 V380 M1460 380 V170 H1500 V140 H1540 V380" {...st} />
      {/* Galle Face Hotel and colonial front */}
      <path d="M1640 380 V310 H1880 V380 M1660 310 L1760 270 L1860 310 M1690 380 V340 M1740 380 V340 M1790 380 V340" {...st} />
      <path d="M1960 380 V260 H2020 V380 M2060 380 V300 H2140 V380" {...st} />
      {/* sea */}
      <path d="M0 392 Q60 386 120 392 T240 392 T360 392 T480 392 T600 392 T720 392 T840 392 T960 392 T1080 392 T1200 392 T1320 392 T1440 392 T1560 392 T1680 392 T1800 392 T1920 392 T2040 392 T2160 392" {...st} strokeWidth={1.2} />
    </svg>
  );
};
