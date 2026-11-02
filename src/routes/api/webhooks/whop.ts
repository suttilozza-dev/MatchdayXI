import { createFileRoute } from '@tanstack/react-router'
import { unwrapWebhook } from '@whop/sdk/helpers'
import { markRefunded, recordGrant } from '#/lib/server/db'
import { env } from '#/lib/server/env'
import { VARIANT_PLANS } from '#/lib/server/plans'

type Event = { type: string; data: any }

/** Whop calls this when a payment succeeds (and on refunds). The signature is checked before anything is trusted. */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/webhooks/whop')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const raw = await request.text()
        let event: Event
        try {
          event = unwrapWebhook<Event>(raw, { headers: Object.fromEntries(request.headers), key: env('WHOP_WEBHOOK_SECRET') })
        } catch {
          return new Response('bad signature', { status: 400 })
        }
        // Delivery is at least once. Grants are keyed on payment id, so a repeat delivery changes nothing.
        if (event.type === 'payment.succeeded') {
          const p = event.data
          const plan = VARIANT_PLANS[p?.variant_id as string]
          const userId = p?.user?.id as string | undefined
          if (plan && userId && p?.id) {
            await recordGrant({ paymentId: p.id, userId, planKey: plan.key, images: plan.images, days: plan.days })
          }
        } else if (event.type === 'refund.created') {
          const paymentId = (event.data?.payment_id ?? event.data?.payment?.id) as string | undefined
          if (paymentId) await markRefunded(paymentId)
        }
        return new Response('ok', { status: 200 })
      },
    },
  },
} as never)
