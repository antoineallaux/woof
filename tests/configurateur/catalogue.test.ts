import { describe, it, expect } from 'vitest'
import { CATALOGUE, getProduit } from '../../src/configurateur/catalogue'

describe('catalogue', () => {
  it('contient 10 produits avec des dimensions positives', () => {
    expect(CATALOGUE).toHaveLength(10)
    for (const p of CATALOGUE) {
      expect(p.w).toBeGreaterThan(0)
      expect(p.d).toBeGreaterThan(0)
      expect(p.h).toBeGreaterThan(0)
      expect(p.clearance).toBeGreaterThanOrEqual(0)
      expect(p.glb).toMatch(/^\/models\/.+\.glb$/)
    }
  })

  it('retrouve un produit par id', () => {
    expect(getProduit('HE-01')?.name).toBe('Chest Press')
    expect(getProduit('inconnu')).toBeUndefined()
  })
})
