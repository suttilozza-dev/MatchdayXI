import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

// Whop Pixel (ads attribution), exact snippet from Whop. Scope: biz_1DA89Rn6FlaXXk.
const WHOP_PIXEL = `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_1DA89Rn6FlaXXk");whop.track("page");`

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
      { title: 'Gaffster: Football line-up maker and Premier League squad builder' },
      {
        name: 'description',
        content: 'Free football line-up maker and squad builder. Pick a formation, add your captain and manager, and share your predicted XI, dream team or starting line-up as an image. Premier League 2026/27 squads and kits.',
      },
      {
        name: 'keywords',
        content: 'lineup maker, line-up maker, football lineup builder, squad builder, predicted XI, starting XI, dream team, formation builder, tactics board, Premier League line-up, team sheet',
      },
      { name: 'theme-color', content: '#0A1020' },
      { name: 'application-name', content: 'Gaffster' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'Gaffster' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Gaffster' },
      { property: 'og:title', content: 'Gaffster: football line-up maker and squad builder' },
      { property: 'og:description', content: 'Build your predicted or dream Premier League line-up on a tactical board, then share it.' },
      { property: 'og:url', content: 'https://gaffster.app/' },
      { property: 'og:image', content: 'https://gaffster.app/brand/social-preview.png' },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Gaffster: football line-up maker' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Gaffster: football line-up maker and squad builder' },
      { name: 'twitter:description', content: 'Build your predicted or dream Premier League line-up on a tactical board, then share it.' },
      { name: 'twitter:image', content: 'https://gaffster.app/brand/social-preview.png' },
    ],
    scripts: [
      { children: WHOP_PIXEL },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Gaffster',
          url: 'https://gaffster.app',
          applicationCategory: 'SportsApplication',
          operatingSystem: 'Any (web browser)',
          browserRequirements: 'Requires JavaScript and a modern browser',
          description: 'A football line-up maker and squad builder for predicted XIs, dream teams and starting line-ups, with Premier League 2026/27 squads.',
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
