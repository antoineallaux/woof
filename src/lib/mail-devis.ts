// Mail interne d'une demande de devis (maquette « version 2, Fiche claire ») :
// tableaux et styles en ligne pour Outlook, logo et photos en adresse absolue.
// Photos : copies JPEG (Outlook PC n'affiche pas le WebP), table générée par scripts/photos-mail.mjs.
import photos from './photos-mail.json' with { type: 'json' };

export type Produit = { slug: string; name: string; ref: string; qty: number };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const SITE = 'https://www.woof-parcs.fr';
const PHOTOS: Record<string, string> = photos;
const TITRE = "font-family:'Outfit',Arial,Helvetica,sans-serif;font-weight:800";
const BOUTON = `display:inline-block;${TITRE};font-size:14px;text-decoration:none;padding:12px 20px;border-radius:10px;margin:0 8px 8px 0`;

const carte = (p: Produit) => {
  const lien = `${SITE}/produits/${esc(p.slug)}/`;
  const photo = Object.hasOwn(PHOTOS, p.slug)
    ? `<a href="${lien}"><img src="${SITE}${PHOTOS[p.slug]}" width="110" height="110" alt="" style="display:block;margin:0 auto;border:0"></a>`
    : '';
  return `<td width="33%" valign="top" style="padding:6px"><div style="background:#fff;border:1px solid #DCEDC8;border-radius:14px;padding:12px;text-align:center">${photo}<div style="margin-top:8px;font-size:14px;font-weight:800"><a href="${lien}" style="color:#1C1C1C;text-decoration:none">${esc(p.name)}</a></div>${p.ref ? `<div style="color:#6B7280;font-size:12px">Réf. ${esc(p.ref)}</div>` : ''}<div style="margin-top:8px;display:inline-block;background:#F6BA0E;color:#1F3D31;${TITRE};font-size:13px;padding:3px 12px;border-radius:999px">Qté ${p.qty || 1}</div></div></td>`;
};

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

  const lignes: string[] = [];
  for (let i = 0; i < n; i += 3) {
    const rang = d.produits.slice(i, i + 3).map(carte);
    while (rang.length < 3) rang.push('<td width="33%"></td>');
    lignes.push(`<tr>${rang.join('')}</tr>`);
  }
  const produits = n
    ? `<tr><td style="padding:22px 2px 4px 8px;${TITRE};font-size:17px;color:#1F3D31">${n} produit${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''}</td></tr>
<tr><td><table width="100%" cellpadding="0" cellspacing="0">${lignes.join('')}</table></td></tr>`
    : '';

  const telephone = d.telephone ? `<td style="font-size:14px">📞 <b>${esc(d.telephone)}</b></td>` : '';
  const message = d.message
    ? `<div style="margin-top:18px;font-size:15px;line-height:1.55;color:#1C1C1C">« ${esc(d.message).replace(/\n/g, '<br>')} »</div>`
    : '';
  const appeler = d.telephone
    ? `<a href="tel:${esc(d.telephone.replace(/[\s.()-]/g, ''))}" style="background:#1F3D31;color:#FFFFFF;${BOUTON}">Appeler</a>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#FFFBF5;font-family:'Nunito',Arial,Helvetica,sans-serif;color:#1C1C1C"><table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF5"><tr><td align="center" style="padding:28px 12px">
<table width="600" cellpadding="0" cellspacing="0">
<tr><td style="padding:0 8px 18px"><img src="${SITE}/assets/logo-header-woof.png" width="110" alt="Woof!" style="display:block;border:0"></td></tr>
<tr><td style="background:#fff;border-radius:18px;padding:28px 28px 22px;border:1px solid #DCEDC8">
  <span style="background:#F0FBE8;color:#558B2F;${TITRE};font-size:12px;padding:5px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:1px">Demande de devis</span>
  <div style="margin-top:14px;${TITRE};font-size:26px;color:#1F3D31">${esc(d.prenom)} ${esc(d.nom)}</div><div style="font-size:16px;color:#6B7280;margin-top:2px">${esc(d.commune)}</div>
  <table cellpadding="0" cellspacing="0" style="margin-top:16px"><tr>
    <td style="padding-right:18px;font-size:14px">✉️ <a href="mailto:${esc(d.email)}" style="color:#1F3D31;font-weight:700">${esc(d.email)}</a></td>${telephone}</tr></table>
  ${message}
</td></tr>
${produits}
<tr><td style="padding:18px 8px 6px"><a href="mailto:${esc(d.email)}" style="background:#F6BA0E;color:#1F3D31;${BOUTON}">Répondre à ${esc(d.prenom)}</a>${appeler}</td></tr>
<tr><td style="padding:10px 8px;color:#6B7280;font-size:12px">Reçue via woof-parcs.fr · lead créé dans Zoho CRM · Woof!, une marque de Herkules Fitness</td></tr>
</table></td></tr></table></body></html>`;
}
