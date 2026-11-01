import { SITE_URL, readableOn, surname } from './data'

export type Orient = 'landscape' | 'portrait'
export type Shape = 'full' | 'half'

export const PL = 1050 // pitch length (landscape x)
export const PW = 680 // pitch width (landscape y)

/** Pitch markings in landscape coordinates (105 x 68 m, 10 units per metre). */
export const LINE_PATHS: string[] = [
  `M0,0H${PL}V${PW}H0Z`,
  `M${PL / 2},0V${PW}`,
  `M433.5,340a91.5,91.5 0 1,0 183,0a91.5,91.5 0 1,0 -183,0`,
  'M0,138.4H165V541.6H0',
  `M${PL},138.4H885V541.6H${PL}`,
  'M0,248.4H55V431.6H0',
  `M${PL},248.4H995V431.6H${PL}`,
  'M165,266.9A91.5,91.5 0 0 1 165,413.1',
  'M885,266.9A91.5,91.5 0 0 0 885,413.1',
  'M0,303.4h-12v73.2h12',
  `M${PL},303.4h12v73.2h-12`,
]
export const SPOTS: [number, number][] = [
  [110, 340],
  [940, 340],
  [525, 340],
]

/** Map team-neutral pitch coords (U along length 0..1, V across 0..1) to svg/canvas units. */
export function toXY(U: number, V: number, orient: Orient): [number, number] {
  return orient === 'landscape' ? [U * PL, V * PW] : [V * PW, PL - U * PL]
}
export function fromXY(x: number, y: number, orient: Orient): [number, number] {
  return orient === 'landscape' ? [x / PL, y / PW] : [1 - y / PL, x / PW]
}

export function viewBoxFor(orient: Orient, shape: Shape): { x: number; y: number; w: number; h: number } {
  const m = 24
  if (orient === 'landscape') {
    return shape === 'full' ? { x: -m, y: -m, w: PL + 2 * m, h: PW + 2 * m } : { x: -m, y: -m, w: PL / 2 + 2 * m, h: PW + 2 * m }
  }
  return shape === 'full' ? { x: -m, y: -m, w: PW + 2 * m, h: PL + 2 * m } : { x: -m, y: PL / 2 - m, w: PW + 2 * m, h: PL / 2 + 2 * m }
}

/** Transform that draws the landscape LINE_PATHS in the chosen orientation. */
export function linesTransform(orient: Orient): string {
  return orient === 'landscape' ? '' : `matrix(0,-1,1,0,0,${PL})`
}

export type PlacedMarker = { key: string; x: number; y: number; num: number | null; name: string; colour: string; ring: string }

export type CardInput = {
  orient: Orient
  shape: Shape
  versus: boolean
  homeName: string
  awayName: string
  homeForm: string
  awayForm: string
  homeColour: string
  awayColour: string
  gameweek: string
  kind: string
  markers: PlacedMarker[]
  format: 'square' | 'portrait'
  homeBench: string
  awayBench: string
}

export async function renderCard(input: CardInput): Promise<Blob> {
  const S = 1080
  const H = input.format === 'portrait' ? 1350 : 1080
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  try {
    await Promise.all([document.fonts.load('700 40px Oswald'), document.fonts.load('600 20px Inter'), document.fonts.load('500 20px Oswald')])
  } catch {
    /* fall back to system fonts */
  }
  ctx.fillStyle = '#0E2A20'
  ctx.fillRect(0, 0, S, H)
  // crowd dots in the margin (brand surround)
  for (let cx = 6; cx < S; cx += 11) for (let cy = 6; cy < H; cy += 11) {
    ctx.fillStyle = ((cx + cy) / 11) % 2 === 0 ? 'rgba(207,255,77,0.10)' : 'rgba(31,209,193,0.08)'
    ctx.beginPath()
    ctx.arc(cx, cy, 1.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#0E2A20'
  ctx.fillRect(0, 0, S, 176)

  // header
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#F7F7F2'
  ctx.font = '700 64px Oswald, sans-serif'
  ctx.fillText('MATCHDAY', 48, 96)
  const w = ctx.measureText('MATCHDAY ').width
  ctx.fillStyle = '#CFFF4D'
  ctx.fillText('XI', 48 + w, 96)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#AFCDBF'
  ctx.font = '600 28px Oswald, sans-serif'
  ctx.fillText(`GAMEWEEK ${input.gameweek.toUpperCase()} · ${input.kind.toUpperCase()}`, S - 48, 94)
  ctx.textAlign = 'left'

  // team line
  ctx.font = '600 30px Oswald, sans-serif'
  const dot = (x: number, c: string) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(x, 146, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(247,247,242,.6)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  dot(60, input.homeColour)
  ctx.fillStyle = '#F7F7F2'
  const homeText = `${input.homeName.toUpperCase()}  ${input.homeForm}`
  ctx.fillText(homeText, 82, 158)
  if (input.versus) {
    const hw = ctx.measureText(homeText).width
    ctx.fillStyle = '#AFCDBF'
    ctx.fillText('VS', 82 + hw + 22, 158)
    const vx = 82 + hw + 22 + ctx.measureText('VS ').width + 24
    dot(vx + 6, input.awayColour)
    ctx.fillStyle = '#F7F7F2'
    ctx.fillText(`${input.awayName.toUpperCase()}  ${input.awayForm}`, vx + 28, 158)
  }

  // pitch
  const vb = viewBoxFor(input.orient, input.shape)
  const benchLines = input.versus ? 2 : 1
  const benchH = 34 * benchLines + 16
  const region = { x: 48, y: 190, w: S - 96, h: H - 190 - 100 - benchH }
  const sc = Math.min(region.w / vb.w, region.h / vb.h)
  const ox = region.x + (region.w - vb.w * sc) / 2 - vb.x * sc
  const oy = region.y + (region.h - vb.h * sc) / 2 - vb.y * sc
  ctx.save()
  ctx.fillStyle = '#123C2C'
  ctx.beginPath()
  ctx.roundRect(region.x + (region.w - vb.w * sc) / 2, region.y + (region.h - vb.h * sc) / 2, vb.w * sc, vb.h * sc, 14)
  ctx.fill()
  ctx.clip()
  ctx.translate(ox, oy)
  ctx.scale(sc, sc)
  // grass fill within pitch rectangle
  ctx.save()
  if (input.orient === 'portrait') ctx.transform(0, -1, 1, 0, 0, PL)
  ctx.fillStyle = '#1B5940'
  ctx.fillRect(0, 0, PL, PW)
  ctx.strokeStyle = 'rgba(247,247,242,0.45)'
  ctx.lineWidth = 2.5
  for (const d of LINE_PATHS) ctx.stroke(new Path2D(d))
  ctx.fillStyle = 'rgba(247,247,242,0.5)'
  for (const [sx, sy] of SPOTS) {
    ctx.beginPath()
    ctx.arc(sx, sy, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // markers
  for (const m of input.markers) {
    ctx.beginPath()
    ctx.arc(m.x, m.y, 24, 0, Math.PI * 2)
    ctx.fillStyle = m.colour
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = m.ring
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.fillStyle = readableOn(m.colour)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 23px Oswald, sans-serif'
    ctx.fillText(m.num == null ? '' : String(m.num), m.x, m.y + 1)
    ctx.textBaseline = 'alphabetic'
    ctx.font = '600 19px Inter, sans-serif'
    const label = surname(m.name)
    ctx.lineJoin = 'round'
    ctx.lineWidth = 5
    ctx.strokeStyle = 'rgba(14,42,32,0.9)'
    ctx.strokeText(label, m.x, m.y + 47)
    ctx.fillStyle = '#F7F7F2'
    ctx.fillText(label, m.x, m.y + 47)
  }
  ctx.restore()

  // dugout / subs strip
  ctx.textAlign = 'left'
  ctx.font = '600 22px Oswald, sans-serif'
  const by = H - 100 - benchH + 34
  ctx.fillStyle = '#CFFF4D'
  ctx.fillText(`SUBS  ${input.homeBench}`, 48, by)
  if (input.versus) {
    ctx.fillStyle = '#1FD1C1'
    ctx.fillText(`SUBS  ${input.awayBench}`, 48, by + 34)
  }

  // footer
  ctx.textAlign = 'left'
  ctx.fillStyle = '#AFCDBF'
  ctx.font = '500 20px Oswald, sans-serif'
  ctx.fillText(SITE_URL.toUpperCase(), 48, H - 40)
  ctx.textAlign = 'right'
  ctx.font = '400 15px Inter, sans-serif'
  ctx.fillText('Independent fan tool. Not affiliated with the Premier League or any club.', S - 48, H - 40)

  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/png'))
}
