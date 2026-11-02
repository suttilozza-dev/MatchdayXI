/**
 * Access and spending for exports. Production wiring (Whop sign-in, Whop payment records, Neon usage table)
 * is not connected yet, so in a production build exports stay LOCKED rather than being free by accident.
 *
 * In `vite dev` the lock can be tested with ?access=locked | credits | subscribed (default: subscribed).
 */
export type Access =
  | { state: 'locked'; reason: 'not_configured' | 'signin' | 'no_credits' }
  | { state: 'credits'; balance: number }
  | { state: 'subscribed' }

export type SpendResult = { ok: true; dev: boolean; subscribed: boolean } | { ok: false; reason: 'not_configured' | 'signin' | 'no_credits' }

export async function getAccess(): Promise<Access> {
  if (import.meta.env.DEV && typeof location !== 'undefined') {
    const a = new URLSearchParams(location.search).get('access')
    if (a === 'locked') return { state: 'locked', reason: 'no_credits' }
    if (a === 'credits') return { state: 'credits', balance: 5 }
    return { state: 'subscribed' }
  }
  return { state: 'locked', reason: 'not_configured' }
}

/** Call before every export (copy or download). One credit per export unless subscribed. */
export async function spendExportCredit(): Promise<SpendResult> {
  const a = await getAccess()
  if (a.state === 'locked') return { ok: false, reason: a.reason }
  return { ok: true, dev: import.meta.env.DEV, subscribed: a.state === 'subscribed' }
}
