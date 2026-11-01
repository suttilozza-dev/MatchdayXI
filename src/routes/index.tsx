import { Link, createFileRoute } from '@tanstack/react-router'
import { CREDIT_PACKS } from '#/lib/config'
import { GAMEWEEK_DEFAULT } from '#/lib/data'

export const Route = createFileRoute('/')({ component: Home })

const STEPS = [
  { n: '01', t: 'Pick your clubs', d: 'Set one team for a solo XI, or two for a Home v Away match-up. Any of the 20 Premier League clubs, 2026/27 squads.' },
  { n: '02', t: 'Drag it into shape', d: 'Choose a formation, then tap a marker and pick a player. Drag markers anywhere. Your subs sit in the dugout.' },
  { n: '03', t: 'Share it', d: 'Copy the image straight into a post, or download a 1080×1080 card. Send a link and anyone can open your line-up.' },
]

function Home() {
  return (
    <div>
      <header className="mx-auto max-w-[1100px] px-4 py-5 flex items-center justify-between">
        <div className="font-display text-xl font-bold">MATCHDAY <span style={{ color: 'var(--boot-lime)' }}>XI</span></div>
        <Link to="/board" className="font-display text-sm tracking-widest text-[#CFFF4D]">Open the board →</Link>
      </header>

      <main>
        <section className="mx-auto max-w-[1100px] px-4 pt-10 pb-16 text-center">
          <h1 className="font-display font-bold leading-[0.95] text-[clamp(3rem,10vw,7rem)]">MATCHDAY <span style={{ color: 'var(--boot-lime)' }}>XI</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[#AFCDBF]">
            Build your predicted or dream Premier League line-up on a tactical board, then download or copy it to share on socials.
          </p>
          <div className="mt-7 flex gap-3 justify-center flex-wrap">
            <Link to="/board" className="btn btn-lime">Pick your XI</Link>
            <Link to="/board" className="btn btn-ghost">Share the line-up</Link>
          </div>
          <p className="mt-4 font-display text-xs tracking-widest text-[#AFCDBF]">Gameweek {GAMEWEEK_DEFAULT} board is live</p>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-16">
          <h2 className="font-display font-bold text-3xl mb-5">From formation to <span style={{ color: 'var(--boot-lime)' }}>feed</span></h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="panel p-5">
                <div className="font-display text-2xl text-[#CFFF4D]">{s.n}</div>
                <div className="font-display text-lg mt-1">{s.t}</div>
                <p className="mt-2 text-sm text-[#AFCDBF]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-20">
          <div className="panel p-6 flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl">Free to build. £1 to download.</h2>
              <p className="mt-2 text-sm text-[#AFCDBF] max-w-xl">
                Build and copy for free. A PNG download uses one credit (£1). Credit packs: {CREDIT_PACKS.map((p) => p.label).join(', ')}.
              </p>
            </div>
            <Link to="/board" className="btn btn-lime">Pick your XI</Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-10 text-xs text-[#AFCDBF]">
        MATCHDAY XI is an independent fan tool, not affiliated with the Premier League or any club. matchday-xi.club
      </footer>
    </div>
  )
}
