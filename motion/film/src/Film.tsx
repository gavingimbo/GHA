import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import {DemoScreen, keys} from './Demo';
import timeline from './timeline.json';
import {PHONE_X, Phone} from './Phone';
import {Ambient, Chat, Outlets, Restaurant, Stats, Tiers} from './Scenes';
import {COLOUR, FONT} from './theme';
import {EASE, TextBlock, reveal} from './Words';

export const FPS = 30;
export const FILM_FRAMES = 60 * FPS;

// Output time to story time: the opening is slowed so the voice parts fit, the rest shifts later.
const warp = (o: number) => {
  const w = timeline.warp as [number, number][];
  for (let i = 1; i < w.length; i++) {
    if (o <= w[i][0]) return w[i - 1][1] + ((o - w[i - 1][0]) * (w[i][1] - w[i - 1][1])) / (w[i][0] - w[i - 1][0]);
  }
  return w[w.length - 1][1];
};

// Camera: [seconds, scale, focus y]
const CAM: [number, number, number][] = [
  [0, 1, 560], [14.6, 1, 560], [16.2, 1.06, 540], [17.2, 1.16, 500], [21.2, 1.16, 520], [23.0, 1.02, 560],
  [29.2, 1.08, 640], [30.2, 1.0, 560], [31.2, 1.14, 500], [35.0, 1.14, 540], [37.0, 1.16, 690], [45.5, 1.16, 700],
  [47.4, 1.04, 580], [60, 1, 560],
];
// Phone's centre on screen: it moves side to side between scenes, words take the other side
const SIDE: [number, number][] = [
  [0, 1340], [22.6, 1340], [23.6, 600], [29.6, 600], [30.6, 1320], [36.8, 1320], [37.8, 600], [46.6, 600], [47.6, 1320], [60, 1320],
];
const R = 1080; // words column when the phone is left
const L = 150; // words column when the phone is right

const ramp = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = warp(f / FPS);
  const s = keys(t, CAM.map((c) => [c[0], c[1]]));
  const cy = keys(t, CAM.map((c) => [c[0], c[2]]));
  const px = keys(t, SIDE);
  const vx = Math.abs(keys(t, SIDE) - keys(warp((f - 1) / FPS), SIDE));
  const blur = Math.min(4, vx * 0.12);

  const rise = spring({frame: Math.round(t * FPS) - Math.round(14.3 * FPS), fps, config: {damping: 22, stiffness: 80, mass: 1}});
  const phoneY = interpolate(rise, [0, 1], [1100, 0]) + ramp(t, 52.4, 53.4, 0, 1100) + Math.sin(t * 1.3) * 2.5;
  const phoneOn = t > 14.2 && t < 53.5;

  const lockup1 = ramp(t, 10.41, 10.9, 0, 1) * ramp(t, 11.7, 12.1, 1, 0);
  const lockup2 = ramp(t, 56.8, 57.6, 0, 1);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 30%, rgba(89,42,125,0.07) 0%, rgba(89,42,125,0) 55%), radial-gradient(ellipse at 20% 90%, rgba(89,42,125,0.05) 0%, rgba(89,42,125,0) 50%), #ffffff`, overflow: 'hidden', fontFamily: FONT.body}}>
      <Audio src={staticFile('audio/soundtrack.mp3')} volume={(fr) => 0.4 * interpolate(fr, [0, 15, FILM_FRAMES - 60, FILM_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <Audio src={staticFile('audio/bed.wav')} />

      {t < 5.2 && <Chat t={t} />}
      {t > 4.8 && t < 8.2 && <Stats t={t} />}
      {t > 7.9 && t < 10.5 && <Tiers t={t} />}

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup1}}>
        <Img src={staticFile('logo/cinnamon-discovery-logo-purple.svg')} style={{width: 900, height: 'auto', marginBottom: 80, transform: `scale(${1.08 - 0.08 * ramp(t, 10.41, 12, 0, 1)})`}} />
        <div style={{position: 'absolute', top: 630, fontFamily: FONT.display, fontWeight: 300, fontSize: 58, color: COLOUR.ink, ...reveal(t, 10.6, 12.0)}}>
          Now, every table rewards you.
        </div>
      </AbsoluteFill>

      <Restaurant t={t} />
      <Ambient t={t} px={px} />

      {phoneOn && (
        <AbsoluteFill style={{transform: `translate(${px - PHONE_X * s}px, ${540 - cy * s}px) scale(${s})`, transformOrigin: '0 0', filter: `blur(${blur}px)`}}>
          <Phone y={phoneY} opacity={1}>
            <DemoScreen t={t} />
          </Phone>
        </AbsoluteFill>
      )}

      <TextBlock t={t} from={12.3} to={14.6} lines={['Take a seat.']} top={150} left={L} />
      <TextBlock t={t} from={14.6} to={17.0} lines={['Scan the code.']} sub="Shown by your server." top={380} left={L} />
      <TextBlock t={t} from={17.0} to={22.6} lines={['Sign in.']} sub="Your GHA DISCOVERY email and password." top={380} left={L} />
      <TextBlock t={t} from={23.8} to={29.6} lines={['Recognised.']} sub="Your tier. Your bill. Ready." top={380} left={R} />
      <TextBlock t={t} from={30.8} to={37.0} lines={['Your benefit.', 'Already there.']} top={330} left={L} />
      <TextBlock t={t} from={38.0} to={46.8} lines={['Use D$.', 'Or keep them.']} sub="Either way, you earn." top={300} left={R} />
      <TextBlock t={t} from={47.6} to={52.4} lines={["And you're done."]} sub="Settle with the restaurant as usual." top={400} left={L} size={96} />

      {t > 52.6 && t < 57 && <Outlets t={t} />}

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup2}}>
        <Img src={staticFile('logo/cinnamon-discovery-logo-purple.svg')} style={{width: 900, height: 'auto', marginBottom: 80, transform: `scale(${1.1 - 0.1 * ramp(t, 56.8, 60, 0, 1)})`}} />
        <div style={{position: 'absolute', top: 630, fontFamily: FONT.display, fontWeight: 300, fontSize: 52, letterSpacing: 1, color: COLOUR.ink, ...reveal(t, 57.4, 99)}}>
          Dine with <span style={{color: COLOUR.purple}}>DISCOVERY Dollars</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
