import type { Rect, Terrain } from './collisions'

export type Cote = 'nord' | 'est' | 'sud' | 'ouest'
export interface Sas { cote: Cote; pos: number }

export const LARGEUR_SAS = 1.2
export const PROFONDEUR_SAS = 2
export const MARGE_ANGLE = 1

export function longueurCote(t: Terrain, cote: Cote): number {
  return cote === 'nord' || cote === 'sud' ? t.l : t.w
}

export function bornerPos(t: Terrain, cote: Cote, pos: number): number {
  const min = MARGE_ANGLE + LARGEUR_SAS / 2
  const max = longueurCote(t, cote) - min
  return Math.min(max, Math.max(min, pos))
}

/** Centre du sas sur la ligne de clôture et angle (rotation Y) tel que la profondeur soit perpendiculaire au côté. */
export function pointSurCote(t: Terrain, cote: Cote, pos: number): { x: number; z: number; angle: number } {
  const l2 = t.l / 2
  const w2 = t.w / 2
  switch (cote) {
    case 'nord': return { x: -l2 + pos, z: -w2, angle: 0 }
    case 'est': return { x: l2, z: -w2 + pos, angle: Math.PI / 2 }
    case 'sud': return { x: l2 - pos, z: w2, angle: 0 }
    case 'ouest': return { x: -l2, z: w2 - pos, angle: Math.PI / 2 }
  }
}

export function projeterSurCote(t: Terrain, x: number, z: number): Sas {
  const l2 = t.l / 2
  const w2 = t.w / 2
  const candidats: { cote: Cote; dist: number; pos: number }[] = [
    { cote: 'nord', dist: Math.abs(z + w2), pos: x + l2 },
    { cote: 'est', dist: Math.abs(x - l2), pos: z + w2 },
    { cote: 'sud', dist: Math.abs(z - w2), pos: l2 - x },
    { cote: 'ouest', dist: Math.abs(x + l2), pos: w2 - z },
  ]
  candidats.sort((a, b) => a.dist - b.dist)
  const { cote, pos } = candidats[0]
  return { cote, pos: Number(bornerPos(t, cote, pos).toFixed(4)) }
}

export function empriseSas(t: Terrain, sas: Sas): Rect {
  const p = pointSurCote(t, sas.cote, sas.pos)
  const horizontal = sas.cote === 'nord' || sas.cote === 'sud'
  return {
    x: Number(p.x.toFixed(4)),
    z: Number(p.z.toFixed(4)),
    w: horizontal ? LARGEUR_SAS : PROFONDEUR_SAS,
    d: horizontal ? PROFONDEUR_SAS : LARGEUR_SAS,
  }
}
