# `/dev/` — Cinnamon DISCOVERY settlement experience (concept)

A clickable, state-driven prototype of a redesigned dining settlement journey,
built on top of the existing check-bound QR architecture. It is a **UX and
product redesign**, not a change to how the session token, the check lock or the
POS posting work.

The mockup of the **current** production journey stays at the repository root
(`/index.html`). This directory is the proposal, and the two can be compared
side by side.

Open `dev/index.html` from any static server:

```
npx http-server -p 8181 .    # then open http://127.0.0.1:8181/dev/
```

Sized for a phone (390 × 844, responsive to 360). On a desktop it renders inside
a review frame.

---

## The one idea

The current product asks the guest to operate the integration. This one hides
it. Everything below serves a single sentence:

> Cinnamon recognised my bill. DISCOVERY recognised me. My benefit appeared.
> I chose whether to use D$. I was done.

Four meaningful decisions after the QR scan: continue, review, how many D$,
confirm.

---

## What changed, and why

| Area | Now | Here |
| --- | --- | --- |
| Landing | Marketing hero, three perk cards, then a sign-in link | The bill, the amount, and one action |
| Authentication | Password form first | Existing session → passkey → OTP or magic link → password → recovery |
| Forgot password | Opens ghadiscovery.com in a new tab; the guest finds their own way back | Stays inside the settlement session and resumes it automatically |
| Earn and burn | Two separate journeys from a member dashboard | One bill screen; earning is attached automatically after authentication |
| "Burn D$" | Programme vocabulary on screen | Use D$ |
| Failure copy | POS reasons, token states, retry instructions | Guest language, with a clean handoff to a colleague where operations are genuinely needed |
| Check changed | Implies a new QR is needed | Refreshes the same bill; a new QR only when the check identity itself changes |

The **highest-priority improvement** is password recovery. The reviewer journey
for it is in the drawer under **Journeys → Forgot password**: wrong password →
reset → holding screen → return → straight back to the same bill. No second QR
scan, no re-entered email, no GHA account homepage.

---

## Reviewer controls

The ☰ button, bottom-left, is not part of the guest experience. It jumps
directly to every state the real product only reaches through the POS and the
GHA API:

- **Journeys** — happy path, forgot password, enrolment, early recognition
- **Authentication** — logged out, existing session, OTP, magic link, passkey,
  password, wrong password, forgot password, reset link sent, reset success
- **Member** — Silver, Gold, Platinum, Titanium (the bill recalculates)
- **Bill** — loading, open, updated, no bill, settled, session expired
- **Benefit** — checking, applied, not offered, rejected, another member attached
- **D$** — unavailable, available, applying, applied, confirmed failure,
  confirming, needs reconciliation
- **Outcome of the next apply** — what a confirmed redemption resolves to
- **Network and systems** — GHA offline, Simphony offline, delayed response
- **Staff** — the "show this to your server" view
- **Presentation** — developer notes on / guest mode / reset

Options marked with a small dot are **concepts that require GHA capability**
(passkey, OTP, magic link). They are marked in the drawer and in the developer
notes, never in guest-facing copy.

The drawer also shows the live session state — `settlementSession`, `authState`,
`billState`, `transactionState` — so a reviewer can watch the settlement session
survive every recovery path.

**Guest mode** hides the dashed "developer detail" disclosures. Use it when
showing the flow to anyone who should see only what a guest sees.

---

## Product rules the prototype enforces

1. The settlement session is created once, at QR scan, and is never torn down to
   recover from anything.
2. The email is never cleared after a wrong password, and never asked for twice.
3. Redemption always takes one explicit confirmation, and only one.
4. A duplicate redemption is impossible: the idempotency key is minted once and
   the action is disabled while a posting is in flight.
5. When a transaction outcome is unknown, no retry is offered until the status
   is confirmed.
6. A changed bill refreshes; only a changed check identity requires a new QR.
7. A second member on a locked check routes to a colleague without naming or
   exposing the first member.
8. No guest-facing string contains a backend message, a system name, or the word
   "burn".
9. Financial state is never presented as final before it is confirmed.
10. The staff handoff view shows check, table, outlet, member state, benefit
    state, redemption state, a recovery instruction and a reference — and no
    account data.

---

## Figures

The fixtures are internally consistent rather than copied from the brief's
illustrative numbers, so every screen adds up:

| Line | Titanium |
| --- | --- |
| Items subtotal | LKR 31,600 |
| DISCOVERY benefit (15% on eligible items) | − LKR 4,500 |
| Service charge (10%) | LKR 2,710 |
| Taxes (18%) | LKR 5,366 |
| **Total** | **LKR 35,176** |
| D$ balance | D$ 148 |
| Usable on this bill | up to D$ 84 |
| Guest uses | D$ 40 (LKR 12,080) |
| Remaining to pay | LKR 23,096 |

One line — a cigar — is flagged ineligible, so the eligible subtotal, the
benefit and the D$ ceiling all differ from the bill total, as the programme
rules require. Service charge and taxes never enter D$ eligibility. The local
rate (LKR 302 per D$) is a placeholder; the real conversion is server-side.

Tiers carry different discount rates, earn rates and balances, so switching to
Silver in the drawer shows the "below D$ 10" path without any other change.

---

## Structure

```
index.html        the shell (one page, no framework)
css/app.css       the design system — brand palette, spacing scale, components
css/dev.css       the reviewer drawer, and the developer disclosures
js/data.js        venue, tiers, member, items, and the guest copy deck
js/icons.js       the icon set
js/model.js       the four state layers and every derived figure
js/screens.js     one function per screen; each returns nav, body and footer
js/app.js         router, actions, and the simulated round trips
js/dev.js         the reviewer drawer — the only place systems are named
```

Type is IvyMode GHA Semi Bd for display and Jost for body, both already in
`/assets/fonts`, set against the Cinnamon palette (Cinnamon Purple `#612D87`,
Midnight Blue `#202A66`, Dune `#A39383`).

---

## Not built, deliberately

- No real authentication, network or POS. Every round trip is a timer.
- The camera QR scanner is a destination, not a screen.
- The OS passkey and biometric sheets are system-owned and are never simulated
  inside the page; the prototype only shows what precedes them.
- No loyalty dashboard, no perk carousel, no upsell after settlement.
