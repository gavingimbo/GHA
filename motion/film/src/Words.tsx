import React from 'react';
import {Easing} from 'remotion';
import {COLOUR, FONT} from './theme';

declare module 'react' {
  interface CSSProperties {
    textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty';
  }
}

export const EASE = Easing.bezier(0.45, 0, 0.2, 1);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// The grid. Everything on screen lines up to these.
export const GRID = {
  margin: 160,
  colW: 700,
  get left() {
    return this.margin;
  },
  get right() {
    return 1920 - this.margin - this.colW;
  },
};

/**
 * Words arrive with a rise out of soft blur and leave with a small lift. Through the hold
 * they keep drifting a couple of pixels, so a held frame is never quite frozen.
 */
export const reveal = (t: number, from: number, to: number, delay = 0): React.CSSProperties => {
  const inP = EASE(clamp01((t - from - delay) / 0.55));
  const outP = EASE(clamp01((t - (to - 0.3)) / 0.3));
  const drift = -3 * clamp01((t - from - delay) / Math.max(0.5, to - from));
  return {
    opacity: inP * (1 - outP),
    transform: `translateY(${(1 - inP) * 38 + drift - outP * 24}px)`,
    filter: `blur(${(1 - inP) * 9 + outP * 5}px)`,
  };
};

/** One line, revealed word by word. */
const Line: React.FC<{text: string; t: number; from: number; to: number; delay: number; style: React.CSSProperties}> = ({
  text,
  t,
  from,
  to,
  delay,
  style,
}) => {
  const words = text.split(' ');
  return (
    <div style={{...style, display: 'flex', flexWrap: 'wrap'}}>
      {words.map((w, i) => (
        <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', ...reveal(t, from, to, delay + i * 0.055)}}>
          {i < words.length - 1 ? w + ' ' : w}
        </span>
      ))}
    </div>
  );
};

/**
 * A beat of the story: a small step marker, a display headline of one or two lines, and an
 * optional supporting line. Headline tracking is tight, the supporting line is quiet, so the
 * hierarchy does the work rather than colour.
 */
export const TextBlock: React.FC<{
  t: number;
  from: number;
  to: number;
  lines: string[];
  sub?: string;
  top: number;
  size?: number;
  left?: number;
  /** When the supporting line arrives, if it should land later than the headline. */
  subFrom?: number;
}> = ({t, from, to, lines, sub, top, size = 120, left = GRID.right, subFrom}) => (
  <div style={{position: 'absolute', left, top, width: GRID.colW, textShadow: '0 0 18px #fff, 0 0 40px #fff, 0 0 8px #fff'}}>
    {lines.map((line, i) => (
      <Line
        key={line}
        text={line}
        t={t}
        from={from}
        to={to}
        delay={i * 0.16}
        style={{
          fontFamily: FONT.display,
          fontWeight: 300,
          fontSize: size,
          lineHeight: 1.03,
          letterSpacing: -size * 0.032,
          color: i > 0 ? COLOUR.purple : COLOUR.ink,
        }}
      />
    ))}
    {sub && (
      <Line
        text={sub}
        t={t}
        from={subFrom ?? from}
        to={to}
        delay={subFrom ? 0 : lines.length * 0.16 + 0.08}
        style={{
          marginTop: 30,
          fontFamily: FONT.body,
          fontWeight: 400,
          fontSize: 33,
          lineHeight: 1.4,
          color: COLOUR.muted,
        }}
      />
    )}
  </div>
);

/** The small wide-tracked label that opens a section. */
export const EYEBROW: React.CSSProperties = {
  fontFamily: FONT.body,
  fontWeight: 600,
  fontSize: 23,
  letterSpacing: 9,
  textTransform: 'uppercase',
  color: '#cbb3e3',
};
