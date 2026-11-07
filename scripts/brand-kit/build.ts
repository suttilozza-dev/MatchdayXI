/**
 * Builds the Canva-ready brand kit: every design is written as separate SVG layers on one shared canvas
 * (so they stack back together exactly), plus a composite. All text is converted to outlines, so no fonts are needed.
 *
 *   bun run scripts/brand-kit/build.ts
 *
 * Output goes to brand-kit-out/<group>/<design>/ (composite.svg and layers/NN-name.svg). Re-run it after any design change.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import opentype from 'opentype.js'
import { DOMParser } from '@xmldom/xmldom'
import { LOGOS } from '../../src/lib/logos'
import { CLUBS, readableOn, surname } from '../../src/lib/data'
import { ALL_KITS, isBusy, kitLayers, type KitDesign } from '../../src/lib/kitDesign'
import { PL, PW, LINE_PATHS, SPOTS, viewBoxFor } from '../../src/lib/pitch'
import { sampleCardInput } from '../../src/lib/sampleCard'
import { CLUB_GROUNDS, DEFAULT_GROUND, clubSurround, groundSurround } from '../../src/lib/clubStadiums'
import type { Shape } from '../../src/lib/stadium'

const HERE = new URL('.', import.meta.url).pathname
const OUT = join(HERE, '../../brand-kit-out')
const font = (p: string) => {
  const b = readFileSync(join(HERE, '../../node_modules/@fontsource', p))
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer)
}
const OSW7 = font('oswald/files/oswald-latin-700-normal.woff')
const OSW6 = font('oswald/files/oswald-latin-600-normal.woff')
const INT6 = font('inter/files/inter-latin-600-normal.woff')
const INT4 = font('inter/files/inter-latin-400-normal.woff')

const C = { bg: '#0A1020', deep: '#070B18', panel: '#121B33', lime: '#C8FF3D', cyan: '#19E6D1', amber: '#FFBA1F', text: '#F5F7FF', muted: '#A9B4D0', violet: '#7C5CFF', turf: '#23A261' }
const TAGLINE = 'FOOTBALL LINE-UP MAKER'
const SITE = 'GAFFSTER.APP'

// ---------- text as outlines ----------
type TOpt = { size: number; fill: string; anchor?: 'start' | 'middle' | 'end'; ls?: number; opacity?: number }
function measure(f: opentype.Font, str: string, size: number, ls = 0): number {
  const sc = size / f.unitsPerEm
  const gs = [...str].map((ch) => f.charToGlyph(ch))
  return gs.reduce((w, g) => w + (g.advanceWidth ?? 0) * sc + ls, 0) - (gs.length ? ls : 0)
}
function text(f: opentype.Font, str: string, x: number, y: number, o: TOpt): string {
  const w = measure(f, str, o.size, o.ls)
  let cx = o.anchor === 'middle' ? x - w / 2 : o.anchor === 'end' ? x - w : x
  const sc = o.size / f.unitsPerEm
  let d = ''
  for (const g of [...str].map((ch) => f.charToGlyph(ch))) {
    d += g.getPath(Math.round(cx * 100) / 100, Math.round(y * 100) / 100, o.size).toPathData(2)
    cx += (g.advanceWidth ?? 0) * sc + (o.ls ?? 0)
  }
  return `<path d="${d}" fill="${o.fill}"${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`
}
function wrap(f: opentype.Font, str: string, size: number, maxW: number): string[] {
  const out: string[] = []
  let line = ''
  for (const word of str.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(f, next, size) > maxW) {
      out.push(line)
      line = word
    } else line = next
  }
  if (line) out.push(line)
  return out
}

// ---------- layers and files ----------
type Layer = { id: string; label: string; svg: string }
type Design = { group: string; slug: string; title: string; w: number; h: number; defs?: string; layers: Layer[] }
const doc = (d: Design, layers: Layer[], bgNote = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.w} ${d.h}" width="${d.w}" height="${d.h}">${bgNote}${d.defs ? `<defs>${d.defs}</defs>` : ''}\n${layers.map((l) => `<g id="${l.id}" data-name="${l.label}">${l.svg}</g>`).join('\n')}\n</svg>\n`
const written: { group: string; slug: string; title: string; w: number; h: number; layers: { id: string; label: string; file: string }[] }[] = []
function write(d: Design) {
  const dir = join(OUT, d.group, d.slug)
  mkdirSync(join(dir, 'layers'), { recursive: true })
  writeFileSync(join(dir, 'composite.svg'), doc(d, d.layers))
  const files = d.layers.map((l, i) => {
    const file = `layers/${String(i + 1).padStart(2, '0')}-${l.id}.svg`
    writeFileSync(join(dir, file), doc(d, [l]))
    return { id: l.id, label: l.label, file }
  })
  written.push({ group: d.group, slug: d.slug, title: d.title, w: d.w, h: d.h, layers: files })
}

const rect = (x: number, y: number, w: number, h: number, fill: string, r = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ''} fill="${fill}" ${extra}/>`
const shapeSvg = (s: Shape) => `<path d="${s.d}"${s.fill ? ` fill="${s.fill}"` : ' fill="none"'}${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.sw ?? 1}"` : ''}${s.opacity != null ? ` opacity="${s.opacity}"` : ''}/>`

// ---------- the logo mark: the line shirt with XI, as used in the site header ----------
const SHIRT = 'M70 22 Q100 36 130 22 L158 34 L188 74 L166 92 L150 80 L150 176 L50 176 L50 80 L34 92 L12 74 L42 34 Z'
function iconLayers(round = true): Layer[] {
  return [
    { id: 'icon-background', label: 'Icon background', svg: rect(0, 0, 512, 512, C.panel, round ? 116 : 0) },
    { id: 'shirt', label: 'Shirt outline', svg: `<g transform="translate(76 78) scale(1.8)"><path d="${SHIRT}" fill="none" stroke="${C.text}" stroke-width="7" stroke-linejoin="round"/></g>` },
    { id: 'letters-xi', label: 'XI', svg: text(OSW7, 'XI', 256, 342, { size: 150, fill: C.lime, anchor: 'middle' }) },
  ]
}
const wrapLayers = (ls: Layer[], t: string, prefix = ''): Layer[] => ls.map((l) => ({ ...l, id: prefix + l.id, svg: `<g transform="${t}">${l.svg}</g>` }))

function wordmarkLayers(x: number, y: number, size: number, _underline = false): { layers: Layer[]; width: number } {
  const ls = size * 0.02
  const w1 = measure(OSW7, 'GAFF', size, ls)
  const w2 = measure(OSW7, 'STER', size, ls)
  const layers: Layer[] = [
    { id: 'word-gaff', label: 'GAFF', svg: text(OSW7, 'GAFF', x, y, { size, fill: C.text, ls }) },
    { id: 'word-ster', label: 'STER', svg: text(OSW7, 'STER', x + w1 + ls, y, { size, fill: C.lime, ls }) },
  ]
  return { layers, width: w1 + ls + w2 }
}

function logos() {
  write({ group: '1-logos', slug: 'icon', title: 'Logo icon', w: 512, h: 512, layers: iconLayers() })
  write({ group: '1-logos', slug: 'app-icon', title: 'App icon / favicon (square, no rounding)', w: 1024, h: 1024, layers: wrapLayers(iconLayers(false), 'scale(2)') })
  const wm = wordmarkLayers(60, 230, 190, true)
  write({ group: '1-logos', slug: 'wordmark', title: 'Wordmark', w: Math.round(wm.width + 120), h: 320, layers: [{ id: 'wordmark-background', label: 'Background', svg: rect(0, 0, Math.round(wm.width + 120), 320, C.bg) }, ...wm.layers] })
  const wm2 = wordmarkLayers(470, 262, 150, false)
  const W2 = Math.round(470 + wm2.width + 60)
  write({
    group: '1-logos', slug: 'lockup-horizontal', title: 'Horizontal lockup', w: W2, h: 420,
    layers: [
      { id: 'lockup-background', label: 'Background', svg: rect(0, 0, W2, 420, C.bg) },
      ...wrapLayers(iconLayers(), 'translate(36 36) scale(0.72)'),
      ...wm2.layers,
      { id: 'tagline', label: 'Tagline', svg: text(INT6, TAGLINE, 472, 330, { size: 30, fill: C.muted, ls: 3 }) },
    ],
  })
  const wm3 = wordmarkLayers(0, 0, 130, false)
  const sx = 450 - wm3.width / 2
  const wm4 = wordmarkLayers(sx, 690, 130, false)
  write({
    group: '1-logos', slug: 'lockup-stacked', title: 'Stacked lockup', w: 900, h: 860,
    layers: [
      { id: 'lockup-background', label: 'Background', svg: rect(0, 0, 900, 860, C.bg) },
      ...wrapLayers(iconLayers(), 'translate(250 50) scale(0.78)'),
      ...wm4.layers,
      { id: 'tagline', label: 'Tagline', svg: text(INT6, TAGLINE, 450, 770, { size: 26, fill: C.muted, anchor: 'middle', ls: 3 }) },
    ],
  })
}

// ---------- shared background pieces ----------
const GLOW_DEFS = (id: string, cx: string, cy: string) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.7"><stop offset="0" stop-color="${C.turf}" stop-opacity="0.38"/><stop offset="1" stop-color="${C.turf}" stop-opacity="0"/></radialGradient>`
const motif = (x: number, y: number, s: number, op: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><path d="${SHIRT}" fill="none" stroke="${C.lime}" stroke-width="3.2" stroke-linejoin="round"/><path d="M70 22 Q100 36 130 22" fill="none" stroke="${C.cyan}" stroke-width="3.2" stroke-linecap="round"/></g>`
const smallLogo = (x: number, y: number, s: number): Layer[] => [
  ...wrapLayers(iconLayers(), `translate(${x} ${y}) scale(${s})`, 'logo-'),
  ...wordmarkLayers(x + 512 * s + 14, y + 512 * s * 0.72, 512 * s * 0.52).layers.map((l) => ({ ...l, id: 'logo-' + l.id })),
]

// ---------- plans (copy matches the Pricing component) ----------
type Plan = { slug: string; title: string; price: string; per: string; sub: string; lines: string[]; short?: string[]; badge?: string; highlight?: boolean }
const PLANS: Plan[] = [
  { slug: 'free', title: 'FREE', price: '£0', per: '', sub: 'No card, no catch', short: ['Your first image needs no sign-up', '3 watermarked images a week after a free sign-in', 'Every formation and marker style'], lines: ['Your first image needs no sign-up', 'Then 3 watermarked images every week after a free sign-in', 'Every formation and marker style', 'Gaffster stadium'] },
  { slug: 'gameweek-pass', title: 'GAMEWEEK PASS', price: '£2.99', per: 'once · 7 days', sub: 'No subscription. Buy another whenever you need one.', lines: ['Up to 5 images a day with no watermark for 7 days', 'The allowance resets every day and does not roll over', 'Square, 4:5, story, header and banner sizes', "One club's stadium"] },
  { slug: 'plus', title: 'PLUS', price: '£29.99', per: 'a year', short: ['Unlimited images with no watermark', 'Transparent background', 'Every stadium and colourway'], sub: 'Season Pass: about £2.50 a month. Or £4.99 a month.', lines: ['Unlimited images with no watermark, for as long as you subscribe', 'Transparent background', 'Every stadium and colourway', 'Saved line-ups and gameweek history (soon)'], badge: 'MOST POPULAR', highlight: true },
  { slug: 'creator', title: 'CREATOR', price: '£79.99', per: 'a year', short: ['Everything in Plus', 'Your handle on the image, no branding', 'Present mode for streaming'], sub: 'About £6.67 a month. Or £9.99 a month.', lines: ['Everything in Plus', 'Your handle on the image, branding removed', 'Present mode: hidden controls for streaming', 'Bulk export, reveal videos, templates and coaching markup (soon)', 'Join now and keep this price as features arrive'] },
  { slug: 'founder-lifetime', title: 'FOUNDER LIFETIME', price: '£79.99', per: 'once', sub: 'Only the first 500 people can have it.', lines: ['Plus for life', 'Every future Plus feature', 'Never pay again'], badge: 'FIRST 500 ONLY', highlight: true },
]

function pricingCards() {
  for (const p of PLANS) {
    const W = 640, Hh = 900
    const layers: Layer[] = [
      { id: 'card', label: 'Card', svg: rect(0, 0, W, Hh, C.panel, 28) + `<rect x="2" y="2" width="${W - 4}" height="${Hh - 4}" rx="27" fill="none" stroke="${p.highlight ? C.lime : 'rgba(245,247,255,0.12)'}" stroke-width="${p.highlight ? 3 : 2}"/>` },
    ]
    if (p.badge) {
      const bw = measure(OSW6, p.badge, 26, 3) + 44
      layers.push({ id: 'badge', label: 'Badge', svg: rect(W - bw - 28, 24, bw, 46, C.violet, 23) + text(OSW6, p.badge, W - 28 - bw / 2, 57, { size: 26, fill: '#FFFFFF', anchor: 'middle', ls: 3 }) })
    }
    layers.push({ id: 'title', label: 'Plan name', svg: text(OSW6, p.title, 48, 100, { size: p.title.length > 12 ? 34 : 40, fill: C.text, ls: 5 }) })
    const pw = measure(OSW7, p.price, 112)
    layers.push({ id: 'price', label: 'Price', svg: text(OSW7, p.price, 48, 230, { size: 112, fill: C.lime }) })
    if (p.per) layers.push({ id: 'price-period', label: 'Price period', svg: text(INT6, p.per, 48 + pw + 16, 228, { size: 30, fill: C.muted }) })
    wrap(INT4, p.sub, 26, W - 96).forEach((ln, i) => layers.push({ id: `sub-${i + 1}`, label: `Sub text ${i + 1}`, svg: text(INT4, ln, 48, 286 + i * 34, { size: 26, fill: C.muted }) }))
    layers.push({ id: 'divider', label: 'Divider', svg: `<path d="M48,350H${W - 48}" stroke="rgba(245,247,255,0.14)" stroke-width="2"/>` })
    let y = 408
    p.lines.forEach((ln, i) => {
      const ls = wrap(INT6, ln, 27, W - 48 - 48 - 44)
      layers.push({ id: `feature-${i + 1}`, label: `Feature ${i + 1}`, svg: `<circle cx="62" cy="${y - 9}" r="11" fill="${C.lime}"/><path d="M56,${y - 9}l4.5,4.5l8-9" stroke="${C.bg}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + ls.map((l, j) => text(INT6, l, 92, y + j * 34, { size: 27, fill: C.text })).join('') })
      y += ls.length * 34 + 22
    })
    const label = p.slug === 'free' ? 'START BUILDING' : p.slug === 'founder-lifetime' ? 'BECOME A FOUNDER' : p.slug === 'gameweek-pass' ? 'GET A PASS' : `GO ${p.title}`
    layers.push({ id: 'button', label: 'Button', svg: rect(48, Hh - 128, W - 96, 76, p.highlight || p.slug !== 'free' ? C.lime : 'none', 38, p.slug === 'free' ? `stroke="${C.text}" stroke-opacity="0.4" stroke-width="2"` : '') })
    layers.push({ id: 'button-text', label: 'Button text', svg: text(OSW7, label, W / 2, Hh - 77, { size: 32, fill: p.slug === 'free' ? C.text : C.bg, anchor: 'middle', ls: 4 }) })
    write({ group: '3-pricing-cards', slug: p.slug, title: `Pricing card: ${p.title}`, w: W, h: Hh, layers })
  }
}

/** Monthly versions of the Plus and Creator banners (the main ones show the yearly price). */
const MONTHLY_BANNERS: Plan[] = [
  { ...PLANS.find((x) => x.slug === 'plus')!, slug: 'plus-monthly', price: '£4.99', per: 'a month', badge: undefined, highlight: false },
  { ...PLANS.find((x) => x.slug === 'creator')!, slug: 'creator-monthly', price: '£9.99', per: 'a month' },
]

function banners() {
  for (const p of [...PLANS, ...MONTHLY_BANNERS]) {
    const W = 1280, Hh = 720
    const bullets = p.short ?? p.lines.slice(0, 3)
    const layers: Layer[] = [
      { id: 'background', label: 'Background', svg: rect(0, 0, W, Hh, 'url(#bg)') },
      { id: 'glow', label: 'Glow', svg: rect(0, 0, W, Hh, 'url(#glow)') },
      { id: 'pitch-motif', label: 'Shirt motif', svg: motif(820, 56, 2.1, 0.3) },
      ...smallLogo(80, 56, 0.1),
    ]
    if (p.badge) layers.push({ id: 'badge', label: 'Badge', svg: rect(80, 150, measure(OSW6, p.badge, 26, 3) + 44, 46, C.violet, 23) + text(OSW6, p.badge, 80 + 22, 183, { size: 26, fill: '#FFFFFF', ls: 3 }) })
    layers.push({ id: 'title', label: 'Plan name', svg: text(OSW7, p.title, 80, 330, { size: 116, fill: C.text, ls: 2 }) })
    const pw = measure(OSW7, p.price, 150)
    layers.push({ id: 'price', label: 'Price', svg: text(OSW7, p.price, 80, 480, { size: 150, fill: C.lime }) })
    if (p.per) layers.push({ id: 'price-period', label: 'Price period', svg: text(INT6, p.per, 80 + pw + 22, 476, { size: 38, fill: C.muted }) })
    bullets.forEach((b, i) => layers.push({ id: `bullet-${i + 1}`, label: `Bullet ${i + 1}`, svg: `<circle cx="94" cy="${561 + i * 52}" r="10" fill="${C.cyan}"/>` + text(INT6, b, 120, 572 + i * 52, { size: 32, fill: C.text }) }))
    layers.push({ id: 'url', label: 'Web address', svg: text(OSW6, SITE, W - 80, Hh - 50, { size: 28, fill: C.muted, anchor: 'end', ls: 4 }) })
    write({ group: '2-whop-banners', slug: p.slug, title: `Banner: ${p.title}${p.slug.endsWith('-monthly') ? ' (monthly)' : ''}`, w: W, h: Hh, defs: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.panel}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>${GLOW_DEFS('glow', '0.78', '0.45')}`, layers })
  }
  // social preview (Open Graph, 1200 x 630): everything stays inside the middle so no crop can cut it
  write({
    group: '2-whop-banners', slug: 'social-preview', title: 'Social preview image (1200 x 630)', w: 1200, h: 630,
    defs: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.panel}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>${GLOW_DEFS('glow', '0.5', '0.5')}`,
    layers: [
      { id: 'background', label: 'Background', svg: rect(0, 0, 1200, 630, 'url(#bg)') },
      { id: 'glow', label: 'Glow', svg: rect(0, 0, 1200, 630, 'url(#glow)') },
      ...wrapLayers(iconLayers(), 'translate(110 150) scale(0.6)', 'logo-'),
      ...wordmarkLayers(480, 330, 118).layers,
      { id: 'tagline', label: 'Tagline', svg: text(INT6, TAGLINE, 484, 396, { size: 30, fill: C.muted, ls: 4 }) },
      { id: 'url', label: 'Web address', svg: text(OSW6, SITE, 484, 470, { size: 30, fill: C.lime, ls: 5 }) },
    ],
  })
  // site header image (4:1)
  const W = 1600, Hh = 400
  write({
    group: '2-whop-banners', slug: 'site-header', title: 'Site header / cover (4:1)', w: W, h: Hh,
    defs: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.panel}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>${GLOW_DEFS('glow', '0.8', '0.5')}`,
    layers: [
      { id: 'background', label: 'Background', svg: rect(0, 0, W, Hh, 'url(#bg)') },
      { id: 'glow', label: 'Glow', svg: rect(0, 0, W, Hh, 'url(#glow)') },
      { id: 'pitch-motif', label: 'Shirt motif', svg: motif(1120, 24, 2.0, 0.6) },
      ...wrapLayers(iconLayers(), 'translate(80 80) scale(0.48)', 'logo-'),
      ...wordmarkLayers(360, 232, 130, false).layers,
      { id: 'tagline', label: 'Tagline', svg: text(INT6, TAGLINE, 364, 300, { size: 26, fill: C.muted, ls: 3 }) },
    ],
  })
}

// ---------- line-up card and hero ----------
function lineupParts() {
  const club = 'Arsenal'
  const inp = sampleCardInput(club, '4-2-3-1')
  const sur = clubSurround(club, 'home')!
  const W = 1080, Hh = 1350
  const benchH = 34 * 3 + 16
  const region = { x: 48, y: 190, w: W - 96, h: Hh - 190 - 100 - benchH }
  const vb = viewBoxFor('portrait', 'full', sur.ext)
  const sc = Math.min(region.w / vb.w, region.h / vb.h)
  const ox = region.x + (region.w - vb.w * sc) / 2 - vb.x * sc
  const oy = region.y + (region.h - vb.h * sc) / 2 - vb.y * sc
  const place = (inner: string) => `<g transform="translate(${ox} ${oy}) scale(${sc})">${inner}</g>`
  const land = (inner: string) => place(`<g transform="matrix(0,-1,1,0,0,${PL})">${inner}</g>`)
  const by = (l: Shape['layer']) => sur.shapes.filter((s) => s.layer === l).map(shapeSvg).join('')
  let defs = ''
  const players: Layer[] = []
  inp.markers.forEach((m, i) => {
    const d = m.design as KitDesign
    const num = m.num == null ? '' : String(m.num)
    const body = readableOn(d.body)
    const n = text(OSW7, num, 0, 8, { size: 23 * 1.0, fill: body, anchor: 'middle' })
    const outline = isBusy(d) ? text(OSW7, num, 0, 8, { size: 23, fill: readableOn(body), anchor: 'middle' }).replace('/>', ' stroke="' + readableOn(body) + '" stroke-width="4" stroke-linejoin="round"/>') : ''
    const kl = kitLayers(d, `p${i}`)
    defs += kl.defs
    const s = 0.32
    const un = 1 // marker size is in pitch units, so it scales with the pitch like the real card
    void un
    players.push({
      id: `player-${String(i + 1).padStart(2, '0')}`,
      label: `${m.name} (${num})`,
      svg: place(`<g transform="translate(${m.x} ${m.y})"><g transform="translate(${-120 * s} ${-111 * s}) scale(${s})">${kl.layers.map((l) => l.markup).join('')}</g>${outline}${n}${text(INT6, surname(m.name), 0, 58, { size: 19, fill: C.text, anchor: 'middle' }).replace('/>', ' stroke="rgba(10,16,32,0.9)" stroke-width="5" paint-order="stroke" stroke-linejoin="round"/>')}</g>`),
    })
  })
  const inner: Layer[] = [
    { id: 'background', label: 'Background', svg: rect(0, 0, W, Hh, C.bg) },
    ...wrapLayers(iconLayers(), 'translate(48 34) scale(0.15)', 'logo-'),
    ...wordmarkLayers(136, 96, 64).layers.map((l) => ({ ...l, id: 'logo-' + l.id })),
    { id: 'gameweek', label: 'Gameweek text', svg: text(OSW6, 'GAMEWEEK 10 · PREDICTED XI', W - 48, 94, { size: 28, fill: C.muted, anchor: 'end' }) },
    { id: 'team-dot', label: 'Team colour dot', svg: `<circle cx="60" cy="146" r="11" fill="${C.lime}" stroke="${C.text}" stroke-opacity="0.6" stroke-width="2"/>` },
    { id: 'team-name', label: 'Team and formation', svg: text(OSW6, 'ARSENAL  4-2-3-1', 82, 158, { size: 30, fill: C.text }) },
    { id: 'stadium-ground', label: 'Stadium: ground', svg: land(by('ground')) },
    { id: 'stadium-apron', label: 'Stadium: apron, road and trees', svg: land(by('apron')) },
    { id: 'stadium-stands', label: 'Stadium: stands', svg: land(by('stands')) },
    { id: 'stadium-crowd', label: 'Stadium: crowd', svg: land(by('crowd')) },
    { id: 'pitch', label: 'Pitch', svg: land(`<rect x="0" y="0" width="${PL}" height="${PW}" fill="${C.turf}"/>` + Array.from({ length: 5 }, (_, i) => rect(i * 2 * 105 + 105, 0, 105, PW, 'rgba(0,0,0,0.06)')).join('')) },
    { id: 'pitch-lines', label: 'Pitch lines', svg: land(LINE_PATHS.map((d) => `<path d="${d}" fill="none" stroke="rgba(245,247,255,0.45)" stroke-width="2.5"/>`).join('') + SPOTS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="rgba(245,247,255,0.5)"/>`).join('')) },
    { id: 'stadium-roofs', label: 'Stadium: roofs', svg: land(by('roofs')) },
    ...players,
    { id: 'manager', label: 'Manager', svg: text(OSW6, 'MANAGER  MIKEL ARTETA', 48, 1130, { size: 22, fill: C.lime }) },
    { id: 'subs', label: 'Substitutes', svg: text(OSW6, 'SUBS  6 Magalhaes · 12 Timber · 13 Arrizabalaga · 15 Konsa · 20 Madueke', 48, 1164, { size: 22, fill: C.lime }) },
    { id: 'footer-url', label: 'Footer web address', svg: text(OSW6, SITE, 48, 1310, { size: 20, fill: C.muted }) },
    { id: 'footer-note', label: 'Footer disclaimer', svg: text(INT4, 'Independent fan tool. Not affiliated with the Premier League or any club.', W - 48, 1310, { size: 15, fill: C.muted, anchor: 'end' }) },
  ]
  return { W, Hh, defs, layers: inner }
}

function lineup() {
  const l = lineupParts()
  write({ group: '4-lineup-card', slug: 'lineup-card-portrait', title: 'Line-up card (4:5), Arsenal example', w: l.W, h: l.Hh, defs: l.defs, layers: l.layers })
  // hero page: the card sits inside it, scaled
  const W = 1360, Hh = 900
  const comp = l.layers.map((x) => `<g id="card-${x.id}">${x.svg}</g>`).join('')
  write({
    group: '5-home-page', slug: 'hero', title: 'Home page hero', w: W, h: Hh,
    defs: l.defs + `<linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>${GLOW_DEFS('hglow', '0.7', '0.5')}<clipPath id="cardclip"><rect x="772" y="108" width="421" height="526" rx="16"/></clipPath>`,
    layers: [
      { id: 'background', label: 'Background', svg: rect(0, 0, W, Hh, 'url(#hbg)') },
      { id: 'glow', label: 'Glow', svg: rect(0, 0, W, Hh, 'url(#hglow)') },
      ...smallLogo(146, 18, 0.1),
      { id: 'nav-link', label: 'Nav link', svg: text(OSW6, 'OPEN THE BOARD →', 1213, 45, { size: 16, fill: C.lime, anchor: 'end', ls: 1 }) },
      { id: 'kicker', label: 'Kicker', svg: text(OSW6, 'FOOTBALL LINE-UP MAKER', 146, 243, { size: 13, fill: C.lime, ls: 2 }) },
      { id: 'headline-gaff', label: 'Headline: GAFF', svg: text(OSW7, 'GAFF', 146, 345, { size: 112, fill: C.text, ls: 2 }) },
      { id: 'headline-ster', label: 'Headline: STER', svg: text(OSW7, 'STER', 146 + measure(OSW7, 'GAFF', 112, 2) + 2, 345, { size: 112, fill: C.lime, ls: 2 }) },
      ...wrap(INT4, 'Pick a formation, name your captain and manager, and share your predicted XI, starting line-up or dream team as an image. Your first one is free, with no sign-up.', 20, 560).map((ln, i) => ({ id: `paragraph-${i + 1}`, label: `Paragraph line ${i + 1}`, svg: text(INT4, ln, 146, 390 + i * 28, { size: 20, fill: C.muted }) })),
      { id: 'button-primary', label: 'Button: Build your XI', svg: rect(146, 481, 134, 44, C.lime, 12) + text(OSW7, 'BUILD YOUR XI', 213, 509, { size: 15, fill: C.bg, anchor: 'middle', ls: 1.5 }) },
      { id: 'button-secondary', label: 'Button: See plans', svg: `<rect x="293" y="481" width="106" height="44" rx="22" fill="none" stroke="${C.text}" stroke-opacity="0.4" stroke-width="1.5"/>` + text(OSW7, 'SEE PLANS', 346, 509, { size: 15, fill: C.text, anchor: 'middle', ls: 1.5 }) },
      { id: 'card', label: 'Example card', svg: `<g clip-path="url(#cardclip)"><g transform="translate(772 108) scale(0.39)">${comp}</g></g><rect x="772" y="108" width="421" height="526" rx="16" fill="none" stroke="${C.lime}" stroke-opacity="0.4" stroke-width="1.5"/>` },
      { id: 'card-caption', label: 'Card caption', svg: text(OSW6, 'ARSENAL · 4-2-3-1', 772, 667, { size: 12, fill: C.muted, ls: 1.5 }) },
    ],
  })
}

// ---------- shirts and grounds ----------
function shirts() {
  for (const [club, kits] of Object.entries(ALL_KITS)) {
    for (const k of ['home', 'away', 'third'] as const) {
      const kl = kitLayers(kits[k], `s-${club}-${k}`)
      write({ group: '6-shirts', slug: `${club.replace(/ /g, '-')}/${k}`, title: `${club} ${k}`, w: 240, h: 222, defs: kl.defs, layers: kl.layers.map((l) => ({ id: l.id, label: l.label, svg: l.markup })) })
    }
  }
}

function grounds() {
  const list: [string, ReturnType<typeof clubSurround>][] = [['Gaffster-default', groundSurround(DEFAULT_GROUND, '#1E3A6B', '#19E6D1')], ...CLUBS.filter((c) => CLUB_GROUNDS[c]).map((c): [string, ReturnType<typeof clubSurround>] => [c.replace(/ /g, '-'), clubSurround(c, 'home')])]
  for (const [slug, sur] of list) {
    if (!sur) continue
    const e = sur.ext
    const W = Math.round(PL + e.left + e.right), Hh = Math.round(PW + e.top + e.bottom)
    const by = (l: Shape['layer']) => sur.shapes.filter((s) => s.layer === l).map(shapeSvg).join('')
    const t = `translate(${e.left} ${e.top})`
    write({
      group: '7-grounds', slug, title: `Ground: ${slug.replace(/-/g, ' ')}`, w: W, h: Hh,
      layers: [
        { id: 'ground', label: 'Ground', svg: `<g transform="${t}">${by('ground')}</g>` },
        { id: 'apron', label: 'Apron, road and trees', svg: `<g transform="${t}">${by('apron')}</g>` },
        { id: 'stands', label: 'Stands', svg: `<g transform="${t}">${by('stands')}</g>` },
        { id: 'crowd', label: 'Crowd', svg: `<g transform="${t}">${by('crowd')}</g>` },
        { id: 'pitch', label: 'Pitch', svg: `<g transform="${t}"><rect width="${PL}" height="${PW}" fill="${C.turf}"/>${Array.from({ length: 5 }, (_, i) => rect(i * 2 * 105 + 105, 0, 105, PW, 'rgba(0,0,0,0.06)')).join('')}</g>` },
        { id: 'pitch-lines', label: 'Pitch lines', svg: `<g transform="${t}">${LINE_PATHS.map((d) => `<path d="${d}" fill="none" stroke="rgba(245,247,255,0.45)" stroke-width="2.5"/>`).join('')}</g>` },
        { id: 'roofs', label: 'Roofs', svg: `<g transform="${t}">${by('roofs')}</g>` },
      ],
    })
  }
}


// ---------- the 11 approved logo concepts: every <text> turned into outlines, each element its own layer ----------
type XEl = { nodeType: number; tagName?: string; nodeValue?: string | null; attributes?: { length: number; item(i: number): { name: string; value: string } }; childNodes: { length: number; item(i: number): XEl }; getAttribute?(n: string): string | null }
const attr = (el: XEl, n: string, d = '') => el.getAttribute?.(n) ?? d
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function fontFor(el: XEl): opentype.Font {
  if (attr(el, 'font-family').includes('Inter')) return INT6
  return Number(attr(el, 'font-weight', '600')) >= 700 ? OSW7 : OSW6
}
function textRuns(el: XEl, inheritFill: string): { str: string; fill: string }[] {
  const runs: { str: string; fill: string }[] = []
  for (let i = 0; i < el.childNodes.length; i++) {
    const c = el.childNodes.item(i)
    if (c.nodeType === 3) {
      const t = (c.nodeValue ?? '').replace(/\s+/g, ' ')
      if (t.trim()) runs.push({ str: runs.length ? t : t.trimStart(), fill: inheritFill })
    } else if (c.tagName === 'tspan') runs.push(...textRuns(c, attr(c, 'fill', inheritFill)))
    else if (c.tagName === 'textPath') runs.push(...textRuns(c, inheritFill))
  }
  return runs
}
const r2 = (n: number) => Math.round(n * 100) / 100

/** Text element to outline paths (stroke halo first, then fills). With a circular textPath, letters follow the arc. */
function textToPaths(el: XEl, defsPaths: Record<string, string>): string {
  const font = fontFor(el)
  const size = Number(attr(el, 'font-size', '16'))
  const ls = Number(attr(el, 'letter-spacing', '0'))
  const fill = attr(el, 'fill', '#000')
  const stroke = attr(el, 'stroke')
  const sw = Number(attr(el, 'stroke-width', '0'))
  const runs = textRuns(el, fill)
  const sc = size / font.unitsPerEm
  const glyphs: { g: opentype.Glyph; fill: string }[] = []
  for (const r of runs) for (const ch of [...r.str]) glyphs.push({ g: font.charToGlyph(ch), fill: r.fill })
  const adv = (g: opentype.Glyph) => (g.advanceWidth ?? 0) * sc + ls
  const width = glyphs.reduce((w, x) => w + adv(x.g), 0) - (glyphs.length ? ls : 0)
  // does it sit on a path?
  let onPath: { r: number; sweep: number; cx: number; cy: number; start: number } | null = null
  for (let i = 0; i < el.childNodes.length; i++) {
    const c = el.childNodes.item(i)
    if (c.tagName === 'textPath') {
      const id = (attr(c, 'href') || attr(c, 'xlink:href')).replace('#', '')
      const m = defsPaths[id]?.match(/M\s*([\d.]+)\s+([\d.]+)\s*A\s*([\d.]+)\s+[\d.]+\s+0\s+0\s+(\d)\s+([\d.]+)\s+([\d.]+)/)
      if (m) {
        const [x0, y0, rr, sweep, x1, y1] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])]
        onPath = { r: rr, sweep, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, start: (Math.PI * rr) / 2 - width / 2 }
      }
    }
  }
  const x = Number(attr(el, 'x', '0')), y = Number(attr(el, 'y', '0'))
  const anchor = attr(el, 'text-anchor', 'start')
  let cx = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  const items: { d: string; fill: string }[] = []
  let pos = onPath ? onPath.start : 0
  for (const { g, fill: f } of glyphs) {
    const a = (g.advanceWidth ?? 0) * sc
    if (onPath) {
      const mid = pos + a / 2
      const phi = onPath.sweep === 1 ? Math.PI + mid / onPath.r : Math.PI - mid / onPath.r
      const px = onPath.cx + onPath.r * Math.cos(phi)
      const py = onPath.cy + onPath.r * Math.sin(phi)
      const rot = onPath.sweep === 1 ? phi + Math.PI / 2 : phi - Math.PI / 2
      const cos = Math.cos(rot), sin = Math.sin(rot)
      // glyph drawn with its baseline centre at the origin, then rotated and moved onto the arc
      const raw = g.getPath(-a / 2, 0, size)
      const pts = (raw.commands as { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }[]).map((c) => {
        const tr = (u: number, v: number) => `${r2(px + u * cos - v * sin)} ${r2(py + u * sin + v * cos)}`
        if (c.type === 'M' || c.type === 'L') return `${c.type}${tr(c.x!, c.y!)}`
        if (c.type === 'Q') return `Q${tr(c.x1!, c.y1!)} ${tr(c.x!, c.y!)}`
        if (c.type === 'C') return `C${tr(c.x1!, c.y1!)} ${tr(c.x2!, c.y2!)} ${tr(c.x!, c.y!)}`
        return 'Z'
      })
      items.push({ d: pts.join(''), fill: f })
      pos += a + ls
    } else {
      items.push({ d: g.getPath(Math.round(cx * 100) / 100, Math.round(y * 100) / 100, size).toPathData(2), fill: f })
      cx += a + ls
    }
  }
  const all = items.map((i) => i.d).join('')
  let out = ''
  if (stroke && sw) out += `<path d="${all}" fill="${stroke}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`
  const byFill = new Map<string, string>()
  for (const i of items) byFill.set(i.fill, (byFill.get(i.fill) ?? '') + i.d)
  for (const [f, d] of byFill) out += `<path d="${d}" fill="${f}"/>`
  return out
}

function serialise(el: XEl, defsPaths: Record<string, string>, clip = false): string {
  if (el.nodeType === 3) return ''
  const tag = el.tagName!
  if (tag === 'text') {
    if (clip) return `<path d="${[...textToPaths(el, defsPaths).matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join('')}"/>`
    return textToPaths(el, defsPaths)
  }
  let attrs = ''
  for (let i = 0; i < (el.attributes?.length ?? 0); i++) {
    const a = el.attributes!.item(i)
    if (a.name === 'href' && a.value.startsWith('/brand/')) {
      const png = readFileSync(join(HERE, '../../public', a.value)).toString('base64')
      attrs += ` href="data:image/png;base64,${png}"`
    } else attrs += ` ${a.name}="${esc(a.value)}"`
  }
  let inner = ''
  for (let i = 0; i < el.childNodes.length; i++) inner += serialise(el.childNodes.item(i), defsPaths, clip || tag === 'clipPath')
  return inner ? `<${tag}${attrs}>${inner}</${tag}>` : `<${tag}${attrs}/>`
}

function logoConcepts() {
  const parser = new DOMParser()
  for (const l of Object.values(LOGOS)) {
    const doc = parser.parseFromString(l.svg, 'image/svg+xml')
    const root = doc.documentElement as unknown as XEl
    // paths used only by textPath, kept out of the output
    const defsPaths: Record<string, string> = {}
    let defsOut = ''
    const layers: Layer[] = [{ id: 'background', label: 'Background', svg: rect(0, 0, 320, 240, l.bg) }]
    const used = new Map<string, number>()
    const name = (base: string) => {
      const n = (used.get(base) ?? 0) + 1
      used.set(base, n)
      return n > 1 ? `${base}-${n}` : base
    }
    const add = (el: XEl, wrapT = '') => {
      const tag = el.tagName!
      const svg = serialise(el, defsPaths)
      if (!svg) return
      let label = tag
      if (tag === 'text') label = 'Text: ' + (el.childNodes.length ? (el as unknown as { textContent: string }).textContent.replace(/\s+/g, ' ').trim() : '')
      else if (tag === 'image') label = 'Ball image'
      const base = tag === 'text' ? 'text-' + label.slice(6).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : tag === 'image' ? 'ball' : tag === 'g' ? 'group' : 'shape'
      layers.push({ id: name(base), label, svg: wrapT ? `<g transform="${wrapT}">${svg}</g>` : svg })
    }
    // collect arc definitions first
    for (let i = 0; i < root.childNodes.length; i++) {
      const c = root.childNodes.item(i)
      if (c.tagName === 'defs') {
        for (let j = 0; j < c.childNodes.length; j++) {
          const d = c.childNodes.item(j)
          if (d.tagName === 'path' && attr(d, 'id')) defsPaths[attr(d, 'id')] = attr(d, 'd')
        }
        for (let j = 0; j < c.childNodes.length; j++) {
          const d = c.childNodes.item(j)
          if (d.tagName === 'clipPath') defsOut += serialise(d, defsPaths)
        }
      }
    }
    for (let i = 0; i < root.childNodes.length; i++) {
      const c = root.childNodes.item(i)
      if (c.nodeType !== 1 || c.tagName === 'defs') continue
      const attrNames = Array.from({ length: c.attributes?.length ?? 0 }, (_, k) => c.attributes!.item(k).name)
      if (c.tagName === 'g' && attrNames.every((n) => n === 'transform')) {
        const t = attr(c, 'transform')
        for (let j = 0; j < c.childNodes.length; j++) {
          const k = c.childNodes.item(j)
          if (k.nodeType === 1) add(k, t)
        }
      } else add(c)
    }
    write({
      group: '1b-logo-concepts', slug: `concept-${l.id}`, title: `Logo ${l.id}: ${l.name}`, w: 960, h: 720,
      defs: defsOut || undefined,
      layers: layers.map((x) => ({ ...x, svg: `<g transform="scale(3)">${x.svg}</g>` })),
    })
  }
}

rmSync(OUT, { recursive: true, force: true })
logos()
logoConcepts()
banners()
pricingCards()
lineup()
shirts()
grounds()
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(written, null, 1))
console.log(`Wrote ${written.length} designs, ${written.reduce((n, d) => n + d.layers.length, 0)} layers to ${OUT}`)
