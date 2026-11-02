import { createFileRoute } from '@tanstack/react-router'
import { clearSessionCookie } from '#/lib/server/session'

// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => new Response(null, { status: 204, headers: { 'Set-Cookie': clearSessionCookie() } }),
    },
  },
} as never)
