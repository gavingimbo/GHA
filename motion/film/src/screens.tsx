import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLOUR, FONT} from './theme';

// Screens are drawn at the production mockup's phone size (393 x 852 logical px).
// Copy follows the live flow, with the storyboard's figures.

const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center'};

export const ScanScreen: React.FC<{qrSrc: string; scanY: number}> = ({qrSrc, scanY}) => {
  const qrTop = 260;
  const qrSize = 260;
  return (
    <div style={{position: 'absolute', inset: 0, background: COLOUR.white}}>
      <div style={{...center, top: 150, fontFamily: FONT.display, fontWeight: 300, fontSize: 40, color: COLOUR.ink}}>
        Scan the code
      </div>
      <div style={{...center, top: 204, fontFamily: FONT.body, fontSize: 15, color: COLOUR.muted}}>
        On your table
      </div>
      <div
        style={{
          position: 'absolute',
          left: (393 - qrSize) / 2,
          top: qrTop,
          width: qrSize,
          height: qrSize,
          padding: 12,
          borderRadius: 18,
          boxSizing: 'border-box',
          background: COLOUR.white,
          boxShadow: '0 0 0 1px ' + COLOUR.line,
        }}
      >
        <Img src={qrSrc} style={{width: '100%', height: '100%'}} />
        {scanY >= 0 && scanY <= 1 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 12 + scanY * (qrSize - 24),
              height: 3,
              background: COLOUR.purple,
              boxShadow: '0 0 12px ' + COLOUR.purple,
            }}
          />
        )}
      </div>
    </div>
  );
};

export const SignInScreen: React.FC<{
  emailChars: number;
  passwordDots: number;
  pressed: boolean;
  morph: number;
}> = ({emailChars, passwordDots, pressed, morph}) => {
  const email = 'member@example.com'.slice(0, Math.max(0, emailChars));
  const buttonTop = 520;
  // Shared element: the Sign in button grows into the full screen
  const left = 24 * (1 - morph);
  const top = buttonTop * (1 - morph);
  const width = 345 + (393 - 345) * morph;
  const height = 56 + (852 - 56) * morph;
  const radius = 14 + (50 - 14) * (1 - morph) * 0 + (0 - 14) * morph;
  return (
    <div style={{position: 'absolute', inset: 0, background: COLOUR.white}}>
      <div style={{position: 'absolute', left: 24, top: 120, fontFamily: FONT.display, fontWeight: 300, fontSize: 40, color: COLOUR.ink}}>
        Sign in
      </div>
      <div style={{position: 'absolute', left: 24, top: 176, width: 345, fontFamily: FONT.body, fontSize: 15, color: COLOUR.muted, lineHeight: 1.4}}>
        Use your GHA DISCOVERY email and password.
      </div>

      <div style={{position: 'absolute', left: 24, top: 250, width: 345, fontFamily: FONT.body, fontSize: 13, color: COLOUR.muted}}>
        Email address
      </div>
      <div style={{position: 'absolute', left: 24, top: 274, width: 345, height: 52, boxSizing: 'border-box', border: '1px solid #D5D0DE', borderRadius: 12, padding: '0 14px', display: 'flex', alignItems: 'center', fontFamily: FONT.body, fontSize: 17, color: COLOUR.ink}}>
        {email}
        {emailChars > 0 && emailChars < 19 && <span style={{width: 1.5, height: 20, background: COLOUR.ink, marginLeft: 2}} />}
      </div>

      <div style={{position: 'absolute', left: 24, top: 346, width: 345, fontFamily: FONT.body, fontSize: 13, color: COLOUR.muted}}>
        Password
      </div>
      <div style={{position: 'absolute', left: 24, top: 370, width: 345, height: 52, boxSizing: 'border-box', border: '1px solid #D5D0DE', borderRadius: 12, padding: '0 14px', display: 'flex', alignItems: 'center', fontFamily: FONT.body, fontSize: 22, letterSpacing: 2, color: COLOUR.ink}}>
        {'•'.repeat(passwordDots)}
      </div>

      <div
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          borderRadius: radius,
          background: COLOUR.purple,
          transform: pressed ? 'scale(0.96)' : 'scale(1)',
          display: morph >= 1 ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLOUR.white,
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 17,
        }}
      >
        {morph < 0.2 && 'Sign in'}
      </div>
    </div>
  );
};

export type ChooseState = {value: number; pressed: boolean};

const DOLLARS_MAX = 148;

export const BillScreen: React.FC<{
  intro: number;
  venueOpacity: number;
  tierY: number;
  tierOpacity: number;
  choose?: ChooseState;
  pressed: boolean;
}> = ({intro, venueOpacity, tierY, tierOpacity, choose, pressed}) => {
  const value = choose ? choose.value : 0;
  const fill = (value / DOLLARS_MAX) * 297;
  return (
    <div style={{position: 'absolute', inset: 0, background: COLOUR.white}}>
      <div style={{position: 'absolute', inset: 0, background: COLOUR.purple, opacity: 1 - intro}} />
      <div style={{position: 'absolute', inset: 0, opacity: intro}}>
        <div style={{...center, top: 52, opacity: venueOpacity}}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              background: '#F2EEF7',
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 14,
              color: COLOUR.purple,
            }}
          >
            Dreams &amp; Beats
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 96,
            width: 345,
            height: 180,
            boxSizing: 'border-box',
            borderRadius: 16,
            overflow: 'hidden',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: COLOUR.white,
            fontFamily: FONT.body,
            transform: `translateY(${tierY}px)`,
            opacity: tierOpacity,
            boxShadow: '0 8px 24px rgba(20,16,46,0.18)',
          }}
        >
          <Img src={staticFile('img/titanium.webp')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,16,46,0) 30%, rgba(20,16,46,0.7) 100%)'}} />
          <div style={{position: 'relative', fontSize: 12, letterSpacing: 2, opacity: 0.85}}>GHA DISCOVERY</div>
          <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <div>
              <div style={{fontWeight: 600, fontSize: 17}}>Member name</div>
              <div style={{fontSize: 12, opacity: 0.85}}>0000 0000 00</div>
            </div>
            <div style={{fontWeight: 600, fontSize: 14}}>Titanium</div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 296,
            width: 345,
            boxSizing: 'border-box',
            borderRadius: 14,
            border: '1px solid ' + COLOUR.line,
            padding: '14px 16px',
            fontFamily: FONT.body,
            fontSize: 14,
            color: COLOUR.ink,
          }}
        >
          <div style={{fontWeight: 600, fontSize: 16, marginBottom: 10}}>Your bill</div>
          <Row label="Subtotal" value="LKR 58,400.00" />
          <Row label="GHA DISCOVERY 50%" value="−LKR 29,200.00" accent />
          <Row label="Service charge 10%" value="LKR 2,920.00" />
          <Row label="VAT 18%" value="LKR 5,781.60" />
          <div style={{height: 1, background: COLOUR.line, margin: '8px 0'}} />
          <Row label="Total" value="LKR 37,901.60" bold />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 520,
            width: 345,
            height: 112,
            boxSizing: 'border-box',
            borderRadius: 14,
            border: '1px solid ' + COLOUR.line,
            padding: '14px 16px',
            fontFamily: FONT.body,
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: COLOUR.ink}}>
            <span style={{fontWeight: 600}}>Use DISCOVERY Dollars</span>
            <span style={{fontWeight: 600, color: COLOUR.purple}}>D$ {value}</span>
          </div>
          <div style={{position: 'absolute', left: 16, right: 16, top: 62, height: 6, borderRadius: 3, background: COLOUR.line}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: fill, borderRadius: 3, background: COLOUR.purple}} />
            <div style={{position: 'absolute', left: fill - 11, top: -8, width: 22, height: 22, borderRadius: 11, background: COLOUR.white, boxShadow: '0 1px 4px rgba(0,0,0,0.25)'}} />
          </div>
          <div style={{position: 'absolute', left: 16, right: 16, top: 78, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLOUR.muted}}>
            <span>D$ 0</span>
            <span>D$ {DOLLARS_MAX}</span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 748,
            width: 345,
            height: 56,
            borderRadius: 14,
            background: COLOUR.purple,
            color: COLOUR.white,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: pressed ? 'scale(0.96)' : 'scale(1)',
          }}
        >
          Confirm
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{label: string; value: string; accent?: boolean; bold?: boolean}> = ({label, value, accent, bold}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: accent ? COLOUR.purple : COLOUR.ink, fontWeight: bold ? 600 : 400}}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export const SuccessScreen: React.FC<{progress: number}> = ({progress}) => {
  const circle = 120;
  const dash = 120;
  return (
    <div style={{position: 'absolute', inset: 0, background: COLOUR.white}}>
      <div
        style={{
          position: 'absolute',
          left: (393 - circle) / 2,
          top: 300,
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          background: COLOUR.purple,
          transform: `scale(${0.8 + 0.2 * progress})`,
          opacity: progress,
        }}
      >
        <svg width={circle} height={circle} viewBox="0 0 120 120" style={{position: 'absolute', inset: 0}}>
          <path
            d="M36 62 L54 80 L86 46"
            fill="none"
            stroke={COLOUR.white}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
            strokeDashoffset={dash * (1 - progress)}
          />
        </svg>
      </div>
      <div style={{...center, top: 470, padding: '0 40px', fontFamily: FONT.display, fontWeight: 300, fontSize: 40, color: COLOUR.ink, lineHeight: 1.2, opacity: progress}}>
        Your DISCOVERY Dollars are on the way.
      </div>
    </div>
  );
};
