import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
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
import {EASE, EYEBROW, GRID, TextBlock, reveal} from './Words';

export const FPS = 30;
export const FILM_FRAMES = 60 * FPS;

// Output time to story time. Kept so the beats can be stretched without moving every number.
const warp = (o: number) => {
  const w = timeline.warp as [number, number][];
  for (let i = 1; i < w.length; i++) {
    if (o <= w[i][0]) return w[i - 1][1] + ((o - w[i - 1][0]) * (w[i][1] - w[i - 1][1])) / (w[i][0] - w[i - 1][0]);
  }
  return w[w.length - 1][1];
};

// Camera: [seconds, scale, focus y]
const CAM: [number, number, number][] = [
  [0, 1, 560], [14.6, 1, 560], [17.4, 1.14, 505], [23.6, 1.14, 520], [25.4, 1.02, 560], [30.2, 1.02, 560],
  [31.8, 1.13, 500], [36.8, 1.13, 530], [38.6, 1.15, 690], [46.2, 1.15, 700], [48.4, 1.05, 600], [60, 1, 560],
];
// Phone's centre on screen: it moves side to side between scenes, words take the other side
const SIDE: [number, number][] = [
  [0, 1330], [29.4, 1330], [31.4, 590], [46.0, 590], [48.0, 1330], [60, 1330],
];

const ramp = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});


export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = warp(f / FPS);
  // A breath on the camera, so a held frame is never quite still.
  const s = keys(t, CAM.map((c) => [c[0], c[1]])) + Math.sin(t * 0.34) * 0.004;
  const cy = keys(t, CAM.map((c) => [c[0], c[2]]));
  const px = keys(t, SIDE) + Math.sin(t * 0.21) * 9;
  const vx = Math.abs(keys(t, SIDE) - keys(warp((f - 1) / FPS), SIDE));
  const blur = Math.min(4, vx * 0.12);

  const rise = spring({frame: Math.round(t * FPS) - Math.round(14.3 * FPS), fps, config: {damping: 22, stiffness: 80, mass: 1}});
  const phoneY = interpolate(rise, [0, 1], [1100, 0]) + ramp(t, 52.4, 53.4, 0, 1100) + Math.sin(t * 1.3) * 2.5;
  const phoneOn = t > 14.2 && t < 53.5;

  const lockup1 = ramp(t, 10.41, 10.75, 0, 1) * ramp(t, 11.85, 12.15, 1, 0);
  const lockup2 = ramp(t, 56.8, 57.3, 0, 1);

  // Colour blocks change on a near-cut, the way a keynote moves between sections.
  const purple = ramp(t, 4.75, 4.9, 0, 1) * ramp(t, 12.0, 12.15, 1, 0) + ramp(t, 52.5, 52.65, 0, 1);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 30%, rgba(89,42,125,0.07) 0%, rgba(89,42,125,0) 55%), radial-gradient(ellipse at 20% 90%, rgba(89,42,125,0.05) 0%, rgba(89,42,125,0) 50%), #ffffff`, overflow: 'hidden', fontFamily: FONT.body}}>
      <Audio src={staticFile('audio/soundtrack.mp3')} volume={(fr) => 0.4 * interpolate(fr, [0, 15, FILM_FRAMES - 60, FILM_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <Audio src={staticFile('audio/bed.wav')} />

      {/* Brand beats sit on purple: figures, tiers, lockup, and the close */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 25%, #6e3a96 0%, ${COLOUR.purple} 55%, #45205f 100%)`, opacity: purple}} />
      {t < 5.2 && <Chat t={t} />}
      {t > 4.8 && t < 8.2 && <Stats t={t} />}
      {t > 7.9 && t < 10.5 && <Tiers t={t} />}

      {/* The name, given its own moment */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup1}}>
        <div style={{...EYEBROW, marginBottom: 54, ...reveal(t, 10.5, 12.0)}}>Introducing</div>
        <Img
          src={staticFile('logo/cinnamon-discovery-logo.svg')}
          style={{width: 860, height: 'auto', transform: `scale(${1.06 - 0.06 * ramp(t, 10.41, 12, 0, 1)})`}}
        />
        <div style={{marginTop: 64, fontFamily: FONT.display, fontWeight: 300, fontSize: 56, letterSpacing: -1, color: '#fff', ...reveal(t, 10.85, 12.0)}}>
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

      {/* The journey as one moment: a scan, a long calm hold while it recognises you, then the choice */}
      <TextBlock t={t} from={12.4} to={15.2} lines={['One scan.']} top={452} left={GRID.left} size={148} />
      <TextBlock
        t={t}
        from={17.8}
        to={29.6}
        lines={['From here,', 'it knows you.']}
        sub="Your tier. Your balance. Your table."
        subFrom={24.4}
        top={392}
        left={GRID.left}
      />
      <TextBlock t={t} from={31.6} to={37.0} lines={['Your benefit.', 'Already there.']} sub="Nothing to ask for." top={392} left={GRID.right} size={104} />
      <TextBlock t={t} from={38.4} to={46.4} lines={['Your Dollars.', 'Spend or save.']} sub="You earn either way." top={392} left={GRID.right} size={104} />
      <TextBlock t={t} from={48.4} to={52.4} lines={['Done.']} sub="The rest is just dinner." top={448} left={GRID.left} size={148} />

      {t > 52.6 && t < 57 && <Outlets t={t} />}

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup2}}>
        <Img
          src={staticFile('logo/cinnamon-discovery-logo.svg')}
          style={{width: 860, height: 'auto', transform: `scale(${1.08 - 0.08 * ramp(t, 56.8, 60, 0, 1)})`}}
        />
        <div style={{marginTop: 64, fontFamily: FONT.display, fontWeight: 300, fontSize: 52, letterSpacing: -0.5, color: '#fff', ...reveal(t, 57.3, 99)}}>
          Dine with <span style={{color: '#cbb3e3'}}>DISCOVERY Dollars</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
