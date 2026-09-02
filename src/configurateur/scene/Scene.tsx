import { useEffect } from 'react'
import type * as THREE from 'three'
import { Canvas, useThree, type RootState } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useStore } from '../store'
import { Terrain } from './Terrain'

/** Accès au renderer depuis l'extérieur du Canvas (captures pour le dossier PDF). */
export const pont: { current: RootState | null } = { current: null }

function PontCapture() {
  const state = useThree()
  useEffect(() => {
    pont.current = state
    return () => { pont.current = null }
  }, [state])
  return null
}

function Cameras() {
  const vue = useStore((s) => s.vue)
  const dragging = useStore((s) => s.dragging)
  const echelle = useStore((s) => s.satelliteEchelle)
  const angle = useStore((s) => s.satelliteAngle)
  const camera = useThree((s) => s.camera)

  // en satellite : caméra ortho verrouillée au centre, zoom = pixels par mètre de la carte, nord tourné
  useEffect(() => {
    if (vue !== 'satellite' || !(camera as THREE.OrthographicCamera).isOrthographicCamera) return
    camera.position.set(0, 60, 0)
    camera.up.set(Math.sin(angle), 0, -Math.cos(angle))
    camera.lookAt(0, 0, 0)
    ;(camera as THREE.OrthographicCamera).zoom = echelle
    camera.updateProjectionMatrix()
  }, [vue, echelle, angle, camera])

  return (
    <>
      {vue === '3d' ? (
        <PerspectiveCamera makeDefault position={[18, 16, 22]} fov={45} near={0.1} far={600} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 60, 0]} up={[0, 0, -1]} zoom={20} near={0.1} far={500} />
      )}
      <OrbitControls
        makeDefault
        enabled={!dragging && vue !== 'satellite'}
        enableRotate={vue === '3d'}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={4}
        maxDistance={150}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function Scene({ children }: { children?: React.ReactNode }) {
  const vue = useStore((s) => s.vue)
  const satellite = vue === 'satellite'
  return (
    <Canvas
      className="!absolute inset-0"
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      style={{ background: satellite ? 'transparent' : '#EAF4E0', pointerEvents: satellite ? 'none' : 'auto' }}
    >
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#ffffff', '#9ccc65', 0.5]} />
      <directionalLight position={[15, 25, 10]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
      <Cameras />
      <Terrain />
      {children}
      <PontCapture />
    </Canvas>
  )
}
