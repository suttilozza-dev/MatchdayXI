import { createFileRoute } from '@tanstack/react-router'
import { OAUTH_COOKIE, REDIRECT_URI, cookie, readCookie, sessionCookie, verify } from '#/lib/server/session'
import { SITE_URL, WHOP_APP_ID } from '#/lib/server/env'

/** A short, safe reason for a failed sign-in (letters, digits and underscores only), shown in the address bar. */
const why = (code: string) => `/board?signin=failed&why=${code.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 60)}`

/** Read the claims of a JWT without verifying its signature (only used on a token received directly from Whop's token endpoint). */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '='))
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(json, (c) => c.charCodeAt(0))))
  } catch {
    return null
  }
}

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
        const saved = await verify<{ verifier: string; state: string; nonce?: string; exp: number }>(readCookie(request, OAUTH_COOKIE))
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
        const tokens = (await tok.json()) as { access_token?: string; id_token?: string }
        if (!tokens.access_token) return back(why('token_missing'), [clear])

        // Who is signing in. First choice: Whop's userinfo endpoint. If it refuses (it has returned 401 for this app),
        // fall back to the ID token Whop returned straight from the token endpoint in answer to our PKCE code
        // exchange. Per OpenID Connect, an ID token received that way over TLS needs no signature check, but its
        // audience, expiry and nonce must still match.
        let sub: string | undefined
        let name: string | null = null
        const me = await fetch('https://api.whop.com/oauth/userinfo', { headers: { authorization: `Bearer ${tokens.access_token}` } })
        const userinfoStatus = me.status
        if (me.ok) {
          const info = (await me.json().catch(() => ({}))) as { sub?: string; name?: string; preferred_username?: string }
          sub = info.sub
          name = info.name ?? info.preferred_username ?? null
        }
        if (!sub) {
          if (!tokens.id_token) return back(why(`userinfo_${userinfoStatus}_no_id_token`), [clear])
          const claims = decodeJwt(tokens.id_token)
          if (!claims) return back(why(`userinfo_${userinfoStatus}_id_token_unreadable`), [clear])
          const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
          if (!aud.includes(WHOP_APP_ID)) return back(why('id_token_wrong_audience'), [clear])
          if (typeof claims.exp === 'number' && claims.exp < Date.now() / 1000) return back(why('id_token_expired'), [clear])
          if (saved.nonce && claims.nonce !== saved.nonce) return back(why('id_token_nonce_mismatch'), [clear])
          sub = typeof claims.sub === 'string' ? claims.sub : undefined
          name = (claims.name ?? claims.preferred_username ?? null) as string | null
        }
        if (!sub || !sub.startsWith('user_')) return back(why('userinfo_no_sub'), [clear])
        // Only the Whop user id (user_...) and a display name are kept. No Whop tokens are stored.
        return back('/board?signin=ok', [clear, await sessionCookie(sub, name)])
      },
    },
  },
} as never)
