import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CLUBS, CLUB_COLOURS, FORMATIONS, colourDistance, GAMEWEEK_DEFAULT, readableOn, squadFor, surname, type Player, type Pos } from '#/lib/data'
import { CHECKOUT_LINKS, CREDIT_PACKS } from '#/lib/config'
import { spendDownloadCredit } from '#/lib/credits'
import { LINE_PATHS, SPOTS, fromXY, linesTransform, renderCard, toXY, viewBoxFor, type Orient, type PlacedMarker, type Shape } from '#/lib/pitch'

type Side = 'home' | 'away'
type Slot = { role: string; pos: Pos; u: number; v: number; pi: number | null }
type TeamState = { club: string; formation: string; colour: string; colour2: string; slots: Slot[]; bench: number[] }
const BENCH_MAX = 9 // Premier League: nine named substitutes

function autoFill(club: string, formation: string): Slot[] {
  const squad = squadFor(club)
  const used = new Set<number>()
  return FORMATIONS[formation].map((f) => {
    const idx = squad.findIndex((p, i) => p.pos === f.pos && !used.has(i))
    if (idx >= 0) used.add(idx)
    return { role: f.role, pos: f.pos, u: f.u, v: f.v, pi: idx >= 0 ? idx : null }
  })
}

function defaultBench(squadLen: number, squad: Player[], slots: Slot[]): number[] {
  const inXI = new Set(slots.map((s) => s.pi))
  const rest = squad.map((_, i) => i).filter((i) => !inXI.has(i))
  const gk = rest.find((i) => squad[i].pos === 'GK')
  const out: number[] = gk != null ? [gk] : []
  const order: Pos[] = ['DEF', 'MID', 'FWD']
  const pools = order.map((pos) => rest.filter((i) => squad[i].pos === pos))
  for (let k = 0; out.length < BENCH_MAX && pools.some((p) => p.length); k++) {
    const next = pools[k % 3].shift()
    if (next != null) out.push(next)
  }
  void squadLen
  return out
}

function makeTeam(club: string, formation: string): TeamState {
  const slots = autoFill(club, formation)
  const squad = squadFor(club)
  return { club, formation, colour: CLUB_COLOURS[club] ?? '#CFFF4D', colour2: '#F7F7F2', slots, bench: defaultBench(squad.length, squad, slots) }
}

type Saved = { hc: string; hf: string; hk: string; h2?: string; hb?: number[]; hl: (number | null)[]; hp: [number, number][]; ac?: string; af?: string; ak?: string; a2?: string; ab?: number[]; al?: (number | null)[]; ap?: [number, number][]; o: Orient; s: Shape; v: boolean; gw: string; k: string }

function encode(s: Saved): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function decode(h: string): Saved | null {
  try {
    const b = h.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4))))) as Saved
  } catch {
    return null
  }
}

export default function Board() {
  const [versus, setVersus] = useState(false)
  const [orient, setOrient] = useState<Orient>('landscape')
  const [shape, setShape] = useState<Shape>('full')
  const [home, setHome] = useState<TeamState>(() => makeTeam('Manchester United', '4-2-3-1'))
  const [away, setAway] = useState<TeamState>(() => makeTeam('Liverpool', '4-3-3'))
  const [tab, setTab] = useState<Side>('home')
  const [sel, setSel] = useState<{ side: Side; idx: number } | null>(null)
  const [gameweek, setGameweek] = useState(GAMEWEEK_DEFAULT)
  const [kind, setKind] = useState('Predicted XI')
  const [present, setPresent] = useState(false)
  const [format, setFormat] = useState<'square' | 'portrait'>('square')
  const [msg, setMsg] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ side: Side; idx: number } | null>(null)

  // restore from share link (phones default to the portrait pitch)
  useEffect(() => {
    if (!location.hash || location.hash.length < 8) {
      if (window.innerWidth < 700) setOrient('portrait')
      return
    }
    const s = decode(location.hash.slice(1))
    if (!s || !CLUBS.includes(s.hc) || !FORMATIONS[s.hf]) return
    const build = (club: string, f: string, colour: string, colour2: string | undefined, bench: number[] | undefined, pis: (number | null)[], ps: [number, number][]): TeamState => {
      const t = makeTeam(club, f)
      t.colour = colour
      if (colour2) t.colour2 = colour2
      if (bench) t.bench = bench.slice(0, BENCH_MAX)
      t.slots = t.slots.map((sl, i) => ({ ...sl, pi: pis[i] ?? null, u: ps[i]?.[0] ?? sl.u, v: ps[i]?.[1] ?? sl.v }))
      return t
    }
    setHome(build(s.hc, s.hf, s.hk, s.h2, s.hb, s.hl, s.hp))
    if (s.v && s.ac && s.af && FORMATIONS[s.af] && CLUBS.includes(s.ac)) setAway(build(s.ac, s.af, s.ak ?? '#1FD1C1', s.a2, s.ab, s.al ?? [], s.ap ?? []))
    setVersus(!!s.v)
    setOrient(s.o)
    setShape(s.v ? 'full' : s.s)
    setGameweek(s.gw)
    setKind(s.k)
  }, [])

  // two teams on one pitch must be told apart: if the shirts clash, give the away side the brand cyan (or lime)
  useEffect(() => {
    if (!versus || colourDistance(home.colour, away.colour) >= 70) return
    const alt = colourDistance(home.colour, '#1FD1C1') > 90 ? '#1FD1C1' : '#CFFF4D'
    setAway((a) => ({ ...a, colour: alt }))
  }, [versus, home.colour, away.colour])

  const team = (side: Side) => (side === 'home' ? home : away)
  const setTeam = (side: Side, fn: (t: TeamState) => TeamState) => (side === 'home' ? setHome(fn) : setAway(fn))
  const squads = useMemo(() => ({ home: squadFor(home.club), away: squadFor(away.club) }), [home.club, away.club])
  const effShape: Shape = versus ? 'full' : shape

  // world (U,V) for a slot
  const place = useCallback(
    (side: Side, s: Slot): [number, number] => {
      if (versus) return side === 'home' ? [s.u * 0.5, s.v] : [1 - s.u * 0.5, 1 - s.v]
      if (effShape === 'half') return [s.u * 0.5, s.v]
      return [s.u, s.v]
    },
    [versus, effShape],
  )
  const unplace = useCallback(
    (side: Side, U: number, V: number): [number, number] => {
      const cl = (n: number) => Math.min(1, Math.max(0, n))
      if (versus) return side === 'home' ? [cl(U / 0.5), cl(V)] : [cl((1 - U) / 0.5), cl(1 - V)]
      if (effShape === 'half') return [cl(U / 0.5), cl(V)]
      return [cl(U), cl(V)]
    },
    [versus, effShape],
  )

  const markers = useMemo(() => {
    const out: (PlacedMarker & { side: Side; idx: number })[] = []
    ;(['home', 'away'] as Side[]).forEach((side) => {
      if (side === 'away' && !versus) return
      const t = side === 'home' ? home : away
      const sq = side === 'home' ? squads.home : squads.away
      t.slots.forEach((sl, idx) => {
        const [U, V] = place(side, sl)
        const [x, y] = toXY(U, V, orient)
        const p: Player | undefined = sl.pi != null ? sq[sl.pi] : undefined
        out.push({ key: `${side}${idx}`, side, idx, x, y, num: p?.num ?? null, name: p?.name ?? sl.role, colour: t.colour, ring: t.colour2 })
      })
    })
    return out
  }, [home, away, squads, versus, orient, place])

  const vb = viewBoxFor(orient, effShape)

  // dragging markers
  const toSvg = (e: { clientX: number; clientY: number }): [number, number] => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return [p.x, p.y]
  }
  const onPointerDown = (e: React.PointerEvent, side: Side, idx: number) => {
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    dragRef.current = { side, idx }
    movedRef.current = false
    startRef.current = [e.clientX, e.clientY]
  }
  const movedRef = useRef(false)
  const startRef = useRef<[number, number]>([0, 0])
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    if (Math.hypot(e.clientX - startRef.current[0], e.clientY - startRef.current[1]) < 5 && !movedRef.current) return
    movedRef.current = true
    const [x, y] = toSvg(e)
    const [U, V] = fromXY(x, y, orient)
    const [u, v] = unplace(d.side, U, V)
    setTeam(d.side, (t) => ({ ...t, slots: t.slots.map((s, i) => (i === d.idx ? { ...s, u, v } : s)) }))
  }
  const onPointerUp = () => {
    const d = dragRef.current
    dragRef.current = null
    if (!d || movedRef.current) return
    // treat as click: select, or swap with the selected marker
    if (sel && sel.side === d.side && sel.idx !== d.idx) {
      setTeam(d.side, (t) => {
        const a = t.slots[sel.idx].pi
        const b = t.slots[d.idx].pi
        return { ...t, slots: t.slots.map((s, i) => (i === sel.idx ? { ...s, pi: b } : i === d.idx ? { ...s, pi: a } : s)) }
      })
      setSel(null)
    } else if (sel && sel.side === d.side && sel.idx === d.idx) setSel(null)
    else {
      setSel(d)
      setTab(d.side)
    }
  }

  const assign = (side: Side, slotIdx: number, pi: number) => {
    setTeam(side, (t) => {
      const existing = t.slots.findIndex((s) => s.pi === pi)
      const prev = t.slots[slotIdx].pi
      if (existing === slotIdx) return t
      let bench = t.bench
      if (existing < 0) {
        // incoming player comes from the bench or the unused list: the replaced player takes his place
        if (bench.includes(pi)) bench = bench.map((b) => (b === pi ? (prev as number) : b)).filter((b) => b != null)
        else bench = bench.filter((b) => b !== pi)
      }
      return {
        ...t,
        bench,
        slots: t.slots.map((s, i) => (i === slotIdx ? { ...s, pi } : i === existing ? { ...s, pi: prev } : s)),
      }
    })
  }
  const toggleBench = (side: Side, pi: number) =>
    setTeam(side, (t) => {
      if (t.bench.includes(pi)) return { ...t, bench: t.bench.filter((b) => b !== pi) }
      if (t.bench.length >= BENCH_MAX) {
        setMsg(`The bench is full: ${BENCH_MAX} substitutes. Move one to unused first.`)
        return t
      }
      return { ...t, bench: [...t.bench, pi] }
    })
  const pickPlayer = (side: Side, pi: number) => {
    if (sel && sel.side === side) {
      assign(side, sel.idx, pi)
      setSel(null)
    } else setMsg('Click a marker on the pitch first, then pick a player. You can also drag a player onto a marker.')
  }

  const changeClub = (side: Side, club: string) => setTeam(side, (t) => ({ ...makeTeam(club, t.formation) }))
  const changeFormation = (side: Side, formation: string) => setTeam(side, (t) => ({ ...t, formation, slots: autoFill(t.club, formation) }))

  const benchText = (t: TeamState, sq: Player[]) =>
    t.bench
      .map((i) => sq[i]?.num)
      .filter((n): n is number => n != null)
      .sort((a, b) => a - b)
      .join(' · ')

  const cardInput = () => ({
    orient,
    shape: effShape,
    versus,
    homeName: home.club,
    awayName: away.club,
    homeForm: home.formation,
    awayForm: away.formation,
    homeColour: home.colour,
    awayColour: away.colour,
    gameweek,
    kind,
    markers: markers.map(({ key, x, y, num, name, colour, ring }) => ({ key, x, y, num, name, colour, ring })),
    format,
    homeBench: benchText(home, squads.home),
    awayBench: versus ? benchText(away, squads.away) : '',
  })

  const doCopy = async () => {
    setBusy(true)
    setMsg('')
    try {
      const blob = await renderCard(cardInput())
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setMsg('Copied to your clipboard. Paste it straight into a post.')
    } catch {
      setMsg("Your browser blocked copying. Use Download instead.")
    }
    setBusy(false)
  }
  const doDownload = async () => {
    setBusy(true)
    setMsg('')
    const r = await spendDownloadCredit()
    if (!r.ok) {
      setMsg(
        r.reason === 'not_configured'
          ? 'Downloads open once credits are switched on. Copy is free in the meantime.'
          : r.reason === 'signin'
            ? 'Sign in with Whop to download.'
            : 'You are out of credits. Buy a pack below.',
      )
      setBusy(false)
      return
    }
    try {
      const blob = await renderCard(cardInput())
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `matchday-xi-gw${gameweek}-${home.club.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 2000)
      setMsg(r.dev ? 'Downloaded (test mode: no credit used).' : 'Downloaded. 1 credit used.')
    } catch {
      setMsg('Could not make the image. Try again.')
    }
    setBusy(false)
  }
  const doShare = async () => {
    const s: Saved = {
      hc: home.club,
      hf: home.formation,
      hk: home.colour,
      h2: home.colour2,
      hb: home.bench,
      hl: home.slots.map((s) => s.pi),
      hp: home.slots.map((s) => [Math.round(s.u * 1000) / 1000, Math.round(s.v * 1000) / 1000]),
      o: orient,
      s: shape,
      v: versus,
      gw: gameweek,
      k: kind,
    }
    if (versus) {
      s.ac = away.club
      s.af = away.formation
      s.ak = away.colour
      s.a2 = away.colour2
      s.ab = away.bench
      s.al = away.slots.map((x) => x.pi)
      s.ap = away.slots.map((x) => [Math.round(x.u * 1000) / 1000, Math.round(x.v * 1000) / 1000])
    }
    const url = `${location.origin}${location.pathname}#${encode(s)}`
    history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
      setMsg('Link copied. Anyone with it sees your line-up.')
    } catch {
      setMsg('Link is in your address bar. Copy it from there.')
    }
  }

  const active = team(tab)
  const activeSquad = tab === 'home' ? squads.home : squads.away
  const inXI = new Set(active.slots.map((s) => s.pi))

  const Controls = (
    <div className="flex flex-col gap-4">
      <div className="panel p-4 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Teams">
          <button className="chip" aria-pressed={!versus} onClick={() => { setVersus(false); setTab('home') }}>One team</button>
          <button className="chip" aria-pressed={versus} onClick={() => { setVersus(true); setShape('full') }}>Home v Away</button>
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Pitch">
          <button className="chip" aria-pressed={orient === 'landscape'} onClick={() => setOrient('landscape')}>Landscape</button>
          <button className="chip" aria-pressed={orient === 'portrait'} onClick={() => setOrient('portrait')}>Portrait</button>
          <button className="chip" aria-pressed={effShape === 'full'} disabled={versus} onClick={() => setShape('full')}>Full pitch</button>
          <button className="chip" aria-pressed={effShape === 'half'} disabled={versus} onClick={() => setShape('half')}>Half pitch</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-[#AFCDBF]">Gameweek
            <input className="field mt-1" value={gameweek} maxLength={6} onChange={(e) => setGameweek(e.target.value)} />
          </label>
          <label className="text-xs text-[#AFCDBF]">Label
            <select className="field mt-1" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option>Predicted XI</option>
              <option>Dream XI</option>
              <option>Starting XI</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2 flex-wrap items-center" role="group" aria-label="Image size">
          <span className="text-xs text-[#AFCDBF]">Image</span>
          <button className="chip" aria-pressed={format === 'square'} onClick={() => setFormat('square')}>Square</button>
          <button className="chip" aria-pressed={format === 'portrait'} onClick={() => setFormat('portrait')}>Portrait</button>
        </div>
      </div>

      {(['home', 'away'] as Side[]).filter((s) => s === 'home' || versus).map((side) => {
        const t = team(side)
        return (
          <div key={side} className="panel p-4 flex flex-col gap-2" style={{ borderColor: side === 'home' ? '#CFFF4D' : '#1FD1C1', borderWidth: 1.5 }}>
            <div className="font-display text-xs tracking-widest" style={{ color: side === 'home' ? '#CFFF4D' : '#1FD1C1' }}>{side}</div>
            <label className="sr-only" htmlFor={`club-${side}`}>{side} club</label>
            <select id={`club-${side}`} className="field" value={t.club} onChange={(e) => changeClub(side, e.target.value)}>
              {CLUBS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <label className="sr-only" htmlFor={`form-${side}`}>{side} formation</label>
              <select id={`form-${side}`} className="field" value={t.formation} onChange={(e) => changeFormation(side, e.target.value)}>
                {Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}
              </select>
              <div className="flex items-center gap-1 text-xs text-[#AFCDBF]">
                <label className="flex items-center gap-1">Kit
                  <input type="color" aria-label={`${side} kit colour`} value={t.colour} onChange={(e) => setTeam(side, (x) => ({ ...x, colour: e.target.value }))} style={{ width: 40, height: 44, background: 'none', border: 0 }} />
                </label>
                <label className="flex items-center gap-1">Trim
                  <input type="color" aria-label={`${side} trim colour`} value={t.colour2} onChange={(e) => setTeam(side, (x) => ({ ...x, colour2: e.target.value }))} style={{ width: 40, height: 44, background: 'none', border: 0 }} />
                </label>
              </div>
            </div>
          </div>
        )
      })}

      <div className="panel p-3">
        {versus && (
          <div className="flex gap-2 mb-2" role="tablist" aria-label="Squad list">
            <button className="chip" role="tab" aria-pressed={tab === 'home'} onClick={() => setTab('home')}>Home squad</button>
            <button className="chip" role="tab" aria-pressed={tab === 'away'} onClick={() => setTab('away')}>Away squad</button>
          </div>
        )}
        <p className="text-xs text-[#AFCDBF] mb-2">
          {sel && sel.side === tab ? `Pick a player for ${active.slots[sel.idx].role}.` : 'Click a marker, then a player. Or drag a player onto a marker. Click two markers to swap them.'}
        </p>
        <div className="max-h-[420px] overflow-auto pr-1">
          {(() => {
            const bench = active.bench
            const unused = activeSquad.map((_, i) => i).filter((i) => !inXI.has(i) && !bench.includes(i))
            const row = (i: number, kind: 'xi' | 'bench' | 'unused') => {
              const p = activeSquad[i]
              return (
                <div key={i} className="flex items-center gap-1">
                  <button
                    className="player-row"
                    data-used={kind === 'xi'}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', `${tab}:${i}`); e.dataTransfer.effectAllowed = 'move' }}
                    onClick={() => pickPlayer(tab, i)}
                  >
                    <span className="player-num">{p.num ?? '–'}</span>
                    <span className="text-sm">{p.name}</span>
                    <span className="ml-auto text-[10px] text-[#AFCDBF]">{p.pos}</span>
                  </button>
                  {kind !== 'xi' && (
                    <button
                      className="chip"
                      style={{ minWidth: 44 }}
                      aria-label={kind === 'bench' ? `Move ${p.name} to unused` : `Move ${p.name} to the bench`}
                      onClick={() => toggleBench(tab, i)}
                    >
                      {kind === 'bench' ? '↓' : '↑'}
                    </button>
                  )}
                </div>
              )
            }
            return (
              <>
                <div className="font-display text-[11px] tracking-widest text-[#CFFF4D] px-2 py-1">Bench ({bench.length}/{BENCH_MAX})</div>
                {bench.map((i) => row(i, 'bench'))}
                <div className="font-display text-[11px] tracking-widest text-[#AFCDBF] px-2 py-1 mt-2">Unused ({unused.length})</div>
                {unused.map((i) => row(i, 'unused'))}
                <div className="font-display text-[11px] tracking-widest text-[#AFCDBF] px-2 py-1 mt-2">Starting XI</div>
                {active.slots.map((s) => s.pi).filter((i): i is number => i != null).map((i) => row(i, 'xi'))}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16">
      <div className={present ? '' : 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'}>
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap py-3">
            <div className="font-display text-sm tracking-widest text-[#AFCDBF]">Gameweek {gameweek} · {kind}</div>
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-ghost" onClick={() => setPresent((p) => !p)}>{present ? 'Show controls' : 'Present'}</button>
              <button className="btn btn-ghost" onClick={doShare}>Share link</button>
              <button className="btn btn-ghost" onClick={doCopy} disabled={busy}>Copy image</button>
              <button className="btn btn-lime" onClick={doDownload} disabled={busy}>Download · 1 credit</button>
            </div>
          </div>
          {msg && <p role="status" className="text-sm text-[#CFFF4D] pb-2">{msg}</p>}

          {/* stadium surround: kept narrow so the pitch stays the star */}
          <div className="rounded-xl p-2 sm:p-3" style={{ background: 'radial-gradient(circle at 5px 5px, rgba(207,255,77,.22) 1.6px, transparent 2.2px) 0 0/11px 11px, radial-gradient(circle at 10px 10px, rgba(31,209,193,.16) 1.4px, transparent 2px) 0 0/11px 11px, #0b2119', border: '1px solid rgba(247,247,242,.08)' }}>
            <svg
              ref={svgRef}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
              className="w-full h-auto block rounded-lg"
              style={{ maxHeight: orient === 'portrait' ? '78vh' : undefined, margin: '0 auto', touchAction: 'none', background: '#123C2C' }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="application"
              aria-label="Tactical board"
            >
              <g transform={linesTransform(orient)}>
                <rect x={0} y={0} width={1050} height={680} fill="#1B5940" />
                {Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? <rect key={i} x={i * 105} y={0} width={105} height={680} fill="rgba(0,0,0,0.06)" /> : null))}
                {LINE_PATHS.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(247,247,242,0.45)" strokeWidth={2.5} />)}
                {SPOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="rgba(247,247,242,0.5)" />)}
              </g>
              {markers.map((m) => {
                const selected = sel?.side === m.side && sel.idx === m.idx
                return (
                  <g
                    key={m.key}
                    className="marker"
                    transform={`translate(${m.x} ${m.y})`}
                    onPointerDown={(e) => onPointerDown(e, m.side, m.idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const [sd, pi] = e.dataTransfer.getData('text/plain').split(':')
                      if (sd === m.side) assign(m.side, m.idx, Number(pi))
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${m.name} ${m.num ?? ''}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(selected ? null : { side: m.side, idx: m.idx }); setTab(m.side) } }}
                  >
                    {selected && <circle r={34} fill="none" stroke="#CFFF4D" strokeWidth={3} strokeDasharray="6 5" />}
                    <circle r={26} fill={m.colour} stroke={m.ring} strokeWidth={4} />
                    <text textAnchor="middle" dy="0.35em" fontFamily="Oswald, sans-serif" fontWeight={700} fontSize={24} fill={readableOn(m.colour)} pointerEvents="none">{m.num ?? ''}</text>
                    <text y={46} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={600} fontSize={19} fill="#F7F7F2" stroke="rgba(14,42,32,0.9)" strokeWidth={5} paintOrder="stroke" pointerEvents="none">{surname(m.name)}</text>
                  </g>
                )
              })}
            </svg>
            {(['home', 'away'] as Side[]).filter((sd) => sd === 'home' || versus).map((sd) => {
              const t = team(sd)
              const sq = sd === 'home' ? squads.home : squads.away
              const accent = sd === 'home' ? '#CFFF4D' : '#1FD1C1'
              return (
                <div key={sd} className="mt-2 flex items-center gap-1.5 flex-wrap" aria-label={`${sd} dugout: manager, substitutes and unused players`}>
                  <span className="font-display text-[11px] tracking-widest text-[#AFCDBF] mr-1">{versus ? `${sd} dugout` : 'Dugout'}</span>
                  <span title="Manager" className="font-display text-xs rounded-full px-2 py-1" style={{ minWidth: 30, textAlign: 'center', color: accent, border: `1px solid ${accent}` }}>M</span>
                  {sq.map((p, i) => {
                    const lit = t.bench.includes(i)
                    const onPitch = t.slots.some((s) => s.pi === i)
                    return (
                      <button
                        key={i}
                        title={`${p.name}${lit ? ' (bench)' : onPitch ? ' (starting)' : ' (unused)'}`}
                        onClick={() => { if (!onPitch) toggleBench(sd, i) }}
                        className="font-display text-xs rounded-full px-2 py-1"
                        style={{ minWidth: 34, minHeight: 28, textAlign: 'center', background: lit ? accent : 'transparent', color: lit ? '#0E2A20' : 'rgba(175,205,191,.4)', border: `1px solid ${lit ? accent : 'rgba(175,205,191,.25)'}`, cursor: onPitch ? 'default' : 'pointer' }}
                      >
                        {p.num ?? '–'}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div className="panel mt-5 p-4">
            <div className="font-display tracking-widest text-sm mb-1">Credits</div>
            <p className="text-sm text-[#AFCDBF] mb-3">Copy is free. Each PNG download uses 1 credit (£1). Buy a pack, use it whenever.</p>
            <div className="flex gap-2 flex-wrap">
              {CREDIT_PACKS.map((p) => {
                const href = CHECKOUT_LINKS[p.id]
                return href ? (
                  <a key={p.id} className="btn btn-ghost" href={href}>{p.label} · {p.credits} credits</a>
                ) : (
                  <button key={p.id} className="btn btn-ghost" disabled title="Checkout links coming soon">{p.label} · {p.credits} credits · soon</button>
                )
              })}
            </div>
          </div>
        </div>
        {!present && <aside aria-label="Controls">{Controls}</aside>}
      </div>
      <p className="text-xs text-[#AFCDBF] mt-6 max-w-3xl">
        Independent fan tool. Not affiliated with the Premier League or any club. Squads are 2026/27 names and shirt numbers, so check before you share. Kit colours are approximate: change them with the Kit picker.
      </p>
    </div>
  )
}
