/**
 * Shirt patterns for the player markers. A kit is a body colour, a trim colour and a pattern. The same shapes are used by the
 * board (SVG) and the exported picture (canvas), in the shirt's own coordinates (about -45..45 across, -27..27 down).
 *
 * Only colours and generic patterns are drawn: no club crests, sponsors or manufacturer marks.
 */
export type Pattern = 'plain' | 'stripes' | 'hoops' | 'halves' | 'sleeves' | 'sash' | 'pinstripes'

export const PATTERNS: { id: Pattern; label: string; hint: string }[] = [
  { id: 'plain', label: 'Plain', hint: 'One colour' },
  { id: 'stripes', label: 'Stripes', hint: 'Wide vertical stripes (Newcastle, Sunderland, Brighton style)' },
  { id: 'pinstripes', label: 'Pinstripes', hint: 'Thin vertical stripes' },
  { id: 'hoops', label: 'Hoops', hint: 'Horizontal bands' },
  { id: 'halves', label: 'Halves', hint: 'Left half and right half' },
  { id: 'sleeves', label: 'Sleeves', hint: 'Different colour sleeves (Arsenal, Villa style)' },
  { id: 'sash', label: 'Sash', hint: 'Diagonal band' },
]

export type KitShape = { kind: 'rect'; x: number; y: number; w: number; h: number; fill: string } | { kind: 'poly'; pts: [number, number][]; fill: string }

const X0 = -46
const X1 = 46
const Y0 = -28
const Y1 = 28

/** The shapes to draw over the body colour, clipped to the shirt. `body` is already painted as the base. */
export function patternShapes(pattern: Pattern | undefined, trim: string): KitShape[] {
  switch (pattern) {
    case 'stripes': {
      const w = (X1 - X0) / 9
      return [1, 3, 5, 7].map((i) => ({ kind: 'rect', x: X0 + i * w, y: Y0, w, h: Y1 - Y0, fill: trim }))
    }
    case 'pinstripes': {
      const out: KitShape[] = []
      for (let x = X0 + 5; x < X1; x += 9) out.push({ kind: 'rect', x, y: Y0, w: 2.2, h: Y1 - Y0, fill: trim })
      return out
    }
    case 'hoops': {
      const h = (Y1 - Y0) / 6
      return [1, 3, 5].map((i) => ({ kind: 'rect', x: X0, y: Y0 + i * h, w: X1 - X0, h, fill: trim }))
    }
    case 'halves':
      return [{ kind: 'rect', x: 0, y: Y0, w: X1, h: Y1 - Y0, fill: trim }]
    case 'sleeves':
      return [
        { kind: 'rect', x: X0, y: Y0, w: 22, h: Y1 - Y0, fill: trim },
        { kind: 'rect', x: 24, y: Y0, w: 22, h: Y1 - Y0, fill: trim },
      ]
    case 'sash':
      return [{ kind: 'poly', pts: [[-34, Y0], [-12, Y0], [34, Y1], [12, Y1]], fill: trim }]
    default:
      return []
  }
}

/** The neckline, drawn in the trim colour. */
export const COLLAR_PATH = 'M-14,-27Q0,-17 14,-27'

/** Home-kit patterns for clubs whose traditional shirt is not plain. Away and third kits start plain: change them on the board. */
export const HOME_PATTERNS: Record<string, Pattern> = {
  'Newcastle United': 'stripes',
  Sunderland: 'stripes',
  'Brighton and Hove Albion': 'stripes',
  Brentford: 'stripes',
  Bournemouth: 'stripes',
  'Hull City': 'stripes',
  Arsenal: 'sleeves',
  'Aston Villa': 'sleeves',
}

export function defaultPattern(club: string, kit: 'home' | 'away' | 'third'): Pattern {
  return kit === 'home' ? (HOME_PATTERNS[club] ?? 'plain') : 'plain'
}
