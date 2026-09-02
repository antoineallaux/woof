import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore } from '../store'

const TUILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ATTRIB = 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
const DEPART: [number, number] = [48.94, 1.99] // Villennes-sur-Seine

function pixelsParMetre(map: L.Map): number {
  const lat = map.getCenter().lat
  const metresParPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** map.getZoom()
  return 1 / metresParPixel
}

export function Satellite() {
  const vue = useStore((s) => s.vue)
  const setSatellite = useStore((s) => s.setSatellite)
  const angle = useStore((s) => s.satelliteAngle)
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<L.Map | null>(null)
  const [adresse, setAdresse] = useState('')
  const [etat, setEtat] = useState<'idle' | 'recherche' | 'introuvable'>('idle')
  const visible = vue === 'satellite'

  useEffect(() => {
    if (!visible || !conteneur.current || carte.current) return
    const map = L.map(conteneur.current, { zoomControl: true, attributionControl: true, zoomSnap: 0.25 }).setView(DEPART, 18)
    L.tileLayer(TUILES, { maxZoom: 20, maxNativeZoom: 19, attribution: ATTRIB }).addTo(map)
    // le coin haut-gauche est occupé par la barre d'outils et le champ d'adresse : zoom à droite, sous les boutons
    map.zoomControl.setPosition('topright')
    const coin = map.getContainer().querySelector<HTMLElement>('.leaflet-top.leaflet-right')
    if (coin) coin.style.marginTop = '48px'
    const sync = () => setSatellite(pixelsParMetre(map))
    map.on('move zoom resize', sync)
    sync()
    carte.current = map
    return () => { map.remove(); carte.current = null }
  }, [visible, setSatellite])

  const chercher = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!adresse.trim() || !carte.current) return
    setEtat('recherche')
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&q=${encodeURIComponent(adresse)}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      const data: { lat: string; lon: string }[] = await res.json()
      if (!data[0]) { setEtat('introuvable'); return }
      carte.current.setView([Number(data[0].lat), Number(data[0].lon)], 19)
      setEtat('idle')
    } catch {
      setEtat('introuvable')
    }
  }

  // z-0 : crée un contexte d'empilement qui confine les z-index 400-1000 de Leaflet sous la barre d'outils
  return (
    <div className={`absolute inset-0 z-0 ${visible ? '' : 'hidden'}`}>
      <div ref={conteneur} className="absolute inset-0" />
      <form onSubmit={chercher} className="absolute top-16 left-3 z-[500] flex gap-2 rounded-xl bg-white/95 border border-primary-light p-2 shadow-sm w-[min(420px,calc(100%-1.5rem))]">
        <input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse ou commune" aria-label="Adresse"
          className="flex-1 border border-primary-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <button type="submit" disabled={etat === 'recherche'} className="px-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold disabled:opacity-50">
          {etat === 'recherche' ? '…' : 'Aller'}
        </button>
      </form>
      {etat === 'introuvable' && <p className="absolute top-32 left-3 z-[500] text-xs font-bold text-red-700 bg-red-50 rounded-lg px-3 py-1.5">Adresse introuvable.</p>}
      <label className="absolute bottom-3 left-3 z-[500] flex items-center gap-2 rounded-xl bg-white/95 border border-primary-light px-3 py-2 text-xs font-bold text-primary-darker shadow-sm">
        Orientation
        <input type="range" min={-180} max={180} step={1} value={Math.round((angle * 180) / Math.PI)}
          onChange={(e) => setSatellite(useStore.getState().satelliteEchelle, (Number(e.target.value) * Math.PI) / 180)} className="accent-primary w-32" />
      </label>
      <p className="absolute bottom-3 right-3 z-[500] text-[11px] text-white bg-black/50 rounded-lg px-2 py-1">Déplacez et zoomez la carte pour caler le terrain</p>
    </div>
  )
}
