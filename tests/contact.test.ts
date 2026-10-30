import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POST } from '../src/pages/api/contact.ts';

const appels: string[] = [];
globalThis.fetch = (async (u: unknown) => {
  appels.push(String(u));
  return new Response('{}');
}) as typeof fetch;

const envoi = (ip: string, champs: Record<string, string>) => {
  const body = new FormData();
  for (const [k, v] of Object.entries(champs)) body.append(k, v);
  return POST({ request: new Request('http://localhost/api/contact/', { method: 'POST', body }), clientAddress: ip } as any);
};
const demande = { prenom: 'Jean', nom: 'Robot', email: 'robot@example.com', commune: 'Test', message: 'spam' };

test('contact : champ piège rempli = réponse 200 et rien envoyé', async () => {
  appels.length = 0;
  const res = await envoi('192.0.2.1', { ...demande, site_web: 'http://spam.example' });
  assert.equal(res.status, 200);
  assert.deepEqual(appels, []);
});

test('contact : 6e envoi de la même IP en 10 min = 429, rien envoyé', async () => {
  appels.length = 0;
  for (let i = 0; i < 5; i++) assert.equal((await envoi('192.0.2.2', { ...demande, site_web: 'x' })).status, 200);
  assert.equal((await envoi('192.0.2.2', demande)).status, 429);
  assert.deepEqual(appels, []);
});

// Lit la sortie de `npm run build` : lancer le build avant ce test
test('formulaires /contact/ et /devis/ : champ piège présent, caché et hors tabulation', () => {
  for (const page of ['contact', 'devis']) {
    const html = readFileSync(`dist/client/${page}/index.html`, 'utf8');
    assert.ok(/<input[^>]*name="site_web"[^>]*tabindex="-1"/.test(html), page);
  }
});
