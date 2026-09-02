import type { Sas } from './geometrie/sas'

export type Sol = 'sable' | 'terre' | 'gazon'
export type Hauteur = 1.2 | 1.5 | 1.8

export const SOLS: { id: Sol; label: string }[] = [
  { id: 'sable', label: 'Sable' },
  { id: 'terre', label: 'Terre' },
  { id: 'gazon', label: 'Gazon' },
]
export const HAUTEURS: Hauteur[] = [1.2, 1.5, 1.8]
export const TERRAIN_MIN = 5
export const TERRAIN_MAX = 60

export interface Equipement {
  uid: string
  id: string
  x: number
  z: number
  rot: number
}

export interface Config {
  nom: string
  terrain: { l: number; w: number; sol: Sol }
  cloture: { active: boolean; hauteur: Hauteur; sas: Sas[] }
  equipements: Equipement[]
}

export const CONFIG_DEFAUT: Config = {
  nom: 'Mon aire canine',
  terrain: { l: 20, w: 15, sol: 'gazon' },
  cloture: { active: false, hauteur: 1.5, sas: [] },
  equipements: [],
}

export function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
}
