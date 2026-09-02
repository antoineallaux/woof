import { describe, it, expect } from 'vitest'
import { texteRecap } from '../../src/configurateur/ui/Recap'
import { CONFIG_DEFAUT, type Config } from '../../src/configurateur/types'

const base: Config = {
  ...CONFIG_DEFAUT,
  terrain: { l: 20, w: 15, sol: 'gazon' },
  equipements: [
    { uid: 'a', id: 'HE-01', x: 0, z: 0, rot: 0 },
    { uid: 'b', id: 'HE-02', x: 5, z: 0, rot: 0 },
  ],
}

describe('texteRecap', () => {
  it('donne surface et équipements quand la clôture est inactive', () => {
    expect(texteRecap(base)).toBe('300 m² · 2 équipements')
  })

  it('accorde le singulier', () => {
    expect(texteRecap({ ...base, equipements: [base.equipements[0]] })).toBe('300 m² · 1 équipement')
  })

  it('ajoute la longueur de clôture et le nombre de sas', () => {
    const config: Config = {
      ...base,
      cloture: { active: true, hauteur: 1.5, sas: [{ cote: 'nord', pos: 5 }, { cote: 'sud', pos: 5 }] },
    }
    // périmètre 70 m moins deux ouvertures de 1,2 m
    expect(texteRecap(config)).toBe('300 m² · 2 équipements · Clôture 67,6 ml · 2 sas')
  })

  it('omet les sas quand il n’y en a pas', () => {
    const config: Config = { ...base, cloture: { active: true, hauteur: 1.5, sas: [] } }
    expect(texteRecap(config)).toBe('300 m² · 2 équipements · Clôture 70 ml')
  })
})
