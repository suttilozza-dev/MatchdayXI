import { createFileRoute } from '@tanstack/react-router'
import { OAUTH_COOKIE, REDIRECT_URI, cookie, readCookie, sessionCookie, verify } from '#/lib/server/session'
import { SITE_URL, WHOP_APP_ID } from '#/lib/server/env'

/** A short, safe reason for a failed sign-in (letters, digits and underscores only), shown in the address bar. */
const why = (code: string) => `/board?signin=failed&why=${code.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 60)}`

const back = (path: string, extra?: string[]) => {
  const h = new Headers({ Location: SITE_URL + path })
  for (const c of extra ?? []) h.append('Set-Cookie', c)
  return new Response(null, { status: 302, headers: h })
}

// The `server` option's types come from TanStack Start; the cast keeps this file independent of its type augmentation.
export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const clear = cookie(OAUTH_COOKIE, '', 0)
        const saved = await verify<{ verifier: string; state: string; exp: number }>(readCookie(request, OAUTH_COOKIE))
        const code = url.searchParams.get('code')
        const denied = url.searchParams.get('error')
        if (denied) return back(why(`denied_${denied}`), [clear])
        if (!saved) return back(why('no_login_cookie'), [clear])
        if (saved.exp < Date.now() / 1000) return back(why('login_expired'), [clear])
        if (!code) return back(why('no_code'), [clear])
        if (url.searchParams.get('state') !== saved.state) return back(why('state_mismatch'), [clear])
        const tok = await fetch('https://api.whop.com/oauth/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: WHOP_APP_ID, code_verifier: saved.verifier }),
        })
        if (!tok.ok) {
          const e = (await tok.json().catch(() => ({}))) as { error?: string }
          return back(why(`token_${tok.status}_${e.error ?? 'error'}`), [clear])
        }
        const { access_token } = (await tok.json()) as { access_token?: string }
        if (!access_token) return back(why('token_missing'), [clear])
        const me = await fetch('https://api.whop.com/oauth/userinfo', { headers: { authorization: `Bearer ${access_token}` } })
        if (!me.ok) return back(why(`userinfo_${me.status}`), [clear])
        const info = (await me.json()) as { sub?: string; name?: string; preferred_username?: string }
        if (!info.sub) return back(why('userinfo_no_sub'), [clear])
        // Only the Whop user id (user_...) and a display name are kept. No Whop tokens are stored.
        return back('/board?signin=ok', [clear, await sessionCookie(info.sub, info.name ?? info.preferred_username ?? null)])
      },
    },
  },
} as never)
