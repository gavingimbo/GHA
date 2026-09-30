# Explainer video — "Check is open on POS"

`check-open-on-pos.mp4` — 1080 × 1080, 30 fps, 31.5 s, silent. A team-facing
guide to the "Failed to apply discount on POS / Check is open on another
terminal" error: close the check on the POS, then the guest taps Retry.

- `capture.mjs` — captures the real app states (failed, checking, applied) at 3×
  from `../index.html` into `assets/`, with element rects in `assets/rects.json`.
  The discount bill row is removed from the pre-retry captures, since the POS has
  not taken the discount yet.
- `explainer.html` — the motion piece; every frame is `render(t)`. Open it in a
  browser to preview, or `?t=8.5` to hold a frame.
- `record.mjs` — renders each frame through Chromium and encodes H.264 with ffmpeg.
  `node video/record.mjs 4,12` writes review stills instead.

Paths to Playwright, Chromium and ffmpeg are set for the cloud container; adjust
them at the top of each script to run elsewhere.
