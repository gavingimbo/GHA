# Dine with DISCOVERY Dollars — team films

Two playbooks for F&B team members on the floor, one set of rules, told from the
team member's side: what you see, what it means, what you do.

**`check-open-on-pos.mp4`** — 1080 × 1440 (3:4), 60 fps (rendered at 2× and downscaled), 34 s,
stereo AAC at −14 LUFS. A guest shows you "Failed to apply discount on POS". What it
means, then three steps: find the check on the POS, tap Cancel/Exit (not Void, not
Make Payment), ask the guest to tap Retry. The same fix works for DISCOVERY Dollars.

**`forgotten-password.mp4`** — 1080 × 1440, 60 fps, 51 s. A guest can't sign in: show them
Forgot Password?, then the four steps exactly as MyMenu ships them (build of 30 Sep 2026,
13:08 GMT): **1** check the email or username and tap Send code, **2** enter the 6-digit
code from the email and tap Verify code, **3** choose a new password until every rule is
green and tap Reset password, **4** Password updated: tap Yes, sign me in. They are back at
the same table, same bill, no new QR. Then the two things that go wrong: no code (check
junk, then Resend code when the timer ends) and an expired code (the app goes back a step:
Send code again).

## The rules these films are made to

- **Colour: three.** Purple `#592A87` for brand moments (open and close), ink `#14102E`
  for type, paper `#FAFAFA` behind the product. Everything else is the product's own UI.
- **Type: Proxima Nova.** Bold states, regular supports, semibold numbers the step
  ("Step 2 of 4"). See *Proxima Nova* below.
- **Ground: flat.** No gradients, no blur.
- **Frame: one shot, one idea.** One statement above, the product below, large enough to
  read on a phone: the phone sits big and is cropped by the bottom of the frame; details
  that matter (the email's code, the password rules) are lifted out and enlarged.
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

## Proxima Nova

Proxima Nova is licensed, so it is not committed. To render with it, put the licensed web
fonts in `assets/fonts/` as `proxima-nova-400.woff2`, `proxima-nova-600.woff2` and
`proxima-nova-700.woff2` (Regular, Semibold, Bold) and re-render; nothing else changes. A
machine with Proxima Nova installed is picked up through `local()` first. Until then the
films use Figtree (SIL OFL, `assets/fonts/standin/`), the closest open-licence match, so
the layout is already set for Proxima Nova. `record.mjs` prints which face it used.
(Cinnamon's website serves Proxima Nova from an Adobe Fonts kit licensed to that site; it
is not taken from there.)

## Files

- `explainer.html`, `password.html` — the films; every frame is `render(t)`. `?t=12` holds a
  frame. Open them through a local server from the repository root
  (`npx http-server -p 8181 .`, then `/video/password.html`): the password film reaches into
  its phone's page, which needs the same origin. The POS is an illustration based on our
  POS's Pick Up Check and Home screens.
- `assets/fonts/brand.css` — the films' type (Proxima Nova, with the stand-in).
- `capture.mjs` — captures the check-open app states at 3× from `../index.html`.
- `capture-email.mjs [app root]` — renders the real reset-code email
  (`reference/email/password-reset-code.html`) at 640 px, 3×, into `assets/reset/email.png`,
  under the film's venue (Dreams & Beats).
- `audio.py check|password` — one engine, a score per film, and the few effects;
  writes `soundtrack.wav` or `soundtrack-password.wav`.
- `record.mjs` — serves the repository, renders through Chromium, encodes H.264, lays the
  soundtrack under it. `--film=password` for the second film. Run `audio.py` first.
  `node video/record.mjs --film=password 4,12` writes stills; `--preview` writes a quick
  1×, 30 fps, silent `preview-*.mp4` for checking motion.

Paths to Playwright, Chromium and ffmpeg are set for the cloud container (`FFMPEG`
overrides ffmpeg; `pip install imageio-ffmpeg numpy` provides it and the audio's numpy).
