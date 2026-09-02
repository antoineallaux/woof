import data from '../data/configurateur/catalogue.json'
import type { Corps } from './geometrie/collisions'
import type { Equipement } from './types'

export interface Produit {
  id: string
  ref: string
  name: string
  category: string
  w: number
  d: number
  h: number
  clearance: number
  image: string
  glb: string
  slug: string | null
}

export const CATALOGUE: Produit[] = data as Produit[]

const PAR_ID = new Map(CATALOGUE.map((p) => [p.id, p]))

export function getProduit(id: string): Produit | undefined {
  return PAR_ID.get(id)
}

export const CATEGORIES = [...new Set(CATALOGUE.map((p) => p.category))]

/** Corps de collision d'un équipement posé (dimensions et dégagement issus du catalogue). */
export function corpsDe(e: Equipement): Corps | null {
  const p = getProduit(e.id)
  if (!p) return null
  return { uid: e.uid, x: e.x, z: e.z, rot: e.rot, w: p.w, d: p.d, clearance: p.clearance }
}
