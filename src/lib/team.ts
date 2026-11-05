import { FORMATIONS, kitColours, squadFor, surname, type KitName, type Player, type Pos } from './data'
import { defaultPattern, type Pattern } from './kit'

export type Slot = { role: string; pos: Pos; u: number; v: number; pi: number | null }
export type TeamState = { club: string; formation: string; kit: KitName; colour: string; colour2: string; pattern: Pattern; slots: Slot[]; bench: number[]; captain: number | null }
export const BENCH_MAX = 9 // Premier League: nine named substitutes

export function autoFill(club: string, formation: string): Slot[] {
  const squad = squadFor(club)
  const used = new Set<number>()
  return FORMATIONS[formation].map((f) => {
    const idx = squad.findIndex((p, i) => p.pos === f.pos && !used.has(i))
    if (idx >= 0) used.add(idx)
    return { role: f.role, pos: f.pos, u: f.u, v: f.v, pi: idx >= 0 ? idx : null }
  })
}

export function defaultBench(squadLen: number, squad: Player[], slots: Slot[]): number[] {
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

/** A player can be in the XI once and on the bench once, never both. Applied to every change to a team. */
export function normalise(t: TeamState): TeamState {
  const seen = new Set<number>()
  const slots = t.slots.map((sl) => {
    if (sl.pi == null) return sl
    if (seen.has(sl.pi)) return { ...sl, pi: null }
    seen.add(sl.pi)
    return sl
  })
  const bench = [...new Set(t.bench)].filter((i) => !seen.has(i)).slice(0, BENCH_MAX)
  return { ...t, slots, bench, captain: t.captain != null && seen.has(t.captain) ? t.captain : null }
}

export function makeTeam(club: string, formation: string): TeamState {
  const slots = autoFill(club, formation)
  const squad = squadFor(club)
  const [colour, colour2] = kitColours(club, 'home')!
  return { club, formation, kit: 'home', colour, colour2, pattern: defaultPattern(club, 'home'), slots, bench: defaultBench(squad.length, squad, slots), captain: null }
}


/** "12 Darlow · 6 Martinez · ..." sorted by shirt number (players without a number come last). */
export function benchText(t: TeamState, sq: Player[]): string {
  return t.bench
    .map((i) => sq[i])
    .filter((p): p is Player => !!p)
    .sort((a, b) => (a.num ?? 999) - (b.num ?? 999))
    .map((p) => (p.num != null ? `${p.num} ${surname(p.name)}` : surname(p.name)))
    .join(' · ')
}
