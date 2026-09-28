// Accès Google Sheets par compte de service (JWT signé avec node:crypto, sans dépendance)
import { createSign } from 'node:crypto';

type CompteService = { client_email: string; private_key: string };

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url');

export async function jetonGoogle(json: string): Promise<string> {
  const cs = JSON.parse(json) as CompteService;
  const now = Math.floor(Date.now() / 1000);
  const entete = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const corps = b64url(
    JSON.stringify({
      iss: cs.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = createSign('RSA-SHA256').update(`${entete}.${corps}`).sign(cs.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${entete}.${corps}.${signature}`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`Google OAuth ${res.status}: ${JSON.stringify(data).slice(0, 150)}`);
  return data.access_token;
}

const plage = (onglet: string, a1: string) => encodeURIComponent(`'${onglet}'!${a1}`);

export async function lirePlage(jeton: string, sheetId: string, onglet: string, a1: string): Promise<string[][]> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${plage(onglet, a1)}`, {
    headers: { Authorization: `Bearer ${jeton}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Sheets lecture ${res.status}: ${JSON.stringify(data).slice(0, 150)}`);
  return data.values || [];
}

export async function ecrireCellule(jeton: string, sheetId: string, onglet: string, a1: string, valeur: string) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${plage(onglet, a1)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[valeur]] }),
    }
  );
  if (!res.ok) throw new Error(`Sheets écriture ${res.status}: ${(await res.text()).slice(0, 150)}`);
}
