import { useMemo } from 'react'
import { useStore } from '../store'
import { HAUTEURS } from '../types'
import { genererCloture } from '../geometrie/cloture'

// angle depuis lequel la position est mesurée (sens horaire, cf. pointSurCote)
const ANGLE_DEPART = { nord: 'nord-ouest', est: 'nord-est', sud: 'sud-est', ouest: 'sud-ouest' } as const

const fmt = (v: number) => v.toFixed(1).replace('.', ',')

export function OngletCloture() {
  const terrain = useStore((s) => s.config.terrain)
  const { active, hauteur, sas } = useStore((s) => s.config.cloture)
  const setCloture = useStore((s) => s.setCloture)
  const ajouterSas = useStore((s) => s.ajouterSas)
  const retirerSas = useStore((s) => s.retirerSas)
  const cloture = useMemo(() => genererCloture(terrain, sas), [terrain, sas])

  return (
    <div className="space-y-5">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={active} onChange={(e) => setCloture({ active: e.target.checked })} className="w-5 h-5 accent-primary" />
        <span className="font-bold text-text">Clôturer l'aire</span>
      </label>

      {active && (
        <>
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Hauteur</legend>
            <div className="grid grid-cols-3 gap-2">
              {HAUTEURS.map((h) => (
                <button key={h} type="button" onClick={() => setCloture({ hauteur: h })}
                  className={`py-2.5 rounded-xl border text-sm font-bold ${hauteur === h ? 'border-primary bg-surface text-primary-darker' : 'border-primary-light text-text hover:bg-surface'}`}>
                  {fmt(h).replace(',0', '')} m
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rounded-2xl bg-surface p-4 text-sm">
            <p className="font-bold text-text">Sas d'entrée</p>
            <p className="text-muted text-xs mt-1">Vestibule à double portillon (1,20 × 2,00 m). Glissez-le le long de la clôture dans la vue 3D ou plan.</p>

            {sas.length > 0 && (
              <ul className="mt-3 space-y-1">
                {sas.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 border-b border-primary-light/60 last:border-0 py-1">
                    <span className="text-text">Sas {i + 1} — côté {s.cote}, à {fmt(s.pos)} m de l'angle {ANGLE_DEPART[s.cote]}</span>
                    <button type="button" onClick={() => retirerSas(i)}
                      aria-label={`Retirer le sas ${i + 1}, côté ${s.cote}`}
                      className="shrink-0 min-w-11 min-h-11 px-2 text-xs font-bold text-red-600 hover:underline">
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button type="button" onClick={ajouterSas} className="mt-3 px-4 min-h-11 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold">Ajouter un sas</button>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted">Clôture</dt><dd className="font-bold text-right">{fmt(cloture.metres)} ml</dd>
            <dt className="text-muted">Poteaux</dt><dd className="font-bold text-right">{cloture.poteaux.length}</dd>
            <dt className="text-muted">Sas</dt><dd className="font-bold text-right">{sas.length}</dd>
          </dl>
        </>
      )}
    </div>
  )
}
