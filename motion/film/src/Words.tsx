import React from 'react';

declare module 'react' {
  interface CSSProperties {
    textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty';
  }
}
import {Easing, interpolate} from 'remotion';
import {COLOUR, FONT} from './theme';

export const EASE = Easing.bezier(0.45, 0, 0.2, 1);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Words arrive with a short rise out of blur and leave with a small lift, on the film's easing.
export const reveal = (t: number, from: number, to: number, delay = 0): React.CSSProperties => {
  const inP = EASE(clamp01((t - from - delay) / 0.45));
  const outP = EASE(clamp01((t - (to - 0.3)) / 0.3));
  const opacity = inP * (1 - outP);
  const y = (1 - inP) * 44 - outP * 26;
  const blur = (1 - inP) * 14 + outP * 6;
  return {opacity, transform: `translateY(${y}px)`, filter: `blur(${blur}px)`};
};

// A block of display lines on the right of the frame, with an optional supporting line
export const TextBlock: React.FC<{
  t: number;
  from: number;
  to: number;
  lines: string[];
  sub?: string;
  top: number;
  size?: number;
  left?: number;
}> = ({t, from, to, lines, sub, size = 124, left = 1020}) => (
  // Centred in its half of the frame, across and top to bottom, opposite the phone
  <div style={{position: 'absolute', left, top: 0, bottom: 0, width: 840, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textShadow: '0 0 18px #fff, 0 0 36px #fff, 0 0 8px #fff'}}>
    {/* The block sits centred in its half; the lines inside keep a natural left alignment */}
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left'}}>
    {lines.map((line, i) => (
      <div
        key={line}
        style={{
          fontFamily: FONT.display,
          fontWeight: 300,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: -2,
          color: i > 0 ? COLOUR.purple : COLOUR.ink,
          textWrap: 'balance',
          ...reveal(t, from, to, i * 0.14),
        }}
      >
        {line}
      </div>
    ))}
    {sub && (
      <div
        style={{
          marginTop: 26,
          fontFamily: FONT.body,
          fontWeight: 500,
          fontSize: 38,
          color: COLOUR.purple,
          textWrap: 'balance',
          ...reveal(t, from, to, lines.length * 0.14 + 0.1),
        }}
      >
        {sub}
      </div>
    )}
    </div>
  </div>
);

// Centred, full-frame statement
export const Statement: React.FC<{t: number; from: number; to: number; text: string; size?: number; top?: number}> = ({
  t,
  from,
  to,
  text,
  size = 190,
  top = 410,
}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', textWrap: 'balance', fontFamily: FONT.display, fontWeight: 300, fontSize: size, letterSpacing: -3, color: COLOUR.ink, ...reveal(t, from, to)}}>
    {text}
  </div>
);

// A marketing figure, counted up, with its label
export const Figure: React.FC<{t: number; from: number; to: number; value: number; label: string}> = ({t, from, to, value, label}) => {
  const n = Math.round(interpolate(t, [from + 0.1, from + 1.1], [0, value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE}));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...reveal(t, from, to)}}>
      <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 460, lineHeight: 1, letterSpacing: -10, color: COLOUR.ink}}>{n}</div>
      <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 92, color: COLOUR.purple, marginTop: 6}}>{label}</div>
    </div>
  );
};
