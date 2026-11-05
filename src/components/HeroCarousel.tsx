import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CLUBS } from '#/lib/data'
import { renderCard } from '#/lib/pitch'
import { SAMPLE_FORMATIONS, sampleCardInput } from '#/lib/sampleCard'

const SECONDS = 3
type Slide = { club: string; formation: string; url: string }

/**
 * Example line-up cards, one per club, that change every few seconds. They are drawn in the visitor's browser with the same
 * code as a real export, so they always show the current squads and kits. Until the first one is ready the static example is shown.
 */
export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)
  const count = useRef(0)
  count.current = slides.length

  useEffect(() => {
    setStill(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    let dead = false
    const urls: string[] = []
    ;(async () => {
      for (let k = 0; k < CLUBS.length; k++) {
        try {
          const formation = SAMPLE_FORMATIONS[k % SAMPLE_FORMATIONS.length]
          const blob = await renderCard(sampleCardInput(CLUBS[k], formation))
          if (dead) return
          const url = URL.createObjectURL(blob)
          urls.push(url)
          setSlides((s) => [...s, { club: CLUBS[k], formation, url }])
        } catch {
          /* skip a card that fails to draw */
        }
        await new Promise((r) => setTimeout(r, 40)) // let the page stay responsive between cards
      }
    })()
    return () => {
      dead = true
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    if (paused || still) return
    const t = setInterval(() => setI((x) => (count.current > 1 ? (x + 1) % count.current : 0)), SECONDS * 1000)
    return () => clearInterval(t)
  }, [paused, still])

  const cur = slides[i]
  return (
    <div className="mx-auto w-full max-w-[420px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Link to="/board" aria-label="Build your own line-up like this one" className="block relative" style={{ aspectRatio: '1080 / 1350' }}>
        <img
          src="/brand/sample-xi.png"
          alt="Example line-up card in a 4-2-3-1 with shirt markers, a manager line and a substitutes strip"
          width={1080}
          height={1350}
          className="absolute inset-0 w-full h-full rounded-2xl"
          style={{ boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(200,255,61,.12), 0 0 0 1px rgba(200,255,61,.4)' }}
        />
        {slides.map((s, k) => (
          <img
            key={s.club}
            src={s.url}
            alt={k === i ? `Example line-up card: ${s.club} in a ${s.formation}` : ''}
            aria-hidden={k !== i}
            width={1080}
            height={1350}
            className="absolute inset-0 w-full h-full rounded-2xl"
            style={{ opacity: k === i ? 1 : 0, transition: 'opacity 600ms ease', boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(200,255,61,.12), 0 0 0 1px rgba(200,255,61,.4)' }}
          />
        ))}
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-display text-xs tracking-widest text-[#A9B4D0]" aria-live="off">{cur ? `${cur.club} · ${cur.formation}` : 'Example line-up'}</span>
        {slides.length > 1 && (
          <span className="flex gap-2">
            <button className="chip" style={{ minHeight: 34, padding: '0.2rem 0.7rem' }} aria-label="Previous example" onClick={() => setI((x) => (x - 1 + slides.length) % slides.length)}>‹</button>
            <button className="chip" style={{ minHeight: 34, padding: '0.2rem 0.7rem' }} aria-label="Next example" onClick={() => setI((x) => (x + 1) % slides.length)}>›</button>
          </span>
        )}
      </div>
    </div>
  )
}
