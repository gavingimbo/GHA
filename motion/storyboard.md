# Dine with DISCOVERY: motion storyboard (v3)

A 60-second film for the Cinnamon Hotels & Resorts Town Hall. It tells one story: the tables Colombo already knows now reward you, and here is how a guest uses it. The first 12 seconds are words and brand. The rest is a live demo on a phone, using the real MyMenu screens, with words beside it.

Built in Remotion at `motion/film/`. Status: picture and synthesised soundtrack are built. Voiceover and the react-bits sound effects are not yet added.

---

## 1. Brief

| | |
|---|---|
| Format | 1920 × 1080, 30 fps, 60 seconds |
| Audience | Senior leadership, on a large screen |
| Fonts | Jost Light (display), Figtree (supporting text). Unchanged |
| Logo | `assets/logo/cinnamon-discovery-logo.svg` (white) |
| Screens | Real captures of the MyMenu production mockup, never redrawn. Gavin Matthew, member ID 839283945, Titanium |
| Numbers on screen | Only the two marketing facts: 4 hotels and 24 restaurants and bars. The bill's own figures appear small, as the production UI shows them |
| Music | Synthesised corporate instrumental at 112 BPM, mastered to −17 LUFS |

---

## 2. The story

The story is the guest's journey. Every beat has words on screen.

| Time | Beat | Words on screen | What we see | Voice |
|---|---|---|---|---|
| 0:00 | The tables you know | Long lunches. / Late dinners. / Sunday brunch. | Words only, one at a time, each rising out of blur | 1 |
| 0:05 | The scale | 4 hotels / 24 restaurants and bars | Two large counted figures. The only big numbers | 2 |
| 0:09 | The promise | Now every one of them rewards you. | The Cinnamon DISCOVERY lockup | 3 |
| 0:12 | Take a seat | Take a seat. / Scan the code. | The phone rises. A QR, shown by our team, appears beside it | 4 |
| 0:15 | The scan | | The QR flies into the phone and the "Dine with D$" page opens | |
| 0:17 | Sign in | Sign in. Your GHA DISCOVERY email and password. | Tap Sign in, the sheet rises inside the phone, the email and password are typed, tap SIGN IN | 5 |
| 0:23 | Recognised | Recognised. Your tier. Your bill. Ready. | Loading, then the member page: Gavin Matthew, the Titanium card, D$ balance | 6 |
| 0:29 | The bill | Your benefit. Already there. | Tap View Bill, the page pushes in, scrolls to the bill. The discount line is highlighted | 7 |
| 0:37 | Use D$ | Use D$. Or keep them. Either way, you earn. | Scroll to the D$ field. Type 60, clear it to show the choice, type 60 again | 8 |
| 0:47 | Apply | Tap to apply. That's it. | Tap APPLY, the dialog opens, tap Confirm, the success screen | 9 |
| 0:52 | Earn and spend | Earn at one table. / Spend at the next. | Words only. The phone has left | 10 |
| 0:56 | Close | Dine with DISCOVERY Dollars. | The lockup, held about 3 seconds | 11 |

---

## 3. How it feels like a live demo

- **The phone is real.** Every screen is a capture of the production mockup at the phone's real size. Nothing is drawn.
- **Screens stay inside the phone.** A sheet rises inside it, a page pushes in inside it, and the page scrolls inside it. Nothing slides out.
- **Real interactions.** Taps show a touch indicator. The email and password are typed one character at a time. The bill scrolls to the right area for each line of the voiceover: the discount line, then the D$ field and APPLY button.
- **A moving camera, kept gentle.** It pushes in on taps and eases back, with light motion blur on fast moves. The phone stays left of centre so the words keep their column.
- **Words lead the story.** Display lines rise out of blur and leave with a small lift. Supporting lines are small and in Sky Blue.

---

## 4. Sound

- **Music:** synthesised at 112 BPM in D. A pad, a piano-like pluck, a bass pulse and light percussion. It builds through the hook and the numbers, sits lower under the voice during the demo, and lifts for the close. The hit lands on the closing lockup at 0:56.8.
- **Tap clicks and whooshes** are synthesised from the same timeline file the film reads (`motion/film/src/timeline.json`), so they land exactly on the on-screen taps.
- **Still to do:** swap the synthesised clicks and whooshes for the react-bits sounds chosen earlier, and add the voiceover.

---

## 5. Facts checked

- **24 restaurants and bars across 4 hotels.** Counted from the venue terms in the repo: Cinnamon Grand Colombo 6, Cinnamon Life at City of Dreams Sri Lanka 11, Cinnamon Lakeside Colombo 5, Cinnamon Red Colombo 2. Matches the "24 of our restaurants and bars" in the launch copy.
- **Four hotels.** The brief mentioned three. The terms and launch copy name four.

## 6. Open items

1. **Titanium discount.** The film shows 50%, as you instructed. The launch release says Titanium is 30% (Silver 15%, Gold 20%, Platinum 25%). The percentage is a single setting: run `DISCOUNT_PCT=30 node motion/film/capture/capture-screens.js`, then re-render.
2. **Launch date.** The launch release says 1st October 2026. The venue terms in the repo say 1st July 2026. The film shows no date.
3. **Production copy.** The success dialog's own text, such as "Your D$ are on the way!", is production copy and contains an exclamation mark. It is kept exact. Our own copy follows brand rules.
4. **Member ID.** 839283945 is set as the membership card number. The production profile ID is unchanged.
5. **Music loudness.** Mastered at −17.0 LUFS. True peak is −1.6 dBFS, slightly above the −2 dBTP target.
