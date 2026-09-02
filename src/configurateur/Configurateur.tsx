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
import { useStore } from './store'

function estChampTexte(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

export default function Configurateur() {
  const [tiroir, setTiroir] = useState(false)
  const outil = useStore((s) => s.outil)

  // referme le tiroir mobile dès qu'un outil de placement est choisi
  useEffect(() => { if (outil) setTiroir(false) }, [outil])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (estChampTexte(e.target)) return
      const s = useStore.getState()
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); s.annuler() }
      else if ((ctrl && e.key.toLowerCase() === 'y') || (ctrl && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); s.retablir() }
      else if (e.key === 'Escape') { s.setOutil(null); s.select([]) }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selection.length) { e.preventDefault(); s.supprimer(s.selection) }
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
        <BarreOutils onPartager={() => {}} onDossier={() => {}} onDevis={() => {}} />
        <Proprietes />
        <Toast />

        {/* tiroir mobile */}
        <button type="button" onClick={() => setTiroir(true)}
          className="lg:hidden absolute bottom-3 right-3 px-4 min-h-12 rounded-full bg-primary text-white font-bold text-sm shadow-lg">
          Terrain · Équipements · Clôture
        </button>
        <div className={`lg:hidden absolute inset-x-0 bottom-0 z-20 bg-white rounded-t-3xl shadow-2xl border-t border-primary-light transition-transform duration-300 ${tiroir ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '70%' }} aria-hidden={!tiroir}>
          <button type="button" onClick={() => setTiroir(false)} className="w-full py-3 flex justify-center" aria-label="Fermer le panneau">
            <span className="w-12 h-1.5 rounded-full bg-primary-light" />
          </button>
          <div className="h-[calc(100%-2.5rem)]"><PanneauLateral /></div>
        </div>
      </div>
    </div>
  )
}
