import { ajouter, changerQty } from '../../scripts/panier.js'
import { getProduit } from '../catalogue'
import { genererCloture } from '../geometrie/cloture'
import { SOLS, type Config } from '../types'
import { encoder } from '../url'

export const CLE_RESUME = 'woof-devis-config'

export interface LigneDevis { slug: string; name: string; ref: string; image: string; qty: number }

const fr = (v: number, dec = 1) => v.toFixed(dec).replace('.', ',')

/** Lignes à pousser dans le panier. `slugs` permet de forcer un slug Woof par id (par défaut celui du catalogue, sinon la ref). */
export function lignesDevis(config: Config, slugs: Record<string, string> = {}): LigneDevis[] {
  const compte = new Map<string, number>()
  for (const e of config.equipements) compte.set(e.id, (compte.get(e.id) ?? 0) + 1)
  const lignes: LigneDevis[] = []
  for (const [id, qty] of compte) {
    const p = getProduit(id)
    if (!p) continue
    lignes.push({ slug: slugs[id] ?? p.slug ?? p.ref, name: p.name, ref: p.ref, image: p.image, qty })
  }
  const { active, hauteur, sas } = config.cloture
  if (active) {
    const c = genererCloture(config.terrain, sas)
    lignes.push({
      slug: `cloture-${String(hauteur).replace('.', '-')}`,
      name: `Clôture grillagée ${fr(hauteur, 2)} m — ${fr(c.metres)} ml`,
      ref: 'CLOTURE',
      image: '/assets/configurateur/cloture.svg',
      qty: 1,
    })
    if (sas.length) lignes.push({ slug: 'sas-entree', name: "Sas d'entrée à double portillon", ref: 'SAS', image: '/assets/configurateur/sas.svg', qty: sas.length })
  }
  return lignes
}

export function resumeConfig(config: Config, lien: string): string {
  const { l, w, sol } = config.terrain
  const solLabel = (SOLS.find((s) => s.id === sol)?.label ?? sol).toLowerCase()
  const parts = [
    `Projet configurateur : ${config.nom}`,
    `Terrain : ${fr(l, 0)} × ${fr(w, 0)} m (${Math.round(l * w)} m²), sol ${solLabel}`,
  ]
  if (config.cloture.active) {
    const c = genererCloture(config.terrain, config.cloture.sas)
    const nbSas = config.cloture.sas.length
    parts.push(`Clôture : ${fr(c.metres)} ml, hauteur ${fr(config.cloture.hauteur, 2)} m${nbSas ? `, avec ${nbSas} sas` : ', sans sas'}`)
  }
  parts.push(`Plan : ${lien}`)
  return parts.join('\n')
}

/** Alimente le panier, stocke le résumé pour /devis/ et y redirige. */
export function envoyerAuDevis(config: Config) {
  for (const ligne of lignesDevis(config)) {
    ajouter({ slug: ligne.slug, name: ligne.name, ref: ligne.ref, image: ligne.image })
    changerQty(ligne.slug, ligne.qty)
  }
  const lien = `${window.location.origin}/configurateur/#cfg=${encoder(config)}`
  localStorage.setItem(CLE_RESUME, resumeConfig(config, lien))
  window.location.href = '/devis/'
}
