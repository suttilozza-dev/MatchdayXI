// Prices are in GBP. 1 credit = £1 = one PNG download. Copy is free.
export const CREDIT_PACKS = [
  { id: 'pack-5', label: '£5', credits: 5 },
  { id: 'pack-10', label: '£10', credits: 10 },
  { id: 'pack-25', label: '£25', credits: 25 },
] as const

/**
 * Whop checkout links, one per pack. Left empty until the links are created in Whop
 * (needs GBP support confirmed on the account). Empty = button shows "Coming soon".
 */
export const CHECKOUT_LINKS: Record<string, string> = {
  'pack-5': '',
  'pack-10': '',
  'pack-25': '',
}
