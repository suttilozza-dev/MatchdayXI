/**
 * Stylised full-detail shirts. Each shirt is described by a small data object (colours, collar, cuffs, shoulder trim,
 * texture) and drawn as a layered SVG string. These are original drawings: no crests, sponsors or maker logos.
 * Layers carry ids (body, sleeves, texture, cuffs, shoulders, collar) so they can be pulled apart in Canva.
 */
export type Collar = 'polo' | 'vneck' | 'crew'
export type Texture = 'none' | 'diamonds' | 'waves' | 'pinstripe' | 'dots' | 'mottle' | 'feathers' | 'bolts' | 'hlines' | 'shards' | 'slashes' | 'checks' | 'marble' | 'zigzag'

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
  fade?: string // colour the body fades into at the hem
  centreStripe?: { colour: string; w: number } // one vertical stripe down the middle
  sidePanel?: string // thin panel down each side
  textureColour2?: string // second colour for line textures
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

function textureDefs(id: string, t: Texture, c: string, o: number, gap = 9, c2 = c): { defs: string; fill: string } {
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
  if (t === 'hlines')
    return { defs: `<pattern id="${id}" width="10" height="${gap * 2}" patternUnits="userSpaceOnUse"><rect y="${gap * 0.4}" width="10" height="1.5" fill="${c}" opacity="${o}"/><rect y="${gap * 1.4}" width="10" height="1.5" fill="${c2}" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
  if (t === 'shards')
    return { defs: `<pattern id="${id}" width="60" height="80" patternUnits="userSpaceOnUse"><g fill="${c}" opacity="${o}"><path d="M0,10L24,0L30,34L6,44Z"/><path d="M34,38L58,30L60,66L38,74Z"/><path d="M8,56L26,52L24,80L4,80Z"/></g></pattern>`, fill: `url(#${id})` }
  if (t === 'slashes')
    return { defs: `<pattern id="${id}" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M4,10L14,2M20,22L34,8M8,36L18,26M30,40L40,30M24,4L28,0M2,24L6,18" stroke="${c}" stroke-width="1.5" opacity="${o}" fill="none"/></pattern>`, fill: `url(#${id})` }
  if (t === 'checks')
    return { defs: `<pattern id="${id}" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c}" opacity="${o}"/><rect x="14" y="14" width="14" height="14" fill="${c}" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
  if (t === 'marble')
    return { defs: `<pattern id="${id}" width="90" height="70" patternUnits="userSpaceOnUse"><g fill="${c}" opacity="${o}"><path d="M0,14Q22,0 40,16T90,10L90,20Q60,26 40,30T0,28Z"/><path d="M0,50Q30,34 56,48T90,40L90,52Q60,60 34,64T0,62Z"/><path d="M62,0Q70,20 90,24L90,30Q64,26 54,0Z"/></g></pattern>`, fill: `url(#${id})` }
  if (t === 'zigzag')
    return { defs: `<pattern id="${id}" width="36" height="30" patternUnits="userSpaceOnUse"><path d="M0,22L9,4L18,22L27,4L36,22" fill="none" stroke="${c}" stroke-width="2.2" opacity="${o}"/><path d="M0,30L9,14L18,30L27,14L36,30" fill="none" stroke="${c}" stroke-width="1.2" opacity="${o}"/></pattern>`, fill: `url(#${id})` }
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
export function kitSvg(k: KitDesign, rawUid = 'k'): string {
  const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, '-')
  const o = k.outline ?? OUTLINE
  const tex = textureDefs(`${uid}-tx`, k.texture ?? 'none', k.textureColour ?? '#fff', k.textureOpacity ?? 0.12, k.textureGap, k.textureColour2)
  const sl = k.sleeve ?? k.body
  const n = k.cuffs.length
  const cuffs = k.cuffs
    .map((c, idx) => `<path d="${cuffBand('l', idx / n, (idx + 1) / n)}" fill="${c}"/><path d="${cuffBand('r', idx / n, (idx + 1) / n)}" fill="${c}"/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <clipPath id="${uid}-body"><path d="${BODY}"/></clipPath>
    ${k.fade ? `<linearGradient id="${uid}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k.fade}" stop-opacity="0"/><stop offset="1" stop-color="${k.fade}" stop-opacity="1"/></linearGradient>` : ''}
    ${k.centreStripe ? `<linearGradient id="${uid}-cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k.centreStripe.colour}" stop-opacity="0.15"/><stop offset="0.5" stop-color="${k.centreStripe.colour}"/><stop offset="1" stop-color="${k.centreStripe.colour}"/></linearGradient>` : ''}
    <clipPath id="${uid}-torso"><rect x="62" y="10" width="116" height="212"/></clipPath>
    <clipPath id="${uid}-sl"><path d="${SLEEVE_L}"/><path d="${SLEEVE_R}"/></clipPath>
    ${tex.defs}
  </defs>
  <g id="shirt">
    <path id="body" d="${BODY}" fill="${k.body}"/>
    <g id="sleeves" clip-path="url(#${uid}-body)"><path d="${SLEEVE_L}" fill="${sl}"/><path d="${SLEEVE_R}" fill="${sl}"/></g>
    ${k.stripes ? `<g id="stripes" clip-path="url(#${uid}-body)">${stripeRects(k.stripes.colour, k.stripes.n)}</g>` : ''}
    ${k.fade ? `<g id="fade" clip-path="url(#${uid}-body)"><rect x="0" y="110" width="${W}" height="112" fill="url(#${uid}-fade)"/></g>` : ''}
    ${k.centreStripe ? `<g id="centre-stripe" clip-path="url(#${uid}-body)"><rect x="${120 - k.centreStripe.w / 2}" y="14" width="${k.centreStripe.w}" height="200" fill="url(#${uid}-cs)"/></g>` : ''}
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

/** Everton 2026-27: royal blue with white and gold neck, white away with navy and gold pinstripes, dark green third with gold trim. */
export const EVERTON: ClubKits = {
  home: { body: '#1B3FBF', collar: 'crew', collarColour: '#F4F6FB', collarInner: '#F2B91F', cuffs: ['#F2B91F', '#F4F6FB'], texture: 'none' },
  away: { body: '#F6F6F8', outline: '#8C93A8', collar: 'vneck', collarColour: '#1B1F5E', collarInner: '#F2B91F', cuffs: ['#F2B91F', '#1B1F5E'], texture: 'pinstripe', textureColour: '#C9A23A', textureOpacity: 0.9, textureGap: 28 },
  third: { body: '#2F5F4E', outline: '#0E1B17', collar: 'crew', collarColour: '#17352B', collarInner: '#E9B64B', cuffs: ['#E9B64B', '#17352B'], texture: 'none' },
}

/** Hull City 2026-27: amber and black bands with a white polo collar, white away with amber shoulders, royal blue third. */
export const HULL: ClubKits = {
  home: { body: '#F6A623', sleeve: '#F6A623', stripes: { colour: '#14130F', n: 3 }, collar: 'polo', collarColour: '#F4F6FB', cuffs: ['#F4F6FB'], shoulder: '#14130F' },
  away: { body: '#F6F6F8', outline: '#8C93A8', collar: 'crew', collarColour: '#14130F', collarInner: '#F6A623', cuffs: ['#F6A623', '#14130F'], shoulder: '#F6A623' },
  third: { body: '#2E55D8', collar: 'polo', collarColour: '#F4F6FB', cuffs: ['#C9B6E4', '#F4F6FB'], texture: 'none' },
}

/** Leeds United 2026-27: white with fine yellow and blue lines, yellow away, charcoal third with grey shards. */
export const LEEDS: ClubKits = {
  home: { body: '#F7F7F4', outline: '#8C93A8', collar: 'crew', collarColour: '#2B47B8', collarInner: '#F5D327', cuffs: ['#F5D327', '#2B47B8'], shoulder: '#2B47B8', texture: 'hlines', textureColour: '#2B47B8', textureColour2: '#F5D327', textureOpacity: 0.85, textureGap: 7 },
  away: { body: '#F2D91F', collar: 'vneck', collarColour: '#14161C', collarInner: '#F7F7F4', cuffs: ['#14161C'], shoulder: '#14161C', texture: 'mottle', textureColour: '#C9B30F', textureOpacity: 0.4 },
  third: { body: '#26282E', outline: '#6A7390', collar: 'crew', collarColour: '#B6BBC8', cuffs: ['#B6BBC8'], shoulder: '#B6BBC8', texture: 'shards', textureColour: '#8A8F9E', textureOpacity: 0.45 },
}

/** Liverpool 2026-27: red with white slashes, white away with red V-neck, black and maroon check third. */
export const LIVERPOOL: ClubKits = {
  home: { body: '#C8102E', collar: 'crew', collarColour: '#C8102E', collarInner: '#F4F6FB', cuffs: ['#F4F6FB', '#C8102E'], shoulder: '#F4F6FB', texture: 'slashes', textureColour: '#fff', textureOpacity: 0.7 },
  away: { body: '#F4F4F6', outline: '#8C93A8', collar: 'vneck', collarColour: '#C8102E', collarInner: '#F4F4F6', cuffs: ['#C8102E'] },
  third: { body: '#16151A', outline: '#6A7390', collar: 'crew', collarColour: '#16151A', collarInner: '#B6BBC8', cuffs: ['#B6BBC8', '#16151A'], shoulder: '#B6BBC8', texture: 'checks', textureColour: "#6E1432", textureOpacity: 0.6 },
}

/** Manchester City 2026-27: sky blue fading to white, black with pale gold trim, white with a blue centre stripe. */
export const CITY: ClubKits = {
  home: { body: '#8EC5F0', collar: 'crew', collarColour: '#EAF4FD', cuffs: ['#EAF4FD'], fade: '#EAF4FD' },
  away: { body: '#0F1013', outline: '#4A5478', collar: 'crew', collarColour: '#EFCB82', cuffs: ['#EFCB82'], texture: 'diamonds', textureColour: '#fff', textureOpacity: 0.05 },
  third: { body: '#F6F8FC', outline: '#8C93A8', collar: 'vneck', collarColour: '#F6F8FC', collarInner: '#1B5FB5', cuffs: ['#F6F8FC'], centreStripe: { colour: '#1B5FB5', w: 22 }, sidePanel: '#8EC5F0' },
}

/** Nottingham Forest 2026-27: red with a tonal camouflage, dark green with red trim, sky blue with white marbling. */
export const FOREST: ClubKits = {
  home: { body: '#D01D26', collar: 'vneck', collarColour: '#D01D26', collarInner: '#F4F6FB', cuffs: ['#F4F6FB', '#D01D26'], shoulder: '#F4F6FB', texture: 'mottle', textureColour: '#8E0F17', textureOpacity: 0.35 },
  away: { body: '#1E4540', outline: '#0A1F1C', collar: 'vneck', collarColour: '#D01D26', cuffs: ['#D01D26'], shoulder: '#D01D26', texture: 'feathers', textureColour: '#fff', textureOpacity: 0.06 },
  third: { body: '#79C2EA', collar: 'crew', collarColour: '#F4F6FB', collarInner: '#14213F', cuffs: ['#F4F6FB', '#14213F'], texture: 'marble', textureColour: '#fff', textureOpacity: 0.55 },
}

/** AFC Bournemouth 2026-27: red and black bands, purple zigzag away, cream polo third with black and gold trim. */
export const BOURNEMOUTH: ClubKits = {
  home: { body: '#14130F', sleeve: '#14130F', stripes: { colour: '#D9242B', n: 4 }, collar: 'crew', collarColour: '#14130F', collarInner: '#C9A86A', cuffs: ['#14130F'], shoulder: '#C9A86A' },
  away: { body: '#6D58C6', collar: 'crew', collarColour: '#4B3AA3', cuffs: ['#4B3AA3'], texture: 'zigzag', textureColour: '#fff', textureOpacity: 0.45 },
  third: { body: '#F2EDE0', outline: '#8C93A8', collar: 'polo', collarColour: '#14130F', cuffs: ['#C9A86A', '#14130F'], sidePanel: '#14130F' },
}

/** Arsenal 2026-27: red with white sleeves, navy geometric away with yellow trim, pale yellow third. */
export const ARSENAL: ClubKits = {
  home: { body: '#E3202B', sleeve: '#F4F6FB', collar: 'crew', collarColour: '#8E1020', cuffs: ['#8E1020'] },
  away: { body: '#1C2C5E', collar: 'crew', collarColour: '#E3202B', collarInner: '#F2C318', cuffs: ['#F2C318', '#E3202B'], shoulder: '#F2C318', texture: 'diamonds', textureColour: '#fff', textureOpacity: 0.16 },
  third: { body: '#F8EDA3', outline: '#9AA0B5', collar: 'crew', collarColour: '#2A3358', collarInner: '#9E2A3A', cuffs: ['#2A3358', '#9E2A3A'], shoulder: '#2A3358' },
}
