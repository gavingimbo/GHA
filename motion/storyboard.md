# Dine with DISCOVERY: motion storyboard (v2)

A 60-second film for the Cinnamon Hotels & Resorts Town Hall. The phone carries the story, but it is not on screen in every frame. Each cut hands off to the next through a shared element, so the journey feels continuous. It follows the guest journey at Dreams & Beats, Cinnamon Life at City of Dreams: scan the table code, sign in, see the bill, choose how many DISCOVERY Dollars to use, confirm, and done. New-guest sign-up is not shown.

Status: storyboard only. No frames, music or voiceover have been made yet.

---

## 1. Brief and constraints

| | |
|---|---|
| Format | 1920 × 1080, 30 fps, 60 seconds |
| Audience | Senior leadership, watching on a large screen in a room |
| Hero | One phone, the same device wherever it appears. Screens are the real captured states from `reference/shots/` and the components in `design/` |
| Fonts | Jost Light (display and key numbers), Figtree (labels and body). Unchanged |
| Logo | `assets/logo/cinnamon-discovery-logo.svg`, white. Use the purple version on white backgrounds |
| Imagery | No photography. The studio is a plain Midnight backdrop |
| Voiceover | 7 lines, about 25 seconds of speech. Generated separately from section 5 |
| Music | Corporate and professional instrumental bed, 100 BPM |
| Loudness | About −17 LUFS integrated, true peak −2 dBTP |
| Brand | Cinnamon Purple `#612D87`, Midnight `#202A66`, Dune `#A39383`, White. Sky Blue as a sparing accent |

---

## 2. How the film is made, in Apple's terms

- **The device is the protagonist, not a fixture.** It appears where the story needs it and leaves when the story moves on. The camera moves around it, pushes into its screen, and lifts out of it. The screen content, not text, carries the story.
- **Real screens, real scale.** Every screen is a captured state from the live flow. Nothing is redrawn, so nothing drifts from what guests see.
- **Clean studio.** A Midnight backdrop with one soft top light. No props, no table photograph, no clutter.
- **One camera language.** Slow push-ins at about 4% a second. Lateral moves for transitions. A slight rotation (about 12° to 0°) when the phone first appears. Camera moves are about 1.5 to 2 seconds.
- **Springs, not tweens.** UI moves on settled springs, roughly damping 15 and stiffness 115. No bounce.
- **Continuous hand-offs.** Every cut carries one element into the next: a shape, a number or the camera. No unrelated slides. See section 3a. One whip, used once.
- **Type is punctuation.** One or two words at a time, Jost Light, centred. Type appears about two frames before the spoken word it names.
- **Silence is designed.** Music pulls back at the moment that matters most, the total.

From the references: `apple-motion` (MIT) provided the measured pace, spring and voice numbers. `motion-graphics-skills` (MIT) provided the "one object, one idea" and the bookended ending. Neither Apple footage nor names, typefaces or marks are used.

Deliberate departure: Apple's recaps average about 1.9 seconds a shot. This film averages about 5 seconds, so the room can read each screen.

---

## 3. Timeline

| # | Time | Length | Beat | Picture | Voice | Sound |
|---|---|---|---|---|---|---|
| 1 | 0:00 | 4s | Open | Midnight. The white lockup fades in and holds | none | Reveal |
| 2 | 0:04 | 5s | Table | The phone rises into the studio, turning from about 12° to face on, showing the table QR | 1 | none |
| 3 | 0:09 | 5s | Scan | Camera pushes into the screen. A scan line passes over the QR, and the screen moves to the sign-in page | 2 | Plug at 0:12 |
| 4 | 0:14 | 5s | Sign in | The member's sign-in page: username, password, tap Sign in | 2 (cont.) | Seal on the tap |
| 5 | 0:19 | 3s | Shared element | The Sign in button changes shape and becomes the bill card | none | Gust (the one whip) |
| 6 | 0:22 | 7s | Recognised | The Dreams & Beats venue chip and the Titanium tier card rise into place. "Cinnamon" and "DISCOVERY" split apart as in the lockup | 3 | Glide on the chip, Arrive on the card |
| 7 | 0:29 | 8s | Benefit | Camera moves onto the bill's discount line, which reads 50%. Then the figure "−LKR 29,200" lifts off the screen and counts up | 4 | Counter ticks, then Velvet on the final figure |
| 8 | 0:37 | 4s | Breath | Music drops to one held note. The total, LKR 37,901.60, resolves on the screen. Nothing else moves | none | Velvet on settle |
| 9 | 0:41 | 9s | Choose | The D$ slider. It slides to zero and rests, then rises to a value. Balance left to pay updates | 5 | Notch on each detent |
| 10 | 0:50 | 4s | Confirm | One Confirm button. A quiet press at 0:52 | 6 | Seal on the press |
| 11 | 0:54 | 3s | Done | The phone's success mark draws in: "Your DISCOVERY Dollars are on the way." | none | Settle |
| 12 | 0:57 | 3s | Close | The phone recedes and shrinks into the white logo. Closing line in Jost Light | 7 | Finale on the logo |

Total: 60 seconds, 12 shots, average 5 seconds. Hard cuts, one whip (shot 5), and the shared-element move at shot 5.

---

## 3a. How each cut hands off

| From → to | What carries the move |
|---|---|
| 1 → 2 | The white lockup dissolves into the phone rising from the bottom edge |
| 2 → 3 | The camera pushes into the QR until it fills the frame, then the screen takes over |
| 3 → 4 | The scan line becomes the sign-in page's top edge. No cut |
| 4 → 5 | The Sign in button stretches into the bill card (the one whip) |
| 5 → 6 | The bill settles and the venue chip enters on the same card |
| 6 → 7 | The camera moves onto the discount line, and the figure lifts off the screen. The phone leaves the frame |
| 7 → 8 | The figure drops back into the bill and becomes the total. Music pulls back |
| 8 → 9 | The total slides up, and the D$ slider rises from the bill's base |
| 9 → 10 | The slider's chosen amount becomes the amount on the Confirm button |
| 10 → 11 | The Confirm button morphs into the success mark |
| 11 → 12 | The phone recedes and shrinks into the logo |

---

## 4. Beat detail

**Shot 1: Open (0:00–0:04).** Midnight backdrop. The white lockup fades in with a small upward drift. This is the frame the film returns to at the end.

**Shot 2: Table (0:04–0:09).** The phone rises from below the frame and turns from about 12° to face on. Its screen shows the table QR. The studio light is soft and from above. Voice: "Every great evening starts at the table." (0:04–0:07)

**Shot 3: Scan (0:09–0:14).** The camera pushes into the phone's screen. A scan line passes over the QR at 0:12, and the screen moves to the sign-in page. Voice: "Scan the code, sign in, and your bill opens on your phone." (0:09–0:14)

**Shot 4: Sign in (0:14–0:19).** The real GHA DISCOVERY sign-in page. The member's email address fills in, then the password, shown as dots. The Sign in button is pressed at 0:17. The terms require the member to authenticate before the discount applies, so this step is shown, not skipped.

**Shot 5: Shared element (0:19–0:22).** The Sign in button stretches and becomes the bill card. It is one object changing shape, with no crossfade. This is the one whip, with the Gust sound.

**Shot 6: Recognised (0:22–0:29).** The venue chip "Dreams & Beats" rises first. Then the Titanium tier card rises into place, using `assets/img/titanium.webp`. Beside the screen, "Cinnamon" and "DISCOVERY" split apart as they do in the lockup. Voice: "Cinnamon has your bill. DISCOVERY knows it's you." (0:23–0:27)

**Shot 7: Benefit (0:29–0:37).** The camera moves onto the bill's discount line, which reads "GHA DISCOVERY 50%". The figure "−LKR 29,200" lifts off the screen, fills the frame in Jost Light, and counts up over about 2 seconds. Velvet lands on the final figure at about 0:32. Voice: "Your benefit is already on the bill. Nothing to ask for." (0:30–0:35)

**Shot 8: Breath (0:37–0:41).** The figure settles back into the bill. The music pulls to one held note. The total, LKR 37,901.60, resolves at the bottom of the bill. Nothing else moves for about two seconds. This is the felt moment.

**Shot 9: Choose (0:41–0:50).** The phone is centred. The D$ slider moves to zero and rests, so "or none at all" is visible. It then rises to a value, and the balance left to pay updates. Each detent clicks. Voice: "Decide how many DISCOVERY Dollars to use, or none at all. Either way, you earn." (0:41–0:47)

**Shot 10: Confirm (0:50–0:54).** One Confirm button with the amount. The press is at 0:52. The button compresses to about 96% and springs back over 120 milliseconds. Voice: "One tap to confirm, and you're done." (0:50–0:53)

**Shot 11: Done (0:54–0:57).** The success mark draws in on the phone in one stroke. Below it: "Your DISCOVERY Dollars are on the way." No confetti. No exclamation mark, per brand rules.

**Shot 12: Close (0:57–1:00).** The phone recedes and shrinks into the white logo on Midnight. The closing line sits below in Jost Light. Voice: "Cinnamon DISCOVERY. Dine with DISCOVERY Dollars." (0:57–1:00). Finale on the logo. The logo holds for about 3 seconds.

---

## 5. Voiceover script

| # | Time | Line | Words |
|---|---|---|---|
| 1 | 0:04–0:07 | Every great evening starts at the table. | 7 |
| 2 | 0:09–0:14 | Scan the code, sign in, and your bill opens on your phone. | 12 |
| 3 | 0:23–0:27 | Cinnamon has your bill. DISCOVERY knows it's you. | 8 |
| 4 | 0:30–0:35 | Your benefit is already on the bill. Nothing to ask for. | 11 |
| 5 | 0:41–0:47 | Decide how many DISCOVERY Dollars to use, or none at all. Either way, you earn. | 15 |
| 6 | 0:50–0:53 | One tap to confirm, and you're done. | 7 |
| 7 | 0:57–1:00 | Cinnamon DISCOVERY. Dine with DISCOVERY Dollars. | 6 |

66 words, about 23 seconds of speech at 2.5 to 3 words a second. The full script and recording notes are in `motion/voiceover-script.md`.

---

## 6. Music and sound

- **Style:** Corporate, professional and relevant to a hospitality leadership audience. Restrained modern instrumental (piano, light strings, soft percussion), confident rather than emotional. No vocals, no cinematic trailer build, no novelty sounds.
- **Bed:** 100 BPM, one key, sparse. It sits under the voice at a low level.
- **Drop-out at 0:37:** Music pulls to one held note through the breath shot and returns at 0:41.
- **Final hit:** The bed's closing hit lands on the logo at 0:57, with the Finale sting.
- **Sound effects:** Only on actions and the whip, as in section 3. Nothing decorative.

---

## 7. Open decisions

1. **Titanium 50%. Needs confirming before the film runs.** The storyboard now shows 50%, as requested. The repo's terms say the dining discount is "up to 15%, by tier", and the public copy says "Up to 15% off the bill". Nothing in the repo supports 50%. Unless this is a new rule, the figures should be labelled illustrative. The affected numbers are −LKR 29,200 and LKR 37,901.60.
2. **Silver 15%.** Earlier you said 15% is Silver. The repo does not state per-tier rates. The storyboard no longer uses Silver, so this only matters if you want Silver shown in another shot.
3. **Phone.** The repo has no device frame. I'd draw a generic, flat-edged phone in code rather than use a real device outline, so it can't be read as an Apple product.
4. **Music licence.** The bed needs a licence that covers a company event. Commissioned, licensed library, or synthesised?
5. **Sign-in on screen.** Shot 4 uses GHA DISCOVERY email and password, as you confirmed.
