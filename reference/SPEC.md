# Dine with D$ — production capture

An accurate capture of the live Cinnamon DISCOVERY dining journey: its assets,
structure, layout, states and error messages. Written to be used as the raw
material for mockups and a guide.

Everything numeric in sections 4 to 7 is **measured from the production CSS**
carried in `/css`, not estimated. Every quoted string is the live i18n value
from `/js/data.js`, key for key. Section 9 lists the production states that
exist in the shipped bundle and are **not** reproduced, so a guide can mark them
as still needing capture rather than inventing them.

| | |
| --- | --- |
| Captured states | 49, as 64 images in `shots/` |
| Browse them | open `reference/index.html` from a static server |
| Machine-readable | `reference/states.json` |
| Regenerate images | `node reference/capture.mjs` (`--scale=2` for retina) |
| Copy deck | 140 keys in `/js/data.js`; 121 rendered, 19 not (section 10) |
| Live deck | 730 keys recovered from the public bundle — `reference/live-copy-deck.json` |
| Copy fidelity | all 139 keys shared with the live deck match **exactly** |

---

## 1. How to use this

`states.json` is the source of truth. Each entry carries an `id`, the state
`patch` that produces it, its `trigger`, the i18n keys of every string on
screen, the assets it loads, its recovery path, and layout notes. The gallery
resolves the copy keys against `/js/data.js` at render time, so no string on the
page has been retyped by hand and none can drift.

To mock up a screen, take its entry, read the copy from the resolved keys, and
use sections 4 to 6 here for the layout and token values. To mock up a state
that does not exist yet, section 9 gives the production component, its measured
CSS, and what is and is not known about it.

The images are captured at 1× (393 × 852, iPhone 14 Pro logical pixels), so one
image pixel is one CSS pixel. `-full.png` variants are the whole screen with the
scroll containers unclipped.

---

## 2. Entry point and session

The QR on the table encodes:

```
https://qr.mydigimenu.com/<venue-menu-uuid>?token=<JWT>
```

The JWT payload, decoded from a live link:

```json
{ "purpose": "pos_session", "session_id": 2408, "venue_id": 30860,
  "table_id": 211064, "iat": …, "exp": … }
```

Four things follow from this, and they shape every state in the catalogue:

1. **The token is the check.** It binds the browser session to one POS check, on
   one table, at one venue. It is not a login.
2. **It lasts one hour** (`exp − iat` = 3600). After that, staff must issue a
   fresh QR.
3. **A new check means a new QR**, which is why the flow carries an explicit
   check-changed state.
4. **The page polls the POS every 7 seconds** while a member is signed in
   against a valid table, so the bill total tracks what is being rung in.

The journey is a module inside MyMenu / DigiMenu. The guest never pays through
it — they settle with the outlet. The app's job is to attach the member to the
check, apply the discount, credit the earn, and push the redemption onto the
bill so the amount due comes down before payment.

---

## 3. Journey map

```
QR scan
  └─ page (guest)                    §1 in the gallery
       ├─ Terms & Conditions sheet
       ├─ Sign in sheet ──────────┐
       └─ Join sheet ─────────────┤
            └─ success drawer ────┤
                                  ▼
          page (member)           §2   hero overlay + tier card + stats + actions
            ├─ Earn D$ on {table} ──▶ earn screen    §5
            │                           └─ earn dialog     §6
            └─ Burn D$ on {table} ──▶ burn screen    §3
                                        └─ redemption dialog §4
```

Three screens (`state.screen`: `page`, `burn`, `earn`), three full-screen sheets
(`state.modal`: `signin`, `signup`, `terms`), and one centred dialog shared by
the redemption and earn paths (`state.confirm`). The member landing has two
variants: two action cards by default, or a single **View Bill** card when the
entry carries `?redirect=gha_discovery`.

---

## 4. Layout system

Measured from `/css/page.css`, `/css/hero.css`, `/css/burn.css`,
`/css/modal.css`. Class names are the production hashed names with the hash
removed.

### Page shell

| Element | Values |
| --- | --- |
| `page_root` | `background #fafafa`, `min-height 100vh`, column flex, `font-family Jost` |
| `scroll_area` | `max-width 520px`, `margin 0 auto`, `flex auto` — the phone layout is capped, so it centres on a tablet |
| `body` | `padding 16px 16px calc(180px + env(safe-area-inset-bottom))`, `gap 16px`, column |

| `action_row` | `position fixed`, `bottom 0`, `max-width 520px`, `margin 0 auto`, `padding 12px 20px calc(safe-area + 16px)`, `gap 10px`, `z-index 5`, `background #fafafaf0`, `backdrop-filter blur(10px)` |

The action cards sit in a **fixed, blurred bar at the bottom of the viewport**,
not in the document flow — which is what the `body`'s 180px bottom padding
clears. That is why the member landing reads bottom-heavy, with an empty band
between the stat cards and the actions: the bar is pinned to the bottom of the
screen regardless of how short the content above it is.

### Hero

| Element | Values |
| --- | --- |
| `hero` | `aspect-ratio 1200/630`, `background #14102e`, `overflow hidden` |
| `hero_bg` | `object-fit cover`, absolute, full bleed |
| `hero_overlay` | `linear-gradient(#140c3000 0%, #140c301f 50%, #140c3061 100%)`, `z-index 1` |
| `topbar` | absolute top, `padding 14px 16px`, `z-index 3`, space-between |
| `user_overlay` | absolute bottom, `padding 12px 16px calc(12px + safe-area)`, `align-items flex-end`, `z-index 2` |

The cover asset is 1200 × 675 against a 1200 × 630 box, so it crops ~3% top and
bottom. Back and log-out buttons occupy fixed 36px slots, so the bar keeps its
geometry when only one is present.

### Cards

Every card on the light surface is the same construction: white, a `1px
#0000000f` hairline, and a low shadow.

| Card | Radius | Padding | Shadow |
| --- | --- | --- | --- |
| `guest_card` | 16px | `20px 18px`, `gap 14px`, `margin-top -32px` | `0 6px 18px #140c300d` |
| `guest_perks_card` | 16px | `16px 16px 18px`, `gap 10px` | none, `background #f4eff9` |
| `stat_card` | 12px | `12px 10px`, centred | none |
| `action_card` | 14px | `14px 16px`, `gap 14px`, row | none, `transition transform/box-shadow .15s` |
| `items_card` | 14px | `12px 14px`, `gap 8px` | `0 4px 12px #140c300a` |
| `bill_card` | 14px | `16px 14px`, `gap 8px` | `0 4px 12px #140c300a` |
| `spend_card` | 14px | `18px 16px 20px`, `gap 10px` | `0 4px 12px #140c300a` |
| `discount_error_card` | 14px | `14px 16px 16px`, `gap 8px` | none, `background #fdecee`, `1px #b000202e` |
| `discount_checking_card` | 12px | `10px 14px`, `gap 10px` | none, `background #140c300d` |
| `session_error_card` | 16px | `28px 22px 24px`, `gap 12px`, `max-width 420px` | `0 6px 24px #140c300f` |

`card_visual` (the tier card) is `aspect-ratio 1.6`, `max-width 320px`, `radius
14px`, `box-shadow 0 14px 30px #00000052`, with `text-shadow 0 1px 2px
#00000080` on the overlaid name, number and tier.

`stats_grid` is `repeat(2, 1fr)` with `gap 10px`.

### Sheets and dialogs

| Element | Values |
| --- | --- |
| `modal_backdrop` | `position fixed`, `inset 0`, `z-index 1050`, `rgba(0,0,0,.5)`, `animation modal_fade .15s` |
| `modal_backdrop.is_fullscreen` | `align-items stretch` — the sheet fills the screen |
| `modal_backdrop.is_centered` | `padding 16px` — the dialog floats |
| `modal_sheet` | `#fff`, `height 100%`, `overflow hidden`, column |
| `modal_dialog_centered` | `#fff`, `radius 16px`, `max-width 420px` |
| `confirm_modal_content` | `radius 18px`, `overflow hidden`, Jost |
| `confirm_modal_body` | `padding 24px 22px`, `gap 14px`, centred |
| `gha_wallet_header` | `padding 14px 16px`, wordmark centred, close button absolute right |
| `gha_signup_body` | `padding 8px 20px 32px`, `gap 14px`, `overflow-y auto`, scrollbar hidden |
| `gha_terms_body` | `padding 18px 20px 24px`, `overflow-y auto` |
| `gha_success_drawer` | `radius 16px 16px 0 0`, `max-width 480px`, `padding 40px 24px 24px`, slide-up `.3s` |

While a sheet or dialog is open the app sets `overflow: hidden` on both `html`
and `body`, the way Bootstrap's modal does.

---

## 5. Design tokens

### Colour

| Role | Value | Where |
| --- | --- | --- |
| GHA ink | `#14102e` | hero fill, titles, bill total, spend input text |
| Ink scale | `#140c30` at `d9 / bf / a6 / 8c / 59 / 26 / 0f / 0d / 0a` | body copy, chips, hairlines |
| Heading purple | `#300b5c` | `guest_heading`, `action_title` |
| Venue theme button | `#582c83` | primary buttons, perk icons, links — from the venue config, not the stylesheet |
| Accent purple | `#3d0b40` | `confirm_amount_pill` text, spend-input border at 30% |
| Page background | `#fafafa` | `page_root`, `session_error_root` |
| Perks panel | `#f4eff9` | `guest_perks_card` |
| Error | `#b00020` | session hint, discount error title; `#b0002014` hint fill, `#b000202e` card border |
| Error card fill | `#fdecee` | `discount_error_card` |
| Field error | `#d32f2f` | MUI notch and helper text |
| Success | `#1c8c4e`, `#0e6e3c` | confirmation check |
| Scanner | `#0d0a20` | `qr_root` |

Note the two purples in play. `#582c83` arrives from the venue theme
(`buttonColor`) and is applied inline; `#300b5c` and `#3d0b40` are baked into
the stylesheets. A mockup that uses one purple throughout will not match.

### Type

Two faces, both in `/assets/fonts`:

- **IvyMode GHA Semi Bd** — display. Headings, card and dialog titles, action
  titles, amounts, button labels.
- **Jost** — body. Everything else.

Measured sizes, by frequency: 13px (34 uses), 11px (26), 12px (25), 14px (19),
16px (7), 15px (7), 20px (6), 18px (5), 12.5px (5). The set is small and
deliberate; the whole journey runs on 11–14px with a handful of larger display
sizes.

| Element | Face | Size |
| --- | --- | --- |
| `guest_heading` | IvyMode 600 | 22px / 1.2, `letter-spacing .01em` |
| `session_error_title` | IvyMode 700 | 20px / 1.25 |
| Sheet titles (sign in, join) | IvyMode | 22px, set inline, uppercased in code |
| Terms title | IvyMode | 26px, set inline |
| `confirm_title` | IvyMode 700 | 15px / 1.25 |
| `action_title` | IvyMode 700 | 13px / 1.2 |
| `action_subtitle` | Jost | 12px / 1.4, `#140c30a6` |
| `action_session_hint` | Jost 600 | 12.5px / 1.35, centred |
| `item_row`, `bill_card` rows, `bill_total_row` | Jost | 13px |
| `spend_input` | Jost 700 | 18px, centred |
| `session_error_body` | Jost | 14px / 1.5, `#140c30bf` |
| `venue_chip` | Jost | 12px / 1.2, `letter-spacing .02em` |

**One thing to know before mocking anything up:** IvyMode's dollar glyph reads as
an S at these sizes, so every display-face string containing `D$` renders as
`DS` — "View Bill on B12", "Spend DS", "Failed to apply DS on POS". Jost
renders `D$` correctly, which is why the same token looks right in body copy and
wrong in headings on the same screen. It is in the captures because it is in
production. Flag it in the guide; do not silently correct it.

### Control metrics

From `/css/app.css`:

```
--big-button-height: 50px       --small-button-height: 32px
--secondary-button-height: 42px --icon-button-size: 34px
--payment-method-height: 50px
```

Button variants in use: `c_btn_primary` (filled, venue colour),
`c_btn_outline` (1px, venue colour), `c_btn_pill` and `c_btn_pill_outline`
(999px, used only inside the dialogs).

MUI outlined text fields: 40px control, 6px radius, `rgba(0,0,0,.23)` outline,
`#d32f2f` when invalid. The notch animates on focus.

Other measured values: `venue_chip` and `confirm_amount_pill` are `999px`
pills; `spend_input` has a `1.5px solid #3d0b404d` border at `10px` radius;
`session_error_icon` is a 72px circle; `qr_video` is `aspect-ratio 1`, `radius
18px`, `width min(88vw, 420px)`.

### Motion

`modal_fade .15s ease` on the backdrop, `gha_drawer_slideup .3s` on the success
drawer, `transform/box-shadow .15s` on `action_card`, and pulsing dots on the
POS-live and bill-loading indicators. Nothing else animates.

---

## 6. Asset inventory

| File | Size | Dimensions | Used by |
| --- | --- | --- | --- |
| `assets/img/cover.jpg` | 157 KB | 1200 × 675 | hero on all three screens, from `VENUE.coverImageUrl` |
| `assets/img/silver.webp` | 43 KB | 3000 × 1941 | tier card, Silver |
| `assets/img/gold.webp` | 36 KB | 3000 × 1941 | tier card, Gold |
| `assets/img/platinum.webp` | 92 KB | 3000 × 1941 | tier card, Platinum |
| `assets/img/titanium.webp` | 38 KB | 3000 × 1941 | tier card, Titanium |
| `assets/img/gha-logo.jpg` | 58 KB | 1047 × 1058 | wordmark in the sign-in and join sheet headers |
| `assets/img/mymenu-logo.png` | 14 KB | 200 × 38 | Powered by, foot of the burn and earn screens |
| `assets/fonts/ivymode-gha-semibold.woff2` | 47 KB | — | display face |
| `assets/fonts/jost-regular.woff` | 26 KB | — | body face |

The tier card is picked by `./assets/img/${tier.toLowerCase()}.webp`, so the
member's tier string selects the artwork directly.

`gha-logo.jpg` and the tier cards are byte-for-byte what production serves
(`/assets/gha-logo-CZ-VGKSi.jpg`, `/assets/titanium-CWQIh02F.webp`), confirmed
in the 16 September audit.

**The myMENU mark needs care — production ships three of them.** The powered-by
block does not use a bundled asset at all: it resolves to an image-CDN URL,
`images.mydigimenu.com/public/pwa/avatars/1689930863.png?w=200&h=200`, which
serves a 200 × 38 WebP of the two-colour wordmark (gold fork roundel, dark
"my", gold "menu"). That is the file this repository now carries, converted to
PNG under the same filename. The bundle separately holds `myMenuLogo-…png`
(1164 × 1163) and an inline data URI in `menuLogo-….js` (192 × 100). The first
of those is the **reverse, white-on-transparent variant**: on the light
`#fafafa` powered-by surface only its dark "my" is visible and the roundel and
"menu" disappear entirely. This repository shipped that variant until now, which
is why the mark looked broken. If you are picking an asset for a deck or a
guide, take the CDN one; on a dark surface, take the reverse.

Home-screen icons live in `assets/icons` (180, 192, 512, 1024, maskable-512)
and 44 iOS startup images in `assets/splash`, generated by
`tools/generate-assets.mjs`. Neither appears in the journey.

The Sri Lankan flag beside the dial code is an inline SVG data URI in
`js/app.js`, not a file.

---

## 7. The bill, and how the figures are derived

The fixture in `/js/data.js` is a seven-line check. The maths is the programme's,
so a mockup with different numbers still has to follow it.

| Line | Amount |
| --- | --- |
| Items subtotal (7 lines) | LKR 58,400.00 |
| Discount (GHA DISCOVERY 15%) | − LKR 8,760.00 |
| **Eligible spend** | **LKR 49,640.00** |
| Service Charge 10% | LKR 4,964.00 |
| VAT 18% | LKR 9,829.00 |
| **Bill total** | **LKR 64,433.00** |

- **Eligible spend is the discounted item spend only.** Service charge and taxes
  are excluded, as are tobacco and tips, because the programme rules make them
  ineligible for both earning and redemption. This is why the bill separates an
  eligible subtotal from the total.
- **Redeemable D$** is the lower of the eligible spend in D$ and the member's
  live balance: `min(floor(49,640 / 302), 148) = 148`. The spend field arrives
  pre-filled with that maximum.
- **Minimum redemption is D$10.** Below it, the spend control is replaced by an
  earn-only path.
- **Potential earn** is `floor(eligible_D$ × tier_rate)` =
  `floor(164.37 × 0.07)` = **D$11** at the Titanium rate of 7%.
- **D$1 = USD 1.** The LKR 302 per D$ rate in the fixture is a plausible
  placeholder; the live app converts server-side.
- After a redemption the hero balance drops by the amount applied, because the
  GHA dashboard is refetched.

Programme rules the UI encodes: earn is 4–7% by tier; dining discount up to 15%
by tier, with carve-outs (Plates at Cinnamon Grand Colombo and The Dining Room at
Cinnamon Lakeside Colombo are Titanium-only, maximum 20 guests; Quizine and
Flavoured give no discount at all); one earn per bill; redemption cannot be
reversed from the phone; and the first member to scan locks the check.

---

## 8. Error and state catalogue

The 14 error states, with what triggers each and who can resolve it. Full copy,
triggers and captures for all 49 states are in `states.json` and the gallery.

| State | Message | Retry offered | Resolved by |
| --- | --- | --- | --- |
| `guest-signin-error` | "Username or email is required" | n/a, inline | Guest |
| `member-bill-empty` | "No active bill on B12 yet" | no | Colleague rings items in; the poll picks it up |
| `member-hint-expired` | "Your session has expired. Please ask staff for a new QR." | no | Colleague issues a fresh QR |
| `member-hint-check-changed` | "The bill has changed. Please ask staff for a new QR." | no | Colleague issues a fresh QR |
| `member-hint-no-token` | "Please ask staff for the QR to start your session." | no | Colleague hands over the QR |
| `burn-below-min` | "Your bill must be at least … (D$10) to redeem…" | n/a, inline | Guest raises the amount |
| `burn-earn-only` | "You don't have enough DISCOVERY Dollars to redeem on this check…" | n/a | Nothing to fix; earn still works |
| `burn-bill-empty` | "No active bill found on the POS yet." | no | Colleague rings items in |
| `burn-discount-failed` | "Failed to apply discount on POS" + the POS's own reason | **yes** | Colleague closes the check on the till, guest taps Retry |
| `burn-discount-other-member` | "This check is opened by another member" | **no** | Colleague opens a new check — no guest action at all |
| `burn-confirm-error` | "Failed to apply D$ on POS" + reason + instruction | **yes** | Colleague clears the check, guest retries |
| `earn-discount-failed` | as `burn-discount-failed`, seen from the earn screen | **yes** | As above; earning is unaffected |
| `earn-confirm-already` | "DISCOVERY Dollars already earned" | n/a | Nothing to do; rendered as a success, not a failure |
| `earn-confirm-error` | "We couldn't credit your DISCOVERY Dollars. Please try again." | **yes** | Guest retries |

Four patterns worth carrying into a guide:

1. **Every operational failure routes through a colleague.** The app never asks
   the guest to fix anything themselves, and the failure copy is written to be
   shown to a waiter. Floor process has to match.
2. **The raw POS reason is shown to the guest verbatim** in the discount and
   redemption failures. Whatever the till returns appears on the phone.
3. **The member lock is the hardest state.** It offers no retry and no guest
   action, and a group where two members want to earn on one bill hits it
   immediately.
4. **There is no uncertain-transaction state.** A failed posting is presented as
   a clean failure with a Retry. If a posting can land while the response is
   lost, the live UI has nothing for it — which is the gap the `/dev/` concept
   fills with its confirming and reconciliation states.

---

## 9. Production states that are not reproduced

Audited against the **live bundle** on 16 September 2026 (method in section 13),
which sharpened this section considerably. The components below all still have
their CSS shipped in the current build, byte-identical to what this repository
carries. But shipped CSS is not the same as a reachable state, and the audit
splits them into two very different groups.

### 9.1 Live, reachable, and not captured — the password flow

**This is the one to capture next.** The current `GhaDiscoverySigninModal` has
three modes — `signin`, `forgot` and `update` — and it references all of their
copy. So an in-app forgot-password flow and an in-app change-password screen
exist in production today. The mockup reproduces only the `signin` mode, and
`HANDOFF.md`'s statement that Forgot Password has no in-app flow is out of date.

Recovered copy, verbatim:

| Key | Value |
| --- | --- |
| `gha_forgot_title` | Forgot Password |
| `gha_forgot_description` | Enter your email and we'll send you a link to reset your password. |
| `gha_forgot_cta` | SEND RESET LINK |
| `gha_forgot_password_sent` | If an account exists for that email, we've sent a reset link. |
| `gha_update_title` | Change Password |
| `gha_update_cta` | UPDATE PASSWORD |
| `gha_update_password_success` | Password updated successfully. |
| `gha_field_current_password` | Current Password |
| `gha_field_new_password` | New Password |
| `gha_field_confirm_password` | Confirm Password |

The change-password screen carries a live rules checklist, and its CSS
(`root`, `title`, `list`, `item`, `icon`, `met`, `unmet`, `pending`, `srOnly`
in the modal stylesheet) was **added after this repository's 5 September
capture** — so this flow is being actively built right now:

| Key | Value |
| --- | --- |
| `gha_password_requirements_title` | Your password must have: |
| `gha_password_rule_length` | Between 8 and 50 characters |
| `gha_password_rule_english` | English letters, numbers and symbols only |
| `gha_password_rule_letter` | At least one letter |
| `gha_password_rule_number` | At least one number |
| `gha_password_rule_symbol` | At least one symbol |
| `gha_password_rule_trimmed` | No space at the start or the end |
| `gha_password_rule_met` / `_not_met` | met / not met yet |

A separate route, `GhaDiscoveryResetPasswordPage`, completes the loop from the
emailed link:

| Key | Value |
| --- | --- |
| `gha_reset_title` | Reset Password |
| `gha_reset_password_page_description` | Choose a new password for your account. |
| `gha_reset_description` | Enter the token sent to your email and choose a new password. |
| `gha_field_token_placeholder` | Paste the token from your email |
| `gha_reset_cta` | RESET PASSWORD |
| `gha_reset_password_success` | Password reset successfully. Redirecting to sign in... |
| `gha_reset_password_success_close` | Password reset successfully. You can now close this tab. |
| `gha_reset_token_missing` | This reset link is invalid or has expired. Please request a new one. |

**And this is the finding that matters most.** That page's code handles a
`token` and nothing else — no session, no return path, no redirect target. It
succeeds into "Redirecting to sign in..." or "You can now close this tab", and
the external `ghadiscovery.com/member/settings/password` link is still in the
same chunk. So GHA has closed the *capability* gap — a member can now reset a
password without leaving the app — while the *context* gap is untouched: the
settlement session is not carried through recovery, and the guest still lands
back at a sign-in screen rather than at their bill. That is precisely what the
`/dev/` concept in this repository is built to fix, and it can now be argued
from the shipped code rather than from design opinion.

### 9.2 Shipped CSS with no shipped code path

For these, the stylesheet rules are live but **no component in any shipped
chunk references their copy keys**, and the keys are not constructed
dynamically either. They are built-but-unwired, or retired. Do not present them
as guest-facing states; they are design assets, not journeys.

The recovered copy is nonetheless the best evidence of what each was for.

**Full-screen session error** (`session_error_root`, `_card`, `_icon`, `_title`,
`_body`). A heavier presentation of the three session failures than the inline
red hint the app actually renders. Only the `gha_session_hint_*` strings are
wired; these title/body pairs are not:

| Key | Value |
| --- | --- |
| `gha_session_no_token_title` / `_body` | Your bill is not ready / Please ask the restaurant staff for the QR code and scan it to open your bill. |
| `gha_session_expired_title` / `_body` | Session expired / Your current session has expired. Please ask the staff to create a new session and scan the new QR. |
| `gha_session_check_changed_title` / `_body` | Check changed / The check on this table has changed. Please ask staff to regenerate the QR and scan again. |
| `gha_session_scan_qr` | Scan QR |

Note how much better these read than the wired one-liners, and that each names
the recovery. The unwired copy is the better copy.

**Camera QR scanner** (`qr_root`, `_topbar`, `_title`, `_close`, `_stage`,
`_video`, `_hint`, `_error_block`, `_error_icon`, `_error_title`, `_error_body`).
Dark `#0d0a20` full screen, square viewfinder at `min(88vw, 420px)`, 18px
radius. All nine strings recovered — previously we had none of them:

| Key | Value |
| --- | --- |
| `gha_qr_scanner_title` | Scan QR |
| `gha_qr_scanner_hint` | Point your camera at the QR code the restaurant staff is showing you. |
| `gha_qr_scanner_retry` | Try again |
| `gha_qr_scanner_denied_title` / `_body` | Camera access needed / Please allow camera access in your browser to scan the QR code, then tap Try again. |
| `gha_qr_scanner_no_camera_title` / `_body` | No camera found / This device doesn't have a camera available. Please open the link on a device with a camera to scan the QR. |
| `gha_qr_scanner_wrong_qr_title` / `_body` | That's not the right QR / The QR you scanned doesn't include a session token. Please scan the QR the restaurant staff is showing you. |

Together with the session-error set above, this was clearly designed as a
self-service recovery path: expired session → full-screen error → Scan QR →
scanner → back into the bill, with no colleague needed. None of it is wired.
Every session failure in the live journey still ends at "ask staff".

**Member dashboard** (`gha_dashboard_*`): Member Dashboard, with sections
Personal Information, Address, Profile IDs, Membership & Balance, DISCOVERY
Balance, Preferences, Memberships, Datamart Memberships, Keywords, plus
`gha_dashboard_open` "Open member dashboard". The section names and the JSON
block make this read as a diagnostic or data-subject view, not a guest feature.

**Wallet and balance view** (`gha_wallet_*`, `gha_balance_hero*`, `gha_card_*`
per tier, `gha_txn_row`): `gha_my_balance` "MY BALANCE",
`gha_your_transaction` "Your transaction", `gha_discovery_dollars_title`
"DISCOVERY Dollars" / `_subtitle` "Earn and spend rewards",
`gha_bill_total` "Bill total (excl. tax, tips & service charge)", and
`gha_value_gbp` "Value (£)" — note the sterling variant, evidence this module
predates or outlives the Sri Lanka rollout.

**An alternative page hero and member header** (`hero_eyebrow`, `hero_title`,
`hero_subtitle`, `member_summary`, `member_avatar`, `tier_chip`, `user_card*`,
`guest_highlight_*`). The copy shows what it was: `gha_page_eyebrow`
"GHA DISCOVERY", `gha_page_title_guest` "Earn at every stay. Spend on every
meal.", `gha_page_title_member` "Welcome back, {{name}}",
`gha_page_section_balance` "Your balance", `gha_page_section_actions`
"Quick actions", plus stats for tier nights, stays, next tier, revenue this
year and D$ expired. A fuller loyalty-dashboard landing than the one that
ships.

**Other unwired pieces**, with copy where it exists: an in-sheet spend control
(`gha_spend_card`, `_input`, `_range`); a date-of-birth field
(`gha_datepicker_wrap`, with `gha_field_dob` "Date of Birth" and the
placeholder `DD / MM / YYYY`); city, country and mobile fields; the open
language and dial-code dropdowns; `gha_split_disabled` ("Bill splitting isn't
available while DISCOVERY Dollars are applied. Remove the redemption to split
the bill."); tier-status strings (`gha_status_keep` "Keep {{tier}}: {{amount}}
to go", `gha_status_secured`); `items_empty`; `gha_terms_empty`; the in-sheet
Powered by; and `gha_burn_bill_remaining` "Remaining to pay".

### 9.3 What to do with this in a guide

- **Document 9.1 as production.** It is reachable today. Capture it from a live
  session and add it to the catalogue; it is the largest hole in this reference.
- **Do not document 9.2 as guest states.** Present them, if at all, as evidence
  of intent: a self-service recovery path that was designed, styled, written and
  then left unwired. That is a finding worth putting in front of the programme
  team on its own.
- **Do not mock 9.2 up as though it shipped.** The CSS is real and the copy is
  real, but no shipped code composes them, so any layout would be invention.

## 10. Copy the app ships but never shows

19 of the 140 keys in the copy deck are never rendered by the journey as
reproduced. Several are the missing halves of states in section 9, and they are
the best available evidence of what those states say.

The live deck holds **730 keys, 249 of them `gha_*`**, against 140 here. All 139
keys the two decks share match **exactly, character for character**, which
validates the original capture. The 116 `gha_*` keys we did not have are in
`reference/live-copy-deck.json` and are quoted through section 9 where they
explain a state.

| Key | English value |
| --- | --- |
| `gha_terms_empty` | Terms & Conditions are not available at this venue. |
| `gha_page_action_apply_reward_title` | View Bill |
| `gha_page_action_earn_title` | Earn D$ |
| `gha_page_action_burn_title` | Burn D$ |
| `gha_page_action_burn_subtitle_idle` | Redeem D$ on your current bill |
| `gha_page_action_burn_subtitle_empty` | No active bill yet |
| `gha_page_action_burn_subtitle_already` | DISCOVERY Dollars already applied to this bill |
| `gha_page_load_failed` | Unable to load GHA DISCOVERY. Please try again. |
| `gha_burn_items_empty` | No items on this check yet. |
| `gha_burn_bill_discount` | Discount |
| `gha_burn_discount_retrying` | Retrying… |
| `gha_no_eligible_spend` | Nothing on this bill is eligible for DISCOVERY Dollar redemption. |
| `gha_burn_failed` | We couldn't apply your DISCOVERY Dollars. Please try again. |
| `gha_burn_earn_only_body` | Your bill must be at least {{amount}} (D$10) to redeem DISCOVERY Dollars on this check. You can still earn D$ from this visit. |
| `gha_burn_earn_only_no_eligible` | Nothing on this bill is currently eligible for DISCOVERY Dollar redemption. You can still earn D$ from this visit. |
| `gha_burn_potential_earn` | You'll earn |
| `gha_burn_signin_required` | Please sign in to GHA DISCOVERY first. |
| `gha_auth_generic_error` | Something went wrong. Please try again. |
| `gha_redeem_success_body` | D${{amount}} will be applied to the bill when you pay |

Four observations for the guide:

- The `_with_table` variants are the ones that render; the plain
  `gha_page_action_*` strings are the fallbacks for a session with no table.
- `gha_auth_generic_error` is the only server-side sign-in failure string, and
  the journey as reproduced never reaches it. A wrong password is therefore an
  **uncaptured** state, which matters because it is where the `/dev/` redesign
  starts.
- Three separate strings cover the earn-only fallback — low balance, bill too
  small, nothing eligible — and only the first is rendered.
- `gha_redeem_success_body` is a redemption string, so the enrolment success
  drawer's body sentence in the mockup is the mockup's own invention. See
  section 11.

The full deck, all 140 keys, is `LABELS` in `/js/data.js`.

---

## 11. What is verified, and what is not

This matters for a guide, because it bounds how much to trust each part.

**Verified against the live page** (loaded in a browser and captured): the guest
landing, the Terms & Conditions sheet, the sign-in sheet and the join form. The
mockup matches these closely.

**Verified against the live bundle** on 16 September 2026 (section 13): all copy,
and the presence and byte-identity of every CSS module. Copy fidelity is exact.

**Confirmed by the product owner:** Cinnamon's outlets run the single **View
Bill on {table}** card, not the two-card layout, and table labels take the form
`B12`. This settles open question 1 below, and the mockup now defaults to it.

**Reconstructed from the shipped JavaScript bundles**, not observed, because
there were no member credentials: the member landing, and the earn and burn
screens, from `GhaDiscoveryPage`, `GhaDiscoverySigninModal`, `GhaHeroCover`,
`GhaDiscoveryEarnPage`, `GhaDiscoveryBurnPage` and `burnStyles`. Structure,
wording and styling should be right; the exact live composition of those screens
has not been confirmed. **This is the main thing to check with someone who has a
member login.**

**Known to be invented**, and to be replaced before anything is published:

- The venue and bill. Dreams & Beats, seven lines, LKR 64,433.00. The member is
  a placeholder Titanium member — Gavin Matthew, 1346942045, D$148.
- The two POS failure reasons — "Check is open on another terminal" and "POS
  check is locked by another terminal". Live, these are whatever the till
  returns.
- The enrolment success drawer's body sentence (section 10).
- The LKR 302 per D$ conversion rate.
- The timestamp format on the redemption confirmation.

**Open questions.** Two of the five in `HANDOFF.md` section 8 are now closed:
the card variant (confirmed above), and what a guest sees with no camera after a
token expires — nothing, because the scanner is unwired (section 9.2). Three
remain, and all three are operational rather than technical: how the POS
represents a successful redemption when the cashier closes the check; what a
colleague does if a guest changes their mind after redeeming, given the UI says
it cannot be undone from the phone; and whether "open a new check" is really the
intended answer to two members on one bill.

---

## 12. Regenerating

```bash
node reference/capture.mjs                 # all 49 states, 1×
node reference/capture.mjs --scale=2       # retina
node reference/capture.mjs --only=burn-discount-failed,earn-confirm-success
```

The script serves the repository, drives `window.GHA_MOCK` (the capture hook in
`js/app.js`), waits for fonts and images to decode, and writes `shots/<id>.png`
plus `shots/<id>-full.png` for the states marked `"full": true`. It reports any
console error, page error or failed request, and exits non-zero if it finds one.

It changes nothing about the page: it loads with `?controls=0` so the floating
mock button is not rendered, and the scroll containers are unclipped for the
full-length shots by injected CSS only.

**Taking your own screenshots.** The floating ☰ can be hidden three ways, so it
never lands in a capture: add `?controls=0` to the URL, use **Hide this button**
in the mock panel, or press **M**. The choice is remembered per browser, so a
batch of screenshots stays clean across reloads; `?controls=1` or another press
of **M** brings it back. The `/dev/` prototype has the same option, under
Presentation in the reviewer drawer.

To add a state, add an entry to `states.json` with the `patch` that produces it
and re-run. The gallery picks it up with no further work.

---

## 13. Verifying against the live bundle

The app is a client-rendered single-page app, and its JavaScript, CSS and
translation files are public static assets. **No login and no member data are
needed** to verify copy, stylesheets or which components ship — which is how
sections 9 and 10 were checked. Nothing is uploaded; this is read-only.

The chunk hashes change on every deploy, so always re-derive them rather than
reusing the names below.

```bash
# 1. the SPA shell, for the entry bundle name
curl -s https://qr.mydigimenu.com/ | grep -oE 'src="[^"]+\.js"'

# 2. the entry bundle names every lazily-loaded chunk
curl -s https://qr.mydigimenu.com/assets/index-<hash>.js > entry.js
grep -oE '"assets/[^"]*[Gg]ha[^"]*\.js"' entry.js | sort -u
grep -oE '"assets/[^"]*\.css"' entry.js | sort -u   # the five GHA CSS modules

# 3. the translation file holds the whole English deck as embedded JSON
curl -s https://qr.mydigimenu.com/assets/i18n-<hash>.js > i18n.js
```

Two traps worth knowing:

- **Translation values are `"key":"value"` pairs inside the i18n chunk**, but the
  bundler escapes `$` as `\$` so template interpolation cannot fire. That is not
  valid JSON escaping, so a strict parser fails on exactly the strings that
  mention `D$`. Strip `\$` to `$` before parsing.
- **A key existing in the deck does not mean the state ships.** Check whether any
  component chunk references the key, and whether it might be built dynamically
  (for example `` t(`gha_session_${kind}_title`) ``). Section 9.2 exists because
  a great deal of copy is in the deck with nothing shipped that renders it.

As captured on 16 September 2026: 8 GHA JavaScript chunks
(`GhaDiscoveryPage`, `GhaDiscoveryBurnPage`, `GhaDiscoveryEarnPage`,
`GhaDiscoverySigninModal`, `GhaDiscoveryResetPasswordPage`, `GhaHeroCover`,
`ghaDiscoveryHelpers`, `useGhaDiscovery`) and 5 CSS modules
(`GhaDiscoveryPage`, `GhaDiscoverySigninModal`, `GhaHeroCover`, `burnStyles`,
`titanium`) — the same five this repository mirrors as
`css/{page,modal,hero,burn,titanium}.css`. Since 5 September the only CSS change
is 9 classes added to the modal module for the password-rules checklist.
