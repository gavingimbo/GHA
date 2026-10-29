import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLOUR} from './theme';

// A plain phone frame drawn in code (no device artwork). Screen is 393 x 852 logical px,
// the same size as the production mockup, so the layout matches the live flow.
const SCREEN_W = 393;
const SCREEN_H = 852;
const BEZEL = 14;

export const Phone: React.FC<{
  scale: number;
  y: number;
  rotate: number;
  opacity: number;
  origin: string;
  children: React.ReactNode;
}> = ({scale, y, rotate, opacity, origin, children}) => {
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity, pointerEvents: 'none'}}>
      <div
        style={{
          width: SCREEN_W + BEZEL * 2,
          height: SCREEN_H + BEZEL * 2,
          borderRadius: 62,
          background: 'linear-gradient(145deg, #3a3a40, #1b1b20 45%, #2a2a30)',
          padding: BEZEL,
          boxSizing: 'border-box',
          transform: `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
          transformOrigin: origin,
          boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 50,
            overflow: 'hidden',
            position: 'relative',
            background: COLOUR.white,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
