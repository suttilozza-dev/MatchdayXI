/**
 * Whop variant (plan_...) -> what it unlocks. These are the live GBP variants on the Matchday XI Whop account.
 * If a variant is ever recreated in Whop, update its id here and in config.ts.
 */
export type PlanKey = 'pass' | 'plus-monthly' | 'plus-yearly' | 'trial' | 'lifetime' | 'creator-monthly' | 'creator-yearly' | 'pack-8' | 'pack-25' | 'pack-50'

export type PlanGrant = { key: PlanKey; images: number | null; days: number | null }

export const VARIANT_PLANS: Record<string, PlanGrant> = {
  // Current plans
  plan_mlzw7odXT3JKw: { key: 'pass', images: null, days: 7 },
  plan_XPaB1E6EWxArO: { key: 'plus-monthly', images: null, days: 35 },
  plan_qQs7Ve4QozI5x: { key: 'plus-yearly', images: null, days: 370 },
  plan_UCraiZ98hmIZm: { key: 'lifetime', images: null, days: null }, // Founder Lifetime
  // Retired from the site but still honoured for anyone who bought them (trial, 30-pound Unlimited, credit packs)
  plan_lgUBoR82h7I1h: { key: 'trial', images: 5, days: null },
  plan_ldHvVl8XWpBlb: { key: 'lifetime', images: null, days: null },
  // Subscriptions: each successful renewal payment pushes expiry out, with a few days of slack for retries.
  plan_xOPpvfhLmnyrY: { key: 'creator-monthly', images: null, days: 35 },
  plan_KZcXkdlCgWFLF: { key: 'creator-yearly', images: null, days: 370 },
  plan_gPg0vtNan4aiV: { key: 'pack-8', images: 8, days: null },
  plan_KbIfWYkio8gcP: { key: 'pack-25', images: 25, days: null },
  plan_kbEk5vVO5t7Iy: { key: 'pack-50', images: 50, days: null },
}

/**
 * Owner accounts. A signed-in Whop user whose id is listed here gets everything (the Creator tier: unlimited, no
 * watermark, all formats and stadiums, own handle, present mode) without paying. Ids are public Whop user ids; the
 * server only trusts the id from its own signed session cookie, which is set after a real "Sign in with Whop".
 */
export const OWNER_USER_IDS: readonly string[] = ['user_TYrp3d73ORU7f']
