import { CHECKOUT_LINKS, CREATOR, FOUNDER, FREE_PER_WEEK, PASS, PASS_PER_DAY, PLUS } from '#/lib/config'
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
    <div className="panel p-4 flex flex-col gap-2 relative" style={active || badge ? { borderColor: '#C8FF3D', borderWidth: 1.5 } : undefined}>
      {badge && (
        <span className="font-display text-[10px] tracking-widest absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5" style={{ background: '#7C5CFF', color: '#FFFFFF' }}>{badge}</span>
      )}
      <div className="font-display tracking-widest text-sm">{title}</div>
      <div>
        <span className="font-display text-3xl font-bold text-[#C8FF3D]">{price}</span>
        {per && <span className="text-sm text-[#A9B4D0]"> {per}</span>}
      </div>
      <div className="text-xs text-[#A9B4D0] min-h-4">{sub ?? ''}</div>
      <ul className="text-sm text-[#A9B4D0] list-disc pl-5 flex flex-col gap-1 flex-1">
        {lines.map((l) => <li key={l}>{l}</li>)}
      </ul>
      {children && <div className="flex gap-2 flex-wrap mt-2">{children}</div>}
    </div>
  )
}

/** Plans. Items marked "soon" are not built yet. Monthly and yearly are both shown and both buyable on the card. */
export function Pricing({ current }: { current?: Tier }) {
  return (
    <section aria-label="Plans" className="mt-6">
      <h2 className="font-display text-xl font-bold mb-3">Plans{current ? <span className="text-sm text-[#A9B4D0]"> · you are on {TIER_LABEL[current]}</span> : null}</h2>
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
          sub="No subscription. Buy another whenever you need one."
          active={current === 'pass'}
          lines={[`Up to ${PASS_PER_DAY} images a day with no watermark for 7 days`, 'The allowance resets every day and does not roll over', 'Square, 4:5, story, header and banner sizes', "One club's stadium"]}
        >
          <Buy id={PASS.id}>Get a pass</Buy>
        </Card>
        <Card
          title="Plus"
          price={PLUS.yearly.label}
          per={PLUS.yearly.note}
          sub={`Season Pass: about £2.50 a month. Or ${PLUS.monthly.label} ${PLUS.monthly.note}.`}
          badge="Most popular"
          active={current === 'plus'}
          lines={['Unlimited images with no watermark, for as long as you subscribe', 'Transparent background', 'Every stadium and colourway', 'Saved line-ups and gameweek history (soon)']}
        >
          <Buy id={PLUS.yearly.id} primary>{PLUS.yearly.label} a year · save 50%</Buy>
          <Buy id={PLUS.monthly.id}>{PLUS.monthly.label} a month</Buy>
        </Card>
        <Card
          title="Creator"
          price={CREATOR.yearly.label}
          per={CREATOR.yearly.note}
          sub={`About £6.67 a month. Or ${CREATOR.monthly.label} ${CREATOR.monthly.note}.`}
          active={current === 'creator'}
          lines={['Everything in Plus', 'Your handle on the image, MatchdayXI branding removed', 'Present mode: hidden controls for streaming', 'Bulk export, reveal videos, templates and coaching markup (soon)', 'Join now and keep this price as features arrive']}
        >
          <Buy id={CREATOR.yearly.id} primary>{CREATOR.yearly.label} a year · save 33%</Buy>
          <Buy id={CREATOR.monthly.id}>{CREATOR.monthly.label} a month</Buy>
        </Card>
      </div>
      <div className="panel p-4 mt-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'rgba(200,255,61,0.5)' }}>
        <div>
          <div className="font-display tracking-widest text-sm">Founder Lifetime · {FOUNDER.label} {FOUNDER.note}</div>
          <p className="text-sm text-[#A9B4D0]">Plus for life, with every future Plus feature. Only the first {FOUNDER.cap} people can have it.</p>
        </div>
        <Buy id={FOUNDER.id} primary>Become a Founder</Buy>
      </div>
    </section>
  )
}
