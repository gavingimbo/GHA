import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import {City, Dollars, Dusk, INK, Recognition, Reveal, Service, Setting} from './Luxe';
import {FONT} from './theme';
import {EASE, GRID, TextBlock, reveal} from './Words';

export const FPS = 30;
export const FILM_FRAMES = 60 * FPS;

const ramp = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});

const COL = {left: GRID.margin, width: 760};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  // One slow drift across the whole film, so the frame is never still.
  const drift = Math.sin(t * 0.17) * 10;
  const lockup = ramp(t, 53.8, 54.6, 0, 1);

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 64% 40%, #4A2468 0%, #2A1140 44%, #120718 100%)',
        overflow: 'hidden',
        fontFamily: FONT.body,
      }}
    >
      <Audio src={staticFile('audio/soundtrack.mp3')} volume={(fr) => 0.55 * interpolate(fr, [0, 20, FILM_FRAMES - 70, FILM_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <Audio src={staticFile('audio/bed.wav')} volume={0.5} />

      {/* A grain of warmth over the whole film */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 55%, rgba(240,222,184,0.07) 0%, rgba(240,222,184,0) 60%)'}} />

      <AbsoluteFill style={{transform: `translateX(${drift}px)`}}>
        <Dusk t={t} />
        <Setting t={t} />
        <Service t={t} />
        <Recognition t={t} />
        <Reveal t={t} />
        <Dollars t={t} />
        <City t={t} />
      </AbsoluteFill>

      {/* The evening, told in fragments */}
      <TextBlock t={t} from={1.6} to={6.9} tone="dark" lines={['The city sits', 'down to dinner.']} top={420} left={COL.left} width={COL.width} size={96} />
      <TextBlock t={t} from={8.6} to={14.1} tone="dark" lines={['Your table', 'is ready.']} top={420} left={COL.left} width={COL.width} size={112} />
      <TextBlock t={t} from={15.8} to={21.3} tone="dark" lines={['The evening', 'takes its time.']} top={420} left={COL.left} width={COL.width} size={96} />
      <TextBlock
        t={t}
        from={23.0}
        to={28.9}
        tone="dark"
        lines={['And it', 'knows you.']}
        sub="Your tier. Your table. Your evening."
        subFrom={25.6}
        top={400}
        left={COL.left}
        width={COL.width}
        size={112}
      />
      <TextBlock t={t} from={33.4} to={37.9} tone="dark" lines={['Your benefit,', 'already there.']} sub="Nothing to ask for." top={400} left={COL.left} width={COL.width} size={96} />
      <TextBlock t={t} from={39.8} to={46.1} tone="dark" lines={['Spend them.', 'Or keep them.']} sub="You earn either way." top={400} left={COL.left} width={COL.width} size={104} />
      <TextBlock
        t={t}
        from={47.8}
        to={52.9}
        tone="dark"
        lines={['Earn at one table.', 'Spend at the next.']}
        sub="Twenty-four restaurants and bars, across four hotels."
        top={120}
        left={COL.left}
        width={1600}
        size={84}
      />

      {/* The name, last */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lockup}}>
        <Img
          src={staticFile('logo/cinnamon-discovery-logo.svg')}
          style={{width: 880, height: 'auto', transform: `scale(${1.07 - 0.07 * ramp(t, 53.8, 60, 0, 1)})`}}
        />
        <div style={{marginTop: 66, fontFamily: FONT.display, fontWeight: 300, fontSize: 52, letterSpacing: -0.5, color: INK.white, ...reveal(t, 55.0, 99)}}>
          Dine with <span style={{color: INK.lineBright}}>DISCOVERY Dollars</span>
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
