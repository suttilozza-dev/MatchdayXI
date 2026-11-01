import squadsJson from '../data/squads.json'

export type Pos = 'GK' | 'DEF' | 'MID' | 'FWD'
export type Player = { num: number | null; name: string; pos: Pos }

export const GAMEWEEK_DEFAULT = '10'
export const SITE_URL = 'matchday-xi.club'

type RawSquad = Record<Pos, [number | null, string][]>
const raw = (squadsJson as unknown as { clubs: Record<string, RawSquad> }).clubs

export const CLUBS: string[] = Object.keys(raw).sort((a, b) => a.localeCompare(b))

export function squadFor(club: string): Player[] {
  const sq = raw[club]
  if (!sq) return []
  const out: Player[] = []
  ;(['GK', 'DEF', 'MID', 'FWD'] as Pos[]).forEach((pos) => {
    for (const [num, name] of sq[pos]) out.push({ num, name, pos })
  })
  return out
}

/** Approximate primary kit colours. Editable on the board, so a wrong guess is easy to fix. */
export const CLUB_COLOURS: Record<string, string> = {
  Arsenal: '#EF0107',
  'Aston Villa': '#7A1F4B',
  Bournemouth: '#DA291C',
  Brentford: '#E30613',
  'Brighton and Hove Albion': '#0057B8',
  Chelsea: '#034694',
  'Coventry City': '#5CBFEB',
  'Crystal Palace': '#1B458F',
  Everton: '#003399',
  Fulham: '#F5F5F5',
  'Hull City': '#F5A12D',
  'Ipswich Town': '#3A64A3',
  'Leeds United': '#FFCD00',
  Liverpool: '#C8102E',
  'Manchester City': '#6CABDD',
  'Manchester United': '#DA291C',
  'Newcastle United': '#2B2B2B',
  'Nottingham Forest': '#DD0000',
  Sunderland: '#EB172B',
  'Tottenham Hotspur': '#F2F2F2',
}

export const FORMATIONS: Record<string, { role: string; pos: Pos; u: number; v: number }[]> = (() => {
  // u: 0 = own goal line, 1 = opposition goal line. v: 0..1 across the pitch.
  const SPREAD = [0, 0, 0.36, 0.58, 0.72, 0.84]
  const across = (n: number) => {
    const sp = SPREAD[n] ?? 0.84
    return Array.from({ length: n }, (_, i) => (n === 1 ? 0.5 : 0.5 - sp / 2 + (sp * i) / (n - 1)))
  }
  const build = (rows: number[]) => {
    const out: { role: string; pos: Pos; u: number; v: number }[] = [{ role: 'GK', pos: 'GK', u: 0.05, v: 0.5 }]
    rows.forEach((n, ri) => {
      const pos: Pos = ri === 0 ? 'DEF' : ri === rows.length - 1 ? 'FWD' : 'MID'
      const u = 0.22 + (0.68 * ri) / (rows.length - 1)
      across(n).forEach((v, i) => out.push({ role: `${pos}${i + 1}`, pos, u, v }))
    })
    return out
  }
  return {
    '4-3-3': build([4, 3, 3]),
    '4-4-2': build([4, 4, 2]),
    '4-2-3-1': build([4, 2, 3, 1]),
    '3-5-2': build([3, 5, 2]),
    '3-4-3': build([3, 4, 3]),
    '4-1-4-1': build([4, 1, 4, 1]),
    '5-3-2': build([5, 3, 2]),
    '4-4-1-1': build([4, 4, 1, 1]),
  }
})()

export function surname(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const particles = new Set(['van', 'de', 'di', 'da', 'dos', 'der', 'den', 'el', 'le', 'la', 'mac', 'al'])
  let i = parts.length - 1
  while (i > 0 && particles.has(parts[i - 1].toLowerCase())) i--
  return parts.slice(i).join(' ')
}

export function readableOn(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0E2A20' : '#F7F7F2'
}

/** Rough colour distance (0 to ~441). Used to stop both teams defaulting to the same shade. */
export function colourDistance(a: string, b: string): number {
  const f = (h: string) => [1, 3, 5].map((i) => parseInt(h.replace('#', '').slice(i - 1, i + 1), 16))
  const [r1, g1, b1] = f(a)
  const [r2, g2, b2] = f(b)
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2)
}
