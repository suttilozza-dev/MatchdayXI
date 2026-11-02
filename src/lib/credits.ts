/**
 * Tiers, what each one allows, and how exports are counted.
 *
 * Wired today: the FREE tier (5 watermarked exports, counted in this browser). Everything paid needs Whop
 * sign-in plus payment records and a Neon usage table, which are not connected yet, so in a real build
 * every visitor is on the free tier. `vite dev` can simulate any tier with ?access=free|trial|credits|lifetime|creator.
 */
import { FREE_IMAGES, TRIAL } from './config'

export type Tier = 'free' | 'trial' | 'credits' | 'lifetime' | 'creator'

export type Caps = {
  watermark: boolean // watermark + site link on exports
  unlimited: boolean
  extraFormats: boolean // story, wide banner
  transparent: boolean
  clubStadium: 'none' | 'one' | 'all'
  creatorBranding: boolean // own handle instead of MatchdayXI branding
  present: boolean // hidden controls panel for streaming
}

export const CAPS: Record<Tier, Caps> = {
  free: { watermark: true, unlimited: false, extraFormats: false, transparent: false, clubStadium: 'none', creatorBranding: false, present: false },
  trial: { watermark: false, unlimited: false, extraFormats: false, transparent: false, clubStadium: 'one', creatorBranding: false, present: false },
  credits: { watermark: false, unlimited: false, extraFormats: false, transparent: false, clubStadium: 'none', creatorBranding: false, present: false },
  lifetime: { watermark: false, unlimited: true, extraFormats: true, transparent: true, clubStadium: 'one', creatorBranding: false, present: false },
  creator: { watermark: false, unlimited: true, extraFormats: true, transparent: true, clubStadium: 'all', creatorBranding: true, present: true },
}

export const TIER_LABEL: Record<Tier, string> = { free: 'Free', trial: 'Trial', credits: 'Credit pack', lifetime: 'Unlimited (lifetime)', creator: 'Creator' }

export type Access = { tier: Tier; remaining: number | null; caps: Caps }

const KEY = 'mdxi_free_used'
let devUsed = 0

function freeUsed(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? '0') || 0
  } catch {
    return 0
  }
}

export async function getAccess(): Promise<Access> {
  if (import.meta.env.DEV && typeof location !== 'undefined') {
    const t = new URLSearchParams(location.search).get('access') as Tier | null
    if (t && t in CAPS && t !== 'free') {
      const total = t === 'trial' ? TRIAL.images : t === 'credits' ? 8 : null
      return { tier: t, remaining: total == null ? null : Math.max(0, total - devUsed), caps: CAPS[t] }
    }
  }
  return { tier: 'free', remaining: Math.max(0, FREE_IMAGES - freeUsed()), caps: CAPS.free }
}

export type SpendResult = { ok: true; access: Access } | { ok: false; reason: 'used_up' }

/** Call before every export (copy or download). Counts one image against the current tier. */
export async function spendExport(): Promise<SpendResult> {
  const a = await getAccess()
  if (a.remaining !== null && a.remaining <= 0) return { ok: false, reason: 'used_up' }
  if (a.tier === 'free') {
    try {
      localStorage.setItem(KEY, String(freeUsed() + 1))
    } catch {
      /* private mode: let it through, the free tier is low value */
    }
  } else if (a.remaining !== null) devUsed += 1
  return { ok: true, access: await getAccess() }
}

export const FREE_ALLOWANCE_NOTE = 'Free: 5 images with a watermark and the site link.'
