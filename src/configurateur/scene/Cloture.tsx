import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import { genererCloture } from '../geometrie/cloture'
import { textureGrillage } from './textures'

const VERT = '#2F5B3A'

export function Cloture() {
  const terrain = useStore((s) => s.config.terrain)
  const { active, hauteur, sas } = useStore((s) => s.config.cloture)
  const cloture = useMemo(() => genererCloture(terrain, sas), [terrain, sas])
  const grille = useMemo(() => textureGrillage(), [])
  // une texture clonée par segment, recréée seulement si les segments ou la hauteur changent
  const cartes = useMemo(
    () =>
      cloture.segments.map((s) => {
        const len = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1])
        const map = grille.clone()
        map.repeat.set(len / 0.5, hauteur / 0.5)
        map.needsUpdate = true
        return map
      }),
    [cloture.segments, hauteur, grille],
  )
  useEffect(() => () => cartes.forEach((m) => m.dispose()), [cartes])
  if (!active) return null

  return (
    <group>
      {cloture.segments.map((s, i) => {
        const dx = s.to[0] - s.from[0]
        const dz = s.to[1] - s.from[1]
        const len = Math.hypot(dx, dz)
        if (len < 0.01) return null
        return (
          <mesh key={i} position={[(s.from[0] + s.to[0]) / 2, hauteur / 2, (s.from[1] + s.to[1]) / 2]} rotation-y={-Math.atan2(dz, dx)} castShadow>
            <planeGeometry args={[len, hauteur]} />
            <meshStandardMaterial map={cartes[i]} transparent alphaTest={0.4} side={THREE.DoubleSide} color={VERT} />
          </mesh>
        )
      })}
      {cloture.poteaux.map(([x, z], i) => (
        <mesh key={i} position={[x, (hauteur + 0.1) / 2, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, hauteur + 0.1, 10]} />
          <meshStandardMaterial color={VERT} />
        </mesh>
      ))}
      {/* lisse haute */}
      {cloture.segments.map((s, i) => {
        const dx = s.to[0] - s.from[0]
        const dz = s.to[1] - s.from[1]
        const len = Math.hypot(dx, dz)
        if (len < 0.01) return null
        return (
          <mesh key={`l${i}`} position={[(s.from[0] + s.to[0]) / 2, hauteur, (s.from[1] + s.to[1]) / 2]} rotation-y={-Math.atan2(dz, dx)}>
            <boxGeometry args={[len, 0.03, 0.03]} />
            <meshStandardMaterial color={VERT} />
          </mesh>
        )
      })}
    </group>
  )
}
