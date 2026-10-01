# Dine with DISCOVERY Dollars — team films

Two playbooks for F&B team members on the floor, one set of rules, told from the
team member's side: what you see, what it means, what you do. Both are 4:5.

**`check-open-on-pos.mp4`** — 1080 × 1350, 60 fps (rendered at 2× and downscaled), 34 s,
stereo AAC at −14 LUFS. A guest shows you "Failed to apply discount on POS". What it
means, then three steps: find the check on the POS, tap Cancel/Exit (not Void, not
Make Payment), ask the guest to tap Retry. The same fix works for DISCOVERY Dollars.

**`forgotten-password.mp4`** — 1080 × 1350, 60 fps, 51 s. A guest can't sign in: show them
Forgot Password?, then the four steps exactly as MyMenu ships them (build of 30 Sep 2026,
13:08 GMT): **1** check the email and tap Send code, **2** enter the 6-digit
code from the email and tap Verify code, **3** choose a new password until every rule is
green and tap Reset password, **4** tap Yes, sign me in. They are back at the same table,
same bill, no new QR. Then the two things that go wrong: no code (check junk, then Resend
code when the timer ends) and an expired code (the app goes back a step: Send code again).

**`thumbnails/`** — each film's cover at 1080 × 1350. The cover is the film's first frame,
and it is embedded in each MP4 as its cover art.

**`storyboard/`** — both films shot by shot: every frame rendered from the film itself,
with the words on screen, what happens and what you hear. Open `storyboard/index.html`.

## The rules these films are made to

- **Colour: three.** Purple `#592A87` for the brand moments (the cover and the close, with
  white type and the white Cinnamon DISCOVERY logo, and the step label and rings in between),
  ink `#14102E` for type, paper `#FAFAFA` behind the product. Everything else is the
  product's own UI.
- **Alignment (4:5).** One statement, centred at the top of the frame (from y 58), with
  the product below it on the centre line, large and cropped by the bottom of the frame.
  Details lifted out of the phone are centred under the statement too. The close is a
  purple panel rising over everything: the rule, centred in the frame, then the white logo.
- **The cover is the thumbnail.** The first frame, on purple: the white logo, the situation
  in large white type centred above it, and the guest's phone showing the problem. The
  purple slides away with its words as the film starts, the phone settles up into place,
  and the first statement rises once the purple has cleared the top of the frame.
- **Type: the product's faces.** IvyMode states, Jost supports and numbers the step
  ("Step 2 of 4"). IvyMode is a high-contrast display cut: at video size its hairlines
  (the arm of a k, the thin stroke of an x) fall under a pixel and vanish, and some pairs
  touch (OV, RY, ck). So statements are tracked open by .035em and carry a hairline
  stroke in their own colour (.013em, so larger titles scale with it); the IvyMode text
  inside the phones gets the same treatment. Each line is its own mask, 36 px clear
  above and below, so no accent, ascender or descender is cut. `check-type.mjs` proves it.
- **Ground: flat.** No gradients, no blur.
- **Frame: one shot, one idea.** One statement, the product below it, large enough to
  read on a phone: the phone sits big and is cropped by the bottom of the frame; details
  that matter (the email's code, the password rules, the error, the bill) are lifted out
  and enlarged under the statement.
- **The product is real.** The password film's phone runs the mockup's own sign-in sheet
  (`../index.html`), driven frame by frame: typing lands a character at a time with a
  person's rhythm, the resend timer counts down, the rules tick green as the password
  meets them, a tap shows the button's own press and spinner, and the sheet closes with
  the modal's fade. The phone has iOS's status bar and Safari's toolbar.
- **Touch: a fingertip.** It comes in from below and to the right, as a thumb does, lands
  beside a button's label so the label stays readable, presses, and lifts away.
- **Motion: one family.** Moves glide (critically damped), arrivals settle on a soft spring,
  neighbours overlap. The only hard change is the POS repainting its screen, because that
  is what a POS does.
- **Music: 96 bpm**, smooth and effortless: electric piano, round bass, a brushed groove.
- **Sound: only what matters.** The taps, soft key clicks under the typing, the email
  arriving, and one chime when it works.

## Files

- `explainer.html`, `password.html` — the films; every frame is `render(t)`. `?t=12` holds a
  frame. Open them through a local server from the repository root
  (`npx http-server -p 8181 .`, then `/video/password.html`): the password film reaches into
  its phone's page, which needs the same origin. The POS is an illustration based on our
  POS's Pick Up Check and Home screens.
- `capture.mjs` — captures the check-open app states at 3× from `../index.html`, with
  IvyMode's hairlines strengthened as above.
- `capture-email.mjs [app root]` — renders the real reset-code email
  (`reference/email/password-reset-code.html`) at 640 px, 3×, into `assets/reset/email.png`,
  under the film's venue (Dreams & Beats).
- `audio.py check|password` — one engine, a score per film, and the few effects;
  writes `soundtrack.wav` or `soundtrack-password.wav`.
- `record.mjs` — serves the repository, renders through Chromium, encodes H.264, lays the
  soundtrack under it. `--film=password` for the second film. Run `audio.py` first.
  It also saves the cover to `thumbnails/` and embeds it as the MP4's cover art.
  `node video/record.mjs --film=password 4,12` writes stills; `--preview` writes a quick
  1×, 30 fps, silent `preview-*.mp4` for checking motion.
- `storyboard.mjs` — builds `storyboard/` from each film's `window.SHOTS`: a frame per
  shot, the words read off the frame, and the notes. Re-run it after changing a film.
- `check-type.mjs` — checks every statement in both films at rest: no line wraps, every
  line fits the frame, and nothing is clipped by its mask (each line is shot with its
  mask on and off; any pixel that differs was being cut off).

Paths to Playwright, Chromium and ffmpeg are set for the cloud container (`FFMPEG`
overrides ffmpeg; `pip install imageio-ffmpeg numpy` provides it and the audio's numpy).
