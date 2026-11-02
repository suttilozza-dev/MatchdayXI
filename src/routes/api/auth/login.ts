import { createFileRoute } from '@tanstack/react-router'
import { OAUTH_COOKIE, REDIRECT_URI, cookie, sign } from '#/lib/server/session'
import { WHOP_APP_ID } from '#/lib/server/env'

const b64u = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const rand = () => b64u(crypto.getRandomValues(new Uint8Array(32)))

/** Start "Sign in with Whop" (OAuth 2.1 + PKCE). */
// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      GET: async () => {
        const verifier = rand()
        const state = rand()
        const nonce = rand()
        const challenge = b64u(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
        const url = new URL('https://api.whop.com/oauth/authorize')
        url.search = new URLSearchParams({
          response_type: 'code',
          client_id: WHOP_APP_ID,
          redirect_uri: REDIRECT_URI,
          scope: 'openid profile',
          state,
          nonce,
          code_challenge: challenge,
          code_challenge_method: 'S256',
        }).toString()
        return new Response(null, {
          status: 302,
          headers: { Location: url.toString(), 'Set-Cookie': cookie(OAUTH_COOKIE, await sign({ verifier, state, nonce, exp: Date.now() / 1000 + 600 }), 600) },
        })
      },
    },
  },
} as never)
