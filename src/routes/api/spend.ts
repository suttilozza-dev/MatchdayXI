import { createFileRoute } from '@tanstack/react-router'
import { getEntitlement, spendFree, spendOne } from '#/lib/server/db'
import { getSession } from '#/lib/server/session'

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

/** Count one export against the signed-in buyer's plan. Unlimited plans are never decremented. */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/spend')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const s = await getSession(request)
        if (!s) return json({ ok: false, reason: 'signed_out' }, 401)
        try {
          const e = await getEntitlement(s.uid)
          if (e.tier === 'creator' || e.tier === 'lifetime') return json({ ok: true, ...e })
          const ok = e.tier === 'free' ? await spendFree(s.uid) : await spendOne(s.uid)
          if (!ok) return json({ ok: false, reason: 'used_up' }, 402)
          return json({ ok: true, ...(await getEntitlement(s.uid)) })
        } catch {
          return json({ ok: false, reason: 'unavailable' }, 503)
        }
      },
    },
  },
} as never)
