import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, corpsDe } from '../../src/configurateur/store'
import { sasCompatible } from '../../src/configurateur/geometrie/sas'

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
  it('reborne les sas quand le terrain rétrécit', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    etat().deplacerSas(0, { cote: 'nord', pos: 18 })
    etat().setTerrain({ l: 10 })
    expect(etat().config.cloture.sas[0].pos).toBeCloseTo(10 - 1.6)
  })

  it('supprime les sas devenus incompatibles après rebornage', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    etat().ajouterSas()
    etat().deplacerSas(0, { cote: 'nord', pos: 3 })
    etat().deplacerSas(1, { cote: 'nord', pos: 16 })
    expect(etat().config.cloture.sas).toHaveLength(2)
    // l = 5 : les positions se rabattent dans [1,6 ; 3,4], le second devient incompatible
    etat().setTerrain({ l: 5 })
    expect(etat().config.cloture.sas).toEqual([{ cote: 'nord', pos: 3 }])
  })

  it('vide la liste si la clôture est désactivée', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    etat().setCloture({ active: false })
    expect(etat().config.cloture.sas).toEqual([])
  })
})

describe('plusieurs sas', () => {
  it('ajoute deux sas à des emplacements compatibles', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    etat().ajouterSas()
    const sas = etat().config.cloture.sas
    expect(sas).toHaveLength(2)
    expect(sasCompatible(etat().config.terrain, sas[1], [sas[0]])).toBe(true)
    expect(etat().erreur).toBeNull()
  })

  it('refuse un déplacement qui colle un sas à un autre', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    etat().ajouterSas()
    etat().deplacerSas(0, { cote: 'sud', pos: 6 })
    etat().deplacerSas(1, { cote: 'sud', pos: 12 })
    expect(etat().deplacerSas(1, { cote: 'sud', pos: 7 })).toBe(false)
    expect(etat().config.cloture.sas[1]).toEqual({ cote: 'sud', pos: 12 })
    expect(etat().deplacerSas(1, { cote: 'sud', pos: 9 })).toBe(true)
  })

  it('signale l’absence de place', () => {
    etat().setCloture({ active: true })
    etat().setTerrain({ l: 5, w: 5 })
    for (let i = 0; i < 12; i++) etat().ajouterSas()
    expect(etat().config.cloture.sas.length).toBeLessThan(12)
    expect(etat().erreur).toContain('Pas de place')
  })

  it('retire le sas demandé', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    etat().ajouterSas()
    const reste = etat().config.cloture.sas[0]
    etat().retirerSas(1)
    expect(etat().config.cloture.sas).toEqual([reste])
  })

  it('annule un ajout de sas', () => {
    etat().setCloture({ active: true })
    etat().ajouterSas()
    expect(etat().config.cloture.sas).toHaveLength(1)
    etat().annuler()
    expect(etat().config.cloture.sas).toHaveLength(0)
  })
})

describe('corpsDe', () => {
  it('combine équipement et produit', () => {
    expect(corpsDe({ uid: 'u', id: 'HE-01', x: 1, z: 2, rot: 90 })).toMatchObject({ uid: 'u', x: 1, z: 2, rot: 90, w: 1.144, d: 1.223, clearance: 1 })
  })
})
