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

  if (!prenom || !nom || !email || !commune || !message) {
    return new Response(JSON.stringify({ error: 'Champs obligatoires manquants.' }), { status: 400 });
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'Woof! Contact <contact@woof-parcs.fr>',
    to: 'contact@woof-parcs.fr',
    replyTo: email,
    subject: `Nouvelle demande de devis — ${commune}`,
    html: `
      <h2>Nouvelle demande de devis</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:bold">Prénom</td><td style="padding:8px">${prenom}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Nom</td><td style="padding:8px">${nom}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold">Commune / Organisme</td><td style="padding:8px">${commune}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Téléphone</td><td style="padding:8px">${telephone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Projet</td><td style="padding:8px">${message.replace(/\n/g, '<br/>')}</td></tr>
      </table>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Erreur envoi email.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
