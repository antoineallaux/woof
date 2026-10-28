import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const pages = readdirSync('dist/client', { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('index.html'))
  .map((f) => ({ f, html: readFileSync(`dist/client/${f}`, 'utf8') }));
// Corps de l'article seul : l'en-tête et le pied de page lient déjà les deux pages partout
const corps = (html: string) => html.split('<div class="prose')[1]?.split('<aside class="mt-12')[0] ?? '';

test('maillage : les articles mairies lient /caniparc/ et /agility/ dans le texte', () => {
  const articles = pages.filter((p) => p.f.startsWith('blog/') && p.f !== 'blog/index.html');
  for (const [cible, min] of [['/caniparc/', 14], ['/agility/', 10]] as const) {
    const n = articles.filter((p) => corps(p.html).includes(`href="${cible}"`)).length;
    assert.ok(n >= min, `${cible} : ${n} articles`);
  }
  for (const p of articles) {
    for (const cible of ['/caniparc/', '/agility/']) {
      assert.ok(corps(p.html).split(`href="${cible}"`).length <= 2, `${p.f} lie ${cible} plusieurs fois`);
    }
  }
});

test('maillage : les articles budget lient /prix-parc-canin/ une fois au plus', () => {
  const articles = pages.filter((p) => p.f.startsWith('blog/') && p.f !== 'blog/index.html');
  const liens = articles.map((p) => corps(p.html).split('href="/prix-parc-canin/"').length - 1);
  assert.ok(liens.filter((n) => n > 0).length >= 6, `${liens.filter((n) => n > 0).length} articles`);
  assert.ok(liens.every((n) => n <= 1), 'un article lie /prix-parc-canin/ plusieurs fois');
});

test('maillage : aucun lien interne du build vers une page absente ou redirigée', () => {
  // Une ancienne adresse redirigée par vercel.json coûte un saut (301) : on lie l'adresse finale
  const redirections = new Set(JSON.parse(readFileSync('vercel.json', 'utf8')).redirects.map((r: { source: string }) => r.source));
  const casses = new Set<string>();
  for (const p of pages) {
    for (const [, href] of p.html.matchAll(/href="(\/(?!\/)[^"#?]*)/g)) {
      const f = `dist/client${decodeURIComponent(href)}`;
      if (redirections.has(href) || (!existsSync(f) && !existsSync(f.replace(/\/?$/, '/index.html')))) casses.add(`${p.f} → ${href}`);
    }
  }
  assert.deepEqual([...casses], []);
});
