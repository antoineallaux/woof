import { timingSafeEqual } from 'node:crypto';

const FENETRE = 10 * 60_000;
const MAX_ENVOIS = 5;
const compteurs = new Map<string, { debut: number; n: number }>();

// ponytail: compteur en mémoire, propre à chaque instance Vercel ; une règle de limite Vercel (WAF) si les robots passent quand même
export function limiteDepassee(ip: string, maintenant = Date.now()) {
  for (const [cle, c] of compteurs) if (maintenant - c.debut >= FENETRE) compteurs.delete(cle);
  const c = compteurs.get(ip) ?? { debut: maintenant, n: 0 };
  compteurs.set(ip, c);
  return ++c.n > MAX_ENVOIS;
}

// Compare l'en-tête Authorization à « Bearer <secret> » en temps constant
export function jetonValide(entete: string | null, secret: string) {
  const recu = Buffer.from(entete ?? '');
  const attendu = Buffer.from(`Bearer ${secret}`);
  return recu.length === attendu.length && timingSafeEqual(recu, attendu);
}
