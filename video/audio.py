"""Soundtrack and sound effects for the explainer, synthesised here so there is no
licensing to clear. Scored to the story in explainer.html (times in seconds).

    python3 video/audio.py        # writes video/soundtrack.wav

Music: 96 bpm (2.5 s bars) in D major. An electric piano carries the harmony with
a light groove (kick, snap, hats) and a round bass; a bell-like motif asks a
question on the cover and answers it when the discount lands and on the logo.
The arc follows the story: warm open, a drop and a darker turn at the error, the
groove building while the team member acts on the POS, a lift into the fix, and a
resolved end. Effects mark each on-screen action, and the music ducks under taps
and chimes so they read.
"""
import os
import wave
import numpy as np

SR = 48000
DUR = 38.5
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(11)

ML = np.zeros(N); MR = np.zeros(N)        # music
FL = np.zeros(N); FR = np.zeros(N)        # effects
VL = np.zeros(N); VR = np.zeros(N)        # reverb send


def hz(note):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440.0 * 2 ** ((names[note[:-1]] + 12 * (int(note[-1]) + 1) - 69) / 12)


def add(sig, t, gain=1.0, pan=0.0, verb=0.0, fx=False):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L, R = (FL, FR) if fx else (ML, MR)
    L[i:i + len(sig)] += sig * gl; R[i:i + len(sig)] += sig * gr
    if verb:
        VL[i:i + len(sig)] += sig * gl * verb; VR[i:i + len(sig)] += sig * gr * verb


def tt(d): return np.arange(int(d * SR)) / SR


def env(n, a, dec):
    e = np.exp(-np.arange(n) / (SR * dec))
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na)
    return e


def fade_tail(x, r=.03):
    k = int(r * SR); x[-k:] *= np.linspace(1, 0, k); return x


# ------------------------------------------------------------------ instruments
def ep(f, d=1.4, bright=1.0):
    """FM electric piano: a tine that softens as it rings."""
    t = tt(d)
    idx = (1.6 * bright) * np.exp(-t * 3.2) + .25
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    s += .18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
    s *= env(len(t), .004, .55) * (1 + .04 * np.sin(2 * np.pi * 5.2 * t))
    return fade_tail(s)


def bell(f, d=2.4):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 4) \
        + .22 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 9)
    return fade_tail(s * env(len(t), .002, .75))


def marimba(f, d=1.2):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 25)
    return fade_tail(s * env(len(t), .002, .32))


def pad(freqs, d):
    t = tt(d); s = np.zeros(len(t))
    for f in freqs:
        for det in (-.0018, .0018):
            s += np.sin(2 * np.pi * f * (1 + det) * t) + .3 * np.sin(2 * np.pi * 2 * f * (1 + det) * t + 1.1)
    a, r = int(.8 * SR), int(1.0 * SR)
    e = np.ones(len(t)); e[:a] = np.linspace(0, 1, a) ** 2; e[-r:] *= np.linspace(1, 0, r) ** 2
    return s * e / (2 * len(freqs))


def bass(f, d):
    t = tt(d)
    s = np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)))
    return fade_tail(s * env(len(t), .006, .9), .04)


def kick():
    t = tt(.4)
    f = 45 + 85 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + .15 * np.exp(-t * 200) * rng.standard_normal(len(t))


def onepole(x, fc, hp=False):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); z = 0.0
    for i in range(len(x)):
        z = (1 - a) * x[i] + a * z; y[i] = z
    return x - y if hp else y


_noise = rng.standard_normal(int(.3 * SR))
_snap = onepole(onepole(_noise[: int(.18 * SR)], 900, hp=True), 5000)
_hat = onepole(_noise[: int(.05 * SR)], 7000, hp=True)


def snap():
    t = tt(.18)
    return _snap[: len(t)] * np.exp(-t * 30) * 2.2 + .35 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 40)


def hat():
    t = tt(.05)
    return _hat[: len(t)] * np.exp(-t * 140)


def sweep(d, f0, f1, up=True):
    n = int(d * SR); x = rng.standard_normal(n)
    y = np.zeros(n); z = 0.0
    fc = np.geomspace(f0, f1, n); a = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(n):
        z += a[i] * (x[i] - z); y[i] = z
    k = np.linspace(0, 1, n)
    return y * (np.sin(np.pi * k ** (.6 if up else 1.4)) ** 2)


def tap():
    t = tt(.12)
    return .5 * np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 200) + np.sin(2 * np.pi * (170 + 260 * np.exp(-t * 60)) * t) * np.exp(-t * 48)


def click():
    t = tt(.05)
    return np.sin(2 * np.pi * 1600 * t) * np.exp(-t * 160) + .4 * _hat[: len(t)] * np.exp(-t * 200)


def tick(f=1320):
    t = tt(.09)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 60)


def thump():
    t = tt(.3)
    return np.sin(2 * np.pi * (60 + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 14)


# ------------------------------------------------------------------ the score
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
# (bass root, chord voicing, section): one line per 2.5 s bar
SCORE = [
    ('D2', ['F#3', 'A3', 'C#4', 'E4'], 'open'),      # 0  cover
    ('D2', ['F#3', 'A3', 'B3', 'E4'], 'groove'),     # 1  the guest applies the discount
    ('B1', ['D3', 'F#3', 'A3', 'C#4'], 'drop'),      # 2  the error opens
    ('G1', ['D3', 'F#3', 'B3', 'E4'], 'drop'),       # 3  why: the check is open
    ('E2', ['D3', 'G3', 'B3', 'E4'], 'build'),       # 4  the POS
    ('A1', ['D3', 'G3', 'B3', 'E4'], 'build'),       # 5  Cancel/Exit
    ('F#1', ['D3', 'F#3', 'A3', 'E4'], 'build'),     # 6  minimised
    ('G1', ['D3', 'F#3', 'B3', 'E4'], 'build'),      # 7  back to the guest
    ('A1', ['C#3', 'G3', 'B3', 'E4'], 'lift'),       # 8  Retry
    ('D2', ['F#3', 'A3', 'C#4', 'E4'], 'full'),      # 9  the discount lands
    ('G1', ['D3', 'F#3', 'B3', 'E4'], 'full'),       # 10 DISCOVERY Dollars
    ('A1', ['C#3', 'G3', 'B3', 'E4'], 'full'),       # 11
    ('F#1', ['D3', 'F#3', 'A3', 'C#4'], 'full'),     # 12 recap
    ('G1', ['D3', 'F#3', 'B3', 'E4'], 'full'),       # 13
    ('D2', ['F#3', 'A3', 'C#4', 'E4'], 'end'),       # 14 the logo
    ('D2', ['F#3', 'A3', 'C#4', 'E4'], 'tail'),      # 15
]
STABS = [(0, 1.6, 1.0), (1.5, .5, .7), (2.5, .9, .8), (3.5, .45, .6)]   # beat, length, velocity
PANS = (-.3, -.1, .1, .3)

for b, (root, voicing, sec) in enumerate(SCORE):
    t0 = b * BAR
    if t0 >= DUR: break
    fr = [hz(n) for n in voicing]
    add(pad(fr, min(BAR + 1.0, DUR - t0)), t0, .07 if sec == 'drop' else .05, 0, .5)
    # electric piano
    if sec == 'open':
        for i, f in enumerate(fr): add(ep(f, 2.6, .8), t0 + .15 + i * .05, .07, PANS[i], .5)
    elif sec == 'drop':
        for i, f in enumerate(fr): add(ep(f, 2.4, .6), t0, .055, PANS[i], .6)
    elif sec in ('groove', 'build', 'lift', 'full'):
        for beat, ln, vel in STABS:
            for i, f in enumerate(fr):
                add(ep(f, ln + .4, .9 + .3 * (sec == 'full')), t0 + beat * BEAT, .06 * vel, PANS[i], .35)
    elif sec == 'end':
        for i, f in enumerate(fr + [hz('A4')]):
            add(ep(f, 3.4, 1.0), t0 + i * .04, .07, (-.35, -.15, .05, .2, .35)[i], .6)
    # bass
    if sec in ('groove', 'build', 'lift', 'full'):
        for beat, ln in ((0, .9), (1.5, .45), (3.0, .4), (3.5, .45)):
            add(bass(hz(root), ln * BEAT * 1.6), t0 + beat * BEAT, .12)
    elif sec in ('drop', 'open', 'end'):
        add(bass(hz(root), BAR * .95), t0, .07 if sec == 'open' else .12)
    # drums
    if sec in ('groove', 'build', 'lift', 'full'):
        for q in range(4):
            tq = t0 + q * BEAT
            if tq < 3.0: continue
            if q in (0, 2) or (sec == 'full' and q == 3 and b % 2): add(kick(), tq, .15)
            if sec in ('build', 'lift', 'full') and q in (1, 3): add(snap(), tq, .09, .1, .25)
            add(hat(), tq, .03, .35); add(hat(), tq + BEAT / 2, .05, .35)
        if sec == 'full':
            for s16 in range(16): add(hat(), t0 + s16 * BEAT / 4 + .01, .012, -.4)
    elif sec == 'drop':
        add(kick(), t0, .14)

# motif: a question on the cover, the answer when the discount lands, and on the logo
for i, (n, beat) in enumerate([('F#5', 0), ('A5', .5), ('E5', 1.5), ('D5', 2.5)]):
    add(marimba(hz(n), 1.6), .25 + beat * BEAT, .09, (-.2, .2, -.1, .1)[i], .6)
for i, (n, beat) in enumerate([('D5', 0), ('F#5', .5), ('A5', 1), ('D6', 1.5)]):
    add(marimba(hz(n), 1.6), 9 * BAR + beat * BEAT, .08, (-.2, .2, -.1, .1)[i], .6)
for i, (n, d) in enumerate([('A5', 0), ('D6', .18), ('F#6', .36)]):
    add(bell(hz(n), 3.0), 35.0 + d, .06, (-.2, 0, .2)[i], .8)

# ------------------------------------------------------------------ effects, on the picture
FX = [
    (.35, tick(988), .13, 0, .3), (.47, tick(784), .12, 0, .3),     # the cover card is refused
    (.95, sweep(.5, 1500, 6000), .06, .2, .2),            # its reason is marked
    (1.60, tick(1175), .10, -.15, .4), (1.76, tick(1480), .10, .15, .4),   # the two steps land
    (3.05, sweep(1.0, 300, 4200), .20, 0, .3),            # the cover lifts away
    (3.55, thump(), .12, 0, .1),                           # the phone settles
    (5.00, tick(988), .16, 0, .3), (5.12, tick(784), .14, 0, .3),   # the error opens: a small falling pair
    (6.25, sweep(.8, 500, 3500), .12, 0, .3),             # the error lifts out
    (7.25, sweep(.5, 1500, 6000), .07, .2, .2),           # its reason is marked
    (9.70, sweep(.7, 3000, 400, False), .08, 0, .3),      # it settles back
    (10.55, sweep(1.0, 400, 3000), .18, -.3, .3),         # push to the POS
    (12.15, sweep(1.0, 600, 2500), .08, .2, .3),          # in to Cancel/Exit
    (13.15, tick(1175), .14, .2, .4),                     # the ring draws
    (13.90, sweep(.9, 2500, 500, False), .07, 0, .3),     # back out
    (15.10, tap(), .75, .15, .1),                         # the tap
    (15.40, click(), .30, .15, .15),                      # the screen changes to Home
    (15.95, sweep(1.0, 600, 2500), .08, -.2, .3),         # in to the table
    (16.85, tick(1320), .16, -.2, .4), (16.88, bell(hz('A5'), 1.6), .08, -.2, .6),   # B12/1 ringed
    (18.75, sweep(1.0, 400, 3000), .18, .3, .3),          # push back to the guest
    (19.95, sweep(1.5, 200, 5000), .06, 0, .4),           # a riser into the fix
    (20.35, tap(), .7, 0, .1),                           # Retry
    (20.52, sweep(.6, 2500, 600, False), .06, 0, .2),     # the card folds to checking
    (21.50, bell(hz('D6')), .16, -.15, .7), (21.62, bell(hz('F#6')), .13, .15, .7),   # the discount lands
    (22.25, sweep(.8, 500, 3500), .12, 0, .3),            # the bill lifts out
    (23.00, sweep(.5, 1500, 6000), .07, .2, .2),          # the discount is marked
    (24.70, sweep(.7, 3000, 400, False), .08, 0, .3),     # it settles back
    (25.35, sweep(1.0, 400, 3000), .18, -.3, .3),         # push to the D$ dialog
    (29.55, sweep(1.0, 400, 3000), .15, .3, .3),          # push to the recap
    (34.35, sweep(1.1, 250, 4500), .16, 0, .4),           # the end card rises
    (35.00, thump(), .10, 0, .3),
]
for t, sg, g, p, v in FX:
    add(sg, t, g, p, v, fx=True)

# ------------------------------------------------------------------ mix
def reverb(x, secs=2.3):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 3.0)
    ir = np.convolve(ir, np.ones(8) / 8, 'same')
    m = len(x) + n
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)] / np.sqrt(np.sum(ir ** 2))

VLr, VRr = reverb(VL), reverb(VR)
ta = np.arange(N) / SR
duck = np.ones(N)
for c, depth in ((15.1, .45), (15.4, .7), (20.35, .45), (21.5, .65), (16.85, .8), (5.0, .8)):
    d = np.where(ta < c, np.exp(-np.maximum(c - ta, 0) / .03), np.exp(-(ta - c) / .4))
    duck *= 1 - (1 - depth) * d
L = (ML + VLr * .45) * duck + FL + VLr * .1
R = (MR + VRr * .45) * duck + FR + VRr * .1

def hp(x, fc=32):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (f / np.sqrt(f ** 2 + fc ** 2)) ** 2, len(x))
L, R = hp(L), hp(R)
fade = np.clip(ta / .05, 0, 1) * np.clip((DUR - ta) / 1.6, 0, 1)
mix = np.stack([L, R], 1) * fade[:, None]
mix = np.tanh(mix * 1.5) / 1.5
mix *= .89 / np.max(np.abs(mix))
out = os.path.join(HERE, 'soundtrack.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
