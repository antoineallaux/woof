import { describe, it, expect } from 'vitest'
import { encoder, decoder, lireHash } from '../../src/configurateur/url'
import { CONFIG_DEFAUT, type Config } from '../../src/configurateur/types'

const ids = new Set(['HE-01', 'HE-02'])
const config: Config = {
  nom: 'Parc de la Mairie',
  terrain: { l: 24, w: 18, sol: 'sable' },
  cloture: { active: true, hauteur: 1.8, sas: [{ cote: 'est', pos: 4.5 }, { cote: 'sud', pos: 12 }] },
  equipements: [
    { uid: 'a', id: 'HE-01', x: 1.2, z: -3.4, rot: 90 },
    { uid: 'b', id: 'HE-02', x: -5, z: 2, rot: 45 },
  ],
}

// même algorithme que l'encodeur, pour fabriquer des charges utiles arbitraires
function enBase64Url(objet: unknown): string {
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(objet))))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('encoder / decoder', () => {
  it('fait un aller-retour complet (hors uid régénérés)', () => {
    const res = decoder(encoder(config), ids)
    expect(res).not.toBeNull()
    const c = res!.config
    expect(c.nom).toBe('Parc de la Mairie')
    expect(c.terrain).toEqual(config.terrain)
    expect(c.cloture).toEqual(config.cloture)
    expect(c.equipements.map(({ id, x, z, rot }) => ({ id, x, z, rot })))
      .toEqual(config.equipements.map(({ id, x, z, rot }) => ({ id, x, z, rot })))
    expect(res!.ignores).toEqual([])
  })

  it('produit une chaîne sûre pour une URL', () => {
    expect(encoder(config)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('ignore les ids inconnus et le signale', () => {
    const res = decoder(encoder({ ...config, equipements: [{ uid: 'x', id: 'ZZ-99', x: 0, z: 0, rot: 0 }] }), ids)
    expect(res!.config.equipements).toEqual([])
    expect(res!.ignores).toEqual(['ZZ-99'])
  })

  it('borne les dimensions et corrige les valeurs invalides', () => {
    const brut = encoder({ ...config, terrain: { l: 500, w: 1, sol: 'béton' as never }, cloture: { active: true, hauteur: 9 as never, sas: [] } })
    const c = decoder(brut, ids)!.config
    expect(c.terrain).toEqual({ l: 60, w: 5, sol: 'gazon' })
    expect(c.cloture.hauteur).toBe(1.5)
  })

  it('retourne null sur une chaîne corrompue', () => {
    expect(decoder('%%%pas-du-base64', ids)).toBeNull()
    expect(decoder('', ids)).toBeNull()
  })

  it('accepte la config par défaut', () => {
    expect(decoder(encoder(CONFIG_DEFAUT), ids)!.config).toMatchObject({ nom: CONFIG_DEFAUT.nom })
  })
})

describe('sas dans l’URL', () => {
  it('relit un lien au format v1 avec un sas', () => {
    const brut = enBase64Url({ v: 1, n: 'Ancien lien', t: [20, 15, 'gazon'], c: [1, 1.5, 'nord', 5], e: [] })
    const c = decoder(brut, ids)!.config
    expect(c.cloture.sas).toEqual([{ cote: 'nord', pos: 5 }])
  })

  it('relit un lien au format v1 sans sas', () => {
    const brut = enBase64Url({ v: 1, n: 'Ancien lien', t: [20, 15, 'gazon'], c: [1, 1.5, null, null], e: [] })
    expect(decoder(brut, ids)!.config.cloture.sas).toEqual([])
  })

  it('ignore les sas invalides et reborne les positions', () => {
    const brut = enBase64Url({ v: 2, n: 'x', t: [20, 15, 'gazon'], c: [1, 1.5, [['haut', 3], ['nord', 'oui'], ['nord', 0], 'nawak']], e: [] })
    expect(decoder(brut, ids)!.config.cloture.sas).toEqual([{ cote: 'nord', pos: 1.6 }])
  })

  it('garde le premier de deux sas qui se chevauchent', () => {
    const brut = enBase64Url({ v: 2, n: 'x', t: [20, 15, 'gazon'], c: [1, 1.5, [['sud', 10], ['sud', 11], ['sud', 14]]], e: [] })
    expect(decoder(brut, ids)!.config.cloture.sas).toEqual([{ cote: 'sud', pos: 10 }, { cote: 'sud', pos: 14 }])
  })

  it('vide la liste quand la clôture est inactive', () => {
    const brut = enBase64Url({ v: 2, n: 'x', t: [20, 15, 'gazon'], c: [0, 1.5, [['sud', 10]]], e: [] })
    expect(decoder(brut, ids)!.config.cloture.sas).toEqual([])
  })
})

describe('lireHash', () => {
  it('extrait la valeur de cfg', () => {
    expect(lireHash('#cfg=abc_-1')).toBe('abc_-1')
    expect(lireHash('#autre=1')).toBeNull()
    expect(lireHash('')).toBeNull()
  })
})

describe('rotation négative', () => {
  it('est normalisée dans [0, 360)', () => {
    const c = decoder(encoder({ ...config, equipements: [{ uid: 'a', id: 'HE-01', x: 0, z: 0, rot: -90 }] }), ids)!.config
    expect(c.equipements[0].rot).toBe(270)
  })
})
