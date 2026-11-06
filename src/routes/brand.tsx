import { Link, createFileRoute } from '@tanstack/react-router'
import { Logo } from '#/components/Logo'
import { LOGOS, LOGO_ROLES } from '#/lib/logos'

export const Route = createFileRoute('/brand')({
  head: () => ({ meta: [{ title: 'Brand kit · GAFFSTER' }, { name: 'robots', content: 'noindex' }] }),
  component: Brand,
})

function download(id: string) {
  const l = LOGOS[id]
  const svg = l.svg.includes('xmlns') ? l.svg : l.svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `gaffster-logo-${id}.svg`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

function Group({ title, note, ids }: { title: string; note: string; ids: readonly string[] }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="text-sm text-[#A9B4D0] mb-4">{note}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ids.map((id) => (
          <figure key={title + id} className="m-0">
            <div className="rounded-xl overflow-hidden" style={{ background: LOGOS[id].bg, border: '1px solid rgba(245,247,255,.12)' }}>
              <Logo id={id} />
            </div>
            <figcaption className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm"><b className="font-display text-[#C8FF3D]">{id}</b> {LOGOS[id].name}</span>
              <button className="chip" onClick={() => download(id)}>SVG</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Brand() {
  const shown = new Set<string>([...LOGO_ROLES.main, ...LOGO_ROLES.secondary])
  const extra = LOGO_ROLES.advertising.filter((i) => !shown.has(i))
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <Link to="/" className="font-display text-sm tracking-widest text-[#C8FF3D]">← Back</Link>
      <h1 className="font-display text-4xl font-bold mt-2 mb-1">Brand kit</h1>
      <p className="text-sm text-[#A9B4D0] mb-8 max-w-2xl">
        Approved logos in the Night palette. Download SVGs for ads and social posts. The text in each SVG uses the Oswald and Inter fonts, so open them somewhere those fonts are installed, or convert the text to outlines first.
      </p>
      <div className="panel p-4 mb-8 flex items-center gap-5 flex-wrap">
        <img src="/brand/ball-cream.png" alt="Approved ball mark, cream" width={72} height={72} />
        <img src="/brand/ball-ink.png" alt="Approved ball mark, ink outline" width={72} height={72} style={{ background: '#F5F7FF', borderRadius: 8, padding: 6 }} />
        <div className="text-sm text-[#A9B4D0] max-w-md">Approved ball mark. Used as the browser tab and app icon. Keep clear space equal to its height, and do not recolour it into a club's colours.</div>
      </div>
      <Group title="Main logos" note="Header and hero: 02 Pitch Monogram and 03B Line Shirt." ids={LOGO_ROLES.main} />
      <Group title="Secondary logos" note="Badges, empty states and smaller spots." ids={LOGO_ROLES.secondary} />
      <Group
        title="Advertising only"
        note={`Also approved for ads and social, and shown above: ${LOGO_ROLES.advertising.filter((i) => extra.indexOf(i) < 0).join(', ')}. These ones are for advertising only.`}
        ids={extra}
      />
    </div>
  )
}
