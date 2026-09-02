import type { Terrain } from './collisions'
import { LARGEUR_SAS, longueurCote, type Cote, type Sas } from './sas'

export interface Segment { from: [number, number]; to: [number, number] }
export interface Cloture { segments: Segment[]; poteaux: [number, number][]; metres: number }

export const ESPACEMENT_POTEAUX = 2.5

const arr = (v: number) => Number(v.toFixed(3))

function lerp(a: [number, number], b: [number, number], t: number): [number, number] {
  return [arr(a[0] + (b[0] - a[0]) * t), arr(a[1] + (b[1] - a[1]) * t)]
}

/** Segments et poteaux du périmètre, sens horaire depuis l'angle nord-ouest. */
export function genererCloture(t: Terrain, sas: Sas[]): Cloture {
  const l2 = t.l / 2
  const w2 = t.w / 2
  const cotes: { cote: Cote; from: [number, number]; to: [number, number] }[] = [
    { cote: 'nord', from: [-l2, -w2], to: [l2, -w2] },
    { cote: 'est', from: [l2, -w2], to: [l2, w2] },
    { cote: 'sud', from: [l2, w2], to: [-l2, w2] },
    { cote: 'ouest', from: [-l2, w2], to: [-l2, -w2] },
  ]

  const segments: Segment[] = []
  for (const c of cotes) {
    const len = longueurCote(t, c.cote)
    const ouvertures = sas.filter((s) => s.cote === c.cote).sort((a, b) => a.pos - b.pos)
    // découpe du côté par les ouvertures successives, en mètres depuis le début du côté
    let curseur = 0
    const couper = (a: number, b: number) => {
      if (b - a < 0.01) return
      segments.push({ from: lerp(c.from, c.to, a / len), to: lerp(c.from, c.to, b / len) })
    }
    for (const o of ouvertures) {
      couper(curseur, Math.max(curseur, o.pos - LARGEUR_SAS / 2))
      curseur = Math.max(curseur, o.pos + LARGEUR_SAS / 2)
    }
    couper(curseur, len)
  }

  const poteaux = new Map<string, [number, number]>()
  for (const s of segments) {
    const len = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1])
    const n = Math.max(1, Math.ceil(len / ESPACEMENT_POTEAUX))
    for (let i = 0; i <= n; i++) {
      const p = lerp(s.from, s.to, i / n)
      poteaux.set(`${p[0]},${p[1]}`, p)
    }
  }

  const metres = 2 * (t.l + t.w) - sas.length * LARGEUR_SAS
  return { segments, poteaux: [...poteaux.values()], metres: Math.round(metres * 10) / 10 }
}
