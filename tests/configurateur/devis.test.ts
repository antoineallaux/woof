import { describe, it, expect, vi } from 'vitest'
// panier.js touche document/localStorage au chargement : on le neutralise
vi.mock('../../src/scripts/panier.js', () => ({ ajouter: vi.fn(), changerQty: vi.fn() }))
import { lignesDevis, resumeConfig } from '../../src/configurateur/export/devis'
import type { Config } from '../../src/configurateur/types'

const config: Config = {
  nom: 'Parc de la Mairie',
  terrain: { l: 20, w: 15, sol: 'gazon' },
  cloture: { active: true, hauteur: 1.8, sas: [{ cote: 'est', pos: 5 }] },
  equipements: [
    { uid: 'a', id: 'HE-01', x: 0, z: 0, rot: 0 },
    { uid: 'b', id: 'HE-01', x: 5, z: 0, rot: 0 },
    { uid: 'c', id: 'USB-01', x: -5, z: 0, rot: 0 },
  ],
}

describe('lignesDevis', () => {
  it('regroupe les équipements et ajoute clôture et sas', () => {
    const lignes = lignesDevis(config)
    expect(lignes).toEqual([
      { slug: 'HE-01', name: 'Chest Press', ref: 'HE-01', image: '/assets/configurateur/HE-01.webp', qty: 2 },
      { slug: 'USB-01', name: 'Vélo Elliptique', ref: 'USB-01', image: '/assets/configurateur/USB-01.webp', qty: 1 },
      { slug: 'cloture-1-8', name: 'Clôture grillagée 1,80 m — 68,8 ml', ref: 'CLOTURE', image: '/assets/configurateur/cloture.svg', qty: 1 },
      { slug: 'sas-entree', name: "Sas d'entrée à double portillon", ref: 'SAS', image: '/assets/configurateur/sas.svg', qty: 1 },
    ])
  })
  it('compte les sas et déduit leur largeur des mètres linéaires', () => {
    const lignes = lignesDevis({
      ...config,
      cloture: { active: true, hauteur: 1.8, sas: [{ cote: 'est', pos: 5 }, { cote: 'nord', pos: 8 }] },
    })
    expect(lignes[2].name).toBe('Clôture grillagée 1,80 m — 67,6 ml')
    expect(lignes[3]).toEqual({ slug: 'sas-entree', name: "Sas d'entrée à double portillon", ref: 'SAS', image: '/assets/configurateur/sas.svg', qty: 2 })
  })
  it('utilise le slug Woof quand il existe', () => {
    const lignes = lignesDevis({ ...config, equipements: [{ uid: 'a', id: 'HE-02', x: 0, z: 0, rot: 0 }] }, { 'HE-02': 'epaules-woof' })
    expect(lignes[0].slug).toBe('epaules-woof')
  })
  it('sans clôture : pas de ligne clôture ni sas', () => {
    const lignes = lignesDevis({ ...config, cloture: { active: false, hauteur: 1.5, sas: [] } })
    expect(lignes.map((l) => l.ref)).toEqual(['HE-01', 'USB-01'])
  })
})

describe('resumeConfig', () => {
  it('décrit le projet en texte', () => {
    const r = resumeConfig(config, 'https://www.woof-parcs.fr/configurateur/#cfg=x')
    expect(r).toContain('Parc de la Mairie')
    expect(r).toContain('20 × 15 m (300 m²)')
    expect(r).toContain('gazon')
    expect(r).toContain('68,8 ml')
    expect(r).toContain('avec 1 sas')
    expect(r).toContain('#cfg=x')
  })
  it('mentionne le nombre de sas et le cas sans sas', () => {
    const deux = resumeConfig({ ...config, cloture: { active: true, hauteur: 1.8, sas: [{ cote: 'est', pos: 5 }, { cote: 'nord', pos: 8 }] } }, 'x')
    expect(deux).toContain('avec 2 sas')
    const aucun = resumeConfig({ ...config, cloture: { active: true, hauteur: 1.8, sas: [] } }, 'x')
    expect(aucun).toContain('sans sas')
  })
})
