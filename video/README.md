# Dine with DISCOVERY Dollars — team film

`check-open-on-pos.mp4` — 1080 × 1440 (3:4), 60 fps (rendered at 2× and downscaled), 34 s,
stereo AAC at −14 LUFS. A team film for one moment in Dine with D$: a guest shows you
"Failed to apply discount on POS". What you see, what it means, what you do on the POS,
and what the guest does next.

## The rules this film is made to

- **Colour: three.** Purple `#592A87` for brand moments (open and close), ink `#14102E`
  for type, paper `#FAFAFA` behind the product. Everything else is the product's own UI.
- **Type: the product's faces.** IvyMode states, Jost supports. Two sizes.
- **Ground: flat.** No gradients, no blur, nothing fades.
- **Frame: one shot, one idea.** The object in the centre, one statement above, room to breathe.
- **Motion: one family.** Moves glide (critically damped), arrivals settle on a soft spring,
  neighbours overlap. Scenes are joined by a lift, a push or a wipe, never cut; the only hard
  change is the POS repainting its screen, because that is what a POS does.
- **Rhythm: adaptive.** Steady as the guest shows you the error, held on what it means,
  precise through the fix on the POS, a lift when the discount lands, calm at the close.
- **Music: 96 bpm**, smooth and effortless: electric piano, round bass, a brushed groove.
- **Sound: only what matters.** The two taps that fix it (Cancel/Exit, Retry) and one chime
  when the discount lands. Nothing else.

## Files

- `explainer.html` — the film; every frame is `render(t)`. `?t=12` holds a frame.
  The POS is an illustration based on our POS's Pick Up Check and Home screens.
- `capture.mjs` — captures the app states at 3× from `../index.html`.
- `audio.py` — the score and the few effects, synthesised. Writes `soundtrack.wav`.
- `record.mjs` — renders through Chromium, encodes H.264, lays the soundtrack under it.
  Run `python3 video/audio.py` first. `node video/record.mjs 4,12` writes stills.
- `audit.mjs` — renders the timeline small, to check for jumps and empty frames.

Paths to Playwright, Chromium and ffmpeg are set for the cloud container.
