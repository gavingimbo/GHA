import React from 'react';
import {staticFile} from 'remotion';
import {EASE} from './Words';

// A five-star brand film drawn in line and light. Nothing here is a screenshot: the journey is
// told as an evening at the table, the way a hospitality film tells it.

export const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
/** Piecewise eased keyframes in seconds. */
export const keys = (t: number, k: [number, number][]): number => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, v0] = k[i - 1];
      const [t1, v1] = k[i];
      return v0 + (v1 - v0) * EASE((t - t0) / (t1 - t0));
    }
  }
  return k[k.length - 1][1];
};

export const INK = {
  line: '#E2D0AE', // Dune, lifted so it carries on the deep ground
  lineBright: '#F6EBD2',
  glow: '#F0DEB8',
  purple: '#9A6FC4',
  white: '#FFFFFF',
  soft: '#C9B9D6',
};

/** A stroke that draws itself on. */
const draw = (p: number, len = 2400) => ({
  fill: 'none' as const,
  stroke: INK.line,
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeDasharray: len,
  strokeDashoffset: len * (1 - p),
});

const Scene: React.FC<{show: number; children: React.ReactNode; scale?: number}> = ({show, children, scale = 1}) =>
  show <= 0.001 ? null : (
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: show, transform: `scale(${scale})`}}>
      {children}
    </svg>
  );

/** Warm light behind a point, for candles and glows. */
const Glow: React.FC<{x: number; y: number; r: number; o: number; colour?: string}> = ({x, y, r, o, colour = INK.glow}) => (
  <g opacity={o}>
    <defs>
      <radialGradient id={`g${x}${y}${Math.round(r)}`}>
        <stop offset="0" stopColor={colour} stopOpacity="0.42" />
        <stop offset="0.45" stopColor={colour} stopOpacity="0.11" />
        <stop offset="1" stopColor={colour} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#g${x}${y}${Math.round(r)})`} />
  </g>
);

// ─── 1. Dusk over Colombo ────────────────────────────────────────────────────
// The city wakes. Windows come on one by one along the skyline.
export const Dusk: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 0.2) / 1.0) * (1 - clamp((t - 7.4) / 0.7));
  const p = EASE(clamp((t - 0.4) / 3.4));
  const win: [number, number][] = [];
  for (let i = 0; i < 54; i++) win.push([180 + ((i * 97) % 1560), 690 + ((i * 53) % 230)]);
  return (
    <Scene show={show} scale={1.04 - 0.04 * clamp((t - 0.2) / 7)}>
      <path
        d="M-40 940 H1960 M60 940 V840 H150 V800 H230 V860 H320 V820 H400 V940"
        {...draw(p)}
        opacity={0.75}
      />
      {/* Lotus Tower */}
      <path d="M620 940 L632 560 L608 540 L628 530 L620 506 L644 518 L650 494 L656 518 L680 506 L672 530 L692 540 L668 560 L680 940 M650 494 V410" {...draw(p)} />
      {/* twin towers */}
      <path d="M830 940 V600 H900 V940 M940 940 V600 H1010 V940 M830 650 H900 M940 650 H1010" {...draw(p)} />
      {/* curved towers */}
      <path d="M1090 940 C1090 790 1124 660 1160 598 H1232 C1220 672 1220 800 1232 940 M1280 940 C1280 810 1304 714 1340 664 H1412 C1400 740 1400 840 1412 940" {...draw(p)} />
      <path d="M1500 940 V680 H1570 V940 M1610 940 V730 L1648 704 L1686 730 V940 M1740 940 V646 H1792 V612 H1840 V940" {...draw(p)} />
      {win.map(([x, y], i) => {
        const on = clamp((t - 1.4 - (i % 18) * 0.13) / 0.5);
        return <rect key={i} x={x} y={y} width={7} height={11} fill={INK.glow} opacity={on * (0.3 + 0.5 * Math.abs(Math.sin(t * 0.7 + i)))} />;
      })}
      <Glow x={960} y={880} r={720} o={0.5 * p} />
    </Scene>
  );
};

// ─── 2. The place is set ─────────────────────────────────────────────────────
// A table from above: cloth, plate, cutlery, glass, and a candle lit.
export const Setting: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 7.0) / 0.8) * (1 - clamp((t - 14.6) / 0.7));
  const p = (d: number) => EASE(clamp((t - 7.4 - d) / 1.1));
  const flame = clamp((t - 11.4) / 0.8);
  const cx = 1330;
  const cy = 545;
  return (
    <Scene show={show} scale={1.06 - 0.06 * clamp((t - 7) / 7.6)}>
      <ellipse cx={cx} cy={cy} rx={500} ry={372} {...draw(p(0), 2600)} opacity={0.6} />
      <circle cx={cx} cy={cy} r={196} {...draw(p(0.5), 1200)} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={146} {...draw(p(0.75), 900)} opacity={0.8} />
      {/* fork */}
      <path d={`M${cx - 250} ${cy - 92} v184 M${cx - 262} ${cy - 92} v58 q12 16 24 0 v-58 M${cx - 238} ${cy - 92} v58`} {...draw(p(1.0), 700)} />
      {/* knife and spoon */}
      <path d={`M${cx + 250} ${cy - 92} q22 44 0 88 v96 M${cx + 292} ${cy - 70} q26 0 26 34 t-26 34 v116`} {...draw(p(1.15), 800)} />
      {/* glass */}
      <g {...draw(p(1.3), 700)}>
        <circle cx={cx + 232} cy={cy - 212} r={46} />
        <circle cx={cx + 232} cy={cy - 212} r={30} opacity={0.6} />
      </g>
      {/* napkin */}
      <path d={`M${cx - 360} ${cy + 150} h150 v150 h-150 z M${cx - 360} ${cy + 225} h150`} {...draw(p(1.45), 700)} opacity={0.75} />
      {/* candle */}
      <circle cx={cx - 230} cy={cy - 232} r={34} {...draw(p(1.6), 400)} />
      <circle cx={cx - 230} cy={cy - 232} r={10} fill={INK.glow} opacity={flame * (0.75 + 0.25 * Math.sin(t * 7))} />
      <Glow x={cx - 230} y={cy - 232} r={300 + 26 * Math.sin(t * 2.4)} o={flame * 0.95} />
    </Scene>
  );
};

// ─── 3. The evening begins ───────────────────────────────────────────────────
// Dishes arrive, a glass is poured, steam curls away.
export const Service: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 14.4) / 0.8) * (1 - clamp((t - 21.8) / 0.7));
  const p = (d: number) => EASE(clamp((t - 14.8 - d) / 1.2));
  const pour = clamp((t - 17.6) / 1.9);
  return (
    <Scene show={show} scale={1.05 - 0.05 * clamp((t - 14.4) / 7.4)}>
      {/* three settings along the table */}
      {[1040, 1400, 1740].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={660} r={132 - i * 10} {...draw(p(i * 0.22), 900)} strokeWidth={3} />
          <circle cx={x} cy={660} r={96 - i * 8} {...draw(p(i * 0.22 + 0.2), 700)} opacity={0.8} />
        </g>
      ))}
      {/* steam off the centre dish */}
      {[0, 1, 2].map((i) => {
        const a = clamp((t - 16.4 - i * 0.3) / 2.6);
        return (
          <path
            key={i}
            d={`M${1010 + i * 32} ${540 - a * 120} q${18 * Math.sin(t * 1.5 + i)} -46 0 -92 q${-18 * Math.sin(t * 1.5 + i)} -46 0 -92`}
            fill="none"
            stroke={INK.lineBright}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.5 * a * (1 - a)}
          />
        );
      })}
      {/* the pour */}
      <g {...draw(p(0.7), 800)}>
        <path d="M1560 300 q46 -20 76 10 l-28 74 q-30 18 -58 -4 z" />
        <path d="M1612 390 v22" />
      </g>
      <path d="M1604 412 q-6 60 -4 120" fill="none" stroke={INK.lineBright} strokeWidth={3.2} strokeLinecap="round" opacity={pour * (1 - clamp((t - 19.4) / 1.2))} />
      <g {...draw(p(0.9), 700)}>
        <path d="M1552 520 q-6 92 48 118 q54 -26 48 -118 z" />
        <path d="M1600 638 v74 M1560 712 h80" />
      </g>
      <path d={`M1556 ${600 - pour * 62} q44 ${18 * Math.sin(t * 2)} 88 0 v${pour * 62 + 36} q-44 20 -88 0 z`} fill={INK.line} opacity={0.22 * pour} />
      <Glow x={1360} y={640} r={560} o={0.45} />
    </Scene>
  );
};

// ─── 4. Recognition ──────────────────────────────────────────────────────────
// A ring of light finds the table. The member's card settles into it.
export const Recognition: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 21.6) / 0.8) * (1 - clamp((t - 29.4) / 0.7));
  const ring = EASE(clamp((t - 22.2) / 1.6));
  const card = EASE(clamp((t - 24.0) / 1.3));
  const cx = 1290;
  const cy = 540;
  return (
    <Scene show={show} scale={1.05 - 0.05 * clamp((t - 21.6) / 7.8)}>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={200 + i * 130}
          fill="none"
          stroke={INK.line}
          strokeWidth={2}
          opacity={ring * (0.62 - i * 0.15) * (0.8 + 0.2 * Math.sin(t * 1.6 - i))}
          strokeDasharray={1800}
          strokeDashoffset={1800 * (1 - clamp((t - 22.2 - i * 0.22) / 1.5))}
        />
      ))}
      <Glow x={cx} y={cy} r={420} o={0.75 * ring} />
      {/* the member's card, as an object rather than a screen */}
      <g transform={`translate(${cx} ${cy}) rotate(${-7 + 7 * card}) scale(${0.82 + 0.18 * card})`} opacity={card}>
        <rect x={-230} y={-144} width={460} height={288} rx={26} fill="#120A1C" stroke={INK.line} strokeWidth={1.4} />
        <rect x={-230} y={-144} width={460} height={288} rx={26} fill="url(#cardSheen)" />
        <defs>
          <linearGradient id="cardSheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.11" />
          </linearGradient>
        </defs>
        <image href={staticFile('logo/cinnamon-discovery-logo.svg')} x={-178} y={-112} width={300} height={44} opacity={0.92} />
        <text x={-178} y={92} fill={INK.white} fontFamily="Jost" fontWeight={300} fontSize={34} letterSpacing="1">
          Gavin Matthew
        </text>
        <text x={-178} y={126} fill={INK.soft} fontFamily="Figtree" fontSize={20} letterSpacing="2">
          839283945
        </text>
        <text x={54} y={126} fill={INK.lineBright} fontFamily="Figtree" fontWeight={600} fontSize={20} letterSpacing="3">
          TITANIUM
        </text>
      </g>
    </Scene>
  );
};

// ─── 5. The reveal ───────────────────────────────────────────────────────────
// A cloche lifts, and the benefit is already underneath.
export const Reveal: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 29.2) / 0.8) * (1 - clamp((t - 38.4) / 0.7));
  const p = EASE(clamp((t - 29.6) / 1.4));
  const lift = EASE(clamp((t - 32.4) / 1.9));
  const cx = 1290;
  const base = 760;
  return (
    <Scene show={show} scale={1.04 - 0.04 * clamp((t - 29.2) / 9.2)}>
      <ellipse cx={cx} cy={base} rx={330} ry={56} {...draw(p, 2000)} opacity={0.7} />
      <Glow x={cx} y={base - 40} r={120 + 440 * lift} o={0.2 + 0.8 * lift} />
      <g transform={`translate(0 ${-lift * 330})`} opacity={1 - 0.75 * lift}>
        <path d={`M${cx - 272} ${base} A 272 250 0 0 1 ${cx + 272} ${base}`} {...draw(p, 1400)} strokeWidth={3.4} />
        <path d={`M${cx - 300} ${base} H${cx + 300}`} {...draw(p, 700)} strokeWidth={3.4} />
        <circle cx={cx} cy={base - 274} r={22} {...draw(p, 200)} strokeWidth={3.4} />
        <path d={`M${cx} ${base - 252} v18`} {...draw(p, 100)} strokeWidth={3.4} />
        <path d={`M${cx - 200} ${base - 110} a 200 180 0 0 1 120 -118`} fill="none" stroke={INK.lineBright} strokeWidth={1.8} opacity={0.6 * p} />
      </g>
      {/* what was underneath: light, and a quiet mark */}
      <g opacity={lift}>
        <circle cx={cx} cy={base - 54} r={22 + 10 * Math.sin(t * 2.2)} fill={INK.glow} opacity={0.85} />
        {[...Array(14)].map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const r = 90 + lift * 210 + 18 * Math.sin(t * 1.6 + i);
          return <circle key={i} cx={cx + Math.cos(a) * r} cy={base - 54 + Math.sin(a) * r * 0.42} r={3.4} fill={INK.glow} opacity={0.8 * (1 - lift * 0.3)} />;
        })}
      </g>
    </Scene>
  );
};

// ─── 6. The Dollars ──────────────────────────────────────────────────────────
// Points of light rise from the table. Some are spent, some stay and gather.
export const Dollars: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 38.2) / 0.8) * (1 - clamp((t - 46.6) / 0.7));
  const cx = 1290;
  const split = EASE(clamp((t - 41.4) / 2.4));
  return (
    <Scene show={show} scale={1.04 - 0.04 * clamp((t - 38.2) / 8.4)}>
      <Glow x={cx} y={560} r={520} o={0.45} />
      {[...Array(26)].map((_, i) => {
        const rise = clamp((t - 38.8 - (i % 9) * 0.16) / 2.2);
        const spent = i % 2 === 0;
        const a = (i / 26) * Math.PI * 2;
        const sx = cx + Math.cos(a) * 170;
        const sy = 700 + Math.sin(a) * 60;
        // Spent points drift away and fade; saved points gather into a quiet constellation.
        const gx = spent ? sx + Math.cos(a) * 560 * split : cx + Math.cos(a) * 130 * (1 - split * 0.45);
        const gy = spent ? sy - 300 * split : 520 + Math.sin(a) * 130 * (1 - split * 0.45);
        const x = sx + (gx - sx) * rise;
        const y = sy + (gy - sy) * rise - rise * 60;
        const o = rise * (spent ? 1 - split * 0.92 : 0.5 + 0.5 * split);
        return (
          <g key={i} opacity={o}>
            <circle cx={x + Math.sin(t * 1.3 + i) * 6} cy={y + Math.cos(t * 1.1 + i) * 6} r={spent ? 4 : 5.5} fill={INK.glow} />
            <circle cx={x + Math.sin(t * 1.3 + i) * 6} cy={y + Math.cos(t * 1.1 + i) * 6} r={16} fill={INK.glow} opacity={0.16} />
          </g>
        );
      })}
    </Scene>
  );
};

// ─── 7. The city ─────────────────────────────────────────────────────────────
// The light travels on: four hotels, twenty-four rooms, lighting one after another.
const ROOMS = [
  'The London Grill', 'Nuga Gama', 'Lagoon', 'Plates', 'Breeze Bar', 'Cheers',
  'Gatz', 'Staten', 'Bistro', 'Yoroko', 'Indiya', 'Sapphire Dragon',
  'Pool+Bar 09', 'Dreams & Beats', 'Flux', 'Cloud Wine', 'Quizine',
  'The Dining Room', 'Royal Thai', 'Long Feng', 'Colombar', 'Pool Bar',
  'Flavoured', 'CloudRed',
];
export const City: React.FC<{t: number}> = ({t}) => {
  const show = clamp((t - 46.4) / 0.8) * (1 - clamp((t - 53.4) / 0.7));
  return (
    <Scene show={show} scale={1.05 - 0.05 * clamp((t - 46.4) / 7)}>
      <Glow x={960} y={620} r={820} o={0.4} />
      {ROOMS.map((name, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 250 + col * 390;
        const y = 448 + row * 96;
        const on = EASE(clamp((t - 47.0 - i * 0.1) / 0.7));
        return (
          <g key={name} opacity={on}>
            <circle cx={x - 26} cy={y - 10} r={4.5} fill={INK.glow} />
            <circle cx={x - 26} cy={y - 10} r={20} fill={INK.glow} opacity={0.18} />
            <text x={x} y={y} fill={INK.white} fontFamily="Jost" fontWeight={300} fontSize={32} opacity={0.94}>
              {name}
            </text>
          </g>
        );
      })}
    </Scene>
  );
};
