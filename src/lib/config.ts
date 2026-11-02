// Prices are in GBP. 1 credit = £1 = one export (copy image or PNG download).
export const CREDIT_PACKS = [
  { id: 'pack-5', label: '£5', credits: 5 },
  { id: 'pack-10', label: '£10', credits: 10 },
  { id: 'pack-25', label: '£25', credits: 25 },
] as const

/** First subscription tier, recurring monthly. Launches after credits. Exports cost no credits while subscribed (assumption: confirm with the owner). */
export const SUBSCRIPTION = { id: 'sub-monthly', label: '£18.99 / month', price: 18.99, interval: 'month' } as const

/**
 * Whop checkout links. Left empty until they are created in Whop (needs GBP support confirmed on the
 * account). Empty = the button shows "soon" and cannot be clicked.
 */
export const CHECKOUT_LINKS: Record<string, string> = {
  'pack-5': '',
  'pack-10': '',
  'pack-25': '',
  'sub-monthly': '',
}
