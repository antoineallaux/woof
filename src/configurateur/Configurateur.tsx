import { Scene } from './scene/Scene'
import { useStore } from './store'

export default function Configurateur() {
  const vue = useStore((s) => s.vue)
  const setVue = useStore((s) => s.setVue)
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg">
      <div className="relative flex-1 min-h-0">
        <Scene />
        <div className="absolute top-3 left-3 flex gap-1 rounded-xl bg-white/95 border border-primary-light p-1 shadow-sm">
          {(['3d', 'plan'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setVue(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${vue === v ? 'bg-primary text-white' : 'text-primary-darker hover:bg-surface'}`}>
              {v === '3d' ? '3D' : 'Plan'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
