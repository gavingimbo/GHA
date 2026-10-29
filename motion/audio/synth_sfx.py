"""Interaction sound only (no music) for the film, timed from film/src/timeline.json:
chat pops, whooshes on scene moves, taps, typing clicks, a success chime and the closing hit.
Music and voiceover are added separately."""
import json, sys
import numpy as np
from synth_bed import SR, DUR, add, whoosh, tick, pad, hz, write_wav

T = json.load(open(sys.argv[2] if len(sys.argv) > 2 else '../film/src/timeline.json'))
rng = np.random.default_rng(3)
W = T.get('warp')
def outt(x):
    # story time to output time, the inverse of the film's warp
    if not W: return x
    for (o0, s0), (o1, s1) in zip(W, W[1:]):
        if s0 <= x <= s1: return o0 + (x - s0) * (o1 - o0) / (s1 - s0)
    return x
_add = add
def add(buf, start, sig): _add(buf, outt(start), sig)
DUR = W[-1][0] if W else DUR
out = np.zeros(int(DUR * SR) + SR)


def tone(f, d, decay):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * decay)

for p in T['pops']:
    add(out, p, 0.35 * tone(880, 0.15, 30) + 0.2 * tone(1320, 0.15, 40))
for i, w in enumerate(T['whooshes']):
    add(out, w - 0.3, 0.45 * whoosh(0.7, i % 2 == 0, rng))
for tap in T['taps']:
    add(out, tap['t'], 0.6 * tick(rng))
for a, b, rate in T['typing']:
    k = a
    while k < b:
        add(out, k, 0.18 * tick(rng)); k += 1 / rate
for c in T['chimes']:
    for j, m in enumerate([74, 78, 81]):
        add(out, c + j * 0.09, 0.22 * tone(hz(m), 1.2, 3.5))
for h in T['hits']:
    t = np.arange(int(2.6 * SR)) / SR
    add(out, h, 0.5 * np.sin(2 * np.pi * (62 * np.exp(-t * 3) + 36) * t) * np.exp(-t * 2.2))
    for m in [74, 78, 81, 86]:
        add(out, h, 0.08 * tone(hz(m), 3.0, 1.2))
out = out[: int(DUR * SR)]
write_wav(sys.argv[1], out / np.max(np.abs(out)) * 0.8)
print('wrote', sys.argv[1])
