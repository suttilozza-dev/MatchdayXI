import { neon } from '@neondatabase/serverless'
import { env } from './env'

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
  })().catch((e) => {
    ready = null
    throw e
  })
  return ready
}

export type Tier = 'free' | 'trial' | 'credits' | 'lifetime' | 'creator'
export type Entitlement = { tier: Tier; remaining: number | null }

type Row = { plan_key: string; images_total: number | null; images_used: number; expires_at: string | null }

export async function getEntitlement(userId: string): Promise<Entitlement> {
  await ensureSchema()
  const rows = (await sql()`SELECT plan_key, images_total, images_used, expires_at FROM grants WHERE user_id = ${userId} AND NOT refunded`) as Row[]
  const now = Date.now()
  const live = (r: Row) => !r.expires_at || new Date(r.expires_at).getTime() > now
  if (rows.some((r) => r.plan_key.startsWith('creator') && live(r))) return { tier: 'creator', remaining: null }
  if (rows.some((r) => r.plan_key === 'lifetime')) return { tier: 'lifetime', remaining: null }
  const left = (keys: (r: Row) => boolean) => rows.filter(keys).reduce((n, r) => n + Math.max(0, (r.images_total ?? 0) - r.images_used), 0)
  const trial = left((r) => r.plan_key === 'trial')
  const packs = left((r) => r.plan_key.startsWith('pack-'))
  if (trial > 0) return { tier: 'trial', remaining: trial + packs }
  if (packs > 0) return { tier: 'credits', remaining: packs }
  // Bought something, used it all: report the last tier with zero left so the UI says "used up" rather than "free".
  if (rows.some((r) => r.plan_key === 'trial')) return { tier: 'trial', remaining: 0 }
  if (rows.some((r) => r.plan_key.startsWith('pack-'))) return { tier: 'credits', remaining: 0 }
  return { tier: 'free', remaining: null }
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
