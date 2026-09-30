# Explainer video — "Check is open on POS"

`check-open-on-pos.mp4` — 1080 × 1440 (3:4), 60 fps (rendered at 2× and downscaled), 38.5 s, stereo AAC at −14 LUFS. A team-facing
guide to the "Failed to apply discount on POS / Check is open on another
terminal" error: minimise the check on the POS, then the guest taps Retry.

- `capture.mjs` — captures the real app states (failed, checking, applied) at 3×
  from `../index.html` into `assets/`, with element rects in `assets/rects.json`.
  The discount bill row is removed from the pre-retry captures, since the POS has
  not taken the discount yet.
- `explainer.html` — the motion piece. Step one rebuilds our POS's Pick Up Check
  and Home screens in HTML at the terminal's native 1802 × 1014 (team member names
  and the workstation address replaced with placeholders); every frame is `render(t)`. Open it in a
  browser to preview, or `?t=8.5` to hold a frame.
- `audio.py` — the soundtrack and sound effects, synthesised (no licensed music):
  a 96 bpm D major bed that turns to B minor while the error is on screen and
  resolves when the discount lands, plus whooshes on camera moves, a tap on Retry,
  ticks on highlights and a chime on success. Writes `soundtrack.wav` (not committed).
- `audit.mjs` — renders the timeline small and flags frames that jump; run it after
  changing timings, then diff the frames (see the commit that added it).
- `record.mjs` — renders each frame through Chromium, encodes H.264 with ffmpeg,
  then lays `soundtrack.wav` underneath. Run `python3 video/audio.py` first.
  `node video/record.mjs 4,12` writes review stills instead.

Paths to Playwright, Chromium and ffmpeg are set for the cloud container; adjust
them at the top of each script to run elsewhere.
