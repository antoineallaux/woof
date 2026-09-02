import { useMemo } from 'react'
import { genererCloture } from '../geometrie/cloture'
import { useStore } from '../store'
import type { Config } from '../types'

/** Mètres à une décimale, sans zéro inutile : 67.6 → « 67,6 », 70 → « 70 ». */
const metres = (v: number) => v.toFixed(1).replace(/\.0$/, '').replace('.', ',')

/** Ligne de synthèse du projet : surface, équipements, et clôture/sas quand la clôture est active. */
export function texteRecap(config: Config): string {
  const { l, w } = config.terrain
  const n = config.equipements.length
  const parts = [`${Math.round(l * w)} m²`, `${n} ${n > 1 ? 'équipements' : 'équipement'}`]
  if (config.cloture.active) {
    parts.push(`Clôture ${metres(genererCloture(config.terrain, config.cloture.sas).metres)} ml`)
    const sas = config.cloture.sas.length
    if (sas) parts.push(`${sas} sas`)
  }
  return parts.join(' · ')
}

/** Synthèse permanente du projet, sous les onglets du panneau latéral. */
export function Recap() {
  const config = useStore((s) => s.config)
  const texte = useMemo(() => texteRecap(config), [config])
  return (
    <p className="shrink-0 border-t border-primary-light bg-surface px-4 py-2.5 text-xs font-bold text-primary-darker">
      {texte}
    </p>
  )
}
