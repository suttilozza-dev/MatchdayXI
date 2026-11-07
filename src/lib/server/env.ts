/** Secrets and settings. On Whop hosting, `whop apps secrets set` injects these as env bindings. */
export const WHOP_APP_ID = 'app_J0kGZFzBfxUCFC'
export const SITE_URL = 'https://gaffster.app'

export function env(name: 'DATABASE_URL' | 'SESSION_SECRET' | 'WHOP_WEBHOOK_SECRET'): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing secret ${name}`)
  return v
}
