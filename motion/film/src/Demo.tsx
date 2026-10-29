import React from 'react';
import {Img, staticFile} from 'remotion';
import timeline from './timeline.json';
import {EASE} from './Words';
import {SCREEN_H, SCREEN_W} from './Phone';
import {COLOUR} from './theme';

// The live demo on the phone. Every screen is a capture of the production MyMenu mockup
// and stays inside the phone. Changes happen the way they do in the app: a sheet rises,
// a page pushes in, the page scrolls, text is typed, buttons are tapped.

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const pad = (n: number) => String(n).padStart(2, '0');
const img = (name: string) => staticFile(`ui/${name}.png`);

// Piecewise eased keyframes in seconds
type K = [number, number];
export const keys = (t: number, k: K[]): number => {
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

// Opacity window with a short fade, like a state change in the app
const win = (t: number, a: number, b: number, fade = 0.12) => clamp((t - a) / fade, 0, 1) * clamp((b - t) / fade, 0, 1);

// Bill page scroll: to the discount line, then down to the D$ field and APPLY
export const billScroll = (t: number) =>
  keys(t, [
    [30.1, 0],
    [31.2, 0],
    [32.3, 170],
    [35.3, 170],
    [37.0, 332],
    [60, 332],
  ]);

// What is typed in the D$ field: 60, then cleared to show the choice, then 60 again
const spend60 = (t: number) => (t >= 38.4 && t < 40.2) || t >= 41.8;

const Layer: React.FC<{src: string; opacity: number; top?: number; left?: number; height?: number}> = ({src, opacity, top = 0, left = 0, height = SCREEN_H}) =>
  opacity <= 0.001 ? null : (
    <Img src={src} style={{position: 'absolute', top, left, width: SCREEN_W, height, opacity}} />
  );

export const DemoScreen: React.FC<{t: number}> = ({t}) => {
  // Sign-in sheet: typed email, then password, one character at a time
  const emailK = clamp(Math.floor((t - 17.4) * 14), 0, 22);
  const passM = clamp(Math.floor((t - 19.6) * 10), 0, 9);
  const sheet = t >= 21.0 ? 'signin-submitting' : passM > 0 ? `signin-p${pad(passM)}` : emailK > 0 ? `signin-e${pad(emailK)}` : 'signin-0';
  const sheetY = keys(t, [[16.5, SCREEN_H], [17.1, 0]]);

  const S = billScroll(t);
  const billImg = spend60(t) ? 'bill-60' : 'bill-0';
  const billX = keys(t, [[29.6, SCREEN_W], [30.1, 0]]);

  // Discount line highlight, pulsing while the voice says the benefit is already on the bill
  const hl = win(t, 32.0, 35.4, 0.25) * (0.75 + 0.25 * Math.sin(t * 6));

  return (
    <>
      {/* Phone screen is dark until the link opens */}
      <div style={{position: 'absolute', inset: 0, background: '#0b0b10'}} />

      <Layer src={img('landing')} opacity={win(t, 15.0, 22.3, 0.2)} />

      {t >= 16.5 && t < 22.3 && (
        <Img src={img(sheet)} style={{position: 'absolute', top: sheetY, left: 0, width: SCREEN_W, height: SCREEN_H}} />
      )}

      <Layer src={img('member-loading')} opacity={win(t, 22.2, 23.4, 0.15)} />
      <Layer src={img('member')} opacity={win(t, 23.2, 30.3, 0.15)} />

      {t >= 29.6 && t < 52.8 && (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${billX}px)`, boxShadow: '-20px 0 40px rgba(0,0,0,0.12)'}}>
          <Layer src={img(billImg)} opacity={1} top={-S} height={1184} />
        </div>
      )}

      {hl > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 541 - S,
            width: 365,
            height: 36,
            borderRadius: 9,
            border: `2.5px solid ${COLOUR.purple}`,
            boxShadow: `0 0 0 5px rgba(97,45,135,0.15), 0 0 22px rgba(97,45,135,0.45)`,
            opacity: hl,
          }}
        />
      )}

      <Layer src={img('dialog')} opacity={win(t, 47.8, 49.75, 0.15)} />
      <Layer src={img('dialog-submitting')} opacity={win(t, 49.7, 50.95, 0.1)} />
      <Layer src={img('dialog-success')} opacity={win(t, 50.9, 52.8, 0.15)} />

      <Taps t={t} />
    </>
  );
};

// A touch indicator at each tap, drawn on the phone screen
const Taps: React.FC<{t: number}> = ({t}) => (
  <>
    {timeline.taps.map((tap) => {
      const p = (t - tap.t) / 0.55;
      if (p < 0 || p > 1) return null;
      const ring = EASE(p);
      return (
        <div key={tap.t} style={{position: 'absolute', left: tap.x, top: tap.y, width: 0, height: 0}}>
          <div style={{position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: 26, border: '3px solid rgba(255,255,255,0.95)', background: 'rgba(97,45,135,0.35)', transform: `scale(${0.55 + 0.95 * ring})`, opacity: 1 - ring, boxShadow: '0 0 18px rgba(0,0,0,0.25)'}} />
          <div style={{position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.92)', border: '2px solid rgba(97,45,135,0.6)', transform: `scale(${1 - 0.25 * Math.sin(Math.min(1, p * 3) * Math.PI)})`, opacity: clamp(1 - (p - 0.25) * 2, 0, 1)}} />
        </div>
      );
    })}
  </>
);
