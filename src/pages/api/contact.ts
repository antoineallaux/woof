export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { htmlMailDevis, type Produit } from '../../lib/mail-devis';

// Crée le lead dans Zoho CRM via herkules-assistant /api/prospect
// (seul projet à détenir les credentials Zoho). Silencieux si non configuré.
async function creerProspect(p: {
  email: string;
  company: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  description?: string;
}): Promise<{ lead_url?: string; deduped?: boolean }> {
  const url = import.meta.env.CRM_PROSPECT_URL;
  const secret = import.meta.env.CRM_PROSPECT_SECRET;
  if (!url || !secret) return {};
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ ...p, lead_source: 'Site Woof', lead_status: 'Nouveau' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`prospect ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

// Alerte Discord #leads (même webhook que les demandes du site Herkules). Silencieuse si non configurée.
async function notifierDiscord(text: string) {
  const webhook = import.meta.env.DISCORD_LEADS_WEBHOOK;
  if (!webhook) return;
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text.slice(0, 2000), allowed_mentions: { parse: [] } }),
  });
  if (!res.ok) throw new Error(`discord ${res.status}: ${(await res.text()).slice(0, 150)}`);
}

function resumeProduits(produits: Produit[]) {
  return produits.map((p) => `- ${p.name}${p.ref ? ` (${p.ref})` : ''} × ${p.qty}`).join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const prenom = data.get('prenom')?.toString().trim();
  const nom = data.get('nom')?.toString().trim();
  const email = data.get('email')?.toString().trim();
  const commune = data.get('commune')?.toString().trim();
  const telephone = data.get('telephone')?.toString().trim() || 'Non renseigné';
  const message = data.get('message')?.toString().trim();

  // Produits sélectionnés via la page /devis/ (optionnel)
  let produits: Produit[] = [];
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

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'Woof! Contact <contact@woof-parcs.fr>',
    to: 'contact@herkules.fr',
    replyTo: email,
    subject: produits.length
      ? `Nouvelle demande de devis — ${commune} (${produits.length} produit${produits.length > 1 ? 's' : ''})`
      : `Nouvelle demande de devis — ${commune}`,
    html: htmlMailDevis({
      prenom,
      nom,
      email,
      commune,
      telephone: telephone === 'Non renseigné' ? undefined : telephone,
      message,
      produits,
    }),
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Erreur envoi email.' }), { status: 500 });
  }

  // CRM + Discord : best-effort, un échec ici ne doit pas perdre la demande (l'email est parti)
  const detail = [
    message ? `Projet :\n${message}` : '',
    produits.length ? `Produits sélectionnés (${produits.length}) :\n${resumeProduits(produits)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  let leadUrl: string | undefined;
  try {
    const r = await creerProspect({
      email,
      company: commune,
      first_name: prenom,
      last_name: nom,
      phone: telephone === 'Non renseigné' ? undefined : telephone,
      city: commune,
      description: `Demande de devis via woof-parcs.fr\n\n${detail}`,
    });
    leadUrl = r.lead_url;
  } catch (e) {
    console.error('contact: création lead CRM échouée', email, e);
  }

  try {
    await notifierDiscord(
      [
        '🐶 Woof — nouvelle demande de devis',
        `${prenom} ${nom} — ${commune}`,
        `${email} · ${telephone}`,
        produits.length ? `\n${resumeProduits(produits)}` : '',
        message ? `\n${message}` : '',
        leadUrl ? `\n${leadUrl}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
  } catch (e) {
    console.error('contact: alerte Discord échouée', email, e);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
