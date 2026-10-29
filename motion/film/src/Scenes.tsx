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
    <div style={{position: 'absolute', left: 560, top: 150, width: 800, opacity: 1 - out, transform: `translateY(${-out * 40 - Math.max(0, t - 2) * 18}px)`}}>
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

// The scale, in a clean two-column layout
export const Stats: React.FC<{t: number}> = ({t}) => {
  const col = (from: number, n: number, label: string) => {
    const v = Math.round(interpolate(t, [from, from + 0.9], [0, n], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE}));
    return (
      <div style={{width: 560, textAlign: 'center', ...reveal(t, from, 9.4)}}>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 300, lineHeight: 1, color: COLOUR.ink, letterSpacing: -8}}>{v}</div>
        <div style={{fontFamily: FONT.body, fontWeight: 500, fontSize: 40, color: P, letterSpacing: 6, textTransform: 'uppercase', marginTop: 20}}>{label}</div>
      </div>
    );
  };
  const line = EASE(clamp((t - 5.4) / 0.6)) * (1 - clamp((t - 9.1) / 0.3));
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80}}>
      {col(5.2, 4, 'Hotels')}
      <div style={{width: 2, height: 360 * line, background: P, opacity: 0.35}} />
      {col(5.7, 24, 'Restaurants & bars')}
    </div>
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
  ['Cinnamon Life at City of Dreams Sri Lanka', ['Gatz', 'Staten', 'Bistro', 'Yoroko', 'Indya', 'Sapphire Dragon', 'Pool+Bar 09', 'Dreams & Beats', 'Flux', 'Cloud Wine', 'Quizine']],
  ['Cinnamon Lakeside Colombo', ['The Dining Room', 'Royal Thai', 'Long Feng', 'Colombar', 'Pool Bar']],
  ['Cinnamon Red Colombo', ['Flavoured', 'CloudRed']],
];
export const Outlets: React.FC<{t: number}> = ({t}) => {
  let k = 0;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: FONT.display, fontWeight: 300, fontSize: 92, color: COLOUR.ink, letterSpacing: -2, ...reveal(t, 52.8, 56.7)}}>
        Earn at one table. <span style={{color: P}}>Spend at the next.</span>
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 330, display: 'flex', justifyContent: 'space-between'}}>
        {HOTELS.map(([hotel, outlets], i) => (
          <div key={hotel} style={{width: 370, ...reveal(t, 53.1 + i * 0.12, 56.7)}}>
            <div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 19, letterSpacing: 2.5, textTransform: 'uppercase', color: P, borderBottom: `1.5px solid ${P}33`, paddingBottom: 14, marginBottom: 16, minHeight: 50}}>{hotel}</div>
            {outlets.map((o) => {
              const d = 53.4 + (k++) * 0.05;
              return <div key={o} style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 34, lineHeight: 1.45, color: COLOUR.ink, ...reveal(t, d, 56.7)}}>{o}</div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
