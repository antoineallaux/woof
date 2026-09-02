import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'

const PLAN_SOL = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const tmp = new THREE.Vector3()

/** Intersection du rayon de l'événement avec le plan du sol (y = 0), en coordonnées monde. */
export function pointSol(e: ThreeEvent<PointerEvent>): THREE.Vector3 | null {
  return e.ray.intersectPlane(PLAN_SOL, tmp) ? tmp.clone() : null
}
