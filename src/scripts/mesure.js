// Mesure d'audience GA4, sur le modèle d'herkules-site (lot 116) : chargée dès l'arrivée tant que le visiteur
// n'a rien choisi, un refus enregistré est respecté. Sans identifiant (PUBLIC_GA4_ID vide) : rien du tout.
export function demarrer(id, win = window) {
  id = (id ?? '').trim();
  if (!id) return;
  const doc = win.document;
  const lire = (cle, repli) => { try { return JSON.parse(win.localStorage.getItem(cle)) ?? repli; } catch { return repli; } };
  const sauver = (cle, valeur) => { try { win.localStorage.setItem(cle, JSON.stringify(valeur)); } catch {} };
  // CNIL : le choix est redemandé au bout de 6 mois ; cookies Google conservés 13 mois au plus (en secondes).
  const choixValide = Date.now() - Number(lire('woof-consentement-date', 0)) < 183 * 86400000;
  let consentement = choixValide ? lire('woof-consentement', null) : null;
  const mesureOk = () => consentement !== 'non';
  try { if (!win.sessionStorage.getItem('woof-entree')) win.sessionStorage.setItem('woof-entree', win.location.pathname); } catch {}

  let charge = false;
  const charger = () => {
    if (charge || !mesureOk()) return;
    charge = true;
    win.dataLayer = win.dataLayer || [];
    win.gtag = function () { win.dataLayer.push(arguments); };
    win.gtag('consent', 'default', { analytics_storage: 'granted' });
    win.gtag('js', new Date());
    win.gtag('config', id, { send_page_view: false, cookie_expires: 390 * 86400 });
    const script = doc.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    doc.head.append(script);
    win.gtag('event', 'page_view', { page_location: win.location.origin + win.location.pathname, page_title: doc.title });
  };

  let leadEnvoye = false;
  win.woofLead = () => {
    if (leadEnvoye || !mesureOk()) return;
    leadEnvoye = true;
    charger();
    let entree = null;
    try { entree = win.sessionStorage.getItem('woof-entree'); } catch {}
    win.gtag('event', 'generate_lead', { page_entree: entree ?? win.location.pathname, page_formulaire: win.location.pathname });
  };

  const bandeau = doc.querySelector('[data-consentement]');
  if (bandeau) bandeau.hidden = consentement !== null;
  doc.querySelector('[data-consentement-regler]')?.addEventListener('click', () => { if (bandeau) bandeau.hidden = false; });
  doc.querySelectorAll('button[data-consentement]').forEach((b) => b.addEventListener('click', () => {
    consentement = b.dataset.consentement;
    sauver('woof-consentement', consentement);
    sauver('woof-consentement-date', Date.now());
    if (bandeau) bandeau.hidden = true;
    win.gtag?.('consent', 'update', { analytics_storage: mesureOk() ? 'granted' : 'denied' });
    win['ga-disable-' + id] = !mesureOk();
    if (!mesureOk()) {
      for (const c of doc.cookie.split(';')) {
        const nom = c.trim().split('=')[0];
        if (/^_ga/.test(nom)) for (const domaine of ['', ';domain=' + win.location.hostname, ';domain=.woof-parcs.fr']) doc.cookie = nom + '=;Max-Age=0;path=/' + domaine;
      }
    }
    charger();
  }));
  charger();
}
