import { useStore } from '../store'
import { getProduit } from '../catalogue'

const m = (v: number) => `${v.toFixed(2).replace('.', ',')} m`

export function Proprietes() {
  const selection = useStore((s) => s.selection)
  const equipements = useStore((s) => s.config.equipements)
  const tourner = useStore((s) => s.tourner)
  const dupliquer = useStore((s) => s.dupliquer)
  const supprimer = useStore((s) => s.supprimer)

  if (selection.length === 0) return null
  if (selection.length > 1) {
    return (
      <div className="absolute bottom-3 left-3 rounded-2xl bg-white/95 border border-primary-light shadow-md p-4 text-sm">
        <p className="font-bold text-text">{selection.length} équipements sélectionnés</p>
        <button type="button" onClick={() => supprimer(selection)} className="mt-2 px-3 py-2 min-h-11 rounded-lg border border-primary-light text-xs font-bold text-red-600 hover:bg-surface">Supprimer la sélection</button>
      </div>
    )
  }
  const eq = equipements.find((e) => e.uid === selection[0])
  const p = eq && getProduit(eq.id)
  if (!eq || !p) return null
  const btn = 'px-3 py-2 rounded-lg border border-primary-light text-xs font-bold text-primary-darker hover:bg-surface min-w-11 min-h-11'

  return (
    <div className="absolute bottom-3 left-3 w-72 max-w-[calc(100%-1.5rem)] rounded-2xl bg-white/95 border border-primary-light shadow-md p-4">
      <div className="flex gap-3">
        <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-surface" />
        <div className="min-w-0">
          <p className="font-display font-extrabold text-text truncate">{p.name}</p>
          <p className="text-xs text-muted">Réf. {p.ref}</p>
          <p className="text-xs text-muted mt-1">{m(p.w)} × {m(p.d)} × {m(p.h)}</p>
          <p className="text-xs text-muted">Dégagement {m(p.clearance)} · rotation {eq.rot}°</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => tourner(eq.uid, eq.rot - 90)} aria-label="Tourner de 90° vers la gauche">↺ 90°</button>
        <button type="button" className={btn} onClick={() => tourner(eq.uid, eq.rot + 90)} aria-label="Tourner de 90° vers la droite">↻ 90°</button>
        <button type="button" className={btn} onClick={() => dupliquer(eq.uid)}>Dupliquer</button>
        <button type="button" className={`${btn} text-red-600`} onClick={() => supprimer([eq.uid])}>Supprimer</button>
      </div>
    </div>
  )
}
