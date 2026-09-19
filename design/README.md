# Design folder — components for Illustrator and slides

Every component of the Dine with D$ journey, on its own, as a **vector PDF** for
Illustrator and a **3× PNG** for slides. Nothing here is redrawn: each piece is
lifted out of the running production mockup with its real markup, CSS, type and
assets, so what you place in a guide is what the app renders.

| | |
| --- | --- |
| Browse | open `design/components.html` from a static server |
| Vector | `design/pdf/<id>.pdf` — 57 components |
| Raster | `design/png/<id>.png` — 3×, transparent where it makes sense |
| Icons | `design/icons/<name>.svg` — 15, true vector |
| Swatches | `design/tokens/cinnamon-discovery.ase` |
| Tokens | `design/tokens/tokens.json`, `colours.txt` |
| Whole screens | `node design/export.mjs --screens` (see below) |

For whole screens with their copy, triggers and recovery paths, see
`../reference/` — this folder is the parts, that one is the journey.

---

## Opening these in Illustrator

**PDFs.** File ▸ Open. They arrive as editable vector objects: shapes are
paths, text is live text. Release the clipping mask if you want the artboard
gone, then ungroup to get at individual elements.

**Install the fonts first.** The PDFs embed subsets, which is enough to *view*
but not to *edit* text. Both faces are in `../assets/fonts/`:

- `ivymode-gha-semibold.woff2` — IvyMode GHA Semi Bd, the display face
- `jost-regular.woff` — Jost, the body face

They are web formats. macOS Font Book and most Windows installers will not take
`.woff2` directly, so convert to `.otf` or `.ttf` first, or ask whoever holds
the licensed desktop originals. Until the fonts are installed Illustrator will
show a missing-font warning and substitute; the shapes stay correct.

**Icons.** `design/icons/*.svg` — drag straight onto the artboard, or File ▸
Open. They are the exact path data the app ships, at a 48px box, coloured
`#14102e`. Recolour freely. Each Material-style icon carries a transparent
`M0 0h24v24H0z` path as its first object: that is the icon's bounding box, not
stray geometry. Keep it to preserve optical alignment, or delete it once placed.

**Swatches.** Swatches panel ▸ menu ▸ Open Swatch Library ▸ Other Library… ▸
`design/tokens/cinnamon-discovery.ase`. Thirteen named colours, RGB, exact hex.
The translucent ink values are not in the `.ase` (swatch files hold no alpha) —
they are in `colours.txt` with their percentages.

---

## Geometry

Everything is exported at real CSS pixel sizes, so 1 px in the file is 1 px on
the phone.

- **Artboard**: 393 × 852 — iPhone 14 Pro logical pixels.
- **Content column**: 361 px. The page body has 16 px padding each side, so
  every card, bill block and spend control is 361 px wide.
- **Dialogs**: 393 px wide, floating in a 16 px inset backdrop.
- **Hero**: 393 × 207, from `aspect-ratio: 1200/630`.
- The caption under each component in `components.html` gives its exact size,
  **including** the padding the export adds around it. Subtract the padding
  (8–16 px, per component) for the component's own box.

Where a component hangs a decoration outside its own box — the join drawer's
check badge sits at `top:-32px` — the export measures the union of the element
and everything inside it, so the overhang is included rather than sliced off.
That is why a few components carry more space on one side than the padding
alone would give.

Components are exported on their production background — `#fafafa` for anything
that sits on the page, `#ffffff` inside sheets — because the cards are white and
would vanish on white. Buttons, chips and the venue chip are exported
transparent. In the PDF the background is a plain filled rectangle: select it
and delete it if you want the component free-standing.

**Soft shadows come in as a small raster image.** PDF cannot express a Gaussian
blur as vector, so Chromium rasterises each `box-shadow`. If you need a clean
vector card, delete the shadow image and re-apply an Illustrator drop shadow —
the values are in `tokens.json` under `shadow`.

---

## One thing to watch when setting type

**IvyMode's dollar glyph reads as an S.** Every display-face string containing
`D$` renders as `DS` — "View Bill on B12" is fine, but "Spend D$" comes out
"Spend DS", and so do "Earn D$" and "Failed to apply D$ on POS". Jost renders
`D$` correctly, which is why the same token looks right in body copy and wrong
in a heading on the same screen.

This is production behaviour and it is in the exports because it is in the app.
Do not silently correct it in a guide — if the guide is describing the live
product, the quirk is part of what you are describing. If you are proposing a
fix, call it out as a fix.

---

## What is in each group

| Group | Components |
| --- | --- |
| Foundations | Colour palette, type scale, the five button variants and a disabled state |
| Chrome | Hero (guest, member, loading), venue chip, Powered by, sheet header |
| Member landing | Tier cards ×4 plus loading, stats, action cards (View Bill, Earn, Burn, fetching, empty), the three session hints |
| Guest landing | Guest card, perks panel |
| Bill and redemption | Items (collapsed and expanded), bill card ×3 states, spend card ×3 states, discount checking and both error cards, redemption details, earn card, earn pending |
| Dialogs and drawers | All six dialog states, plus the join success drawer |
| Form controls | Text field, error field, password field, select, dial code, checkbox on and off |

The colour palette and type scale are the only two sheets drawn for this folder
rather than harvested; their values come from the measured production CSS in
`../reference/SPEC.md` sections 4 and 5.

---

## Regenerating, and adding a component

```bash
npm i playwright-core
node design/export.mjs                     # all components, icons, contact sheet
node design/export.mjs --only=bill-card    # just one
node design/export.mjs --scale=2           # lighter PNGs
node design/export.mjs --screens           # + all 50 whole screens as vector PDFs
```

`--screens` writes `design/pdf/screens/*.pdf`, one per state in
`../reference/states.json`. They are about 20 MB in total because each embeds
the cover photograph and tier artwork at full resolution, so they are not
committed — generate them when you need them.

To add a component, add an entry to `design/components.json`:

```json
{ "id": "my-thing", "label": "My thing",
  "state": { "signedIn": true, "screen": "burn", "billStatus": "ready" },
  "sel": "[class*=\"_some_class_\"]", "pad": 12 }
```

`state` is applied through `window.GHA_MOCK` before the element matching `sel`
is lifted out. Add `"index": 1` to take the second match, `"fixture"` to change
the member or venue first, `"bg": "transparent"` for a free-standing element.
Re-run the export and it appears in the contact sheet.
