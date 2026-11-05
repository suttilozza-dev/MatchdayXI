/**
 * Stylised full-detail shirts. Each shirt is described by a small data object (colours, collar, cuffs, shoulder trim,
 * texture) and drawn as a layered SVG string. These are original drawings: no crests, sponsors or maker logos.
 * Layers carry ids (body, sleeves, texture, cuffs, shoulders, collar) so they can be pulled apart in Canva.
 */
export type Collar = 'polo' | 'vneck' | 'crew'
export type Texture = 'none' | 'diamonds' | 'waves' | 'pinstripe' | 'dots' | 'mottle' | 'feathers' | 'bolts'

export type KitDesign = {
  body: string
  sleeve?: string // defaults to body
  collar: Collar
  collarColour: string
  collarInner?: string // second collar stripe (v-neck / crew)
  cuffs: string[] // outermost last; one or more stripes
  shoulder?: string // three-stripe style trim on the shoulders
  texture?: Texture
  textureColour?: string
  textureOpacity?: number
  stripes?: { colour: string; n: number } // wide vertical stripes on the body
  sash?: string[] // thin diagonal lines across the body, in these colours, in order
  sleeveLines?: string[] // thin lines running down each sleeve, in these colours, repeating
  sidePanel?: string // thin panel down each side
  textureGap?: number // spacing for pinstripes
  outline?: string
}

const OUTLINE = '#070B18'
const W = 240
const H = 222

const BODY = 'M88,16Q120,34 152,16L200,36L232,100L196,116L178,84Q181,150 176,208Q120,214 64,208Q59,150 62,84L44,116L8,100L40,36Z'
const SLEEVE_L = 'M40,36L80,21L62,84L44,116L8,100Z'
const SLEEVE_R = 'M200,36L160,21L178,84L196,116L232,100Z'

/** A band across the end of a sleeve, from t0 to t1 (0 = hem, 1 = about 12 units in). */
function cuffBand(side: 'l' | 'r', t0: number, t1: number): string {
  const [a, b, v]: [number[], number[], number[]] = side === 'l' ? [[8, 100], [44, 116], [4, -11]] : [[232, 100], [196, 116], [-4, -11]]
  const p = (o: number[], t: number) => `${(o[0] + v[0] * t * 1.1).toFixed(1)},${(o[1] + v[1] * t * 1.1).toFixed(1)}`
  return `M${p(a, t0)}L${p(b, t0)}L${p(b, t1)}L${p(a, t1)}Z`
}

function shoulderLines(side: 'l' | 'r', c: string): string {
  const s = side === 'l' ? 1 : -1
  let d = ''
  for (let k = 0; k < 3; k++) {
    const ox = 1.8 * k * 1.1 * s
    const oy = 4.1 * k * 1.1
    const x0 = side === 'l' ? 30 : 210
    const x1 = side === 'l' ? 96 : 144
    d += `M${x0 + ox},${40 + oy - 3}L${x1 + ox},${12 + oy - 3}`
  }
  return `<path d="${d}" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="butt"/>`
}

function textureDefs(id: string, t: Texture, c: string, o: number, gap = 9): { defs: string; fill: string } {
  if (t === 'diamonds')
    return {
      defs: `<pattern id="${id}" width="12" height="14" patternUnits="userSpaceOnUse"><path d="M6,1L11,7L6,13L1,7Z" fill="none" stroke="${c}" stroke-width="0.9" opacity="${o}"/></pattern>`,
      fill: `url(#${id})`,
    }
  if (t === 'waves')
    return {
      defs: `<pattern id="${id}" width="20" height="14" patternUnits="userSpaceOnUse"><path d="M0,7Q5,1 10,7T20,7" fill="none" stroke="${c}" stroke-width="0.9" opacity="${o}"/></pattern>`,
      fill: `url(#${id})`,
    }
  if (t === 'dots')
    return { defs: `<pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.5" fill="${c}" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
  if (t === 'mottle')
    return {
      defs: `<pattern id="${id}" width="40" height="36" patternUnits="userSpaceOnUse"><g fill="${c}" opacity="${o}"><circle cx="6" cy="8" r="4.5"/><circle cx="24" cy="5" r="3"/><circle cx="33" cy="17" r="5"/><circle cx="14" cy="22" r="3.5"/><circle cx="27" cy="30" r="4"/><circle cx="4" cy="32" r="2.5"/></g></pattern>`,
      fill: `url(#${id})`,
    }
  if (t === 'feathers')
    return { defs: `<pattern id="${id}" width="14" height="16" patternUnits="userSpaceOnUse"><path d="M2,14Q6,6 12,2M0,8Q4,3 8,0M6,16Q10,10 14,7" fill="none" stroke="${c}" stroke-width="1.3" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
  if (t === 'bolts')
    return { defs: `<pattern id="${id}" width="46" height="70" patternUnits="userSpaceOnUse"><path d="M14,0L32,0L21,28L35,28L7,70L13,38L0,38Z" fill="${c}" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
  if (t === 'pinstripe')
    return { defs: `<pattern id="${id}" width="${gap}" height="10" patternUnits="userSpaceOnUse"><rect width="1.6" height="10" fill="${c}" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
  return { defs: '', fill: 'none' }
}

function sashLines(cols: string[]): string {
  const w = 6
  const total = cols.length * w
  return cols
    .map((c, i) => {
      const off = -total / 2 + i * w
      const x = 76 + off
      return `<path d="M${x},10L${x + w},10L${x + w + 106},214L${x + 106},214Z" fill="${c}"/>`
    })
    .join('')
}

function sleeveLines(cols: string[]): string {
  let d = ''
  const n = 9
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n
    const c = cols[i % cols.length]
    const lx = (a: number[], b: number[]) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]
    const t = lx([40, 36], [80, 21])
    const b = lx([8, 100], [44, 116])
    const line = (m: number) => `<path d="M${m ? 240 - t[0] : t[0]},${t[1]}L${m ? 240 - b[0] : b[0]},${b[1]}" stroke="${c}" stroke-width="3.4" fill="none"/>`
    d += line(0) + line(1)
  }
  return d
}

function stripeRects(c: string, n: number): string {
  const w = 116 / (2 * n - 1)
  let d = ''
  for (let i = 0; i < n; i++) d += `<rect x="${(62 + i * 2 * w).toFixed(2)}" y="14" width="${w.toFixed(2)}" height="200" fill="${c}"/>`
  return d
}

function collarSvg(k: KitDesign): string {
  const o = k.outline ?? OUTLINE
  const c = k.collarColour
  const i = k.collarInner
  if (k.collar === 'polo') {
    return `<g id="collar">
      <path d="M86,15Q120,36 154,15L148,10Q120,26 92,10Z" fill="${c}" stroke="${o}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M92,10L112,26L118,44L106,40L96,22Z" fill="${c}" stroke="${o}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M148,10L128,26L122,44L134,40L144,22Z" fill="${c}" stroke="${o}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M120,30L120,56" stroke="${o}" stroke-width="1.2" opacity=".5"/>
    </g>`
  }
  if (k.collar === 'vneck') {
    return `<g id="collar">
      <path d="M86,15L120,54L154,15" fill="none" stroke="${o}" stroke-width="10" stroke-linejoin="round"/>
      <path d="M86,15L120,54L154,15" fill="none" stroke="${c}" stroke-width="7.4" stroke-linejoin="round"/>
      ${i ? `<path d="M90,22L120,48L150,22" fill="none" stroke="${i}" stroke-width="3" stroke-linejoin="round"/>` : ''}
    </g>`
  }
  return `<g id="collar">
      <path d="M86,15Q120,46 154,15" fill="none" stroke="${o}" stroke-width="11" stroke-linecap="round"/>
      <path d="M86,15Q120,46 154,15" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
      ${i ? `<path d="M90,19Q120,45 150,19" fill="none" stroke="${i}" stroke-width="2.2"/>` : ''}
    </g>`
}

/** The complete shirt as an SVG string (viewBox 0 0 240 222). `uid` keeps pattern and clip ids unique on a page. */
export function kitSvg(k: KitDesign, uid = 'k'): string {
  const o = k.outline ?? OUTLINE
  const tex = textureDefs(`${uid}-tx`, k.texture ?? 'none', k.textureColour ?? '#fff', k.textureOpacity ?? 0.12, k.textureGap)
  const sl = k.sleeve ?? k.body
  const n = k.cuffs.length
  const cuffs = k.cuffs
    .map((c, idx) => `<path d="${cuffBand('l', idx / n, (idx + 1) / n)}" fill="${c}"/><path d="${cuffBand('r', idx / n, (idx + 1) / n)}" fill="${c}"/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <clipPath id="${uid}-body"><path d="${BODY}"/></clipPath>
    <clipPath id="${uid}-torso"><rect x="62" y="10" width="116" height="212"/></clipPath>
    <clipPath id="${uid}-sl"><path d="${SLEEVE_L}"/><path d="${SLEEVE_R}"/></clipPath>
    ${tex.defs}
  </defs>
  <g id="shirt">
    <path id="body" d="${BODY}" fill="${k.body}"/>
    <g id="sleeves" clip-path="url(#${uid}-body)"><path d="${SLEEVE_L}" fill="${sl}"/><path d="${SLEEVE_R}" fill="${sl}"/></g>
    ${k.stripes ? `<g id="stripes" clip-path="url(#${uid}-body)">${stripeRects(k.stripes.colour, k.stripes.n)}</g>` : ''}
    ${k.sash ? `<g id="sash" clip-path="url(#${uid}-body)"><g clip-path="url(#${uid}-torso)">${sashLines(k.sash)}</g></g>` : ''}
    ${k.sleeveLines ? `<g id="sleeve-lines" clip-path="url(#${uid}-sl)">${sleeveLines(k.sleeveLines)}</g>` : ''}
    ${k.sidePanel ? `<g id="side-panels" clip-path="url(#${uid}-body)"><path d="M62,84L69,84L71,208L62,208Z" fill="${k.sidePanel}"/><path d="M178,84L171,84L169,208L178,208Z" fill="${k.sidePanel}"/></g>` : ''}
    ${k.texture && k.texture !== 'none' ? `<g id="texture" clip-path="url(#${uid}-body)"><rect width="${W}" height="${H}" fill="${tex.fill}"/></g>` : ''}
    <g id="cuffs" clip-path="url(#${uid}-body)">${cuffs}</g>
    ${k.shoulder ? `<g id="shoulders" clip-path="url(#${uid}-sl)">${shoulderLines('l', k.shoulder)}${shoulderLines('r', k.shoulder)}</g>` : ''}
    <g id="seams" fill="none" stroke="${o}" stroke-width="1" opacity=".35"><path d="M80,21L62,84"/><path d="M160,21L178,84"/></g>
    <path id="outline" d="${BODY}" fill="none" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>
    ${collarSvg(k)}
  </g>
</svg>`
}

export type ClubKits = { home: KitDesign; away: KitDesign; third: KitDesign }

/** Aston Villa 2026-27, drawn from the official kit photos: colours, collar, cuffs, shoulder trim and the subtle shirt texture only. */
export const VILLA: ClubKits = {
  home: { body: '#7A1D3C', collar: 'polo', collarColour: '#A9CCEE', cuffs: ['#A9CCEE'], shoulder: '#A9CCEE', texture: 'pinstripe', textureColour: '#000', textureOpacity: 0.09 },
  away: { body: '#232629', collar: 'vneck', collarColour: '#E9B93C', collarInner: '#7A1D3C', cuffs: ['#E9B93C', '#7A1D3C', '#A9CCEE'], shoulder: '#E9B93C', texture: 'diamonds', textureColour: '#fff', textureOpacity: 0.07 },
  third: { body: '#BCD9F2', collar: 'crew', collarColour: '#7A1D3C', cuffs: ['#7A1D3C'], shoulder: '#7A1D3C', texture: 'waves', textureColour: '#fff', textureOpacity: 0.6 },
}

/** Chelsea 2026-27 from the kit photos: royal blue polo, black and gold away, white third with thin red pinstripes. */
export const CHELSEA: ClubKits = {
  home: { body: '#2252D6', collar: 'polo', collarColour: '#1B44B8', cuffs: ['#1B44B8'], shoulder: '#7FA2F5', texture: 'diamonds', textureColour: '#fff', textureOpacity: 0.05 },
  away: { body: '#0C0C0F', outline: '#4A5478', collar: 'polo', collarColour: '#E6C21E', cuffs: ['#E6C21E'], texture: 'none' },
  third: { body: '#F4F6FB', collar: 'crew', collarColour: '#2250C8', cuffs: ['#2250C8'], texture: 'pinstripe', textureColour: '#E5484D', textureOpacity: 0.75, textureGap: 34 },
}

/** Coventry City 2026-27: sky-blue and white stripes, cream away with coral trim, orchid third with a halftone dot fade. */
export const COVENTRY: ClubKits = {
  home: { body: '#F4F7FB', sleeve: '#2E9BDB', stripes: { colour: '#2E9BDB', n: 4 }, collar: 'vneck', collarColour: '#14213F', cuffs: ['#14213F'], texture: 'mottle', textureColour: '#1C6FB5', textureOpacity: 0.35 },
  away: { body: '#F2EEE6', outline: '#8C93A8', collar: 'vneck', collarColour: '#14213F', cuffs: ['#F2EEE6'], shoulder: '#FF7A59', sidePanel: '#FF7A59', texture: 'none' },
  third: { body: '#C679E0', sleeve: '#C679E0', collar: 'crew', collarColour: '#C679E0', collarInner: '#9C4FB8', cuffs: ['#C679E0'], texture: 'dots', textureColour: '#FF6B5A', textureOpacity: 0.7 },
}

/** Crystal Palace 2026-27: white with a red and blue pinstripe sash, black away with feather texture, blue and red lightning third. */
export const PALACE: ClubKits = {
  home: { body: '#F5F6FA', collar: 'crew', collarColour: '#1B4FD0', collarInner: '#E21E3C', cuffs: ['#E21E3C', '#1B4FD0'], sash: ['#1B4FD0', '#E21E3C', '#1B4FD0', '#E21E3C', '#1B4FD0', '#E21E3C', '#1B4FD0'], sleeveLines: ['#E21E3C', '#1B4FD0'], outline: '#7C86A6' },
  away: { body: '#111216', outline: '#4A5478', collar: 'crew', collarColour: '#E21E3C', collarInner: '#1B4FD0', cuffs: ['#E21E3C', '#1B4FD0'], sidePanel: '#1B4FD0', shoulder: '#E21E3C', texture: 'feathers', textureColour: '#fff', textureOpacity: 0.12 },
  third: { body: '#1B4FD0', sleeve: '#16339A', collar: 'crew', collarColour: '#0E1B4A', collarInner: '#E21E3C', cuffs: ['#E21E3C', '#0E1B4A'], texture: 'bolts', textureColour: '#E21E3C', textureOpacity: 0.95 },
}
