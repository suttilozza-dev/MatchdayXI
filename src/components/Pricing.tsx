import { CHECKOUT_LINKS, CREATOR, CREDIT_PACKS, FREE_IMAGES, LIFETIME, TRIAL } from '#/lib/config'
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

function Card({ title, price, lines, children, active }: { title: string; price: string; lines: string[]; children?: React.ReactNode; active?: boolean }) {
  return (
    <div className="panel p-4 flex flex-col gap-2" style={active ? { borderColor: '#CFFF4D', borderWidth: 1.5 } : undefined}>
      <div className="font-display tracking-widest text-sm">{title}</div>
      <div className="font-display text-2xl font-bold text-[#CFFF4D]">{price}</div>
      <ul className="text-sm text-[#AFCDBF] list-disc pl-5 flex flex-col gap-1 flex-1">
        {lines.map((l) => <li key={l}>{l}</li>)}
      </ul>
      {children && <div className="flex gap-2 flex-wrap mt-2">{children}</div>}
    </div>
  )
}

/** Plans. Items marked "soon" are not built yet. */
export function Pricing({ current }: { current?: Tier }) {
  return (
    <section aria-label="Plans" className="mt-6">
      <h2 className="font-display text-xl font-bold mb-3">Plans{current ? <span className="text-sm text-[#AFCDBF]"> · you are on {TIER_LABEL[current]}</span> : null}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Free" price="£0" active={current === 'free'} lines={[`${FREE_IMAGES} images with a watermark and the site link`, 'MatchdayXI Stadium, branding and logos', 'Build and share a link as much as you like']} />
        <Card title="Trial" price={TRIAL.label} active={current === 'trial'} lines={[`${TRIAL.images} images without the watermark`, 'One trial per user', "One club's stadium (club stadiums soon)", 'Keeps MatchdayXI branding and logo']}>
          <Buy id={TRIAL.id}>Start trial</Buy>
        </Card>
        <Card title="Unlimited" price={`${LIFETIME.label} ${LIFETIME.note}`} active={current === 'lifetime'} lines={['Unlimited image downloads and copies', "One club's colourways stadium (soon)", 'Story size, wide banner, transparent background', 'Save and reopen line-ups, history by gameweek (soon)']}>
          <Buy id={LIFETIME.id} primary>Get unlimited</Buy>
        </Card>
        <Card title="Creator" price={`${CREATOR.monthly.label} or ${CREATOR.yearly.label}`} active={current === 'creator'} lines={['Everything in Unlimited', 'All stadium surrounds and colourways (soon)', 'Your handle on the image, MatchdayXI branding removed', 'Hidden controls panel for streaming', 'Several line-ups per gameweek, bulk export (soon)', 'Predicted v real line-up, shared leagues, animated reveal (soon)']}>
          <Buy id={CREATOR.monthly.id} primary>Monthly</Buy>
          <Buy id={CREATOR.yearly.id}>Yearly</Buy>
        </Card>
      </div>
      <div className="panel p-4 mt-4">
        <div className="font-display tracking-widest text-sm mb-1">Credit packs</div>
        <p className="text-sm text-[#AFCDBF] mb-3">Pay as you go. Each copy or download uses one image. Keeps MatchdayXI branding and logos.</p>
        <div className="flex gap-2 flex-wrap">
          {CREDIT_PACKS.map((p) => (
            <Buy key={p.id} id={p.id}>{p.label} · {p.images} images ({p.per})</Buy>
          ))}
        </div>
      </div>
    </section>
  )
}
