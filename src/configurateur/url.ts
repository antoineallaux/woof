import { corpsDe } from './catalogue'
import { placementValide, type Corps } from './geometrie/collisions'
import { bornerPos, emprisesSas, sasCompatible } from './geometrie/sas'
import type { Cote, Sas } from './geometrie/sas'
import {
  CONFIG_DEFAUT, HAUTEURS, SOLS, TERRAIN_MAX, TERRAIN_MIN, uid,
  type Config, type Equipement, type Hauteur, type Sol,
} from './types'

// Forme compacte sérialisée : version, nom, terrain, clôture, équipements
// v2 : la clôture porte une liste de sas [[cote, pos], ...]
// v1 (liens déjà partagés) : la clôture portait un sas unique [cote | null, pos | null]
type SasCompact = [string, number]
interface Compact {
  v: 2
  n: string
  t: [number, number, string]
  c: [0 | 1, number, SasCompact[]]
  e: [string, number, number, number][]
}
// Forme relue : tout est incertain, y compris la version (v1 : c = [actif, hauteur, cote, pos])
interface CompactBrut { v?: unknown; n?: unknown; t: unknown[]; c: unknown[]; e: unknown[] }

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
    v: 2,
    n: config.nom,
    t: [config.terrain.l, config.terrain.w, config.terrain.sol],
    c: [
      config.cloture.active ? 1 : 0,
      config.cloture.hauteur,
      config.cloture.sas.map((s) => [s.cote, s.pos]),
    ],
    e: config.equipements.map((e) => [e.id, e.x, e.z, e.rot]),
  }
  return versBase64Url(JSON.stringify(c))
}

const nombre = (v: unknown, defaut: number) => (typeof v === 'number' && Number.isFinite(v) ? v : defaut)
const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function decoder(brut: string, ids: Set<string>): { config: Config; ignores: string[] } | null {
  if (!brut) return null
  let c: CompactBrut
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
  // v2 : liste de sas ; v1 : un sas unique en deux champs
  const brutSas: unknown[] = Array.isArray(c.c[2])
    ? c.c[2]
    : typeof c.c[2] === 'string' && typeof c.c[3] === 'number'
      ? [[c.c[2], c.c[3]]]
      : []
  const sas: Sas[] = []
  if (active) {
    for (const b of brutSas) {
      if (!Array.isArray(b) || !COTES.includes(b[0] as Cote) || typeof b[1] !== 'number' || !Number.isFinite(b[1])) continue
      const candidat: Sas = { cote: b[0] as Cote, pos: bornerPos({ l, w }, b[0] as Cote, b[1]) }
      // deux sas qui se chevauchent : on garde le premier
      if (sasCompatible({ l, w }, candidat, sas)) sas.push(candidat)
    }
  }

  const ignores: string[] = []
  const equipements: Equipement[] = []
  const rects = active ? emprisesSas({ l, w }, sas) : []
  for (const e of c.e) {
    if (!Array.isArray(e) || typeof e[0] !== 'string') continue
    if (!ids.has(e[0])) { ignores.push(e[0]); continue }
    const eq: Equipement = { uid: uid(), id: e[0], x: nombre(e[1], 0), z: nombre(e[2], 0), rot: ((nombre(e[3], 0) % 360) + 360) % 360 }
    // un lien fabriqué à la main (ou un terrain redimensionné depuis) peut poser un équipement hors bornes
    const corps = corpsDe(eq)
    const autres = equipements.map(corpsDe).filter((x): x is Corps => x !== null)
    if (corps && placementValide(corps, autres, { l, w }, rects)) equipements.push(eq)
    else ignores.push(`${eq.id} (hors terrain)`)
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
