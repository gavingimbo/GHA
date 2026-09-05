/**
 * Reviewer drawer — /dev/ only, never part of the guest experience.
 *
 * This is the one place the machinery is named out loud: POS, GHA, session
 * tokens, idempotency keys. Everything a stakeholder needs to walk the whole
 * product, not only the happy path.
 */
(function () {
  'use strict';

  window.CD = window.CD || {};
  window.CD.devMode = true;

  const A = () => window.CD.app;
  const M = window.CD.model;

  /* -------------------------------------------------------------- scenarios */

  const GROUPS = [
    {
      title: 'Journeys',
      hint: 'The two prototypes the brief asks for, start to finish.',
      opts: [
        { id: 'j-happy', label: 'Happy path (default)', run: happyPath },
        { id: 'j-forgot', label: 'Forgot password', run: forgotPassword },
        { id: 'j-join', label: 'New member enrolment', run: (s) => { reset(s); s.authState.deviceSession = false; go('join'); } },
        { id: 'j-early', label: 'Early recognition (concept)', run: earlyRecognition }
      ]
    },
    {
      title: 'Authentication',
      opts: [
        { id: 'a-out', label: 'Logged out', run: (s) => { s.authState.deviceSession = false; s.authState.authenticated = false; s.authState.email = ''; s.ui.authConcept = 'auto'; go('auth'); } },
        { id: 'a-session', label: 'Existing GHA session', run: (s) => { s.authState.deviceSession = true; s.authState.email = ''; s.authState.authenticated = false; go('auth'); } },
        { id: 'a-otp', label: 'Email OTP', concept: true, run: (s) => { seedEmail(s); s.ui.authConcept = 'otp'; s.ui.otpValue = ''; go('otp'); } },
        { id: 'a-magic', label: 'Magic link', concept: true, run: (s) => { seedEmail(s); s.ui.authConcept = 'magic'; go('magic'); } },
        { id: 'a-passkey', label: 'Passkey', concept: true, run: (s) => { seedEmail(s); s.ui.authConcept = 'passkey'; go('passkey'); } },
        { id: 'a-pw', label: 'Password', run: (s) => { seedEmail(s); s.ui.forcePasswordFail = false; s.ui.passwordError = ''; s.ui.authConcept = 'password'; go('password'); } },
        { id: 'a-pw-bad', label: 'Wrong password', run: (s) => { seedEmail(s); s.ui.forcePasswordFail = true; s.ui.passwordValue = 'Hillcrest94'; s.ui.passwordError = window.CD.data.COPY.pw_wrong; go('password'); } },
        { id: 'a-forgot', label: 'Forgot password', run: (s) => { seedEmail(s); s.authState.recoveryInProgress = true; go('reset'); } },
        { id: 'a-sent', label: 'Reset link sent', run: (s) => { seedEmail(s); s.authState.recoveryInProgress = true; go('reset-sent'); } },
        { id: 'a-reset-ok', label: 'Reset success', run: (s) => { seedEmail(s); go('reset-return'); } }
      ]
    },
    {
      title: 'Member',
      opts: ['SILVER', 'GOLD', 'PLATINUM', 'TITANIUM'].map((k) => ({
        id: 'm-' + k,
        label: window.CD.data.TIERS[k].label,
        run: (s) => { s.authState.tier = k; s.billState.dsSelection = Math.min(40, M.bill(s).dsUsable); }
      }))
    },
    {
      title: 'Bill',
      hint: 'The check behind the QR, as the POS reports it.',
      opts: [
        { id: 'b-loading', label: 'Loading', run: (s) => { s.billState.status = 'loading'; go('loading'); } },
        { id: 'b-open', label: 'Open with items', run: (s) => { M.removeLateItem(s); s.billState.status = 'open'; authAnd('bill'); } },
        { id: 'b-updated', label: 'Bill updated', run: (s) => { M.applyLateItem(s); s.billState.status = 'updated'; authAnd('bill-updated'); } },
        { id: 'b-empty', label: 'No bill yet', run: (s) => { s.billState.status = 'empty'; authAnd('no-bill'); } },
        { id: 'b-closed', label: 'Bill settled', run: (s) => { s.billState.status = 'closed'; authAnd('closed'); } },
        { id: 'b-expired', label: 'Session expired', run: (s) => { s.settlementSession.status = 'expired'; go('expired'); } }
      ]
    },
    {
      title: 'Benefit',
      opts: [
        { id: 'x-check', label: 'Checking', run: (s) => { s.billState.benefitStatus = 'checking'; authAnd('member'); } },
        { id: 'x-applied', label: 'Applied', run: (s) => { s.billState.benefitStatus = 'applied'; authAnd('member'); } },
        { id: 'x-none', label: 'Not offered here', run: (s) => { s.billState.benefitStatus = 'unavailable'; authAnd('member'); } },
        { id: 'x-rejected', label: 'Rejected by POS', run: (s) => { s.billState.benefitStatus = 'rejected'; authAnd('rejected'); } },
        { id: 'x-locked', label: 'Another member attached', run: (s) => { s.billState.benefitStatus = 'locked'; authAnd('locked'); } }
      ]
    },
    {
      title: 'D$',
      hint: 'Redemption states, including the two that must never offer a retry.',
      opts: [
        { id: 'd-none', label: 'Unavailable (< D$ 10)', run: (s) => { s.authState.tier = 'SILVER'; s.billState.dsStatus = 'available'; authAnd('bill'); } },
        { id: 'd-ok', label: 'Available', run: (s) => { s.billState.dsStatus = 'available'; s.ui.pendingResolution = 'success'; authAnd('bill'); } },
        { id: 'd-applying', label: 'Applying', run: (s) => { s.transactionState.status = 'applying'; s.transactionState.idempotencyKey = M.ref('idem'); authAnd('applying'); } },
        { id: 'd-applied', label: 'Applied', run: (s) => { s.billState.dsApplied = M.selection(s); s.transactionState.status = 'applied'; s.transactionState.redemptionId = M.ref('DSC'); s.transactionState.appliedAt = Date.now(); authAnd('success'); } },
        { id: 'd-failed', label: 'Confirmed failure', run: (s) => { s.billState.dsApplied = 0; s.transactionState.status = 'failed'; authAnd('ds-failed'); } },
        { id: 'd-pending', label: 'Confirming', run: (s) => { s.transactionState.status = 'pending'; s.transactionState.redemptionId = M.ref('DSC'); authAnd('ds-pending'); } },
        { id: 'd-recon', label: 'Needs reconciliation', run: (s) => { s.transactionState.status = 'reconcile'; s.transactionState.reconciliationRequired = true; s.transactionState.redemptionId = M.ref('DSC'); authAnd('ds-reconcile'); } }
      ]
    },
    {
      title: 'Outcome of the next apply',
      hint: 'What the simulated posting resolves to when the guest confirms.',
      opts: [
        { id: 'o-success', label: 'Success', run: (s) => { s.ui.pendingResolution = 'success'; } },
        { id: 'o-pending', label: 'Ambiguous, then success', run: (s) => { s.ui.pendingResolution = 'pending'; } },
        { id: 'o-failed', label: 'Confirmed failure', run: (s) => { s.ui.pendingResolution = 'failed'; } },
        { id: 'o-recon', label: 'Needs reconciliation', run: (s) => { s.ui.pendingResolution = 'reconcile'; } }
      ]
    },
    {
      title: 'Network and systems',
      opts: [
        { id: 'n-ok', label: 'All healthy', run: (s) => { s.system = { gha: 'ok', pos: 'ok', latency: 'normal' }; } },
        { id: 'n-gha', label: 'GHA offline', run: (s) => { s.system.gha = 'down'; go('offline'); } },
        { id: 'n-pos', label: 'Simphony offline', run: (s) => { s.system.pos = 'down'; s.billState.benefitStatus = 'rejected'; authAnd('rejected'); } },
        { id: 'n-slow', label: 'Delayed response', run: (s) => { s.system.latency = 'slow'; } }
      ]
    },
    {
      title: 'Staff',
      opts: [
        { id: 's-view', label: 'Show this to your server', run: () => go('staff') }
      ]
    },
    {
      title: 'Presentation',
      opts: [
        { id: 'p-dev', label: 'Developer notes on', run: () => { window.CD.devMode = true; } },
        { id: 'p-guest', label: 'Guest mode', run: () => { window.CD.devMode = false; } },
        { id: 'p-reset', label: 'Reset prototype', run: () => { A().reset(); } }
      ]
    }
  ];

  /* --------------------------------------------------------------- helpers */

  let queued = null;

  function go(screen) { queued = screen; }
  function seedEmail(s) {
    s.authState.deviceSession = false;
    s.authState.email = s.authState.email || window.CD.data.MEMBER.email;
  }
  function reset(s) {
    A().clearTimers();
    Object.assign(s, M.freshState(), { authState: Object.assign(M.freshState().authState, { tier: s.authState.tier }) });
  }
  /** Most states only make sense once the member is recognised. */
  function authAnd(screen) {
    const s = A().getState();
    s.authState.authenticated = true;
    s.authState.method = s.authState.method || 'session';
    s.authState.email = s.authState.email || window.CD.data.MEMBER.email;
    go(screen);
  }

  function happyPath(s) {
    reset(s);
    s.authState.deviceSession = true;
    go('landing');
  }

  function forgotPassword(s) {
    reset(s);
    s.authState.deviceSession = false;
    s.ui.authConcept = 'password';
    s.ui.forcePasswordFail = true;
    go('landing');
  }

  function earlyRecognition(s) {
    reset(s);
    s.authState.deviceSession = true;
    s.authState.authenticated = true;
    s.authState.method = 'session';
    s.authState.email = window.CD.data.MEMBER.email;
    s.billState.benefitStatus = 'applied';
    go('bill');
  }

  /* ----------------------------------------------------------------- mount */

  let drawer, toggle, active = { 'j-happy': true, 'm-TITANIUM': true, 'o-success': true, 'n-ok': true, 'p-dev': true };

  function mount() {
    toggle = document.createElement('button');
    toggle.className = 'devtoggle';
    toggle.setAttribute('aria-label', 'Reviewer controls');
    toggle.innerHTML = '&#9776;';
    toggle.addEventListener('click', () => drawer.classList.toggle('is-open'));

    drawer = document.createElement('aside');
    drawer.className = 'devdrawer';
    drawer.innerHTML =
      '<div class="devdrawer__head"><div><h2>Reviewer controls</h2>' +
      '<p>Not part of the guest experience. Jump to any state.</p></div>' +
      '<button class="devdrawer__close" aria-label="Close">&times;</button></div>' +
      '<div class="devdrawer__body">' +
        GROUPS.map((g) =>
          '<div class="devgroup"><h3>' + g.title + '</h3>' +
          (g.hint ? '<p class="devgroup__hint">' + g.hint + '</p>' : '') +
          '<div class="devopts">' +
            g.opts.map((o) =>
              '<button class="devopt' + (o.concept ? ' devopt--concept' : '') + '" data-opt="' + o.id + '">' +
              o.label + '</button>').join('') +
          '</div></div>').join('') +
        '<div class="devlegend"><b>·</b> concept — requires GHA capability</div>' +
        '<div class="devgroup"><h3>Session state</h3><div class="devstate" id="devstate"></div>' +
        '<p class="devnote">The settlement session is created once, at QR scan. Every recovery path above resolves back into it.</p></div>' +
      '</div>';

    drawer.querySelector('.devdrawer__close').addEventListener('click', () => drawer.classList.remove('is-open'));
    drawer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-opt]');
      if (!btn) return;
      const id = btn.getAttribute('data-opt');
      const group = GROUPS.find((g) => g.opts.some((o) => o.id === id));
      const opt = group.opts.find((o) => o.id === id);
      group.opts.forEach((o) => delete active[o.id]);
      active[id] = true;
      queued = null;
      A().clearTimers();
      A().setState((s) => { opt.run(s); });
      if (queued) A().go(queued, { replace: true });
      A().render();
    });

    document.body.appendChild(toggle);
    document.body.appendChild(drawer);
  }

  function sync(state) {
    if (!drawer) return;
    drawer.querySelectorAll('[data-opt]').forEach((b) => {
      b.classList.toggle('is-on', !!active[b.getAttribute('data-opt')]);
    });
    const b = M.bill(state);
    const out = drawer.querySelector('#devstate');
    if (!out) return;
    out.textContent = JSON.stringify({
      settlementSession: {
        sessionId: state.settlementSession.sessionId,
        checkId: state.settlementSession.checkId,
        checkIdentity: state.settlementSession.checkIdentity,
        status: state.settlementSession.status,
        expiresAt: M.fmt.clock(state.settlementSession.expiresAt),
        originalReturnPath: state.settlementSession.originalReturnPath
      },
      authState: {
        method: state.authState.method,
        email: state.authState.email || null,
        memberId: state.authState.memberId,
        tier: state.authState.tier,
        authenticated: state.authState.authenticated,
        recoveryInProgress: state.authState.recoveryInProgress
      },
      billState: {
        version: b.version,
        status: state.billState.status,
        subtotal: b.subtotal,
        eligibleSubtotal: b.eligibleSubtotal,
        discount: b.discount,
        serviceCharge: b.serviceCharge,
        tax: b.tax,
        total: b.total,
        dsEligible: b.dsUsable,
        dsApplied: b.dsApplied,
        amountDue: b.amountDue
      },
      transactionState: {
        status: state.transactionState.status,
        idempotencyKey: state.transactionState.idempotencyKey,
        redemptionId: state.transactionState.redemptionId,
        reconciliationRequired: state.transactionState.reconciliationRequired
      },
      screen: state.ui.screen
    }, null, 1);
  }

  window.CD.dev = { mount, sync };
})();
