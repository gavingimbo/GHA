/**
 * Screens.
 *
 * Each screen returns { nav, body, footer }. One dominant call to action per
 * screen; everything else is secondary or text. No screen introduces a
 * navigation bar — this is a transaction, not a website.
 */
(function () {
  'use strict';

  const { VENUE, TIERS, COPY } = window.CD.data;
  const M = window.CD.model;
  const I = window.CD.icons;
  const fmt = M.fmt;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const t = (key, vars) => {
    let out = COPY[key] || key;
    if (vars) Object.keys(vars).forEach((k) => { out = out.split('{{' + k + '}}').join(vars[k]); });
    return out;
  };

  /* -------------------------------------------------------------- fragments */

  const primary = (label, act, opts) =>
    '<button class="btn btn--primary" data-act="' + act + '"' + (opts && opts.disabled ? ' disabled' : '') +
    (opts && opts.id ? ' id="' + opts.id + '"' : '') + '>' +
    (opts && opts.busy ? '<span class="spinner spinner--light"></span>' : '') + esc(label) + '</button>';

  const secondary = (label, act) =>
    '<button class="btn btn--secondary" data-act="' + act + '">' + esc(label) + '</button>';

  const outline = (label, act) =>
    '<button class="btn btn--outline" data-act="' + act + '">' + esc(label) + '</button>';

  const textAction = (label, act, cls) =>
    '<button class="linkbtn ' + (cls || '') + '" data-act="' + act + '">' + esc(label) + '</button>';

  const row = (label, value, cls) =>
    '<div class="row ' + (cls || '') + '"><span class="row__label">' + esc(label) +
    '</span><span class="row__value">' + esc(value) + '</span></div>';

  const legal = () =>
    '<p class="legal">' + textAction(COPY.terms_link, 'terms', 'linkbtn--quiet') + '</p>' +
    '<p class="poweredby">' + esc(COPY.powered_by) + '</p>';

  const amount = (n) =>
    '<div class="amount"><span class="amount__cur">' + VENUE.currency + '</span>' +
    Math.round(n).toLocaleString('en-GB') + '</div>';

  const venueLine = () =>
    '<p class="support">' + esc(VENUE.outlet) + ' · ' + esc(VENUE.table) + '</p>';

  /** The reassurance that makes recovery survivable. Never dropped. */
  const holdNote = (title, body) =>
    '<div class="note"><strong>' + esc(title) + '</strong>' + esc(body) + '</div>';

  const debugBox = (state, lines) => {
    if (!window.CD.devMode) return '';
    return '<details class="debugbox"><summary>Developer detail</summary><pre>' +
      esc(lines.join('\n')) + '</pre></details>';
  };

  /* ================================================== 01 — check recognised */

  function landing(state) {
    const b = M.bill(state);
    return {
      nav: { lockup: true },
      body:
        '<div class="screen screen--flush">' +
          '<div class="cover"><img src="' + VENUE.coverImageUrl + '" alt=""><div class="cover__venue">' + esc(VENUE.outlet) + '</div></div>' +
          '<h1 class="title">' + esc(COPY.landing_title) + '</h1>' +
          '<p class="support" style="margin-bottom:24px">' + esc(VENUE.table) + ' · ' + esc(VENUE.property) + '</p>' +
          '<div class="card">' +
            amount(b.total) +
            '<p class="lede" style="margin:16px 0 0">' + esc(COPY.landing_lede) + '</p>' +
          '</div>' +
          legal() +
        '</div>',
      footer:
        primary(COPY.landing_cta, 'auth:start') +
        textAction(COPY.landing_join, 'join:start', 'center')
    };
  }

  /* ================================================ 02 — authentication router */

  function authKnownSession(state) {
    const tr = M.tier(state);
    return {
      nav: { lockup: true, back: 'landing' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.auth_known_title) + '</h1>' +
          '<div class="member">' +
            '<img class="member__card" src="' + tr.art + '" alt="">' +
            '<div><div class="member__name">' + esc(window.CD.data.MEMBER.firstName) + '</div>' +
            '<div class="member__tier">' + esc(tr.label) + ' member</div></div>' +
          '</div>' +
          '<div class="card card--quiet">' +
            '<div class="benefit"><div>' +
              '<p class="meta">' + esc(VENUE.outlet) + ' · ' + esc(VENUE.table) + '</p>' +
              '<div class="amount" style="font-size:26px;margin-top:6px">' + fmt.money(M.bill(state).total) + '</div>' +
            '</div>' +
            '<span style="color:var(--purple)">' + I.receipt() + '</span></div>' +
          '</div>' +
          '<p class="support" style="margin-top:24px;display:flex;gap:8px;align-items:flex-start">' +
            '<span style="color:var(--ink-4);flex:none">' + I.face() + '</span>' +
            esc(COPY.auth_known_note) + '</p>' +
          legal() +
        '</div>',
      footer:
        primary(COPY.auth_known_cta, 'auth:session') +
        textAction('Use a different membership', 'auth:signout', 'center')
    };
  }

  function authEmail(state) {
    const concept = state.ui.authConcept;
    return {
      nav: { lockup: true, back: 'landing' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.auth_title) + '</h1>' +
          '<p class="lede">' + esc(COPY.auth_lede) + '</p>' +
          '<label class="field">' +
            '<span class="field__label">' + esc(COPY.auth_email_label) + '</span>' +
            '<input class="input' + (state.ui.emailError ? ' input--invalid' : '') + '" type="email" inputmode="email" ' +
              'autocomplete="email" enterkeyhint="go" data-bind="email" placeholder="you@example.com" value="' +
              esc(state.authState.email) + '">' +
            (state.ui.emailError
              ? '<span class="fielderror">' + I.alert() + esc(state.ui.emailError) + '</span>'
              : '') +
          '</label>' +
          (concept === 'passkey'
            ? '<div class="note"><strong>' + esc(COPY.auth_passkey_title) + '</strong>' + esc(COPY.auth_passkey_body) + '</div>'
            : '') +
          debugBox(state, [
            'Authentication ladder (preferred first):',
            '  1 existing GHA session   — live today',
            '  2 passkey / biometric    — concept, requires GHA capability',
            '  3 email OTP / magic link — concept, requires GHA capability',
            '  4 password               — live today, fallback only',
            'Current concept: ' + concept
          ]) +
          legal() +
        '</div>',
      footer:
        primary(COPY.auth_cta, 'auth:email') +
        textAction(COPY.auth_use_password, 'auth:password', 'center')
    };
  }

  function authOtpOffer(state) {
    return {
      nav: { lockup: true, back: 'auth' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.auth_otp_offer_title) + '</h1>' +
          '<p class="lede">' + esc(COPY.auth_otp_offer_body) + '</p>' +
          identity(state) +
          debugBox(state, ['Concept — requires GHA capability: email OTP issue + verify endpoints.']) +
        '</div>',
      footer:
        primary(COPY.auth_otp_cta, 'auth:otp:send') +
        textAction(COPY.auth_use_password, 'auth:password', 'center')
    };
  }

  function authPasskey(state) {
    return {
      nav: { lockup: true, back: 'auth' },
      body:
        '<div class="screen">' +
          '<div class="centred-state">' +
            '<span class="mark mark--calm">' + I.key() + '</span>' +
            '<div><h1 class="title" style="margin-bottom:8px">' + esc(COPY.auth_passkey_title) + '</h1>' +
            '<p class="lede" style="margin:0">' + esc(COPY.auth_passkey_body) + '</p></div>' +
            holdNote('Your bill is still here.', 'Your device will show its own verification. We’ll bring you straight back to this bill.') +
          '</div>' +
          debugBox(state, [
            'Concept — requires GHA capability: WebAuthn passkey registration + assertion.',
            'The OS sheet is system-owned and must never be simulated inside the page.'
          ]) +
        '</div>',
      footer:
        primary(COPY.auth_passkey_cta, 'auth:passkey:go') +
        textAction(COPY.auth_use_password, 'auth:password', 'center')
    };
  }

  /* ================================================ 03 — password fallback */

  function identity(state) {
    return '<div class="identity">' +
      '<span class="identity__email">' + esc(state.authState.email || window.CD.data.MEMBER.email) + '</span>' +
      '<button class="identity__change" data-act="auth:changeEmail">Change</button>' +
      '</div>';
  }

  function password(state) {
    const wrong = !!state.ui.passwordError;
    return {
      nav: { lockup: true, back: 'auth' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.pw_title) + '</h1>' +
          identity(state) +
          '<label class="field">' +
            '<span class="field__label">' + esc(COPY.pw_label) + '</span>' +
            '<span class="input-wrap">' +
              '<input class="input' + (wrong ? ' input--invalid' : '') + '" type="' +
                (state.ui.showPassword ? 'text' : 'password') + '" autocomplete="current-password" ' +
                'enterkeyhint="go" data-bind="password" data-submit="auth:password:submit" value="' + esc(state.ui.passwordValue || '') + '">' +
              '<button type="button" class="reveal" data-act="auth:password:reveal" aria-label="Show password">' +
                (state.ui.showPassword ? I.eyeOff() : I.eye()) + '</button>' +
            '</span>' +
            (wrong ? '<span class="fielderror">' + I.alert() + esc(state.ui.passwordError) + '</span>' : '') +
          '</label>' +
        '</div>',
      footer:
        primary(wrong ? COPY.pw_retry : COPY.pw_cta, 'auth:password:submit') +
        '<div class="stack stack--tight center">' +
          textAction(wrong ? COPY.pw_reset : COPY.pw_forgot, 'reset:start') +
          textAction(COPY.pw_other, 'auth:another') +
        '</div>'
    };
  }

  /* ============================================ 04/05/06 — password recovery */

  function reset(state) {
    return {
      nav: { lockup: true, back: 'password' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.reset_title) + '</h1>' +
          '<p class="lede">' + esc(COPY.reset_body) + '</p>' +
          '<div class="identity"><span class="identity__email">' +
            esc(fmt.maskEmail(state.authState.email)) + '</span>' +
            '<span style="color:var(--ink-4)">' + I.mail() + '</span></div>' +
          debugBox(state, [
            'settlementSession.checkIdentity = ' + state.settlementSession.checkIdentity,
            'authState.recoveryInProgress = true',
            'The reset link carries state=' + state.settlementSession.originalReturnPath,
            'so GHA returns the guest to this exact settlement session.'
          ]) +
        '</div>',
      footer:
        primary(COPY.reset_cta, 'reset:send') +
        textAction(COPY.reset_other, 'auth:changeEmail', 'center')
    };
  }

  function resetSent(state) {
    return {
      nav: { lockup: true, back: 'password' },
      body:
        '<div class="screen">' +
          '<div class="centred-state" style="min-height:44vh">' +
            '<span class="mark mark--calm">' + I.mail() + '</span>' +
            '<div>' +
              '<h1 class="title" style="margin-bottom:8px">' + esc(COPY.sent_title) + '</h1>' +
              '<p class="lede" style="margin:0">' + esc(t('sent_body', { email: fmt.maskEmail(state.authState.email) })) + '</p>' +
            '</div>' +
          '</div>' +
          holdNote(COPY.sent_hold_title, COPY.sent_hold_body) +
          debugBox(state, [
            'The page holds. The settlement session is untouched and still valid until ' +
              fmt.clock(state.settlementSession.expiresAt) + '.',
            'Reviewer: either action below simulates the guest leaving for their inbox,',
            'resetting the password on GHA, and returning to this page.'
          ]) +
        '</div>',
      footer:
        primary(COPY.sent_open, 'reset:return') +
        '<div class="stack stack--tight center">' +
          textAction(COPY.sent_resend, 'reset:resend') +
          (window.CD.devMode ? textAction('Simulate: password reset complete', 'reset:return') : '') +
        '</div>'
    };
  }

  function resetReturn(state) {
    return {
      nav: { lockup: true },
      body:
        '<div class="screen">' +
          '<div class="centred-state">' +
            '<span class="mark">' + I.check({ size: 26 }) + '</span>' +
            '<div>' +
              '<h1 class="title" style="margin-bottom:8px">' + esc(COPY.return_title) + '</h1>' +
              '<p class="support">' + esc(COPY.return_body) + '</p>' +
            '</div>' +
            '<div class="bar" style="width:120px"></div>' +
          '</div>' +
        '</div>',
      footer: textAction(COPY.return_cta, 'auth:resume', 'center')
    };
  }

  /* ============================================== 07A/B — OTP + magic link */

  function otp(state) {
    const boxes = [0, 1, 2, 3, 4, 5].map((i) =>
      '<input inputmode="numeric" maxlength="1" autocomplete="' + (i === 0 ? 'one-time-code' : 'off') +
      '" data-otp="' + i + '" aria-label="Digit ' + (i + 1) + '">').join('');
    const code = (state.ui.otpValue || '');
    return {
      nav: { lockup: true, back: 'auth' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.otp_title) + '</h1>' +
          '<p class="lede">' + esc(t('otp_body', { email: fmt.maskEmail(state.authState.email) })) + '</p>' +
          '<div class="otp">' + boxes + '</div>' +
          (state.ui.otpError ? '<p class="fielderror">' + I.alert() + esc(state.ui.otpError) + '</p>' : '') +
          holdNote('Your bill is still here.', 'We’ll take you straight to it once the code checks out.') +
          debugBox(state, ['Concept — requires GHA capability. Any 6 digits are accepted here.']) +
        '</div>',
      footer:
        primary(COPY.otp_cta, 'auth:otp:verify', { disabled: code.length < 6 }) +
        '<div class="stack stack--tight center">' +
          textAction(COPY.otp_resend, 'auth:otp:send') +
          textAction(COPY.otp_password, 'auth:password') +
        '</div>'
    };
  }

  function magic(state) {
    return {
      nav: { lockup: true, back: 'auth' },
      body:
        '<div class="screen">' +
          '<div class="centred-state" style="min-height:44vh">' +
            '<span class="mark mark--calm">' + I.mail() + '</span>' +
            '<div><h1 class="title" style="margin-bottom:8px">' + esc(COPY.magic_title) + '</h1>' +
            '<p class="lede" style="margin:0">' + esc(t('magic_body', { email: fmt.maskEmail(state.authState.email) })) + '</p></div>' +
          '</div>' +
          holdNote(COPY.magic_hold, 'Return to this page after tapping the link and we’ll continue automatically.') +
          debugBox(state, ['Concept — requires GHA capability: signed sign-in link carrying the settlement session state.']) +
        '</div>',
      footer:
        primary('I tapped the link', 'auth:magic:return') +
        textAction(COPY.otp_password, 'auth:password', 'center')
    };
  }

  /* ============================================ 08 — membership recognised */

  function member(state) {
    const tr = M.tier(state);
    const b = M.bill(state);
    const st = state.billState.benefitStatus;

    let benefitBlock;
    if (st === 'checking') {
      benefitBlock =
        '<div class="card"><h2 class="section">' + esc(COPY.benefit_heading) + '</h2>' +
          '<div class="status status--pending"><span class="spinner" style="width:16px;height:16px"></span>' +
          esc(COPY.benefit_checking) + '</div>' +
          '<div class="bar" style="margin-top:16px"></div></div>';
    } else if (st === 'applied') {
      benefitBlock =
        '<div class="card">' +
          '<h2 class="section">' + esc(COPY.benefit_heading) + '</h2>' +
          '<div class="benefit">' +
            '<div><p class="meta">' + esc(COPY.benefit_line) + '</p>' +
            '<div class="benefit__value">' + b.discountPct + '% applied</div></div>' +
            '<div style="text-align:right"><p class="meta">Savings</p>' +
            '<div class="benefit__value">' + esc(fmt.money(b.discount)) + '</div></div>' +
          '</div>' +
          '<div class="status">' + I.check({ size: 16 }) + esc(COPY.benefit_applied) + '</div>' +
        '</div>';
    } else if (st === 'unavailable') {
      benefitBlock = '<div class="note"><strong>' + esc(COPY.benefit_none_title) + '</strong>' + esc(COPY.benefit_none_body) + '</div>';
    } else {
      benefitBlock = '';
    }

    return {
      nav: { lockup: true },
      body:
        '<div class="screen">' +
          '<p class="eyebrow" style="margin-top:8px">' + esc(VENUE.outlet) + ' · ' + esc(VENUE.table) + '</p>' +
          '<div class="member">' +
            '<img class="member__card" src="' + tr.art + '" alt="">' +
            '<div><div class="member__name">' + esc(t('member_title', { name: window.CD.data.MEMBER.firstName })) + '</div>' +
            '<div class="member__tier">' + esc(tr.label) + ' member</div></div>' +
          '</div>' +
          benefitBlock +
          '<div class="rows" style="margin-top:24px">' +
            row(COPY.bill_total, fmt.money(b.total), '') +
          '</div>' +
        '</div>',
      footer: primary(COPY.benefit_cta, 'bill:open', { disabled: st === 'checking' })
    };
  }

  /* ================================================== 09 — the bill and D$ */

  function billScreen(state) {
    const b = M.bill(state);
    const sel = M.selection(state);
    const offered = M.dsOffered(state);
    const items = state.billState.items;

    const itemRows = items.map((i) =>
      '<div class="item"><span class="item__name"><span class="item__count">' + i.count + '×</span>' +
      esc(i.name) + (i.eligible ? '' : ' <span class="item__flag">' + esc(COPY.bill_ineligible) + '</span>') +
      '</span><span class="row__value">' + esc(fmt.money(i.total)) + '</span></div>').join('');

    const updatedNote = state.billState.status === 'updated'
      ? '<div class="note" style="margin-bottom:16px"><strong>' + esc(COPY.updated_title) + '</strong>' +
        esc(COPY.updated_body) + '</div>'
      : '';

    const chips = [10, 25, 50].filter((v) => v <= b.dsUsable)
      .map((v) => '<button class="chip" data-act="ds:set" data-value="' + v + '" aria-pressed="' + (sel === v) + '">D$ ' + v + '</button>')
      .concat(['<button class="chip" data-act="ds:set" data-value="' + b.dsUsable + '" aria-pressed="' +
        (sel === b.dsUsable) + '">Max</button>']).join('');

    const dsBlock = offered
      ? '<div class="card">' +
          '<h2 class="section">' + esc(COPY.ds_heading) + '</h2>' +
          '<div class="rows">' +
            row(COPY.ds_available, fmt.ds(b.balance)) +
            row(COPY.ds_eligible, 'Up to ' + fmt.ds(b.dsUsable)) +
          '</div>' +
          '<div class="divider"></div>' +
          '<div class="chips">' + chips + '</div>' +
          '<label class="field" style="margin:16px 0 0">' +
            '<span class="field__label">Or enter an amount</span>' +
            '<input class="input" inputmode="numeric" data-bind="dsAmount" value="' + sel + '">' +
          '</label>' +
          '<div class="ds-live rows">' +
            row(t('ds_using', { amount: sel }), '− ' + fmt.money(sel * VENUE.localPerDollar), 'row--credit') +
            row(COPY.ds_remaining, fmt.money(b.total - sel * VENUE.localPerDollar), 'row--total row--due') +
          '</div>' +
          '<p class="meta" style="margin-top:16px">' + esc(COPY.ds_fine_print) + '</p>' +
        '</div>'
      : '<div class="note"><strong>' + esc(COPY.ds_low_title) + '</strong>' + esc(COPY.ds_low_body) + '</div>';

    return {
      nav: { lockup: true, back: 'member' },
      body:
        '<div class="screen">' +
          '<h1 class="title">' + esc(COPY.bill_title) + '</h1>' +
          venueLine() +
          '<div style="height:20px"></div>' +
          updatedNote +
          '<div class="card">' +
            '<div class="rows">' +
              row(COPY.bill_items, fmt.money(b.subtotal)) +
              (b.discount > 0 ? row(COPY.bill_benefit, '− ' + fmt.money(b.discount), 'row--credit') : '') +
              row(COPY.bill_service, fmt.money(b.serviceCharge)) +
              row(COPY.bill_tax, fmt.money(b.tax)) +
              row(COPY.bill_total, fmt.money(b.total), 'row--total') +
            '</div>' +
            '<div class="disclosure">' +
              '<button class="disclosure__toggle" data-act="bill:toggleItems">' +
                esc(state.ui.showItems ? COPY.bill_hide_items : COPY.bill_view_items) +
                (state.ui.showItems ? I.chevronUp() : I.chevronDown()) + '</button>' +
              (state.ui.showItems ? '<div class="disclosure__body">' + itemRows + '</div>' : '') +
            '</div>' +
          '</div>' +
          dsBlock +
          '<p class="support" style="margin-top:24px;display:flex;gap:8px;align-items:flex-start">' +
            '<span style="color:var(--dune);flex:none">' + I.sparkle() + '</span>' +
            esc(COPY.ds_earn_note) + ' Around ' + esc(fmt.ds(b.earnEstimate)) + ' on this bill.</p>' +
          debugBox(state, [
            'billState.version = ' + b.version,
            'eligibleSubtotal = ' + b.eligibleSubtotal + ' (tobacco, service charge and taxes excluded)',
            'dsEligible = ' + b.dsEligible + '  balance = ' + b.balance + '  usable = ' + b.dsUsable,
            'rate = ' + VENUE.localPerDollar + ' ' + VENUE.currency + ' per D$'
          ]) +
        '</div>',
      footer: offered
        ? primary(t('ds_cta', { amount: sel }), 'ds:confirm', { disabled: sel < 10 }) +
          textAction(COPY.ds_skip, 'ds:skip', 'center')
        : primary('Done', 'flow:done')
    };
  }

  /* ================================================ 10 — confirm redemption */

  function confirmSheet(state) {
    const b = M.bill(state);
    const sel = M.selection(state);
    return '<div class="scrim" data-act="ds:cancel"><div class="sheet" data-stop>' +
      '<div class="sheet__grip"></div>' +
      '<h2 class="section">' + esc(t('confirm_title', { amount: sel })) + '</h2>' +
      '<div class="rows" style="margin:20px 0 16px">' +
        row(COPY.confirm_value, '− ' + fmt.money(sel * VENUE.localPerDollar), 'row--credit') +
        row(COPY.confirm_remaining, fmt.money(b.total - sel * VENUE.localPerDollar), 'row--total row--due') +
      '</div>' +
      '<p class="meta" style="margin-bottom:20px">' + esc(COPY.confirm_note) + '</p>' +
      primary(COPY.confirm_cta, 'ds:apply') +
      secondary(COPY.confirm_cancel, 'ds:cancel') +
      '</div></div>';
  }

  /* ================================================ 11/12 — applying, done */

  function applying(state) {
    const slow = state.system.latency === 'slow';
    return {
      nav: { lockup: true },
      body:
        '<div class="screen"><div class="centred-state">' +
          '<span class="spinner" style="width:30px;height:30px"></span>' +
          '<div><h1 class="title" style="margin-bottom:8px">' + esc(COPY.applying_title) + '</h1>' +
          '<p class="support">' + esc(slow ? COPY.slow_body : COPY.applying_body) + '</p></div>' +
        '</div>' +
        debugBox(state, [
          'transactionState.status = ' + state.transactionState.status,
          'idempotencyKey = ' + state.transactionState.idempotencyKey,
          'A second submission is impossible: the key is minted once and the action is disabled.'
        ]) +
        '</div>',
      footer: ''
    };
  }

  function success(state) {
    const b = M.bill(state);
    return {
      nav: { lockup: true },
      body:
        '<div class="screen">' +
          '<div style="padding:24px 0 8px"><span class="mark">' + I.check({ size: 26 }) + '</span></div>' +
          '<h1 class="title">' + esc(COPY.success_title) + '</h1>' +
          venueLine() +
          '<div class="card" style="margin-top:24px"><div class="rows">' +
            (b.discount > 0 ? row(COPY.bill_benefit, '− ' + fmt.money(b.discount), 'row--credit') : '') +
            (b.dsApplied > 0 ? row(COPY.success_ds, fmt.ds(b.dsApplied)) : '') +
            (b.dsApplied > 0 ? row(COPY.confirm_value, '− ' + fmt.money(b.dsValue), 'row--credit') : '') +
            row(COPY.ds_remaining, fmt.money(b.amountDue), 'row--total row--due') +
          '</div></div>' +
          '<p class="support" style="margin-top:24px">' + esc(COPY.success_settle) + '</p>' +
          '<p class="meta" style="margin-top:12px">' + esc(COPY.success_earn) + '</p>' +
          (state.transactionState.redemptionId
            ? '<p class="meta" style="margin-top:12px">Reference ' + esc(state.transactionState.redemptionId) +
              ' · ' + esc(fmt.clock(state.transactionState.appliedAt)) + '</p>'
            : '') +
        '</div>',
      footer: primary(COPY.success_cta, 'flow:done') + textAction('Show this to my server', 'staff:show', 'center')
    };
  }

  function done(state) {
    return {
      nav: { lockup: true },
      body:
        '<div class="screen"><div class="centred-state">' +
          '<span class="mark mark--calm">' + I.sparkle() + '</span>' +
          '<div><h1 class="title" style="margin-bottom:8px">' + esc(COPY.done_title) + '</h1>' +
          '<p class="support">' + esc(COPY.done_body) + '</p></div>' +
        '</div></div>',
      footer: textAction('Back to bill', 'bill:open', 'center')
    };
  }

  /* ================================================== 13 — join DISCOVERY */

  function join(state) {
    const step = state.ui.joinStep;
    const steps = '<div class="steps"><span class="is-on"></span><span class="' + (step === 2 ? 'is-on' : '') + '"></span></div>';
    const body = step === 1
      ? '<label class="field"><span class="field__label">' + esc(COPY.join_first) + '</span>' +
          '<input class="input" data-bind="joinFirst" autocomplete="given-name" value="' + esc(state.ui.joinFirst || '') + '"></label>' +
        '<label class="field"><span class="field__label">' + esc(COPY.join_last) + '</span>' +
          '<input class="input" data-bind="joinLast" autocomplete="family-name" value="' + esc(state.ui.joinLast || '') + '"></label>' +
        '<label class="field"><span class="field__label">' + esc(COPY.join_email) + '</span>' +
          '<input class="input" type="email" inputmode="email" data-bind="joinEmail" autocomplete="email" value="' + esc(state.ui.joinEmail || '') + '"></label>'
      : '<label class="field"><span class="field__label">' + esc(COPY.join_phone) + '</span>' +
          '<input class="input" type="tel" inputmode="tel" data-bind="joinPhone" value="' + esc(state.ui.joinPhone || '+94 ') + '"></label>' +
        '<label class="field"><span class="field__label">' + esc(COPY.join_password) + '</span>' +
          '<input class="input" type="password" autocomplete="new-password" data-bind="joinPassword" value=""></label>' +
        '<div class="divider"></div>' +
        '<label class="consent"><input type="checkbox" checked disabled>' + esc(COPY.join_consent) + '</label>' +
        '<label class="consent" style="margin-top:16px"><input type="checkbox" data-bind="joinMarketing">' + esc(COPY.join_marketing) + '</label>';

    return {
      nav: { lockup: true, back: step === 2 ? 'join:back' : 'landing' },
      body:
        '<div class="screen">' +
          steps +
          '<h1 class="title">' + esc(COPY.join_title) + '</h1>' +
          (step === 1 ? '<p class="lede">' + esc(COPY.join_lede) + '</p>' : '') +
          body +
          holdNote('Your bill is still here.', 'When your membership is live we’ll bring you straight back to it.') +
          legal() +
        '</div>',
      footer: primary(step === 1 ? COPY.join_next : COPY.join_cta, step === 1 ? 'join:next' : 'join:submit')
    };
  }

  function joinWelcome(state) {
    return {
      nav: { lockup: true },
      body:
        '<div class="screen"><div class="centred-state">' +
          '<span class="mark">' + I.check({ size: 26 }) + '</span>' +
          '<div><h1 class="title" style="margin-bottom:8px">' + esc(COPY.join_welcome) + '</h1>' +
          '<p class="support">' + esc(COPY.join_welcome_body) + '</p></div>' +
          '<div class="bar" style="width:120px"></div>' +
        '</div></div>',
      footer: ''
    };
  }

  /* ==================================================== 14 — failure states */

  function stateScreen(opts) {
    return {
      nav: { lockup: true, back: opts.back },
      body:
        '<div class="screen">' +
          '<div style="padding:32px 0 8px"><span class="mark ' + (opts.tone || 'mark--calm') + '">' + opts.icon + '</span></div>' +
          '<h1 class="title">' + esc(opts.title) + '</h1>' +
          '<p class="lede">' + esc(opts.body) + '</p>' +
          (opts.extra || '') +
        '</div>',
      footer: (opts.primary || '') + (opts.secondary || '')
    };
  }

  function billUpdated(state) {
    return stateScreen({
      icon: I.receipt(), tone: 'mark--calm',
      title: COPY.updated_title, body: COPY.updated_body,
      extra: '<div class="card" style="margin-top:8px"><div class="rows">' +
        row(COPY.bill_total, fmt.money(M.bill(state).total), 'row--total') + '</div></div>' +
        debugBox(state, [
          'checkIdentity unchanged (' + state.settlementSession.checkIdentity + ') — the session is rebound, not rebuilt.',
          'billState.version ' + (state.billState.version - 1) + ' → ' + state.billState.version,
          'A new QR is only required when the check identity itself changes.'
        ]),
      primary: primary(COPY.updated_cta, 'bill:open')
    });
  }

  function expired(state) {
    return stateScreen({
      icon: I.clock(), tone: 'mark--warn',
      title: COPY.expired_title, body: COPY.expired_body,
      extra: debugBox(state, ['settlementSession.status = expired', 'The token behind the QR is past its expiry; it cannot be safely rebound.']),
      primary: primary(COPY.expired_cta, 'session:rescan'),
      secondary: textAction('Show this to my server', 'staff:show', 'center')
    });
  }

  function locked(state) {
    return stateScreen({
      icon: I.lock(), tone: 'mark--warn',
      title: COPY.locked_title, body: COPY.locked_body,
      extra: debugBox(state, ['First member locks the check. The first member is never named to the second.']),
      primary: primary(COPY.locked_cta, 'staff:show')
    });
  }

  function rejected(state) {
    return stateScreen({
      icon: I.alert(), tone: 'mark--warn',
      title: COPY.rejected_title, body: COPY.rejected_body,
      extra: debugBox(state, ['Raw reason (never shown to the guest): ' + state.billState.benefitReason]),
      primary: primary(COPY.rejected_cta, 'benefit:retry'),
      secondary: textAction(COPY.rejected_staff, 'staff:show', 'center')
    });
  }

  function noBill(state) {
    return stateScreen({
      icon: I.receipt(), tone: 'mark--calm',
      title: COPY.nobill_title, body: COPY.nobill_body,
      extra: '<div class="status status--pending" style="margin-top:8px"><span class="spinner" style="width:16px;height:16px"></span>Watching this table for you</div>',
      primary: ''
    });
  }

  function closed(state) {
    return stateScreen({
      icon: I.check({ size: 24 }), tone: 'mark--calm',
      title: COPY.closed_title, body: COPY.closed_body,
      primary: primary('Done', 'flow:done')
    });
  }

  function dsPending(state) {
    return stateScreen({
      icon: I.clock(), tone: 'mark--calm',
      title: COPY.pending_title, body: COPY.pending_body,
      extra: '<div class="bar" style="margin-top:8px"></div>' +
        debugBox(state, [
          'transactionState.status = pending',
          'redemptionId = ' + (state.transactionState.redemptionId || '—'),
          'No retry is offered until the downstream status is known.'
        ]),
      primary: ''
    });
  }

  function dsFailed(state) {
    return stateScreen({
      icon: I.alert(), tone: 'mark--bad',
      title: COPY.failed_title, body: COPY.failed_body,
      primary: primary(COPY.rejected_cta, 'ds:retry'),
      secondary: textAction(COPY.ds_skip, 'ds:skip', 'center')
    });
  }

  function dsReconcile(state) {
    return stateScreen({
      icon: I.alert(), tone: 'mark--warn',
      title: COPY.recon_title, body: COPY.recon_body,
      extra: '<div style="margin-top:16px">' + staffCard(state) + '</div>'
    });
  }

  function offline(state) {
    return stateScreen({
      icon: I.alert(), tone: 'mark--warn',
      title: COPY.offline_title, body: COPY.offline_body,
      extra: debugBox(state, ['system.gha = ' + state.system.gha + ' · system.pos = ' + state.system.pos]),
      primary: primary(COPY.rejected_cta, 'system:retry'),
      secondary: textAction(COPY.offline_secondary, 'staff:show', 'center')
    });
  }

  /* ================================================== 15 — staff handoff */

  function staffCard(state) {
    const b = M.bill(state);
    const ts = state.transactionState;
    const benefit = { applied: 'Applied ' + b.discountPct + '%', checking: 'Being applied', rejected: 'Not applied', locked: 'Locked to another member', unavailable: 'Not offered here' }[state.billState.benefitStatus];
    const redemption = { idle: 'None requested', applying: 'In progress', applied: 'Applied ' + fmt.ds(b.dsApplied), failed: 'Not applied', pending: 'Awaiting confirmation', reconcile: 'Needs reconciliation' }[ts.status];
    let instruction = 'No action needed. Settle the remaining amount as normal.';
    if (state.billState.benefitStatus === 'rejected') instruction = 'Close and reopen the bill on the till, then ask the guest to tap Try again.';
    if (state.billState.benefitStatus === 'locked') instruction = 'Split or reopen the bill so a second membership can be attached.';
    if (ts.status === 'reconcile' || ts.status === 'pending') instruction = 'Do not settle yet. Confirm the D$ posting against the reference below before closing the bill.';
    if (state.settlementSession.status === 'expired') instruction = 'Issue a fresh DISCOVERY bill link for this table.';
    if (state.system.gha !== 'ok') instruction = 'DISCOVERY is unavailable. Settle as normal and advise on later crediting per programme rules.';

    return '<div class="staff">' +
      '<h3>' + esc(COPY.staff_title) + '</h3>' +
      '<div class="rows">' +
        row(COPY.staff_outlet, VENUE.outlet) +
        row(COPY.staff_table, VENUE.table) +
        row(COPY.staff_check, '#' + state.settlementSession.checkId) +
        row(COPY.staff_member, state.authState.authenticated ? 'Verified · ' + M.tier(state).label : 'Not verified') +
        row(COPY.staff_benefit, benefit) +
        row(COPY.staff_redemption, redemption) +
      '</div>' +
      '<p class="staff__instruction">' + esc(instruction) + '</p>' +
      '<p class="staff__ref">' + esc(COPY.staff_ref) + ' ' +
        esc(ts.redemptionId || state.settlementSession.checkIdentity.toUpperCase()) + '</p>' +
      '</div>';
  }

  function staff(state) {
    return {
      nav: { lockup: true, back: 'back' },
      body:
        '<div class="screen">' +
          '<h1 class="title">Show this to your server</h1>' +
          '<p class="lede">Everything they need to finish this bill is below.</p>' +
          staffCard(state) +
          '<p class="meta" style="margin-top:16px">No password or account details are shown here.</p>' +
        '</div>',
      footer: textAction(COPY.staff_done, 'nav:back', 'center')
    };
  }

  /* --------------------------------------------------------------- loading */

  function loading(state) {
    return {
      nav: { lockup: true },
      body: '<div class="screen"><div class="centred-state">' +
        '<span class="spinner" style="width:26px;height:26px"></span>' +
        '<p class="support">Bringing up your bill…</p></div></div>',
      footer: ''
    };
  }

  /* --------------------------------------------------------------- terms */

  function termsSheet() {
    return '<div class="scrim" data-act="sheet:close"><div class="sheet sheet--full" data-stop>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
        '<h2 class="section" style="margin:0">' + esc(COPY.terms_link) + '</h2>' +
        '<button class="iconbtn" data-act="sheet:close" aria-label="Close">' + I.close() + '</button></div>' +
      '<div class="terms-body">' +
        '<p>DISCOVERY dining benefits and DISCOVERY Dollars apply at participating Cinnamon Hotels &amp; Resorts restaurants and bars. Benefits vary by membership tier and by outlet.</p>' +
        '<p>Tobacco, service charge, tips, and government taxes are not eligible for DISCOVERY Dollar earning or redemption. A minimum balance of D$ 10 is required to use DISCOVERY Dollars against a bill.</p>' +
        '<p>Only one membership can be linked to a bill. Where a second member wishes to use their benefits, the bill must be split or reopened by the outlet.</p>' +
        '<p>Redemptions are applied to the bill and cannot be reversed from this page. Eligible DISCOVERY Dollars earned on a visit are credited to the member account after settlement.</p>' +
        '<p>The programme is operated by GHA Loyalty FZCO. Full terms are available at cinnamonhotels.com.</p>' +
      '</div></div></div>';
  }

  window.CD.screens = {
    landing, authKnownSession, authEmail, authOtpOffer, authPasskey, password,
    reset, resetSent, resetReturn, otp, magic, member, bill: billScreen,
    applying, success, done, join, joinWelcome,
    billUpdated, expired, locked, rejected, noBill, closed,
    dsPending, dsFailed, dsReconcile, offline, staff, loading,
    confirmSheet, termsSheet, staffCard, t
  };
})();
