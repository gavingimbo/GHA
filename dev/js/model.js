/**
 * The four state layers from the product brief, as one client-side model.
 *
 *   Layer A  settlementSession — the check context, created at QR scan.
 *   Layer B  authState        — who the member is, and how they proved it.
 *   Layer C  billState        — benefit + D$ eligibility and application.
 *   Layer D  transactionState — the financial truth, confirmed downstream.
 *
 * The rule the whole redesign turns on: every child flow (password reset, OTP,
 * magic link, enrolment, an error) resolves back into the SAME settlement
 * session. Nothing in here ever tears the session down to recover.
 */
(function () {
  'use strict';

  const { VENUE, TIERS, MEMBER, ITEMS, LATE_ITEM } = window.CD.data;

  const nowPlus = (mins) => Date.now() + mins * 60000;
  const ref = (prefix) =>
    prefix + '-' + Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  /* --------------------------------------------------------- initial state */

  function freshState() {
    return {
      // Layer A — created by the QR scan, never recreated by a child flow.
      settlementSession: {
        sessionId: 2408,
        venueId: 30860,
        tableId: 211064,
        checkId: '10457',
        checkIdentity: 'chk_10457_211064',
        status: 'active',                    // active | expired | superseded
        expiresAt: nowPlus(60),
        originalReturnPath: '/dev/#settle'
      },

      // Layer B — GHA's to own. MyMenu holds nothing beyond this.
      authState: {
        method: null,                        // session | passkey | otp | magic | password
        email: '',
        memberId: null,
        tier: MEMBER.tier,
        authenticated: false,
        recoveryInProgress: false,
        deviceSession: true                  // a live GHA session on this device
      },

      // Layer C
      billState: {
        version: 1,
        status: 'open',                      // loading | open | updated | empty | closed
        items: ITEMS.slice(),
        benefitStatus: 'applied',            // checking | applied | unavailable | rejected | locked
        benefitReason: 'Discount privilege not configured for this revenue centre (POS 4102).',
        dsStatus: 'available',               // unavailable | available
        dsApplied: 0,
        dsSelection: 40
      },

      // Layer D
      transactionState: {
        status: 'idle',                      // idle | applying | applied | failed | pending | reconcile
        idempotencyKey: null,
        redemptionId: null,
        reconciliationRequired: false,
        appliedAt: null
      },

      // System conditions the reviewer can impose. Guest copy never names these.
      system: { gha: 'ok', pos: 'ok', latency: 'normal' },

      // View state.
      ui: {
        screen: 'landing',
        sheet: null,
        joinStep: 1,
        showItems: false,
        showPassword: false,
        passwordError: '',
        emailError: '',
        otpError: '',
        pendingResolution: 'success',        // how the ambiguous D$ state resolves
        authConcept: 'auto',                 // auto | otp | magic | passkey | password
        history: []
      }
    };
  }

  /* ----------------------------------------------------------- derivations */

  function tier(state) {
    return TIERS[state.authState.tier] || TIERS.TITANIUM;
  }

  /** The bill, computed. Service charge and taxes never enter D$ eligibility. */
  function bill(state) {
    const t = tier(state);
    const items = state.billState.items;
    const subtotal = items.reduce((n, i) => n + i.total, 0);
    const eligibleSubtotal = items.reduce((n, i) => n + (i.eligible ? i.total : 0), 0);

    const benefitLive = state.billState.benefitStatus === 'applied';
    const discountPct = benefitLive ? t.discountPct : 0;
    const discount = Math.round(eligibleSubtotal * discountPct / 100);

    const net = subtotal - discount;
    const serviceCharge = Math.round(net * VENUE.serviceChargePct / 100);
    const tax = Math.round((net + serviceCharge) * VENUE.taxPct / 100);
    const total = net + serviceCharge + tax;

    // Redeemable spend: discounted eligible items only.
    const eligibleAfterBenefit = eligibleSubtotal - discount;
    const dsEligible = Math.floor(eligibleAfterBenefit / VENUE.localPerDollar);
    const balance = t.balance;
    const dsUsable = Math.max(0, Math.min(dsEligible, balance));

    const dsApplied = state.billState.dsApplied;
    const dsValue = dsApplied * VENUE.localPerDollar;
    const amountDue = Math.max(0, total - dsValue);

    const earnEstimate = Math.floor((eligibleAfterBenefit * t.earnPct / 100) / VENUE.localPerDollar);

    return {
      version: state.billState.version,
      subtotal, eligibleSubtotal, discountPct, discount,
      serviceCharge, tax, total,
      balance, dsEligible, dsUsable, dsApplied, dsValue, amountDue,
      earnEstimate
    };
  }

  /** D$ can only be offered when the balance, the bill and the rules all allow it. */
  function dsOffered(state) {
    const b = bill(state);
    if (state.billState.dsStatus === 'unavailable') return false;
    if (b.balance < 10) return false;
    if (b.dsUsable < 10) return false;
    if (state.billState.status !== 'open' && state.billState.status !== 'updated') return false;
    return true;
  }

  function selection(state) {
    const b = bill(state);
    return Math.max(0, Math.min(state.billState.dsSelection, b.dsUsable));
  }

  /* ------------------------------------------------------------ formatting */

  const fmt = {
    money(n) {
      return VENUE.currency + ' ' + Math.round(n).toLocaleString('en-GB');
    },
    ds(n) { return 'D$ ' + Math.round(n); },
    maskEmail(email) {
      if (!email || email.indexOf('@') < 1) return 'your registered email';
      const [user, domain] = email.split('@');
      return user.slice(0, 1) + '•••••@' + domain;
    },
    clock(ts) {
      return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
  };

  /* ---------------------------------------------------- mutations (helpers) */

  function applyLateItem(state) {
    if (state.billState.items.some((i) => i.id === LATE_ITEM.id)) return;
    state.billState.items = state.billState.items.concat([LATE_ITEM]);
    state.billState.version += 1;
  }

  function removeLateItem(state) {
    state.billState.items = state.billState.items.filter((i) => i.id !== LATE_ITEM.id);
  }

  window.CD.model = { freshState, tier, bill, dsOffered, selection, fmt, ref, nowPlus, applyLateItem, removeLateItem };
})();
