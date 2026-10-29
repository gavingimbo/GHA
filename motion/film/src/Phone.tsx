import React from 'react';

// iPhone 15 Pro style frame (natural titanium, Dynamic Island), drawn in code.
// Screens are the production MyMenu captures at 393 x 852 logical px.
export const PHONE_X = 560;
export const PHONE_Y = 560;
export const SCREEN_W = 393;
export const SCREEN_H = 852;
const B = 12;

export const Phone: React.FC<{y: number; opacity: number; children: React.ReactNode}> = ({y, opacity, children}) => (
  <div style={{position: 'absolute', left: PHONE_X - (SCREEN_W + B * 2 + 8) / 2, top: PHONE_Y - (SCREEN_H + B * 2 + 8) / 2, transform: `translateY(${y}px)`, opacity}}>
    {[[-3, 150, 30], [-3, 210, 60], [-3, 285, 60], [SCREEN_W + B * 2 + 8, 240, 95]].map(([x, top, h], i) => (
      <div key={i} style={{position: 'absolute', left: x, top, width: 3, height: h, borderRadius: 2, background: 'linear-gradient(90deg,#77736d,#b9b5ae)'}} />
    ))}
    <div style={{width: SCREEN_W + B * 2 + 8, height: SCREEN_H + B * 2 + 8, borderRadius: 66, padding: 4, boxSizing: 'border-box',
      background: 'linear-gradient(135deg,#d6d2cb 0%,#8f8b85 30%,#c4c0b9 55%,#7d7a75 80%,#bdb9b2 100%)',
      boxShadow: '0 60px 120px rgba(40,20,60,0.28), 0 20px 40px rgba(40,20,60,0.18)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 62, background: '#050507', padding: B, boxSizing: 'border-box'}}>
        <div style={{position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 52, overflow: 'hidden', background: '#0b0b10'}}>
          {children}
          <div style={{position: 'absolute', left: (SCREEN_W - 124) / 2, top: 11, width: 124, height: 36, borderRadius: 18, background: '#000'}} />
        </div>
      </div>
    </div>
  </div>
);
