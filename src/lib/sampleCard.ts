import { GAMEWEEK_DEFAULT, managerFor, squadFor } from './data'
import { stadiumFor } from './stadium'
import { benchText, makeTeam } from './team'
import { toXY, type CardInput } from './pitch'

/** Formations to rotate through so the example cards do not all look alike. */
export const SAMPLE_FORMATIONS = ['4-2-3-1', '4-3-3', '3-4-2-1', '4-4-2', '5-3-2', '4-1-4-1', '3-5-2', '4-4-1-1']

/** The input for an example line-up card for one club: its default XI in its home kit, drawn like a real export. */
export function sampleCardInput(club: string, formation = '4-2-3-1'): CardInput {
  const t = makeTeam(club, formation)
  const squad = squadFor(club)
  const art = stadiumFor('matchdayxi', 'home')
  return {
    orient: 'portrait',
    shape: 'full',
    versus: false,
    homeName: club,
    awayName: '',
    homeForm: formation,
    awayForm: '',
    homeColour: t.colour,
    awayColour: '#19E6D1',
    gameweek: GAMEWEEK_DEFAULT,
    kind: 'Predicted XI',
    markers: t.slots.map((sl, idx) => {
      const [x, y] = toXY(sl.u, sl.v, 'portrait')
      const p = sl.pi != null ? squad[sl.pi] : undefined
      return { key: `h${idx}`, x, y, num: p?.num ?? null, name: p?.name ?? sl.role, colour: t.colour, ring: t.colour2, pattern: t.pattern }
    }),
    format: 'portrait',
    homeBench: benchText(t, squad),
    awayBench: '',
    stadium: art.shapes,
    ext: art.ext,
    watermark: false,
    transparent: false,
    handle: '',
    homeManager: managerFor(club),
    awayManager: '',
    markerStyle: 'shirt',
    labelPos: 'below',
  }
}
