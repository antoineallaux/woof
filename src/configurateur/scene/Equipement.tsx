import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useStore } from '../store'
import { getProduit } from '../catalogue'
import { snap } from '../geometrie/collisions'
import type { Equipement as Eq } from '../types'
import { Modele } from './Modele'
import { pointSol } from './pointSol'
import { Limite } from '../ui/Limite'

function PoigneeRotation({ eq, rayon }: { eq: Eq; rayon: number }) {
  const tourner = useStore((s) => s.tourner)
  const enregistrer = useStore((s) => s.enregistrer)
  const setDragging = useStore((s) => s.setDragging)
  const actif = useRef(false)
  const dragging = useStore((s) => s.dragging)
  // si le filet global a coupé le drag, on oublie l'état local
  useEffect(() => { if (!dragging) actif.current = false }, [dragging])

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    enregistrer()
    actif.current = true
    setDragging(true)
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!actif.current) return
    const p = pointSol(e)
    if (!p) return
    let deg = (Math.atan2(-(p.z - eq.z), p.x - eq.x) * 180) / Math.PI
    deg = ((deg % 360) + 360) % 360
    const proche = Math.round(deg / 45) * 45
    if (Math.abs(deg - proche) <= 3) deg = proche % 360
    tourner(eq.uid, Math.round(deg), false)
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    ;(e.target as Element).releasePointerCapture(e.pointerId)
    actif.current = false
    setDragging(false)
  }

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.06} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <ringGeometry args={[rayon, rayon + 0.18, 64]} />
      <meshBasicMaterial color="#7CB342" transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function Equipement({ eq }: { eq: Eq }) {
  const p = getProduit(eq.id)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const deplacer = useStore((s) => s.deplacer)
  const enregistrer = useStore((s) => s.enregistrer)
  const setDragging = useStore((s) => s.setDragging)
  const outil = useStore((s) => s.outil)
  const cotes = useStore((s) => s.cotes)
  // ox/oz : décalage curseur → centre ; x/z : dernière position appliquée (indépendante du rendu React)
  const drag = useRef<{ ox: number; oz: number; x: number; z: number } | null>(null)
  const dragging = useStore((s) => s.dragging)
  useEffect(() => { if (!dragging) drag.current = null }, [dragging])

  if (!p) return null
  const selectionne = selection.includes(eq.uid)

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (outil) return // en mode placement, le clic va au sol
    e.stopPropagation()
    const uids = e.nativeEvent.shiftKey
      ? selectionne ? selection.filter((u) => u !== eq.uid) : [...selection, eq.uid]
      : selectionne ? selection : [eq.uid]
    select(uids)
    if (!uids.includes(eq.uid)) return // retiré de la sélection : pas de drag
    const pt = pointSol(e)
    if (!pt) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    enregistrer()
    drag.current = { ox: eq.x - pt.x, oz: eq.z - pt.z, x: eq.x, z: eq.z }
    setDragging(true)
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    const pt = pointSol(e)
    if (!pt) return
    const nx = snap(pt.x + drag.current.ox)
    const nz = snap(pt.z + drag.current.oz)
    const dx = nx - drag.current.x
    const dz = nz - drag.current.z
    if (dx === 0 && dz === 0) return
    const groupe = useStore.getState().selection.includes(eq.uid) ? useStore.getState().selection : [eq.uid]
    if (deplacer(groupe, dx, dz, false)) drag.current = { ...drag.current, x: nx, z: nz }
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    ;(e.target as Element).releasePointerCapture(e.pointerId)
    drag.current = null
    setDragging(false)
  }

  const rayon = Math.max(p.w, p.d) / 2 + 0.5
  // repli commun au chargement (Suspense) et au modèle introuvable (Limite)
  const boite = (
    <mesh position-y={p.h / 2} castShadow>
      <boxGeometry args={[p.w, p.h, p.d]} />
      <meshStandardMaterial color="#BDBDBD" />
    </mesh>
  )

  return (
    <group position={[eq.x, 0, eq.z]} rotation-y={(eq.rot * Math.PI) / 180}>
      <group onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <Suspense fallback={boite}>
          <Limite repli={boite}>
            <Modele produit={p} />
          </Limite>
        </Suspense>
        {/* volume de saisie invisible : rend le drag fiable même sur des maillages fins */}
        <mesh position-y={p.h / 2}>
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      {selectionne && (
        <lineSegments position-y={p.h / 2}>
          <edgesGeometry args={[new THREE.BoxGeometry(p.w + 0.04, p.h + 0.04, p.d + 0.04)]} />
          <lineBasicMaterial color="#558B2F" />
        </lineSegments>
      )}
      {selectionne && cotes && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
          <planeGeometry args={[p.w + 2 * p.clearance, p.d + 2 * p.clearance]} />
          <meshBasicMaterial color="#7CB342" transparent opacity={0.15} />
        </mesh>
      )}
      {selectionne && selection.length === 1 && <PoigneeRotation eq={eq} rayon={rayon} />}
    </group>
  )
}
