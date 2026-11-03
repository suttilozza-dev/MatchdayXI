import squadsJson from '../data/squads.json'
import managersJson from '../data/managers.json'

export type Pos = 'GK' | 'DEF' | 'MID' | 'FWD'
export type Player = { num: number | null; name: string; pos: Pos }

export const GAMEWEEK_DEFAULT = '10'
export const SITE_URL = 'matchday-xi.club'

type RawSquad = Record<Pos, [number | null, string][]>
const raw = (squadsJson as unknown as { clubs: Record<string, RawSquad> }).clubs

export const CLUBS: string[] = Object.keys(raw).sort((a, b) => a.localeCompare(b))

/** The club's head coach for 2026/27 (src/data/managers.json), or '' if unknown. */
export function managerFor(club: string): string {
  return (managersJson.managers as Record<string, string>)[club] ?? ''
}

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

export type KitName = 'home' | 'away' | 'third'
/** [main colour, trim colour] per kit, estimated by eye from the clubs' 2026/27 kit photos. Clubs not listed fall back to CLUB_COLOURS (home only). */
export const KITS: Record<string, Partial<Record<KitName, [string, string]>>> = {
  'Manchester United': { home: ['#D81E2A', '#F4F4F4'], away: ['#1F4FD0', '#D8202F'], third: ['#F2EEE6', '#1A1A1A'] },
  'Newcastle United': { home: ['#F4F4F4', '#141414'], away: ['#26384F', '#7FD3E0'], third: ['#D2B3E0', '#3B2A6B'] },
  Sunderland: { home: ['#D8202F', '#F4F4F4'], away: ['#EE9DB8', '#141414'], third: ['#1B3FA0', '#D9A441'] },
  'Tottenham Hotspur': { home: ['#F6F6F8', '#1F2A6B'], away: ['#1B2A55', '#F0875A'], third: ['#5B2FC9', '#141414'] },
  'Ipswich Town': { home: ['#1D3FB0', '#F4F4F4'], away: ['#EFE0B8', '#D8202F'] },
  Arsenal: { home: ['#D8202F', '#F4F4F4'], away: ['#1C2B5A', '#E8B93A'], third: ['#F6E9A8', '#2B3A6B'] },
  Bournemouth: { home: ['#D4202A', '#141414'], away: ['#8C7BD6', '#F4F4F4'], third: ['#F3EEE2', '#141414'] },
  Brentford: { home: ['#D6202F', '#F4F4F4'], away: ['#1A1B3C', '#EDE6D8'], third: ['#F5E02A', '#141414'] },
  'Brighton and Hove Albion': { home: ['#1F4FC0', '#F4F4F4'], away: ['#F4F6FA', '#1F7FD6'], third: ['#0F4A47', '#4FE0C8'] },
  Fulham: { home: ['#F4F4FA', '#141414'], away: ['#1A1A1A', '#D4202A'], third: ['#8FC5EE', '#F04FA0'] },
  'Aston Villa': { home: ['#6B1D45', '#9CC7E8'], away: ['#2A2A2A', '#D9A93A'], third: ['#BFDDF2', '#6B1D45'] },
  Chelsea: { home: ['#0B4FD6', '#E0B23B'], away: ['#141414', '#E8C830'], third: ['#F4F4F4', '#1D4FBF'] },
  'Coventry City': { home: ['#3C9FDB', '#FFFFFF'], away: ['#F2EFE8', '#FF7A5C'], third: ['#C77FD6', '#FF6A4D'] },
  'Crystal Palace': { home: ['#F4F4F4', '#E4172B'], away: ['#1A1A1A', '#2B5BE0'], third: ['#1F3FB0', '#E4172B'] },
  Everton: { home: ['#1D3FB3', '#F2C230'], away: ['#F4F4F2', '#1B2A6B'], third: ['#3F6B5C', '#E5B94A'] },
  'Hull City': { home: ['#F5A01A', '#141414'], away: ['#F4F4F2', '#F5A01A'], third: ['#3F5FE0', '#F4F4F4'] },
  'Leeds United': { home: ['#F6F6F2', '#2F55C9'], away: ['#F4E21B', '#141414'], third: ['#1E1E1E', '#9A9A9A'] },
  Liverpool: { home: ['#B81F2D', '#F4F4F4'], away: ['#F2F2F0', '#C8202F'], third: ['#3B1C2A', '#E0E0E0'] },
  'Manchester City': { home: ['#8EC5EE', '#FFFFFF'], away: ['#161616', '#F2D58A'], third: ['#F6F6F6', '#1F3C88'] },
  'Nottingham Forest': { home: ['#D41E26', '#F4F4F4'], away: ['#1F4A44', '#D41E26'], third: ['#7EC0EA', '#F4F4F4'] },
}

export function kitColours(club: string, kit: KitName): [string, string] | null {
  const k = KITS[club]?.[kit]
  if (k) return k
  if (kit === 'home') return [CLUB_COLOURS[club] ?? '#CFFF4D', '#F7F7F2']
  return null
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
    '4-5-1': build([4, 5, 1]),
    '5-4-1': build([5, 4, 1]),
    '4-2-2-2': build([4, 2, 2, 2]),
    '3-4-2-1': build([3, 4, 2, 1]),
    '3-4-1-2': build([3, 4, 1, 2]),
    '3-5-1-1': build([3, 5, 1, 1]),
    '4-3-2-1': build([4, 3, 2, 1]),
    '4-3-1-2': build([4, 3, 1, 2]),
    '4-1-2-1-2': build([4, 1, 2, 1, 2]),
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
