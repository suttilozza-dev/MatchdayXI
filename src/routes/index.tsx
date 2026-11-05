import { Link, createFileRoute } from '@tanstack/react-router'
import { Pricing } from '#/components/Pricing'
import { Disclaimer } from '#/components/Disclaimer'
import { GAMEWEEK_DEFAULT } from '#/lib/data'
import { HeaderLogo } from '#/components/Logo'

export const Route = createFileRoute('/')({ component: Home })

const STEPS = [
  { n: '01', t: 'Pick your clubs', d: 'Set one team for a solo XI, or two for a Home v Away match-up. Any of the 20 Premier League clubs, 2026/27 squads.' },
  { n: '02', t: 'Drag it into shape', d: 'Choose a formation, then tap a marker and pick a player. Drag markers anywhere, give someone the armband and set the manager. Your subs sit in the dugout.' },
  { n: '03', t: 'Share it', d: 'Your first image is free with no sign-up. Copy it into a post, tap Share on your phone, or download a card in square, 4:5, story or header sizes.' },
]

function Home() {
  return (
    <div>
      <header className="mx-auto max-w-[1100px] px-4 py-5 flex items-center justify-between">
        <HeaderLogo />
        <Link to="/board" className="font-display text-sm tracking-widest text-[#D9FF3F]">Open the board →</Link>
      </header>

      <main>
        <section className="mx-auto max-w-[1100px] px-4 pt-8 pb-16 grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center" style={{ backgroundImage: 'radial-gradient(520px 420px at 78% 45%, rgba(30,138,85,.38), transparent 70%)' }}>
          <div className="text-center md:text-left">
            <p className="font-display text-xs tracking-widest text-[#D9FF3F] mb-3">Football line-up maker</p>
            <h1 className="font-display font-bold leading-[0.95] text-[clamp(3rem,9vw,6rem)]">MATCHDAY <span style={{ color: 'var(--boot-lime)' }}>XI</span></h1>
            <p className="mt-5 max-w-xl text-lg text-[#A4C9B6] mx-auto md:mx-0">
              Pick a formation, name your captain and manager, and share your predicted XI, starting line-up or dream team as an image. Your first one is free, with no sign-up.
            </p>
            <div className="mt-7 flex gap-3 justify-center md:justify-start flex-wrap">
              <Link to="/board" className="btn btn-lime">Build your XI</Link>
              <a href="#plans" className="btn btn-ghost">See plans</a>
            </div>
            <p className="mt-4 font-display text-xs tracking-widest text-[#A4C9B6]">Gameweek {GAMEWEEK_DEFAULT} board is live</p>
          </div>
          <Link to="/board" aria-label="Build your own line-up like this one" className="block mx-auto w-full max-w-[420px]">
            <img
              src="/brand/sample-xi.png"
              alt="Example line-up card: Manchester United in a 4-2-3-1 with shirt markers, a manager line and a substitutes strip"
              width={1080}
              height={1350}
              className="w-full h-auto rounded-2xl"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(217,255,63,.12), 0 0 0 1px rgba(217,255,63,.4)', transform: 'rotate(2deg)' }}
            />
          </Link>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-16">
          <h2 className="font-display font-bold text-3xl mb-5">From formation to <span style={{ color: 'var(--boot-lime)' }}>feed</span></h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="panel p-5">
                <div className="font-display text-2xl text-[#D9FF3F]">{s.n}</div>
                <div className="font-display text-lg mt-1">{s.t}</div>
                <p className="mt-2 text-sm text-[#A4C9B6]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-[1100px] px-4 pb-16">
          <h2 className="font-display font-bold text-3xl mb-1">Start free. Upgrade for <span style={{ color: 'var(--boot-lime)' }}>clean images</span>.</h2>
          <p className="text-sm text-[#A4C9B6]">Build as much as you like. Your first image needs no sign-up, then 3 free images every week. Pick a plan for clean images in every size.</p>
          <Pricing />
        </section>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-10 flex flex-col gap-2">
        <Disclaimer />
        <p className="text-xs text-[#A4C9B6]">matchday-xi.club</p>
      </footer>
    </div>
  )
}
