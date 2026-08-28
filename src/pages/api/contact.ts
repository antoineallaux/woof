export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const prenom = data.get('prenom')?.toString().trim();
  const nom = data.get('nom')?.toString().trim();
  const email = data.get('email')?.toString().trim();
  const commune = data.get('commune')?.toString().trim();
  const telephone = data.get('telephone')?.toString().trim() || 'Non renseigné';
  const message = data.get('message')?.toString().trim();

  // Produits sélectionnés via la page /devis/ (optionnel)
  let produits: { slug: string; name: string; ref: string; qty: number }[] = [];
  try {
    const brut = JSON.parse(data.get('produits')?.toString() || '[]');
    if (Array.isArray(brut)) {
      produits = brut
        .filter((p) => p && typeof p.slug === 'string')
        .slice(0, 50)
        .map((p) => ({
          slug: String(p.slug).slice(0, 120),
          name: String(p.name || p.slug).slice(0, 150),
          ref: String(p.ref || '').slice(0, 30),
          qty: Math.min(99, Math.max(1, parseInt(p.qty, 10) || 1)),
        }));
    }
  } catch {
    // produits illisible : on l'ignore, la demande reste valable
  }

  if (!prenom || !nom || !email || !commune || (!message && produits.length === 0)) {
    return new Response(JSON.stringify({ error: 'Champs obligatoires manquants.' }), { status: 400 });
  }

  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

  const produitsHtml = produits.length
    ? `
      <h3>Produits sélectionnés (${produits.length})</h3>
      <table style="border-collapse:collapse;width:100%;border:1px solid #ddd">
        <tr style="background:#f6f6f6">
          <th style="padding:8px;text-align:left">Produit</th>
          <th style="padding:8px;text-align:left">Réf.</th>
          <th style="padding:8px;text-align:center">Qté</th>
        </tr>
        ${produits
          .map(
            (p) => `<tr>
          <td style="padding:8px;border-top:1px solid #ddd"><a href="https://www.woof-parcs.fr/produits/${esc(p.slug)}/">${esc(p.name)}</a></td>
          <td style="padding:8px;border-top:1px solid #ddd">${esc(p.ref)}</td>
          <td style="padding:8px;border-top:1px solid #ddd;text-align:center">${p.qty}</td>
        </tr>`
          )
          .join('')}
      </table>
    `
    : '';

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'Woof! Contact <contact@woof-parcs.fr>',
    to: 'contact@woof-parcs.fr',
    replyTo: email,
    subject: produits.length
      ? `Nouvelle demande de devis — ${commune} (${produits.length} produit${produits.length > 1 ? 's' : ''})`
      : `Nouvelle demande de devis — ${commune}`,
    html: `
      <h2>Nouvelle demande de devis</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:bold">Prénom</td><td style="padding:8px">${esc(prenom)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Nom</td><td style="padding:8px">${esc(nom)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold">Commune / Organisme</td><td style="padding:8px">${esc(commune)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Téléphone</td><td style="padding:8px">${esc(telephone)}</td></tr>
        ${message ? `<tr><td style="padding:8px;font-weight:bold;vertical-align:top">Projet</td><td style="padding:8px">${esc(message).replace(/\n/g, '<br/>')}</td></tr>` : ''}
      </table>
      ${produitsHtml}
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Erreur envoi email.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
