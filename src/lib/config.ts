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
 * Whop checkout links. Empty until the links are created in Whop (needs GBP support confirmed on the
 * account). Empty = the button shows "soon" and cannot be clicked.
 */
export const CHECKOUT_LINKS: Record<string, string> = {
  trial: '',
  lifetime: '',
  'creator-monthly': '',
  'creator-yearly': '',
  'pack-8': '',
  'pack-25': '',
  'pack-50': '',
}
