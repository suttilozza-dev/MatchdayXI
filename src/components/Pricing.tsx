import { useState } from 'react'
import { CHECKOUT_LINKS, CREATOR, FOUNDER, FREE_PER_WEEK, PASS, PLUS } from '#/lib/config'
import { TIER_LABEL, type Tier } from '#/lib/credits'

function Buy({ id, children, primary }: { id: string; children: React.ReactNode; primary?: boolean }) {
  const href = CHECKOUT_LINKS[id]
  const cls = primary ? 'btn btn-lime' : 'btn btn-ghost'
  return href ? (
    <a className={cls} href={href}>{children}</a>
  ) : (
    <button className="btn btn-ghost" disabled title="Checkout opens soon">{children} · soon</button>
  )
}

function Card({ title, price, per, sub, lines, children, active, badge }: { title: string; price: string; per?: string; sub?: string; lines: string[]; children?: React.ReactNode; active?: boolean; badge?: string }) {
  return (
    <div className="panel p-4 flex flex-col gap-2 relative" style={active || badge ? { borderColor: '#CFFF4D', borderWidth: 1.5 } : undefined}>
      {badge && (
        <span className="font-display text-[10px] tracking-widest absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5" style={{ background: '#CFFF4D', color: '#0E2A20' }}>{badge}</span>
      )}
      <div className="font-display tracking-widest text-sm">{title}</div>
      <div>
        <span className="font-display text-3xl font-bold text-[#CFFF4D]">{price}</span>
        {per && <span className="text-sm text-[#AFCDBF]"> {per}</span>}
      </div>
      <div className="text-xs text-[#AFCDBF] min-h-4">{sub ?? ''}</div>
      <ul className="text-sm text-[#AFCDBF] list-disc pl-5 flex flex-col gap-1 flex-1">
        {lines.map((l) => <li key={l}>{l}</li>)}
      </ul>
      {children && <div className="flex gap-2 flex-wrap mt-2">{children}</div>}
    </div>
  )
}

/** Plans. Items marked "soon" are not built yet. */
export function Pricing({ current }: { current?: Tier }) {
  const [yearly, setYearly] = useState(true)
  const plus = yearly ? PLUS.yearly : PLUS.monthly
  const creator = yearly ? CREATOR.yearly : CREATOR.monthly
  return (
    <section aria-label="Plans" className="mt-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="font-display text-xl font-bold">Plans{current ? <span className="text-sm text-[#AFCDBF]"> · you are on {TIER_LABEL[current]}</span> : null}</h2>
        <div className="flex gap-2" role="group" aria-label="Billing">
          <button className="chip" aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
          <button className="chip" aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly · save up to 50%</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Free"
          price="£0"
          sub="No card, no catch"
          active={current === 'free'}
          lines={['Your first image needs no sign-up', `Then ${FREE_PER_WEEK} watermarked images every week after a free sign-in`, 'Every formation and marker style', 'MatchdayXI stadium']}
        >
          <a className="btn btn-ghost" href="/board">Start building</a>
        </Card>
        <Card
          title="Gameweek Pass"
          price={PASS.label}
          per={`once · ${PASS.days} days`}
          sub="No subscription"
          active={current === 'pass'}
          lines={['Unlimited images with no watermark for 7 days', 'Square, 4:5, story, header and banner sizes', "One club's stadium"]}
        >
          <Buy id={PASS.id}>Get a pass</Buy>
        </Card>
        <Card
          title="Plus"
          price={plus.label}
          per={plus.note}
          sub={yearly ? 'That is about £2.50 a month: 2 months free' : 'Or £29.99 a year (save 50%)'}
          badge="Most popular"
          active={current === 'plus'}
          lines={['Everything in the Pass, for as long as you subscribe', 'Transparent background', 'Every stadium and colourway', 'Saved line-ups and gameweek history (soon)']}
        >
          <Buy id={yearly ? PLUS.yearly.id : PLUS.monthly.id} primary>{yearly ? 'Get the Season Pass' : 'Get Plus'}</Buy>
        </Card>
        <Card
          title="Creator"
          price={creator.label}
          per={creator.note}
          sub={yearly ? 'About £6.67 a month (save 33%)' : 'Or £79.99 a year (save 33%)'}
          active={current === 'creator'}
          lines={['Everything in Plus', 'Your handle on the image, MatchdayXI branding removed', 'Present mode: hidden controls for streaming', 'Bulk export, reveal videos, templates and coaching markup (soon)', 'Join now and keep this price as features arrive']}
        >
          <Buy id={yearly ? CREATOR.yearly.id : CREATOR.monthly.id} primary>{yearly ? 'Go Creator (yearly)' : 'Go Creator'}</Buy>
        </Card>
      </div>
      <div className="panel p-4 mt-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'rgba(207,255,77,0.5)' }}>
        <div>
          <div className="font-display tracking-widest text-sm">Founder Lifetime · {FOUNDER.label} {FOUNDER.note}</div>
          <p className="text-sm text-[#AFCDBF]">Plus for life, with every future Plus feature. Only the first {FOUNDER.cap} people can have it.</p>
        </div>
        <Buy id={FOUNDER.id} primary>Become a Founder</Buy>
      </div>
    </section>
  )
}
