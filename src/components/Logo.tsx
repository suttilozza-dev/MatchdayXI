import { LOGOS } from '#/lib/logos'

/**
 * Renders one of the approved logo concepts (palette A). `symbolOnly` crops away the wordmark line
 * under the symbol so it can sit in a header next to live text.
 */
export function Logo({ id, symbolOnly = false, className, label }: { id: string; symbolOnly?: boolean; className?: string; label?: string }) {
  const l = LOGOS[id]
  if (!l) return null
  let svg = l.svg.replace('<svg ', `<svg width="100%" height="100%" `)
  if (symbolOnly) svg = svg.replace('viewBox="0 0 320 240"', id === '03B' ? 'viewBox="66 6 188 168"' : 'viewBox="0 0 320 198"')
  return <span className={className} role="img" aria-label={label ?? `${l.name} logo`} style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <span className="font-display font-bold" style={{ fontSize: size, letterSpacing: '0.04em' }}>
      MATCHDAY <span style={{ color: 'var(--boot-lime)' }}>XI</span>
    </span>
  )
}

/** Header lockup: Line Shirt symbol (main logo 03B) + live wordmark. */
export function HeaderLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span style={{ width: 40, height: 36, display: 'inline-block' }}>
        <Logo id="03B" symbolOnly label="Matchday XI" />
      </span>
      <Wordmark />
    </span>
  )
}
