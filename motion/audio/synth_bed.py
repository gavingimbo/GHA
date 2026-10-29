"""Synthesise the 60-second soundtrack for the Dine with DISCOVERY film.

112 BPM, 4/4, a corporate instrumental: soft pad, a piano-like pluck, bass, light
percussion. The arrangement follows the story in motion/storyboard.md:
  0:00-0:05  the hook: pad and pluck, hats arrive, a riser into the numbers
  0:05-0:12  the numbers: full groove
  0:12-0:52  the demo: steady groove, lower under the voice
  0:52-0:57  the close: the groove lifts, a riser into the logo
  0:57       the hit, then a held chord

Tap clicks, whooshes and hits come from film/src/timeline.json, the same file the
film reads, so sound and picture stay in step.
"""
import json
import sys
import wave
import numpy as np

SR = 44100
BPM = 112.0
DUR = 60.0
BEAT = 60.0 / BPM
BAR = BEAT * 4

CHORDS = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]]  # D  A  Bm  G
BASS = [38, 33, 35, 31]
TIMELINE = json.load(open(sys.argv[2] if len(sys.argv) > 2 else '../film/src/timeline.json'))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def add(buf, start, sig):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(i + len(sig), len(buf))
    buf[i:j] += sig[: j - i]


def env(n, a, r):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), min(n, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(f, n):
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * h * t + 0.3 * h) for h, a in [(1, 1), (2, .35), (3, .18), (4, .08)])
    return s * env(n, 0.8, 1.0)


def pluck(f, n, decay=3.2):
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * h * t) for h, a in [(1, 1), (2, .5), (3, .22), (5, .08)])
    return s * np.exp(-t * decay) * env(n, 0.004, 0.12)


def kick(n):
    t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(120 * np.exp(-t * 20) + 46) / SR
    return np.sin(ph) * np.exp(-t * 13)


def clap(n, rng):
    t = np.arange(n) / SR
    return np.diff(rng.standard_normal(n), prepend=0) * np.exp(-t * 28)


def hat(n, rng):
    t = np.arange(n) / SR
    return np.diff(rng.standard_normal(n), prepend=0) * np.exp(-t * 110)


def whoosh(dur, rise=True, rng=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweep a simple one-pole low-pass up (rise) or down
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        p = i / n
        c = 0.02 + 0.5 * (p if rise else 1 - p) ** 2
        y += c * (noise[i] - y)
        out[i] = y
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return out * shape


def tick(rng):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1900 * t) * 0.7 + np.diff(rng.standard_normal(n), prepend=0) * 0.25) * np.exp(-t * 90)


def build():
    rng = np.random.default_rng(11)
    out = np.zeros(int(DUR * SR) + 2 * SR)
    bars = int(DUR / BAR) + 1

    def level(t):
        # under the voice in the demo, lifting at the close
        if 12 <= t < 52:
            return 0.8
        if t >= 52:
            return 1.0
        return 0.95

    for b in range(bars):
        t0 = b * BAR
        if t0 >= DUR:
            break
        chord = CHORDS[b % 4]
        for m in chord:
            add(out, t0, 0.05 * pad(hz(m), int(BAR * SR) + int(0.4 * SR)) * level(t0))
        # bass: pulse on the root
        if t0 >= 1.5:
            for k in range(8):
                ts = t0 + k * BEAT / 2
                if ts < DUR:
                    add(out, ts, 0.11 * level(ts) * pluck(hz(BASS[b % 4]), int(BEAT * SR), 5.5))
        # piano arpeggio, eighth notes, from 2s
        pattern = [chord[0], chord[1], chord[2], chord[1]] * 2
        for k, m in enumerate(pattern):
            ts = t0 + k * BEAT / 2
            if 2.0 <= ts < DUR:
                add(out, ts, 0.15 * level(ts) * pluck(hz(m + 12), int(BEAT * 1.6 * SR)))

    # Percussion
    rng_p = np.random.default_rng(5)
    beat = 0
    while beat * BEAT < DUR:
        t = beat * BEAT
        lv = level(t)
        if t >= 5.0:
            if (beat % 4 in (0, 2)) or t >= 52.0:
                add(out, t, 0.24 * lv * kick(int(0.4 * SR)))
            if beat % 4 in (1, 3):
                add(out, t, 0.07 * lv * clap(int(0.18 * SR), rng_p))
        if t >= 3.0:
            for k in range(4 if t >= 5.0 else 2):
                add(out, t + k * BEAT / 4 * (1 if t >= 5.0 else 2), 0.03 * lv * hat(int(0.06 * SR), rng_p))
        beat += 1

    # Risers into the numbers and into the closing logo
    for start, end in [(2.8, 5.0), (54.4, 56.8)]:
        w = whoosh(end - start, True, rng) * 0.35
        add(out, start, w)

    # Whooshes and tap clicks from the shared timeline
    for i, wt in enumerate(TIMELINE['whooshes']):
        add(out, wt - 0.25, 0.22 * whoosh(0.6, i % 2 == 0, rng))
    for tap in TIMELINE['taps']:
        add(out, tap['t'], 0.5 * tick(rng))

    # The hit and the held chord on the closing logo
    for h in TIMELINE['hits']:
        t = np.arange(int(2.6 * SR)) / SR
        add(out, h, 0.55 * np.sin(2 * np.pi * (62 * np.exp(-t * 3) + 36) * t) * np.exp(-t * 2.2))
        for m in CHORDS[0]:
            add(out, h, 0.06 * pad(hz(m), int((DUR - h) * SR + 0.5 * SR)))

    out = out[: int(DUR * SR)]
    fade = int(0.6 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    out[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))
    return out / np.max(np.abs(out)) * 0.7


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'bed.wav'
    write_wav(path, build())
    print('wrote', path)
