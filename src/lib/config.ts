// All prices in GBP.

/** Free plan: this many watermarked images per signed-in account every week (Monday to Sunday, UTC). */
export const FREE_PER_WEEK = 3

/** Gameweek Pass: this many images with no watermark per day (UK time). Unused images do not roll over to the next day. */
export const PASS_PER_DAY = 5

export const PASS = { id: 'pass', label: '£2.99', days: 7 } as const
export const PLUS = {
  monthly: { id: 'plus-monthly', label: '£4.99', note: 'a month' },
  yearly: { id: 'plus-yearly', label: '£29.99', note: 'a year' },
} as const
export const CREATOR = {
  monthly: { id: 'creator-monthly', label: '£9.99', note: 'a month' },
  yearly: { id: 'creator-yearly', label: '£79.99', note: 'a year' },
} as const
export const FOUNDER = { id: 'founder', label: '£79.99', note: 'once, first 500 buyers', cap: 500 } as const

/**
 * Whop checkout links (GBP variants on the matchday-xi account). Empty = the button shows "soon" and cannot be clicked.
 * Old trial / credit-pack / £30 links are retired from the site; their plan ids stay in server/plans.ts so past buyers keep access.
 */
export const CHECKOUT_LINKS: Record<string, string> = {
  pass: 'https://whop.com/checkout/plan_mlzw7odXT3JKw',
  'plus-monthly': 'https://whop.com/checkout/plan_XPaB1E6EWxArO',
  'plus-yearly': 'https://whop.com/checkout/plan_qQs7Ve4QozI5x',
  'creator-monthly': 'https://whop.com/checkout/plan_xOPpvfhLmnyrY',
  'creator-yearly': 'https://whop.com/checkout/plan_KZcXkdlCgWFLF',
  founder: 'https://whop.com/checkout/plan_UCraiZ98hmIZm',
}
