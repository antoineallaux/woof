import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlMailDevis } from '../src/lib/mail-devis.ts';

const base = {
  prenom: 'Marie',
  nom: 'Lambert',
  email: 'm.lambert@mairie-exemple.fr',
  commune: 'Mairie de Saint-Exemple',
  telephone: '02 40 00 00 00',
  message: 'Parc de 400 m²\nprès du stade',
  produits: [
    { slug: 'petite-balance', name: 'Petite Balance', ref: 'AG03', qty: 1 },
    { slug: 'barre-de-saut', name: 'Barre de Saut', ref: 'AG17', qty: 2 },
  ],
};

test('complet : bandeau, contact, projet, produits avec lien et quantité, boutons', () => {
  const html = htmlMailDevis(base);
  assert.match(html, /<img src="https:\/\/www\.woof-parcs\.fr\/assets\/logo-woof-yellow\.png"/);
  assert.doesNotMatch(html, /file:\/\//);
  assert.match(html, /background:#1F3D31/);
  assert.match(html, /2 produits sélectionnés · reçue via woof-parcs\.fr/);
  assert.match(html, />Marie Lambert</);
  assert.match(html, />Projet</);
  assert.match(html, /Parc de 400 m²<br>près du stade/);
  assert.match(html, /href="https:\/\/www\.woof-parcs\.fr\/produits\/barre-de-saut\/"[^>]*>Barre de Saut</);
  assert.match(html, /Réf\. AG17/);
  assert.match(html, />× 2</);
  assert.match(html, /href="mailto:m\.lambert@mairie-exemple\.fr"[^>]*>Répondre à Marie</);
  assert.match(html, /href="tel:0240000000"[^>]*>Appeler</);
  assert.doesNotMatch(html, /<link|<style|<script/);
});

test('sans produits, message ni téléphone : ni bloc Projet, ni produits, ni Appeler', () => {
  const html = htmlMailDevis({ ...base, message: undefined, telephone: undefined, produits: [] });
  assert.doesNotMatch(html, />Projet</);
  assert.doesNotMatch(html, /Produits sélectionnés/);
  assert.doesNotMatch(html, /tel:|Appeler/);
  assert.match(html, />Non renseigné</);
  assert.match(html, /<div[^>]*>reçue via woof-parcs\.fr<\/div>/);
  assert.match(html, />Répondre à Marie</);
});

test('1 produit : singulier', () => {
  assert.match(htmlMailDevis({ ...base, produits: base.produits.slice(0, 1) }), /1 produit sélectionné ·/);
});

test('caractères spéciaux échappés partout, y compris mailto: et tel:', () => {
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
});
