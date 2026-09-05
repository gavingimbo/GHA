/**
 * Router + actions.
 *
 * One rule governs every branch below: CURRENT_SETTLEMENT_SESSION is created
 * once, by the QR scan, and is never torn down to recover from anything.
 * Authentication, password recovery, OTP, enrolment and every error resolve
 * back into it.
 */
(function () {
  'use strict';

  const S = window.CD.screens;
  const M = window.CD.model;
  const I = window.CD.icons;

  let state = M.freshState();
  let timers = [];

  const root = () => document.getElementById('app');

  function later(fn, ms) {
    const id = setTimeout(() => { timers = timers.filter((x) => x !== id); fn(); }, ms);
    timers.push(id);
    return id;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  /** Latency the reviewer imposes, applied to every simulated round trip. */
  function pace(ms) {
    if (state.system.latency === 'slow') return ms * 3;
    return ms;
  }

  /* ------------------------------------------------------------- resolution */

  const SCREENS = {
    landing: S.landing,
    auth: (st) => (st.authState.deviceSession && !st.authState.email ? S.authKnownSession(st) : S.authEmail(st)),
    'auth-otp-offer': S.authOtpOffer,
    passkey: S.authPasskey,
    otp: S.otp,
    magic: S.magic,
    password: S.password,
    reset: S.reset,
    'reset-sent': S.resetSent,
    'reset-return': S.resetReturn,
    member: S.member,
    bill: S.bill,
    applying: S.applying,
    success: S.success,
    done: S.done,
    join: S.join,
    'join-welcome': S.joinWelcome,
    'bill-updated': S.billUpdated,
    expired: S.expired,
    locked: S.locked,
    rejected: S.rejected,
    'no-bill': S.noBill,
    closed: S.closed,
    'ds-pending': S.dsPending,
    'ds-failed': S.dsFailed,
    'ds-reconcile': S.dsReconcile,
    offline: S.offline,
    staff: S.staff,
    loading: S.loading
  };

  /* ----------------------------------------------------------------- render */

  function render() {
    const fn = SCREENS[state.ui.screen] || S.landing;
    const view = fn(state);
    const nav = view.nav || {};

    // Preserve the caret across re-renders — never make the guest retype.
    const active = document.activeElement;
    const focusKey = active && (active.getAttribute('data-bind') || active.getAttribute('data-otp'));
    const focusIsOtp = active && active.hasAttribute && active.hasAttribute('data-otp');
    const caret = active && active.selectionStart;

    root().innerHTML =
      '<div class="topbar' + (nav.onCover ? ' topbar--onCover' : '') + '">' +
        '<span class="topbar__slot">' +
          (nav.back
            ? '<button class="iconbtn" data-act="nav:back" data-target="' + nav.back + '" aria-label="Back">' + I.back() + '</button>'
            : '') +
        '</span>' +
        '<span class="lockup"><span class="lockup__cinnamon">Cinnamon</span><span class="lockup__discovery">Discovery</span></span>' +
        '<span class="topbar__slot"></span>' +
      '</div>' +
      '<div class="scroll">' + view.body + '</div>' +
      (view.footer ? '<div class="footer">' + view.footer + '</div>' : '') +
      (state.ui.sheet === 'confirm' ? S.confirmSheet(state) : '') +
      (state.ui.sheet === 'terms' ? S.termsSheet(state) : '');

    if (focusKey) {
      const sel = focusIsOtp ? '[data-otp="' + focusKey + '"]' : '[data-bind="' + focusKey + '"]';
      const next = root().querySelector(sel);
      if (next) {
        next.focus();
        try { next.setSelectionRange(caret, caret); } catch (e) { /* number inputs */ }
      }
    }
    if (window.CD.dev) window.CD.dev.sync(state);
  }

  function go(screen, opts) {
    if (!(opts && opts.replace)) state.ui.history.push(state.ui.screen);
    state.ui.screen = screen;
    state.ui.sheet = null;
    render();
    const sc = root().querySelector('.scroll');
    if (sc) sc.scrollTop = 0;
  }

  function back(target) {
    if (target === 'back') {
      const prev = state.ui.history.pop() || 'landing';
      state.ui.screen = prev;
      state.ui.sheet = null;
      render();
      return;
    }
    if (target === 'join:back') { state.ui.joinStep = 1; render(); return; }
    go(target, { replace: true });
  }

  /* ------------------------------------------------------------ transitions */

  /** Authentication succeeded, by whichever method. Return to the settlement. */
  function authenticated(method) {
    state.authState.authenticated = true;
    state.authState.method = method;
    state.authState.memberId = 'GHA-881204371';
    state.authState.recoveryInProgress = false;
    if (!state.authState.email) state.authState.email = window.CD.data.MEMBER.email;

    if (state.system.gha !== 'ok') { go('offline'); return; }
    if (state.settlementSession.status === 'expired') { go('expired'); return; }
    if (state.billState.benefitStatus === 'locked') { go('locked'); return; }
    if (state.billState.benefitStatus === 'rejected') { go('rejected'); return; }

    go('member');
    if (state.billState.benefitStatus === 'checking') {
      later(() => {
        if (state.billState.benefitStatus !== 'checking') return;
        state.billState.benefitStatus = 'applied';
        render();
      }, pace(1400));
    }
  }

  function openBill() {
    if (state.settlementSession.status === 'expired') return go('expired');
    if (state.system.gha !== 'ok') return go('offline');
    if (state.billState.status === 'empty') return go('no-bill');
    if (state.billState.status === 'closed') return go('closed');
    if (state.billState.benefitStatus === 'locked') return go('locked');
    if (state.billState.benefitStatus === 'rejected') return go('rejected');
    go('bill');
  }

  function applyDs() {
    const sel = M.selection(state);
    const ts = state.transactionState;
    if (ts.status === 'applying') return;               // duplicate submission is impossible
    ts.idempotencyKey = ts.idempotencyKey || M.ref('idem');
    ts.status = 'applying';
    state.ui.sheet = null;
    go('applying');

    later(() => {
      const outcome = state.ui.pendingResolution;
      if (outcome === 'failed') {
        ts.status = 'failed';
        return go('ds-failed');
      }
      if (outcome === 'reconcile') {
        ts.status = 'reconcile';
        ts.reconciliationRequired = true;
        ts.redemptionId = M.ref('DSC');
        return go('ds-reconcile');
      }
      if (outcome === 'pending') {
        ts.status = 'pending';
        ts.redemptionId = M.ref('DSC');
        go('ds-pending');
        // The UI confirms the downstream status before it offers a retry.
        return later(() => {
          if (state.transactionState.status !== 'pending') return;
          ts.status = 'applied';
          ts.appliedAt = Date.now();
          state.billState.dsApplied = sel;
          go('success');
        }, pace(3200));
      }
      ts.status = 'applied';
      ts.appliedAt = Date.now();
      ts.redemptionId = M.ref('DSC');
      state.billState.dsApplied = sel;
      go('success');
    }, pace(1600));
  }

  /* ---------------------------------------------------------------- actions */

  const ACTIONS = {
    'auth:start': () => {
      if (state.system.gha !== 'ok') return go('offline');
      if (state.settlementSession.status === 'expired') return go('expired');
      go('auth');
    },
    'auth:session': () => authenticated('session'),
    'auth:signout': () => { state.authState.deviceSession = false; go('auth', { replace: true }); },
    'auth:email': () => {
      const email = (state.authState.email || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        state.ui.emailError = window.CD.data.COPY.auth_email_invalid;
        return render();
      }
      state.ui.emailError = '';
      const c = state.ui.authConcept;
      if (c === 'password') return go('password');
      if (c === 'magic') return go('magic');
      if (c === 'passkey') return go('passkey');
      go('auth-otp-offer');
    },
    'auth:changeEmail': () => { state.authState.deviceSession = false; go('auth'); },
    'auth:password': () => { state.ui.passwordError = ''; go('password'); },
    'auth:another': () => { state.authState.deviceSession = false; state.ui.passwordError = ''; go('auth'); },
    'auth:password:reveal': () => { state.ui.showPassword = !state.ui.showPassword; render(); },
    'auth:password:submit': () => {
      const value = state.ui.passwordValue || '';
      if (!value) { state.ui.passwordError = 'Enter your password to continue.'; return render(); }
      if (state.ui.forcePasswordFail) {
        state.ui.passwordError = window.CD.data.COPY.pw_wrong;   // email is never cleared
        return render();
      }
      state.ui.passwordError = '';
      authenticated('password');
    },
    'auth:otp:send': () => { state.ui.otpValue = ''; state.ui.otpError = ''; go('otp'); },
    'auth:otp:verify': () => {
      if ((state.ui.otpValue || '').length < 6) return;
      authenticated('otp');
    },
    'auth:magic:return': () => authenticated('magic'),
    'auth:passkey:go': () => { go('loading'); later(() => authenticated('passkey'), pace(900)); },
    'auth:resume': () => authenticated(state.authState.method || 'password'),

    'reset:start': () => {
      state.authState.recoveryInProgress = true;
      if (!state.authState.email) state.authState.email = window.CD.data.MEMBER.email;
      go('reset');
    },
    'reset:send': () => go('reset-sent'),
    'reset:resend': () => render(),
    'reset:return': () => {
      state.ui.forcePasswordFail = false;
      state.ui.passwordValue = '';
      go('reset-return');
      later(() => { if (state.ui.screen === 'reset-return') ACTIONS['auth:resume'](); }, pace(850));
    },

    'bill:open': () => openBill(),
    'bill:toggleItems': () => { state.ui.showItems = !state.ui.showItems; render(); },

    'ds:set': (el) => {
      state.billState.dsSelection = parseInt(el.getAttribute('data-value'), 10) || 0;
      render();
    },
    'ds:confirm': () => { state.ui.sheet = 'confirm'; render(); },
    'ds:cancel': () => { state.ui.sheet = null; render(); },
    'ds:apply': () => applyDs(),
    'ds:retry': () => {
      state.transactionState = { status: 'idle', idempotencyKey: null, redemptionId: null, reconciliationRequired: false, appliedAt: null };
      go('bill');
    },
    'ds:skip': () => { state.billState.dsApplied = 0; go('success'); },

    'benefit:retry': () => {
      state.billState.benefitStatus = 'checking';
      go('member');
      later(() => { state.billState.benefitStatus = 'applied'; render(); }, pace(1400));
    },
    'system:retry': () => {
      if (state.system.gha !== 'ok') return render();
      state.authState.authenticated ? go('member') : go('auth');
    },
    'session:rescan': () => {
      const tier = state.authState.tier;
      clearTimers();
      state = M.freshState();
      state.authState.tier = tier;
      go('landing', { replace: true });
    },

    'join:start': () => { state.ui.joinStep = 1; go('join'); },
    'join:next': () => { state.ui.joinStep = 2; render(); },
    'join:submit': () => {
      go('join-welcome');
      later(() => {
        state.authState.email = state.ui.joinEmail || window.CD.data.MEMBER.email;
        state.authState.tier = 'SILVER';
        authenticated('session');
      }, pace(1300));
    },

    'flow:done': () => go('done'),
    'staff:show': () => go('staff'),
    'nav:back': (el) => back(el.getAttribute('data-target') || 'back'),
    terms: () => { state.ui.sheet = 'terms'; render(); },
    'sheet:close': () => { state.ui.sheet = null; render(); }
  };

  /* ------------------------------------------------------------- delegation */

  document.addEventListener('click', (e) => {
    const stop = e.target.closest('[data-stop]');
    const el = e.target.closest('[data-act]');
    if (!el) return;
    // A tap inside a sheet must not trip the scrim's dismiss action.
    if (stop && el.classList.contains('scrim')) return;
    const act = el.getAttribute('data-act');
    if (ACTIONS[act]) { e.preventDefault(); ACTIONS[act](el); }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    const bind = el.getAttribute && el.getAttribute('data-bind');
    if (bind) return onBind(bind, el);
    if (el.hasAttribute && el.hasAttribute('data-otp')) return onOtp(el);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const el = e.target;
    if (!el.getAttribute) return;
    const submit = el.getAttribute('data-submit');
    if (submit && ACTIONS[submit]) { e.preventDefault(); ACTIONS[submit](el); return; }
    const bind = el.getAttribute('data-bind');
    if (bind === 'email') { e.preventDefault(); ACTIONS['auth:email'](); }
  });

  function onBind(bind, el) {
    switch (bind) {
      case 'email':
        state.authState.email = el.value;
        if (state.ui.emailError) { state.ui.emailError = ''; render(); }
        break;
      case 'password':
        state.ui.passwordValue = el.value;
        if (state.ui.passwordError) { state.ui.passwordError = ''; render(); }
        break;
      case 'dsAmount': {
        const b = M.bill(state);
        const raw = parseInt(String(el.value).replace(/[^\d]/g, ''), 10);
        state.billState.dsSelection = isNaN(raw) ? 0 : Math.min(raw, b.dsUsable);
        render();
        break;
      }
      case 'joinFirst': state.ui.joinFirst = el.value; break;
      case 'joinLast': state.ui.joinLast = el.value; break;
      case 'joinEmail': state.ui.joinEmail = el.value; break;
      case 'joinPhone': state.ui.joinPhone = el.value; break;
      case 'joinPassword': state.ui.joinPassword = el.value; break;
      case 'joinMarketing': state.ui.joinMarketing = el.checked; break;
      default: break;
    }
  }

  function onOtp(el) {
    const idx = parseInt(el.getAttribute('data-otp'), 10);
    const digits = String(el.value).replace(/\D/g, '');
    const boxes = Array.prototype.slice.call(root().querySelectorAll('[data-otp]'));

    if (digits.length > 1) {                      // paste, or OS autofill
      digits.split('').slice(0, 6).forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });
    } else {
      el.value = digits;
      if (digits && boxes[idx + 1]) boxes[idx + 1].focus();
    }
    state.ui.otpValue = boxes.map((b) => b.value).join('');
    state.ui.otpError = '';
    const cta = root().querySelector('.footer .btn--primary');
    if (cta) cta.disabled = state.ui.otpValue.length < 6;
  }

  document.addEventListener('keydown', (e) => {
    const el = e.target;
    if (!el.getAttribute || !el.hasAttribute('data-otp')) return;
    if (e.key === 'Backspace' && !el.value) {
      const idx = parseInt(el.getAttribute('data-otp'), 10);
      const prev = root().querySelector('[data-otp="' + (idx - 1) + '"]');
      if (prev) { prev.focus(); prev.value = ''; }
    }
  });

  /* ------------------------------------------------------------------ boot */

  window.CD.app = {
    render,
    go,
    getState: () => state,
    setState: (fn) => { fn(state); render(); },
    reset: () => {
      clearTimers();
      const tier = state.authState.tier;
      state = M.freshState();
      state.authState.tier = tier;
      render();
    },
    clearTimers,
    run: (act) => { if (ACTIONS[act]) ACTIONS[act](document.createElement('button')); },
    authenticated
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (window.CD.dev) window.CD.dev.mount();
    render();
  });
})();
