import data from '../data/configurateur/catalogue.json'

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
