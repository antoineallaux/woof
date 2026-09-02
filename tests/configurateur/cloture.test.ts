import { describe, it, expect } from 'vitest'
import { genererCloture, ESPACEMENT_POTEAUX } from '../../src/configurateur/geometrie/cloture'
import { LARGEUR_SAS } from '../../src/configurateur/geometrie/sas'

const t = { l: 20, w: 15 }

describe('genererCloture', () => {
  it('sans sas : 4 segments, périmètre complet', () => {
    const c = genererCloture(t, null)
    expect(c.segments).toHaveLength(4)
    expect(c.metres).toBe(70)
  })

  it('avec sas : le côté est coupé, les mètres déduits', () => {
    const c = genererCloture(t, { cote: 'sud', pos: 10 })
    expect(c.segments).toHaveLength(5)
    expect(c.metres).toBeCloseTo(70 - LARGEUR_SAS, 1)
    const sud = c.segments.filter((s) => s.from[1] === 7.5 && s.to[1] === 7.5)
    expect(sud).toHaveLength(2)
    expect(sud[0].to[0]).toBeCloseTo(LARGEUR_SAS / 2)
    expect(sud[1].from[0]).toBeCloseTo(-LARGEUR_SAS / 2)
  })

  it('pose des poteaux aux angles et tous les 2,5 m au plus, sans doublon', () => {
    const c = genererCloture(t, null)
    const cles = new Set(c.poteaux.map(([x, z]) => `${x},${z}`))
    expect(cles.size).toBe(c.poteaux.length)
    expect(cles.has('-10,-7.5')).toBe(true)
    expect(cles.has('10,7.5')).toBe(true)
    // 20 m → 8 intervalles, 15 m → 6 intervalles : 2×8 + 2×6 = 28 poteaux
    expect(c.poteaux).toHaveLength(28)
    for (const s of c.segments) {
      const len = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1])
      expect(len / Math.ceil(len / ESPACEMENT_POTEAUX)).toBeLessThanOrEqual(ESPACEMENT_POTEAUX)
    }
  })
})
