import { describe, it, expect } from 'vitest'
import {
  empreinte, marge, chevauche, dansTerrain, placementValide, snap, type Corps,
} from '../../src/configurateur/geometrie/collisions'

const terrain = { l: 20, w: 15 }
const corps = (uid: string, x: number, z: number, rot = 0): Corps =>
  ({ uid, x, z, w: 2, d: 1, rot, clearance: 1 })

describe('empreinte', () => {
  it('garde les dimensions à 0°', () => {
    expect(empreinte(0, 0, 2, 1, 0)).toEqual({ x: 0, z: 0, w: 2, d: 1 })
  })
  it('échange les dimensions à 90°', () => {
    const r = empreinte(0, 0, 2, 1, 90)
    expect(r.w).toBeCloseTo(1)
    expect(r.d).toBeCloseTo(2)
  })
  it('donne une AABB conservatrice à 45°', () => {
    const r = empreinte(0, 0, 2, 1, 45)
    expect(r.w).toBeCloseTo(3 / Math.SQRT2)
    expect(r.d).toBeCloseTo(3 / Math.SQRT2)
  })
})

describe('marge', () => {
  it('élargit de la marge de chaque côté', () => {
    expect(marge({ x: 1, z: 2, w: 2, d: 1 }, 1)).toEqual({ x: 1, z: 2, w: 4, d: 3 })
  })
})

describe('chevauche', () => {
  it('détecte un recouvrement', () => {
    expect(chevauche({ x: 0, z: 0, w: 2, d: 2 }, { x: 1, z: 1, w: 2, d: 2 })).toBe(true)
  })
  it('ne compte pas un simple contact', () => {
    expect(chevauche({ x: 0, z: 0, w: 2, d: 2 }, { x: 2, z: 0, w: 2, d: 2 })).toBe(false)
  })
})

describe('dansTerrain', () => {
  it('accepte un rect au bord', () => {
    expect(dansTerrain({ x: 9, z: 0, w: 2, d: 1 }, terrain)).toBe(true)
  })
  it('refuse un rect qui déborde', () => {
    expect(dansTerrain({ x: 9.5, z: 0, w: 2, d: 1 }, terrain)).toBe(false)
  })
})

describe('placementValide', () => {
  it('accepte un équipement seul au centre', () => {
    expect(placementValide(corps('a', 0, 0), [], terrain, [])).toBe(true)
  })
  it('refuse si la marge sort du terrain', () => {
    expect(placementValide(corps('a', 8.5, 0), [], terrain, [])).toBe(false)
  })
  it('refuse si mon corps entre dans la marge d’un autre', () => {
    expect(placementValide(corps('b', 2.5, 0), [corps('a', 0, 0)], terrain, [])).toBe(false)
  })
  it('accepte deux marges qui se recouvrent sans toucher un corps', () => {
    expect(placementValide(corps('b', 3, 0), [corps('a', 0, 0)], terrain, [])).toBe(true)
  })
  it('ignore soi-même dans la liste des autres', () => {
    expect(placementValide(corps('a', 0, 0), [corps('a', 0, 0)], terrain, [])).toBe(true)
  })
  it('refuse le chevauchement d’un sas', () => {
    const sas = [{ x: 0, z: 0, w: 1.2, d: 2 }]
    expect(placementValide(corps('a', 0, 0.5), [], terrain, sas)).toBe(false)
    expect(placementValide(corps('a', 0, 2), [], terrain, sas)).toBe(true)
  })
  it('refuse le chevauchement de n’importe quelle emprise de la liste', () => {
    const sas = [{ x: 0, z: 0, w: 1.2, d: 2 }, { x: 5, z: 0, w: 1.2, d: 2 }]
    expect(placementValide(corps('a', 5, 0.5), [], terrain, sas)).toBe(false)
    expect(placementValide(corps('a', -5, 0), [], terrain, sas)).toBe(true)
  })
})

describe('snap', () => {
  it('arrondit au dixième', () => {
    expect(snap(1.26)).toBeCloseTo(1.3)
    expect(snap(-0.04)).toBeCloseTo(0)
  })
})
