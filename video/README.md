# Dine with D$ — 30-second film

An Apple-style motion piece for Cinnamon DISCOVERY dining, built from this
repo's own material: the production cover photograph, 3× captures of the
mockup's screens (`video/screens/`, rendered by `reference/capture.mjs
--scale=3`), and the GHA DISCOVERY tier cards from `design/png/`.

**Output:** `out/dine-with-d-30s.mp4` — 1920 × 1080, 60 fps, H.264 + AAC, 30 s.

## Storyboard

| Time | Scene |
| --- | --- |
| 0 – 4 s | **Dine. Earn. Redeem.** One word at a time on black, then together. |
| 4 – 8.6 s | The cover photograph opens from a card to full frame; *Dine with D$*. |
| 8.6 – 13 s | The phone rises: **Scan the QR at your table.** Guest landing → member landing. |
| 13 – 17.6 s | Phone swings left, bill on screen; **Up to 15%** counts up as the discount row is spotlit. |
| 17.6 – 22.6 s | White: **Earn 4–7% back in D$**; Silver, Gold, Platinum, and Titanium cards fan out. |
| 22.6 – 25.6 s | **Then pay with them. D$1 = USD 1.** The redemption confirms on screen. |
| 25.6 – 27.6 s | **24 restaurants. Four hotels.** Venue names drift past; the four hotels beneath. |
| 27.6 – 30 s | End card on the photograph: *Dine with D$*, cinnamonhotels.com, Terms & Conditions apply. |

Figures come from the live copy deck (`js/data.js`) and the Offer terms
(`js/terms.js`): up to 15% off, 4–7% back, D$1 = USD 1, and 24 participating
restaurants across Cinnamon Grand Colombo, Cinnamon Life at City of Dreams Sri
Lanka, Cinnamon Lakeside Colombo, and Cinnamon Red Colombo.

## Files

- `index.html` — the film. Open it through any static server from the repo root
  (`npx http-server -p 8181 .` → `/video/`) to preview with a scrub bar. Every
  frame is a pure function of time via `window.seek(t)`.
- `render.mjs` — seeks frame by frame in headless Chromium and pipes PNGs into
  ffmpeg. `--stills=1,5,14` writes stills to `out/stills/` instead.
- `score.py` — synthesises the soundtrack to `audio/score.wav` (generated, no
  samples or licensed music). Hits line up with the cuts in `index.html`.
- `fonts/` — Manrope and Fraunces (SIL OFL), vendored so renders work offline.

## Re-rendering

```
npm i --no-save playwright-core
pip install numpy imageio-ffmpeg      # or have ffmpeg on PATH
python3 video/score.py
node video/render.mjs                 # ~1,800 frames
```

To swap in licensed music, replace `audio/score.wav` (30 s) and re-run
`render.mjs`, or mux it onto the existing MP4 with ffmpeg.
