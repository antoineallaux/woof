import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { limiteDepassee, jetonValide } from '../src/lib/securite.ts';

test('limiteDepassee : 5 envois par IP et par 10 min, puis remise à zéro', () => {
  const t = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(limiteDepassee('198.51.100.1', t), false);
  assert.equal(limiteDepassee('198.51.100.1', t + 1000), true);
  assert.equal(limiteDepassee('198.51.100.2', t + 1000), false);
  assert.equal(limiteDepassee('198.51.100.1', t + 10 * 60_000), false);
});

test('jetonValide : comparaison en temps constant, longueurs différentes refusées sans erreur', () => {
  assert.equal(jetonValide('Bearer abc123', 'abc123'), true);
  assert.equal(jetonValide('Bearer abc124', 'abc123'), false);
  assert.equal(jetonValide('Bearer abc', 'abc123'), false);
  assert.equal(jetonValide(null, 'abc123'), false);
  const cron = readFileSync('src/pages/api/cron/publish-blog.ts', 'utf8');
  assert.match(cron, /jetonValide\(request\.headers\.get\('authorization'\), secret\)/);
  assert.doesNotMatch(cron, /!== `Bearer/);
});
