import { kitColours, type KitName } from './data'
import type { Shape } from './stadium'

/**
 * Stylised "Floodlit" club grounds: smooth stands in each club's colours with proper roofs, no crowd dots.
 * Drawn from public facts and aerial photos (number of stands and tiers, roof type, ring roofs, masts, open corners).
 * They are original vector drawings, not traced from any photograph, and not to scale.
 */
export type Roof = 'none' | 'flat' | 'truss' | 'glass' | 'solar'
type Side = { t: number; depth?: number; seats?: [string, string]; roof?: Roof; brick?: boolean }
export type RingStyle = 'truss' | 'panels' | 'arches'
export type Spec = {
  ground: string
  capacity: number
  top: Side
  bottom: Side
  left: Side
  right: Side
  /** [top-left, top-right, bottom-left, bottom-right] corners filled in */
  corners: [boolean, boolean, boolean, boolean]
  /** one continuous roof ring over the whole bowl */
  ring?: { style: RingStyle; colour: string; masts?: number; towers?: boolean }
  seats?: [string, string]
  notes: string
}

const S = (t: number, depth = 1, roof: Roof = 'flat', extra: Partial<Side> = {}): Side => ({ t, depth, roof, ...extra })
const ALL = [true, true, true, true] as [boolean, boolean, boolean, boolean]
const NONE = [false, false, false, false] as [boolean, boolean, boolean, boolean]
const NO = S(0, 1, 'none')

export const CLUB_GROUNDS: Record<string, Spec> = {
  Arsenal: { ground: 'Emirates Stadium', capacity: 60704, top: S(3), bottom: S(3), left: S(3), right: S(3), corners: ALL, ring: { style: 'truss', colour: '#E8ECF8' }, seats: ['#E3202B', '#8E1020'], notes: 'Oval bowl under one white cross-braced truss roof ring with an open centre; red seats.' },
  'Aston Villa': { ground: 'Villa Park', capacity: 43205, top: S(3, 1.15, 'truss'), bottom: S(2, 1, 'flat'), left: S(2, 1, 'truss'), right: S(2, 1, 'flat'), corners: [false, true, true, false], seats: ['#7A1D3C', '#A9CCEE'], notes: 'Four separate stands: huge three-tier Trinity Road Stand, white-truss Holte End, flat-roofed Doug Ellis Stand; claret and sky blue seats.' },
  Bournemouth: { ground: 'Vitality Stadium', capacity: 12357, top: S(1, 0.8, 'flat'), bottom: S(1, 1, 'truss'), left: NO, right: S(1, 0.8, 'flat'), corners: NONE, seats: ['#D9242B', '#14130F'], notes: 'Compact ground with a big grey-roofed main stand, a low white-roofed side and one open end.' },
  Brentford: { ground: 'Gtech Community Stadium', capacity: 17250, top: S(2, 0.85, 'flat'), bottom: S(2, 0.9, 'truss'), left: S(1, 0.9, 'flat'), right: S(1, 1, 'solar'), corners: [false, true, false, false], seats: ['#D9232A', '#F4F6FB'], notes: 'Angular four-stand ground with faceted metal roofs, solar panels on one stand and red seats.' },
  'Brighton and Hove Albion': { ground: 'American Express Stadium', capacity: 32500, top: S(3), bottom: S(3), left: S(1, 0.8), right: S(1, 0.8), corners: ALL, ring: { style: 'arches', colour: '#2F6FD6' }, seats: ['#1757C2', '#F4F6FB'], notes: 'Oval bowl under a blue roof with two white steel arches along the long sides; blue seats.' },
  Chelsea: { ground: 'Stamford Bridge', capacity: 40044, top: S(3, 1.05, 'glass'), bottom: S(3, 1.05, 'truss'), left: S(2, 0.85, 'flat'), right: S(2, 0.7, 'flat'), corners: NONE, seats: ['#2252D6', '#E6C21E'], notes: 'Four separate stands: glass-roofed three-tier West Stand, three-tier East, two-tier Matthew Harding and small Shed End; blue seats.' },
  'Coventry City': { ground: 'Coventry Building Society Arena', capacity: 32609, top: S(2), bottom: S(1, 1.2), left: S(1, 1.2), right: S(1, 1.2), corners: ALL, ring: { style: 'panels', colour: '#DCE3F2', masts: 10 }, seats: ['#2E9BDB', '#14213F'], notes: 'Rounded bowl with a continuous white roof ring hung from white masts; blue seats.' },
  'Crystal Palace': { ground: 'Selhurst Park', capacity: 25194, top: S(2, 1, 'truss'), bottom: S(1, 0.8, 'flat'), left: S(1, 0.7, 'flat'), right: S(2, 1, 'flat'), corners: NONE, seats: ['#1B4FD0', '#E21E3C'], notes: 'Four separate stands: two-tier Holmesdale with curved roof, small Main Stand, small Whitehorse Lane and Arthur Wait.' },
  Everton: { ground: 'Hill Dickinson Stadium', capacity: 52769, top: S(3), bottom: S(3), left: S(2), right: S(3, 1.1), corners: ALL, ring: { style: 'panels', colour: '#CDD3E0' }, seats: ['#1B3FBF', '#F4F6FB'], notes: 'Oval dockside bowl under one curved silver roof with an open centre; blue seats.' },
  Fulham: { ground: 'Craven Cottage', capacity: 28107, top: S(2, 0.9, 'glass', { brick: true }), bottom: S(2, 0.9, 'flat'), left: S(1, 0.8, 'flat'), right: S(1, 0.8, 'truss', { brick: true }), corners: NONE, seats: ['#14130F', '#F4F6FB'], notes: 'Four separate stands beside the Thames: glass-roofed Riverside, brick Johnny Haynes Stand with its gable, and the Cottage pavilion.' },
  'Hull City': { ground: 'MKM Stadium', capacity: 25586, top: S(1), bottom: S(2), left: S(1), right: S(1), corners: ALL, ring: { style: 'panels', colour: '#E4E8F2' }, seats: ['#14130F', '#F6A623'], notes: 'Low oval bowl under a continuous white roof ring; black seats with an amber band.' },
  'Ipswich Town': { ground: 'Portman Road', capacity: 30056, top: S(3, 1, 'flat'), bottom: S(2, 1, 'flat'), left: S(2, 1, 'truss'), right: S(2, 1, 'truss'), corners: NONE, seats: ['#1D3FA8', '#F4F6FB'], notes: 'Four covered stands with dark roofs and white-lattice ends; blue seats.' },
  'Leeds United': { ground: 'Elland Road', capacity: 37633, top: S(2, 1.2, 'truss', { seats: ['#F4E21B', '#F6F6F2'] }), bottom: S(2, 1, 'flat'), left: S(2, 0.9, 'truss'), right: S(2, 0.75, 'flat'), corners: ALL, seats: ['#1D428A', '#F5D327'], notes: 'Four stands joined by corner stands; the East Stand has a big cantilever roof and yellow seats.' },
  Liverpool: { ground: 'Anfield', capacity: 61276, top: S(3, 1.05, 'flat'), bottom: S(2, 1, 'truss'), left: S(2, 1, 'truss'), right: S(1, 2.2, 'solar'), corners: [false, true, true, false], seats: ['#C8102E', '#F4F6FB'], notes: 'Separate roofed stands: three-tier Main Stand, Kenny Dalglish Stand, Anfield Road End and the Kop; red seats.' },
  'Manchester City': { ground: 'Etihad Stadium', capacity: 61038, top: S(3), bottom: S(3), left: S(3), right: S(3), corners: ALL, ring: { style: 'panels', colour: '#C5CCDB', masts: 6, towers: true }, seats: ['#6CABDD', '#F4F6FB'], notes: 'Oval bowl under a grey roof ring hung from masts, with round towers at the front; sky blue seats.' },
  'Manchester United': { ground: 'Old Trafford', capacity: 74158, top: S(3, 1.2, 'truss'), bottom: S(1, 1.9, 'truss'), left: S(2, 1.1, 'truss'), right: S(2, 1.1, 'truss'), corners: NONE, seats: ['#DA1F26', '#F4F6FB'], notes: 'Large rectangular bowl of four stands under white cantilever truss roofs; red seats.' },
  'Newcastle United': { ground: "St James' Park", capacity: 52719, top: S(3, 1.1, 'truss'), bottom: S(1, 1.1, 'flat'), left: S(3, 1.1, 'truss'), right: S(2, 1, 'flat'), corners: ALL, seats: ['#2B2B2B', '#F4F4F4'], notes: 'Asymmetric bowl: two huge white-lattice ends, rounded Milburn Stand and a lower East Stand; black and white seats.' },
  'Nottingham Forest': { ground: 'City Ground', capacity: 31212, top: S(2, 1, 'flat'), bottom: S(2, 0.9, 'flat'), left: S(2, 0.9, 'truss'), right: S(2, 1, 'flat'), corners: [false, false, true, false], seats: ['#D01D26', '#F4F6FB'], notes: 'Separate stands beside the River Trent: lattice-roofed Brian Clough Stand, flat-roofed Trent End and side stands; red seats.' },
  Sunderland: { ground: 'Stadium of Light', capacity: 49000, top: S(2), bottom: S(2), left: S(2), right: S(2), corners: ALL, ring: { style: 'truss', colour: '#F0F2F8' }, seats: ['#D9232A', '#F4F6FB'], notes: 'Rounded bowl under one white truss roof ring with a rounded corner; red seats.' },
  'Tottenham Hotspur': { ground: 'Tottenham Hotspur Stadium', capacity: 62850, top: S(4), bottom: S(4), left: S(1, 2.4), right: S(3, 1.1), corners: ALL, ring: { style: 'panels', colour: '#B8C0D2' }, seats: ['#132257', '#F4F4F4'], notes: 'Oval bowl under a silver roof with radial panels and a glass ring; dark navy seats.' },
}

/** The default MatchdayXI ground: a small stand and shelter in the site colours. */
export const DEFAULT_GROUND: Spec = { ground: 'MatchdayXI Stadium', capacity: 5000, top: S(2, 1, 'flat'), bottom: S(1, 0.6, 'flat'), left: S(1, 0.6, 'none'), right: S(1, 0.6, 'none'), corners: NONE, seats: ['#1E3A6B', '#19E6D1'], notes: 'A small ground in the site colours.' }

const H = 10 // hoarding strip next to the pitch
const TU = 46 // depth of one tier, before the side's own depth factor
const PL = 1050
const PW = 680
const rectPoly = (pts: [number, number][]) => `M${pts.map((p) => p.join(',')).join('L')}Z`
const rr = (x0: number, y0: number, x1: number, y1: number, r: number) => `M${x0 + r},${y0}H${x1 - r}A${r},${r} 0 0 1 ${x1},${y0 + r}V${y1 - r}A${r},${r} 0 0 1 ${x1 - r},${y1}H${x0 + r}A${r},${r} 0 0 1 ${x0},${y1 - r}V${y0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`
const rrRev = (x0: number, y0: number, x1: number, y1: number, r: number) => `M${x0 + r},${y0}A${r},${r} 0 0 0 ${x0},${y0 + r}V${y1 - r}A${r},${r} 0 0 0 ${x0 + r},${y1}H${x1 - r}A${r},${r} 0 0 0 ${x1},${y1 - r}V${y0 + r}A${r},${r} 0 0 0 ${x1 - r},${y0}Z`

export type Surround = { shapes: Shape[]; ext: { left: number; right: number; top: number; bottom: number } }

const ROOF_FILL: Record<Roof, { fill: string; op: number; line: string; cover: number }> = {
  none: { fill: '#0A1020', op: 0, line: '#F5F7FF', cover: 0 },
  flat: { fill: '#3C4A78', op: 1, line: '#C4CCE4', cover: 0.5 },
  truss: { fill: '#C9D0E4', op: 1, line: '#7C86A6', cover: 0.55 },
  glass: { fill: '#8CC6EE', op: 0.9, line: '#E4F3FD', cover: 0.5 },
  solar: { fill: '#22408A', op: 0.97, line: '#7FA2E8', cover: 0.5 },
}

const r1 = (n: number) => Math.round(n * 10) / 10
const hash = (x: number, y: number) => {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return v - Math.floor(v)
}
const smallDot = (x: number, y: number, r: number) => `M${r1(x - r)},${r1(y)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`

/** Crowd spots: many small dots in the club's colours. Only used on seating with no roof over it. */
class Crowd {
  private by: Record<string, string> = {}
  constructor(private palette: string[]) {}
  add(x: number, y: number) {
    const h = hash(x, y)
    if (h < 0.07) return // an empty seat
    const h2 = hash(y, x)
    const c = this.palette[Math.floor(h2 * this.palette.length) % this.palette.length]
    this.by[c] = (this.by[c] ?? '') + smallDot(x + (h - 0.5) * 1.2, y + (h2 - 0.5) * 1.2, 1.9)
  }
  shapes(): Shape[] {
    return Object.entries(this.by).map(([fill, d]) => ({ d, fill, opacity: 0.92 }))
  }
}

const inRR = (x: number, y: number, b: [number, number, number, number], r: number) => {
  if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return false
  const cx = x < b[0] + r ? b[0] + r : x > b[2] - r ? b[2] - r : x
  const cy = y < b[1] + r ? b[1] + r : y > b[3] - r ? b[3] - r : y
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}

const APRON = 110 // room for the outside of the ground: concourse, road, trees and car parks

/** Outside the stands: a lighter apron, a road with a centre line, trees and a few parked cars. */
function apron(ext: { left: number; right: number; top: number; bottom: number }): Shape[] {
  const out: Shape[] = []
  const x0 = -ext.left, y0 = -ext.top, x1 = PL + ext.right, y1 = PW + ext.bottom
  out.push({ d: rectPoly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), fill: '#0D1630' })
  // road ring
  const m = 26
  out.push({ d: rr(x0 + m, y0 + m, x1 - m, y1 - m, 46), stroke: '#18234A', sw: 18 })
  out.push({ d: rr(x0 + m, y0 + m, x1 - m, y1 - m, 46), stroke: '#F5F7FF', sw: 1.2, opacity: 0.18 })
  // trees in the corners and along the outer edge
  let trees = ''
  let treesLight = ''
  const spots: [number, number][] = []
  for (let i = 0; i < 34; i++) {
    const t = i / 34
    const per = 2 * ((x1 - x0) + (y1 - y0))
    let p = t * per + hash(i, 3) * 40
    const w = x1 - x0, h = y1 - y0
    let px: number, py: number
    const off = 4 + hash(i, 9) * 14
    if (p < w) { px = x0 + p; py = y0 + off }
    else if ((p -= w) < h) { px = x1 - off; py = y0 + p }
    else if ((p -= h) < w) { px = x1 - p; py = y1 - off }
    else { px = x0 + off; py = y1 - (p - w - h) }
    spots.push([px, py])
  }
  for (const [px, py] of spots) {
    const r = 6 + hash(px, py) * 7
    trees += smallDot(px, py, r)
    treesLight += smallDot(px - 1.5, py - 1.5, r * 0.55)
  }
  out.push({ d: trees, fill: '#123A2E', opacity: 0.95 })
  out.push({ d: treesLight, fill: '#1E5A44', opacity: 0.8 })
  // parked cars in the bottom corners
  let cars = ''
  for (let i = 0; i < 18; i++) {
    const cx = x0 + 52 + (i % 9) * 11
    const cy = y1 - 62 + Math.floor(i / 9) * 14
    cars += `M${cx},${cy}h7v11h-7Z`
  }
  out.push({ d: cars, fill: '#A9B4D0', opacity: 0.35 })
  return out
}

/** Build the surround for a ground spec. `main` and `trim` are only used when the spec has no seat colours. */
export function groundSurround(sp: Spec, main: string, trim: string): Surround {
  const seatDefault = sp.seats ?? [main, trim]
  const shapes: Shape[] = []
  const ext = { left: H, right: H, top: H, bottom: H }
  const D = (sd: Side) => (sd.t > 0 ? Math.max(74, sd.t * TU * (sd.depth ?? 1)) : 0)
  const sides = { top: sp.top, bottom: sp.bottom, left: sp.left, right: sp.right }
  const map = (side: 'top' | 'bottom' | 'left' | 'right', s: number, d: number): [number, number] =>
    side === 'top' ? [s, -(H + d)] : side === 'bottom' ? [s, PW + H + d] : side === 'left' ? [-(H + d), s] : [PL + H + d, s]

  const bg: Shape = { d: '', fill: '#070B18' }
  shapes.push(bg)
  const crowd = new Crowd([seatDefault[1], seatDefault[1], '#F5F7FF', '#F5F7FF', '#A9B4D0', seatDefault[0], '#0A1020'])
  const body: Shape[] = []
  const roofs: Shape[] = []

  if (sp.ring) {
    // ---- continuous bowl: tiers as rounded rings, crowd on the exposed inner part, one roof ring over the back ----
    const dT = D(sp.top), dB = D(sp.bottom), dL = D(sp.left), dR = D(sp.right)
    const T = Math.max(sp.top.t, sp.bottom.t, sp.left.t, sp.right.t, 1)
    const box = (f: number, grow = 0): [number, number, number, number] => [-(H + dL * f + grow), -(H + dT * f + grow), PL + H + dR * f + grow, PW + H + dB * f + grow]
    const rad = (f: number) => 40 + 70 * f
    for (let k = 0; k < T; k++) {
      const a = box(k / T), b = box((k + 1) / T - 0.012)
      body.push({ d: rr(b[0], b[1], b[2], b[3], rad((k + 1) / T)) + rrRev(a[0], a[1], a[2], a[3], rad(k / T)), fill: seatDefault[0], opacity: k % 2 ? 0.7 : 0.9 })
    }
    // crowd on the part of the bowl the roof does not cover
    const cov = 0.5
    const inner = box(cov), outerBox = box(1, 6), pit = box(0)
    for (let y = inner[1]; y < inner[3] + 1; y += 5.2) {
      for (let x = inner[0] + ((Math.round(y / 5.2) % 2) * 2.6); x < inner[2]; x += 5.2) {
        if (inRR(x, y, inner, rad(cov)) && !(x > pit[0] + 2 && x < pit[2] - 2 && y > pit[1] + 2 && y < pit[3] - 2)) crowd.add(x, y)
      }
    }
    // roof ring
    const R = sp.ring.colour
    roofs.push({ d: rr(inner[0] - 5, inner[1] - 5, inner[2] + 5, inner[3] + 5, rad(cov) + 5) + rrRev(inner[0], inner[1], inner[2], inner[3], rad(cov)), fill: '#000000', opacity: 0.4 })
    roofs.push({ d: rr(outerBox[0], outerBox[1], outerBox[2], outerBox[3], rad(1) + 6) + rrRev(inner[0], inner[1], inner[2], inner[3], rad(cov)), fill: R, opacity: 0.97 })
    let ln = ''
    const step = sp.ring.style === 'truss' ? 66 : 42
    for (let s = 60; s < PL - 40; s += step) ln += `M${s},${inner[1]}L${s},${outerBox[1]}M${s},${inner[3]}L${s},${outerBox[3]}`
    for (let s = 70; s < PW - 40; s += step) ln += `M${inner[0]},${s}L${outerBox[0]},${s}M${inner[2]},${s}L${outerBox[2]},${s}`
    ln += `M${inner[0] + 26},${inner[1] + 26}L${outerBox[0] + 10},${outerBox[1] + 10}M${inner[2] - 26},${inner[1] + 26}L${outerBox[2] - 10},${outerBox[1] + 10}M${inner[0] + 26},${inner[3] - 26}L${outerBox[0] + 10},${outerBox[3] - 10}M${inner[2] - 26},${inner[3] - 26}L${outerBox[2] - 10},${outerBox[3] - 10}`
    roofs.push({ d: ln, stroke: '#0A1020', sw: 1.3, opacity: sp.ring.style === 'truss' ? 0.5 : 0.3 })
    if (sp.ring.style === 'truss') {
      let x = ''
      for (let s = 60; s < PL - 110; s += 66) x += `M${s},${inner[1]}L${s + 66},${outerBox[1]}M${s + 66},${inner[1]}L${s},${outerBox[1]}M${s},${inner[3]}L${s + 66},${outerBox[3]}M${s + 66},${inner[3]}L${s},${outerBox[3]}`
      roofs.push({ d: x, stroke: '#0A1020', sw: 1, opacity: 0.3 })
    }
    if (sp.ring.style === 'arches') {
      const ay = (y: number, dir: number) => `M${40},${y}Q${PL / 2},${y + dir * 120} ${PL - 40},${y}`
      roofs.push({ d: ay(inner[1] - 4, -1), stroke: '#FFFFFF', sw: 6, opacity: 0.95 })
      roofs.push({ d: ay(inner[3] + 4, 1), stroke: '#FFFFFF', sw: 6, opacity: 0.95 })
    }
    roofs.push({ d: rr(outerBox[0], outerBox[1], outerBox[2], outerBox[3], rad(1) + 6), stroke: '#F5F7FF', sw: 2, opacity: 0.5 })
    if (sp.ring.masts) {
      const n = sp.ring.masts
      const w = outerBox[2] - outerBox[0], h = outerBox[3] - outerBox[1]
      const per = 2 * (w + h)
      for (let i = 0; i < n; i++) {
        let p = ((i + 0.5) / n) * per
        let pt: [number, number]
        if (p < w) pt = [outerBox[0] + p, outerBox[1] - 10]
        else if ((p -= w) < h) pt = [outerBox[2] + 10, outerBox[1] + p]
        else if ((p -= h) < w) pt = [outerBox[2] - p, outerBox[3] + 10]
        else pt = [outerBox[0] - 10, outerBox[3] - (p - w - h)]
        roofs.push({ d: smallDot(pt[0], pt[1], 6), fill: '#F5F7FF', stroke: '#0A1020', sw: 2 })
      }
      for (const k of ['left', 'right', 'top', 'bottom'] as const) ext[k] += 14
    }
    if (sp.ring.towers) {
      const w = outerBox[2] - outerBox[0]
      for (let i = 0; i < 4; i++) {
        const x = outerBox[0] + w * (0.18 + i * 0.213)
        roofs.push({ d: smallDot(x, outerBox[3] + 18, 20), fill: '#8FB8D8', stroke: '#F5F7FF', sw: 2.5 })
        roofs.push({ d: smallDot(x, outerBox[3] + 18, 10), fill: '#F5F7FF', opacity: 0.8 })
      }
      ext.bottom += 30
    }
    ext.left += dL + 12
    ext.right += dR + 12
    ext.top += dT + 12
    ext.bottom += dB + 12
  } else {
    // ---- separate stands ----
    const sideSpan = (side: 'top' | 'bottom' | 'left' | 'right'): [number, number] => {
      const [tl, tr, bl, br] = sp.corners
      if (side === 'top') return [tl ? -(H + D(sp.left)) : 0, tr ? PL + H + D(sp.right) : PL]
      if (side === 'bottom') return [bl ? -(H + D(sp.left)) : 0, br ? PL + H + D(sp.right) : PL]
      return [0, PW]
    }

    ;(['top', 'bottom', 'left', 'right'] as const).forEach((side) => {
      const sd = sides[side]
      const total = D(sd)
      if (sd.t <= 0) return
      const [s0, s1] = sideSpan(side)
      const [seat, accent] = sd.seats ?? seatDefault
      ext[side] = H + total + 14
      for (let k = 0; k < sd.t; k++) {
        const d0 = (k * total) / sd.t
        const d1 = ((k + 1) * total) / sd.t - 2
        body.push({ d: rectPoly([map(side, s0, d0), map(side, s1, d0), map(side, s1, d1), map(side, s0, d1)]), fill: sd.brick && k === 0 ? '#8C3B2E' : seat, opacity: k % 2 ? 0.7 : 0.9 })
        body.push({ d: rectPoly([map(side, s0, d1), map(side, s1, d1), map(side, s1, d1 + 1.6), map(side, s0, d1 + 1.6)]), fill: accent, opacity: 0.5 })
      }
      const roof = ROOF_FILL[sd.roof ?? 'flat']
      const exposedTo = roof.op > 0 ? total * roof.cover : total
      // crowd on the exposed seating only
      for (let d = 3; d < exposedTo; d += 5.2) {
        const row = Math.round(d / 5.2)
        for (let s = s0 + 3 + (row % 2) * 2.6; s < s1 - 2; s += 5.2) {
          const [x, y] = map(side, s, d)
          crowd.add(x, y)
        }
      }
      // roof over the back of the stand, with a soft shadow on the seats below its edge
      if (roof.op > 0) {
        const r0 = exposedTo, r1_ = total + 10
        roofs.push({ d: rectPoly([map(side, s0, r0 - 7), map(side, s1, r0 - 7), map(side, s1, r0), map(side, s0, r0)]), fill: '#000000', opacity: 0.35 })
        roofs.push({ d: rectPoly([map(side, s0, r0), map(side, s1, r0), map(side, s1, r1_), map(side, s0, r1_)]), fill: roof.fill, opacity: roof.op })
        roofs.push({ d: rectPoly([map(side, s0, r0), map(side, s1, r0), map(side, s1, r0 + 2), map(side, s0, r0 + 2)]), fill: roof.line, opacity: 0.7 })
        let tr = ''
        const gap = sd.roof === 'truss' ? 30 : sd.roof === 'solar' ? 20 : 70
        for (let s = s0 + gap; s < s1; s += gap) {
          const a = map(side, s, r0), b = map(side, s, r1_)
          tr += `M${a[0]},${a[1]}L${b[0]},${b[1]}`
          if (sd.roof === 'truss') {
            const c = map(side, s + gap, r1_)
            tr += `M${a[0]},${a[1]}L${c[0]},${c[1]}`
          }
        }
        roofs.push({ d: tr, stroke: roof.line, sw: 1.2, opacity: sd.roof === 'flat' ? 0.3 : 0.6 })
      }
      for (let s = s0; s < s1; s += 60) body.push({ d: rectPoly([map(side, s, -H), map(side, Math.min(s + 54, s1), -H), map(side, Math.min(s + 54, s1), -H + 6), map(side, s, -H + 6)]), fill: ['#F5F7FF', accent, seat][(s / 60) % 3 | 0], opacity: 0.55 })
    })
    for (const side of ['left', 'right'] as const) {
      if (sides[side].t > 0) continue
      for (let s = 0; s < PW; s += 60) body.push({ d: rectPoly([map(side, s, -H), map(side, Math.min(s + 54, PW), -H), map(side, Math.min(s + 54, PW), -H + 6), map(side, s, -H + 6)]), fill: '#F5F7FF', opacity: 0.35 })
    }
    if (sp.top.brick || sp.right.brick) {
      const side = sp.top.brick ? 'top' : 'right'
      const g = D(sp[side])
      const mid = side === 'top' ? PL / 2 : PW / 2
      roofs.push({ d: rectPoly([map(side, mid - 70, g + 10), map(side, mid + 70, g + 10), map(side, mid, g + 32)]), fill: '#8C3B2E', stroke: '#F5F7FF', sw: 1.5 })
      ext[side] += 22
    }
    // low roofed blocks fill the corners that are not part of a stand
    const cornerBlocks: [boolean, number, number, number, number][] = [
      [sp.corners[0], -1, -1, D(sp.left), D(sp.top)],
      [sp.corners[1], 1, -1, D(sp.right), D(sp.top)],
      [sp.corners[2], -1, 1, D(sp.left), D(sp.bottom)],
      [sp.corners[3], 1, 1, D(sp.right), D(sp.bottom)],
    ]
    for (const [filled, sx, sy, dx, dy] of cornerBlocks) {
      if (filled || dx <= 0 || dy <= 0) continue
      const w = dx * 0.85, h = dy * 0.85
      const xa = sx < 0 ? -(H + w) : PL + H, xb = sx < 0 ? -H : PL + H + w
      const ya = sy < 0 ? -(H + h) : PW + H, yb = sy < 0 ? -H : PW + H + h
      roofs.push({ d: rectPoly([[xa, ya], [xb, ya], [xb, yb], [xa, yb]]), fill: '#232E50', opacity: 0.97 })
      roofs.push({ d: rectPoly([[xa, ya], [xb, ya], [xb, yb], [xa, yb]]), stroke: '#A9B4D0', sw: 1.2, opacity: 0.35 })
    }
    // floodlight masts at the four corners
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const px = x < 0 ? -(H + D(sp.left) * 0.5 + 22) : PL + H + D(sp.right) * 0.5 + 22
      const py = y < 0 ? -(H + D(sp.top) * 0.5 + 22) : PW + H + D(sp.bottom) * 0.5 + 22
      roofs.push({ d: smallDot(px, py, 14), fill: '#FFE9A8', opacity: 0.12 })
      roofs.push({ d: smallDot(px, py, 5), fill: '#F5F7FF', opacity: 0.95 })
    }
  }

  // room for the outside of the ground
  ext.left += APRON
  ext.right += APRON
  ext.top += APRON
  ext.bottom += APRON
  shapes.push(...apron(ext), ...body, ...crowd.shapes(), ...roofs)
  bg.d = rectPoly([[-ext.left, -ext.top], [PL + ext.right, -ext.top], [PL + ext.right, PW + ext.bottom], [-ext.left, PW + ext.bottom]])
  return { shapes, ext }
}

export function clubSurround(club: string, kit: KitName = 'home'): Surround | null {
  const sp = CLUB_GROUNDS[club]
  if (!sp) return null
  const [main, trim] = kitColours(club, kit) ?? kitColours(club, 'home')!
  return groundSurround(sp, main, trim)
}
