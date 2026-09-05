/**
 * Cinnamon DISCOVERY "Dine with D$" — POS session mockup.
 *
 * A visual clone of the live QR/POS journey. Every screen, modal and state the
 * real app can reach is reproduced; the network calls behind them (GHA auth,
 * the POS check poll, earn/burn posting) are replaced by timers over the fixture
 * data in data.js.
 */
(function () {
  const { LABELS, VENUE, MEMBER, BILL } = window.GHA_DATA;
  const CSS = window.GHA_CSS;
  const I = window.GHA_ICONS;
  const P = CSS.page, H = CSS.hero, M = CSS.modal, B = CSS.burn;

  const THEME = VENUE.theme;

  /* ------------------------------------------------------------ utilities */

  const t = (key, vars) => {
    let s = LABELS[key];
    if (s == null) return key;
    if (vars) for (const k in vars) s = s.split('{{' + k + '}}').join(vars[k]);
    return s;
  };

  const fmtDD = (n) => 'D$' + Math.floor(Number(n) || 0).toLocaleString();
  const fmtNum = (n) => Math.floor(Number(n) || 0).toLocaleString();
  const fmtCur = (n, symbol = VENUE.currency) => {
    const v = Number(n) || 0;
    const s = v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return symbol ? `${symbol} ${s}` : s;
  };
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '');

  /* ------------------------------------------------------------ bill maths */

  const subtotal = BILL.items.reduce((a, i) => a + i.total, 0);
  const discountTotal = BILL.discounts.reduce((a, d) => a + d.amount, 0);
  const chargesTotal = BILL.charges.reduce((a, c) => a + c.amount, 0);
  const eligibleLocal = subtotal - discountTotal;          // excludes service charge + taxes
  const billTotal = eligibleLocal + chargesTotal;
  // Redeemable D$ is capped by both the eligible spend on the check and the
  // member's live balance, so it moves when a redemption lands.
  const eligibleDD = () => Math.min(Math.floor(eligibleLocal / VENUE.localPerDollar), state.balance);
  const MIN_REDEEM = 10;
  const INITIAL_SPEND = Math.min(Math.floor(eligibleLocal / VENUE.localPerDollar), MEMBER.balance);
  const potentialEarn = Math.floor((eligibleLocal / VENUE.localPerDollar) * (MEMBER.earnRatePct / 100));

  /* ------------------------------------------------------------ app state */

  const state = {
    screen: 'page',            // page | burn | earn
    signedIn: false,
    loadingProfile: false,     // profile/dashboard fetch after sign-in
    billStatus: 'ready',       // ready | fetching | empty
    burned: null,              // { dd_redeemed, local_amount_redeemed, confirmation_number, burned_at }
    earned: null,              // { transaction_id, pos_check_number, pos_check_ref }
    earnPending: false,
    sessionHint: null,         // null | expired | check_changed | no_token
    discountState: 'ok',       // ok | checking | failed | other_member
    posVariant: 'earn_burn',   // earn_burn (two cards) | view_bill (single card)
    // modals
    modal: null,               // signin | signup | terms | null
    signinMode: 'signin',
    showPassword: false,
    signupPassword: false,
    consentOpen: false,
    marketingOpen: false,
    marketingOptIn: false,
    submitting: false,
    signupDone: false,
    formError: '',
    // burn / earn page
    balance: MEMBER.balance,
    spend: INITIAL_SPEND,
    helpOpen: false,
    itemsExpanded: false,
    confirm: 'idle',           // idle | confirm | submitting | success | error | already
    confirmKind: 'burn',
    copied: false,
    mockOpen: false,
  };

  const set = (patch) => {
    Object.assign(state, patch);
    render();
  };

  /* --------------------------------------------------------------- pieces */

  const btn = (label, kind, attrs = '') =>
    `<button type="button" class="c_btn ${kind}" ${attrs}>${label}</button>`;

  function heroCover({ showBack, showLogout }) {
    const loading = state.loadingProfile;
    const overlay = state.signedIn
      ? `<div class="${H.user_overlay}">
           <div class="${H.user_left}">
             ${loading
               ? `<span class="${H.skeleton} ${H.skeleton_name}"></span>
                  <span class="${H.skeleton} ${H.skeleton_id}"></span>`
               : `<p class="${H.user_name}" title="${esc(MEMBER.name)}">${esc(MEMBER.name)}</p>
                  <div class="${H.user_id_row}">
                    <span class="${H.user_id}">${esc(MEMBER.cardNumber)}</span>
                    <button type="button" class="${H.copy_btn}" data-act="copy" aria-label="Copy profile ID">
                      ${state.copied ? I.check(11) : I.copy(11)}
                    </button>
                    ${state.copied ? `<span class="${H.copy_feedback}">Copied</span>` : ''}
                  </div>`}
           </div>
           <div class="${H.user_right}">
             <p class="${H.balance_label}">Balance</p>
             ${loading
               ? `<span class="${H.skeleton} ${H.skeleton_amount}"></span>
                  <span class="${H.skeleton} ${H.skeleton_local}"></span>`
               : `<p class="${H.balance_amount}">${fmtDD(state.balance)}</p>
                  <p class="${H.balance_local}">${fmtCur(state.balance * VENUE.localPerDollar)}</p>`}
           </div>
         </div>`
      : '';

    return `<div class="${H.hero}">
      <img class="${H.hero_bg}" src="${VENUE.coverImageUrl}" alt="">
      <div class="${H.hero_overlay}"></div>
      <div class="${H.topbar}">
        ${showBack
          ? `<button type="button" class="${H.topbar_btn}" data-act="back" aria-label="Back">${I.back(18)}</button>`
          : `<span style="width:36px"></span>`}
        ${showLogout
          ? `<button type="button" class="${H.topbar_btn}" data-act="logout" aria-label="Log out">${I.logout(18)}</button>`
          : `<span style="width:36px"></span>`}
      </div>
      ${overlay}
    </div>`;
  }

  const venueChip = (extra = '') =>
    `<div class="${P.venue_chip} ${extra}">
       ${I.restaurant(14)}
       <span class="${P.venue_chip_text}" title="${esc(VENUE.name)}">${esc(VENUE.name)}</span>
     </div>`;

  /* ------------------------------------------------------- guest (landing) */

  function guestCard() {
    const perks = [
      { icon: I.discount(13), title: t('gha_join_benefit_discount_title'), body: t('gha_join_benefit_discount_body') },
      { icon: `<span class="${P.guest_perks_icon_text}">D$</span>`, title: t('gha_member_perk_pay_title'), body: t('gha_member_perk_pay') },
      { icon: I.wallet(13), title: t('gha_member_perk_earn_title'), body: t('gha_member_perk_earn') },
    ];
    return `<div class="${P.guest_card}">
      ${venueChip(P.venue_chip_in_card)}
      <h2 class="${P.guest_heading}">${t('gha_join_title')}</h2>
      <div class="${P.guest_panel_text}">
        <p class="${P.guest_panel_body}" style="color:${THEME.buttonColor}">${t('gha_join_heading_desc')}</p>
      </div>
      <div class="${P.guest_cta_stack}">
        ${btn(t('gha_join_cta_secondary'), 'c_btn_primary', 'data-act="open-signin" style="min-height:var(--secondary-button-height)"')}
        <hr class="${P.guest_divider}">
        <p class="${P.guest_join_prompt}">${t('gha_join_not_member_prompt')}</p>
        ${btn(t('gha_join_cta_primary'), 'c_btn_outline', 'data-act="open-signup"')}
      </div>
      <div class="${P.guest_perks_card}">
        <h3 class="${P.guest_perks_title}">${t('gha_member_perks_title')}</h3>
        <ul class="${P.guest_perks_list}">
          ${perks.map((p) => `<li class="${P.guest_perks_row}">
            <span class="${P.guest_perks_icon}" style="background-color:${THEME.buttonColor};color:${THEME.buttonTextColor}">${p.icon}</span>
            <div class="${P.guest_panel_text}">
              <h4 class="${P.guest_panel_title}">${p.title}</h4>
              <p class="${P.guest_panel_body}" style="color:${THEME.buttonColor}">${p.body}</p>
            </div>
          </li>`).join('')}
        </ul>
      </div>
      <button type="button" class="${P.guest_terms_link}" data-act="open-terms" style="color:${THEME.buttonColor}">${t('gha_terms_link')}</button>
    </div>`;
  }

  /* ------------------------------------------------------- member (landing) */

  function memberBody() {
    const tier = MEMBER.tier;
    const cardImg = `./assets/img/${tier.toLowerCase()}.webp`;
    const table = VENUE.table;

    const billReady = state.billStatus === 'ready';
    const fetching = state.billStatus === 'fetching';
    const burnSubtitle = state.burned
      ? t('gha_page_action_burn_subtitle_already_with_table', { table })
      : fetching
      ? t('gha_page_action_burn_subtitle_fetching')
      : billReady
      ? t('gha_page_action_burn_subtitle_total', { amount: fmtCur(billTotal) })
      : t('gha_page_action_burn_subtitle_empty_with_table', { table });

    const disabled = fetching || !billReady || !!state.sessionHint ? 'disabled' : '';

    const actionCard = (act, icon, title, subtitle, spinning) =>
      `<button type="button" class="${P.action_card}" data-act="${act}" ${disabled}>
         <span class="${P.action_icon}">${icon}</span>
         <span class="${P.action_text}">
           <p class="${P.action_title}">${title}</p>
           <p class="${P.action_subtitle}">${
             spinning
               ? `<span class="${P.burn_subtitle_loading}"><span class="${P.burn_subtitle_dot}"></span>${subtitle}</span>`
               : subtitle
           }</p>
         </span>
       </button>`;

    const actions =
      state.posVariant === 'view_bill'
        ? actionCard('go-burn', I.card(18), t('gha_page_action_apply_reward_title_with_table', { table }), burnSubtitle, fetching)
        : actionCard('go-earn', I.card(18), t('gha_page_action_earn_title_with_table', { table }), t('gha_page_action_earn_subtitle'), false) +
          actionCard('go-burn', I.wallet(18), t('gha_page_action_burn_title_with_table', { table }), burnSubtitle, fetching);

    return `
      ${venueChip()}
      <div class="${P.card_visual_wrap}">
        ${state.loadingProfile
          ? `<div class="${P.card_visual_loader}"><div class="${P.card_visual_spinner}"></div></div>`
          : `<div class="${P.card_visual}">
               <img src="${cardImg}" alt="" class="${P.card_visual_img}">
               <div class="${P.card_visual_meta}">
                 <div class="${P.card_name}">${esc(MEMBER.name)}</div>
                 <div class="${P.card_number}">${esc(MEMBER.cardNumber)}</div>
               </div>
               <div class="${P.card_tier}">${titleCase(tier)}</div>
             </div>`}
      </div>
      <div class="${P.stats_grid}">
        <div class="${P.stat_card}">
          <span class="${P.stat_value}">${fmtNum(MEMBER.accrued)}</span>
          <span class="${P.stat_label}">${t('gha_page_stat_dd_accrued')}</span>
        </div>
        <div class="${P.stat_card}">
          <span class="${P.stat_value}">${fmtNum(MEMBER.redeemed)}</span>
          <span class="${P.stat_label}">${t('gha_page_stat_dd_redeemed')}</span>
        </div>
      </div>
      <div class="${P.action_row}">
        ${state.sessionHint
          ? `<p class="${P.action_session_hint}">${t(
              state.sessionHint === 'expired'
                ? 'gha_session_hint_expired'
                : state.sessionHint === 'check_changed'
                ? 'gha_session_hint_check_changed'
                : 'gha_session_hint_no_token'
            )}</p>`
          : ''}
        ${actions}
      </div>`;
  }

  function pageScreen() {
    return `<div class="${P.page_root}">
      <div class="${P.scroll_area}">
        ${heroCover({ showBack: false, showLogout: state.signedIn })}
        <div class="${P.body}">
          ${state.signedIn ? memberBody() : guestCard()}
        </div>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------ bill parts */

  function itemsBlock() {
    const items = state.itemsExpanded ? BILL.items : BILL.items.slice(0, 4);
    return `
      <div class="${B.section_heading_row}">
        <h2 class="${B.section_heading}">${t('gha_burn_items_heading')} (${BILL.items.length})</h2>
      </div>
      <div class="${B.items_card}">
        ${items
          .map(
            (i) => `<div class="${B.item_row}">
              <span class="${B.item_count}">${i.count}×</span>
              <span class="${B.item_name}">${esc(i.name)}</span>
              <span class="${B.item_price}">${fmtCur(i.total)}</span>
            </div>`
          )
          .join('')}
        ${BILL.items.length > 4
          ? `<button type="button" class="${B.items_show_more}" data-act="toggle-items" aria-expanded="${state.itemsExpanded}">
               ${state.itemsExpanded ? t('gha_burn_items_show_less') : t('gha_burn_items_show_all', { count: BILL.items.length })}
               ${state.itemsExpanded ? I.chevronUp(18) : I.chevronDown(18)}
             </button>`
          : ''}
      </div>`;
  }

  function discountBlock() {
    if (state.discountState === 'checking') {
      return `<div class="${B.discount_checking_card}">
        <span class="${B.discount_checking_spinner}"></span>
        <span class="${B.discount_checking_text}">${t('gha_burn_checking_discount')}</span>
      </div>`;
    }
    if (state.discountState === 'failed' || state.discountState === 'other_member') {
      const other = state.discountState === 'other_member';
      return `<div class="${B.discount_error_card}">
        <div class="${B.discount_error_header}">
          ${I.alert(22)}
          <h3 class="${B.discount_error_title}">${t(
            other ? 'gha_burn_discount_different_member_title' : 'gha_burn_discount_failed_title'
          )}</h3>
        </div>
        ${other ? '' : `<p class="${B.discount_error_reason}">${t('gha_burn_discount_failed_reason', { reason: 'Check is open on another terminal' })}</p>`}
        <p class="${B.discount_error_body}">${t(
          other ? 'gha_burn_discount_different_member_body' : 'gha_burn_discount_failed_instruction'
        )}</p>
        ${other ? '' : btn(t('gha_burn_discount_retry'), 'c_btn_pill', 'data-act="retry-discount"')}
      </div>`;
    }
    return '';
  }

  function billCard({ showPosLabel }) {
    if (state.billStatus === 'fetching') {
      return `<div class="${B.bill_card}">
        <div class="${B.bill_row}">
          <span class="${B.bill_loading_inline}"><span class="${B.bill_loading_dot}"></span>${t('gha_page_action_burn_subtitle_fetching')}</span>
        </div>
      </div>`;
    }
    if (state.billStatus !== 'ready') {
      return `<div class="${B.bill_card}"><div class="${B.bill_row}"><span>${t('gha_burn_no_active_bill')}</span></div></div>`;
    }
    return `<div class="${B.bill_card}">
      ${showPosLabel
        ? `<div class="${B.bill_pos_label}"><span class="${B.bill_pos_dot}"></span>${t('gha_burn_bill_from', { posName: VENUE.posName })}</div>`
        : ''}
      <div class="${B.bill_row}"><span>${t('gha_burn_bill_subtotal')}</span><strong>${fmtCur(subtotal)}</strong></div>
      ${BILL.discounts
        .map(
          (d) => `<div class="${B.bill_row}">
            <span>${t('gha_burn_bill_discount_named', { name: d.name })}</span>
            <strong>-${fmtCur(d.amount)}</strong>
          </div>`
        )
        .join('')}
      ${BILL.charges
        .map((c) => `<div class="${B.bill_row}"><span>${esc(c.name)}</span><strong>${fmtCur(c.amount)}</strong></div>`)
        .join('')}
      <div class="${B.bill_total_row}"><span>${t('gha_burn_bill_total')}</span><span>${fmtCur(billTotal)}</span></div>
    </div>`;
  }

  const poweredBy = () => `<div class="${B.powered_by}">
      <p class="${B.powered_by_text}">${t('powered_by')}</p>
      <img src="./assets/img/mymenu-logo.png" alt="mymenu" class="${B.powered_by_logo}">
    </div>`;

  /* --------------------------------------------------------------- burn UI */

  function burnScreen() {
    const spend = Math.min(state.spend, eligibleDD());
    const value = spend * VENUE.localPerDollar;
    const remaining = Math.max(billTotal - value, 0);
    const canApply = state.billStatus === 'ready' && spend >= MIN_REDEEM && spend <= eligibleDD() && !state.burned;

    let redeemBlock;
    if (state.burned) {
      redeemBlock = `<div class="${B.burn_details_card}">
        <div class="${B.burn_details_header}">
          <span class="${B.burn_details_badge}">${I.check(20)}</span>
          <h3 class="${B.burn_details_title}">${t('gha_burn_already_applied')}</h3>
        </div>
        <div class="${B.burn_details_amount_row}">
          <span class="${B.burn_details_amount}">${fmtDD(state.burned.dd_redeemed)}</span>
          <span class="${B.burn_details_amount_local}">• ${fmtCur(state.burned.local_amount_redeemed)}</span>
        </div>
        <div class="${B.burn_details_row}"><span>${t('gha_burn_details_confirmation')}</span><strong>${esc(state.burned.confirmation_number)}</strong></div>
        <div class="${B.burn_details_row}"><span>${t('gha_burn_details_at')}</span><strong>${esc(state.burned.burned_at)}</strong></div>
      </div>`;
    } else if (eligibleDD() < MIN_REDEEM) {
      // Earn-only fallback: bill or balance too small to redeem against.
      redeemBlock = `
        <div class="${B.summary_row}"><span>${t('gha_eligible_ds_spend')}</span><strong>${fmtDD(eligibleDD())} | ${fmtCur(eligibleLocal)}</strong></div>
        <p class="${B.eligible_fine_print}">${t('gha_eligible_fine_print')}</p>
        <p class="${B.inline_error}">${t('gha_burn_earn_only_low_balance', { min: MIN_REDEEM })}</p>
        <div class="${B.section_heading_row}"><h2 class="${B.section_heading}">${t('gha_burn_earn_only_title')}</h2></div>
        <div class="${B.spend_card}">${btn(t('gha_burn_earn_button'), 'c_btn_primary', 'data-act="confirm-earn"')}</div>`;
    } else {
      redeemBlock = `
        <div class="${B.section_heading_row}">
          <h2 class="${B.section_heading}">${t('gha_spend_ds')}</h2>
          <button type="button" class="${B.help_toggle}" data-act="toggle-help" aria-expanded="${state.helpOpen}" aria-label="${t('gha_spend_ds')}">${I.info(18)}</button>
        </div>
        ${state.helpOpen ? `<p class="${B.help_text}">${t('gha_transaction_help', { min: MIN_REDEEM })}</p>` : ''}
        <div class="${B.spend_card}">
          <p class="${B.spend_range}">${t('gha_spend_ds_range', { min: MIN_REDEEM, max: fmtNum(eligibleDD()) })}</p>
          <div class="${B.summary_row}"><span>${t('gha_eligible_ds_spend')}</span><strong>${fmtDD(eligibleDD())} | ${fmtCur(eligibleLocal)}</strong></div>
          <p class="${B.eligible_fine_print}" style="color:${THEME.buttonColor}">${t('gha_eligible_fine_print')}</p>
          <input type="text" inputmode="numeric" class="${B.spend_input}" data-act="spend" value="${spend}" aria-label="${t('gha_spend_ds')}">
          <div class="${B.summary_row}"><span>Value (${VENUE.currencyCode})</span><strong>${fmtCur(value)}</strong></div>
          <div class="${B.summary_row}"><span>${t('gha_balance_left_to_pay')}</span><strong>${fmtCur(remaining)}</strong></div>
          ${spend < MIN_REDEEM ? `<p class="${B.inline_error}">${t('gha_min_bill_required', { amount: fmtCur(MIN_REDEEM * VENUE.localPerDollar) })}</p>` : ''}
          ${btn(t('gha_apply_ds', { amount: fmtNum(spend) }), 'c_btn_primary', `data-act="confirm-burn" ${canApply ? '' : 'disabled'}`)}
        </div>`;
    }

    return `<div class="${B.page_root}">
      <div class="${B.scroll_area}">
        ${heroCover({ showBack: true, showLogout: false })}
        <div class="${B.body}">
          ${itemsBlock()}
          ${discountBlock()}
          <div class="${B.section_heading_row}"><h2 class="${B.section_heading}">${t('gha_burn_bill_heading')}</h2></div>
          ${billCard({ showPosLabel: false })}
          ${state.earnPending
            ? `<div class="${B.burn_details_card}">
                 <div class="${B.burn_details_header}">
                   <span class="${B.burn_details_badge}">${I.check(20)}</span>
                   <h3 class="${B.burn_details_title}">${t('gha_earn_pending_title')}</h3>
                 </div>
                 <p class="${B.confirm_body}" style="text-align:left">${t('gha_earn_pending_body')}</p>
                 <div class="${B.burn_details_row}">
                   <span>${t('gha_burn_potential_earn_with_rate', { rate: MEMBER.earnRatePct })}</span>
                   <strong>+${fmtDD(potentialEarn)}</strong>
                 </div>
               </div>`
            : ''}
          ${redeemBlock}
          ${poweredBy()}
        </div>
      </div>
    </div>`;
  }

  /* --------------------------------------------------------------- earn UI */

  function earnScreen() {
    const done = state.earned || state.earnPending;
    return `<div class="${B.page_root}">
      <div class="${B.scroll_area}">
        ${heroCover({ showBack: true, showLogout: false })}
        <div class="${B.body}">
          ${itemsBlock()}
          ${discountBlock()}
          <div class="${B.section_heading_row}"><h2 class="${B.section_heading}">${t('gha_burn_bill_heading')}</h2></div>
          ${billCard({ showPosLabel: true })}
          ${done
            ? `<div class="${B.section_heading_row}"><h2 class="${B.section_heading}">${t('gha_earn_pending_title')}</h2></div>
               <div class="${B.burn_details_card}">
                 <div class="${B.burn_details_header}">
                   <span class="${B.burn_details_badge}">${I.check(20)}</span>
                   <h3 class="${B.burn_details_title}">${t('gha_earn_pending_title')}</h3>
                 </div>
                 <p class="${B.confirm_body}" style="text-align:left">${t('gha_earn_pending_body')}</p>
               </div>`
            : `<div class="${B.section_heading_row}"><h2 class="${B.section_heading}">${t('gha_earn_card_title')}</h2></div>
               <div class="${B.spend_card}">
                 <p class="${B.spend_range}">${t('gha_earn_card_body')}</p>
                 <div class="${B.summary_row}">
                   <span>${t('gha_burn_potential_earn_with_rate', { rate: MEMBER.earnRatePct })}</span>
                   <strong>+${fmtDD(potentialEarn)}</strong>
                 </div>
                 ${btn(t('gha_earn_cta'), 'c_btn_primary', `data-act="confirm-earn" ${state.billStatus === 'ready' ? '' : 'disabled'}`)}
               </div>`}
          ${poweredBy()}
        </div>
      </div>
    </div>`;
  }

  /* ------------------------------------------------- confirm / result modal */

  function confirmModal() {
    if (state.confirm === 'idle') return '';
    const isEarn = state.confirmKind === 'earn';
    const spend = Math.min(state.spend, eligibleDD());
    let body = '';

    if (state.confirm === 'confirm') {
      body = `
        <span class="${B.confirm_icon_wrap}">${I.wallet(26)}</span>
        <h3 class="${B.confirm_title}">${t(isEarn ? 'gha_earn_confirm_title' : 'gha_burn_confirm_title')}</h3>
        ${isEarn ? '' : `<span class="${B.confirm_amount_pill}">${fmtDD(spend)}</span>`}
        <p class="${B.confirm_body}">${
          isEarn
            ? t('gha_earn_confirm_body', { bill: fmtCur(billTotal) })
            : t('gha_burn_confirm_body', { amount: fmtNum(spend), bill: fmtCur(billTotal) })
        }</p>
        <div class="${B.confirm_actions}">
          ${btn(t('gha_burn_cancel'), 'c_btn_pill_outline', 'data-act="confirm-cancel"')}
          ${btn(t('gha_burn_confirm_cta'), 'c_btn_pill', 'data-act="confirm-submit"')}
        </div>`;
    } else if (state.confirm === 'submitting') {
      body = `
        <span class="${B.confirm_icon_wrap}"><div class="${B.confirm_inline_spinner}"></div></span>
        <h3 class="${B.confirm_title}">${t(isEarn ? 'gha_earn_processing' : 'gha_burn_applying')}</h3>`;
    } else if (state.confirm === 'success' || state.confirm === 'already') {
      const already = state.confirm === 'already';
      body = `
        <span class="${B.confirm_icon_wrap} ${B.confirm_icon_wrap_success}">${I.check(28)}</span>
        <h3 class="${B.confirm_title}">${t(
          isEarn ? (already ? 'gha_earn_already_title' : 'gha_earn_success_title') : 'gha_burn_success_title'
        )}</h3>
        ${isEarn ? '' : `<span class="${B.confirm_amount_pill}">${fmtDD(spend)}</span>`}
        <p class="${B.confirm_body}">${
          isEarn
            ? t(already ? 'gha_earn_already_body' : 'gha_earn_success_body')
            : t('gha_burn_success_body', { amount: fmtNum(spend) })
        }</p>
        ${isEarn && state.earned
          ? `<div class="${B.burn_details_card}" style="margin-top:4px">
               <div class="${B.burn_details_row}"><span>${t('gha_earn_details_transaction')}</span><strong>${esc(state.earned.transaction_id)}</strong></div>
               <div class="${B.burn_details_row}"><span>${t('gha_earn_details_pos_check')}</span><strong>${esc(state.earned.pos_check_number)}</strong></div>
               <div class="${B.burn_details_row}"><span>${t('gha_earn_details_pos_ref')}</span><strong>${esc(state.earned.pos_check_ref)}</strong></div>
             </div>`
          : ''}
        <div class="${B.confirm_actions_single}">${btn(t('gha_burn_done'), 'c_btn_pill', 'data-act="confirm-done"')}</div>`;
    } else if (state.confirm === 'error') {
      body = `
        <span class="${B.confirm_icon_wrap} ${B.confirm_icon_wrap_error}">${I.alert(28)}</span>
        <h3 class="${B.confirm_title}">${t(isEarn ? 'gha_earn_failed' : 'gha_burn_pos_failed_title')}</h3>
        <p class="${B.confirm_body}">${t('gha_burn_discount_failed_reason', { reason: 'POS check is locked by another terminal' })}</p>
        <p class="${B.confirm_body}">${t('gha_burn_discount_failed_instruction')}</p>
        <div class="${B.confirm_actions}">
          ${btn(t('gha_burn_cancel'), 'c_btn_pill_outline', 'data-act="confirm-cancel"')}
          ${btn(t('retry'), 'c_btn_pill', 'data-act="confirm-submit"')}
        </div>`;
    }

    return `<div class="modal_backdrop is_centered" data-dismiss="confirm">
      <div class="modal_dialog_centered ${B.confirm_modal_content}">
        <div class="${B.confirm_modal_body}">${body}</div>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------ text field */

  function field(name, label, opts = {}) {
    const { placeholder = '', type = 'text', value = '', adornment = '', error = '' } = opts;
    return `<div class="${M.gha_field}">
      <p class="${M.gha_field_label}">${label}<span class="${M.gha_required_star}"> *</span></p>
      <div class="mui_field">
        <div class="mui_input_root ${error ? 'is_error' : ''}">
          <input name="${name}" type="${type}" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off">
          ${adornment}
          <fieldset class="mui_notch"></fieldset>
        </div>
        ${error ? `<p class="mui_helper">${error}</p>` : ''}
      </div>
    </div>`;
  }

  const eyeAdornment = (shown, act) =>
    `<button type="button" class="mui_adornment" data-act="${act}" aria-label="toggle password visibility">${shown ? I.eyeOff(22) : I.eye(22)}</button>`;

  /* ------------------------------------------------------------ sign in UI */

  function signinModal() {
    return `<div class="modal_backdrop is_fullscreen">
      <div class="modal_sheet ${M.gha_modal_content}">
        <div class="${M.gha_modal_root}" style="height:100%;background-color:#ffffff">
          <div class="${M.gha_wallet_header}">
            <img class="${M.gha_wallet_wordmark}" src="./assets/img/gha-logo.jpg" alt="GHA DISCOVERY">
            <button type="button" class="${M.gha_close_btn_header}" data-act="close-modal" aria-label="Close">${I.close(24)}</button>
          </div>
          <div class="${M.gha_signup_body}">
            <h2 class="${M.gha_signup_title}" style="color:#14102e;font-size:22px">${t('gha_signin_title').toUpperCase()}</h2>
            ${field('login', t('gha_field_username_or_email'), {
              placeholder: t('gha_field_username_or_email_placeholder'),
              error: state.formError,
            })}
            ${field('password', t('password'), {
              type: state.showPassword ? 'text' : 'password',
              adornment: eyeAdornment(state.showPassword, 'toggle-password'),
            })}
            <button type="button" class="${M.gha_link_btn}" data-act="forgot" style="color:${THEME.buttonColor}">${t('gha_forgot_password_link')}</button>
            <button type="button" class="${M.gha_primary_btn} c_btn c_btn_primary" data-act="do-signin" ${state.submitting ? 'disabled' : ''}
              style="font-size:16px;font-weight:700">
              ${state.submitting
                ? `<span class="${M.gha_btn_content}"><span class="${M.gha_btn_spinner}"></span>${t('gha_submitting')}</span>`
                : t('gha_signin_cta')}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------ sign up UI */

  function signupModal() {
    if (state.signupDone) {
      return `<div class="${M.gha_success_backdrop}">
        <div class="${M.gha_success_drawer}">
          <div class="${M.gha_success_check}">${I.check(34)}</div>
          <h3 class="${M.gha_success_title}">${t('gha_redeem_success_title')}</h3>
          <p class="${M.gha_success_body}">Welcome to GHA DISCOVERY. Your membership is ready — you can now earn and redeem D$ on this bill.</p>
          ${btn(t('gha_continue'), 'c_btn_primary', 'data-act="signup-continue"')}
        </div>
      </div>`;
    }

    const consent = `
      <div class="gha_consent_text">
        <div class="${state.consentOpen ? '' : 'gha_consent_clamp'}">${t('gha_enrollment_agreement')}</div>
        <button type="button" class="gha_consent_toggle" data-act="toggle-consent">${state.consentOpen ? t('gha_read_less') : t('gha_read_more')}</button>
      </div>`;

    const marketing = `
      <div class="${M.gha_marketing_label}">
        <h3 class="${M.gha_signup_title}" style="font-size:16px;color:#14102e;margin:4px 0 0">${t('gha_marketing_title')}</h3>
        <p class="${M.gha_marketing_body}">${t('gha_marketing_body')}</p>
      </div>
      <div class="gha_check_row">
        <button type="button" class="gha_check_box ${state.marketingOptIn ? 'is_checked' : ''}" data-act="toggle-marketing" role="checkbox" aria-checked="${state.marketingOptIn}">
          ${state.marketingOptIn
            ? `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>`
            : `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>`}
        </button>
        <span class="gha_consent_text">${t('gha_marketing_optin')}</span>
      </div>
      <div class="gha_consent_text">
        <div class="${state.marketingOpen ? '' : 'gha_consent_clamp'}">${t('gha_cinnamon_marketing')}</div>
        <button type="button" class="gha_consent_toggle" data-act="toggle-marketing-text">${state.marketingOpen ? t('gha_read_less') : t('gha_read_more')}</button>
      </div>
      <p class="${M.gha_terms_text}">${t('gha_marketing_footnote')}</p>
      <p class="${M.gha_terms_text}" style="opacity:.9">
        ${t('gha_signup_consent_cinnamon_1')}<a href="#" style="color:${THEME.buttonColor}">${t('gha_link_terms')}</a>${t('gha_signup_consent_cinnamon_2')}<a href="#" style="color:${THEME.buttonColor}">${t('gha_link_gha_privacy')}</a>${t('gha_signup_consent_cinnamon_3')}<a href="#" style="color:${THEME.buttonColor}">${t('gha_link_cinnamon_privacy')}</a>.
      </p>`;

    return `<div class="modal_backdrop is_fullscreen">
      <div class="modal_sheet ${M.gha_modal_content}">
        <div class="${M.gha_modal_root}" style="height:100%;background-color:#ffffff">
          <div class="${M.gha_wallet_header}">
            <img class="${M.gha_wallet_wordmark}" src="./assets/img/gha-logo.jpg" alt="GHA DISCOVERY">
            <button type="button" class="${M.gha_close_btn_header}" data-act="close-modal" aria-label="Close">${I.close(24)}</button>
          </div>
          <div class="${M.gha_signup_body}">
            <h2 class="${M.gha_signup_title}" style="color:#14102e;font-size:22px">${t('gha_signup_title').toUpperCase()}</h2>

            <div class="${M.gha_field}">
              <p class="${M.gha_field_label}">${t('gha_field_language')}<span class="${M.gha_required_star}"> *</span></p>
              <div class="gha_select">English<span class="gha_select_divider"></span>${I.chevronDown(20)}</div>
              <p class="${M.gha_field_hint}">${t('gha_field_language_hint')}</p>
            </div>

            ${field('first_name', t('first_name'), { placeholder: t('gha_field_first_name_placeholder') })}
            ${field('last_name', t('last_name'), { placeholder: t('gha_field_last_name_placeholder') })}
            ${field('email', t('email_address'), { placeholder: t('gha_field_email_placeholder'), type: 'email' })}

            <div class="${M.gha_field}">
              <p class="${M.gha_field_label}">${t('gha_field_phone')}<span class="${M.gha_required_star}"> *</span></p>
              <div class="${M.gha_phone_row}">
                <div class="gha_dial_box">
                  <img class="${M.gha_dial_flag}" alt="LK" src="data:image/svg+xml;utf8,${encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 16"><rect width="22" height="16" fill="#8d2029"/><rect x="1" y="1" width="6" height="14" fill="#ffbe29"/><rect x="1" y="1" width="3" height="14" fill="#00534e"/><rect x="8" y="1" width="13" height="14" fill="#ffbe29"/><rect x="9" y="2" width="11" height="12" fill="#8d2029"/></svg>'
                  )}">
                  <span class="${M.gha_dial_value}">+94</span>
                  ${I.chevronDown(16)}
                </div>
                <input class="gha_phone_input" placeholder="${t('gha_field_phone_placeholder')}" inputmode="tel">
              </div>
            </div>

            ${field('password', t('password'), {
              type: state.signupPassword ? 'text' : 'password',
              adornment: eyeAdornment(state.signupPassword, 'toggle-signup-password'),
            })}

            ${consent}
            ${marketing}

            <button type="button" class="${M.gha_primary_btn} c_btn c_btn_primary" data-act="do-signup" ${state.submitting ? 'disabled' : ''}
              style="font-size:16px;font-weight:700">
              ${state.submitting
                ? `<span class="${M.gha_btn_content}"><span class="${M.gha_btn_spinner}"></span>${t('gha_submitting')}</span>`
                : t('gha_signup_cta')}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* -------------------------------------------------------------- terms UI */

  function termsModal() {
    return `<div class="modal_backdrop is_fullscreen">
      <div class="modal_sheet ${M.gha_modal_content}">
        <div class="${M.gha_modal_root}" style="height:100%;background-color:#ffffff">
          <div class="${M.gha_terms_header}">
            <h2 class="${M.gha_signup_title}" style="color:#14102e;font-size:26px;margin:0">${t('gha_terms_title')}</h2>
            <button type="button" class="${M.gha_close_btn_header}" data-act="close-modal" aria-label="${t('close')}">${I.close(22)}</button>
          </div>
          <div class="${M.gha_terms_body}">
            <div class="${M.gha_terms_content}">${window.GHA_TERMS_HTML}</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* -------------------------------------------------------- mock controls  */

  function mockControls() {
    if (!state.mockOpen) return `<button class="mock_fab" data-act="mock-toggle" title="Mock controls">☰</button>`;
    const opt = (v, cur, label) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${label}</option>`;
    return `<button class="mock_fab" data-act="mock-toggle">✕</button>
      <div class="mock_panel">
        <h4>Mockup states</h4>
        <label>Session</label>
        <select data-mock="signedIn">
          ${opt('false', String(state.signedIn), 'Guest (not signed in)')}
          ${opt('true', String(state.signedIn), 'Signed in member')}
        </select>
        <label>POS check</label>
        <select data-mock="billStatus">
          ${opt('ready', state.billStatus, 'Open check with items')}
          ${opt('fetching', state.billStatus, 'Fetching from POS')}
          ${opt('empty', state.billStatus, 'No active bill')}
        </select>
        <label>Member discount</label>
        <select data-mock="discountState">
          ${opt('ok', state.discountState, 'Applied on POS')}
          ${opt('checking', state.discountState, 'Checking…')}
          ${opt('failed', state.discountState, 'POS rejected discount')}
          ${opt('other_member', state.discountState, 'Opened by another member')}
        </select>
        <label>Session token</label>
        <select data-mock="sessionHint">
          ${opt('', state.sessionHint || '', 'Valid')}
          ${opt('expired', state.sessionHint || '', 'Expired')}
          ${opt('check_changed', state.sessionHint || '', 'Check changed')}
          ${opt('no_token', state.sessionHint || '', 'No token')}
        </select>
        <label>Member actions</label>
        <select data-mock="posVariant">
          ${opt('earn_burn', state.posVariant, 'Earn D$ + Burn D$')}
          ${opt('view_bill', state.posVariant, 'View Bill (single card)')}
        </select>
        <button data-act="mock-reset">Reset mockup</button>
      </div>`;
  }

  /* --------------------------------------------------------------- render  */

  function render() {
    const screen =
      state.screen === 'burn' ? burnScreen() : state.screen === 'earn' ? earnScreen() : pageScreen();

    const modal =
      state.modal === 'signin'
        ? signinModal()
        : state.modal === 'signup'
        ? signupModal()
        : state.modal === 'terms'
        ? termsModal()
        : '';

    // A modal locks the page behind it, the way Bootstrap's modal does.
    const locked = state.modal || state.confirm !== 'idle' ? 'hidden' : '';
    document.body.style.overflow = locked;
    document.documentElement.style.overflow = locked;

    document.getElementById('root').innerHTML = screen + modal + confirmModal() + mockControls();
  }

  /* ------------------------------------------------------------- behaviour */

  const timestamp = () =>
    new Date().toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const ACTIONS = {
    'open-signin': () => set({ modal: 'signin', formError: '', showPassword: false }),
    'open-signup': () => set({ modal: 'signup', formError: '', signupDone: false }),
    'open-terms': () => set({ modal: 'terms' }),
    'close-modal': () => set({ modal: null, submitting: false }),
    'toggle-password': () => set({ showPassword: !state.showPassword }),
    'toggle-signup-password': () => set({ signupPassword: !state.signupPassword }),
    'toggle-consent': () => set({ consentOpen: !state.consentOpen }),
    'toggle-marketing-text': () => set({ marketingOpen: !state.marketingOpen }),
    'toggle-marketing': () => set({ marketingOptIn: !state.marketingOptIn }),

    // The live page opens the GHA reset-password page in a new tab.
    forgot: () => window.open('https://www.ghadiscovery.com/member/settings/password', '_blank', 'noopener,noreferrer'),

    'do-signin': () => {
      const login = document.querySelector('input[name=login]');
      if (!login || !login.value.trim()) {
        set({ formError: 'Username or email is required' });
        return;
      }
      set({ submitting: true, formError: '' });
      setTimeout(() => {
        set({ submitting: false, modal: null, signedIn: true, loadingProfile: true });
        setTimeout(() => set({ loadingProfile: false }), 1200);
      }, 900);
    },

    'do-signup': () => {
      set({ submitting: true });
      setTimeout(() => set({ submitting: false, signupDone: true }), 1100);
    },
    'signup-continue': () => {
      set({ modal: null, signupDone: false, signedIn: true, loadingProfile: true });
      setTimeout(() => set({ loadingProfile: false }), 1200);
    },

    logout: () =>
      set({
        signedIn: false, screen: 'page', burned: null, earned: null, earnPending: false,
        balance: MEMBER.balance, spend: INITIAL_SPEND, confirm: 'idle', modal: null,
      }),

    back: () => set({ screen: 'page' }),
    'go-burn': () => set({ screen: 'burn', itemsExpanded: false }),
    'go-earn': () => set({ screen: 'earn', itemsExpanded: false }),

    'toggle-items': () => set({ itemsExpanded: !state.itemsExpanded }),
    'toggle-help': () => set({ helpOpen: !state.helpOpen }),

    'retry-discount': () => {
      set({ discountState: 'checking' });
      setTimeout(() => set({ discountState: 'ok' }), 1400);
    },

    copy: () => {
      if (navigator.clipboard) navigator.clipboard.writeText(MEMBER.cardNumber).catch(() => {});
      set({ copied: true });
      setTimeout(() => set({ copied: false }), 1500);
    },

    'confirm-burn': () => set({ confirm: 'confirm', confirmKind: 'burn' }),
    'confirm-earn': () => set({ confirm: 'confirm', confirmKind: 'earn' }),
    'confirm-cancel': () => set({ confirm: 'idle' }),
    'confirm-submit': () => {
      set({ confirm: 'submitting' });
      setTimeout(() => {
        if (state.confirmKind === 'earn') {
          set({
            confirm: 'success',
            earned: {
              transaction_id: 'GHA-' + Math.floor(1e7 + Math.random() * 8e7),
              pos_check_number: '2408',
              pos_check_ref: 'DB-' + Math.floor(1e5 + Math.random() * 8e5),
            },
            earnPending: true,
          });
        } else {
          const spend = Math.min(state.spend, eligibleDD());
          // The GHA dashboard is refetched after a redemption, so the balance
          // in the hero drops by what was applied.
          set({
            confirm: 'success',
            balance: state.balance - spend,
            burned: {
              dd_redeemed: spend,
              local_amount_redeemed: spend * VENUE.localPerDollar,
              confirmation_number: 'BRN' + Math.floor(1e6 + Math.random() * 8e6),
              burned_at: timestamp(),
            },
          });
        }
      }, 1600);
    },
    'confirm-done': () => set({ confirm: 'idle' }),

    'mock-toggle': () => set({ mockOpen: !state.mockOpen }),
    'mock-reset': () =>
      set({
        signedIn: false, screen: 'page', billStatus: 'ready', discountState: 'ok', sessionHint: null,
        posVariant: 'earn_burn', burned: null, earned: null, earnPending: false,
        balance: MEMBER.balance, spend: INITIAL_SPEND, confirm: 'idle', modal: null, mockOpen: false,
      }),
  };

  document.addEventListener('click', (e) => {
    const dismiss = e.target.closest('[data-dismiss=confirm]');
    if (dismiss && e.target === dismiss && state.confirm !== 'submitting') {
      set({ confirm: 'idle' });
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.getAttribute('data-act')];
    if (fn) fn();
  });

  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-act=spend]')) {
      const digits = e.target.value.replace(/[^0-9]/g, '');
      const n = Math.min(Number(digits || 0), eligibleDD());
      const pos = e.target.selectionStart;
      state.spend = n;
      render();
      const next = document.querySelector('[data-act=spend]');
      if (next) { next.focus(); try { next.setSelectionRange(pos, pos); } catch (_) {} }
    }
  });

  document.addEventListener('change', (e) => {
    const key = e.target.getAttribute && e.target.getAttribute('data-mock');
    if (!key) return;
    let v = e.target.value;
    if (key === 'signedIn') v = v === 'true';
    if (key === 'sessionHint') v = v || null;
    const patch = { [key]: v };
    if (key === 'signedIn' && v === false) patch.screen = 'page';
    set(patch);
  });

  // Focus ring on the MUI outline, as the real fields do.
  document.addEventListener('focusin', (e) => {
    const root = e.target.closest && e.target.closest('.mui_input_root');
    if (root) root.classList.add('is_focused');
  });
  document.addEventListener('focusout', (e) => {
    const root = e.target.closest && e.target.closest('.mui_input_root');
    if (root) root.classList.remove('is_focused');
  });

  render();
})();
