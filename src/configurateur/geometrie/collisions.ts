export interface Rect { x: number; z: number; w: number; d: number }
export interface Terrain { l: number; w: number }
export interface Corps {
  uid: string
  x: number
  z: number
  w: number
  d: number
  rot: number
  clearance: number
}

const EPS = 1e-6

/** AABB d'un rectangle w×d centré en (x,z) et pivoté de rot degrés. */
export function empreinte(x: number, z: number, w: number, d: number, rot: number): Rect {
  const r = (rot * Math.PI) / 180
  const c = Math.abs(Math.cos(r))
  const s = Math.abs(Math.sin(r))
  return { x, z, w: w * c + d * s, d: w * s + d * c }
}

export function marge(r: Rect, m: number): Rect {
  return { x: r.x, z: r.z, w: r.w + 2 * m, d: r.d + 2 * m }
}

/** Recouvrement strict : un simple contact de bord ne compte pas. */
export function chevauche(a: Rect, b: Rect): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 - EPS &&
    Math.abs(a.z - b.z) < (a.d + b.d) / 2 - EPS
  )
}

export function dansTerrain(r: Rect, t: Terrain): boolean {
  return Math.abs(r.x) + r.w / 2 <= t.l / 2 + EPS && Math.abs(r.z) + r.d / 2 <= t.w / 2 + EPS
}

export function corpsRect(c: Corps): Rect {
  return empreinte(c.x, c.z, c.w, c.d, c.rot)
}

/**
 * Règle : ma marge reste dans le terrain ; mon corps n'entre pas dans la marge
 * d'un autre ; ma marge n'entre pas dans le corps d'un autre ; mon corps ne
 * chevauche aucun sas. Deux marges peuvent se recouvrir.
 */
export function placementValide(c: Corps, autres: Corps[], t: Terrain, sas: Rect[]): boolean {
  const corps = corpsRect(c)
  const zone = marge(corps, c.clearance)
  if (!dansTerrain(zone, t)) return false
  for (const r of sas) if (chevauche(corps, r)) return false
  for (const a of autres) {
    if (a.uid === c.uid) continue
    const ca = corpsRect(a)
    if (chevauche(zone, ca) || chevauche(corps, marge(ca, a.clearance))) return false
  }
  return true
}

export function snap(v: number, pas = 0.1): number {
  const r = Math.round(v / pas) * pas
  return Object.is(r, -0) ? 0 : Number(r.toFixed(4))
}
