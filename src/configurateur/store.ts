import { create } from 'zustand'
import { getProduit } from './catalogue'
import { placementValide, snap, type Corps, type Rect } from './geometrie/collisions'
import { bornerPos, empriseSas, type Sas } from './geometrie/sas'
import { CONFIG_DEFAUT, TERRAIN_MAX, TERRAIN_MIN, uid, type Config, type Equipement } from './types'

export type Vue = '3d' | 'plan' | 'satellite'
const MAX_HISTO = 20

export function corpsDe(e: Equipement): Corps | null {
  const p = getProduit(e.id)
  if (!p) return null
  return { uid: e.uid, x: e.x, z: e.z, rot: e.rot, w: p.w, d: p.d, clearance: p.clearance }
}

export function sasRect(config: Config): Rect | null {
  const { active, sas } = config.cloture
  return active && sas ? empriseSas(config.terrain, sas) : null
}

function valide(candidat: Equipement, config: Config, exclure: Set<string> = new Set()): boolean {
  const c = corpsDe(candidat)
  if (!c) return false
  const autres = config.equipements
    .filter((e) => !exclure.has(e.uid))
    .map(corpsDe)
    .filter((x): x is Corps => x !== null)
  return placementValide(c, autres, config.terrain, sasRect(config))
}

interface State {
  config: Config
  passe: Config[]
  futur: Config[]
  selection: string[]
  outil: string | null
  vue: Vue
  cotes: boolean
  dragging: boolean
  satelliteEchelle: number
  satelliteAngle: number
  erreur: string | null

  reinitialiser(): void
  charger(config: Config): void
  modifier(fn: (c: Config) => Config, enregistrer?: boolean): void
  enregistrer(): void
  annuler(): void
  retablir(): void

  setNom(nom: string): void
  setTerrain(t: Partial<Config['terrain']>): void
  setCloture(c: Partial<Omit<Config['cloture'], 'sas'>>): void
  setSas(sas: Sas | null): void

  placer(id: string, x: number, z: number): boolean
  deplacer(uids: string[], dx: number, dz: number, enregistrer?: boolean): boolean
  tourner(uid: string, rot: number, enregistrer?: boolean): boolean
  supprimer(uids: string[]): void
  dupliquer(uid: string): void

  select(uids: string[]): void
  setOutil(id: string | null): void
  setVue(vue: Vue): void
  toggleCotes(): void
  setDragging(v: boolean): void
  setSatellite(echelle: number, angle?: number): void
  setErreur(msg: string | null): void
}

export const useStore = create<State>((set, get) => ({
  config: CONFIG_DEFAUT,
  passe: [],
  futur: [],
  selection: [],
  outil: null,
  vue: '3d',
  cotes: true,
  dragging: false,
  satelliteEchelle: 20,
  satelliteAngle: 0,
  erreur: null,

  reinitialiser: () => set({ config: CONFIG_DEFAUT, passe: [], futur: [], selection: [], outil: null, erreur: null }),
  charger: (config) => set({ config, passe: [], futur: [], selection: [], outil: null }),

  modifier: (fn, enregistrer = true) =>
    set((s) => {
      const next = fn(s.config)
      if (next === s.config) return {}
      return enregistrer
        ? { config: next, passe: [...s.passe.slice(-(MAX_HISTO - 1)), s.config], futur: [] }
        : { config: next }
    }),
  enregistrer: () => set((s) => ({ passe: [...s.passe.slice(-(MAX_HISTO - 1)), s.config], futur: [] })),
  annuler: () =>
    set((s) => {
      const prev = s.passe.at(-1)
      if (!prev) return {}
      return { config: prev, passe: s.passe.slice(0, -1), futur: [s.config, ...s.futur].slice(0, MAX_HISTO), selection: [] }
    }),
  retablir: () =>
    set((s) => {
      const [next, ...reste] = s.futur
      if (!next) return {}
      return { config: next, futur: reste, passe: [...s.passe, s.config].slice(-MAX_HISTO), selection: [] }
    }),

  setNom: (nom) => get().modifier((c) => ({ ...c, nom: nom.slice(0, 80) }), false),
  setTerrain: (t) =>
    get().modifier((c) => {
      const terrain = { ...c.terrain, ...t }
      terrain.l = Math.min(TERRAIN_MAX, Math.max(TERRAIN_MIN, terrain.l))
      terrain.w = Math.min(TERRAIN_MAX, Math.max(TERRAIN_MIN, terrain.w))
      const sas = c.cloture.sas ? { ...c.cloture.sas, pos: bornerPos(terrain, c.cloture.sas.cote, c.cloture.sas.pos) } : null
      return { ...c, terrain, cloture: { ...c.cloture, sas } }
    }),
  setCloture: (patch) =>
    get().modifier((c) => {
      const cloture = { ...c.cloture, ...patch }
      if (!cloture.active) cloture.sas = null
      return { ...c, cloture }
    }),
  setSas: (sas) => get().modifier((c) => ({ ...c, cloture: { ...c.cloture, sas } }), false),

  placer: (id, x, z) => {
    const s = get()
    if (!getProduit(id)) return false
    const e: Equipement = { uid: uid(), id, x: snap(x), z: snap(z), rot: 0 }
    if (!valide(e, s.config)) {
      set({ erreur: 'Impossible ici : la zone de dégagement doit rester dans le terrain et hors des autres équipements.' })
      return false
    }
    s.modifier((c) => ({ ...c, equipements: [...c.equipements, e] }))
    set({ selection: [e.uid], outil: null, erreur: null })
    return true
  },

  deplacer: (uids, dx, dz, enregistrer = true) => {
    const s = get()
    const cible = new Set(uids)
    const bouges = s.config.equipements
      .filter((e) => cible.has(e.uid))
      .map((e) => ({ ...e, x: snap(e.x + dx), z: snap(e.z + dz) }))
    // validation contre les immobiles ET entre bougés (en positions futures)
    const futurs: Config = { ...s.config, equipements: s.config.equipements.map((e) => bouges.find((b) => b.uid === e.uid) ?? e) }
    for (const b of bouges) if (!valide(b, futurs)) return false
    s.modifier(() => futurs, enregistrer)
    return true
  },

  tourner: (uid, rot, enregistrer = true) => {
    const s = get()
    const r = ((rot % 360) + 360) % 360
    const e = s.config.equipements.find((x) => x.uid === uid)
    if (!e) return false
    const candidat = { ...e, rot: r }
    if (!valide(candidat, s.config)) {
      set({ erreur: 'Rotation impossible : collision ou sortie du terrain.' })
      return false
    }
    s.modifier((c) => ({ ...c, equipements: c.equipements.map((x) => (x.uid === uid ? candidat : x)) }), enregistrer)
    return true
  },

  supprimer: (uids) => {
    const cible = new Set(uids)
    get().modifier((c) => ({ ...c, equipements: c.equipements.filter((e) => !cible.has(e.uid)) }))
    set({ selection: [] })
  },

  dupliquer: (uidSource) => {
    const s = get()
    const e = s.config.equipements.find((x) => x.uid === uidSource)
    const p = e && getProduit(e.id)
    if (!e || !p) return
    // essaie à droite, puis en dessous, à gauche, au-dessus
    const pas = Math.max(p.w, p.d) + 2 * p.clearance + 0.2
    for (const [dx, dz] of [[pas, 0], [0, pas], [-pas, 0], [0, -pas]]) {
      const copie: Equipement = { ...e, uid: uid(), x: snap(e.x + dx), z: snap(e.z + dz) }
      if (valide(copie, s.config)) {
        s.modifier((c) => ({ ...c, equipements: [...c.equipements, copie] }))
        set({ selection: [copie.uid] })
        return
      }
    }
    set({ erreur: 'Pas de place libre à côté pour dupliquer.' })
  },

  select: (uids) => set({ selection: uids }),
  setOutil: (id) => set({ outil: id, selection: id ? [] : get().selection }),
  setVue: (vue) => set({ vue }),
  toggleCotes: () => set((s) => ({ cotes: !s.cotes })),
  setDragging: (v) => set({ dragging: v }),
  setSatellite: (echelle, angle) => set((s) => ({ satelliteEchelle: echelle, satelliteAngle: angle ?? s.satelliteAngle })),
  setErreur: (msg) => set({ erreur: msg }),
}))
