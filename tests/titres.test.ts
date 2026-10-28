import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const decode = (s: string) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

const pages = {
  '': {
    title: 'Fabricant de parcs canins pour collectivités | Woof! Parcs',
    description: 'Parcs canins et agility pour collectivités : plus de 500 communes équipées en Europe, garantie 5 ans, devis gratuit sous 48h.',
  },
  'blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille': {
    title: 'Combien coûte un parc canin ? 8 000 à 45 000 € | Woof!',
    description: 'Petit caniparc 8 000 à 15 000 €, parc moyen 18 000 à 30 000 €, aire premium 30 000 à 45 000 € : le budget poste par poste et les aides possibles.',
  },
  'blog/comparatif-des-revetements-de-sol-pour-un-parc-chien-collectivite-durable': {
    title: 'Revêtement de parc canin : 6 sols comparés | Woof!',
    description: 'Gazon naturel ou synthétique, copeaux, sable, dalles caoutchouc, béton : 6 revêtements de parc canin comparés (sécurité, entretien, drainage, coût).',
  },
  produits: {
    title: "Équipements d'agility canine garantis 5 ans | Woof!",
    description: 'Sauts, tunnels, passerelles, balances, plateformes, mobilier et parcours complets pour collectivités. Fabriqués en Europe, garantis 5 ans.',
  },
  agility: {
    title: 'Parcours agility chien pour collectivités | Woof!',
    description: "3 parcours agility prêts à installer (Dog Park 1, 2 et 3) et des agrès à l'unité en acier galvanisé pour l'espace canin de votre commune. Devis en 48h.",
  },
};

for (const [chemin, attendu] of Object.entries(pages)) {
  test(`/${chemin} : title et description`, () => {
    const page = readFileSync(`dist/client/${chemin ? chemin + '/' : ''}index.html`, 'utf8');
    const title = decode(page.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
    const description = decode(page.match(/<meta name="description" content="(.*?)"/s)?.[1] ?? '');
    assert.equal(title, attendu.title);
    assert.equal(description, attendu.description);
    assert.ok(title.length <= 60, `title ${title.length}`);
    assert.ok(description.length <= 155, `description ${description.length}`);
    assert.match(title, chemin ? /\| Woof!$/ : /\| Woof! Parcs$/);
  });
}
