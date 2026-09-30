"""Soundtrack and sound effects for the explainer, synthesised so there are no
licensing questions. Every cue is placed on the timeline in explainer.html.

    python3 video/audio.py        # writes video/soundtrack.wav

Music: 96 bpm, D major, a soft pad, bass and marimba-like arpeggio. The harmony
darkens to B minor while the error is on screen and resolves back to D when the
discount is applied. Effects: whooshes on camera moves, a tap on Retry, a tick on
highlights, and a chime when the discount lands.
"""
import os
import wave
import numpy as np

SR = 48000
DUR = 38.5
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)          # dry music bus
FL = np.zeros(N); FR = np.zeros(N)        # dry effects bus
VL = np.zeros(N); VR = np.zeros(N)        # reverb send


def hz(note):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def add(sig, t, gain=1.0, pan=0.0, verb=0.0, fx=False):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bl, br = (FL, FR) if fx else (L, R)
    bl[i:i + len(sig)] += sig * gain * gl; br[i:i + len(sig)] += sig * gain * gr
    if verb:
        VL[i:i + len(sig)] += sig * gain * gl * verb; VR[i:i + len(sig)] += sig * gain * gr * verb


def env(n, a, d_curve):
    e = np.exp(-np.arange(n) / (SR * d_curve))
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na)
    return e


# ---------------------------------------------------------------- instruments
def pluck(f, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9) \
        + .12 * np.sin(2 * np.pi * 4.01 * f * t) * np.exp(-t * 22)
    return s * env(n, .004, .42)


def pad(freqs, dur, detune=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        f = f * (1 + detune)
        s += np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * 2 * f * t + 1.3) + .12 * np.sin(2 * np.pi * 3 * f * t)
    a = int(.9 * SR); r = int(1.1 * SR)
    e = np.ones(n); e[:a] = np.linspace(0, 1, a) ** 2; e[-r:] *= np.linspace(1, 0, r) ** 2
    return s * e / len(freqs) * (1 + .08 * np.sin(2 * np.pi * .23 * t))


def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .2 * np.sin(2 * np.pi * 2 * f * t)
    e = env(n, .02, 1.4); r = int(.15 * SR); e[-r:] *= np.linspace(1, 0, r)
    return s * e


def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 42 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def shaker():
    n = int(.07 * SR); x = rng.standard_normal(n)
    x = np.diff(x, prepend=0)                     # tilt towards highs
    return x * env(n, .003, .018) * .5


def lowpass_sweep(x, f0, f1):
    """One-pole low-pass whose cutoff glides from f0 to f1 over the signal."""
    y = np.zeros_like(x); z = 0.0
    fc = np.geomspace(f0, f1, len(x)); a = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(len(x)):
        z += a[i] * (x[i] - z); y[i] = z
    return y


def whoosh(dur=.9, up=True):
    n = int(dur * SR); x = rng.standard_normal(n)
    x = lowpass_sweep(x, 300, 3800) if up else lowpass_sweep(x, 3200, 260)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t ** (.65 if up else 1.2)) ** 2
    return x * e


def tap():
    n = int(.12 * SR); t = np.arange(n) / SR
    click = np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 180)
    body = np.sin(2 * np.pi * (180 + 260 * np.exp(-t * 60)) * t) * np.exp(-t * 45)
    return .55 * click + body


def tick():
    n = int(.08 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 70)


def bell(f, dur=2.4):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 4) \
        + .2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 9)
    return s * env(n, .002, .7)


# --------------------------------------------------------------------- music
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT            # 2.5 s bars
CH = [  # (bass, pad voicing, arpeggio notes) per bar
    ('D2', ['D3', 'A3', 'C#4', 'E4'], ['D4', 'A4', 'E5', 'F#5']),    # 0 intro
    ('D2', ['D3', 'A3', 'C#4', 'E4'], ['D4', 'A4', 'E5', 'F#5']),    # 1 phone
    ('B1', ['B2', 'F#3', 'A3', 'D4'], ['B3', 'F#4', 'D5', 'A4']),    # 2 zoom to error
    ('G1', ['G2', 'D3', 'F#3', 'B3'], ['G3', 'D4', 'B4', 'F#5']),    # 3 reason
    ('E2', ['E3', 'B3', 'D4', 'G4'], ['E4', 'B4', 'G4', 'D5']),      # 4 step 1
    ('C2', ['C3', 'G3', 'B3', 'E4'], ['C4', 'G4', 'E5', 'B4']),      # 5 POS: zoom in, tap Cancel/Exit
    ('A1', ['A2', 'E3', 'G3', 'C#4'], ['A3', 'E4', 'C#5', 'E5']),    # 6 check minimised to Home
    ('F#1', ['F#2', 'C#3', 'E3', 'A3'], ['F#3', 'C#4', 'A4', 'E5']), # 7 hold on Home, lead into step 2
    ('B1', ['B2', 'F#3', 'A3', 'D4'], ['B3', 'F#4', 'D5', 'A4']),    # 8 step 2
    ('G1', ['G2', 'D3', 'F#3', 'B3'], ['G3', 'D4', 'B4', 'A4']),     # 9 tap Retry, checking
    ('D2', ['D3', 'A3', 'C#4', 'F#4'], ['D4', 'A4', 'F#5', 'E5']),   # 10 applied
    ('G1', ['G2', 'D3', 'F#3', 'B3'], ['G3', 'D4', 'B4', 'F#5']),    # 11 D$ dialog
    ('A1', ['A2', 'E3', 'G3', 'C#4'], ['A3', 'E4', 'C#5', 'E5']),    # 12
    ('D2', ['D3', 'A3', 'C#4', 'F#4'], ['D4', 'A4', 'F#5', 'A5']),   # 13 recap
    ('D2', ['D3', 'A3', 'C#4', 'F#4'], []),                           # 14 ring out
]
ARP = [0, 1, 2, 3, 2, 1, 3, 1]                       # eighth-note pattern index into the bar's notes

for b, (bn, voicing, notes) in enumerate(CH):
    t0 = b * BAR
    d = min(BAR + 1.2, DUR - t0)
    if d <= 0: break
    fr = [hz(x) for x in voicing]
    add(pad(fr, d, -.0015), t0, .075, -.35, .5); add(pad(fr, d, .0015), t0, .075, .35, .5)
    if b >= 1:
        add(bass(hz(bn), BAR * .5 - .02), t0, .09); add(bass(hz(bn), BAR * .5 - .02), t0 + BAR / 2, .07)
    if b >= 1 and notes and b < 14:
        dens = 8 if b >= 2 else 4                     # sparser in the first phone bar
        for k in range(8):
            if dens == 4 and k % 2: continue
            f = hz(notes[ARP[k]])
            add(pluck(f), t0 + k * BEAT / 2, .085 if k % 2 == 0 else .06, (-.3, .3)[k % 2], .45)
    if 1 <= b <= 12 and b not in (4, 5, 6, 7):       # step 1 breathes: no pulse
        for q in range(4):
            if q % 2 == 0: add(kick(), t0 + q * BEAT, .10)
            add(shaker(), t0 + q * BEAT + BEAT / 2, .06, .4)
# intro sparkle and the final chord's top note
for i, n_ in enumerate(['A4', 'D5', 'F#5']):
    add(pluck(hz(n_), 2.2), .25 + i * .32, .07, (-.4, 0, .4)[i], .7)
add(bell(hz('D6'), 3.2), 32.55, .05, 0, .8)
add(bell(hz('A5'), 3.2), 32.95, .04, .2, .8)

# ------------------------------------------------------------------- effects
FX = [  # time, sound, gain, pan, reverb
    (3.05, whoosh(1.2, True), .22, 0, .3),        # phone rises
    (5.45, whoosh(1.5, True), .20, 0, .3),        # zoom into the error card
    (7.30, tick(), .22, -.1, .4),                 # reason highlighted
    (10.50, whoosh(.9, False), .20, 0, .3),       # phone leaves
    (11.15, whoosh(.8, True), .10, 0, .3),        # step 1 heading
    (10.90, whoosh(1.1, True), .16, .2, .3),       # terminal card in
    (12.85, whoosh(1.1, True), .12, .2, .3),      # zoom in to Cancel/Exit
    (13.85, tick(), .16, .2, .4),                 # Cancel/Exit highlighted
    (14.45, tap(), .45, .2, .15),                 # tap Cancel/Exit
    (14.75, whoosh(.9, False), .12, 0, .3),       # pull back to the whole screen
    (15.50, whoosh(.9, False), .16, -.1, .3),     # check minimises into its table on Home
    (16.33, tick(), .20, -.1, .4),                # B12/1 highlighted on Home
    (16.35, bell(hz('A5'), 1.6), .10, -.1, .6),
    (16.75, whoosh(1.1, True), .08, -.2, .3),     # camera moves in to the table
    (17.20, tick(), .14, -.2, .4),                # table ringed
    (19.85, whoosh(1.1, True), .20, 0, .3),       # phone returns
    (22.00, tap(), .55, 0, .15),                  # tap Retry
    (23.55, whoosh(1.3, False), .14, 0, .3),      # zoom out to the bill
    (24.80, bell(hz('D6')), .17, -.15, .7),       # discount applied
    (24.95, bell(hz('F#6')), .14, .15, .7),
    (27.30, whoosh(.9, False), .18, 0, .3),       # phone leaves
    (27.90, whoosh(1.0, True), .18, 0, .3),       # D$ dialog in
    (31.95, whoosh(.9, True), .10, 0, .3),        # recap
    (35.85, whoosh(1.2, True), .07, 0, .5),       # end card
    (35.95, bell(hz('D6'), 2.6), .07, 0, .8),     # logo
]
for t, s, g, p, v in FX:
    add(s, t, g, p, v, fx=True)

# ------------------------------------------------------------------ reverb
def reverb(x, secs=2.2):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 3.2)
    ir = np.convolve(ir, np.ones(6) / 6, 'same')   # darken
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return y / np.sqrt(np.sum(ir ** 2))

L += reverb(VL) * .55; R += reverb(VR) * .55

# duck the music a few dB under the tap and the chime so they read clearly
duck = np.ones(N); tt = np.arange(N) / SR
for c, depth in ((22.0, .55), (24.8, .6), (14.45, .7), (16.33, .8)):
    d = np.where(tt < c, np.exp(-np.maximum(c - tt, 0) / .04), np.exp(-(tt - c) / .45))
    duck *= 1 - (1 - depth) * d
L = L * duck + FL; R = R * duck + FR

# high-pass at ~35 Hz: phone speakers cannot play it and it only eats headroom
def hp(x, fc=35):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (f / np.sqrt(f ** 2 + fc ** 2)) ** 2, len(x))
L, R = hp(L), hp(R)

# master: fade in/out, gentle limiter, -1 dBFS peak
t = np.arange(N) / SR
fade = np.clip(t / .15, 0, 1) * np.clip((DUR - t) / 1.4, 0, 1)
mix = np.stack([L, R], 1) * fade[:, None]
mix = np.tanh(mix * 1.6) / 1.6
mix *= .89 / np.max(np.abs(mix))
out = os.path.join(HERE, 'soundtrack.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
