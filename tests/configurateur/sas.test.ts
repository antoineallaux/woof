import { describe, it, expect } from 'vitest'
import {
  LARGEUR_SAS, PROFONDEUR_SAS, ECART_SAS, longueurCote, bornerPos, pointSurCote, projeterSurCote,
  empriseSas, emprisesSas, sasCompatible,
} from '../../src/configurateur/geometrie/sas'

const t = { l: 20, w: 15 }

describe('longueurCote', () => {
  it('nord/sud = l, est/ouest = w', () => {
    expect(longueurCote(t, 'nord')).toBe(20)
    expect(longueurCote(t, 'ouest')).toBe(15)
  })
})

describe('bornerPos', () => {
  it('garde 1 m + demi-sas des angles', () => {
    const min = 1 + LARGEUR_SAS / 2
    expect(bornerPos(t, 'nord', 0)).toBeCloseTo(min)
    expect(bornerPos(t, 'nord', 30)).toBeCloseTo(20 - min)
    expect(bornerPos(t, 'nord', 10)).toBe(10)
  })
})

describe('pointSurCote', () => {
  it('place au milieu du côté sud', () => {
    const p = pointSurCote(t, 'sud', 10)
    expect(p.x).toBeCloseTo(0)
    expect(p.z).toBeCloseTo(7.5)
    expect(p.angle).toBe(0)
  })
  it('parcourt le côté est du nord vers le sud', () => {
    const p = pointSurCote(t, 'est', 2)
    expect(p.x).toBeCloseTo(10)
    expect(p.z).toBeCloseTo(-5.5)
    expect(p.angle).toBeCloseTo(Math.PI / 2)
  })
  it('parcourt le côté sud d’est en ouest', () => {
    expect(pointSurCote(t, 'sud', 2).x).toBeCloseTo(8)
  })
  it('parcourt le côté ouest du sud vers le nord', () => {
    expect(pointSurCote(t, 'ouest', 2).z).toBeCloseTo(5.5)
  })
})

describe('projeterSurCote', () => {
  it('choisit le côté le plus proche et borne la position', () => {
    expect(projeterSurCote(t, 3, 9)).toEqual({ cote: 'sud', pos: 7 })
    expect(projeterSurCote(t, -12, -1)).toEqual({ cote: 'ouest', pos: 8.5 })
    expect(projeterSurCote(t, -9.9, 7.2)).toEqual({ cote: 'ouest', pos: 1 + LARGEUR_SAS / 2 })
  })
})

describe('empriseSas', () => {
  it('est à cheval sur la clôture, profondeur sur l’axe perpendiculaire', () => {
    expect(empriseSas(t, { cote: 'sud', pos: 10 })).toEqual({ x: 0, z: 7.5, w: LARGEUR_SAS, d: PROFONDEUR_SAS })
    const e = empriseSas(t, { cote: 'est', pos: 7.5 })
    expect(e).toEqual({ x: 10, z: 0, w: PROFONDEUR_SAS, d: LARGEUR_SAS })
  })
})

describe('emprisesSas', () => {
  it('rend une emprise par sas, dans l’ordre', () => {
    expect(emprisesSas(t, [])).toEqual([])
    const rects = emprisesSas(t, [{ cote: 'sud', pos: 10 }, { cote: 'est', pos: 7.5 }])
    expect(rects).toHaveLength(2)
    expect(rects[0]).toEqual({ x: 0, z: 7.5, w: LARGEUR_SAS, d: PROFONDEUR_SAS })
    expect(rects[1]).toEqual({ x: 10, z: 0, w: PROFONDEUR_SAS, d: LARGEUR_SAS })
  })
})

describe('sasCompatible', () => {
  it('accepte un sas seul', () => {
    expect(sasCompatible(t, { cote: 'sud', pos: 10 }, [])).toBe(true)
  })
  it('ignore les sas des autres côtés', () => {
    expect(sasCompatible(t, { cote: 'sud', pos: 10 }, [{ cote: 'nord', pos: 10 }])).toBe(true)
  })
  it('refuse deux emprises trop proches sur le même côté', () => {
    const autres = [{ cote: 'sud' as const, pos: 10 }]
    expect(sasCompatible(t, { cote: 'sud', pos: 10 }, autres)).toBe(false)
    expect(sasCompatible(t, { cote: 'sud', pos: 11 }, autres)).toBe(false)
    expect(sasCompatible(t, { cote: 'sud', pos: 10 + LARGEUR_SAS + ECART_SAS - 0.01 }, autres)).toBe(false)
  })
  it('accepte à l’écart minimal exact', () => {
    const autres = [{ cote: 'sud' as const, pos: 10 }]
    expect(sasCompatible(t, { cote: 'sud', pos: 10 + LARGEUR_SAS + ECART_SAS }, autres)).toBe(true)
    expect(sasCompatible(t, { cote: 'sud', pos: 10 - LARGEUR_SAS - ECART_SAS }, autres)).toBe(true)
  })
})

describe('bornerPos sur un côté trop court', () => {
  it('centre le sas quand les marges ne tiennent pas', () => {
    expect(bornerPos({ l: 2, w: 2 }, 'nord', 0.4)).toBe(1)
  })
})
