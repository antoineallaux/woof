import { useState } from 'react'
import { CATALOGUE, CATEGORIES } from '../catalogue'
import { useStore } from '../store'

export function OngletCatalogue() {
  const outil = useStore((s) => s.outil)
  const setOutil = useStore((s) => s.setOutil)
  const [cat, setCat] = useState<string>('tous')
  const liste = cat === 'tous' ? CATALOGUE : CATALOGUE.filter((p) => p.category === cat)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {['tous', ...CATEGORIES].map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${cat === c ? 'bg-primary text-white' : 'bg-surface text-primary-darker hover:bg-primary-light'}`}>
            {c}
          </button>
        ))}
      </div>
      {outil && <p className="text-xs font-bold text-primary-darker bg-surface rounded-xl px-3 py-2">Cliquez sur le terrain pour poser l'équipement. Échap pour annuler.</p>}
      <div className="grid grid-cols-2 gap-2">
        {liste.map((p) => (
          <button key={p.id} type="button" onClick={() => setOutil(outil === p.id ? null : p.id)} aria-pressed={outil === p.id}
            className={`rounded-xl border p-2 text-left transition-all hover:shadow-md ${outil === p.id ? 'border-primary bg-surface' : 'border-primary-light bg-white'}`}>
            <img src={p.image} alt="" loading="lazy" className="w-full aspect-square object-cover rounded-lg bg-surface" />
            <span className="block mt-1.5 text-xs font-bold text-text truncate">{p.name}</span>
            <span className="block text-[11px] text-muted">{p.w.toFixed(2)} × {p.d.toFixed(2)} m</span>
          </button>
        ))}
      </div>
    </div>
  )
}
