# Handoff — Cinnamon DISCOVERY "Dine with D$" POS flow

What this repo mocks, how the real thing works, and where the two differ.

Written from the live session link
`qr.mydigimenu.com/eca66c50-…?token=…` (Dreams & Beats, Cinnamon Life at City of
Dreams) on 5 Sep 2026. Sources are marked throughout: **observed** means I loaded
it in a browser and saw it; **from source** means I read it in the shipped
JavaScript bundles; **inferred** means I reasoned it out and it is worth
confirming.

---

## 1. What the flow is for

A guest sits down at a table in a participating Cinnamon restaurant. Staff hand
them a QR code tied to the open check on the POS. Scanning it opens a phone page
that lets the guest, as a GHA DISCOVERY member:

1. **Earn** DISCOVERY Dollars (D$) on their eligible spend on this bill, and
2. **Redeem** (the app says "burn") their existing D$ balance against this bill,
3. after an automatic **member discount** has been applied to the check on the POS.

D$1 = USD 1. The guest never pays through the app — they still settle with the
venue. The app's job is to attach the member to the check, apply the discount,
credit the earn, and push the redemption onto the POS bill so the amount due
comes down before payment.

This is a module inside **MyMenu / DigiMenu** (mydigimenu.com), the QR menu and
ordering platform Cinnamon uses. The GHA DISCOVERY screens are one feature of
that wider app, not a standalone product.

---

## 2. The session link

The QR encodes a URL of the form:

```
https://qr.mydigimenu.com/<venue-menu-uuid>?token=<JWT>
```

The JWT payload (observed, decoded from the link):

```json
{ "purpose": "pos_session", "session_id": 2408, "venue_id": 30860,
  "table_id": 211064, "iat": …, "exp": … }
```

Points that matter:

- **The token is the check.** It binds the browser session to one POS check on
  one table at one venue. It is not a login.
- **It expires in one hour** (`exp - iat` = 3600). After that the guest must ask
  staff for a fresh QR.
- The signature is HS256, verified server-side. Nothing in the page trusts the
  payload on its own.
- Because the token is the bill's identity, a **new check means a new QR** — the
  app has an explicit "check changed" state for when the POS check behind the
  token is no longer the one the guest is looking at.

The app carries three session-token failure states (from source), each with its
own copy and each shown as a red hint above the action buttons:

| State | Meaning | What the guest is told |
| --- | --- | --- |
| `no_token` | Opened without a session token | "Please ask staff for the QR to start your session." |
| `expired` | Token past `exp` | "Your session has expired. Please ask staff for a new QR." |
| `check_changed` | POS check behind the token changed | "The bill has changed. Please ask staff for a new QR." |

There is also a **camera QR scanner** in the bundle (`gha_qr_scanner_*` strings:
permission denied, no camera, wrong QR) so a guest can rescan without leaving the
page. I did not reach it in the live session — it is presumably how a guest
recovers from the states above. **Not reproduced in this mockup.**

---

## 3. The journey, screen by screen

### 3.1 Guest landing — observed

Hero cover image (venue-configured), venue chip ("Dreams & Beats"), the "Dine
with D$" card explaining the offer, and two calls to action:

- **Sign in to continue** → GHA DISCOVERY sign-in
- **Join now for free** → Cinnamon DISCOVERY enrolment

Below that, the three-perk panel (up to 15% off / Pay with D$ / Earn D$ back) and
a **Terms & Conditions** link opening a full-screen sheet with the venue's T&C
HTML.

### 3.2 Sign in — observed

Username-or-email plus password, against GHA through a venue-scoped endpoint.
Validation is client-side first (email format, or username ≥ 3 chars).
**Forgot Password?** does not open an in-app flow — it opens
`ghadiscovery.com/member/settings/password` in a new tab. The bundle also carries
unused-here modes for password reset by token and change-password.

### 3.3 Join — observed

Language, first name, last name, email, phone (dial-code picker, defaulted to
+94), password. Then the enrolment consent, a marketing opt-in checkbox, the
Cinnamon marketing statement, and the GHA/Cinnamon terms and privacy links.
Enrolment is with **GHA Loyalty FZCO** as the programme operator.

### 3.4 Member landing — from source

Once signed in, the same page becomes the member view: hero with name, membership
card number and live D$ balance; the tier card artwork (Silver / Gold / Platinum
/ Titanium); D$ earned and D$ redeemed to date; then the action cards.

Two variants exist:

- **Default:** two cards — *Earn D$ on {table}* and *Burn D$ on {table}*.
- **`?redirect=gha_discovery` (or the venue's "GHA home" flag):** one card —
  *View Bill on {table}*, which goes to the burn screen.

The burn card's subtitle is the live bill state: fetching from POS / bill total /
no active bill yet / DISCOVERY Dollars already applied.

**The page polls the POS every 7 seconds** while a member is signed in with a
valid table (from source), so the bill total tracks what staff are ringing in.

### 3.5 Burn D$ — from source

Items on the check (first four, expandable), the bill breakdown, and the spend
control:

- Eligible-for-D$-spend figure, shown in both D$ and local currency
- A numeric input for how many D$ to redeem, bounded by a stated range
- Live *Value* and *Balance left to pay*
- **APPLY D$…** → confirm dialog → applying → success, or a POS failure state

### 3.6 Earn D$ — from source

Same items and bill, a "Live from {POS name}" indicator, and a single **Earn
DISCOVERY Dollars** action. On success it shows transaction ID, POS check number
and POS reference, then a pending banner: the credit is asynchronous ("Your D$
are on the way").

---

## 4. The business rules the UI encodes

From the venue's Terms & Conditions and the app's own copy and logic:

- **Offer live from 1 July 2026**, at a named list of outlets across Cinnamon
  Grand Colombo, Cinnamon Life at City of Dreams, Cinnamon Lakeside Colombo and
  Cinnamon Red Colombo.
- **Earn rate is 4–7% in D$**, varying by GHA DISCOVERY tier.
- **Dining discount up to 15%**, also by tier — with carve-outs: Plates
  (Cinnamon Grand) and The Dining Room (Cinnamon Lakeside) give the discount to
  **Titanium members only, max 20 guests**; Quizine and Flavoured give **no
  discount at all**. Earning and redeeming D$ still work everywhere.
- **Minimum D$10 balance** to redeem on a check.
- **Tobacco, service charge, tips and government taxes are ineligible** for both
  earning and redemption. This is why the mockup's bill separates an eligible
  subtotal from service charge and VAT — the D$ eligible figure is computed on
  the discounted item spend only, not the bill total.
- **One earn per bill.** "You can earn from a bill only once."
- **Redemption is one-way from the phone.** "This can't be undone from your
  phone" — reversing it is a POS/venue action.
- **First member locks the check.** "Only the first GHA member to scan this check
  can apply a discount or redeem D$ on it." A second member scanning the same
  check is told to ask staff to open a new check. This is the single most
  operationally significant rule in the flow.
- **Bill splitting is disabled** while D$ are applied (string present in the
  bundle; not reachable from this POS entry point).

---

## 5. Failure modes the UI is built around

The flow is unusually failure-aware, which tells you where it breaks in practice:

| Failure | UI behaviour | Recovery |
| --- | --- | --- |
| Discount rejected by POS | Named card with the POS's reason | "Ask staff to close the check on the POS, then tap retry" + Retry button |
| Check opened by another member | Card explaining the lock | Staff must open a new check — no retry offered |
| D$ apply fails on POS | Error state in the confirm dialog, with reason | Cancel or Retry |
| Earn fails | Generic failure in the dialog | Retry |
| No active bill yet | Bill card says so; actions disabled | Wait for staff to ring items in (polling picks it up) |
| Session token expired / check changed | Red hint above actions, actions disabled | New QR from staff |
| Bill or balance below D$10 | Redemption hidden, replaced by an earn-only path | Guest can still earn |

Note the pattern: **the app never asks the guest to fix anything themselves.**
Every recovery routes through venue staff and the POS. Plan training and floor
process accordingly — the failure copy is written for a guest to show a waiter.

---

## 6. What this repo contains

The site is a **visual mockup**, not a working client. It is deployed at
`https://gha-ivory-pi.vercel.app`.

```
index.html              the mockup (single page, hash-free, vanilla JS)
css/                    hero, page, modal, burn, titanium — the production CSS
                        modules, copied verbatim, fonts repointed
js/css-maps.js          class-name maps from the same bundles
js/data.js              copy deck (the app's English i18n values, key for key)
                        + venue, member and bill fixtures
js/terms.js             the venue's Terms & Conditions body
js/icons.js             the react-icons glyphs the page uses
js/app.js               state machine + views
assets/img              cover, tier cards, GHA and myMENU marks
assets/fonts            IvyMode GHA Semi Bd, Jost
assets/icons, /splash   iOS home-screen icons and startup images
tools/                  generator for those icons and splash images
signin/                 the earlier GHA DISCOVERY sign-in mockup, own manifest
README.md               how to run it and what each screen is
```

### Fidelity: what is real

- **The CSS is the production CSS**, not a re-implementation. The markup emits the
  same hashed class names those stylesheets target, so type, spacing, colour,
  radii and the hero/card treatments are the live values.
- **The copy is the live copy**, taken key for key from the app's i18n bundle.
- Fonts, cover image, tier card artwork and the GHA and myMENU marks are the
  original assets.
- The MUI text field, buttons and modal shell were rebuilt to **measured**
  production values (40px control, 6px radius, `rgba(0,0,0,.23)` outline, etc.).

### Fidelity: what is mocked

- **Sign-in accepts anything.** There is no auth.
- **No network at all.** GHA profile/dashboard fetches, the 7-second POS poll,
  and the earn and burn postings are all timers over the fixtures.
- **The bill is invented.** Dreams & Beats, Table 12, seven lines, LKR 64,433.00
  after a 15% member discount, service charge and VAT. The member is a fictional
  Titanium member with D$148. Replace `js/data.js` to change any of it.
- **The QR scanner is absent.**
- The **local currency rate** (LKR 302 per D$) is a plausible placeholder, not a
  live rate — the real app converts server-side.

### The mock-controls panel

The ☰ button, bottom-left, is **not part of the production page**. It switches
the states the real app only reaches through the POS and the GHA API: session
(guest / member), POS check (open / fetching / none), member discount (applied /
checking / rejected / opened by another member), session token (valid / expired /
changed / missing), and the two action-card variants. Use it to walk a reviewer
through the failure states without a POS.

---

## 7. How this was reconstructed

Worth knowing, because it bounds how much to trust each part.

The live page is a client-rendered SPA. I loaded it in a headless browser and
captured the guest landing, Terms & Conditions, sign-in and join screens
directly — those are **observed**, and the mockup matches them closely.

I could not sign in (no member credentials), so the member landing, Earn and Burn
screens were rebuilt **from the shipped bundles** — `GhaDiscoveryPage`,
`GhaDiscoverySigninModal`, `GhaHeroCover`, `GhaDiscoveryEarnPage`,
`GhaDiscoveryBurnPage`, `burnStyles` — by reading their render trees and pairing
them with the real stylesheets and copy. The structure, wording and styling
should be right; **the exact live composition of those screens has not been
verified against the real thing.** That is the main thing to check with someone
who has a member login.

---

## 8. Open questions

1. **Does the member landing show one action card or two at Cinnamon's venues?**
   Depends on `enable_gha_home` / the `redirect` parameter, which I could not
   read for this venue. The mockup defaults to two and can switch.
2. **What does the guest see on a device with no camera or denied permission,
   after a token expires?** The scanner strings imply a rescan path worth
   mapping.
3. **What actually happens on the POS when a redemption succeeds?** The app shows
   a confirmation number; the POS-side representation (tender line, discount,
   comp) determines how the cashier closes the check.
4. **Reversal path.** The UI says a redemption can't be undone from the phone. It
   does not say what staff do if the guest changes their mind. That gap will
   surface on the floor.
5. **Second-member lock.** Groups where two members want to earn on one bill hit
   this immediately. Is "open a new check" the intended answer, or is split
   attribution planned?

---

## 9. If you pick this up

- To reskin or re-fixture: `js/data.js` holds every string and number.
- To re-capture the live screens: the session token in a QR expires after an
  hour, so you need a fresh scan.
- To rebuild against a newer release: the CSS and copy came from hashed bundle
  filenames (`GhaDiscoveryPage-DKqHUFEs.js` and friends). Those hashes change on
  every deploy, so re-derive them from the page's script tags rather than reusing
  the names in this repo.
