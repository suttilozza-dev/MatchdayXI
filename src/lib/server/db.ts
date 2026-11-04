import { neon } from '@neondatabase/serverless'
import { env } from './env'
import { OWNER_USER_IDS } from './plans'
import { FREE_PER_WEEK } from '../config'

const sql = () => neon(env('DATABASE_URL'))

/** Schema, created on first use (idempotent). */
let ready: Promise<void> | null = null
export function ensureSchema() {
  ready ??= (async () => {
    const q = sql()
    await q`CREATE TABLE IF NOT EXISTS grants (
      id bigserial PRIMARY KEY,
      payment_id text UNIQUE NOT NULL,
      user_id text NOT NULL,
      plan_key text NOT NULL,
      images_total integer,
      images_used integer NOT NULL DEFAULT 0,
      expires_at timestamptz,
      refunded boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )`
    await q`CREATE INDEX IF NOT EXISTS grants_user_idx ON grants (user_id)`
    // The free plan: FREE_PER_WEEK watermarked exports per signed-in account per week, counted here, not in the browser.
    await q`CREATE TABLE IF NOT EXISTS free_usage_week (
      user_id text NOT NULL,
      week text NOT NULL,
      used integer NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, week)
    )`
  })().catch((e) => {
    ready = null
    throw e
  })
  return ready
}

export type Tier = 'free' | 'pass' | 'trial' | 'credits' | 'plus' | 'lifetime' | 'creator'

/** The week the free allowance resets on: Monday to Sunday, UTC, as e.g. 2026-11-02 (the Monday). */
export function weekKey(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
export type Entitlement = { tier: Tier; remaining: number | null }

type Row = { plan_key: string; images_total: number | null; images_used: number; expires_at: string | null }

export async function getEntitlement(userId: string): Promise<Entitlement> {
  // Owners need no payment record, so this check comes first and works even if the database is down.
  if (OWNER_USER_IDS.includes(userId)) return { tier: 'creator', remaining: null }
  await ensureSchema()
  const rows = (await sql()`SELECT plan_key, images_total, images_used, expires_at FROM grants WHERE user_id = ${userId} AND NOT refunded`) as Row[]
  const now = Date.now()
  const live = (r: Row) => !r.expires_at || new Date(r.expires_at).getTime() > now
  if (rows.some((r) => r.plan_key.startsWith('creator') && live(r))) return { tier: 'creator', remaining: null }
  if (rows.some((r) => r.plan_key.startsWith('plus') && live(r))) return { tier: 'plus', remaining: null }
  if (rows.some((r) => r.plan_key === 'lifetime')) return { tier: 'lifetime', remaining: null }
  if (rows.some((r) => r.plan_key === 'pass' && live(r))) return { tier: 'pass', remaining: null }
  const left = (keys: (r: Row) => boolean) => rows.filter(keys).reduce((n, r) => n + Math.max(0, (r.images_total ?? 0) - r.images_used), 0)
  const trial = left((r) => r.plan_key === 'trial')
  const packs = left((r) => r.plan_key.startsWith('pack-'))
  if (trial > 0) return { tier: 'trial', remaining: trial + packs }
  if (packs > 0) return { tier: 'credits', remaining: packs }
  // Bought something, used it all: report the last tier with zero left so the UI says "used up" rather than "free".
  if (rows.some((r) => r.plan_key === 'trial')) return { tier: 'trial', remaining: 0 }
  if (rows.some((r) => r.plan_key.startsWith('pack-'))) return { tier: 'credits', remaining: 0 }
  const used = (await sql()`SELECT used FROM free_usage_week WHERE user_id = ${userId} AND week = ${weekKey()}`) as { used: number }[]
  return { tier: 'free', remaining: Math.max(0, FREE_PER_WEEK - (used[0]?.used ?? 0)) }
}

/** Atomically use one of the signed-in account's free images this week. Returns false once this week's allowance is gone. */
export async function spendFree(userId: string): Promise<boolean> {
  await ensureSchema()
  const r = await sql()`INSERT INTO free_usage_week (user_id, week, used) VALUES (${userId}, ${weekKey()}, 1)
    ON CONFLICT (user_id, week) DO UPDATE SET used = free_usage_week.used + 1 WHERE free_usage_week.used < ${FREE_PER_WEEK}
    RETURNING used`
  return r.length > 0
}

/** Atomically take one image from the buyer's oldest usable grant (trial first). Returns false if none left. */
export async function spendOne(userId: string): Promise<boolean> {
  await ensureSchema()
  const r = await sql()`UPDATE grants SET images_used = images_used + 1 WHERE id = (
      SELECT id FROM grants
      WHERE user_id = ${userId} AND NOT refunded AND images_total IS NOT NULL AND images_used < images_total
      ORDER BY (plan_key = 'trial') DESC, id
      LIMIT 1 FOR UPDATE SKIP LOCKED
    ) RETURNING id`
  return r.length > 0
}

export async function recordGrant(g: { paymentId: string; userId: string; planKey: string; images: number | null; days: number | null }) {
  await ensureSchema()
  const expires = g.days ? new Date(Date.now() + g.days * 864e5).toISOString() : null
  await sql()`INSERT INTO grants (payment_id, user_id, plan_key, images_total, expires_at)
    VALUES (${g.paymentId}, ${g.userId}, ${g.planKey}, ${g.images}, ${expires})
    ON CONFLICT (payment_id) DO NOTHING`
}

export async function markRefunded(paymentId: string) {
  await ensureSchema()
  await sql()`UPDATE grants SET refunded = true WHERE payment_id = ${paymentId}`
}
