import { SITE_URL, readableOn, surname } from './data'
import { isBusy, kitSvg, KIT_SCALE, type KitDesign } from './kitDesign'
import { SURROUND, type Extents, type Shape as DrawShape } from './stadium'

export type Orient = 'landscape' | 'portrait'
export type Shape_ = 'full' | 'half'

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

export function viewBoxFor(orient: Orient, shape: Shape_, ext: Extents = SURROUND): { x: number; y: number; w: number; h: number } {
  // landscape box including the stadium surround (shape 'half' keeps the home half only)
  const lx0 = -ext.left
  const lx1 = shape === 'full' ? PL + ext.right : PL / 2 + 24
  const ly0 = -ext.top
  const ly1 = PW + ext.bottom
  if (orient === 'landscape') return { x: lx0, y: ly0, w: lx1 - lx0, h: ly1 - ly0 }
  // portrait: x' = y, y' = PL - x
  return { x: ly0, y: PL - lx1, w: ly1 - ly0, h: lx1 - lx0 }
}

/** Transform that draws the landscape LINE_PATHS in the chosen orientation. */
export function linesTransform(orient: Orient): string {
  return orient === 'landscape' ? '' : `matrix(0,-1,1,0,0,${PL})`
}

export type PlacedMarker = { key: string; x: number; y: number; num: number | null; name: string; colour: string; ring: string; captain?: boolean; design?: KitDesign }

/** How a player is drawn: a plain circle, or a shirt (front shows the number, back also shows the surname). */
export type MarkerStyle = 'circle' | 'shirt' | 'shirt-back'
export type LabelPos = 'below' | 'above' | 'off'

/** A shirt shape centred on 0,0 (about 76 wide, 54 tall). Used by both the board and the exported image. */
export const SHIRT_PATH = 'M-14,-27L-38,-17L-45,2L-31,8L-24,0L-24,27L24,27L24,0L31,8L45,2L38,-17L14,-27Q0,-17 -14,-27Z'

export type CardFormat = 'square' | 'portrait' | 'story' | 'banner' | 'header'
// portrait is 4:5 (feed), story is 9:16 (1080x1920), banner is 16:9, header is 4:1 (LinkedIn / X style cover)
export const CARD_SIZES: Record<CardFormat, [number, number]> = { square: [1080, 1080], portrait: [1080, 1350], story: [1080, 1920], banner: [1920, 1080], header: [1600, 400] }

export type CardInput = {
  /** keep the card at its standard size: a bigger stadium surround then shrinks the pitch instead of growing the image */
  fixedSize?: boolean
  orient: Orient
  shape: Shape_
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
  format: CardFormat
  homeBench: string
  awayBench: string
  stadium: DrawShape[]
  ext: Extents
  watermark: boolean // free tier: diagonal watermark + site link
  transparent: boolean
  handle: string // creator handle; when set it replaces the MatchdayXI branding
  homeManager: string
  awayManager: string
  markerStyle: MarkerStyle
  labelPos: LabelPos
}


const SUBS_INDENT = '          ' // lines up wrapped subs under the first name (approximately the width of "SUBS  ")

/** Split "12 Darlow · 6 Martinez · ..." into lines no wider than maxW (the font must already be set on ctx). */
function wrapSubs(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const names = text.split(' · ').filter(Boolean)
  if (names.length === 0) return ['']
  const lines: string[] = []
  let line = ''
  for (const n of names) {
    const next = line ? `${line} · ${n}` : n
    const prefix = lines.length === 0 ? 'SUBS  ' : SUBS_INDENT
    if (line && ctx.measureText(prefix + next).width > maxW) {
      lines.push(line)
      line = n
    } else line = next
  }
  lines.push(line)
  return lines
}

const designImages = new Map<string, HTMLImageElement>()
const designKey = (d: KitDesign) => JSON.stringify(d)
async function loadDesigns(markers: PlacedMarker[]) {
  const seen = new Set<string>()
  for (const m of markers) {
    if (!m.design) continue
    const key = designKey(m.design)
    if (seen.has(key) || designImages.has(key)) continue
    seen.add(key)
    const img = new Image()
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(kitSvg(m.design, 'x'))
    try {
      await img.decode()
      designImages.set(key, img)
    } catch {
      /* fall back to the simple shirt */
    }
  }
}

export async function renderCard(input: CardInput): Promise<Blob> {
  let [W, H] = CARD_SIZES[input.format]
  if (!input.fixedSize && input.format !== 'header') {
    // A bigger stadium surround grows the image instead of shrinking the pitch: the pitch keeps the size it has with the standard surround.
    const sctx = document.createElement('canvas').getContext('2d')!
    sctx.font = '600 22px Oswald, sans-serif'
    const lines = wrapSubs(sctx, input.homeBench, W - 96).length + (input.versus ? wrapSubs(sctx, input.awayBench, W - 96).length : 0) + (input.homeManager.trim() ? 1 : 0) + (input.versus && input.awayManager.trim() ? 1 : 0)
    const vb0 = viewBoxFor(input.orient, input.shape, SURROUND)
    const vb1 = viewBoxFor(input.orient, input.shape, input.ext)
    const sc0 = Math.min((W - 96) / vb0.w, (H - 190 - 100 - (34 * lines + 16)) / vb0.h)
    W = Math.round(W + Math.max(0, vb1.w - vb0.w) * sc0)
    H = Math.round(H + Math.max(0, vb1.h - vb0.h) * sc0)
  }
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  try {
    await Promise.all([document.fonts.load('700 40px Oswald'), document.fonts.load('600 20px Inter'), document.fonts.load('500 20px Oswald')])
  } catch {
    /* fall back to system fonts */
  }
  const branded = !input.handle
  if (input.format === 'header') return renderHeader(canvas, ctx, input, branded)
  if (!input.transparent) {
    ctx.fillStyle = '#0A1020'
    ctx.fillRect(0, 0, W, H)
    for (let cx = 6; cx < W; cx += 11) for (let cy = 6; cy < H; cy += 11) {
      ctx.fillStyle = ((cx + cy) / 11) % 2 === 0 ? 'rgba(200,255,61,0.10)' : 'rgba(25,230,209,0.08)'
      ctx.beginPath()
      ctx.arc(cx, cy, 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#0A1020'
    ctx.fillRect(0, 0, W, 176)
  }

  // header: MatchdayXI branding, or the creator's own handle
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  if (branded) {
    ctx.fillStyle = '#F5F7FF'
    ctx.font = '700 64px Oswald, sans-serif'
    ctx.fillText('MATCHDAY', 48, 96)
    const w = ctx.measureText('MATCHDAY ').width
    ctx.fillStyle = '#C8FF3D'
    ctx.fillText('XI', 48 + w, 96)
  } else {
    ctx.fillStyle = '#F5F7FF'
    ctx.font = '700 56px Oswald, sans-serif'
    ctx.fillText(input.handle.toUpperCase().slice(0, 28), 48, 96)
  }
  ctx.textAlign = 'right'
  ctx.fillStyle = '#A9B4D0'
  ctx.font = '600 28px Oswald, sans-serif'
  ctx.fillText(`GAMEWEEK ${input.gameweek.toUpperCase()} · ${input.kind.toUpperCase()}`, W - 48, 94)
  ctx.textAlign = 'left'

  // team line
  ctx.font = '600 30px Oswald, sans-serif'
  const dot = (x: number, c: string) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(x, 146, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245,247,255,.6)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  dot(60, input.homeColour)
  ctx.fillStyle = '#F5F7FF'
  const homeText = `${input.homeName.toUpperCase()}  ${input.homeForm}`
  ctx.fillText(homeText, 82, 158)
  if (input.versus) {
    const hw = ctx.measureText(homeText).width
    ctx.fillStyle = '#A9B4D0'
    ctx.fillText('VS', 82 + hw + 22, 158)
    const vx = 82 + hw + 22 + ctx.measureText('VS ').width + 24
    dot(vx + 6, input.awayColour)
    ctx.fillStyle = '#F5F7FF'
    ctx.fillText(`${input.awayName.toUpperCase()}  ${input.awayForm}`, vx + 28, 158)
  }

  // pitch + stadium surround
  const vb = viewBoxFor(input.orient, input.shape, input.ext)
  // Subs are listed as "12 Darlow · 6 Martínez ..." and wrap onto more lines when they do not fit the card width.
  ctx.font = '600 22px Oswald, sans-serif'
  const subsHome = wrapSubs(ctx, input.homeBench, W - 96)
  const subsAway = input.versus ? wrapSubs(ctx, input.awayBench, W - 96) : []
  const mgrHome = input.homeManager.trim() ? `MANAGER  ${input.homeManager.trim().toUpperCase()}` : ''
  const mgrAway = input.versus && input.awayManager.trim() ? `MANAGER  ${input.awayManager.trim().toUpperCase()}` : ''
  const benchLines = subsHome.length + subsAway.length + (mgrHome ? 1 : 0) + (mgrAway ? 1 : 0)
  const benchH = 34 * benchLines + 16
  const region = { x: 48, y: 190, w: W - 96, h: H - 190 - 100 - benchH }
  const sc = Math.min(region.w / vb.w, region.h / vb.h)
  const ox = region.x + (region.w - vb.w * sc) / 2 - vb.x * sc
  const oy = region.y + (region.h - vb.h * sc) / 2 - vb.y * sc
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(region.x + (region.w - vb.w * sc) / 2, region.y + (region.h - vb.h * sc) / 2, vb.w * sc, vb.h * sc, 14)
  ctx.clip()
  ctx.translate(ox, oy)
  ctx.scale(sc, sc)
  ctx.save()
  if (input.orient === 'portrait') ctx.transform(0, -1, 1, 0, 0, PL)
  for (const sh of input.stadium) {
    const p = new Path2D(sh.d)
    ctx.globalAlpha = sh.opacity ?? 1
    if (sh.fill) {
      ctx.fillStyle = sh.fill
      ctx.fill(p)
    }
    if (sh.stroke) {
      ctx.strokeStyle = sh.stroke
      ctx.lineWidth = sh.sw ?? 1
      ctx.stroke(p)
    }
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#23A261'
  ctx.fillRect(0, 0, PL, PW)
  ctx.fillStyle = 'rgba(0,0,0,0.07)'
  for (let i = 1; i < 10; i += 2) ctx.fillRect(i * 105, 0, 105, PW) // mowing stripes, as on the board
  ctx.strokeStyle = 'rgba(245,247,255,0.45)'
  ctx.lineWidth = 2.5
  for (const d of LINE_PATHS) ctx.stroke(new Path2D(d))
  ctx.fillStyle = 'rgba(245,247,255,0.5)'
  for (const [sx, sy] of SPOTS) {
    ctx.beginPath()
    ctx.arc(sx, sy, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // markers
  await loadDesigns(input.markers)
  for (const m of input.markers) drawMarker(ctx, m, input)
  ctx.restore()

  // dugout / subs strip
  ctx.textAlign = 'left'
  ctx.font = '600 22px Oswald, sans-serif'
  const by = H - 100 - benchH + 34
  let li = 0
  if (mgrHome) {
    ctx.fillStyle = '#C8FF3D'
    ctx.fillText(mgrHome, 48, by + 34 * li++)
  }
  ctx.fillStyle = '#C8FF3D'
  subsHome.forEach((line) => ctx.fillText(li === (mgrHome ? 1 : 0) ? `SUBS  ${line}` : `${SUBS_INDENT}${line}`, 48, by + 34 * li++))
  if (input.versus) {
    ctx.fillStyle = '#19E6D1'
    if (mgrAway) ctx.fillText(mgrAway, 48, by + 34 * li++)
    const first = li
    subsAway.forEach((line) => ctx.fillText(li === first ? `SUBS  ${line}` : `${SUBS_INDENT}${line}`, 48, by + 34 * li++))
  }

  // free-tier watermark: diagonal text across the card
  if (input.watermark) {
    ctx.save()
    ctx.translate(W / 2, H / 2)
    ctx.rotate(-Math.PI / 7)
    ctx.font = '700 52px Oswald, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(245,247,255,0.15)'
    for (let y = -H; y < H; y += 210) for (let x = -W; x < W; x += 1000) ctx.fillText('MATCHDAY XI · MATCHDAY-XI.CLUB', x + (Math.round(y / 210) % 2 ? 500 : 0), y)
    ctx.restore()
  }

  // footer: site link (branded only) + disclaimer line
  ctx.textAlign = 'left'
  ctx.fillStyle = '#A9B4D0'
  ctx.font = '500 20px Oswald, sans-serif'
  if (branded) ctx.fillText(SITE_URL.toUpperCase(), 48, H - 40)
  ctx.textAlign = 'right'
  ctx.font = '400 15px Inter, sans-serif'
  ctx.fillText('Independent fan tool. Not affiliated with the Premier League or any club.', W - 48, H - 40)

  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/png'))
}


/** Font size that fits a surname across the back of the shirt. */
export const backFont = (t: string) => Math.max(8, Math.min(13, 46 / (t.length * 0.66)))

function drawMarker(ctx: CanvasRenderingContext2D, m: PlacedMarker, input: Pick<CardInput, 'markerStyle' | 'labelPos'>, scale = 1, names = true) {
  const style = input.markerStyle
  ctx.save()
  ctx.translate(m.x, m.y)
  ctx.lineJoin = 'round'
  if (style === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, 24, 0, Math.PI * 2)
    ctx.fillStyle = m.colour
    ctx.fill()
    ctx.strokeStyle = m.ring
    ctx.lineWidth = 4
    ctx.stroke()
  } else if (m.design && designImages.has(designKey(m.design))) {
    const img = designImages.get(designKey(m.design))!
    ctx.drawImage(img, -120 * KIT_SCALE, -111 * KIT_SCALE, 240 * KIT_SCALE, 222 * KIT_SCALE)
  } else {
    // no official design for this kit: a plain shirt in the kit colours
    const p = new Path2D(SHIRT_PATH)
    ctx.fillStyle = m.colour
    ctx.fill(p)
    ctx.strokeStyle = m.ring
    ctx.lineWidth = 3.5
    ctx.stroke(p)
  }
  const useDesign = style !== 'circle' && !!m.design && designImages.has(designKey(m.design))
  const base = useDesign ? m.design!.body : m.colour
  const patterned = style !== 'circle' && (useDesign && isBusy(m.design!))
  ctx.fillStyle = readableOn(base)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (style === 'shirt-back') {
    const back = surname(m.name).toUpperCase().slice(0, 12)
    ctx.font = `600 ${backFont(back)}px Inter, sans-serif`
    ctx.fillText(back, 0, -11)
    ctx.font = '700 25px Oswald, sans-serif'
    if (patterned) {
      ctx.lineWidth = 4
      ctx.strokeStyle = readableOn(readableOn(base))
      ctx.strokeText(m.num == null ? '' : String(m.num), 0, 8)
    }
    ctx.fillText(m.num == null ? '' : String(m.num), 0, 8)
  } else {
    ctx.font = '700 23px Oswald, sans-serif'
    if (patterned) {
      ctx.lineWidth = 4
      ctx.strokeStyle = readableOn(readableOn(base))
      ctx.strokeText(m.num == null ? '' : String(m.num), 0, 1)
    }
    ctx.fillText(m.num == null ? '' : String(m.num), 0, 1)
  }
  if (m.captain) {
    // captain's armband: a lime badge with a C
    ctx.beginPath()
    ctx.arc(24, -22, 11, 0, Math.PI * 2)
    ctx.fillStyle = '#C8FF3D'
    ctx.fill()
    ctx.strokeStyle = '#0A1020'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#0A1020'
    ctx.font = '700 15px Oswald, sans-serif'
    ctx.fillText('C', 24, -21)
  }
  if (names && input.labelPos !== 'off' && style !== 'shirt-back') {
    ctx.textBaseline = 'alphabetic'
    ctx.font = '600 19px Inter, sans-serif'
    const label = surname(m.name)
    const dy = input.labelPos === 'above' ? (useDesign ? -46 : -37) : style === 'circle' ? 47 : useDesign ? 58 : 50
    ctx.lineWidth = 5
    ctx.strokeStyle = 'rgba(10,16,32,0.9)'
    ctx.strokeText(label, 0, dy)
    ctx.fillStyle = '#F5F7FF'
    ctx.fillText(label, 0, dy)
  }
  ctx.restore()
  void scale
}

/** 4:1 cover image: title on the left, the pitch with numbered markers on the right. No names (too small to read). */
async function renderHeader(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, input: CardInput, branded: boolean): Promise<Blob> {
  const W = canvas.width
  const H = canvas.height
  if (!input.transparent) {
    ctx.fillStyle = '#0A1020'
    ctx.fillRect(0, 0, W, H)
  }
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  if (branded) {
    ctx.fillStyle = '#F5F7FF'
    ctx.font = '700 58px Oswald, sans-serif'
    ctx.fillText('MATCHDAY', 44, 92)
    const w = ctx.measureText('MATCHDAY ').width
    ctx.fillStyle = '#C8FF3D'
    ctx.fillText('XI', 44 + w, 92)
  } else {
    ctx.fillStyle = '#F5F7FF'
    ctx.font = '700 50px Oswald, sans-serif'
    ctx.fillText(input.handle.toUpperCase().slice(0, 28), 44, 92)
  }
  ctx.fillStyle = '#A9B4D0'
  ctx.font = '600 26px Oswald, sans-serif'
  ctx.fillText(`GAMEWEEK ${input.gameweek.toUpperCase()} · ${input.kind.toUpperCase()}`, 44, 136)
  ctx.fillStyle = '#F5F7FF'
  ctx.font = '600 30px Oswald, sans-serif'
  ctx.fillText(`${input.homeName.toUpperCase()}  ${input.homeForm}`, 44, 196)
  if (input.versus) ctx.fillText(`VS ${input.awayName.toUpperCase()}  ${input.awayForm}`, 44, 238)
  if (input.homeManager.trim()) {
    ctx.fillStyle = '#C8FF3D'
    ctx.font = '600 22px Oswald, sans-serif'
    ctx.fillText(`MANAGER  ${input.homeManager.trim().toUpperCase()}`, 44, input.versus ? 280 : 238)
  }
  ctx.fillStyle = '#A9B4D0'
  ctx.font = '500 18px Oswald, sans-serif'
  if (branded) ctx.fillText(SITE_URL.toUpperCase(), 44, H - 28)
  const vb = viewBoxFor(input.orient, input.shape, input.ext)
  const region = { x: 560, y: 14, w: W - 560 - 24, h: H - 28 }
  const sc = Math.min(region.w / vb.w, region.h / vb.h)
  const ox = region.x + (region.w - vb.w * sc) / 2 - vb.x * sc
  const oy = region.y + (region.h - vb.h * sc) / 2 - vb.y * sc
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(region.x + (region.w - vb.w * sc) / 2, region.y + (region.h - vb.h * sc) / 2, vb.w * sc, vb.h * sc, 10)
  ctx.clip()
  ctx.translate(ox, oy)
  ctx.scale(sc, sc)
  ctx.save()
  if (input.orient === 'portrait') ctx.transform(0, -1, 1, 0, 0, PL)
  for (const sh of input.stadium) {
    const p = new Path2D(sh.d)
    ctx.globalAlpha = sh.opacity ?? 1
    if (sh.fill) {
      ctx.fillStyle = sh.fill
      ctx.fill(p)
    }
    if (sh.stroke) {
      ctx.strokeStyle = sh.stroke
      ctx.lineWidth = sh.sw ?? 1
      ctx.stroke(p)
    }
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#23A261'
  ctx.fillRect(0, 0, PL, PW)
  ctx.fillStyle = 'rgba(0,0,0,0.07)'
  for (let i = 1; i < 10; i += 2) ctx.fillRect(i * 105, 0, 105, PW) // mowing stripes, as on the board
  ctx.strokeStyle = 'rgba(245,247,255,0.45)'
  ctx.lineWidth = 2.5
  for (const d of LINE_PATHS) ctx.stroke(new Path2D(d))
  ctx.restore()
  await loadDesigns(input.markers)
  for (const m of input.markers) drawMarker(ctx, m, input, 1, false)
  ctx.restore()
  if (input.watermark) {
    ctx.save()
    ctx.translate(W / 2, H / 2)
    ctx.rotate(-Math.PI / 14)
    ctx.font = '700 44px Oswald, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(245,247,255,0.17)'
    for (let x = -W; x < W; x += 620) ctx.fillText('MATCHDAY XI · MATCHDAY-XI.CLUB', x, 0)
    ctx.restore()
  }
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/png'))
}
