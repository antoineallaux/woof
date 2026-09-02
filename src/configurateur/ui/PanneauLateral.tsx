import { useId, useState } from 'react'
import { useStore } from '../store'
import { OngletTerrain } from './OngletTerrain'
import { OngletCatalogue } from './OngletCatalogue'
import { OngletCloture } from './OngletCloture'
import { Recap } from './Recap'

const ONGLETS = [
  { id: 'terrain', label: 'Terrain' },
  { id: 'catalogue', label: 'Équipements' },
  { id: 'cloture', label: 'Clôture' },
] as const
type Onglet = (typeof ONGLETS)[number]['id']

export function PanneauLateral() {
  const nom = useStore((s) => s.config.nom)
  const setNom = useStore((s) => s.setNom)
  const [onglet, setOnglet] = useState<Onglet>('catalogue')
  // le panneau est monté deux fois (colonne desktop + tiroir mobile) : id unique par instance
  const idNom = useId()
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-primary-light">
        <label htmlFor={idNom} className="text-xs font-bold uppercase tracking-widest text-primary">Projet</label>
        <input id={idNom} value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80}
          className="mt-1 w-full font-display font-extrabold text-lg text-text bg-transparent border-b border-transparent focus:border-primary focus:outline-none" />
      </div>
      <div role="tablist" aria-label="Réglages" className="grid grid-cols-3 border-b border-primary-light">
        {ONGLETS.map((o) => (
          <button key={o.id} role="tab" type="button" aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}
            className={`py-3 text-sm font-bold border-b-2 ${onglet === o.id ? 'border-primary text-primary-darker' : 'border-transparent text-muted hover:text-text'}`}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {onglet === 'terrain' && <OngletTerrain />}
        {onglet === 'catalogue' && <OngletCatalogue />}
        {onglet === 'cloture' && <OngletCloture />}
      </div>
      <Recap />
    </div>
  )
}
