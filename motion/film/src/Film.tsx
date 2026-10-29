import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import {PHONE_CX, PHONE_CY, Phone} from './Phone';
import {COLOUR, FONT} from './theme';

export const FPS = 30;
export const FILM_FRAMES = 60 * FPS;

// One continuous camera. Keys are [seconds, value] and each segment eases on its own.
type K = [number, number];
const CAM_EASE = Easing.bezier(0.45, 0, 0.2, 1);
const kf = (f: number, keys: K[]): number => {
  const t = f / FPS;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return v0 + (v1 - v0) * CAM_EASE((t - t0) / (t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
};

// Camera: [seconds, centre x, centre y, scale]
const CAM: [number, number, number, number][] = [
  [0, 960, 540, 1],
  [4.0, 960, 540, 1],
  [9.0, 960, 300, 1],
  [12.5, 960, 700, 0.85],
  [14.0, 960, 740, 1.35],
  [16.5, 960, 700, 1.0],
  [18.5, 960, 700, 1.0],
  [21.0, 960, 700, 1.05],
  [23.5, 960, 690, 1.2],
  [26.0, 960, 700, 1.0],
  [28.5, 960, 848, 1.7],
  [31.0, 960, 540, 1.0],
  [37.0, 960, 540, 1.0],
  [41.0, 960, 700, 1.0],
  [44.0, 960, 800, 1.5],
  [50.0, 960, 800, 1.5],
  [52.0, 960, 900, 1.6],
  [54.5, 960, 700, 1.0],
  [57.0, 960, 700, 1.0],
  [59.0, 960, 540, 1.0],
];
const camX = (f: number) => kf(f, CAM.map((c) => [c[0], c[1]]));
const camY = (f: number) => kf(f, CAM.map((c) => [c[0], c[2]]));
const camS = (f: number) => kf(f, CAM.map((c) => [c[0], c[3]]));

// Screen layers inside the phone: [src, from s, to s, kind]
type Layer = {src: string; from: number; to: number; kind: 'fade' | 'slideUp' | 'slideIn' | 'through'};
const LAYERS: Layer[] = [
  {src: 'ui/guest-landing.png', from: 9.6, to: 14.2, kind: 'fade'},
  {src: 'ui/guest-signin.png', from: 13.5, to: 14.6, kind: 'slideUp'},
  {src: 'ui/signin-email.png', from: 14.6, to: 16.0, kind: 'fade'},
  {src: 'ui/signin-password.png', from: 16.0, to: 17.0, kind: 'fade'},
  {src: 'ui/guest-signin-submitting.png', from: 17.0, to: 19.2, kind: 'fade'},
  {src: 'ui/member-landing-view-bill.png', from: 19.0, to: 26.0, kind: 'through'},
  {src: 'ui/burn-default.png', from: 26.0, to: 41.0, kind: 'slideIn'},
  {src: 'ui/burn-zero-earn.png', from: 41.0, to: 44.5, kind: 'fade'},
  {src: 'ui/burn-spend-60.png', from: 44.5, to: 52.0, kind: 'fade'},
  {src: 'ui/burn-confirm-dialog.png', from: 52.2, to: 53.6, kind: 'fade'},
  {src: 'ui/burn-confirm-submitting.png', from: 53.6, to: 54.2, kind: 'fade'},
  {src: 'ui/burn-confirm-success.png', from: 54.2, to: 57.0, kind: 'fade'},
];

const layerStyle = (l: Layer, f: number): React.CSSProperties => {
  const t = f / FPS;
  const inT = l.from;
  const outT = l.to;
  const fadeIn = interpolate(t, [inT - 0.25, inT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(t, [outT, outT + 0.25], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = Math.min(fadeIn, fadeOut);
  let transform = 'none';
  if (l.kind === 'slideUp') {
    const y = interpolate(t, [inT, inT + 0.6], [852, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE});
    transform = `translateY(${y}px)`;
  }
  if (l.kind === 'slideIn') {
    const x = interpolate(t, [inT, inT + 0.5], [393, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE});
    transform = `translateX(${x}px)`;
  }
  if (l.kind === 'through') {
    const sc = interpolate(t, [inT, inT + 0.6], [0.92, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE});
    transform = `scale(${sc})`;
  }
  return {position: 'absolute', inset: 0, opacity, transform, width: 393, height: 852, objectFit: 'cover'};
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / FPS;

  // Camera and motion blur, from the camera's speed this frame
  const cx = camX(f);
  const cy = camY(f);
  const cs = camS(f);
  const speed = Math.abs(camX(f) - camX(f - 1)) + Math.abs(camY(f) - camY(f - 1)) + Math.abs(camS(f) - camS(f - 1)) * 800;
  const blur = Math.min(5, speed * 0.12);

  // Logo: opening and closing
  const logoIn = interpolate(t, [0.2, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logoOut = interpolate(t, [3.8, 4.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logoEnd = interpolate(t, [57.4, 58.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logoOpacity = Math.min(logoIn, logoOut) + logoEnd;
  const closingLine = interpolate(t, [58.0, 59.0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // QR shown by staff: visible 4.4s to 9.4s, then it leaves as the camera moves to the phone
  const qrOpacity = interpolate(t, [4.4, 5.0, 9.0, 9.6], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Phone rises into place from below during the scan (spring)
  const rise = spring({frame: f - s(9.0), fps, config: {damping: 30, stiffness: 60, mass: 1}});
  const phoneY = interpolate(rise, [0, 1], [900, 0]);
  const phoneOpacity =
    interpolate(t, [8.8, 9.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(t, [28.8, 29.4, 40.6, 41.0], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(t, [56.6, 57.4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // The benefit figure, lifted off the phone and counting up
  const figureValue = Math.round(interpolate(t, [31.0, 33.6], [0, 29200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE}));
  const figureOpacity = interpolate(t, [30.4, 31.0, 36.6, 37.2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Breath: the total resolves, nothing else moves
  const totalOpacity = interpolate(t, [37.6, 38.4, 40.4, 41.0], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Scroll the real bill screen so the discount line and spend field are in view
  const scrollY = interpolate(t, [26.0, 28.5, 41.0, 44.0], [0, 0, 0, 430], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE});

  return (
    <AbsoluteFill style={{background: COLOUR.midnight, overflow: 'hidden', fontFamily: FONT.body}}>
      <Audio src={staticFile('audio/bed.wav')} />

      <AbsoluteFill
        style={{
          transform: `translate(${960 - cx * cs}px, ${540 - cy * cs}px) scale(${cs})`,
          transformOrigin: '0 0',
          filter: `blur(${blur}px)`,
        }}
      >
        {/* Logo */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: logoOpacity}}>
          <Img src={staticFile('logo/cinnamon-discovery-logo.svg')} style={{width: 1000, height: 'auto'}} />
        </AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 880,
            textAlign: 'center',
            fontFamily: FONT.display,
            fontWeight: 300,
            fontSize: 64,
            color: COLOUR.white,
            opacity: closingLine,
          }}
        >
          Dine with DISCOVERY Dollars.
        </div>

        {/* QR, shown by staff */}
        <div
          style={{
            position: 'absolute',
            left: 960 - 180,
            top: 300 - 180,
            width: 360,
            height: 360,
            padding: 18,
            boxSizing: 'border-box',
            borderRadius: 24,
            background: COLOUR.white,
            opacity: qrOpacity,
          }}
        >
          <Img src={staticFile('qr.svg')} style={{width: '100%', height: '100%'}} />
        </div>

        {/* Phone with the production screens */}
        <Phone y={phoneY} opacity={phoneOpacity}>
          {LAYERS.map((l) => (
            <Img
              key={l.src}
              src={staticFile(l.src)}
              style={{
                ...layerStyle(l, f),
                top: l.src.includes('burn-') ? -scrollY : 0,
              }}
            />
          ))}
        </Phone>

        {/* Benefit figure, in the camera's world above the phone */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: figureOpacity}}>
          <div style={{fontFamily: FONT.body, fontWeight: 500, fontSize: 36, color: COLOUR.sky, marginBottom: 14}}>
            Discount (GHA DISCOVERY 50%)
          </div>
          <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 240, color: COLOUR.white, letterSpacing: -4}}>
            −LKR {figureValue.toLocaleString('en-US')}
          </div>
        </div>

        {/* Total, after the breath */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: totalOpacity}}>
          <div style={{fontFamily: FONT.body, fontWeight: 500, fontSize: 36, color: COLOUR.sky, marginBottom: 14}}>Total</div>
          <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 200, color: COLOUR.white, letterSpacing: -3}}>
            LKR 37,901.60
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Frame helper for the phone rise spring
const s = (sec: number) => Math.round(sec * FPS);
