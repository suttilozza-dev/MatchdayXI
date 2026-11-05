import { Link, createFileRoute } from '@tanstack/react-router'
import { Pricing } from '#/components/Pricing'
import { Disclaimer } from '#/components/Disclaimer'
import { GAMEWEEK_DEFAULT } from '#/lib/data'
import { HeaderLogo } from '#/components/Logo'
import { HeroCarousel } from '#/components/HeroCarousel'

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
        <Link to="/board" className="font-display text-sm tracking-widest text-[#C8FF3D]">Open the board →</Link>
      </header>

      <main>
        <section className="mx-auto max-w-[1100px] px-4 pt-8 pb-16 grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center" style={{ backgroundImage: 'radial-gradient(520px 420px at 78% 45%, rgba(35,162,97,.38), transparent 70%)' }}>
          <div className="text-center md:text-left">
            <p className="font-display text-xs tracking-widest text-[#C8FF3D] mb-3">Football line-up maker</p>
            <h1 className="font-display font-bold leading-[0.95] text-[clamp(3rem,9vw,6rem)]">MATCHDAY <span style={{ color: 'var(--boot-lime)' }}>XI</span></h1>
            <p className="mt-5 max-w-xl text-lg text-[#A9B4D0] mx-auto md:mx-0">
              Pick a formation, name your captain and manager, and share your predicted XI, starting line-up or dream team as an image. Your first one is free, with no sign-up.
            </p>
            <div className="mt-7 flex gap-3 justify-center md:justify-start flex-wrap">
              <Link to="/board" className="btn btn-lime">Build your XI</Link>
              <a href="#plans" className="btn btn-ghost">See plans</a>
            </div>
            <p className="mt-4 font-display text-xs tracking-widest text-[#A9B4D0]">Gameweek {GAMEWEEK_DEFAULT} board is live</p>
          </div>
          <HeroCarousel />
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-16">
          <h2 className="font-display font-bold text-3xl mb-5">From formation to <span style={{ color: 'var(--boot-lime)' }}>feed</span></h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="panel p-5">
                <div className="font-display text-2xl text-[#C8FF3D]">{s.n}</div>
                <div className="font-display text-lg mt-1">{s.t}</div>
                <p className="mt-2 text-sm text-[#A9B4D0]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-[1100px] px-4 pb-16">
          <h2 className="font-display font-bold text-3xl mb-1">Start free. Upgrade for <span style={{ color: 'var(--boot-lime)' }}>clean images</span>.</h2>
          <p className="text-sm text-[#A9B4D0]">Build as much as you like. Your first image needs no sign-up, then 3 free images every week. Pick a plan for clean images in every size.</p>
          <Pricing />
        </section>
      </main>

      <footer className="mx-auto max-w-[1100px] px-4 pb-10 flex flex-col gap-2">
        <Disclaimer />
        <p className="text-xs text-[#A9B4D0]">matchday-xi.club</p>
      </footer>
    </div>
  )
}
