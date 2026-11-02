import { createFileRoute } from '@tanstack/react-router'
import { getEntitlement } from '#/lib/server/db'
import { getSession } from '#/lib/server/session'

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

/** What the current visitor is entitled to. Signed-out visitors are the free tier (counted in their browser). */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/access')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const s = await getSession(request)
        if (!s) return json({ signedIn: false, name: null, tier: 'free', remaining: null })
        try {
          const e = await getEntitlement(s.uid)
          return json({ signedIn: true, name: s.name, ...e })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
    },
  },
} as never)
