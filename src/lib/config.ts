// All prices in GBP.

export const FREE_IMAGES = 5

export const TRIAL = { id: 'trial', label: '£0.99', images: 5 } as const
export const LIFETIME = { id: 'lifetime', label: '£30', note: 'one-off payment' } as const
export const CREATOR = {
  monthly: { id: 'creator-monthly', label: '£18.99 / month' },
  yearly: { id: 'creator-yearly', label: '£199.99 / year' },
} as const

export const CREDIT_PACKS = [
  { id: 'pack-8', label: '£2.50', images: 8, per: 'about 31p an image' },
  { id: 'pack-25', label: '£5', images: 25, per: '20p an image' },
  { id: 'pack-50', label: '£8.99', images: 50, per: 'about 18p an image' },
] as const

/**
 * Whop checkout links (GBP variants on matchday-xi account). Empty = the button shows "soon" and cannot be clicked.
 */
export const CHECKOUT_LINKS: Record<string, string> = {
  trial: 'https://whop.com/checkout/plan_lgUBoR82h7I1h',
  lifetime: 'https://whop.com/checkout/plan_ldHvVl8XWpBlb',
  'creator-monthly': 'https://whop.com/checkout/plan_xOPpvfhLmnyrY',
  'creator-yearly': 'https://whop.com/checkout/plan_KZcXkdlCgWFLF',
  'pack-8': 'https://whop.com/checkout/plan_gPg0vtNan4aiV',
  'pack-25': 'https://whop.com/checkout/plan_KbIfWYkio8gcP',
  'pack-50': 'https://whop.com/checkout/plan_kbEk5vVO5t7Iy',
}
