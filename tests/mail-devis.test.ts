import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { htmlMailDevis } from '../src/lib/mail-devis.ts';
import photos from '../src/lib/photos-mail.json' with { type: 'json' };

const base = {
  prenom: 'Marie',
  nom: 'Lambert',
  email: 'm.lambert@mairie-exemple.fr',
  commune: 'Mairie de Saint-Exemple',
  telephone: '02 40 00 00 00',
  message: 'Parc de 400 m²\nprès du stade',
  produits: [
    { slug: 'petite-balance', name: 'Petite Balance', ref: 'AG03', qty: 1 },
    { slug: 'barre-saut', name: 'Barre de Saut', ref: 'AG17', qty: 2 },
    { slug: 'banc-dos', name: 'Banc Dos', ref: 'BN', qty: 1 },
    { slug: 'produit-sans-photo', name: 'Produit sans photo', ref: 'ZZ99', qty: 3 },
  ],
};

const cartes = (html: string) => html.match(/<td width="33%"[^>]*>(?:<div.*?<\/div><\/div>)?<\/td>/g) ?? [];

test('complet : logo, en-tête, message, cartes avec photo, lien et quantité, boutons', () => {
  const html = htmlMailDevis(base);
  assert.match(html, /<img src="https:\/\/www\.woof-parcs\.fr\/assets\/logo-header-woof\.png"/);
  assert.doesNotMatch(html, /file:\/\/|\.webp/);
  assert.match(html, />Demande de devis</);
  assert.match(html, />Marie Lambert<\/div><div[^>]*>Mairie de Saint-Exemple</);
  assert.match(html, /href="mailto:m\.lambert@mairie-exemple\.fr"[^>]*>m\.lambert@mairie-exemple\.fr</);
  assert.match(html, /📞 <b>02 40 00 00 00<\/b>/);
  assert.match(html, /« Parc de 400 m²<br>près du stade »/);
  assert.match(html, />4 produits sélectionnés</);
  assert.match(html, /href="https:\/\/www\.woof-parcs\.fr\/produits\/barre-saut\/"[^>]*>Barre de Saut</);
  assert.match(html, /Réf\. AG17/);
  assert.match(html, />Qté 2</);
  assert.match(html, /href="mailto:m\.lambert@mairie-exemple\.fr"[^>]*>Répondre à Marie</);
  assert.match(html, /href="tel:0240000000"[^>]*>Appeler</);
  assert.match(html, /Reçue via woof-parcs\.fr · lead créé dans Zoho CRM · Woof!, une marque de Herkules Fitness/);
  assert.doesNotMatch(html, /<link|<style|<script/);
});

test('photos : copie .jpg ou .png absolue trouvée par le produit, carte sans img si pas de photo', () => {
  const html = htmlMailDevis(base);
  assert.match(html, /<img src="https:\/\/www\.woof-parcs\.fr\/assets\/mail\/AG03\.jpg"/);
  // banc-dos a la réf. BN mais l'image BN-DOS : on ne devine pas depuis la référence
  assert.match(html, /<img src="https:\/\/www\.woof-parcs\.fr\/assets\/mail\/BN-DOS\.jpg"/);
  const sansPhoto = cartes(html).find((c) => c.includes('Produit sans photo'));
  assert.ok(sansPhoto);
  assert.doesNotMatch(sansPhoto, /<img/);
  assert.equal((html.match(/<img src="https:\/\/www\.woof-parcs\.fr\/assets\/mail\//g) ?? []).length, 3);
});

test('3 cartes par ligne', () => {
  const html = htmlMailDevis(base);
  const lignes = html.match(/<tr>(?:<td width="33%".*?<\/td>)+<\/tr>/g) ?? [];
  assert.equal(lignes.length, 2);
  assert.equal(cartes(lignes[0]).length, 3);
  assert.equal(cartes(lignes[1]).length, 3);
  assert.equal(cartes(lignes[1]).filter((c) => c.includes('<div')).length, 1);
});

test('sans produits, message ni téléphone : ni guillemets, ni cartes, ni Appeler', () => {
  const html = htmlMailDevis({ ...base, message: undefined, telephone: undefined, produits: [] });
  assert.doesNotMatch(html, /«|»/);
  assert.doesNotMatch(html, /produits? sélectionnés?|width="33%"/);
  assert.doesNotMatch(html, /tel:|Appeler|📞/);
  assert.match(html, />Répondre à Marie</);
  assert.match(html, />Marie Lambert</);
});

test('1 produit : singulier, quantité absente = 1', () => {
  const html = htmlMailDevis({ ...base, produits: [{ slug: 'petite-balance', name: 'Petite Balance', ref: 'AG03', qty: 0 }] });
  assert.match(html, />1 produit sélectionné</);
  assert.match(html, />Qté 1</);
});

test('caractères spéciaux échappés partout, y compris mailto:, tel: et liens produits', () => {
  const x = `<script>alert(1)</script>&"'`;
  const html = htmlMailDevis({
    prenom: x,
    nom: x,
    email: `a"><script>@b.fr`,
    commune: x,
    telephone: `+33"><script>`,
    message: x,
    produits: [{ slug: `s"><script>`, name: x, ref: x, qty: 1 }],
  });
  assert.doesNotMatch(html, /<script/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;&amp;&quot;&#39;/);
  assert.match(html, /href="mailto:a&quot;&gt;&lt;script&gt;@b\.fr"/);
  assert.match(html, /href="tel:\+33&quot;&gt;&lt;script&gt;"/);
  assert.match(html, /href="https:\/\/www\.woof-parcs\.fr\/produits\/s&quot;&gt;&lt;script&gt;\/"/);
});

test('catalogue : chaque produit a sa copie mail, présente dans public/ et légère', () => {
  const dir = new URL('../src/content/products/', import.meta.url);
  const table = photos as Record<string, string>;
  for (const f of readdirSync(dir)) {
    const p = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    if (!p.image) continue;
    const chemin = table[p.slug];
    assert.match(chemin ?? '', /^\/assets\/mail\/[^/]+\.(jpg|png)$/, p.slug);
    const fichier = new URL(`../public${chemin}`, import.meta.url);
    assert.ok(existsSync(fichier), chemin);
    assert.ok(statSync(fichier).size < 60_000, `${chemin} trop lourd`);
  }
});
