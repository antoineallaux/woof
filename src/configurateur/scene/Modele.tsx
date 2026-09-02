import { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { Produit } from '../catalogue'

const DRACO = '/draco/'

function mesurer(o: THREE.Object3D): { size: THREE.Vector3; box: THREE.Box3 } {
  o.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(o)
  const size = new THREE.Vector3()
  box.getSize(size)
  return { size, box }
}

/**
 * Clone le GLB, redresse l'axe de hauteur, met à l'échelle sur la plus grande dimension,
 * oriente la plus grande dimension horizontale sur x, pose au sol et centre. Pur three, testable.
 */
export function preparerModele(source: THREE.Object3D, p: Produit): THREE.Group {
  const model = source.clone(true)
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true }
  })

  const axe = new THREE.Group()
  axe.add(model)
  let { size } = mesurer(axe)
  // axe de hauteur = celui dont la proportion (taille / plus grande taille) est la plus proche de h / max(w,d,h)
  const maxModele = Math.max(size.x, size.y, size.z)
  const ratioH = p.h / Math.max(p.w, p.d, p.h)
  const diffs = ([['x', size.x], ['y', size.y], ['z', size.z]] as const)
    // léger biais vers y (GLB généralement déjà debout) : pas de rotation en cas de quasi-égalité
    .map(([a, v]) => ({ a, diff: Math.abs(v / maxModele - ratioH) - (a === 'y' ? 0.02 : 0) }))
    .sort((u, v) => u.diff - v.diff)
  if (diffs[0].a === 'z') axe.rotation.x = -Math.PI / 2
  else if (diffs[0].a === 'x') axe.rotation.z = Math.PI / 2

  const orient = new THREE.Group()
  orient.add(axe)
  size = mesurer(orient).size
  const scale = Math.max(p.w, p.d, p.h) / Math.max(size.x, size.y, size.z)
  axe.scale.setScalar(scale)
  size = mesurer(orient).size
  if ((p.w >= p.d) !== (size.x >= size.z)) orient.rotation.y = Math.PI / 2

  const wrapper = new THREE.Group()
  wrapper.add(orient)
  const { box } = mesurer(wrapper)
  const centre = new THREE.Vector3()
  box.getCenter(centre)
  orient.position.set(-centre.x, -box.min.y, -centre.z)
  wrapper.updateMatrixWorld(true)
  return wrapper
}

export function Modele({ produit }: { produit: Produit }) {
  const { scene } = useGLTF(produit.glb, DRACO)
  const objet = useMemo(() => preparerModele(scene, produit), [scene, produit])
  return <primitive object={objet} />
}
