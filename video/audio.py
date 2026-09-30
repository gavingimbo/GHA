"""Scores and sound for the team films, synthesised here so there is no licensing
to clear. One engine, one voice for every film; each film has its own score,
timed to its picture (times in seconds).

    python3 video/audio.py check      # writes video/soundtrack.wav          (check is open on the POS)
    python3 video/audio.py password   # writes video/soundtrack-password.wav (forgotten password)

Music: 96 bpm (2.5 s bars) in D major, the "smooth, effortless" range. An electric
piano carries the harmony with a brushed groove (kick, soft snap, hats) and a round
bass; a marimba motif asks a question on the brand open and answers it on the
film's resolution; bells resolve on the mark. Sound effects are only the actions
that matter (the taps you see, a notification where one arrives, one chime on
success), and the music ducks under them so they read.
"""
import os
import sys
import wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(11)
DUR = N = 0
ML = MR = FL = FR = VL = VR = None


def start(dur):
    global DUR, N, ML, MR, FL, FR, VL, VR
    DUR, N = dur, int(SR * dur)
    ML, MR = np.zeros(N), np.zeros(N)        # music
    FL, FR = np.zeros(N), np.zeros(N)        # effects
    VL, VR = np.zeros(N), np.zeros(N)        # reverb send


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


# ------------------------------------------------------------------ the scores
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
Dmaj9, D69 = ['F#3', 'A3', 'C#4', 'E4'], ['F#3', 'A3', 'B3', 'E4']
Em9, A7s = ['D3', 'G3', 'B3', 'E4'], ['C#3', 'G3', 'B3', 'E4']
Gmaj9, Bm9, Fsm = ['D3', 'F#3', 'B3', 'E4'], ['D3', 'F#3', 'A3', 'C#4'], ['D3', 'F#3', 'A3', 'E4']

FILMS = {
    # A guest shows you "Failed to apply discount on POS"
    'check': dict(
        dur=34.0, out='soundtrack.wav',
        score=[('D2', Dmaj9, 'open'), ('D2', Dmaj9, 'groove'), ('E2', Em9, 'drop'), ('A1', A7s, 'drop'),
               ('G1', Gmaj9, 'build'), ('A1', A7s, 'build'), ('F#1', Fsm, 'build'), ('B1', Bm9, 'build'),
               ('G1', Gmaj9, 'lift'), ('D2', Dmaj9, 'full'), ('G1', Gmaj9, 'full'), ('A1', A7s, 'open'),
               ('D2', Dmaj9, 'end'), ('D2', Dmaj9, 'tail')],
        answer=9 * BAR, mark=30.0,
        fx=[(14.30, 'tap', .6, .15), (20.80, 'tap', .6, 0), (22.50, 'success', 1, 0)],
    ),
    # A guest has forgotten their password
    'password': dict(
        dur=31.0, out='soundtrack-password.wav',
        score=[('D2', Dmaj9, 'open'), ('D2', D69, 'groove'), ('B1', Bm9, 'groove'), ('G1', Gmaj9, 'groove'),
               ('E2', Em9, 'build'), ('A1', A7s, 'build'), ('F#1', Fsm, 'build'), ('G1', Gmaj9, 'lift'),
               ('D2', Dmaj9, 'full'), ('G1', Gmaj9, 'groove'), ('A1', A7s, 'open'), ('D2', Dmaj9, 'end'),
               ('D2', Dmaj9, 'tail')],
        answer=8 * BAR, mark=27.5,
        fx=[(7.25, 'tap', .5, .1), (9.25, 'tap', .5, 0), (10.10, 'notify', 1, .2), (18.45, 'tap', .55, 0),
            (20.00, 'success', 1, 0)],
    ),
}
STABS = [(0, 1.6, 1.0), (1.5, .5, .7), (2.5, .9, .8), (3.5, .45, .6)]   # beat, length, velocity
PANS = (-.3, -.1, .1, .3)


def play_score(score):
    for b, (root, voicing, sec) in enumerate(score):
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
                if tq < 2.5: continue
                if q in (0, 2) or (sec == 'full' and q == 3 and b % 2): add(kick(), tq, .15)
                if sec in ('build', 'lift', 'full') and q in (1, 3): add(snap(), tq, .06, .1, .3)
                add(hat(), tq, .03, .35); add(hat(), tq + BEAT / 2, .05, .35)
            if sec == 'full':
                for s16 in range(16): add(hat(), t0 + s16 * BEAT / 4 + .01, .012, -.4)
        elif sec == 'drop':
            add(kick(), t0, .14)


def play_motif(answer, mark):
    # a question on the brand open, the answer on the film's resolution, resolved on the mark
    for i, (n, beat) in enumerate([('F#5', 0), ('A5', .5), ('E5', 1.5), ('D5', 2.5)]):
        add(marimba(hz(n), 1.6), .3 + beat * BEAT, .08, (-.2, .2, -.1, .1)[i], .6)
    for i, (n, beat) in enumerate([('D5', 0), ('F#5', .5), ('A5', 1), ('D6', 1.5)]):
        add(marimba(hz(n), 1.6), answer + beat * BEAT, .07, (-.2, .2, -.1, .1)[i], .6)
    for i, (n, d) in enumerate([('A5', 0), ('D6', .18), ('F#6', .36)]):
        add(bell(hz(n), 3.0), mark + d, .05, (-.2, 0, .2)[i], .8)


def play_fx(fx):
    for t, kind, g, p in fx:
        if kind == 'tap':
            add(tap(), t, g, p, .1, fx=True)
        elif kind == 'notify':            # an email arrives: two soft notes, as a phone would
            add(bell(hz('B5'), 1.2), t, .17 * g, p, .5, fx=True); add(bell(hz('E6'), 1.4), t + .13, .15 * g, p, .5, fx=True)
        elif kind == 'success':           # it worked
            add(bell(hz('D6')), t, .14 * g, -.15, .7, fx=True); add(bell(hz('F#6')), t + .12, .11 * g, .15, .7, fx=True)


# ------------------------------------------------------------------ mix
def reverb(x, secs=2.3):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 3.0)
    ir = np.convolve(ir, np.ones(8) / 8, 'same')
    m = len(x) + n
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)] / np.sqrt(np.sum(ir ** 2))


def hp(x, fc=32):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (f / np.sqrt(f ** 2 + fc ** 2)) ** 2, len(x))


def make(name):
    film = FILMS[name]
    start(film['dur'])
    play_score(film['score']); play_motif(film['answer'], film['mark']); play_fx(film['fx'])
    VLr, VRr = reverb(VL), reverb(VR)
    ta = np.arange(N) / SR
    duck = np.ones(N)
    for t, kind, g, p in film['fx']:
        depth = .65 if kind == 'success' else .5 if g >= .5 else .75
        d = np.where(ta < t, np.exp(-np.maximum(t - ta, 0) / .03), np.exp(-(ta - t) / .4))
        duck *= 1 - (1 - depth) * d
    L = hp((ML + VLr * .45) * duck + FL + VLr * .1)
    R = hp((MR + VRr * .45) * duck + FR + VRr * .1)
    fade = np.clip(ta / .05, 0, 1) * np.clip((DUR - ta) / 1.6, 0, 1)
    mix = np.stack([L, R], 1) * fade[:, None]
    mix = np.tanh(mix * 1.5) / 1.5
    mix *= .89 / np.max(np.abs(mix))
    out = os.path.join(HERE, film['out'])
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype('<i2').tobytes())
    print('wrote', out)


if __name__ == '__main__':
    make(sys.argv[1] if len(sys.argv) > 1 else 'check')
