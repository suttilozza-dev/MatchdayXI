const PL = 1050
const PW = 680

/** One drawable piece of a stadium surround, in landscape pitch coordinates (pitch is 0..PL by 0..PW). */
export type Shape = { d: string; fill?: string; stroke?: string; sw?: number; opacity?: number }

export type StadiumId = 'matchdayxi'
export const STADIUMS: { id: StadiumId; name: string; note: string }[] = [
  { id: 'matchdayxi', name: 'MatchdayXI Stadium', note: 'A small lower-league ground: one stand, a covered shelter and a terrace behind each goal.' },
]

/** Surround extent beyond the pitch, in landscape units. Used to size the board's view. */
export const SURROUND = { left: 70, right: 70, top: 86, bottom: 52 }

const rect = (x: number, y: number, w: number, h: number) => `M${x},${y}h${w}v${h}h${-w}Z`
const dot = (cx: number, cy: number, r: number) => `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`

const CROWD = ['#CFFF4D', '#1FD1C1', '#F7F7F2', '#FFB020', '#AFCDBF']
function crowd(points: [number, number][], r = 4.2): Shape[] {
  const by: Record<string, string> = {}
  points.forEach(([x, y], i) => {
    // small deterministic shuffle so neighbouring fans differ
    const c = CROWD[Math.abs(Math.floor(Math.sin(i * 12.9898 + x * 0.37 + y * 0.11) * 43758.5453)) % CROWD.length]
    by[c] = (by[c] ?? '') + dot(x, y, r)
  })
  return Object.entries(by).map(([fill, d]) => ({ d, fill, opacity: 0.9 }))
}

/** The default MatchdayXI Stadium, drawn in palette A. */
export function matchdayXIStadium(): Shape[] {
  const s: Shape[] = []
  // ground behind everything
  s.push({ d: rect(-SURROUND.left, -SURROUND.top, PL + SURROUND.left + SURROUND.right, PW + SURROUND.top + SURROUND.bottom), fill: '#0B2119' })

  // main stand along the top touchline: roof + four short rows
  s.push({ d: rect(110, -62, 830, 50), fill: '#17392D' })
  s.push({ d: `M96,-62L110,-80H940L954,-62Z`, fill: '#0E2A20', stroke: '#CFFF4D', sw: 2 })
  for (let r = 0; r < 4; r++) s.push({ d: `M110,${-48 + r * 12}H940`, stroke: 'rgba(247,247,242,0.12)', sw: 1.5 })
  const top: [number, number][] = []
  for (let r = 0; r < 4; r++) for (let x = 122 + (r % 2) * 8; x < 930; x += 17) top.push([x, -54 + r * 12])
  s.push(...crowd(top))

  // covered shelter along the bottom touchline: sloping roof on posts
  s.push({ d: `M230,${PW + 12}H820L840,${PW + 30}H210Z`, fill: '#0E2A20', stroke: '#CFFF4D', sw: 2 })
  for (const x of [230, 380, 525, 670, 820]) s.push({ d: rect(x - 2, PW + 30, 4, 20), fill: '#1B5940' })
  const shelter: [number, number][] = []
  for (let x = 246; x < 810; x += 16) shelter.push([x, PW + 41])
  s.push(...crowd(shelter, 3.6))

  // two dugouts in front of the shelter
  s.push({ d: rect(395, PW + 4, 80, 18), fill: '#123C2C', stroke: '#CFFF4D', sw: 2 })
  s.push({ d: rect(575, PW + 4, 80, 18), fill: '#123C2C', stroke: '#CFFF4D', sw: 2 })

  // small terraces behind each goal
  for (const x of [-58, PL + 10]) {
    s.push({ d: rect(x, 170, 48, 340), fill: '#17392D' })
    s.push({ d: `M${x},170h48v340h-48Z`, stroke: 'rgba(247,247,242,0.18)', sw: 1.5 })
    const pts: [number, number][] = []
    for (let r = 0; r < 3; r++) for (let y = 184 + (r % 2) * 8; y < 500; y += 17) pts.push([x + 10 + r * 14, y])
    s.push(...crowd(pts, 3.8))
  }

  // advertising hoardings round the pitch
  const hoard = ['#CFFF4D', '#1FD1C1', '#F7F7F2', '#FFB020']
  for (let i = 0; i < 14; i++) {
    const x = 50 + i * 70
    s.push({ d: rect(x, -10, 64, 7), fill: hoard[i % 4], opacity: 0.85 })
  }
  for (let i = 0; i < 14; i++) s.push({ d: rect(50 + i * 70, PW + 3, 64, 7), fill: hoard[(i + 2) % 4], opacity: 0.85 })
  for (const x of [-9, PL + 2]) for (let i = 0; i < 4; i++) s.push({ d: rect(x, 170 + i * 85, 7, 80), fill: hoard[i % 4], opacity: 0.85 })
  return s
}

export function shapesFor(id: StadiumId): Shape[] {
  return id === 'matchdayxi' ? matchdayXIStadium() : []
}
