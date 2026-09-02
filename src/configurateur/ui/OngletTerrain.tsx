import { useStore } from '../store'
import { SOLS, TERRAIN_MAX, TERRAIN_MIN } from '../types'

const input = 'w-full border border-primary-light rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'

function Dimension({ label, valeur, onChange }: { label: string; valeur: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-bold text-text block mb-1.5">{label} <span className="text-muted font-normal">({valeur.toFixed(1).replace('.', ',')} m)</span></label>
      <div className="flex gap-2 items-center">
        <input type="range" min={TERRAIN_MIN} max={TERRAIN_MAX} step={0.5} value={valeur} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-primary" aria-label={label} />
        {/* non contrôlé, appliqué au blur/Entrée : évite le saut à 5 m pendant la frappe ; key resynchronise après slider/undo */}
        <input type="number" min={TERRAIN_MIN} max={TERRAIN_MAX} step={0.5} defaultValue={valeur} key={valeur}
          onBlur={(e) => {
            const n = Number(e.target.value)
            if (Number.isFinite(n) && n > 0) onChange(n)
            // réaffiche la valeur réelle (bornée) même si le store n'a pas changé
            e.target.value = String(Math.min(TERRAIN_MAX, Math.max(TERRAIN_MIN, Number.isFinite(n) && n > 0 ? n : valeur)))
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          className={`${input} w-20`} aria-label={`${label} en mètres`} />
      </div>
    </div>
  )
}

export function OngletTerrain() {
  const terrain = useStore((s) => s.config.terrain)
  const setTerrain = useStore((s) => s.setTerrain)
  const surface = terrain.l * terrain.w
  return (
    <div className="space-y-5">
      <Dimension label="Longueur" valeur={terrain.l} onChange={(l) => setTerrain({ l })} />
      <Dimension label="Largeur" valeur={terrain.w} onChange={(w) => setTerrain({ w })} />
      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Sol</legend>
        <div className="grid grid-cols-3 gap-2">
          {SOLS.map((s) => (
            <button key={s.id} type="button" onClick={() => setTerrain({ sol: s.id })} aria-pressed={terrain.sol === s.id}
              className={`py-2.5 rounded-xl border text-sm font-bold ${terrain.sol === s.id ? 'border-primary bg-surface text-primary-darker' : 'border-primary-light text-text hover:bg-surface'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="text-sm text-muted">Surface : <strong className="text-text">{surface.toFixed(0)} m²</strong></p>
    </div>
  )
}
