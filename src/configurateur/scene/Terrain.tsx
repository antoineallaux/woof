import { useEffect, useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useStore, corpsDe, sasRect } from '../store'
import { getProduit } from '../catalogue'
import { placementValide, snap } from '../geometrie/collisions'
import { textureEnvironnement, textureSol } from './textures'

function Cotes() {
  const { l, w } = useStore((s) => s.config.terrain)
  const cotes = useStore((s) => s.cotes)
  if (!cotes) return null
  const cls = 'px-2 py-0.5 rounded-md bg-white/90 border border-primary-light text-xs font-bold text-primary-darker whitespace-nowrap select-none'
  return (
    <>
      <Html position={[0, 0.05, -w / 2 - 0.8]} center zIndexRange={[10, 0]}><div className={cls}>{l.toFixed(1).replace('.', ',')} m</div></Html>
      <Html position={[l / 2 + 0.8, 0.05, 0]} center zIndexRange={[10, 0]}><div className={cls}>{w.toFixed(1).replace('.', ',')} m</div></Html>
    </>
  )
}

function Fantome({ x, z }: { x: number; z: number }) {
  const outil = useStore((s) => s.outil)
  const config = useStore((s) => s.config)
  const p = outil ? getProduit(outil) : undefined
  if (!p) return null
  const autres = config.equipements.map(corpsDe).filter((c): c is NonNullable<typeof c> => c !== null)
  const ok = placementValide({ uid: '__fantome', x, z, w: p.w, d: p.d, rot: 0, clearance: p.clearance }, autres, config.terrain, sasRect(config))
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={p.h / 2}>
        <boxGeometry args={[p.w, p.h, p.d]} />
        <meshStandardMaterial color={ok ? '#7CB342' : '#E53935'} transparent opacity={0.45} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <planeGeometry args={[p.w + 2 * p.clearance, p.d + 2 * p.clearance]} />
        <meshBasicMaterial color={ok ? '#7CB342' : '#E53935'} transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

export function Terrain() {
  const { l, w, sol } = useStore((s) => s.config.terrain)
  const vue = useStore((s) => s.vue)
  const outil = useStore((s) => s.outil)
  const placer = useStore((s) => s.placer)
  const select = useStore((s) => s.select)
  const [fantome, setFantome] = useState<{ x: number; z: number } | null>(null)

  const texture = useMemo(() => textureSol(sol, l, w), [sol, l, w])
  useEffect(() => () => texture.dispose(), [texture])
  const appui = useRef<{ x: number; y: number } | null>(null)
  const env = useMemo(() => textureEnvironnement(), [])
  // bordure épaisse (4 lattes) : les lignes WebGL font 1 px, invisibles sur un sol de même teinte
  const lattes = useMemo(() => {
    const e = 0.18
    return [
      { pos: [0, 0.015, -w / 2] as const, dims: [l + e, 0.03, e] as const },
      { pos: [0, 0.015, w / 2] as const, dims: [l + e, 0.03, e] as const },
      { pos: [-l / 2, 0.015, 0] as const, dims: [e, 0.03, w + e] as const },
      { pos: [l / 2, 0.015, 0] as const, dims: [e, 0.03, w + e] as const },
    ]
  }, [l, w])
  const satellite = vue === 'satellite'

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (outil) {
      e.stopPropagation()
      placer(outil, e.point.x, e.point.z)
    } else {
      appui.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    }
  }
  // désélection seulement sur un vrai clic (pas au début d'un orbit ou d'un pan)
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const a = appui.current
    appui.current = null
    if (a && Math.hypot(e.nativeEvent.clientX - a.x, e.nativeEvent.clientY - a.y) < 4) select([])
  }
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (outil) setFantome({ x: snap(e.point.x), z: snap(e.point.z) })
  }

  return (
    <group>
      {!satellite && (
        <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial map={env} color="#D9E6C4" />
        </mesh>
      )}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[l, w]} />
        <meshStandardMaterial map={texture} transparent={satellite} opacity={satellite ? 0.55 : 1} />
      </mesh>
      {!satellite && lattes.map((b, i) => (
        <mesh key={i} position={[...b.pos]}>
          <boxGeometry args={[...b.dims]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      ))}
      {/* capteur invisible : placement, fantôme, désélection */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove} onPointerLeave={() => setFantome(null)}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {outil && fantome && <Fantome x={fantome.x} z={fantome.z} />}
      <Cotes />
    </group>
  )
}
