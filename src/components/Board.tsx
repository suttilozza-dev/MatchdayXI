import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CLUBS, FORMATIONS, SITE_URL, managerFor, colourDistance, kitColours, type KitName, GAMEWEEK_DEFAULT, readableOn, squadFor, surname, type Player } from '#/lib/data'
import { FREE_PER_WEEK, PASS_PER_DAY } from '#/lib/config'
import { CAPS, getAccess, markAnonUsed, spendExport, type Access } from '#/lib/credits'
import { STADIUMS, stadiumFor, type StadiumId } from '#/lib/stadium'
import { CLUB_GROUNDS } from '#/lib/clubStadiums'
import { BENCH_MAX, autoFill, benchText, defaultBench, makeTeam, normalise, type Slot, type TeamState } from '#/lib/team'
import { COLLAR_PATH, PATTERNS, defaultPattern, patternShapes, type Pattern } from '#/lib/kit'
import { Pricing } from '#/components/Pricing'
import { Disclaimer } from '#/components/Disclaimer'
import { LINE_PATHS, SHIRT_PATH, backFont, SPOTS, fromXY, linesTransform, renderCard, toXY, viewBoxFor, type CardFormat, type LabelPos, type MarkerStyle, type Orient, type PlacedMarker, type Shape_ as Shape } from '#/lib/pitch'

type Side = 'home' | 'away'
type Saved = { hc: string; hf: string; hk: string; h2?: string; hb?: number[]; hl: (number | null)[]; hp: [number, number][]; ac?: string; af?: string; ak?: string; a2?: string; ab?: number[]; al?: (number | null)[]; ap?: [number, number][]; o: Orient; s: Shape; v: boolean; gw: string; k: string; hcap?: number | null; acap?: number | null; hpt?: Pattern; apt?: Pattern; ms?: MarkerStyle; lp?: LabelPos }

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

type Net = 'x' | 'facebook' | 'reddit' | 'instagram'
const NET_LABEL: Record<Net, string> = { x: 'X', facebook: 'Facebook', reddit: 'Reddit', instagram: 'Instagram' }

function NetIcon({ net }: { net: Net }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const
  if (net === 'x') return <svg {...common}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  if (net === 'facebook') return <svg {...common}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
  if (net === 'reddit')
    return (
      <svg {...common}>
        <circle cx="12" cy="13.5" r="7.5" />
        <circle cx="19.5" cy="5" r="2" />
        <circle cx="5.2" cy="9.3" r="2.2" />
        <circle cx="18.8" cy="9.3" r="2.2" />
        <circle cx="9.2" cy="13" r="1.4" fill="#0A1020" />
        <circle cx="14.8" cy="13" r="1.4" fill="#0A1020" />
        <path d="M9 16.4c1.7 1.2 4.3 1.2 6 0" stroke="#0A1020" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M12 6.3l1.3-3.6 4.9 1.3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    )
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
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
  const [format, setFormat] = useState<CardFormat>('square')
  const [access, setAccess] = useState<Access | null>(null)
  const [handle, setHandle] = useState('')
  const [transparent, setTransparent] = useState(false)
  const [stadium, setStadium] = useState<StadiumId>('matchdayxi')
  const [markerStyle, setMarkerStyle] = useState<MarkerStyle>('shirt')
  const [labelPos, setLabelPos] = useState<LabelPos>('below')
  const [canShareFiles, setCanShareFiles] = useState(false)
  useEffect(() => {
    try {
      const f = new File([''], 'x.png', { type: 'image/png' })
      setCanShareFiles(typeof navigator.share === 'function' && !!navigator.canShare?.({ files: [f] }))
    } catch {
      setCanShareFiles(false)
    }
  }, [])
  const refreshAccess = () => void getAccess().then(setAccess)
  useEffect(refreshAccess, [])
  const caps = access?.caps ?? CAPS.free
  const [stadiumKit, setStadiumKit] = useState<KitName>('home')
  const art = useMemo(() => stadiumFor(stadium, stadiumKit), [stadium, stadiumKit])
  const stadiumShapes = art.shapes
  const left = access?.remaining
  const [msg, setMsg] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ side: Side; idx: number } | null>(null)
  // restore from share link (phones default to the portrait pitch)
  useEffect(() => {
    let raw = location.hash.length >= 8 ? location.hash.slice(1) : ''
    if (!raw) {
      // coming back from "Sign in with Whop": put the line-up back as it was
      try {
        raw = sessionStorage.getItem('mdxi_resume') ?? ''
        sessionStorage.removeItem('mdxi_resume')
      } catch {
        /* storage blocked: start fresh */
      }
    }
    if (!raw) {
      if (window.innerWidth < 700) setOrient('portrait')
      return
    }
    const s = decode(raw)
    if (!s || !CLUBS.includes(s.hc) || !FORMATIONS[s.hf]) return
    const build = (club: string, f: string, colour: string, colour2: string | undefined, bench: number[] | undefined, pis: (number | null)[], ps: [number, number][]): TeamState => {
      const t = makeTeam(club, f)
      t.colour = colour
      if (colour2) t.colour2 = colour2
      if (bench) t.bench = bench.slice(0, BENCH_MAX)
      t.slots = t.slots.map((sl, i) => ({ ...sl, pi: pis[i] ?? null, u: ps[i]?.[0] ?? sl.u, v: ps[i]?.[1] ?? sl.v }))
      return normalise(t)
    }
    const okPattern = (p: unknown): p is Pattern => PATTERNS.some((x) => x.id === p)
    const withExtras = (t: TeamState, captain: number | null | undefined, pattern?: unknown): TeamState => ({ ...t, pattern: okPattern(pattern) ? pattern : t.pattern, captain: typeof captain === 'number' && t.slots.some((x) => x.pi === captain) ? captain : null })
    setHome(withExtras(build(s.hc, s.hf, s.hk, s.h2, s.hb, s.hl, s.hp), s.hcap, s.hpt))
    if (s.v && s.ac && s.af && FORMATIONS[s.af] && CLUBS.includes(s.ac)) setAway(withExtras(build(s.ac, s.af, s.ak ?? '#19E6D1', s.a2, s.ab, s.al ?? [], s.ap ?? []), s.acap, s.apt))
    if (s.ms === 'circle' || s.ms === 'shirt' || s.ms === 'shirt-back') setMarkerStyle(s.ms)
    if (s.lp === 'below' || s.lp === 'above' || s.lp === 'off') setLabelPos(s.lp)
    setVersus(!!s.v)
    setOrient(s.o)
    setShape(s.v ? 'full' : s.s)
    setGameweek(s.gw)
    setKind(s.k === 'Dream XI' ? 'My XI' : s.k)
  }, [])

  // two teams on one pitch must be told apart: if the shirts clash, give the away side the brand cyan (or lime)
  useEffect(() => {
    if (!versus || colourDistance(home.colour, away.colour) >= 70) return
    setAway((a) => {
      for (const k of ['away', 'third'] as KitName[]) {
        const c = kitColours(a.club, k)
        if (c && colourDistance(home.colour, c[0]) >= 90) return { ...a, kit: k, colour: c[0], colour2: c[1] }
      }
      const alt = colourDistance(home.colour, '#19E6D1') > 90 ? '#19E6D1' : '#C8FF3D'
      return { ...a, colour: alt }
    })
  }, [versus, home.colour, away.colour, away.club])

  const team = (side: Side) => (side === 'home' ? home : away)
  const setTeam = (side: Side, fn: (t: TeamState) => TeamState) => (side === 'home' ? setHome : setAway)((t) => normalise(fn(t)))
  const squads = useMemo(() => ({ home: squadFor(home.club), away: squadFor(away.club) }), [home.club, away.club])
  const effShape: Shape = versus ? 'full' : shape

  // world (U,V) for a slot
  // A slot's (u, v) is team-relative: u runs from the team's own goal (0) to the far goal. With one team that is 0..1 of the pitch
  // (or of the home half). With Home v Away each team starts in its own half, but a player can be dragged anywhere, so u can
  // reach 2 (the whole pitch length from the team's own goal line).
  const place = useCallback(
    (side: Side, s: Slot): [number, number] => {
      if (versus) return side === 'home' ? [s.u * 0.5, s.v] : [1 - s.u * 0.5, 1 - s.v]
      const u = Math.min(1, s.u) // a player dragged past halfway in Home v Away stays on the pitch when switching to one team
      if (effShape === 'half') return [u * 0.5, s.v]
      return [u, s.v]
    },
    [versus, effShape],
  )
  const unplace = useCallback(
    (side: Side, U: number, V: number): [number, number] => {
      const cl = (n: number, max = 1) => Math.min(max, Math.max(0, n))
      if (versus) return side === 'home' ? [cl(U / 0.5, 2), cl(V)] : [cl((1 - U) / 0.5, 2), cl(1 - V)]
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
        out.push({ key: `${side}${idx}`, side, idx, x, y, num: p?.num ?? null, name: p?.name ?? sl.role, colour: t.colour, ring: t.colour2, captain: sl.pi != null && t.captain === sl.pi, pattern: t.pattern })
      })
    })
    return out
  }, [home, away, squads, versus, orient, place])

  const vb = viewBoxFor(orient, effShape, art.ext)

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
      const slots = t.slots.map((s, i) => (i === slotIdx ? { ...s, pi } : i === existing ? { ...s, pi: prev } : s))
      return { ...t, bench, slots, captain: t.captain != null && slots.some((s) => s.pi === t.captain) ? t.captain : null }
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
  // a new formation re-picks the XI, so the bench is re-picked too (otherwise a player can end up in both)
  const changeFormation = (side: Side, formation: string) =>
    setTeam(side, (t) => {
      const slots = autoFill(t.club, formation)
      const squad = squadFor(t.club)
      return { ...t, formation, slots, bench: defaultBench(squad.length, squad, slots) }
    })

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
    markers: markers.map(({ key, x, y, num, name, colour, ring, captain, pattern }) => ({ key, x, y, num, name, colour, ring, captain, pattern })),
    format,
    homeBench: benchText(home, squads.home),
    awayBench: versus ? benchText(away, squads.away) : '',
    stadium: stadiumShapes,
    ext: art.ext,
    watermark: caps.watermark,
    transparent: caps.transparent && transparent,
    handle: caps.creatorBranding ? handle.trim() : '',
    homeManager: managerFor(home.club),
    awayManager: versus ? managerFor(away.club) : '',
    markerStyle,
    labelPos,
  })

  const failMsg = (reason: 'signin' | 'used_up' | 'unavailable') =>
    reason === 'signin'
      ? `That was your free first image. Sign in with Whop (free, no payment) for ${FREE_PER_WEEK} more every week.`
      : reason === 'unavailable'
        ? 'We could not check your plan just now. Try again in a moment.'
        : access?.tier === 'pass'
          ? `You have used today's ${PASS_PER_DAY} Gameweek Pass images. They reset at midnight UK time, or go Plus for unlimited images.`
          : access?.tier === 'free'
            ? `You have used your ${FREE_PER_WEEK} free images for this week. They come back on Monday, or pick a plan below.`
            : 'You have used all your images on this plan. Pick a plan below to keep exporting.'

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    refreshAccess()
  }

  const afterSpend = (a: Access, anon?: boolean) => {
    if (anon) return ` That was your free first image. Sign in (free) for ${FREE_PER_WEEK} more every week.`
    setAccess(a)
    return a.remaining === null ? '' : ` ${a.remaining} left.`
  }

  const downloadBlob = (blob: Blob) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `matchday-xi-gw${gameweek}-${home.club.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  /** One image export: check the plan, draw the card, then copy / download / open the phone share sheet. */
  const doExport = async (how: 'copy' | 'download' | 'share') => {
    setBusy(true)
    setMsg('')
    const r = await spendExport()
    if (!r.ok) {
      setMsg(failMsg(r.reason))
      setBusy(false)
      if (r.reason === 'signin') goSignIn()
      return
    }
    let done = ''
    try {
      const blob = await renderCard(cardInput())
      if (how === 'copy') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        done = 'Copied to your clipboard.'
      } else if (how === 'download') {
        downloadBlob(blob)
        done = 'Downloaded.'
      } else {
        const file = new File([blob], 'matchday-xi.png', { type: 'image/png' })
        try {
          await navigator.share({ files: [file], title: `${home.club} ${kind}`, text: `${home.club} ${kind}, gameweek ${gameweek}` })
          done = 'Shared.'
        } catch (e) {
          if ((e as Error).name === 'AbortError') done = 'Share cancelled.'
          else {
            downloadBlob(blob)
            done = 'Your phone would not open the share sheet, so the image was downloaded instead.'
          }
        }
      }
      if (r.anon) markAnonUsed()
      setMsg(done + afterSpend(r.access, r.anon))
    } catch {
      setMsg(how === 'copy' ? 'Your browser blocked copying. Use Download instead.' : 'Could not make the image. Try again.')
    }
    setBusy(false)
  }
  const doCopy = () => doExport('copy')
  const doDownload = () => doExport('download')
  const doShareImage = () => doExport('share')
  const buildSaved = (): Saved => {
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
      hcap: home.captain,
      hpt: home.pattern,
      ms: markerStyle,
      lp: labelPos,
    }
    if (versus) {
      s.acap = away.captain
      s.apt = away.pattern
      s.ac = away.club
      s.af = away.formation
      s.ak = away.colour
      s.a2 = away.colour2
      s.ab = away.bench
      s.al = away.slots.map((x) => x.pi)
      s.ap = away.slots.map((x) => [Math.round(x.u * 1000) / 1000, Math.round(x.v * 1000) / 1000])
    }
    return s
  }
  /** Go to Whop sign-in, remembering the line-up so it is still here when they come back. */
  const goSignIn = () => {
    try {
      sessionStorage.setItem('mdxi_resume', encode(buildSaved()))
    } catch {
      /* storage blocked: the line-up will not be restored */
    }
    location.href = '/api/auth/login'
  }
  const siteUrl = `https://${SITE_URL}`
  const postText = `${versus ? `${home.club} v ${away.club}` : home.club} ${kind} (${versus ? home.formation + ' v ' + away.formation : home.formation}), gameweek ${gameweek}. Build yours free:`
  const composeUrl = (net: Net): string | null => {
    const t = encodeURIComponent(postText)
    const u = encodeURIComponent(siteUrl)
    if (net === 'x') return `https://twitter.com/intent/tweet?text=${t}&url=${u}`
    if (net === 'facebook') return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`
    if (net === 'reddit') return `https://www.reddit.com/submit?url=${u}&title=${encodeURIComponent(`${home.club} ${kind}, gameweek ${gameweek}`)}`
    return null
  }

  /**
   * Share to a network. Web pages cannot attach a picture to a post, so the image is copied to the clipboard (or
   * downloaded if the browser refuses), and the network's post window opens with the text and the site link filled in.
   * On a phone, Instagram opens the phone's share sheet with the image attached.
   */
  const doSocial = async (net: Net) => {
    const phoneShare = net === 'instagram' && canShareFiles
    // open the post window inside the click, so pop-up blockers allow it; it is pointed at the network once the image is ready
    const win = phoneShare ? null : window.open('', '_blank')
    setBusy(true)
    setMsg('')
    const r = await spendExport()
    if (!r.ok) {
      win?.close()
      setMsg(failMsg(r.reason))
      setBusy(false)
      if (r.reason === 'signin') goSignIn()
      return
    }
    try {
      const blob = await renderCard(cardInput())
      let done = ''
      if (phoneShare) {
        const file = new File([blob], 'matchday-xi.png', { type: 'image/png' })
        try {
          await navigator.share({ files: [file], title: `${home.club} ${kind}`, text: `${postText} ${siteUrl}` })
          done = 'Shared.'
        } catch (e) {
          if ((e as Error).name === 'AbortError') done = 'Share cancelled.'
          else {
            downloadBlob(blob)
            done = 'Image downloaded: open Instagram and post it from your gallery.'
          }
        }
      } else if (net === 'instagram') {
        downloadBlob(blob)
        if (win) win.location.href = 'https://www.instagram.com/'
        done = 'Image downloaded. Instagram takes posts from its app or website, so upload it there.'
      } else {
        let copied = true
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        } catch {
          copied = false
          downloadBlob(blob)
        }
        const url = composeUrl(net)
        if (win && url) win.location.href = url
        done = `${copied ? 'Image copied: paste it into the post (Ctrl+V, or press and hold on a phone).' : 'Image downloaded: attach it to the post.'} The link to ${SITE_URL} is already in the post.`
      }
      if (r.anon) markAnonUsed()
      setMsg(done + afterSpend(r.access, r.anon))
    } catch {
      win?.close()
      setMsg('Could not make the image. Try again.')
    }
    setBusy(false)
  }

  const active = team(tab)
  const activeSquad = tab === 'home' ? squads.home : squads.away
  const inXI = new Set(active.slots.map((s) => s.pi))

  const teamBlock = (side: Side) => {
    const t = team(side)
    const accent = side === 'home' ? '#C8FF3D' : '#19E6D1'
    return (
      <div className="flex flex-col gap-2" style={versus ? { borderLeft: `3px solid ${accent}`, paddingLeft: 10 } : undefined}>
        {versus && <div className="set-title" style={{ color: accent }}>{side} team</div>}
        <div className="grid grid-cols-[1fr_7.5rem] gap-2">
          <label className="sr-only" htmlFor={`club-${side}`}>{side} club</label>
          <select id={`club-${side}`} className="field" value={t.club} onChange={(e) => changeClub(side, e.target.value)}>
            {CLUBS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="sr-only" htmlFor={`form-${side}`}>{side} formation</label>
          <select id={`form-${side}`} className="field" value={t.formation} onChange={(e) => changeFormation(side, e.target.value)}>
            {Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap" role="group" aria-label={`${side} kit`}>
            {(['home', 'away', 'third'] as KitName[]).map((k) => {
              const c = kitColours(t.club, k)
              if (!c) return null
              return (
                <button key={k} className="chip" aria-pressed={t.kit === k} onClick={() => setTeam(side, (x) => ({ ...x, kit: k, colour: c[0], colour2: c[1], pattern: defaultPattern(x.club, k) }))}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c[0], border: `2px solid ${c[1]}`, marginRight: 6, verticalAlign: 'middle' }} />
                  {k}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#A9B4D0] ml-auto">
            <label className="flex items-center gap-1">Shirt
              <input type="color" aria-label={`${side} kit colour`} value={t.colour} onChange={(e) => setTeam(side, (x) => ({ ...x, colour: e.target.value }))} style={{ width: 36, height: 40, background: 'none', border: 0 }} />
            </label>
            <label className="flex items-center gap-1">Trim
              <input type="color" aria-label={`${side} trim colour`} value={t.colour2} onChange={(e) => setTeam(side, (x) => ({ ...x, colour2: e.target.value }))} style={{ width: 36, height: 40, background: 'none', border: 0 }} />
            </label>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap items-center" role="group" aria-label={`${side} kit style`}>
          <span className="text-xs text-[#A9B4D0] mr-1">Kit style</span>
          {PATTERNS.map((p) => (
            <button key={p.id} className="chip" style={{ minHeight: 34, padding: '0.3rem 0.7rem' }} aria-pressed={t.pattern === p.id} disabled={markerStyle === 'circle'} title={markerStyle === 'circle' ? 'Switch markers to Shirt (Style section) to use kit styles' : p.hint} onClick={() => setTeam(side, (x) => ({ ...x, pattern: p.id }))}>{p.label}</button>
          ))}
        </div>
      </div>
    )
  }

  const stadiumName = stadium.startsWith('club:') ? (CLUB_GROUNDS[stadium.slice(5)]?.ground ?? 'Club ground') : (STADIUMS.find((x) => x.id === stadium)?.name ?? 'Stadium')
  const styleSummary = `${markerStyle === 'circle' ? 'Circles' : markerStyle === 'shirt' ? 'Shirts' : 'Shirt backs'} · names ${labelPos} · ${stadiumName}`
  const imageSummary = `${format} · ${transparent && caps.transparent ? 'transparent' : 'with background'}${caps.creatorBranding && handle.trim() ? ` · ${handle.trim()}` : ''}`

  const SettingsBar = (
    <div className="panel p-4 flex flex-col gap-4">
      <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3" aria-label="Teams">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="set-title">Teams</span>
            <div className="flex gap-2" role="group" aria-label="Number of teams">
              <button className="chip" aria-pressed={!versus} onClick={() => { setVersus(false); setTab('home') }}>One team</button>
              <button className="chip" aria-pressed={versus} onClick={() => { setVersus(true); setShape('full') }}>Home v Away</button>
            </div>
          </div>
          {teamBlock('home')}
          {versus && teamBlock('away')}
        </section>
        <section className="flex flex-col gap-3" aria-label="Match and pitch">
          <span className="set-title">Match</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-[#A9B4D0]">Gameweek
              <input className="field mt-1" value={gameweek} maxLength={6} onChange={(e) => setGameweek(e.target.value)} />
            </label>
            <label className="text-xs text-[#A9B4D0]">Label
              <select className="field mt-1" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option>Predicted XI</option>
                <option>My XI</option>
                <option>Starting XI</option>
              </select>
            </label>
          </div>
          <span className="set-title">Pitch</span>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Pitch">
            <button className="chip" aria-pressed={orient === 'landscape'} onClick={() => setOrient('landscape')}>Landscape</button>
            <button className="chip" aria-pressed={orient === 'portrait'} onClick={() => setOrient('portrait')}>Portrait</button>
            <button className="chip" aria-pressed={effShape === 'full'} disabled={versus} onClick={() => setShape('full')}>Full</button>
            <button className="chip" aria-pressed={effShape === 'half'} disabled={versus} onClick={() => setShape('half')}>Half</button>
          </div>
        </section>
      </div>

      <details className="opt">
        <summary><span className="set-title">Style</span><span className="opt-sum">{styleSummary}</span></summary>
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2 pt-3">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap items-center" role="group" aria-label="Player markers">
              <span className="text-xs text-[#A9B4D0] w-14">Markers</span>
              <button className="chip" aria-pressed={markerStyle === 'circle'} onClick={() => setMarkerStyle('circle')}>Circle</button>
              <button className="chip" aria-pressed={markerStyle === 'shirt'} onClick={() => setMarkerStyle('shirt')}>Shirt front</button>
              <button className="chip" aria-pressed={markerStyle === 'shirt-back'} onClick={() => setMarkerStyle('shirt-back')} title="Surname above the number, like the back of a shirt">Shirt back</button>
            </div>
            <div className="flex gap-2 flex-wrap items-center" role="group" aria-label="Player names">
              <span className="text-xs text-[#A9B4D0] w-14">Names</span>
              <button className="chip" aria-pressed={labelPos === 'below'} disabled={markerStyle === 'shirt-back'} onClick={() => setLabelPos('below')}>Below</button>
              <button className="chip" aria-pressed={labelPos === 'above'} disabled={markerStyle === 'shirt-back'} onClick={() => setLabelPos('above')}>Above</button>
              <button className="chip" aria-pressed={labelPos === 'off'} disabled={markerStyle === 'shirt-back'} onClick={() => setLabelPos('off')}>Off</button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A9B4D0]">Stadium
              <select className="field mt-1" value={stadium} onChange={(e) => setStadium(e.target.value as StadiumId)}>
                {STADIUMS.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                <optgroup label={caps.clubStadium === 'none' ? 'Club grounds (Trial, Unlimited or Creator)' : 'Club grounds'}>
                  {Object.entries(CLUB_GROUNDS).map(([club, g]) => (
                    <option key={club} value={`club:${club}`} disabled={caps.clubStadium === 'none'}>{club}: {g.ground}</option>
                  ))}
                </optgroup>
              </select>
            </label>
            {caps.clubStadium !== 'none' && (
              <button className="chip" onClick={() => setStadium(`club:${home.club}`)}>Use {home.club}'s ground</button>
            )}
            {stadium.startsWith('club:') && (
              <div className="flex gap-2 flex-wrap items-center" role="group" aria-label="Stadium colours">
                <span className="text-xs text-[#A9B4D0]">Colours</span>
                {(['home', 'away', 'third'] as KitName[]).map((k) => (
                  <button key={k} className="chip" aria-pressed={stadiumKit === k} disabled={k !== 'home' && caps.clubStadium !== 'all'} title={k !== 'home' && caps.clubStadium !== 'all' ? 'Colourways: Creator' : ''} onClick={() => setStadiumKit(k)}>{k}</button>
                ))}
              </div>
            )}
            {stadium.startsWith('club:') && CLUB_GROUNDS[stadium.slice(5)] && (
              <p className="text-[11px] text-[#A9B4D0]">{CLUB_GROUNDS[stadium.slice(5)].capacity.toLocaleString('en-GB')} capacity. Stylised, not to scale.</p>
            )}
          </div>
        </div>
      </details>
    </div>
  )

  const ImageSection = (
    <div className="panel p-3 mb-2">
      <details className="opt" style={{ borderTop: 0, paddingTop: 0 }}>
        <summary><span className="set-title">Image</span><span className="opt-sum">{imageSummary}</span></summary>
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2 pt-3">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap items-center" role="group" aria-label="Image size">
              <button className="chip" aria-pressed={format === 'square'} onClick={() => setFormat('square')}>Square</button>
              <button className="chip" aria-pressed={format === 'portrait'} onClick={() => setFormat('portrait')}>Portrait 4:5</button>
              <button className="chip" aria-pressed={format === 'story'} disabled={!caps.extraFormats} title={caps.extraFormats ? '' : 'Story size: Unlimited or Creator'} onClick={() => setFormat('story')}>Story 9:16</button>
              <button className="chip" aria-pressed={format === 'header'} disabled={!caps.extraFormats} title={caps.extraFormats ? '4:1 cover image, numbers only' : '4:1 cover: Unlimited or Creator'} onClick={() => { setFormat('header'); setOrient('landscape') }}>Header 4:1</button>
              <button className="chip" aria-pressed={format === 'banner'} disabled={!caps.extraFormats} title={caps.extraFormats ? '' : 'Wide banner: Unlimited or Creator'} onClick={() => setFormat('banner')}>Banner 16:9</button>
            </div>
            {!caps.extraFormats && <p className="text-[11px] text-[#A9B4D0]">Story, Header and Banner sizes come with Unlimited or Creator.</p>}
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-xs text-[#A9B4D0]">
              <input type="checkbox" disabled={!caps.transparent} checked={caps.transparent && transparent} onChange={(e) => setTransparent(e.target.checked)} style={{ width: 20, height: 20 }} />
              Transparent background {caps.transparent ? '' : '(Unlimited or Creator)'}
            </label>
            <label className="text-xs text-[#A9B4D0]">Your handle or name on the image {caps.creatorBranding ? '' : '(Creator)'}
              <input className="field mt-1" value={handle} maxLength={28} disabled={!caps.creatorBranding} placeholder="@yourchannel" onChange={(e) => setHandle(e.target.value)} />
            </label>
          </div>
        </div>
      </details>
    </div>
  )

  const SquadList = (
      <div className="panel p-3 lg:sticky lg:top-3">
        {versus && (
          <div className="flex gap-2 mb-2" role="tablist" aria-label="Squad list">
            <button className="chip" role="tab" aria-pressed={tab === 'home'} onClick={() => setTab('home')}>Home squad</button>
            <button className="chip" role="tab" aria-pressed={tab === 'away'} onClick={() => setTab('away')}>Away squad</button>
          </div>
        )}
        <p className="text-xs text-[#A9B4D0] mb-2">
          {sel && sel.side === tab ? `Pick a player for ${active.slots[sel.idx].role}.` : 'Click a marker, then a player. Or drag a player onto a marker. Click two markers to swap them.'}
        </p>
        <div>
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
                    <span className="ml-auto text-[10px] text-[#A9B4D0]">{p.pos}</span>
                  </button>
                  {kind === 'xi' && (
                    <button
                      className="chip"
                      style={{ minWidth: 44 }}
                      aria-pressed={active.captain === i}
                      aria-label={active.captain === i ? `${p.name} is captain. Remove the armband` : `Make ${p.name} captain`}
                      title="Captain's armband"
                      onClick={() => setTeam(tab, (t) => ({ ...t, captain: t.captain === i ? null : i }))}
                    >
                      C
                    </button>
                  )}
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
                <div className="font-display text-[11px] tracking-widest text-[#A9B4D0] px-2 py-1">Manager · <span className="text-[#F5F7FF]">{managerFor(active.club) || 'unknown'}</span></div>
                <div className="font-display text-[11px] tracking-widest text-[#C8FF3D] px-2 py-1">Bench ({bench.length}/{BENCH_MAX})</div>
                {bench.map((i) => row(i, 'bench'))}
                <div className="font-display text-[11px] tracking-widest text-[#A9B4D0] px-2 py-1 mt-2">Unused ({unused.length})</div>
                {unused.map((i) => row(i, 'unused'))}
                <div className="font-display text-[11px] tracking-widest text-[#A9B4D0] px-2 py-1 mt-2">Starting XI</div>
                {active.slots.map((s) => s.pi).filter((i): i is number => i != null).map((i) => row(i, 'xi'))}
              </>
            )
          })()}
        </div>
      </div>
  )

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16">
      <div className={present ? '' : 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'}>
      <div className="order-1 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 flex-wrap py-3">
            <div className="font-display text-sm tracking-widest text-[#A9B4D0]">
              Gameweek {gameweek} · {kind}{left != null ? ` · ${left} image${left === 1 ? '' : 's'} left${access?.tier === 'free' ? ' this week' : access?.tier === 'pass' ? ' today' : ''}` : ''}
              {' · '}
              {access?.signedIn ? (
                <>
                  {access.name ? `${access.name} · ` : ''}
                  <button type="button" className="underline" onClick={signOut}>Sign out</button>
                </>
              ) : (
                <a className="underline text-[#C8FF3D]" href="/api/auth/login">Sign in with Whop</a>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-ghost" disabled={!caps.present} title={caps.present ? '' : 'Hidden controls for streaming: Creator plan'} onClick={() => setPresent((p) => !p)}>{present ? 'Show controls' : caps.present ? 'Present' : 'Present · Creator'}</button>
              <button className="btn btn-ghost" onClick={doCopy} disabled={busy}>Copy image</button>
              <button className="btn btn-lime" onClick={doDownload} disabled={busy}>Download</button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap pb-3" role="group" aria-label="Share to social media">
            <span className="font-display text-xs tracking-widest text-[#A9B4D0]">Share to</span>
            {(['x', 'facebook', 'reddit', 'instagram'] as Net[]).map((n) => (
              <button key={n} className="chip inline-flex items-center gap-2" onClick={() => doSocial(n)} disabled={busy} aria-label={`Share to ${NET_LABEL[n]}`}>
                <NetIcon net={n} />
                {NET_LABEL[n]}
              </button>
            ))}
            {canShareFiles && (
              <button className="chip" onClick={doShareImage} disabled={busy}>More…</button>
            )}
          </div>
          {!present && ImageSection}
          {msg && <p role="status" className="text-sm text-[#C8FF3D] pb-2">{msg}</p>}
          {!msg && access && !access.signedIn && (
            <p className="text-xs text-[#A9B4D0] pb-2">Build your line-up. Your first image is free with no sign-up; after that <a className="underline text-[#C8FF3D]" href="/api/auth/login">sign in with Whop</a> (free) for {FREE_PER_WEEK} more every week.</p>
          )}
          <p className="print-note text-sm">Printing the board is switched off on the free plan. Visit matchday-xi.club for plans.</p>
      </div>
      {!present && <div className="order-3 lg:order-2 lg:col-span-2">{SettingsBar}</div>}
        <div className="order-2 lg:order-3 min-w-0">

          {/* stadium surround: kept narrow so the pitch stays the star */}
          <div className={`rounded-xl p-2 sm:p-3${caps.watermark ? ' pitch-locked' : ''}`} style={{ background: 'radial-gradient(circle at 5px 5px, rgba(200,255,61,.22) 1.6px, transparent 2.2px) 0 0/11px 11px, radial-gradient(circle at 10px 10px, rgba(25,230,209,.16) 1.4px, transparent 2px) 0 0/11px 11px, #070B18', border: '1px solid rgba(245,247,255,.08)' }}>
            <svg
              ref={svgRef}
              onContextMenu={(e) => { if (caps.watermark) e.preventDefault() }}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
              className="w-full h-auto block rounded-lg"
              style={{ maxHeight: orient === 'portrait' ? '78vh' : undefined, margin: '0 auto', touchAction: 'none', background: '#070B18', userSelect: caps.watermark ? 'none' : undefined, WebkitUserSelect: caps.watermark ? 'none' : undefined }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="application"
              aria-label="Tactical board"
            >
              <defs><clipPath id="shirt-clip"><path d={SHIRT_PATH} /></clipPath></defs>
              <g transform={linesTransform(orient)}>
                {stadiumShapes.map((sh, i) => <path key={i} d={sh.d} fill={sh.fill ?? 'none'} stroke={sh.stroke} strokeWidth={sh.sw} opacity={sh.opacity} />)}
                <rect x={0} y={0} width={1050} height={680} fill="#23A261" />
                {Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? <rect key={i} x={i * 105} y={0} width={105} height={680} fill="rgba(0,0,0,0.06)" /> : null))}
                {LINE_PATHS.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(245,247,255,0.45)" strokeWidth={2.5} />)}
                {SPOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="rgba(245,247,255,0.5)" />)}
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
                    {selected && <circle r={34} fill="none" stroke="#C8FF3D" strokeWidth={3} strokeDasharray="6 5" />}
                    {markerStyle === 'circle' ? (
                      <circle r={26} fill={m.colour} stroke={m.ring} strokeWidth={4} />
                    ) : (
                      <>
                        <path d={SHIRT_PATH} fill={m.colour} />
                        <g clipPath="url(#shirt-clip)">
                          {patternShapes(m.pattern, m.ring).map((sh, i) =>
                            sh.kind === 'rect' ? <rect key={i} x={sh.x} y={sh.y} width={sh.w} height={sh.h} fill={sh.fill} /> : <polygon key={i} points={sh.pts.map((p) => p.join(',')).join(' ')} fill={sh.fill} />,
                          )}
                        </g>
                        <path d={SHIRT_PATH} fill="none" stroke={m.ring} strokeWidth={3.5} strokeLinejoin="round" />
                        <path d={COLLAR_PATH} fill="none" stroke={m.ring} strokeWidth={4} strokeLinecap="round" />
                      </>
                    )}
                    {markerStyle === 'shirt-back' ? (
                      <>
                        <text textAnchor="middle" y={-7} fontFamily="Inter, sans-serif" fontWeight={600} fontSize={backFont(surname(m.name).toUpperCase().slice(0, 12))} fill={readableOn(m.colour)} pointerEvents="none">{surname(m.name).toUpperCase().slice(0, 12)}</text>
                        <text textAnchor="middle" y={16} fontFamily="Oswald, sans-serif" fontWeight={700} fontSize={25} fill={readableOn(m.colour)} pointerEvents="none">{m.num ?? ''}</text>
                      </>
                    ) : (
                      <text textAnchor="middle" dy="0.35em" fontFamily="Oswald, sans-serif" fontWeight={700} fontSize={24} fill={readableOn(m.colour)} stroke={markerStyle !== 'circle' && m.pattern && m.pattern !== 'plain' ? readableOn(readableOn(m.colour)) : undefined} strokeWidth={4} paintOrder="stroke" pointerEvents="none">{m.num ?? ''}</text>
                    )}
                    {m.captain && (
                      <g pointerEvents="none">
                        <circle cx={24} cy={-22} r={11} fill="#C8FF3D" stroke="#0A1020" strokeWidth={2} />
                        <text x={24} y={-21} textAnchor="middle" dy="0.35em" fontFamily="Oswald, sans-serif" fontWeight={700} fontSize={15} fill="#0A1020">C</text>
                      </g>
                    )}
                    {labelPos !== 'off' && markerStyle !== 'shirt-back' && (
                      <text y={labelPos === 'above' ? -37 : markerStyle === 'circle' ? 46 : 49} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={600} fontSize={19} fill="#F5F7FF" stroke="rgba(10,16,32,0.9)" strokeWidth={5} paintOrder="stroke" pointerEvents="none">{surname(m.name)}</text>
                    )}
                  </g>
                )
              })}
              {caps.watermark && (
                // On-screen watermark: shows in screenshots and screen recordings too. Paid plans do not get it.
                <g pointerEvents="none" aria-hidden="true" transform={`rotate(-24 ${vb.x + vb.w / 2} ${vb.y + vb.h / 2})`}>
                  {Array.from({ length: 9 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
                    <text
                      key={`${r}-${c}`}
                      x={vb.x - vb.w * 0.25 + c * vb.w * 0.5 + (r % 2 ? vb.w * 0.25 : 0)}
                      y={vb.y - vb.h * 0.3 + r * vb.h * 0.2}
                      fontFamily="Oswald, sans-serif"
                      fontWeight={700}
                      fontSize={Math.max(vb.w, vb.h) * 0.034}
                      fill="rgba(245,247,255,0.2)"
                      stroke="rgba(0,0,0,0.22)"
                      strokeWidth={1}
                      paintOrder="stroke"
                    >
                      MATCHDAY XI · MATCHDAY-XI.CLUB
                    </text>
                  )))}
                </g>
              )}
            </svg>
            {(['home', 'away'] as Side[]).filter((sd) => sd === 'home' || versus).map((sd) => {
              const t = team(sd)
              const sq = sd === 'home' ? squads.home : squads.away
              const accent = sd === 'home' ? '#C8FF3D' : '#19E6D1'
              return (
                <div key={sd} className="mt-2 flex items-center gap-1.5 flex-wrap" aria-label={`${sd} dugout: manager, substitutes and unused players`}>
                  <span className="font-display text-[11px] tracking-widest text-[#A9B4D0] mr-1">{versus ? `${sd} dugout` : 'Dugout'}</span>
                  <span title="Manager" className="font-display text-xs rounded-full px-2 py-1" style={{ textAlign: 'center', color: accent, border: `1px solid ${accent}` }}>Manager · {managerFor(t.club) || 'unknown'}</span>
                  {sq.map((p, i) => {
                    const lit = t.bench.includes(i)
                    const onPitch = t.slots.some((s) => s.pi === i)
                    return (
                      <button
                        key={i}
                        title={`${p.name}${lit ? ' (bench)' : onPitch ? ' (starting)' : ' (unused)'}`}
                        onClick={() => { if (!onPitch) toggleBench(sd, i) }}
                        className="font-display text-xs rounded-full px-2 py-1"
                        style={{ minWidth: 34, minHeight: 28, textAlign: 'center', background: lit ? accent : 'transparent', color: lit ? '#0A1020' : 'rgba(175,205,191,.4)', border: `1px solid ${lit ? accent : 'rgba(175,205,191,.25)'}`, cursor: onPitch ? 'default' : 'pointer' }}
                      >
                        {p.num ?? '–'}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <Pricing current={access?.tier} />
        </div>
        {!present && <aside className="order-4" aria-label="Squad list">{SquadList}</aside>}
      </div>
      <Disclaimer className="text-xs text-[#A9B4D0] mt-6 max-w-3xl" />
    </div>
  )
}
