import React from 'react';
import {COLOUR} from './theme';

// The phone sits at world centre (960, 700) in the 1920 x 1080 frame. Screens are the
// production MyMenu captures at 393 x 852 logical px, so the UI matches the live flow.
export const PHONE_CX = 960;
export const PHONE_CY = 700;
const SCREEN_W = 393;
const SCREEN_H = 852;
const BEZEL = 14;

export const Phone: React.FC<{y: number; opacity: number; children: React.ReactNode}> = ({y, opacity, children}) => (
  <div
    style={{
      position: 'absolute',
      left: PHONE_CX - (SCREEN_W + BEZEL * 2) / 2,
      top: PHONE_CY - (SCREEN_H + BEZEL * 2) / 2,
      width: SCREEN_W + BEZEL * 2,
      height: SCREEN_H + BEZEL * 2,
      borderRadius: 62,
      background: 'linear-gradient(145deg, #3a3a40, #1b1b20 45%, #2a2a30)',
      padding: BEZEL,
      boxSizing: 'border-box',
      transform: `translateY(${y}px)`,
      opacity,
      boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 50,
        overflow: 'hidden',
        background: COLOUR.white,
      }}
    >
      {children}
    </div>
  </div>
);
