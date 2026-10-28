import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { demarrer } from '../src/scripts/mesure.js';

// Faux navigateur : rien n'est chargé, les scripts ajoutés et les appels gtag sont seulement relevés.
function bouton(dataset = {}) {
  const ecouteurs = [];
  return { dataset, hidden: false, addEventListener: (_t, f) => ecouteurs.push(f), click: () => ecouteurs.forEach((f) => f()) };
}
function stockage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}
function navigateur({ chemin = '/', local = stockage(), session = stockage(), cookies = [] } = {}) {
  const scripts = [];
  const bandeau = bouton();
  bandeau.hidden = true;
  const accepter = bouton({ consentement: 'oui' });
  const refuser = bouton({ consentement: 'non' });
  const regler = bouton();
  const pot = new Map(cookies.map((c) => [c, 'x']));
  const effaces = [];
  const document = {
    title: 'Titre',
    head: { append: (s) => scripts.push(s) },
    createElement: () => ({}),
    querySelector: (sel) => ({ '[data-consentement]': bandeau, '[data-consentement-regler]': regler })[sel] ?? null,
    querySelectorAll: (sel) => (sel === 'button[data-consentement]' ? [accepter, refuser] : []),
    get cookie() { return [...pot.keys()].map((k) => `${k}=x`).join('; '); },
    set cookie(v) {
      effaces.push(v);
      if (/Max-Age=0/.test(v)) pot.delete(v.split('=')[0]);
    },
  };
  const win = { document, localStorage: local, sessionStorage: session, location: { origin: 'https://www.woof-parcs.fr', pathname: chemin, hostname: 'www.woof-parcs.fr' } };
  const appels = () => (win.dataLayer ?? []).map((a) => [...a]);
  return { win, scripts, bandeau, accepter, refuser, regler, pot, effaces, appels, local, session };
}

test('sans choix : gtag chargé avec l\'identifiant de la variable, page_view, bandeau affiché, rien d\'enregistré', () => {
  const n = navigateur({ chemin: '/produits/' });
  demarrer('G-TEST123', n.win);
  assert.equal(n.scripts.length, 1);
  assert.equal(n.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-TEST123');
  const appels = n.appels();
  assert.deepEqual(appels.find((a) => a[0] === 'consent'), ['consent', 'default', { analytics_storage: 'granted' }]);
  assert.ok(appels.some((a) => a[0] === 'config' && a[1] === 'G-TEST123' && a[2].send_page_view === false));
  assert.ok(appels.some((a) => a[0] === 'event' && a[1] === 'page_view' && a[2].page_location === 'https://www.woof-parcs.fr/produits/'));
  assert.equal(n.bandeau.hidden, false);
  assert.equal(n.local.m.size, 0);
});

test('sans variable : aucune balise, aucune erreur, bandeau caché, pas de suivi de demande', () => {
  for (const id of [undefined, '', '   ']) {
    const n = navigateur();
    assert.doesNotThrow(() => demarrer(id, n.win));
    assert.equal(n.scripts.length, 0);
    assert.equal(n.win.dataLayer, undefined);
    assert.equal(n.bandeau.hidden, true);
    assert.doesNotThrow(() => n.win.woofLead?.());
    assert.equal(n.win.dataLayer, undefined);
  }
});

test('Tout refuser : rien de plus envoyé, cookies _ga* effacés, refus gardé à la page suivante', () => {
  const local = stockage();
  const n = navigateur({ local, cookies: ['_ga', '_ga_TEST123', 'woof-autre'] });
  demarrer('G-TEST123', n.win);
  const avant = n.appels().length;
  n.refuser.click();
  assert.equal(n.bandeau.hidden, true);
  assert.deepEqual([...n.pot.keys()], ['woof-autre']);
  assert.ok(n.effaces.some((c) => c.startsWith('_ga=;Max-Age=0;path=/;domain=.woof-parcs.fr')));
  assert.deepEqual(n.appels().slice(avant), [['consent', 'update', { analytics_storage: 'denied' }]]);
  assert.equal(n.win['ga-disable-G-TEST123'], true);
  n.win.woofLead();
  assert.equal(n.appels().length, avant + 1);

  const suivante = navigateur({ chemin: '/devis/', local });
  demarrer('G-TEST123', suivante.win);
  assert.equal(suivante.scripts.length, 0);
  assert.equal(suivante.win.dataLayer, undefined);
  assert.equal(suivante.bandeau.hidden, true);
  suivante.win.woofLead();
  assert.equal(suivante.win.dataLayer, undefined);
});

test('refus de plus de 6 mois : redemandé, mesure en attendant', () => {
  const local = stockage({ 'woof-consentement': '"non"', 'woof-consentement-date': String(Date.now() - 200 * 86400000) });
  const n = navigateur({ local });
  demarrer('G-TEST123', n.win);
  assert.equal(n.scripts.length, 1);
  assert.equal(n.bandeau.hidden, false);
});

test('Tout accepter puis régler : choix gardé, bandeau rouvert par le lien du pied de page', () => {
  const local = stockage();
  const n = navigateur({ local });
  demarrer('G-TEST123', n.win);
  n.accepter.click();
  assert.equal(local.getItem('woof-consentement'), '"oui"');
  assert.equal(n.bandeau.hidden, true);
  n.regler.click();
  assert.equal(n.bandeau.hidden, false);
  const suivante = navigateur({ local });
  demarrer('G-TEST123', suivante.win);
  assert.equal(suivante.scripts.length, 1);
  assert.equal(suivante.bandeau.hidden, true);
});

test('generate_lead une seule fois au succès, avec la page d\'entrée et la page du formulaire', () => {
  const session = stockage();
  demarrer('G-TEST123', navigateur({ chemin: '/blog/caniparc/', session }).win);
  const n = navigateur({ chemin: '/devis/', session });
  demarrer('G-TEST123', n.win);
  n.win.woofLead();
  n.win.woofLead();
  const leads = n.appels().filter((a) => a[0] === 'event' && a[1] === 'generate_lead');
  assert.deepEqual(leads, [['event', 'generate_lead', { page_entree: '/blog/caniparc/', page_formulaire: '/devis/' }]]);
});

test('formulaires : woofLead appelé seulement après une réponse OK de /api/contact', () => {
  for (const page of ['src/pages/devis.astro', 'src/pages/contact.astro']) {
    const src = readFileSync(page, 'utf8');
    const ok = src.indexOf('res.ok');
    const lead = src.indexOf('window.woofLead?.()');
    const echec = src.indexOf('catch {', ok);
    assert.ok(ok > 0 && lead > ok && lead < echec, page);
    assert.equal(src.split('woofLead').length, 2, page);
  }
});

test('identifiant lu seulement dans PUBLIC_GA4_ID, jamais écrit en dur ; CSP ouverte à GA4 seulement', () => {
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');
  assert.match(layout, /import\.meta\.env\.PUBLIC_GA4_ID/);
  for (const f of ['src/layouts/Layout.astro', 'src/scripts/mesure.js', 'src/components/layout/Footer.astro', 'vercel.json']) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /G-[A-Z0-9]{6,}/, f);
  }
  const csp = JSON.parse(readFileSync('vercel.json', 'utf8')).headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy').value;
  const dir = (nom) => csp.split(';').map((s) => s.trim()).find((s) => s.startsWith(nom + ' '));
  assert.equal(dir('script-src'), "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com");
  assert.equal(dir('connect-src'), "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com");
  assert.equal(dir('img-src'), "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com");
  assert.equal(dir('default-src'), "default-src 'self'");
});
