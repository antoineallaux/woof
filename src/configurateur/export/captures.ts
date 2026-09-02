import type * as THREE from 'three'
import { pont } from '../scene/Scene'
import { useStore, type Vue } from '../store'

export interface Cadre { left: number; top: number; width: number; height: number } // en % du canvas
export interface Captures { plan: string; vue3d: string; cadre: Cadre }

interface Controls { target: THREE.Vector3; update: () => void }

const frames = (n: number) => new Promise<void>((r) => {
  const tick = () => (n-- <= 0 ? r() : requestAnimationFrame(tick))
  requestAnimationFrame(tick)
})

async function basculer(vue: Vue) {
  useStore.getState().setVue(vue)
  await frames(4)
}

function cadrerPlan(): Cadre {
  const s = pont.current!
  const cam = s.camera as THREE.OrthographicCamera
  const { l, w } = useStore.getState().config.terrain
  const { width, height } = s.size
  const zoom = Math.min(width / (l + 4), height / (w + 4))
  cam.position.set(0, 60, 0)
  cam.up.set(0, 0, -1)
  cam.lookAt(0, 0, 0)
  cam.zoom = zoom
  cam.updateProjectionMatrix()
  const c = s.controls as Controls | null
  if (c) { c.target.set(0, 0, 0); c.update() }
  return {
    width: (l * zoom * 100) / width,
    height: (w * zoom * 100) / height,
    left: 50 - (l * zoom * 50) / width,
    top: 50 - (w * zoom * 50) / height,
  }
}

function cadrer3d() {
  const s = pont.current!
  const { l, w } = useStore.getState().config.terrain
  const d = Math.max(l, w) * 1.1
  s.camera.position.set(d * 0.8, d * 0.7, d * 0.9)
  s.camera.lookAt(0, 0, 0)
  const c = s.controls as Controls | null
  if (c) { c.target.set(0, 0, 0); c.update() }
}

function photo(): string {
  const s = pont.current!
  s.gl.render(s.scene, s.camera)
  return s.gl.domElement.toDataURL('image/png')
}

export async function capturer(): Promise<Captures> {
  if (!pont.current) throw new Error('Scène non montée')
  const vueInitiale = useStore.getState().vue
  const cotes = useStore.getState().cotes
  useStore.getState().select([])
  await basculer('plan')
  const cadre = cadrerPlan()
  await frames(2)
  const plan = photo()
  await basculer('3d')
  cadrer3d()
  await frames(2)
  const vue3d = photo()
  await basculer(vueInitiale)
  if (cotes !== useStore.getState().cotes) useStore.getState().toggleCotes()
  return { plan, vue3d, cadre }
}
