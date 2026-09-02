import { useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useStore } from '../store'
import { LARGEUR_SAS, PROFONDEUR_SAS, pointSurCote, projeterSurCote } from '../geometrie/sas'

const PLAN_SOL = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const tmp = new THREE.Vector3()
const VERT = '#2F5B3A'
const PORTILLON = '#7CB342'

export function Sas() {
  const terrain = useStore((s) => s.config.terrain)
  const { active, hauteur, sas } = useStore((s) => s.config.cloture)
  const setSas = useStore((s) => s.setSas)
  const enregistrer = useStore((s) => s.enregistrer)
  const setDragging = useStore((s) => s.setDragging)
  const actif = useRef(false)
  if (!active || !sas) return null

  const { x, z, angle } = pointSurCote(terrain, sas.cote, sas.pos)
  const h = hauteur
  const l2 = LARGEUR_SAS / 2
  const p2 = PROFONDEUR_SAS / 2

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    enregistrer()
    actif.current = true
    setDragging(true)
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!actif.current || !e.ray.intersectPlane(PLAN_SOL, tmp)) return
    const next = projeterSurCote(terrain, tmp.x, tmp.z)
    if (next.cote !== sas.cote || next.pos !== sas.pos) setSas(next)
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    ;(e.target as Element).releasePointerCapture(e.pointerId)
    actif.current = false
    setDragging(false)
  }

  // repère local : x le long du côté, z perpendiculaire (profondeur), sas à cheval sur la clôture
  return (
    <group position={[x, 0, z]} rotation-y={angle} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
      {/* parois latérales */}
      {[-l2, l2].map((px) => (
        <mesh key={px} position={[px, h / 2, 0]} castShadow>
          <boxGeometry args={[0.04, h, PROFONDEUR_SAS]} />
          <meshStandardMaterial color={VERT} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* deux portillons */}
      {[-p2, p2].map((pz) => (
        <mesh key={pz} position={[0, (h - 0.05) / 2, pz]} castShadow>
          <boxGeometry args={[LARGEUR_SAS - 0.08, h - 0.05, 0.04]} />
          <meshStandardMaterial color={PORTILLON} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* poteaux d'angle */}
      {([[-l2, -p2], [l2, -p2], [-l2, p2], [l2, p2]] as const).map(([px, pz], i) => (
        <mesh key={i} position={[px, (h + 0.1) / 2, pz]}>
          <cylinderGeometry args={[0.04, 0.04, h + 0.1, 10]} />
          <meshStandardMaterial color={VERT} />
        </mesh>
      ))}
      {/* dalle de saisie */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <planeGeometry args={[LARGEUR_SAS, PROFONDEUR_SAS]} />
        <meshBasicMaterial color={PORTILLON} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}
