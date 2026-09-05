# Dine with D$ — POS session mockup

A visual clone of the Cinnamon DISCOVERY "Dine with D$" journey that a guest
reaches by scanning the table QR at a participating venue (the
`qr.mydigimenu.com/<venue>?token=…` POS session link).

Every screen, modal and state of the real flow is reproduced. The functions
behind them are mocked: sign-in accepts anything, and the GHA auth, POS check
polling and earn/burn postings are timers over the fixtures in
`js/data.js`.

## Running it

Any static server, or open `index.html` directly:

```
npx http-server -p 8181 .   # then open http://127.0.0.1:8181/pos/
```

Sized for a phone — use a mobile viewport (iPhone 14 Pro, 393 × 852).

## Screens

| Screen | How to reach it |
| --- | --- |
| Guest landing (hero, venue chip, perks) | first load |
| Terms & Conditions (full-screen) | **Terms & Conditions** |
| Sign in (+ password reveal, validation) | **Sign in to continue** |
| Forgot password | opens ghadiscovery.com in a new tab, as the live app does |
| Join (language, name, email, phone, consents) | **Join now for free** |
| Join success drawer | submit the join form |
| Member landing (tier card, D$ stats, action cards) | sign in with anything |
| Burn D$ — items, bill, spend field, apply | **Burn D$ on Table 12** |
| Burn confirm → applying → applied | **APPLY D$…** |
| Burn already applied (confirmation + timestamp) | after a redemption |
| Earn D$ — items, live bill, earn card | **Earn D$ on Table 12** |
| Earn confirm → crediting → earned (txn IDs) | **Earn DISCOVERY Dollars** |
| Earn pending banner | after earning |

## Mock controls

The ☰ button (bottom-left, not part of the production page) switches the states
the real app only reaches through the POS and the GHA API:

- **Session** — guest vs. signed-in member
- **POS check** — open check with items / fetching from POS / no active bill
- **Member discount** — applied / checking / POS rejected / opened by another member
- **Session token** — valid / expired / check changed / no token (drives the red hint above the action cards)
- **Member actions** — the two-card variant (Earn + Burn) or the single **View Bill** card the `redirect=gha_discovery` entry point shows

## How it was built

The presentation is the production CSS, not a re-implementation:

- `css/hero.css`, `css/page.css`, `css/modal.css`, `css/burn.css`,
  `css/titanium.css` are the live CSS modules, copied verbatim (only the
  `@font-face` URLs were repointed at `assets/fonts/`).
- `js/css-maps.js` holds the class-name maps from the same bundles, so the
  markup emits the exact hashed class names those stylesheets target.
- `js/data.js` carries the English copy deck, key for key, from the app's i18n
  bundle; `js/terms.js` is the venue's Terms & Conditions body.
- `js/icons.js` reproduces the react-icons glyphs used on the page.
- `css/app.css` supplies only what the real app gets from its global stylesheet
  and component libraries — size tokens, the Bootstrap modal shell, the MUI
  outlined text field (40px control, 6px radius), the button component, and the
  select/checkbox controls — matched to the measured production values.

Fonts (IvyMode GHA Semi Bd, Jost), the venue cover image, the tier cards and the
GHA and myMENU marks are the original assets under `assets/`.

## Fixtures

`js/data.js` — venue (Dreams & Beats, Table 12, LKR), member (Titanium, D$148),
and a seven-line POS check totalling LKR 64,433.00 after a 15% member discount,
service charge and VAT. Service charge and taxes are excluded from the D$
eligible spend, as the programme rules require.
