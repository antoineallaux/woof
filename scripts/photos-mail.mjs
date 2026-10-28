// Copies JPEG des photos produits pour le mail de devis (Outlook PC n'affiche pas le WebP).
// Relancer après l'ajout d'un produit : node scripts/photos-mail.mjs (macOS, sips).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

const dir = 'src/content/products';
const table = {};
mkdirSync('public/assets/mail', { recursive: true });
for (const f of readdirSync(dir).sort()) {
  const p = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  if (!p.image) continue;
  const chemin = `/assets/mail/${basename(p.image, extname(p.image))}.jpg`;
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '-Z', '220', `public${p.image}`, '--out', `public${chemin}`], { stdio: 'ignore' });
  table[p.slug] = chemin;
}
writeFileSync('src/lib/photos-mail.json', JSON.stringify(table, null, 2) + '\n');
