"""
Synthesises the 30-second score for index.html into audio/score.wav.

Everything is generated here (no samples, nothing to license): a warm pad on a
four-chord loop, a soft arpeggio, and sub-kick / whoosh / chime accents placed
on the cuts in the timeline. Hit times mirror the scene timings in index.html.

    python3 video/score.py
"""
import os
import wave
import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a, r, hold=0.0):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4))
    rel = np.clip((x - a - hold) / r, 0, None)
    return e * np.exp(-4 * rel) if r > 0 else e


def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def lowpass(x, cutoff):
    # one-pole, run twice
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        for k in range(len(x)):
            acc = (1 - a) * x[k] + a * acc
            y[k] = acc
        x = y
    return x


# ----------------------------------------------------------------- pad
# D major colour: Dmaj9 · Bm9 · Gmaj9 · A6sus — each 4 s, looping.
chords = [
    [50, 57, 62, 64, 66, 69],
    [47, 54, 59, 61, 62, 66],
    [43, 50, 55, 57, 59, 62],
    [45, 52, 57, 59, 62, 64],
]
bar = 4.0
pad_start = 3.9          # pad arrives with the photo
for c in range(8):
    start = pad_start + c * bar - 0.3
    if start >= DUR:
        break
    notes = chords[c % 4]
    n = int((bar + 1.6) * SR)
    x = np.arange(n) / SR
    e = np.minimum(1, x / 1.1) * np.clip((bar + 1.6 - x) / 1.4, 0, 1)
    for j, m in enumerate(notes):
        f = midi(m)
        for det, pan in ((-0.07, -0.6), (0.07, 0.6)):
            ff = f * 2 ** (det / 12)
            s = (np.sin(2 * np.pi * ff * x) + 0.35 * np.sin(4 * np.pi * ff * x + 0.3)
                 + 0.12 * np.sin(6 * np.pi * ff * x + 1.1))
            add(s * e, start, pan=pan * (0.3 + 0.1 * j), gain=0.020)

# Intro: a single low drone under the word beats.
x = np.arange(int(4.4 * SR)) / SR
drone = (np.sin(2 * np.pi * midi(38) * x) + 0.4 * np.sin(2 * np.pi * midi(45) * x)) * np.minimum(1, x / 0.8) * np.clip((4.4 - x) / 0.6, 0, 1)
add(drone, 0.0, gain=0.05)

# ----------------------------------------------------------------- arpeggio
# Soft pluck in eighth notes at 120 bpm from the phone entrance onwards.
step = 0.25
arp_on = [(8.5, 17.4), (22.45, 27.4)]
k = 0
tt = 8.5
while tt < 27.4:
    if any(a <= tt < b for a, b in arp_on):
        c = chords[int((tt - pad_start) // bar) % 4]
        pattern = [c[2] + 12, c[3] + 12, c[4] + 12, c[5] + 12, c[4] + 12, c[3] + 12]
        m = pattern[k % len(pattern)]
        n = int(0.9 * SR)
        x = np.arange(n) / SR
        s = np.sin(2 * np.pi * midi(m) * x) * np.exp(-x * 6) + 0.25 * np.sin(4 * np.pi * midi(m) * x) * np.exp(-x * 11)
        add(s, tt, pan=0.45 * np.sin(k * 0.9), gain=0.045 * (0.8 + 0.2 * (k % 2 == 0)))
    k += 1
    tt += step

# ----------------------------------------------------------------- accents
def kick(at, gain=0.5):
    n = int(0.6 * SR)
    x = np.arange(n) / SR
    f = 42 + 90 * np.exp(-x * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    add(np.sin(ph) * np.exp(-x * 7), at, gain=gain)


def whoosh(end, length=0.9, gain=0.10):
    n = int(length * SR)
    noise = rng.standard_normal(n)
    s = lowpass(noise, 2200)
    x = np.arange(n) / n
    add(s * x ** 2.5 * (1 - np.clip((x - 0.95) / 0.05, 0, 1)), end - length, gain=gain)


def chime(at, notes, gain=0.05):
    for j, m in enumerate(notes):
        n = int(2.4 * SR)
        x = np.arange(n) / SR
        f = midi(m)
        s = (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 5)) * np.exp(-x * 1.6)
        add(s, at + j * 0.07, pan=(-0.3 + 0.3 * j), gain=gain)


for at in (0.25, 1.3, 2.35):
    kick(at, 0.35)
    chime(at, [74], 0.03)
chime(3.35, [74, 78, 81], 0.035)
whoosh(4.25, 0.9, 0.08)
kick(4.25, 0.55)
kick(8.55, 0.4)
kick(12.9, 0.3)
kick(14.05, 0.45)
for i in range(15):                       # count-up ticks, easing like the number
    at = 14.05 + 1.45 * (1 - (1 - (i + 1) / 15) ** 2.2)
    n = int(0.05 * SR)
    x = np.arange(n) / SR
    add(np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 120), at, pan=0.3, gain=0.03)
whoosh(17.6, 0.8, 0.09)
kick(17.6, 0.5)
chime(19.15, [81, 86], 0.03)
whoosh(22.1, 0.7, 0.08)
kick(22.5, 0.45)
chime(23.9, [78, 81, 86], 0.05)            # redemption lands
kick(25.6, 0.35)
whoosh(27.55, 0.9, 0.09)
kick(27.6, 0.55)
chime(28.15, [62, 69, 74, 78], 0.04)

# ----------------------------------------------------------------- master
mix = np.stack([L, R], axis=1)
fade = np.ones(N)
fade[: int(0.15 * SR)] = np.linspace(0, 1, int(0.15 * SR))
fi = int(28.9 * SR)
fade[fi:] = np.linspace(1, 0, N - fi) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)       # gentle glue
mix /= np.max(np.abs(mix)) / 0.89
pcm = (mix * 32767).astype('<i2')
os.makedirs(os.path.join(os.path.dirname(__file__), 'audio'), exist_ok=True)
out = os.path.join(os.path.dirname(__file__), 'audio', 'score.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(out)
