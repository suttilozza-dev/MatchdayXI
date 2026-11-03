/**
 * Tiers, what each one allows, and how exports are counted.
 *
 * A visitor's very first image (copy, download or share image) works without signing in, with the watermark. After that, and
 * they sign in with Whop. That first image is remembered in the browser only. Signed-in
 * accounts are looked up on the server: /api/access reads what they own, and /api/spend counts every export
 * against it (the FREE plan is 5 watermarked images per account, counted in the database, not in the browser). Purchases reach the server through the Whop webhook (src/routes/api/webhooks).
 * `vite dev` can still simulate any tier with ?access=free|trial|credits|lifetime|creator.
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

export type Access = { tier: Tier; remaining: number | null; caps: Caps; signedIn: boolean; name: string | null }

let devUsed = 0

type ServerAccess = { signedIn: boolean; name: string | null; tier: Tier; remaining: number | null }

function toAccess(a: ServerAccess): Access {
  return { tier: a.tier, remaining: a.remaining, caps: CAPS[a.tier], signedIn: a.signedIn, name: a.name }
}

/** Signed out: the board can be played with, but nothing can be exported. */
const signedOut = (): Access => ({ tier: 'free', remaining: null, caps: CAPS.free, signedIn: false, name: null })

export async function getAccess(): Promise<Access> {
  if (import.meta.env.DEV && typeof location !== 'undefined') {
    const t = new URLSearchParams(location.search).get('access') as Tier | null
    if (t && t in CAPS && t !== 'free') {
      const total = t === 'trial' ? TRIAL.images : t === 'credits' ? 8 : null
      return { tier: t, remaining: total == null ? null : Math.max(0, total - devUsed), caps: CAPS[t], signedIn: true, name: 'Dev' }
    }
    if (t === 'free') return { tier: 'free', remaining: Math.max(0, FREE_IMAGES - devUsed), caps: CAPS.free, signedIn: true, name: 'Dev' }
  }
  try {
    const r = await fetch('/api/access', { credentials: 'same-origin' })
    if (r.ok) {
      const a = (await r.json()) as ServerAccess
      return a.signedIn ? toAccess(a) : signedOut()
    }
  } catch {
    /* offline or API down: treat as signed out, so nothing can be exported */
  }
  return signedOut()
}

const ANON_KEY = 'mdxi_anon_used'
/** Has this browser already used its one image without signing in? Blocked storage counts as used. */
function anonUsed(): boolean {
  try {
    return localStorage.getItem(ANON_KEY) === '1'
  } catch {
    return true
  }
}
/** Call once the image has really been made. */
export function markAnonUsed() {
  try {
    localStorage.setItem(ANON_KEY, '1')
  } catch {
    /* ignore */
  }
}

export type SpendResult = { ok: true; access: Access; anon?: boolean } | { ok: false; reason: 'signin' | 'used_up' | 'unavailable' }

/** Call before every export (copy or download). Counts one image against the signed-in account. */
export async function spendExport(): Promise<SpendResult> {
  const a = await getAccess()
  if (!a.signedIn) return anonUsed() ? { ok: false, reason: 'signin' } : { ok: true, access: a, anon: true }
  if (import.meta.env.DEV && a.name === 'Dev') {
    if (a.remaining !== null && a.remaining <= 0) return { ok: false, reason: 'used_up' }
    if (a.remaining !== null) devUsed += 1
    return { ok: true, access: await getAccess() }
  }
  if (a.remaining !== null && a.remaining <= 0) return { ok: false, reason: 'used_up' }
  try {
    const r = await fetch('/api/spend', { method: 'POST', credentials: 'same-origin' })
    if (r.status === 401) return { ok: false, reason: 'signin' }
    if (r.status === 402) return { ok: false, reason: 'used_up' }
    if (!r.ok) return { ok: false, reason: 'unavailable' }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
  return { ok: true, access: await getAccess() }
}

export const FREE_ALLOWANCE_NOTE = 'Free: your first image needs no sign-up. Sign in with Whop (no payment) for 5 more with a watermark and the site link.'
