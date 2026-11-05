import { kitColours, type KitName } from './data'
import type { Shape } from './stadium'

/**
 * Stylised club grounds, drawn from public facts (capacity, number of stands, tiers, bowl or separate
 * stands, roof type, standout features) read from each ground's public Wikipedia page. They are original
 * vector drawings, not traced from any photograph, and not to scale. Which touchline or end a stand sits
 * on is simplified. Check `notes` before relying on any detail.
 */
type Side = { t: number; depth?: number; seats?: [string, string]; brick?: boolean }
type Spec = {
  ground: string
  capacity: number
  top: Side
  bottom: Side
  left: Side
  right: Side
  /** [top-left, top-right, bottom-left, bottom-right] corners filled in */
  corners: [boolean, boolean, boolean, boolean]
  masts?: number
  ring?: boolean // one continuous roof ring (cable-stayed or cable-net)
  notes: string
}

const S = (t: number, depth = 1, extra: Partial<Side> = {}): Side => ({ t, depth, ...extra })
const ALL = [true, true, true, true] as [boolean, boolean, boolean, boolean]
const NONE = [false, false, false, false] as [boolean, boolean, boolean, boolean]

export const CLUB_GROUNDS: Record<string, Spec> = {
  Arsenal: { ground: 'Emirates Stadium', capacity: 60704, top: S(3), bottom: S(3), left: S(3), right: S(3), corners: ALL, ring: true, notes: 'Four-tier bowl with a club level; roof slopes in over all stands; upper tier is contoured to leave the corners open.' },
  'Aston Villa': { ground: 'Villa Park', capacity: 43205, top: S(3, 1.15), bottom: S(2), left: S(2), right: S(2), corners: [false, true, true, false], notes: 'Four separate stands: huge three-tier Trinity Road Stand, two-tier Holte End and North Stand, two-tier Doug Ellis Stand; claret and sky blue seats.' },
  Bournemouth: { ground: 'Vitality Stadium', capacity: 12357, top: S(1, 0.8), bottom: S(1, 0.8), left: S(0), right: S(1, 0.8), corners: NONE, notes: 'Three-sided ground: one end is open; roofed western stand.' },
  Brentford: { ground: 'Gtech Community Stadium', capacity: 17250, top: S(2, 0.85), bottom: S(2, 0.85), left: S(1), right: S(1), corners: [false, true, false, false], notes: 'Compact ground built inside a railway triangle; safe-standing rail seats in the West Stand.' },
  'Brighton and Hove Albion': { ground: 'American Express Stadium', capacity: 32500, top: S(3), bottom: S(3), left: S(1, 0.8), right: S(1, 0.8), corners: ALL, notes: 'Bowl set into the ground: big three-tier West and East stands, small North and South ends.' },
  Chelsea: { ground: 'Stamford Bridge', capacity: 40044, top: S(3, 1.05), bottom: S(3, 1.05), left: S(2, 0.85), right: S(2, 0.7), corners: NONE, notes: 'Four separate stands: three-tier West and East, two-tier Matthew Harding, small Shed End.' },
  'Coventry City': { ground: 'Coventry Building Society Arena', capacity: 32609, top: S(2), bottom: S(1, 1.2), left: S(1, 1.2), right: S(1, 1.2), corners: ALL, notes: 'Stadium bowl; the West Stand is the only two-tier stand.' },
  'Crystal Palace': { ground: 'Selhurst Park', capacity: 25194, top: S(2), bottom: S(1, 0.8, { seats: ['#F4F4F4', '#E4172B'] }), left: S(1, 0.7), right: S(2), corners: NONE, notes: 'Four separate stands: two-tier Holmesdale and Arthur Wait, small white-clad Main Stand, small Whitehorse Lane.' },
  Everton: { ground: 'Hill Dickinson Stadium', capacity: 52769, top: S(3), bottom: S(3), left: S(2), right: S(3, 1.1), corners: ALL, notes: 'Steel-and-glass bowl with a steep 13,000-seat single-style home end.' },
  Fulham: { ground: 'Craven Cottage', capacity: 28107, top: S(2, 0.9, { brick: true }), bottom: S(2, 0.9), left: S(1, 0.8), right: S(1, 0.8), corners: ALL, notes: 'Four separate stands; the brick Johnny Haynes Stand has a triangular gable and the Cottage pavilion sits beside it; raised Riverside Stand by the Thames.' },
  'Hull City': { ground: 'MKM Stadium', capacity: 25586, top: S(1), bottom: S(2), left: S(1), right: S(1), corners: ALL, notes: 'Asymmetric bowl: one tier all round, a second tier on the West Stand; black seats with a white and amber band.' },
  'Ipswich Town': { ground: 'Portman Road', capacity: 30056, top: S(3), bottom: S(2), left: S(2), right: S(2), corners: NONE, notes: 'Four covered stands: three-tier West Stand, two tiers on the other three.' },
  'Leeds United': { ground: 'Elland Road', capacity: 37633, top: S(2, 1.2, { seats: ['#F4E21B', '#F6F6F2'] }), bottom: S(2), left: S(2, 0.9), right: S(2, 0.75), corners: ALL, notes: 'Four stands joined by corner stands; the two-tier cantilever East Stand has yellow seats.' },
  Liverpool: { ground: 'Anfield', capacity: 61276, top: S(3, 1.05), bottom: S(2), left: S(2), right: S(1, 2.2), corners: [false, true, true, false], notes: 'Four stands: three-tier Main Stand, two-tier Kenny Dalglish Stand and Anfield Road End, and the single-tier Kop.' },
  'Manchester City': { ground: 'Etihad Stadium', capacity: 61038, top: S(3), bottom: S(3), left: S(3), right: S(3), corners: ALL, masts: 12, ring: true, notes: 'Continuous oval bowl with a cable-stayed ring roof hung from twelve masts.' },
  'Manchester United': { ground: 'Old Trafford', capacity: 74158, top: S(3, 1.2), bottom: S(1, 1.9), left: S(2, 1.1), right: S(2, 1.1), corners: NONE, notes: 'Four separate covered stands: three-tier Sir Alex Ferguson Stand with a huge cantilever roof, single-tier Sir Bobby Charlton Stand, two-tier Stretford End and East Stand; open corners.' },
  'Newcastle United': { ground: "St James' Park", capacity: 52719, top: S(3, 1.1, { seats: ['#2B2B2B', '#F4F4F4'] }), bottom: S(1, 1.1, { seats: ['#2B2B2B', '#F4F4F4'] }), left: S(3, 1.1, { seats: ['#2B2B2B', '#F4F4F4'] }), right: S(2, 1, { seats: ['#2B2B2B', '#F4F4F4'] }), corners: ALL, notes: 'Asymmetric bowl: tall Milburn Stand and Leazes End with executive boxes, single-tier East Stand, Gallowgate End.' },
  'Nottingham Forest': { ground: 'City Ground', capacity: 31212, top: S(2), bottom: S(2, 0.9), left: S(2, 0.9), right: S(2), corners: [false, false, true, false], notes: 'Separate stands beside the River Trent; the Brian Clough Stand spells FOREST in white seats.' },
  Sunderland: { ground: 'Stadium of Light', capacity: 49000, top: S(2), bottom: S(2), left: S(2), right: S(2), corners: ALL, notes: 'Square bowl of four stands with a continuous concourse; red seats with white corners.' },
  'Tottenham Hotspur': { ground: 'Tottenham Hotspur Stadium', capacity: 62850, top: S(4, 1, { seats: ['#132257', '#F4F4F4'] }), bottom: S(4, 1, { seats: ['#132257', '#F4F4F4'] }), left: S(1, 2.4, { seats: ['#132257', '#F4F4F4'] }), right: S(3, 1.1, { seats: ['#132257', '#F4F4F4'] }), corners: ALL, ring: true, notes: 'Asymmetric bowl: single-tier steep South Stand, three-tier North, four-tier East and West; cable-net roof; navy seats.' },
}

const H = 10 // hoarding strip next to the pitch
const TU = 24 // depth of one tier, before the side's own depth factor
const PL = 1050
const PW = 680
const rectPoly = (pts: [number, number][]) => `M${pts.map((p) => p.join(',')).join('L')}Z`
const dot = (cx: number, cy: number, r: number) => `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`

export type Surround = { shapes: Shape[]; ext: { left: number; right: number; top: number; bottom: number } }

export function clubSurround(club: string, kit: KitName = 'home'): Surround | null {
  const sp = CLUB_GROUNDS[club]
  if (!sp) return null
  const [main, trim] = kitColours(club, kit) ?? kitColours(club, 'home')!
  const roofCol = '#07130E'
  const seatsFor = (sd: Side): [string, string] => sd.seats ?? [main, trim]
  const shapes: Shape[] = []
  const ext = { left: H, right: H, top: H, bottom: H }
  const D = (sd: Side) => sd.t * TU * (sd.depth ?? 1)

  const map = (side: 'top' | 'bottom' | 'left' | 'right', s: number, d: number): [number, number] =>
    side === 'top' ? [s, -(H + d)] : side === 'bottom' ? [s, PW + H + d] : side === 'left' ? [-(H + d), s] : [PL + H + d, s]

  // ground behind everything (sized after the stands are known, so push now and patch later)
  const bg: Shape = { d: '', fill: '#060F0A' }
  shapes.push(bg)

  const dotsBy: Record<string, string> = {}
  const addDot = (c: string, x: number, y: number, r: number) => (dotsBy[c] = (dotsBy[c] ?? '') + dot(x, y, r))
  const palette = [trim, '#FFFFFF', main, '#A4C9B6']

  const sideSpan = (side: 'top' | 'bottom' | 'left' | 'right'): [number, number] => {
    const [tl, tr, bl, br] = sp.corners
    if (side === 'top') return [tl ? -(H + D(sp.left)) : 0, tr ? PL + H + D(sp.right) : PL]
    if (side === 'bottom') return [bl ? -(H + D(sp.left)) : 0, br ? PL + H + D(sp.right) : PL]
    return [0, PW] // ends sit between the touchline stands
  }

  ;(['top', 'bottom', 'left', 'right'] as const).forEach((side) => {
    const sd = sp[side]
    const total = D(sd)
    if (sd.t <= 0) return
    const [s0, s1] = sideSpan(side)
    const [seat, accent] = seatsFor(sd)
    ext[side] = H + total + 10
    for (let k = 0; k < sd.t; k++) {
      const d0 = k * TU * (sd.depth ?? 1)
      const d1 = (k + 1) * TU * (sd.depth ?? 1) - 2
      shapes.push({ d: rectPoly([map(side, s0, d0), map(side, s1, d0), map(side, s1, d1), map(side, s0, d1)]), fill: sd.brick && k === 0 ? '#8C3B2E' : seat, opacity: k % 2 ? 0.8 : 1 })
      shapes.push({ d: rectPoly([map(side, s0, d1), map(side, s1, d1), map(side, s1, d1 + 1.5), map(side, s0, d1 + 1.5)]), fill: accent, opacity: 0.35 })
      for (const off of [0.3, 0.7]) {
        const dd = d0 + (d1 - d0) * off
        for (let s = s0 + 10 + (off > 0.5 ? 7 : 0); s < s1 - 6; s += 15) {
          const [x, y] = map(side, s, dd)
          const hash = Math.abs(Math.floor(Math.sin(s * 12.9898 + dd * 78.233 + k) * 43758.5453))
          addDot(palette[hash % palette.length], x, y, 3.8)
        }
      }
    }
    // roof over the back half of the stand
    const r0 = total * 0.55
    shapes.push({ d: rectPoly([map(side, s0, r0), map(side, s1, r0), map(side, s1, total + 8), map(side, s0, total + 8)]), fill: roofCol, stroke: accent, sw: 2, opacity: 0.55 })
    // hoarding strip
    for (let s = s0; s < s1; s += 60) shapes.push({ d: rectPoly([map(side, s, -H), map(side, Math.min(s + 54, s1), -H), map(side, Math.min(s + 54, s1), -H + 7), map(side, s, -H + 7)]), fill: ['#FFFFFF', accent, main][(s / 60) % 3 | 0], opacity: 0.8 })
  })

  // extra features
  if (sp.masts) {
    const pts: [number, number][] = []
    for (let i = 1; i <= 4; i++) pts.push(map('top', (PL * i) / 5, ext.top - 4), map('bottom', (PL * i) / 5, ext.bottom - 4))
    for (let i = 1; i <= 2; i++) pts.push(map('left', (PW * i) / 3, ext.left - 4), map('right', (PW * i) / 3, ext.right - 4))
    for (const [x, y] of pts) {
      shapes.push({ d: dot(x, y, 7), fill: '#FFFFFF', stroke: main, sw: 2.5 })
      shapes.push({ d: dot(x, y, 2.5), fill: main })
    }
    for (const k of ['top', 'bottom'] as const) ext[k] += 8
    for (const k of ['left', 'right'] as const) ext[k] += 8
  }
  if (sp.top.brick) {
    // Craven Cottage pavilion and the gable of the brick stand
    const g = D(sp.top)
    shapes.push({ d: rectPoly([map('top', -40, 0), map('top', 28, 0), map('top', 28, g + 6), map('top', -40, g + 6)]), fill: '#8C3B2E', stroke: '#FFFFFF', sw: 1.5 })
    shapes.push({ d: rectPoly([map('top', PL / 2 - 70, g + 6), map('top', PL / 2 + 70, g + 6), map('top', PL / 2, g + 24)]), fill: '#8C3B2E', stroke: '#FFFFFF', sw: 1.5 })
    ext.top += 14
  }

  // crowd dots, one path per colour
  for (const [fill, d] of Object.entries(dotsBy)) shapes.push({ d, fill, opacity: 0.85 })

  bg.d = rectPoly([[-ext.left, -ext.top], [PL + ext.right, -ext.top], [PL + ext.right, PW + ext.bottom], [-ext.left, PW + ext.bottom]])
  return { shapes, ext }
}
