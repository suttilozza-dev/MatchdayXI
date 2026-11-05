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
export const DEFAULT_GROUND: Spec = { ground: 'MatchdayXI Stadium', capacity: 5000, top: S(2, 1, 'flat'), bottom: S(1, 0.6, 'flat'), left: S(1, 0.6, 'none'), right: S(1, 0.6, 'none'), corners: NONE, seats: ['#1E6B4D', '#C8FF3D'], notes: 'A small ground in the site colours.' }

const H = 10 // hoarding strip next to the pitch
const TU = 42 // depth of one tier, before the side's own depth factor
const PL = 1050
const PW = 680
const rectPoly = (pts: [number, number][]) => `M${pts.map((p) => p.join(',')).join('L')}Z`
const dot = (cx: number, cy: number, r: number) => `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`
const rr = (x0: number, y0: number, x1: number, y1: number, r: number) => `M${x0 + r},${y0}H${x1 - r}A${r},${r} 0 0 1 ${x1},${y0 + r}V${y1 - r}A${r},${r} 0 0 1 ${x1 - r},${y1}H${x0 + r}A${r},${r} 0 0 1 ${x0},${y1 - r}V${y0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`
const rrRev = (x0: number, y0: number, x1: number, y1: number, r: number) => `M${x0 + r},${y0}A${r},${r} 0 0 0 ${x0},${y0 + r}V${y1 - r}A${r},${r} 0 0 0 ${x0 + r},${y1}H${x1 - r}A${r},${r} 0 0 0 ${x1},${y1 - r}V${y0 + r}A${r},${r} 0 0 0 ${x1 - r},${y0}Z`

export type Surround = { shapes: Shape[]; ext: { left: number; right: number; top: number; bottom: number } }

const ROOF_FILL: Record<Roof, { fill: string; op: number; line: string }> = {
  none: { fill: '#0A1020', op: 0, line: '#F5F7FF' },
  flat: { fill: '#1B2644', op: 0.92, line: '#A9B4D0' },
  truss: { fill: '#CFD6E8', op: 0.28, line: '#F5F7FF' },
  glass: { fill: '#6FB7E8', op: 0.3, line: '#C8E6FA' },
  solar: { fill: '#1D3A7A', op: 0.9, line: '#7FA2E8' },
}

/** Build the surround for a ground spec. `main` and `trim` are only used when the spec has no seat colours. */
export function groundSurround(sp: Spec, main: string, trim: string): Surround {
  const seatDefault = sp.seats ?? [main, trim]
  const shapes: Shape[] = []
  const ext = { left: H, right: H, top: H, bottom: H }
  const D = (sd: Side) => sd.t * TU * (sd.depth ?? 1)
  const sides = { top: sp.top, bottom: sp.bottom, left: sp.left, right: sp.right }
  const map = (side: 'top' | 'bottom' | 'left' | 'right', s: number, d: number): [number, number] =>
    side === 'top' ? [s, -(H + d)] : side === 'bottom' ? [s, PW + H + d] : side === 'left' ? [-(H + d), s] : [PL + H + d, s]

  const bg: Shape = { d: '', fill: '#070B18' }
  shapes.push(bg)

  if (sp.ring) {
    // ---- continuous bowl: tiers as rounded rings, then one roof ring over the back half ----
    const dT = D(sp.top), dB = D(sp.bottom), dL = D(sp.left), dR = D(sp.right)
    const T = Math.max(sp.top.t, sp.bottom.t, sp.left.t, sp.right.t, 1)
    const box = (f: number, grow = 0): [number, number, number, number] => [-(H + dL * f + grow), -(H + dT * f + grow), PL + H + dR * f + grow, PW + H + dB * f + grow]
    const rad = (f: number) => 40 + 70 * f
    for (let k = 0; k < T; k++) {
      const a = box(k / T), b = box((k + 1) / T - 0.012)
      shapes.push({ d: rr(b[0], b[1], b[2], b[3], rad((k + 1) / T)) + rrRev(a[0], a[1], a[2], a[3], rad(k / T)), fill: seatDefault[0], opacity: k % 2 ? 0.78 : 1 })
      shapes.push({ d: rr(b[0], b[1], b[2], b[3], rad((k + 1) / T)) + rrRev(b[0] + 1.5, b[1] + 1.5, b[2] - 1.5, b[3] - 1.5, rad((k + 1) / T)), fill: seatDefault[1], opacity: 0.4 })
    }
    // seat rows as fine lines
    let rows = ''
    for (let f = 0.12; f < 1; f += 0.12) {
      const b = box(f)
      rows += rr(b[0], b[1], b[2], b[3], rad(f))
    }
    shapes.push({ d: rows, stroke: '#F5F7FF', sw: 1, opacity: 0.1 })
    // roof ring
    const inner = box(0.42), outer = box(1, 6)
    const R = sp.ring.colour
    shapes.push({ d: rr(outer[0], outer[1], outer[2], outer[3], rad(1) + 6) + rrRev(inner[0], inner[1], inner[2], inner[3], rad(0.42)), fill: R, opacity: 0.9 })
    // roof lines
    let ln = ''
    const step = sp.ring.style === 'truss' ? 70 : 46
    for (let s = 60; s < PL - 40; s += step) {
      ln += `M${s},${inner[1]}L${s},${outer[1]}M${s},${inner[3]}L${s},${outer[3]}`
    }
    for (let s = 70; s < PW - 40; s += step) {
      ln += `M${inner[0]},${s}L${outer[0]},${s}M${inner[2]},${s}L${outer[2]},${s}`
    }
    ln += `M${inner[0] + 30},${inner[1] + 30}L${outer[0] + 10},${outer[1] + 10}M${inner[2] - 30},${inner[1] + 30}L${outer[2] - 10},${outer[1] + 10}M${inner[0] + 30},${inner[3] - 30}L${outer[0] + 10},${outer[3] - 10}M${inner[2] - 30},${inner[3] - 30}L${outer[2] - 10},${outer[3] - 10}`
    shapes.push({ d: ln, stroke: '#0A1020', sw: 1.4, opacity: sp.ring.style === 'truss' ? 0.45 : 0.28 })
    if (sp.ring.style === 'truss') {
      // cross braces along the long sides, like Emirates and the Stadium of Light
      let x = ''
      for (let s = 60; s < PL - 110; s += 70) {
        x += `M${s},${inner[1]}L${s + 70},${outer[1]}M${s + 70},${inner[1]}L${s},${outer[1]}M${s},${inner[3]}L${s + 70},${outer[3]}M${s + 70},${inner[3]}L${s},${outer[3]}`
      }
      shapes.push({ d: x, stroke: '#0A1020', sw: 1, opacity: 0.25 })
    }
    if (sp.ring.style === 'arches') {
      // two white steel arches along the long sides
      const ay = (y: number, dir: number) => `M${40},${y}Q${PL / 2},${y + dir * 120} ${PL - 40},${y}`
      shapes.push({ d: ay(inner[1] - 4, -1), stroke: '#FFFFFF', sw: 5, opacity: 0.95 })
      shapes.push({ d: ay(inner[3] + 4, 1), stroke: '#FFFFFF', sw: 5, opacity: 0.95 })
    }
    // outer rim highlight
    shapes.push({ d: rr(outer[0], outer[1], outer[2], outer[3], rad(1) + 6), stroke: '#F5F7FF', sw: 2, opacity: 0.5 })
    // masts and towers
    if (sp.ring.masts) {
      const pts: [number, number][] = []
      const n = sp.ring.masts
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n
        const per = 2 * ((outer[2] - outer[0]) + (outer[3] - outer[1]))
        let p = u * per
        const w = outer[2] - outer[0], h = outer[3] - outer[1]
        if (p < w) pts.push([outer[0] + p, outer[1] - 10])
        else if ((p -= w) < h) pts.push([outer[2] + 10, outer[1] + p])
        else if ((p -= h) < w) pts.push([outer[2] - p, outer[3] + 10])
        else pts.push([outer[0] - 10, outer[3] - (p - w - h)])
      }
      for (const [x, y] of pts) {
        shapes.push({ d: dot(x, y, 6), fill: '#F5F7FF', stroke: '#0A1020', sw: 2 })
      }
      for (const k of ['left', 'right', 'top', 'bottom'] as const) ext[k] += 14
    }
    if (sp.ring.towers) {
      const w = outer[2] - outer[0]
      for (let i = 0; i < 4; i++) {
        const x = outer[0] + w * (0.18 + i * 0.213)
        shapes.push({ d: dot(x, outer[3] + 18, 20), fill: '#8FB8D8', stroke: '#F5F7FF', sw: 2.5 })
        shapes.push({ d: dot(x, outer[3] + 18, 10), fill: '#F5F7FF', opacity: 0.8 })
      }
      ext.bottom += 30
    }
    ext.left += dL + 12
    ext.right += dR + 12
    ext.top += dT + 12
    ext.bottom += dB + 12
    bg.d = rectPoly([[-ext.left, -ext.top], [PL + ext.right, -ext.top], [PL + ext.right, PW + ext.bottom], [-ext.left, PW + ext.bottom]])
    return { shapes, ext }
  }

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
    const along = (d: number) => [map(side, s0, d), map(side, s1, d)] as const
    for (let k = 0; k < sd.t; k++) {
      const d0 = k * TU * (sd.depth ?? 1)
      const d1 = (k + 1) * TU * (sd.depth ?? 1) - 2
      shapes.push({ d: rectPoly([map(side, s0, d0), map(side, s1, d0), map(side, s1, d1), map(side, s0, d1)]), fill: sd.brick && k === 0 ? '#8C3B2E' : seat, opacity: k % 2 ? 0.78 : 1 })
      shapes.push({ d: rectPoly([map(side, s0, d1), map(side, s1, d1), map(side, s1, d1 + 1.6), map(side, s0, d1 + 1.6)]), fill: accent, opacity: 0.45 })
    }
    // seat rows and aisles
    let rows = ''
    for (let f = 0.18; f < 1; f += 0.2) {
      const [a, b] = along(total * f)
      rows += `M${a[0]},${a[1]}L${b[0]},${b[1]}`
    }
    for (let s = s0 + 90; s < s1 - 40; s += 130) {
      const a = map(side, s, 0), b = map(side, s, total)
      rows += `M${a[0]},${a[1]}L${b[0]},${b[1]}`
    }
    shapes.push({ d: rows, stroke: '#F5F7FF', sw: 1, opacity: 0.1 })

    // roof over the back of the stand
    const roof = ROOF_FILL[sd.roof ?? 'flat']
    if (roof.op > 0) {
      const r0 = total * 0.5, r1 = total + 8
      shapes.push({ d: rectPoly([map(side, s0, r0), map(side, s1, r0), map(side, s1, r1), map(side, s0, r1)]), fill: roof.fill, opacity: roof.op })
      shapes.push({ d: rectPoly([map(side, s0, r0), map(side, s1, r0), map(side, s1, r0 + 1.6), map(side, s0, r0 + 1.6)]), fill: roof.line, opacity: 0.55 })
      let tr = ''
      const gap = sd.roof === 'truss' ? 36 : sd.roof === 'solar' ? 22 : 90
      for (let s = s0 + gap; s < s1; s += gap) {
        const a = map(side, s, r0), b = map(side, s, r1)
        tr += `M${a[0]},${a[1]}L${b[0]},${b[1]}`
        if (sd.roof === 'truss') {
          const c = map(side, s + gap, r1)
          tr += `M${a[0]},${a[1]}L${c[0]},${c[1]}`
        }
      }
      shapes.push({ d: tr, stroke: roof.line, sw: 1.2, opacity: sd.roof === 'flat' ? 0.22 : 0.5 })
    }

    // hoarding strip
    for (let s = s0; s < s1; s += 60) shapes.push({ d: rectPoly([map(side, s, -H), map(side, Math.min(s + 54, s1), -H), map(side, Math.min(s + 54, s1), -H + 6), map(side, s, -H + 6)]), fill: ['#F5F7FF', accent, seat][(s / 60) % 3 | 0], opacity: 0.55 })
  })

  // empty ends still get a hoarding strip
  for (const side of ['left', 'right'] as const) {
    if (sides[side].t > 0) continue
    for (let s = 0; s < PW; s += 60) shapes.push({ d: rectPoly([map(side, s, -H), map(side, Math.min(s + 54, PW), -H), map(side, Math.min(s + 54, PW), -H + 6), map(side, s, -H + 6)]), fill: '#F5F7FF', opacity: 0.35 })
  }

  // extra features
  if (sp.top.brick || sp.right.brick) {
    const side = sp.top.brick ? 'top' : 'right'
    const g = D(sp[side])
    const mid = side === 'top' ? PL / 2 : PW / 2
    shapes.push({ d: rectPoly([map(side, mid - 70, g + 8), map(side, mid + 70, g + 8), map(side, mid, g + 28)]), fill: '#8C3B2E', stroke: '#F5F7FF', sw: 1.5 })
    ext[side] += 20
  }
  // floodlight masts at the four corners
  const masts: [number, number][] = [
    [-(H + 4), -(H + 4)],
    [PL + H + 4, -(H + 4)],
    [-(H + 4), PW + H + 4],
    [PL + H + 4, PW + H + 4],
  ]
  for (const [x, y] of masts) {
    const px = x < 0 ? -(H + D(sp.left) * 0.4 + 18) : PL + H + D(sp.right) * 0.4 + 18
    const py = y < 0 ? -(H + D(sp.top) * 0.4 + 18) : PW + H + D(sp.bottom) * 0.4 + 18
    shapes.push({ d: dot(px, py, 5), fill: '#F5F7FF', opacity: 0.9 })
    shapes.push({ d: dot(px, py, 14), fill: '#FFE9A8', opacity: 0.12 })
  }

  bg.d = rectPoly([[-ext.left, -ext.top], [PL + ext.right, -ext.top], [PL + ext.right, PW + ext.bottom], [-ext.left, PW + ext.bottom]])
  return { shapes, ext }
}

export function clubSurround(club: string, kit: KitName = 'home'): Surround | null {
  const sp = CLUB_GROUNDS[club]
  if (!sp) return null
  const [main, trim] = kitColours(club, kit) ?? kitColours(club, 'home')!
  return groundSurround(sp, main, trim)
}
