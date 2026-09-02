import { useEffect, useState } from 'react'
import { Scene } from './scene/Scene'
import { Equipements } from './scene/Equipements'
import { Cloture } from './scene/Cloture'
import { Sas } from './scene/Sas'
import { PanneauLateral } from './ui/PanneauLateral'
import { BarreOutils } from './ui/BarreOutils'
import { Proprietes } from './ui/Proprietes'
import { Satellite } from './ui/Satellite'
import { Toast } from './ui/Toast'
import { ModalePartage } from './ui/ModalePartage'
import { useStore } from './store'
import { decoder, encoder, lireHash } from './url'
import { CATALOGUE } from './catalogue'
import { capturer } from './export/captures'
import { htmlDossier, imprimerDossier } from './export/dossier'
import { envoyerAuDevis } from './export/devis'

function estChampTexte(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

export default function Configurateur() {
  const [tiroir, setTiroir] = useState(false)
  const [partage, setPartage] = useState(false)
  const outil = useStore((s) => s.outil)
  const selection = useStore((s) => s.selection)

  // referme le tiroir mobile dès qu'un outil de placement est choisi
  useEffect(() => { if (outil) setTiroir(false) }, [outil])

  // restauration depuis #cfg au montage
  useEffect(() => {
    const brut = lireHash(window.location.hash)
    if (!brut) return
    const res = decoder(brut, new Set(CATALOGUE.map((p) => p.id)))
    const s = useStore.getState()
    if (!res) { s.setErreur('Lien de configuration illisible.'); return }
    s.charger(res.config)
    if (res.ignores.length) s.setErreur(`Équipements inconnus ignorés : ${res.ignores.join(', ')}`)
  }, [])

  // le hash suit la configuration (sans polluer l'historique)
  const config = useStore((s) => s.config)
  useEffect(() => {
    const t = setTimeout(() => history.replaceState(null, '', `#cfg=${encoder(config)}`), 300)
    return () => clearTimeout(t)
  }, [config])

  const dossier = async () => {
    try {
      const s = useStore.getState()
      const captures = await capturer()
      imprimerDossier(htmlDossier(s.config, captures, `${window.location.origin}/configurateur/#cfg=${encoder(s.config)}`))
    } catch {
      useStore.getState().setErreur('Impossible de générer le dossier (fenêtre bloquée ?).')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (estChampTexte(e.target)) return
      if (document.querySelector('dialog[open]')) return // pas de raccourci sous une modale
      const s = useStore.getState()
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); s.annuler() }
      else if ((ctrl && e.key.toLowerCase() === 'y') || (ctrl && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); s.retablir() }
      else if (e.key === 'Escape') { s.setOutil(null); s.select([]) }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (s.selection.length) s.supprimer(s.selection) }
      else if (e.key.toLowerCase() === 'r' && s.selection.length === 1) {
        const eq = s.config.equipements.find((x) => x.uid === s.selection[0])
        if (eq) s.tourner(eq.uid, eq.rot + (e.shiftKey ? -90 : 90))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg overflow-hidden">
      <aside className="hidden lg:flex w-[360px] shrink-0 flex-col border-r border-primary-light bg-white">
        <PanneauLateral />
      </aside>

      <div className="relative flex-1 min-h-0">
        <Satellite />
        <Scene><Equipements /><Cloture /><Sas /></Scene>
        <BarreOutils onPartager={() => setPartage(true)} onDossier={dossier} onDevis={() => envoyerAuDevis(useStore.getState().config)} />
        <Proprietes />
        <Toast />
        <ModalePartage ouvert={partage} onFermer={() => setPartage(false)} />

        {/* tiroir mobile (bouton masqué quand la fiche Propriétés occupe le bas de l'écran) */}
        {selection.length === 0 && (
          <button type="button" onClick={() => setTiroir(true)}
            className="lg:hidden absolute bottom-3 right-3 px-4 min-h-12 rounded-full bg-primary text-white font-bold text-sm shadow-lg">
            Terrain · Équipements · Clôture
          </button>
        )}
        <div className={`lg:hidden absolute inset-x-0 bottom-0 z-20 bg-white rounded-t-3xl shadow-2xl border-t border-primary-light transition-transform duration-300 ${tiroir ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '70%' }} aria-hidden={!tiroir} inert={!tiroir || undefined}>
          <button type="button" onClick={() => setTiroir(false)} className="w-full py-3 flex justify-center" aria-label="Fermer le panneau">
            <span className="w-12 h-1.5 rounded-full bg-primary-light" />
          </button>
          <div className="h-[calc(100%-2.5rem)]"><PanneauLateral /></div>
        </div>
      </div>
    </div>
  )
}
