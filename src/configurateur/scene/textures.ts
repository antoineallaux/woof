import * as THREE from 'three'
import type { Sol } from '../types'

const PALETTE: Record<Sol, { base: string; grains: string[] }> = {
  sable: { base: '#E8D9A8', grains: ['#D9C58F', '#F2E6BE', '#CDB77E'] },
  terre: { base: '#8B6B47', grains: ['#7A5C3B', '#9C7A54', '#6E5234'] },
  gazon: { base: '#6FA83A', grains: ['#5F9A33', '#7FB84A', '#4C7F27'] },
}

function canvasBruit(base: string, grains: string[], taille = 256, densite = 2600): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = taille
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, taille, taille)
  for (let i = 0; i < densite; i++) {
    ctx.fillStyle = grains[i % grains.length]
    ctx.globalAlpha = 0.35 + Math.random() * 0.4
    const r = 1 + Math.random() * 2.5
    ctx.beginPath()
    ctx.arc(Math.random() * taille, Math.random() * taille, r, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

const cache = new Map<string, THREE.CanvasTexture>()

/** Texture répétée tous les 2 m. */
export function textureSol(sol: Sol, l: number, w: number): THREE.CanvasTexture {
  const cle = `${sol}`
  let t = cache.get(cle)
  if (!t) {
    const { base, grains } = PALETTE[sol]
    t = new THREE.CanvasTexture(canvasBruit(base, grains))
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = THREE.SRGBColorSpace
    cache.set(cle, t)
  }
  const clone = t.clone()
  clone.repeat.set(l / 2, w / 2)
  clone.needsUpdate = true
  return clone
}

export function textureEnvironnement(): THREE.CanvasTexture {
  const t = textureSol('gazon', 400, 400)
  t.repeat.set(200, 200)
  return t
}

let grillage: THREE.CanvasTexture | null = null
/** Grille verte sur fond transparent, à utiliser avec transparent + alphaTest. */
export function textureGrillage(): THREE.CanvasTexture {
  if (grillage) return grillage
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 64, 64)
  ctx.strokeStyle = '#2F5B3A'
  ctx.lineWidth = 2
  for (let i = 0; i <= 64; i += 16) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 64); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(64, i); ctx.stroke()
  }
  grillage = new THREE.CanvasTexture(c)
  grillage.wrapS = grillage.wrapT = THREE.RepeatWrapping
  grillage.colorSpace = THREE.SRGBColorSpace
  return grillage
}
