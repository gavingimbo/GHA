"""Synthesise the 60-second music bed for the Dine with DISCOVERY film.

100 BPM, 4/4, a corporate instrumental: soft pad, a piano-like pluck, light
percussion. Timings follow motion/storyboard.md:
  0:00-0:04  pad only (logo)
  0:04-0:37  full bed
  0:37-0:41  breath: one held note, nothing else
  0:41-0:57  full bed
  0:57       closing chord and hit (Finale)
"""
import sys
import numpy as np
import wave

SR = 44100
BPM = 100.0
DUR = 60.0
BEAT = 60.0 / BPM
BAR = BEAT * 4

# I - vi - IV - V in D major, voiced low to keep the mids clear
CHORDS = [
    [62, 66, 69],   # D major (D4 F#4 A4)
    [59, 62, 66],   # B minor
    [55, 59, 62],   # G major
    [57, 61, 64],   # A major
]
BASS = [38, 35, 31, 33]  # D2, B1, G1, A1


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def env_adsr(n, a, d, s, r, sr=SR):
    t = np.arange(n) / sr
    e = np.ones(n)
    na = int(a * sr)
    nd = int(d * sr)
    nr = min(int(r * sr), n)
    e[:na] = np.linspace(0, 1, na) if na else e[:na]
    if nd:
        e[na:na + nd] = np.linspace(1, s, nd)
    e[na + nd:] = s
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def add(buf, start_s, sig):
    i = int(start_s * SR)
    j = min(i + len(sig), len(buf))
    buf[i:j] += sig[: j - i]


def pad(freq, n):
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for h, amp in [(1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08)]:
        sig += amp * np.sin(2 * np.pi * freq * h * t + 0.3 * h)
    return sig * env_adsr(n, 0.9, 0.4, 0.8, 1.0)


def pluck(freq, n):
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for h, amp in [(1, 1.0), (2, 0.5), (3, 0.22), (5, 0.08)]:
        sig += amp * np.sin(2 * np.pi * freq * h * t)
    decay = np.exp(-t * 3.2)
    return sig * decay * env_adsr(n, 0.004, 0.02, 0.6, 0.15)


def kick(n):
    t = np.arange(n) / SR
    f = 110 * np.exp(-t * 18) + 45
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.exp(-t * 14)


def shaker(n, rng):
    noise = rng.standard_normal(n)
    # crude high-pass: first difference
    hp = np.diff(noise, prepend=0)
    return hp * np.exp(-np.arange(n) / SR * 90)


def build():
    rng = np.random.default_rng(7)
    out = np.zeros(int(DUR * SR) + SR)

    # Pads: each chord held for a bar, the whole film
    for bar in range(int(DUR / BAR) + 1):
        t0 = bar * BAR
        if t0 >= DUR:
            break
        chord = CHORDS[bar % 4]
        n = int(BAR * SR) + int(0.5 * SR)
        for m in chord:
            vol = 0.05 if t0 < 37 or t0 >= 41 else 0.035
            add(out, t0, vol * pad(midi_hz(m), n))

    # Bass: root on each beat-one, quiet
    for bar in range(int(DUR / BAR) + 1):
        t0 = bar * BAR
        if t0 >= DUR:
            break
        if 37 <= t0 < 41:
            continue
        n = int(BEAT * 2 * SR)
        add(out, t0, 0.10 * pluck(midi_hz(BASS[bar % 4]), n))

    # Piano arpeggio: 8th notes through the chord tones, skipped in the breath
    for bar in range(int(DUR / BAR) + 1):
        t0 = bar * BAR
        if t0 >= DUR:
            break
        chord = CHORDS[bar % 4]
        pattern = [chord[0], chord[1], chord[2], chord[1]] * 2
        for k, m in enumerate(pattern):
            ts = t0 + k * BEAT / 2
            if ts >= DUR:
                break
            if 37 <= ts < 41:
                continue
            if ts < 4:
                continue  # logo: pad only
            add(out, ts, 0.16 * pluck(midi_hz(m + 12), int(BEAT * 1.5 * SR)))

    # Percussion: kick on 1 and 3, shaker on the offbeat 8ths. Not in the breath.
    beat_idx = 0
    t = 0.0
    while t < DUR:
        in_breath = 37 <= t < 41
        in_intro = t < 4
        if not in_breath and not in_intro:
            if beat_idx % 4 in (0, 2):
                add(out, t, 0.22 * kick(int(0.4 * SR)))
            add(out, t + BEAT / 2, 0.035 * shaker(int(0.08 * SR), rng))
        beat_idx += 1
        t = beat_idx * BEAT

    # Breath: one held note on D4 across 37-41
    add(out, 37.0, 0.07 * pad(midi_hz(62), int(4.0 * SR)))

    # Closing chord and hit on 57
    closing = int(3.0 * SR)
    for m in CHORDS[0]:
        add(out, 57.0, 0.07 * pad(midi_hz(m), closing + int(1.5 * SR)))
    t = np.arange(int(2.5 * SR)) / SR
    hit = 0.5 * np.sin(2 * np.pi * (60 * np.exp(-t * 3) + 36) * t) * np.exp(-t * 2.2)
    add(out, 57.0, hit)

    out = out[: int(DUR * SR)]
    # Gentle fades at the ends
    fade = int(0.5 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    out[:fade] *= np.linspace(0, 1, fade)

    # Normalise: peak at -3 dBFS, then bring RMS toward about -17 dBFS
    peak = np.max(np.abs(out))
    out = out / peak * 0.707
    rms = np.sqrt(np.mean(out ** 2))
    target = 10 ** (-17 / 20)
    gain = min(target / rms, 0.707 / np.max(np.abs(out)))
    out = out * gain
    return out


def write_wav(path, x):
    pcm = np.clip(x, -1, 1)
    pcm = (pcm * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    out_path = sys.argv[1] if len(sys.argv) > 1 else 'bed.wav'
    write_wav(out_path, build())
    print('wrote', out_path)
