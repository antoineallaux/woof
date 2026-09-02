import { getProduit } from '../catalogue'
import { genererCloture } from '../geometrie/cloture'
import { SOLS, type Config } from '../types'
import type { Captures } from './captures'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const fr = (v: number, dec = 1) => v.toFixed(dec).replace('.', ',')

export function lignesEquipements(config: Config): { id: string; name: string; ref: string; qty: number; dims: string }[] {
  const compte = new Map<string, number>()
  for (const e of config.equipements) compte.set(e.id, (compte.get(e.id) ?? 0) + 1)
  return [...compte.entries()].flatMap(([id, qty]) => {
    const p = getProduit(id)
    return p ? [{ id, name: p.name, ref: p.ref, qty, dims: `${fr(p.w, 2)} × ${fr(p.d, 2)} × ${fr(p.h, 2)} m` }] : []
  })
}

export function htmlDossier(config: Config, captures: Captures, lien: string): string {
  const { l, w, sol } = config.terrain
  const { active, hauteur, sas } = config.cloture
  const cloture = genererCloture(config.terrain, sas)
  const solLabel = SOLS.find((s) => s.id === sol)?.label ?? sol
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const lignes = lignesEquipements(config)
  const c = captures.cadre

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(config.nom)} — Woof</title>
<style>
  @page { size: A4; margin: 14mm; }
  body { font-family: 'Nunito', system-ui, sans-serif; color: #1C1C1C; margin: 0; }
  h1, h2 { font-family: 'Outfit', system-ui, sans-serif; color: #33691E; margin: 0 0 6mm; }
  h1 { font-size: 26pt; } h2 { font-size: 16pt; }
  .page { page-break-after: always; min-height: 250mm; }
  .page:last-child { page-break-after: auto; }
  .cover { display: flex; flex-direction: column; justify-content: center; min-height: 250mm; text-align: center; }
  .cover .logo { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 40pt; color: #7CB342; }
  .muted { color: #6B7280; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
  th, td { border-bottom: 1px solid #DCEDC8; padding: 6px 8px; text-align: left; }
  th { background: #F0FBE8; font-weight: 800; }
  td.n { text-align: right; }
  .plan { position: relative; width: 100%; }
  .plan img { width: 100%; display: block; border-radius: 8px; border: 1px solid #DCEDC8; }
  .cadre { position: absolute; border: 2px dashed #558B2F; box-sizing: border-box; }
  .cote { position: absolute; background: #fff; border: 1px solid #DCEDC8; border-radius: 6px; padding: 2px 8px; font-weight: 800; font-size: 10pt; color: #33691E; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; font-size: 11pt; }
  .card { background: #F0FBE8; border-radius: 10px; padding: 5mm; }
  .small { font-size: 9pt; word-break: break-all; }
  footer { margin-top: 10mm; font-size: 9pt; color: #6B7280; }
</style></head><body>

<section class="page cover">
  <div class="logo">Woof!</div>
  <h1>${esc(config.nom)}</h1>
  <p class="muted">Avant-projet d'aire canine · ${date}</p>
  <p>${fr(l)} × ${fr(w)} m · ${Math.round(l * w)} m² · sol ${solLabel.toLowerCase()}</p>
</section>

<section class="page">
  <h2>Plan coté</h2>
  <div class="plan">
    <img src="${captures.plan}" alt="Plan de l'aire">
    <div class="cadre" style="left:${c.left}%;top:${c.top}%;width:${c.width}%;height:${c.height}%"></div>
    <div class="cote" style="left:50%;top:calc(${c.top}% - 22px);transform:translateX(-50%)">${fr(l)} m</div>
    <div class="cote" style="top:50%;left:calc(${c.left + c.width}% + 6px);transform:translateY(-50%)">${fr(w)} m</div>
  </div>
  <p class="muted small">Nord en haut. Les zones vertes translucides sont les dégagements recommandés autour des équipements.</p>
</section>

<section class="page">
  <h2>Vue en perspective</h2>
  <img src="${captures.vue3d}" alt="Vue 3D de l'aire" style="width:100%;border-radius:8px;border:1px solid #DCEDC8">
</section>

<section class="page">
  <h2>Composition</h2>
  <table>
    <thead><tr><th>Équipement</th><th>Référence</th><th>Dimensions</th><th class="n">Qté</th></tr></thead>
    <tbody>
      ${lignes.map((x) => `<tr><td>${esc(x.name)}</td><td>${esc(x.ref)}</td><td>${x.dims}</td><td class="n">${x.qty}</td></tr>`).join('')}
      ${active ? `<tr><td>Clôture grillagée, hauteur ${fr(hauteur, 2)} m</td><td>CLOTURE</td><td>${fr(cloture.metres)} ml · ${cloture.poteaux.length} poteaux</td><td class="n">1</td></tr>` : ''}
      ${active && sas.length ? `<tr><td>Sas d'entrée à double portillon</td><td>SAS</td><td>1,20 × 2,00 m</td><td class="n">${sas.length}</td></tr>` : ''}
    </tbody>
  </table>
  <div class="grid" style="margin-top:8mm">
    <div class="card"><strong>Terrain</strong><br>${fr(l)} × ${fr(w)} m — ${Math.round(l * w)} m²<br>Sol : ${solLabel}</div>
    <div class="card"><strong>Prix</strong><br>Sur devis. Réponse sous 48 h, installation incluse.</div>
  </div>
  <p class="small" style="margin-top:8mm"><strong>Lien du projet :</strong> ${esc(lien)}</p>
  <footer>Woof! — Ile du Platais, 78670 Villennes-sur-Seine · +33 1 84 60 23 30 · www.woof-parcs.fr</footer>
</section>
</body></html>`
}

/** Ouvre le dossier dans une fenêtre et lance l'impression une fois les images chargées. */
export function imprimerDossier(html: string) {
  const win = window.open('', '_blank', 'width=900,height=1100')
  if (!win) throw new Error('Fenêtre bloquée')
  win.document.open()
  win.document.write(html)
  win.document.close()
  const images = [...win.document.images]
  Promise.all(images.map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r })))
    .then(() => setTimeout(() => win.print(), 200))
}
