import { bornerPos } from './geometrie/sas'
import type { Cote } from './geometrie/sas'
import {
  CONFIG_DEFAUT, HAUTEURS, SOLS, TERRAIN_MAX, TERRAIN_MIN, uid,
  type Config, type Hauteur, type Sol,
} from './types'

// Forme compacte sérialisée : version, nom, terrain, clôture, équipements
interface Compact {
  v: 1
  n: string
  t: [number, number, string]
  c: [0 | 1, number, string | null, number | null]
  e: [string, number, number, number][]
}

const COTES: Cote[] = ['nord', 'est', 'sud', 'ouest']

function versBase64Url(s: string): string {
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(s)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function depuisBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))
}

export function encoder(config: Config): string {
  const c: Compact = {
    v: 1,
    n: config.nom,
    t: [config.terrain.l, config.terrain.w, config.terrain.sol],
    c: [
      config.cloture.active ? 1 : 0,
      config.cloture.hauteur,
      config.cloture.sas?.cote ?? null,
      config.cloture.sas?.pos ?? null,
    ],
    e: config.equipements.map((e) => [e.id, e.x, e.z, e.rot]),
  }
  return versBase64Url(JSON.stringify(c))
}

const nombre = (v: unknown, defaut: number) => (typeof v === 'number' && Number.isFinite(v) ? v : defaut)
const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function decoder(brut: string, ids: Set<string>): { config: Config; ignores: string[] } | null {
  if (!brut) return null
  let c: Compact
  try {
    c = JSON.parse(depuisBase64Url(brut))
  } catch {
    return null
  }
  if (!c || typeof c !== 'object' || !Array.isArray(c.t) || !Array.isArray(c.c) || !Array.isArray(c.e)) return null

  const l = borner(nombre(c.t[0], CONFIG_DEFAUT.terrain.l), TERRAIN_MIN, TERRAIN_MAX)
  const w = borner(nombre(c.t[1], CONFIG_DEFAUT.terrain.w), TERRAIN_MIN, TERRAIN_MAX)
  const sol: Sol = SOLS.some((s) => s.id === c.t[2]) ? (c.t[2] as Sol) : CONFIG_DEFAUT.terrain.sol
  const hauteur: Hauteur = HAUTEURS.includes(c.c[1] as Hauteur) ? (c.c[1] as Hauteur) : CONFIG_DEFAUT.cloture.hauteur
  const active = c.c[0] === 1
  const cote = COTES.includes(c.c[2] as Cote) ? (c.c[2] as Cote) : null
  const sas = active && cote !== null && typeof c.c[3] === 'number'
    ? { cote, pos: bornerPos({ l, w }, cote, c.c[3]) }
    : null

  const ignores: string[] = []
  const equipements = []
  for (const e of c.e) {
    if (!Array.isArray(e) || typeof e[0] !== 'string') continue
    if (!ids.has(e[0])) { ignores.push(e[0]); continue }
    equipements.push({ uid: uid(), id: e[0], x: nombre(e[1], 0), z: nombre(e[2], 0), rot: nombre(e[3], 0) % 360 })
  }

  return {
    config: {
      nom: typeof c.n === 'string' ? c.n.slice(0, 80) : CONFIG_DEFAUT.nom,
      terrain: { l, w, sol },
      cloture: { active, hauteur, sas },
      equipements,
    },
    ignores,
  }
}

export function lireHash(hash: string): string | null {
  const m = /^#cfg=([A-Za-z0-9_-]+)$/.exec(hash)
  return m ? m[1] : null
}
