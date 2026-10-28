// Mail interne d'une demande de devis (maquette « version 1, Bandeau vert ») :
// tableaux et styles en ligne pour Outlook, logo en adresse absolue.

export type Produit = { slug: string; name: string; ref: string; qty: number };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const SITE = 'https://www.woof-parcs.fr';
const TITRE = "font-family:'Outfit',Arial,Helvetica,sans-serif;font-weight:800";
const BOUTON = `display:inline-block;${TITRE};font-size:14px;text-decoration:none;padding:12px 20px;border-radius:10px;margin:0 8px 8px 0`;

const ligne = (libelle: string, valeur: string) =>
  `<tr><td style="padding:9px 0;color:#6B7280;font-size:13px;width:150px;vertical-align:top">${libelle}</td><td style="padding:9px 0;font-size:15px;font-weight:700">${valeur}</td></tr>`;

export function htmlMailDevis(d: {
  prenom: string;
  nom: string;
  email: string;
  commune: string;
  telephone?: string;
  message?: string;
  produits: Produit[];
}) {
  const n = d.produits.length;
  const sousTitre = (n ? `${n} produit${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''} · ` : '') + 'reçue via woof-parcs.fr';

  const projet = d.message
    ? `<tr><td style="padding:10px 32px"><div style="background:#FFFBF5;border-left:4px solid #7CB342;border-radius:8px;padding:14px 16px;font-size:15px;line-height:1.5">
  <div style="color:#6B7280;font-size:12px;margin-bottom:4px">Projet</div>${esc(d.message).replace(/\n/g, '<br>')}</div></td></tr>`
    : '';

  const produits = n
    ? `<tr><td style="padding:14px 32px 4px"><div style="${TITRE};font-size:17px;color:#1F3D31">Produits sélectionnés</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px">${d.produits
    .map(
      (p) =>
        `<tr><td style="padding:12px 0;border-top:1px solid #E5EEDC;font-size:15px;font-weight:700"><a href="${SITE}/produits/${esc(p.slug)}/" style="color:#1C1C1C;text-decoration:none">${esc(p.name)}</a>${p.ref ? `<div style="color:#6B7280;font-size:12px;font-weight:400">Réf. ${esc(p.ref)}</div>` : ''}</td><td style="padding:12px 0;border-top:1px solid #E5EEDC;text-align:right"><span style="background:#7CB342;color:#fff;${TITRE};font-size:13px;padding:4px 10px;border-radius:999px">× ${p.qty || 1}</span></td></tr>`
    )
    .join('')}</table></td></tr>`
    : '';

  const appeler = d.telephone
    ? `<a href="tel:${esc(d.telephone.replace(/[\s.()-]/g, ''))}" style="background:#1F3D31;color:#FFFFFF;${BOUTON}">Appeler</a>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#FFFBF5;font-family:'Nunito',Arial,Helvetica,sans-serif;color:#1C1C1C"><table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF5"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1F3D31;padding:28px 32px">
  <img src="${SITE}/assets/logo-woof-yellow.png" width="120" alt="Woof!" style="display:block">
  <div style="margin-top:18px;color:#7CB342;${TITRE};font-size:12px;letter-spacing:2px;text-transform:uppercase">■ Nouvelle demande de devis</div>
  <div style="margin-top:6px;color:#fff;${TITRE};font-size:28px;line-height:1.15;text-transform:uppercase">${esc(d.commune)}</div>
  <div style="margin-top:6px;color:#CFE3C0;font-size:15px">${sousTitre}</div>
</td></tr>
<tr><td style="padding:26px 32px 6px"><table width="100%" cellpadding="0" cellspacing="0">${ligne('Contact', `${esc(d.prenom)} ${esc(d.nom)}`)}${ligne('Commune / organisme', esc(d.commune))}${ligne('Email', `<a href="mailto:${esc(d.email)}" style="color:#1F3D31">${esc(d.email)}</a>`)}${ligne('Téléphone', d.telephone ? esc(d.telephone) : 'Non renseigné')}</table></td></tr>
${projet}
${produits}
<tr><td style="padding:18px 32px 26px"><a href="mailto:${esc(d.email)}" style="background:#F6BA0E;color:#1F3D31;${BOUTON}">Répondre à ${esc(d.prenom)}</a>${appeler}</td></tr>
<tr><td style="background:#1F3D31;padding:14px 32px;color:#CFE3C0;font-size:12px">Woof! · une marque de Herkules Fitness · Le lead est aussi créé dans Zoho CRM.</td></tr>
</table></td></tr></table></body></html>`;
}
