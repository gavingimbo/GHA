# Dine with DISCOVERY: motion storyboard (v1)

A 60-second film for the Cinnamon Hotels & Resorts Town Hall. It follows the `dev/` settlement arc: the bill is recognised, the benefit appears, the guest chooses, and they are done. New-guest sign-up is not shown.

Status: storyboard only. No frames, music or voiceover have been made yet.

---

## 1. Brief and constraints

| | |
|---|---|
| Format | 1920 × 1080, 30 fps, 60 seconds |
| Audience | Senior leadership, watching on a large screen in a room |
| Fonts | Jost Light (display and key numbers), Figtree (labels and body). Unchanged from the decision on the project |
| Logo | `assets/logo/cinnamon-discovery-logo.svg`, white. Use the purple version on white backgrounds |
| Imagery | No photography. The table is an abstract warm light field |
| Phone | The guest's phone at real scale (393 × 852 logical px) from `design/` |
| Voiceover | 7 lines, about 25 seconds of speech. Generated separately from `script` in section 5 |
| Music | One bed at 100 BPM, in a single key, built to breathe at the benefit moment |
| Loudness | About −17 LUFS integrated, true peak −2 dBTP |
| Brand | Cinnamon Purple `#612D87`, Midnight `#202A66`, Dune `#A39383`, White. Sky Blue as a sparing accent |

---

## 2. What we take from the references, and what we leave out

**From `apple-motion` (MIT, measured frame by frame on six Apple recap films):**

- Cuts follow the voice, not the beat. Cuts are on the beat only at chance rate.
- Typography is punctuation, one or two words at a time. The voice carries the explanation.
- UI entries use a spring of roughly damping 15, stiffness 115. Motion is short and settled, with no visible overshoot.
- Voice runs at about 3 words a second. The picture holds 1 to 8 seconds after the last word.
- The logo holds about 3 seconds at the end.
- Most edits are hard cuts. Whip accents are rare, about one per 10 to 12 cards.
- Loudness of about −17 LUFS with a true peak of −2 dBTP.

**Where we deliberately depart:** their median shot is about 1.9 seconds. Ours averages about 5.5 seconds. This is a film to be felt, and interface interactions need time to be read by a room.

**From `motion-graphics-skills` (MIT):**

- One idea per film, one object doing it. The QR becomes the bill, the bill becomes the total.
- A hold that never looks frozen. A slider rests with a small settle, and the phone keeps a faint idle motion.
- The film bookends: it opens and closes on the logo.

**Not used:** Apple footage, names, typefaces, marks or product claims. Both repos say they contain none of these, and this film keeps to Cinnamon's own brand.

---

## 3. Timeline

| # | Time | Length | Beat | Picture | Voice | Sound |
|---|---|---|---|---|---|---|
| 1 | 0:00 | 4s | Open | Midnight. The white lockup fades in and holds | none | Reveal on the lockup |
| 2 | 0:04 | 5s | Table | Warm abstract light, slow push-in (about 4% a second) | 1 | none |
| 3 | 0:09 | 6s | Scan | Phone rises from below at real scale, with the table QR. A scan line passes over it at 0:12 | 2 | Plug at 0:12 |
| 4 | 0:15 | 3s | Shared element | The QR changes shape and becomes the bill card | none | Gust (whip) |
| 5 | 0:18 | 7s | Recognised | Venue chip enters. Type reads "Cinnamon" and "DISCOVERY" as the lockup splits. Tier card rises and settles | 3 | Glide on the chip, Arrive on the card |
| 6 | 0:25 | 9s | Benefit | One large figure, "−LKR 8,760", counts up. Label: "GHA DISCOVERY discount applied" | 4 | Counter ticks, then Velvet on the final figure |
| 7 | 0:34 | 4s | Breath | Music drops to a single held note. The total, LKR 64,433.00, resolves below the figure | none | Velvet on settle |
| 8 | 0:38 | 8s | Choose | D$ slider in the bill. Slides to zero, rests, then rises to a value. Balance and total update | 5 | Notch on each detent |
| 9 | 0:46 | 5s | Confirm | One button with the amount. A quiet press at 0:48 | 6 | Seal on the press |
| 10 | 0:51 | 4s | Done | Success mark draws in. Line: "Your DISCOVERY Dollars are on the way." | none | Settle on the mark |
| 11 | 0:55 | 5s | Close | Phone shrinks into the logo. Closing line in Jost Light | 7 | Finale on the logo |

Total: 60 seconds. Eleven shots. Hard cuts throughout, with one whip at shot 4 and a dissolve into shot 7.

---

## 4. Beat detail

### Shot 1: Open (0:00–0:04)
- **Picture:** Midnight `#202A66` background. The white lockup fades in with a 0.5% upward drift, using the measured spring.
- **Purpose:** Establish the brand before anything else. The film bookends on this same frame.

### Shot 2: Table (0:04–0:09)
- **Picture:** A warm, low-contrast light field in Dune and Purple, with soft bokeh. It is abstract, with no photography and no people.
- **Motion:** A slow push-in of about 4% a second.
- **Voice:** "Every great evening starts at the table." (0:04–0:07)

### Shot 3: Scan (0:09–0:15)
- **Picture:** The phone rises from below the frame at real scale on Midnight. The table QR fills the screen.
- **Motion:** The phone rises with a spring. A scan line passes over the QR at 0:12.
- **Voice:** "Scan the code, and your bill opens on your phone." (0:09–0:13)

### Shot 4: Shared element (0:15–0:18)
- **Picture:** The QR square changes shape and becomes the bill card. The venue chip sits above it.
- **Motion:** One object changing shape, with no crossfade.
- **Sound:** Gust, as the one whip of the first half.

### Shot 5: Recognised (0:18–0:25)
- **Picture:** "Dreams & Beats" appears as the venue chip. Below it, the type "Cinnamon" and "DISCOVERY" splits apart as they do in the lockup. The Titanium tier card rises into place.
- **Type:** Jost Light, two words, aligned on the lockup's grid.
- **Voice:** "Cinnamon recognised your bill. DISCOVERY recognised you." (0:19–0:23). Type appears about two frames before the word it names.

### Shot 6: Benefit (0:25–0:34)
- **Picture:** One large figure, "−LKR 8,760", fills the centre of the screen in Jost Light. A small label sits above it: "GHA DISCOVERY discount applied."
- **Motion:** The figure counts up from zero over about 2 seconds. Each tick is a Counter sound.
- **Voice:** "Your member benefit is already on the bill. Nothing to ask for." (0:27–0:32)
- **Sound:** Velvet lands on the final figure at about 0:31.

### Shot 7: Breath (0:34–0:38)
- **Picture:** The figure drops away. The total, LKR 64,433.00, resolves below where it sat.
- **Motion:** The music pulls back to a single held note. Nothing else moves for about two seconds.
- **Purpose:** This is the felt moment. Silence after a number lets it land.

### Shot 8: Choose (0:38–0:46)
- **Picture:** The bill with the D$ slider. The slider moves to zero and rests. It then rises to a value, and the balance left to pay updates.
- **Motion:** The slider is the only moving element. Each detent clicks.
- **Voice:** "Decide how many DISCOVERY Dollars to use. Or none at all." (0:38–0:43)
- **Note:** The zero rest is what makes "or none at all" visible.

### Shot 9: Confirm (0:46–0:51)
- **Picture:** One Confirm button with the amount. The press is at 0:48.
- **Motion:** The button compresses to about 96% and springs back over 120 milliseconds.
- **Voice:** "One tap to confirm, and you're done." (0:48–0:51)

### Shot 10: Done (0:51–0:55)
- **Picture:** A success mark draws in. Below it: "Your DISCOVERY Dollars are on the way."
- **Motion:** The mark draws in one stroke. No confetti.
- **Note:** No exclamation mark, per brand rules.

### Shot 11: Close (0:55–1:00)
- **Picture:** The phone shrinks into the white logo on Midnight. The closing line sits below in Jost Light.
- **Voice:** "Cinnamon DISCOVERY. Dine with DISCOVERY Dollars." (0:56–1:00)
- **Sound:** Finale on the logo. The logo holds for about 3 seconds.

---

## 5. Voiceover script

| # | Time | Line | Words |
|---|---|---|---|
| 1 | 0:04–0:07 | Every great evening starts at the table. | 7 |
| 2 | 0:09–0:13 | Scan the code, and your bill opens on your phone. | 10 |
| 3 | 0:19–0:23 | Cinnamon recognised your bill. DISCOVERY recognised you. | 8 |
| 4 | 0:27–0:32 | Your member benefit is already on the bill. Nothing to ask for. | 12 |
| 5 | 0:38–0:43 | Decide how many DISCOVERY Dollars to use. Or none at all. | 11 |
| 6 | 0:48–0:51 | One tap to confirm, and you're done. | 7 |
| 7 | 0:56–1:00 | Cinnamon DISCOVERY. Dine with DISCOVERY Dollars. | 6 |

About 61 words across 25 seconds of speech. Fits the measured voice pace of about 2.5 to 3 words a second.

---

## 6. Music and sound

- **Bed:** 100 BPM, one key, and sparse. It sits under the voice at a low level, so the lines stay clear.
- **Drop-out at 0:34:** The music pulls to one held note through the breath shot. It returns at 0:38 for the choose shot.
- **Final hit:** The bed's closing hit lands on the logo at 0:55, which is also the Finale sting.
- **Sound effects:** Only on actions and whips, as in section 3. Nothing decorative.

---

## 7. Open decisions

1. **Figures.** "−LKR 8,760", "LKR 64,433.00" and the 15% come from the mockup's fixture (subtotal LKR 58,400, a 15% discount). Before this runs as a claim, confirm the 15% applies to this tier and venue. Otherwise label the figures as illustrative.
2. **Name.** The bill and tier card show a placeholder name, not a real member.
3. **Venue.** "Dreams & Beats" is the fixture venue. Swap it for a named outlet only if the team agrees.
4. **Length.** 60 seconds with about 25 seconds of voice. A 45-second cut is possible by removing shot 7 and the second half of shot 8.
5. **Music.** Commissioned, licensed or synthesised? The bed needs a licence cleared for a company event.
