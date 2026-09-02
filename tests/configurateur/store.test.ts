import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, corpsDe } from '../../src/configurateur/store'

const etat = () => useStore.getState()

beforeEach(() => useStore.getState().reinitialiser())

describe('placer', () => {
  it('ajoute un équipement valide et le sélectionne', () => {
    expect(etat().placer('HE-01', 0.04, 0)).toBe(true)
    const [e] = etat().config.equipements
    expect(e.id).toBe('HE-01')
    expect(e.x).toBe(0)
    expect(etat().selection).toEqual([e.uid])
    expect(etat().outil).toBeNull()
  })
  it('refuse un placement hors terrain et pose une erreur', () => {
    expect(etat().placer('HE-01', 9.9, 0)).toBe(false)
    expect(etat().config.equipements).toHaveLength(0)
    expect(etat().erreur).toContain('dégagement')
  })
  it('refuse un id inconnu', () => {
    expect(etat().placer('ZZ', 0, 0)).toBe(false)
  })
})

describe('deplacer', () => {
  it('déplace un groupe si toutes les positions sont valides', () => {
    etat().placer('HE-01', 0, 0)
    etat().placer('HE-02', 5, 0)
    const uids = etat().config.equipements.map((e) => e.uid)
    etat().enregistrer()
    expect(etat().deplacer(uids, 1, 1, false)).toBe(true)
    expect(etat().config.equipements.map((e) => e.x)).toEqual([1, 6])
  })
  it('refuse en bloc si un élément sort', () => {
    etat().placer('HE-01', 0, 0)
    etat().placer('HE-02', 5, 0)
    const uids = etat().config.equipements.map((e) => e.uid)
    expect(etat().deplacer(uids, 4, 0, false)).toBe(false)
    expect(etat().config.equipements.map((e) => e.x)).toEqual([0, 5])
  })
})

describe('undo / redo', () => {
  it('annule et rétablit un placement', () => {
    etat().placer('HE-01', 0, 0)
    etat().annuler()
    expect(etat().config.equipements).toHaveLength(0)
    etat().retablir()
    expect(etat().config.equipements).toHaveLength(1)
  })
  it('un drag ne crée qu’une seule étape', () => {
    etat().placer('HE-01', 0, 0)
    const [uid] = etat().selection
    etat().enregistrer()
    etat().deplacer([uid], 1, 0, false)
    etat().deplacer([uid], 1, 0, false)
    etat().annuler()
    expect(etat().config.equipements[0].x).toBe(0)
  })
})

describe('terrain et sas', () => {
  it('reborne le sas quand le terrain rétrécit', () => {
    etat().setCloture({ active: true })
    etat().setSas({ cote: 'nord', pos: 18 })
    etat().setTerrain({ l: 10 })
    expect(etat().config.cloture.sas!.pos).toBeCloseTo(10 - 1.6)
  })
  it('retire le sas si la clôture est désactivée', () => {
    etat().setCloture({ active: true })
    etat().setSas({ cote: 'nord', pos: 5 })
    etat().setCloture({ active: false })
    expect(etat().config.cloture.sas).toBeNull()
  })
})

describe('corpsDe', () => {
  it('combine équipement et produit', () => {
    expect(corpsDe({ uid: 'u', id: 'HE-01', x: 1, z: 2, rot: 90 })).toMatchObject({ uid: 'u', x: 1, z: 2, rot: 90, w: 1.144, d: 1.223, clearance: 1 })
  })
})
