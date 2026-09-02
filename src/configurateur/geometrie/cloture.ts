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
export function genererCloture(t: Terrain, sas: Sas | null): Cloture {
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
    if (sas && sas.cote === c.cote) {
      const a = (sas.pos - LARGEUR_SAS / 2) / len
      const b = (sas.pos + LARGEUR_SAS / 2) / len
      segments.push({ from: c.from, to: lerp(c.from, c.to, a) })
      segments.push({ from: lerp(c.from, c.to, b), to: c.to })
    } else {
      segments.push({ from: c.from, to: c.to })
    }
  }

  const poteaux = new Map<string, [number, number]>()
  let metres = 0
  for (const s of segments) {
    const len = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1])
    metres += len
    const n = Math.max(1, Math.ceil(len / ESPACEMENT_POTEAUX))
    for (let i = 0; i <= n; i++) {
      const p = lerp(s.from, s.to, i / n)
      poteaux.set(`${p[0]},${p[1]}`, p)
    }
  }

  return { segments, poteaux: [...poteaux.values()], metres: Math.round(metres * 10) / 10 }
}
