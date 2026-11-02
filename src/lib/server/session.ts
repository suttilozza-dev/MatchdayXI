import { SITE_URL, env } from './env'

const enc = new TextEncoder()
const COOKIE = 'mdxi_session'
const MAX_AGE = 60 * 60 * 24 * 30

const b64u = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function key() {
  return crypto.subtle.importKey('raw', enc.encode(env('SESSION_SECRET')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

/** Signed value: base64url(json).base64url(hmac). Used for the session cookie and the short-lived OAuth state cookie. */
export async function sign(data: object): Promise<string> {
  const body = b64u(enc.encode(JSON.stringify(data)))
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(body))
  return `${body}.${b64u(sig)}`
}

export async function verify<T>(value: string | undefined): Promise<T | null> {
  if (!value) return null
  const [body, sig] = value.split('.')
  if (!body || !sig) return null
  const ok = await crypto.subtle.verify('HMAC', await key(), unb64u(sig), enc.encode(body))
  if (!ok) return null
  try {
    return JSON.parse(new TextDecoder().decode(unb64u(body))) as T
  } catch {
    return null
  }
}

export function readCookie(request: Request, name: string): string | undefined {
  const m = request.headers.get('cookie')?.split(/;\s*/).find((c) => c.startsWith(name + '='))
  return m ? decodeURIComponent(m.slice(name.length + 1)) : undefined
}

export function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

export type Session = { uid: string; name: string | null; exp: number }

export async function getSession(request: Request): Promise<Session | null> {
  const s = await verify<Session>(readCookie(request, COOKIE))
  return s && s.exp > Date.now() / 1000 ? s : null
}

export async function sessionCookie(uid: string, name: string | null) {
  return cookie(COOKIE, await sign({ uid, name, exp: Math.floor(Date.now() / 1000) + MAX_AGE }), MAX_AGE)
}
export const clearSessionCookie = () => cookie(COOKIE, '', 0)
export const OAUTH_COOKIE = 'mdxi_oauth'
export const REDIRECT_URI = `${SITE_URL}/api/auth/callback`
