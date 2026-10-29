import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import {Phone} from './Phone';
import {BillScreen, ChooseState, ScanScreen, SignInScreen, SuccessScreen} from './screens';
import {COLOUR, FONT} from './theme';

export const FPS = 30;
export const FILM_FRAMES = 60 * FPS;

// Timings from motion/storyboard.md, in seconds.
const s = (sec: number) => Math.round(sec * FPS);
const T = {
  logoIn: s(0.2),
  logoOut: s(4.2),
  phoneRise: s(4.2),
  pushStart: s(10.0),
  scanLine: s(12.0),
  signInStart: s(13.5),
  typeEmail: s(14.6),
  typePassword: s(16.0),
  press: s(17.0),
  morphStart: s(19.0),
  morphEnd: s(21.6),
  billIn: s(21.6),
  venueIn: s(22.6),
  tierIn: s(23.4),
  split: s(24.0),
  zoomStart: s(29.0),
  zoomEnd: s(31.0),
  figureStart: s(31.0),
  figureEnd: s(33.6),
  breathStart: s(37.0),
  breathSettle: s(37.9),
  breathEnd: s(41.0),
  chooseIn: s(40.5),
  sliderZero: s(41.5),
  sliderUp: s(43.8),
  sliderEnd: s(46.2),
  press2: s(52.0),
  successStart: s(54.0),
  closeStart: s(57.0),
};

const ease = Easing.bezier(0.205, 0.137, 0.732, 0.802);

const ramp = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const fade = (f: number, inF: number, outF: number, dur = 8) =>
  interpolate(f, [inF - dur, inF, outF, outF + dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const formatLkr = (n: number) =>
  n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Background: Midnight for most of the film, white for the success and close.
  const bg = f >= T.successStart && f < T.closeStart ? COLOUR.white : COLOUR.midnight;
  const ink = bg === COLOUR.white ? COLOUR.ink : COLOUR.white;

  // Logo: opening (0 to 4.2s) and closing (57s on)
  const logoOpen = fade(f, T.logoIn + s(0.6), T.logoOut, 10);
  const logoClose = interpolate(f, [T.closeStart + s(0.8), T.closeStart + s(1.6)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phone rise: enters from below on screen ~4.2s
  const rise = spring({frame: f - T.phoneRise, fps, config: {damping: 30, stiffness: 60, mass: 1}});
  const phoneVisible = f >= T.phoneRise && f < T.closeStart + s(1.5);

  // Camera: rotate from 12 degrees to face-on while rising, then push into the screen
  const rotateIn = interpolate(f, [T.phoneRise, T.phoneRise + s(1.8)], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const pushScale = ramp(f, T.pushStart, T.signInStart, 1, 1.6);
  const pushY = ramp(f, T.pushStart, T.signInStart, 0, -60);

  // Screen state per frame
  const screen = (() => {
    if (f < T.signInStart) return 'scan' as const;
    if (f < T.billIn) return 'signin' as const;
    if (f < T.successStart) return 'bill' as const;
    return 'success' as const;
  })();

  // Lift of the phone away from the figure (benefit shot), then rejoin for choose
  const phoneOpacity = (() => {
    if (!phoneVisible) return 0;
    if (f >= T.figureStart && f < T.breathEnd) return 0;
    if (f >= T.breathEnd && f < T.chooseIn) return 0;
    return 1;
  })();
  const zoomBill = f >= T.zoomStart && f < T.figureStart ? ramp(f, T.zoomStart, T.zoomEnd, 1, 1.9) : f >= T.figureStart ? 1.9 : 1;
  const chooseRise = interpolate(f, [T.chooseIn, T.chooseIn + s(1.2)], [260, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const closeScale = interpolate(f, [T.closeStart, T.closeStart + s(2.2)], [1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Phone transform, pieced together by stage
  const phoneScale =
    f < T.zoomStart ? pushScale : f < T.figureStart ? zoomBill : f < T.chooseIn ? 1.9 : closeScale;
  const phoneY =
    f < T.zoomStart
      ? pushY + (1 - rise) * 500
      : f < T.chooseIn
        ? 0
        : chooseRise;
  const phoneRotate = f < T.phoneRise + s(1.8) ? rotateIn : 0;

  // Morph: sign-in button grows into full screen (shared element)
  const morph = interpolate(f, [T.morphStart, T.morphEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Benefit figure: lifts off the phone and counts up
  const figure = Math.round(ramp(f, T.figureStart, T.figureEnd, 0, 29200));
  const figureOpacity = fade(f, T.figureStart, T.breathStart, 6);
  const figureLabelOpacity = fade(f, T.figureStart + s(0.2), T.breathStart, 8);

  // Breath: total resolves, nothing moves
  const totalOpacity = interpolate(f, [T.breathSettle, T.breathSettle + s(0.8)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * fade(f, T.breathSettle, T.breathEnd, 6);

  // D$ slider (choose): zero, rests, then rises to 60
  const sliderValue = Math.round(
    f < T.sliderZero
      ? 0
      : f < T.sliderUp
        ? 0
        : ramp(f, T.sliderUp, T.sliderEnd, 0, 60),
  );

  // Press on confirm, then success
  const pressed = f >= T.press2 && f < T.press2 + s(0.2);
  const successOpacity = fade(f, T.successStart, T.closeStart, 6);

  // Split words: "Cinnamon" | "DISCOVERY" beside the phone
  const splitLeft = ramp(f, T.split, T.split + s(0.9), -40, 0);
  const splitRight = ramp(f, T.split, T.split + s(0.9), 40, 0);
  const splitOpacity = fade(f, T.split, T.zoomStart + s(0.5), 8);

  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden', fontFamily: FONT.body}}>
      <Audio src={staticFile('audio/bed.wav')} />

      {/* Opening and closing logo */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: Math.max(logoOpen * (1 - logoClose), logoClose)}}>
        <Img
          src={staticFile('logo/cinnamon-discovery-logo.svg')}
          style={{width: 1000, height: 'auto', filter: bg === COLOUR.white ? 'none' : 'none'}}
        />
      </AbsoluteFill>

      {/* Closing line */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 170, opacity: logoClose}}>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 64, color: COLOUR.white}}>
          Dine with DISCOVERY Dollars.
        </div>
      </AbsoluteFill>

      {/* Phone */}
      <Phone
        scale={phoneScale}
        y={phoneY}
        rotate={phoneRotate}
        opacity={phoneOpacity}
        origin={screen === 'bill' ? '50% 58%' : '50% 50%'}
      >
        {screen === 'scan' && <ScanScreen qrSrc={staticFile('qr.svg')} scanY={scanProgress(f)} />}
        {screen === 'signin' && (
          <SignInScreen
            emailChars={Math.round(ramp(f, T.typeEmail, T.typePassword, 0, 24))}
            passwordDots={Math.round(ramp(f, T.typePassword, T.press, 0, 10))}
            pressed={f >= T.press && f < T.press + s(0.2)}
            morph={morph}
          />
        )}
        {screen === 'bill' && (
          <BillScreen
            intro={interpolate(f, [T.billIn, T.billIn + s(0.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
            venueOpacity={fade(f, T.venueIn, T.breathEnd + 999, 8)}
            tierY={interpolate(f, [T.tierIn, T.tierIn + s(0.9)], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease,
            })}
            tierOpacity={fade(f, T.tierIn, T.breathEnd + 999, 8)}
            choose={f >= T.chooseIn ? ({value: sliderValue, pressed} as ChooseState) : undefined}
            pressed={pressed}
          />
        )}
        {screen === 'success' && <SuccessScreen progress={successProgress(f)} />}
      </Phone>

      {/* Split words, beside the phone while the card arrives */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'space-between', padding: '0 180px', opacity: splitOpacity}}>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 96, color: COLOUR.white, transform: `translateX(${splitLeft}px)`}}>Cinnamon</div>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 96, color: COLOUR.white, transform: `translateX(${splitRight}px)`}}>DISCOVERY</div>
      </div>

      {/* The benefit figure, lifted off the phone */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: figureOpacity * (f < T.breathStart ? 1 : 0)}}>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 40, color: COLOUR.sky, letterSpacing: 1, marginBottom: 12, opacity: figureLabelOpacity}}>
          GHA DISCOVERY 50% discount applied
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 240, color: COLOUR.white, letterSpacing: -4}}>
          −LKR {figure.toLocaleString('en-US')}
        </div>
      </AbsoluteFill>

      {/* Breath: the total resolves, nothing else moves */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: totalOpacity}}>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 40, color: COLOUR.sky, marginBottom: 12}}>Total</div>
        <div style={{fontFamily: FONT.display, fontWeight: 300, fontSize: 200, color: COLOUR.white, letterSpacing: -3}}>
          LKR {formatLkr(37901.6)}
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};

// Scan line travels down the QR from scanLine to scanLine + 1s, then rests off-screen
function scanProgress(f: number) {
  if (f < T.scanLine) return -1;
  return interpolate(f, [T.scanLine, T.scanLine + s(1.0)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
}

function successProgress(f: number) {
  return interpolate(f, [T.successStart + s(0.2), T.successStart + s(1.2)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}
