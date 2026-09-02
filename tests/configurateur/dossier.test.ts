import { describe, it, expect } from 'vitest'
import { htmlDossier } from '../../src/configurateur/export/dossier'
import type { Config } from '../../src/configurateur/types'

const config: Config = {
  nom: 'Parc <b>test</b>',
  terrain: { l: 20, w: 15, sol: 'sable' },
  cloture: { active: true, hauteur: 1.5, sas: [{ cote: 'sud', pos: 10 }] },
  equipements: [
    { uid: 'a', id: 'HE-01', x: 0, z: 0, rot: 0 },
    { uid: 'b', id: 'HE-01', x: 5, z: 0, rot: 0 },
    { uid: 'c', id: 'USB-01', x: -5, z: 0, rot: 90 },
  ],
}
const captures = { plan: 'data:image/png;base64,AAA', vue3d: 'data:image/png;base64,BBB', cadre: { left: 10, top: 20, width: 80, height: 60 } }

describe('htmlDossier', () => {
  const html = htmlDossier(config, captures, 'https://www.woof-parcs.fr/configurateur/#cfg=x')
  it('échappe le nom du projet', () => {
    expect(html).toContain('Parc &lt;b&gt;test&lt;/b&gt;')
    expect(html).not.toContain('<b>test</b>')
  })
  it('regroupe les équipements par produit avec quantités', () => {
    expect(html).toMatch(/Chest Press[\s\S]*?<td[^>]*>2<\/td>/)
    expect(html).toMatch(/Vélo Elliptique[\s\S]*?<td[^>]*>1<\/td>/)
  })
  it('mentionne le sol, la surface, la clôture et le sas', () => {
    expect(html).toContain('Sable')
    expect(html).toContain('300 m²')
    expect(html).toContain('68,8 ml')
    expect(html).toContain('1,50 m')
    expect(html).toContain('Sas d')
  })
  it('inclut les captures et le lien', () => {
    expect(html).toContain(captures.plan)
    expect(html).toContain(captures.vue3d)
    expect(html).toContain('#cfg=x')
  })
  it('compte les sas multiples et retire leur largeur des mètres linéaires', () => {
    const deux: Config = { ...config, cloture: { ...config.cloture, sas: [{ cote: 'sud', pos: 5 }, { cote: 'nord', pos: 10 }] } }
    const h = htmlDossier(deux, captures, 'https://www.woof-parcs.fr/configurateur/#cfg=x')
    expect(h).toContain('67,6 ml')
    expect(h).toMatch(/Sas d[\s\S]*?<td[^>]*>2<\/td>/)
  })
})
