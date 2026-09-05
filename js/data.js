/**
 * Mock data + the copy deck.
 *
 * Every string in LABELS is the English value the live app ships in its i18n
 * bundle, key for key, so the mockup reads identically to production. {{token}}
 * placeholders are interpolated by t() in app.js.
 */
(function () {
  const LABELS = {
    // Guest / landing
    gha_join_title: 'Dine with D$',
    gha_join_heading_desc:
      'Earn and pay with DISCOVERY Dollars at participating restaurants from Cinnamon Hotels & Resorts (D$1 = USD 1)',
    gha_join_cta_secondary: 'Sign in to continue',
    gha_join_not_member_prompt: 'Not yet a GHA DISCOVERY member?',
    gha_join_cta_primary: 'Join now for free',
    gha_member_perks_title: 'A more rewarding way to dine',
    gha_join_benefit_discount_title: 'Up to 15% off the bill',
    gha_join_benefit_discount_body: 'Enjoy member-exclusive dining discounts',
    gha_member_perk_pay_title: 'Pay with D$',
    gha_member_perk_pay: 'Redeem your available D$ towards your bill',
    gha_member_perk_earn_title: 'Earn D$ back',
    gha_member_perk_earn: 'Receive 4-7% back in D$ on eligible spend',
    gha_terms_link: 'Terms & Conditions',
    gha_terms_title: 'Terms & Conditions',
    gha_terms_empty: 'Terms & Conditions are not available at this venue.',
    close: 'Close',

    // Member page
    gha_page_stat_dd_accrued: 'D$ Earned',
    gha_page_stat_dd_redeemed: 'D$ Redeemed',
    gha_page_action_apply_reward_title: 'View Bill',
    gha_page_action_apply_reward_title_with_table: 'View Bill on {{table}}',
    gha_page_action_earn_title: 'Earn D$',
    gha_page_action_earn_title_with_table: 'Earn D$ on {{table}}',
    gha_page_action_earn_subtitle: 'Credit DISCOVERY Dollars to your GHA account from this bill',
    gha_page_action_burn_title: 'Burn D$',
    gha_page_action_burn_title_with_table: 'Burn D$ on {{table}}',
    gha_page_action_burn_subtitle_idle: 'Redeem D$ on your current bill',
    gha_page_action_burn_subtitle_total: 'Bill total: {{amount}}',
    gha_page_action_burn_subtitle_fetching: 'Fetching new bill from POS…',
    gha_page_action_burn_subtitle_empty: 'No active bill yet',
    gha_page_action_burn_subtitle_empty_with_table: 'No active bill on {{table}} yet',
    gha_page_action_burn_subtitle_already: 'DISCOVERY Dollars already applied to this bill',
    gha_page_action_burn_subtitle_already_with_table: 'DISCOVERY Dollars already applied on {{table}}',
    gha_page_load_failed: 'Unable to load GHA DISCOVERY. Please try again.',
    gha_session_hint_no_token: 'Please ask staff for the QR to start your session.',
    gha_session_hint_expired: 'Your session has expired. Please ask staff for a new QR.',
    gha_session_hint_check_changed: 'The bill has changed. Please ask staff for a new QR.',
    retry: 'Retry',
    powered_by: 'Powered by',

    // Bill (earn + burn)
    gha_burn_items_heading: 'Items',
    gha_burn_items_empty: 'No items on this check yet.',
    gha_burn_items_show_all: 'Show all {{count}}',
    gha_burn_items_show_less: 'Show less',
    gha_burn_bill_heading: 'Your bill',
    gha_burn_bill_from: 'Live from {{posName}}',
    gha_burn_bill_subtotal: 'Subtotal',
    gha_burn_bill_discount: 'Discount',
    gha_burn_bill_discount_named: 'Discount ({{name}})',
    gha_burn_bill_total: 'Total',
    gha_burn_no_active_bill: 'No active bill found on the POS yet.',
    gha_burn_checking_discount: 'Checking for member discount…',
    gha_burn_discount_failed_title: 'Failed to apply discount on POS',
    gha_burn_discount_failed_reason: 'Reason: {{reason}}',
    gha_burn_discount_failed_instruction:
      'Please ask the venue staff to close the check on the POS, then tap retry.',
    gha_burn_discount_retry: 'Retry',
    gha_burn_discount_retrying: 'Retrying…',
    gha_burn_discount_different_member_title: 'This check is opened by another member',
    gha_burn_discount_different_member_body:
      'Only the first GHA member to scan this check can apply a discount or redeem D$ on it. Please ask the venue staff to open a new check to continue.',
    gha_burn_pos_failed_title: 'Failed to apply D$ on POS',

    // Burn
    gha_spend_ds: 'Spend D$',
    gha_spend_ds_range: 'You can spend between D${{min}}-{{max}}',
    gha_eligible_ds_spend: 'Eligible for D$ spend',
    gha_eligible_fine_print:
      '*Tobacco, service charges, tips, and applicable government taxes are ineligible for DISCOVERY Dollar (D$) earning and redemption.',
    gha_balance_left_to_pay: 'Balance left to pay',
    gha_apply_ds: 'APPLY D${{amount}}',
    gha_transaction_help:
      'Your D$ balance can be redeemed directly against your bill. Minimum redemption D${{min}}.',
    gha_min_bill_required:
      'Your bill must be at least {{amount}} (D$10) to redeem DISCOVERY Dollars on this check.',
    gha_no_eligible_spend: 'Nothing on this bill is eligible for DISCOVERY Dollar redemption.',
    gha_burn_confirm_title: 'Apply DISCOVERY Dollars?',
    gha_burn_confirm_body:
      "D${{amount}} will be redeemed against your bill of {{bill}}. This can't be undone from your phone.",
    gha_burn_confirm_cta: 'Confirm',
    gha_burn_cancel: 'Cancel',
    gha_burn_applying: 'Applying…',
    gha_burn_success_title: 'DISCOVERY Dollars applied',
    gha_burn_success_body:
      'D${{amount}} has been redeemed against your bill. Show this confirmation to the venue if requested.',
    gha_burn_done: 'Done',
    gha_burn_failed: "We couldn't apply your DISCOVERY Dollars. Please try again.",
    gha_burn_already_applied:
      "DISCOVERY Dollars are already applied to this bill. You can't redeem again.",
    gha_burn_details_confirmation: 'Confirmation #',
    gha_burn_details_at: 'Applied at',
    gha_burn_earn_button: 'Earn D$',
    gha_burn_earn_only_title: 'Earn DISCOVERY Dollars',
    gha_burn_earn_only_body:
      'Your bill must be at least {{amount}} (D$10) to redeem DISCOVERY Dollars on this check. You can still earn D$ from this visit.',
    gha_burn_earn_only_low_balance:
      "You don't have enough DISCOVERY Dollars to redeem on this check (a minimum of D${{min}} is required). You can still earn D$ from this visit.",
    gha_burn_earn_only_no_eligible:
      'Nothing on this bill is currently eligible for DISCOVERY Dollar redemption. You can still earn D$ from this visit.',
    gha_burn_potential_earn: "You'll earn",
    gha_burn_potential_earn_with_rate: "You'll earn ({{rate}}%)",
    gha_burn_signin_required: 'Please sign in to GHA DISCOVERY first.',

    // Earn
    gha_earn_card_title: 'Earn from this bill',
    gha_earn_card_body:
      'DISCOVERY Dollars will be credited to your GHA DISCOVERY account based on your eligible spend on this bill.',
    gha_earn_cta: 'Earn DISCOVERY Dollars',
    gha_earn_confirm_title: 'Confirm earn',
    gha_earn_confirm_body:
      'DISCOVERY Dollars will be credited to your account for this bill of {{bill}}. You can earn from a bill only once.',
    gha_earn_processing: 'Crediting your account…',
    gha_earn_success_title: 'DISCOVERY Dollars earned',
    gha_earn_success_body:
      'Your earnings are on the way. Show this confirmation to the venue if requested.',
    gha_earn_already_title: 'DISCOVERY Dollars already earned',
    gha_earn_already_body: "This bill's earnings have already been credited to your account.",
    gha_earn_failed: "We couldn't credit your DISCOVERY Dollars. Please try again.",
    gha_earn_details_transaction: 'Transaction ID',
    gha_earn_details_pos_check: 'POS check #',
    gha_earn_details_pos_ref: 'POS reference',
    gha_earn_pending_title: 'Your D$ are on the way!',
    gha_earn_pending_body:
      'Your D$ request is being processed and will be added to your account shortly.',

    // Sign in / sign up
    gha_signin_title: 'Sign In',
    gha_signin_cta: 'SIGN IN',
    gha_forgot_password_link: 'Forgot Password?',
    gha_field_username_or_email: 'Username or Email',
    gha_field_username_or_email_placeholder: 'Your username or email',
    password: 'Password',
    gha_auth_generic_error: 'Something went wrong. Please try again.',
    gha_signup_title: "Let's get started",
    gha_signup_cta: 'JOIN',
    gha_submitting: 'Submitting...',
    gha_field_language: 'Language',
    gha_field_language_hint: 'This language will be used in your email communications',
    first_name: 'First name',
    last_name: 'Last name',
    email_address: 'Email address',
    gha_field_first_name_placeholder: 'Your first name',
    gha_field_last_name_placeholder: 'Your last name',
    gha_field_email_placeholder: 'you@example.com',
    gha_field_phone: 'Phone number',
    gha_field_phone_placeholder: 'Phone number',
    gha_enrollment_agreement:
      'By enrolling as a Cinnamon DISCOVERY Member, I consent to GHA Loyalty FZCO, the operator of the GHA DISCOVERY loyalty program, storing and processing my data for the purposes of recognising and rewarding stays in hotels across the GHA DISCOVERY network.',
    gha_marketing_title: 'Be the first to know',
    gha_marketing_body:
      'Never miss out on limited-time offers and personalised updates on flash sales and special hotel and partnership promotions from GHA DISCOVERY by email and other digital channels. Unsubscribe anytime by following the instructions in the Privacy Policy linked below.',
    gha_marketing_optin:
      'I would like to receive emails about GHA DISCOVERY promotions and special offers. I can manage my email preferences or unsubscribe at any time from future emails.',
    gha_cinnamon_marketing:
      "By providing your contact information and opting in, you consent to receive marketing communications from Cinnamon Hotels and Resorts. These communications may include exclusive offers, promotions, updates on our services, and other information related to our hotels and resorts. You can unsubscribe at any time by clicking the 'unsubscribe' link in the emails we send.",
    gha_marketing_footnote:
      '*If you choose to opt out of marketing communications you will still receive operational emails from GHA DISCOVERY such as account statement and messages about your personal account.',
    gha_signup_consent_cinnamon_1: "By clicking 'JOIN', I accept the GHA DISCOVERY Programme ",
    gha_signup_consent_cinnamon_2:
      ', and understand that my personal data will be treated in line with the ',
    gha_signup_consent_cinnamon_3: ' and the ',
    gha_link_terms: 'Terms and Conditions',
    gha_link_gha_privacy: 'GHA DISCOVERY Privacy Policy',
    gha_link_cinnamon_privacy: 'Cinnamon Hotels & Resorts Privacy Policy',
    gha_read_more: 'Read more',
    gha_read_less: 'Read less',
    gha_redeem_success_title: 'Congratulations',
    gha_redeem_success_body: 'D${{amount}} will be applied to the bill when you pay',
    gha_continue: 'Continue',
  };

  // Venue + theme, as returned by the venue config on the live session link.
  const VENUE = {
    name: 'Dreams & Beats',
    table: 'Table 12',
    posName: 'Micros Simphony',
    currency: 'LKR ',
    currencyCode: 'LKR',
    // D$1 = USD 1; local rate used to show the local value of a redemption.
    localPerDollar: 302,
    coverImageUrl: './assets/img/cover.jpg',
    theme: {
      buttonColor: '#582c83',
      buttonTextColor: '#ffffff',
      headingColor: '#300b5c',
    },
  };

  const MEMBER = {
    firstName: 'Gavin',
    lastName: 'Gimbo',
    name: 'Gavin Gimbo',
    cardNumber: '4407 1188 2043',
    profileId: '881204371',
    tier: 'TITANIUM',
    balance: 148,
    accrued: 1264,
    redeemed: 985,
    earnRatePct: 7,
  };

  // A live POS check. Amounts are in venue currency.
  const BILL = {
    items: [
      { id: 1, name: 'Sapphire Dragon Signature Platter', count: 1, total: 12800 },
      { id: 2, name: 'Charcoal Grilled Lamb Chops', count: 2, total: 15600 },
      { id: 3, name: 'Truffle Wild Mushroom Risotto', count: 1, total: 6400 },
      { id: 4, name: 'Yoroko Sashimi Selection', count: 1, total: 9200 },
      { id: 5, name: 'Old Fashioned', count: 3, total: 8400 },
      { id: 6, name: 'Sparkling Water 750ml', count: 2, total: 1800 },
      { id: 7, name: 'Dark Chocolate Fondant', count: 2, total: 4200 },
    ],
    // Member discount the POS applied for this tier.
    discounts: [{ id: 'gha', name: 'GHA DISCOVERY 15%', amount: 8760 }],
    // Non-eligible lines (service charge / taxes) shown after the discount.
    charges: [
      { id: 'sc', name: 'Service Charge 10%', amount: 4964 },
      { id: 'vat', name: 'VAT 18%', amount: 9829 },
    ],
  };

  window.GHA_DATA = { LABELS, VENUE, MEMBER, BILL };
})();
