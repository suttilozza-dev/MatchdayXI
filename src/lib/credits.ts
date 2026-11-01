/**
 * Credit balance + spending. Production wiring (Whop sign-in, Whop payment records, Neon usage table)
 * is not connected yet, so in a production build downloads stay locked rather than being free by accident.
 * In `vite dev` the lock is lifted so the export can be tested.
 */
export type SpendResult = { ok: true; balance: number | null; dev: boolean } | { ok: false; reason: 'not_configured' | 'signin' | 'no_credits' }

export async function spendDownloadCredit(): Promise<SpendResult> {
  if (import.meta.env.DEV) return { ok: true, balance: null, dev: true }
  return { ok: false, reason: 'not_configured' }
}
