import React from 'react';
import {COLOUR} from './theme';

// The phone sits at world (560, 560). Screens are the production MyMenu captures at
// 393 x 852 logical px, so the layout matches the live flow exactly.
export const PHONE_X = 560;
export const PHONE_Y = 560;
export const SCREEN_W = 393;
export const SCREEN_H = 852;
const BEZEL = 14;

export const Phone: React.FC<{y: number; opacity: number; children: React.ReactNode}> = ({y, opacity, children}) => (
  <div
    style={{
      position: 'absolute',
      left: PHONE_X - (SCREEN_W + BEZEL * 2) / 2,
      top: PHONE_Y - (SCREEN_H + BEZEL * 2) / 2,
      width: SCREEN_W + BEZEL * 2,
      height: SCREEN_H + BEZEL * 2,
      borderRadius: 62,
      background: 'linear-gradient(145deg, #3a3a40, #1b1b20 45%, #2a2a30)',
      padding: BEZEL,
      boxSizing: 'border-box',
      transform: `translateY(${y}px)`,
      opacity,
      boxShadow: '0 50px 100px rgba(0,0,0,0.45)',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 50,
        overflow: 'hidden',
        background: '#0b0b10',
      }}
    >
      {children}
    </div>
  </div>
);

export const colour = COLOUR;
