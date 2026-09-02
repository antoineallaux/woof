import { useStore, type Vue } from '../store'
import { Bouton } from './Bouton'

const VUES: { id: Vue; label: string }[] = [
  { id: '3d', label: '3D' },
  { id: 'plan', label: 'Plan' },
  { id: 'satellite', label: 'Satellite' },
]

interface Props { onPartager: () => void; onDossier: () => void; onDevis: () => void }

export function BarreOutils({ onPartager, onDossier, onDevis }: Props) {
  const vue = useStore((s) => s.vue)
  const setVue = useStore((s) => s.setVue)
  const cotes = useStore((s) => s.cotes)
  const toggleCotes = useStore((s) => s.toggleCotes)
  const annuler = useStore((s) => s.annuler)
  const retablir = useStore((s) => s.retablir)
  const peutAnnuler = useStore((s) => s.passe.length > 0)
  const peutRetablir = useStore((s) => s.futur.length > 0)
  const nb = useStore((s) => s.config.equipements.length)
  const petit = 'px-3 min-h-11 rounded-lg text-xs font-bold disabled:opacity-40'

  return (
    // conteneur unique : les deux groupes se répartissent sur une ligne en desktop et s'empilent en mobile
    <div className="absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
      <div className="flex flex-wrap gap-2 pointer-events-auto">
        <div className="flex gap-1 rounded-xl bg-white/95 border border-primary-light p-1 shadow-sm">
          <button type="button" onClick={annuler} disabled={!peutAnnuler} className={`${petit} text-primary-darker hover:bg-surface`} aria-label="Annuler (Ctrl+Z)">↶</button>
          <button type="button" onClick={retablir} disabled={!peutRetablir} className={`${petit} text-primary-darker hover:bg-surface`} aria-label="Rétablir (Ctrl+Y)">↷</button>
        </div>
        <div className="flex gap-1 rounded-xl bg-white/95 border border-primary-light p-1 shadow-sm" role="group" aria-label="Vue">
          {VUES.map((v) => (
            <button key={v.id} type="button" onClick={() => setVue(v.id)} aria-pressed={vue === v.id}
              className={`${petit} ${vue === v.id ? 'bg-primary text-white' : 'text-primary-darker hover:bg-surface'}`}>{v.label}</button>
          ))}
          <button type="button" onClick={toggleCotes} aria-pressed={cotes} className={`${petit} ${cotes ? 'bg-surface text-primary-darker' : 'text-muted hover:bg-surface'}`}>Cotes</button>
        </div>
      </div>
      <div className="flex gap-2 pointer-events-auto">
        <Bouton variant="outline" size="sm" onClick={onPartager} className="bg-white/95">Partager</Bouton>
        <Bouton variant="outline" size="sm" onClick={onDossier} className="bg-white/95 max-sm:hidden">Dossier PDF</Bouton>
        <Bouton size="sm" onClick={onDevis} disabled={nb === 0}>Demander un devis</Bouton>
      </div>
    </div>
  )
}
