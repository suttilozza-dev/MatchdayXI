import { createMiddleware, createStart } from '@tanstack/react-start'

/** The main address. The old Matchday XI address and the extra Gaffster addresses send visitors here. */
const CANONICAL_HOST = 'gaffster.com'
const REDIRECTED_HOSTS = new Set([
  'www.gaffster.com',
  'gaffster.app',
  'www.gaffster.app',
  'gaffster.club',
  'www.gaffster.club',
  'matchday-xi.club',
  'www.matchday-xi.club',
])

/**
 * Permanent redirect to gaffster.com for page requests on the other addresses. The path, query and any #hash
 * (share links keep their line-up in the hash) carry over. /api/ is left alone so sign-in and Whop webhooks that
 * still point at the old address keep working until they are moved.
 */
const canonicalHost = createMiddleware({ type: 'request' }).server(({ request, next }) => {
  const url = new URL(request.url)
  const isPage = request.method === 'GET' || request.method === 'HEAD'
  if (isPage && REDIRECTED_HOSTS.has(url.hostname) && !url.pathname.startsWith('/api/')) {
    return new Response(null, { status: 301, headers: { Location: `https://${CANONICAL_HOST}${url.pathname}${url.search}` } })
  }
  return next()
})

export const startInstance = createStart(() => ({ requestMiddleware: [canonicalHost] }))
