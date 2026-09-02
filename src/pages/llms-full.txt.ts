import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const site = 'https://www.woof-parcs.fr';

export const GET: APIRoute = async () => {
  const products = (await getCollection('products')).sort((a, b) => a.data.name.localeCompare(b.data.name, 'fr'));
  const posts = (await getCollection('blog')).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const lines = [
    '# Woof! — Catalogue et contenus complets',
    '',
    "> Woof! est un fabricant français d'équipements d'agility canine pour collectivités (mairies, communes, bailleurs, entreprises). Parcours canins garantis 5 ans, installation incluse. Marque du groupe Herkules Fitness.",
    '',
    '## Pages principales',
    '',
    `- [Accueil](${site}/) : présentation des parcours canins agility pour collectivités`,
    `- [Nos produits](${site}/produits/) : catalogue complet`,
    `- [L'Agility](${site}/agility/) : guide complet de l'agility canine en collectivité`,
    `- [Qui sommes-nous](${site}/qui-sommes-nous/) : histoire et valeurs de la marque`,
    `- [Configurateur 3D](${site}/configurateur/) : dessinez votre aire canine en 3D (terrain, équipements, clôture, sas) et obtenez un devis`,
    `- [Contact](${site}/contact/) : demande de devis gratuit (réponse en 48h)`,
    '',
    `## Produits (${products.length})`,
    '',
    ...products.map((p) => `- [${p.data.name}](${site}/produits/${p.id}/) — Réf. ${p.data.ref} : ${p.data.description}`),
    '',
    `## Articles de blog (${posts.length})`,
    '',
    ...posts.map((p) => `- [${p.data.title}](${site}/blog/${p.id}/) (${p.data.pubDate.toISOString().slice(0, 10)}) : ${p.data.seoDescription ?? p.data.description}`),
    '',
    '## Contact',
    '',
    '- Téléphone : +33 1 84 60 23 30',
    '- Adresse : Ile du Platais, 78670 Villennes-sur-Seine, France',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
