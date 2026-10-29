import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import {DemoScreen, keys} from './Demo';
import {PHONE_X, PHONE_Y, Phone} from './Phone';
import {COLOUR, FONT} from './theme';
import {EASE, Figure, Statement, TextBlock, reveal} from './Words';

export const FPS = 30;
export const FILM_FRAMES = 60 * FPS;

// Camera: [seconds, scale, focus y]. The phone stays left of centre so the words keep their column.
const CAM: [number, number, number][] = [
  [0, 1.0, 560],
  [12.0, 1.0, 560],
  [15.6, 1.06, 540],
  [17.0, 1.2, 500],
  [21.2, 1.2, 520],
  [23.0, 1.02, 560],
  [29.2, 1.1, 640],
  [30.2, 1.0, 560],
  [31.2, 1.18, 500],
  [35.0, 1.18, 540],
  [37.0, 1.2, 690],
  [41.0, 1.2, 700],
  [47.0, 1.22, 740],
  [50.8, 1.1, 640],
  [52.6, 1.0, 560],
  [60, 1.0, 560],
];
const camS = (t: number) => keys(t, CAM.map((c) => [c[0], c[1]]));
const camY = (t: number) => keys(t, CAM.map((c) => [c[0], c[2]]));

const ramp = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / FPS;

  const s = camS(t);
  const cy = camY(t);
  const speed = Math.abs(camS(t) - camS(t - 1 / FPS)) * 900 + Math.abs(camY(t) - camY(t - 1 / FPS));
  const blur = Math.min(3, speed * 0.1);

  // Phone: rises at 12.2s, leaves at 52.6s
  const rise = spring({frame: f - Math.round(12.2 * FPS), fps, config: {damping: 24, stiffness: 70, mass: 1}});
  const phoneY = interpolate(rise, [0, 1], [1000, 0]) + ramp(t, 52.6, 53.8, 0, 120) + Math.sin(t * 1.3) * 2.5;
  const phoneOpacity = ramp(t, 12.2, 12.8, 0, 1) * ramp(t, 52.6, 53.6, 1, 0);

  // QR, shown by our team, flies into the phone when it is scanned
  const qrIn = ramp(t, 12.4, 12.9, 0, 1);
  const fly = ramp(t, 15.0, 15.7, 0, 1);
  const qrX = 1330 + (700 - 1330) * fly;
  const qrY = 650 + (560 - 650) * fly;
  const qrScale = 1 - 0.78 * fly;
  const qrOpacity = qrIn * (1 - ramp(t, 15.5, 15.8, 0, 1));

  // Drifting light behind everything
  const gx = 28 + Math.sin(t * 0.25) * 6;

  const lockup1 = ramp(t, 9.6, 10.3, 0, 1) * ramp(t, 11.8, 12.4, 1, 0);
  const lockup2 = ramp(t, 56.8, 57.6, 0, 1);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${gx}% 42%, #2c3a8e 0%, ${COLOUR.midnight} 48%, #141a47 100%)`,
        overflow: 'hidden',
        fontFamily: FONT.body,
      }}
    >
      <Audio src={staticFile('audio/bed.wav')} />

      {/* Act 1: the tables Colombo already knows */}
      <Statement t={t} from={0.2} to={1.9} text="Long lunches." />
      <Statement t={t} from={1.7} to={3.4} text="Late dinners." />
      <Statement t={t} from={3.2} to={5.1} text="Sunday brunch." />

      {/* Marketing figures, the only large numbers in the film */}
      <Figure t={t} from={5.2} to={7.3} value={4} label="hotels" />
      <Figure t={t} from={7.1} to={9.5} value={24} label="restaurants and bars" />

      {/* Logo lockup, then the promise */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup1}}>
        <Img src={staticFile('logo/cinnamon-discovery-logo.svg')} style={{width: 1000, height: 'auto', marginBottom: 90}} />
        <div style={{position: 'absolute', top: 640, fontFamily: FONT.display, fontWeight: 300, fontSize: 64, color: COLOUR.white}}>
          Now every one of them rewards you.
        </div>
      </AbsoluteFill>

      {/* The camera world: phone and its live demo */}
      <AbsoluteFill
        style={{
          transform: `translate(${700 - PHONE_X * s}px, ${540 - cy * s}px) scale(${s})`,
          transformOrigin: '0 0',
          filter: `blur(${blur}px)`,
        }}
      >
        <Phone y={phoneY} opacity={phoneOpacity}>
          <DemoScreen t={t} />
        </Phone>
      </AbsoluteFill>

      {/* Act 2: take a seat, scan */}
      <TextBlock t={t} from={12.4} to={14.3} lines={['Take a seat.']} top={240} />
      <TextBlock t={t} from={14.0} to={17.0} lines={['Scan the code.']} top={240} />
      <div
        style={{
          position: 'absolute',
          left: qrX - 190,
          top: qrY - 190,
          width: 380,
          height: 380,
          padding: 20,
          boxSizing: 'border-box',
          borderRadius: 28,
          background: COLOUR.white,
          opacity: qrOpacity,
          transform: `scale(${qrScale})`,
          boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
        }}
      >
        <Img src={staticFile('qr.svg')} style={{width: '100%', height: '100%'}} />
      </div>

      {/* Act 3: the journey on the phone */}
      <TextBlock t={t} from={17.0} to={22.6} lines={['Sign in.']} sub="Your GHA DISCOVERY email and password." top={330} />
      <TextBlock t={t} from={23.6} to={29.6} lines={['Recognised.']} sub="Your tier. Your bill. Ready." top={330} />
      <TextBlock t={t} from={30.6} to={37.2} lines={['Your benefit.', 'Already there.']} top={270} />
      <TextBlock t={t} from={37.6} to={46.8} lines={['Use D$.', 'Or keep them.']} sub="Either way, you earn." top={250} />
      <TextBlock t={t} from={47.2} to={52.5} lines={['Tap to apply.']} sub="That's it." top={330} />

      {/* Close */}
      <Statement t={t} from={53.0} to={56.8} text="Earn at one table." top={330} size={150} />
      <Statement t={t} from={54.2} to={56.8} text="Spend at the next." top={510} size={150} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup2}}>
        <Img src={staticFile('logo/cinnamon-discovery-logo.svg')} style={{width: 1000, height: 'auto', marginBottom: 90}} />
        <div style={{position: 'absolute', top: 640, fontFamily: FONT.display, fontWeight: 300, fontSize: 64, color: COLOUR.white, ...reveal(t, 57.2, 99)}}>
          Dine with DISCOVERY Dollars.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
