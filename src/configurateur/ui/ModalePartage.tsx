import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { encoder } from '../url'
import { Bouton } from './Bouton'

export function ModalePartage({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const config = useStore((s) => s.config)
  const dialog = useRef<HTMLDialogElement>(null)
  const champ = useRef<HTMLInputElement>(null)
  const [copie, setCopie] = useState(false)
  // calculé seulement quand la modale est ouverte (le composant reste monté pendant les drags)
  const url = useMemo(
    () => (ouvert && typeof window !== 'undefined' ? `${window.location.origin}/configurateur/#cfg=${encoder(config)}` : ''),
    [ouvert, config],
  )

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (ouvert && !d.open) d.showModal()
    if (!ouvert && d.open) d.close()
  }, [ouvert])

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopie(true)
      setTimeout(() => setCopie(false), 1500)
    } catch {
      // presse-papiers refusé : l'utilisateur sélectionne le champ à la main
      champ.current?.select()
    }
  }
  const partager = () => navigator.share?.({ title: config.nom, url }).catch(() => {})

  return (
    <dialog ref={dialog} onClose={onFermer} className="m-auto w-[min(520px,92vw)] rounded-2xl border border-primary-light p-6 shadow-lg backdrop:bg-black/40">
      <h2 className="font-display font-extrabold text-xl text-text">Partager ce projet</h2>
      <p className="text-sm text-muted mt-1">Le lien contient toute la configuration. Toute personne qui l'ouvre voit le même plan.</p>
      <input ref={champ} readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Lien de partage"
        className="mt-4 w-full border border-primary-light rounded-xl px-3 py-2 text-xs bg-surface" />
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        {typeof navigator !== 'undefined' && 'share' in navigator && <Bouton variant="outline" size="sm" onClick={partager}>Envoyer…</Bouton>}
        <Bouton size="sm" onClick={copier}>{copie ? 'Copié ✓' : 'Copier le lien'}</Bouton>
        <Bouton variant="ghost" size="sm" onClick={onFermer}>Fermer</Bouton>
      </div>
    </dialog>
  )
}
