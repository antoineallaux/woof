import { Scene } from './scene/Scene'
import { Equipements } from './scene/Equipements'
import { Proprietes } from './ui/Proprietes'
import { CATALOGUE } from './catalogue'
import { useStore } from './store'

export default function Configurateur() {
  const vue = useStore((s) => s.vue)
  const setVue = useStore((s) => s.setVue)
  const outil = useStore((s) => s.outil)
  const setOutil = useStore((s) => s.setOutil)
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg">
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-primary-light bg-white p-3 grid grid-cols-2 gap-2 content-start">
        {CATALOGUE.map((p) => (
          <button key={p.id} type="button" onClick={() => setOutil(outil === p.id ? null : p.id)}
            className={`rounded-xl border p-2 text-left text-xs ${outil === p.id ? 'border-primary bg-surface' : 'border-primary-light'}`}>
            <img src={p.image} alt="" className="w-full aspect-square object-cover rounded-lg bg-surface" />
            <span className="block mt-1 font-bold truncate">{p.name}</span>
          </button>
        ))}
      </aside>
      <div className="relative flex-1 min-h-0">
        <Scene><Equipements /></Scene>
        <div className="absolute top-3 left-3 flex gap-1 rounded-xl bg-white/95 border border-primary-light p-1 shadow-sm">
          {(['3d', 'plan'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setVue(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${vue === v ? 'bg-primary text-white' : 'text-primary-darker hover:bg-surface'}`}>
              {v === '3d' ? '3D' : 'Plan'}
            </button>
          ))}
        </div>
        <Proprietes />
      </div>
    </div>
  )
}
