/**
 * Fixtures + the guest-facing copy deck for the redesigned settlement flow.
 *
 * Nothing here names MyMenu, DigiMenu, Simphony, Oracle or a POS: the guest
 * vocabulary is "your bill", "your DISCOVERY benefit", "your D$". System
 * vocabulary lives in dev.js, behind the reviewer drawer.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------ the venue */

  const VENUE = {
    outlet: 'Staten Bar & Grill',
    property: 'Cinnamon Life at City of Dreams Sri Lanka',
    table: 'Table 14',
    currency: 'LKR',
    localPerDollar: 302,          // D$1 = USD 1; placeholder local rate
    serviceChargePct: 10,
    taxPct: 18,
    coverImageUrl: '../assets/img/cover.jpg'
  };

  /* ------------------------------------------------------------- the tiers */

  const TIERS = {
    SILVER:   { label: 'Silver',   discountPct: 10, earnPct: 4, balance: 12,  art: '../assets/img/silver.webp' },
    GOLD:     { label: 'Gold',     discountPct: 12, earnPct: 5, balance: 46,  art: '../assets/img/gold.webp' },
    PLATINUM: { label: 'Platinum', discountPct: 15, earnPct: 6, balance: 92,  art: '../assets/img/platinum.webp' },
    TITANIUM: { label: 'Titanium', discountPct: 15, earnPct: 7, balance: 148, art: '../assets/img/titanium.webp' }
  };

  const MEMBER = {
    firstName: 'Gavin',
    lastName: 'Gimbo',
    email: 'gavin.gimbo@example.com',
    cardNumber: '4407 1188 2043',
    tier: 'TITANIUM'
  };

  /* -------------------------------------------------------------- the bill */
  /* Tobacco, service charge, tips and taxes are ineligible for both earning
     and redemption — the eligible subtotal is computed on the rest. */

  const ITEMS = [
    { id: 1, name: 'Sapphire Dragon signature platter', count: 1, total: 9800, eligible: true },
    { id: 2, name: 'Charcoal grilled lamb chops',       count: 2, total: 8400, eligible: true },
    { id: 3, name: 'Truffle wild mushroom risotto',     count: 1, total: 4600, eligible: true },
    { id: 4, name: 'Yoroko sashimi selection',          count: 1, total: 3200, eligible: true },
    { id: 5, name: 'Sparkling water 750ml',             count: 2, total: 1400, eligible: true },
    { id: 6, name: 'Dark chocolate fondant',            count: 2, total: 2600, eligible: true },
    { id: 7, name: 'Cohiba Siglo VI',                   count: 1, total: 1600, eligible: false }
  ];

  // The line staff ring in when the reviewer plays the "bill updated" state.
  const LATE_ITEM = { id: 8, name: 'Ceylon arrack tasting flight', count: 1, total: 3600, eligible: true };

  /* -------------------------------------------------------------- the copy */

  const COPY = {
    // 01 — check recognised
    landing_title: 'Your bill is ready',
    landing_lede: 'Sign in securely to see your eligible DISCOVERY dining benefit and D$ for this bill.',
    landing_cta: 'Continue with DISCOVERY',
    landing_join: 'Not a member? Join free',
    terms_link: 'Terms and conditions',
    powered_by: 'Powered by GHA DISCOVERY',

    // 02 — authentication router
    auth_known_title: 'Welcome back',
    auth_known_note: "You're already signed in to DISCOVERY on this device.",
    auth_known_cta: 'Continue securely',
    auth_title: 'Sign in to DISCOVERY',
    auth_lede: 'We only need your email to find your membership and this bill’s benefit.',
    auth_email_label: 'Email address',
    auth_cta: 'Continue',
    auth_use_password: 'Use password instead',
    auth_otp_offer_title: 'We can send a secure sign-in code',
    auth_otp_offer_body: 'A six-digit code goes to your registered email. No password needed.',
    auth_otp_cta: 'Send code',
    auth_passkey_title: 'Sign in securely',
    auth_passkey_body: 'Use your saved DISCOVERY passkey to continue. Your device will ask you to confirm.',
    auth_passkey_cta: 'Continue',
    auth_email_invalid: 'Enter the email address on your DISCOVERY account.',
    auth_failed: 'We couldn’t sign you in. Try again in a moment.',

    // 03 — password fallback
    pw_title: 'Enter your DISCOVERY password',
    pw_label: 'Password',
    pw_cta: 'Sign in',
    pw_forgot: 'Forgot password?',
    pw_other: 'Use another sign-in method',
    pw_wrong: 'That password didn’t match. Try again, or reset it securely.',
    pw_reset: 'Reset password',
    pw_retry: 'Try again',

    // 04 / 05 / 06 — recovery
    reset_title: 'Reset your password',
    reset_body: 'We’ll send a secure reset link to your registered email. You’ll return to this bill when you’re done.',
    reset_cta: 'Send reset link',
    reset_other: 'Use a different account',
    sent_title: 'Check your email',
    sent_body: 'We sent a password reset link to {{email}}.',
    sent_open: 'Open email',
    sent_resend: 'Send again',
    sent_hold_title: 'Your bill is still here.',
    sent_hold_body: 'Return to this page after resetting your password and we’ll continue automatically.',
    return_title: 'Password updated',
    return_body: 'You’re securely signed in.',
    return_cta: 'Continue to bill',

    // 07A — OTP
    otp_title: 'Verify it’s you',
    otp_body: 'Enter the 6-digit code sent to {{email}}.',
    otp_cta: 'Continue',
    otp_resend: 'Resend code',
    otp_password: 'Use password instead',
    otp_wrong: 'That code didn’t match. Check the latest email and try again.',

    // 07B — magic link
    magic_title: 'Check your email',
    magic_body: 'Tap the secure DISCOVERY sign-in link we sent to {{email}} to continue with this bill.',
    magic_hold: 'Your bill is waiting for you here.',

    // 08 — member recognition
    member_title: 'Welcome back, {{name}}',
    benefit_heading: 'Your DISCOVERY benefit',
    benefit_line: 'Dining benefit',
    benefit_applied: 'Applied to your bill',
    benefit_checking: 'Applying your benefit…',
    benefit_cta: 'Review bill',
    benefit_none_title: 'No dining benefit on this bill',
    benefit_none_body: 'This outlet doesn’t offer a member discount, but you can still use and earn D$ here.',

    // 09 — bill + D$
    bill_title: 'Your bill',
    bill_items: 'Items subtotal',
    bill_benefit: 'DISCOVERY benefit',
    bill_service: 'Service charge',
    bill_tax: 'Taxes',
    bill_total: 'Total',
    bill_view_items: 'View items',
    bill_hide_items: 'Hide items',
    bill_ineligible: 'Not eligible for D$',
    ds_heading: 'Use your D$',
    ds_available: 'Available',
    ds_eligible: 'Eligible on this bill',
    ds_using: 'Using D$ {{amount}}',
    ds_remaining: 'Remaining to pay',
    ds_cta: 'Apply D$ {{amount}}',
    ds_skip: 'Continue without using D$',
    ds_earn_note: 'You’ll also earn D$ on eligible spend from this bill.',
    ds_low_title: 'D$ aren’t available on this bill',
    ds_low_body: 'You need at least D$ 10 to use them against a bill. Your benefit is already applied, and you’ll still earn D$ from this visit.',
    ds_fine_print: 'Tobacco, service charge, tips and government taxes are not eligible for D$.',

    // 10 / 11 / 12
    confirm_title: 'Use D$ {{amount}}?',
    confirm_value: 'Value applied',
    confirm_remaining: 'Remaining bill',
    confirm_note: 'Once applied, changes may need assistance from your server.',
    confirm_cta: 'Confirm and apply',
    confirm_cancel: 'Not now',
    applying_title: 'Applying your D$…',
    applying_body: 'This usually takes only a moment.',
    success_title: 'Your DISCOVERY benefits are applied',
    success_ds: 'D$ used',
    success_settle: 'Please settle the remaining amount with your server.',
    success_earn: 'Eligible D$ from this visit will be credited to your account.',
    success_cta: 'Done',
    done_title: 'Thank you',
    done_body: 'Your benefits are on your bill. Your server will take it from here.',

    // 13 — join
    join_title: 'Join DISCOVERY',
    join_lede: 'Become a member free and unlock eligible dining benefits and D$ at participating hotels and restaurants.',
    join_first: 'First name',
    join_last: 'Last name',
    join_email: 'Email address',
    join_phone: 'Phone number',
    join_password: 'Create a password',
    join_next: 'Continue',
    join_cta: 'Create account',
    join_consent: 'By joining, I consent to GHA Loyalty FZCO, the operator of the GHA DISCOVERY programme, storing and processing my data to recognise and reward my stays and visits across the network.',
    join_marketing: 'Send me offers and updates from Cinnamon Hotels & Resorts and GHA DISCOVERY. I can unsubscribe at any time.',
    join_welcome: 'Welcome to DISCOVERY',
    join_welcome_body: 'Your membership is live. We’re taking you back to your bill.',

    // 14 — failure states
    updated_title: 'Your bill was updated',
    updated_body: 'We’ve refreshed it with the latest items.',
    updated_cta: 'Review updated bill',
    expired_title: 'This bill link has expired',
    expired_body: 'Please ask your server to refresh your DISCOVERY bill link.',
    expired_cta: 'Scan new QR',
    locked_title: 'A DISCOVERY member is already linked to this bill',
    locked_body: 'To use a different membership, your server will need to split or reopen the bill for you.',
    locked_cta: 'Ask server for help',
    rejected_title: 'We couldn’t apply your DISCOVERY benefit yet',
    rejected_body: 'Your server can help complete this for you.',
    rejected_cta: 'Try again',
    rejected_staff: 'Show this to my server',
    nobill_title: 'No bill on this table yet',
    nobill_body: 'As soon as your server adds items, your bill will appear here. You can leave this page open.',
    closed_title: 'This bill is already settled',
    closed_body: 'Nothing further is needed. Any eligible D$ from this visit will be credited to your account.',
    pending_title: 'We’re confirming your D$',
    pending_body: 'Please don’t try again yet. We’re checking whether the transaction completed.',
    failed_title: 'Your D$ were not applied',
    failed_body: 'Nothing was deducted from your balance.',
    recon_title: 'We need a moment to confirm this transaction',
    recon_body: 'Please show this screen to your server before settling the bill.',
    offline_title: 'DISCOVERY is temporarily unavailable',
    offline_body: 'Your server can help you continue with your bill.',
    offline_secondary: 'Continue with server',
    slow_title: 'Still working on it',
    slow_body: 'This is taking a little longer than usual. We’ll keep this bill open.',

    // 15 — staff handoff
    staff_title: 'For your server',
    staff_outlet: 'Outlet',
    staff_table: 'Table',
    staff_check: 'Bill',
    staff_member: 'Member',
    staff_benefit: 'Benefit',
    staff_redemption: 'D$',
    staff_ref: 'Reference',
    staff_done: 'Back'
  };

  window.CD = window.CD || {};
  window.CD.data = { VENUE, TIERS, MEMBER, ITEMS, LATE_ITEM, COPY };
})();
