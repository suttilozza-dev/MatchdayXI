import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'MATCHDAY XI — Build your Premier League line-up' },
      {
        name: 'description',
        content: 'Build your predicted or dream Premier League line-up on a tactical board, then download or copy it to share on socials.',
      },
      { name: 'theme-color', content: '#0E2A20' },
      { name: 'application-name', content: 'MATCHDAY XI' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'MATCHDAY XI' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'MATCHDAY XI' },
      { property: 'og:title', content: 'MATCHDAY XI: Premier League line-up maker' },
      { property: 'og:description', content: 'Build your predicted or dream Premier League line-up on a tactical board, then share it.' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'MATCHDAY XI',
          url: 'https://matchday-xi.club',
          applicationCategory: 'SportsApplication',
          operatingSystem: 'Any (web browser)',
          browserRequirements: 'Requires JavaScript and a modern browser',
          description: 'A web app for building and sharing predicted or dream Premier League line-ups on a tactical board.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
        }),
      },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', type: 'image/png', href: '/brand/favicon.png' },
      { rel: 'apple-touch-icon', href: '/brand/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
