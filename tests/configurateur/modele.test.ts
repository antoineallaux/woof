import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { preparerModele } from '../../src/configurateur/scene/Modele'

const produit = { id: 'T', ref: 'T', name: 'Test', category: 'x', w: 2, d: 1, h: 3, clearance: 1, image: '', glb: '', slug: null }

function boite(sx: number, sy: number, sz: number, decalage = 10) {
  const g = new THREE.Group()
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz))
  m.position.set(decalage, decalage, decalage)
  g.add(m)
  return g
}

function taille(o: THREE.Object3D) {
  o.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(o)
  const s = new THREE.Vector3()
  b.getSize(s)
  return { s, min: b.min, max: b.max }
}

describe('preparerModele', () => {
  it('met à l’échelle, pose au sol et centre un modèle déjà debout', () => {
    const { s, min, max } = taille(preparerModele(boite(200, 300, 100), produit))
    expect(s.x).toBeCloseTo(2); expect(s.y).toBeCloseTo(3); expect(s.z).toBeCloseTo(1)
    expect(min.y).toBeCloseTo(0)
    expect((min.x + max.x) / 2).toBeCloseTo(0)
    expect((min.z + max.z) / 2).toBeCloseTo(0)
  })
  it('redresse un modèle dont la hauteur est sur Z', () => {
    const { s } = taille(preparerModele(boite(200, 100, 300), produit))
    expect(s.y).toBeCloseTo(3)
  })
  it('oriente la plus grande dimension horizontale sur x', () => {
    const { s } = taille(preparerModele(boite(100, 300, 200), produit))
    expect(s.x).toBeCloseTo(2); expect(s.z).toBeCloseTo(1)
  })
})
