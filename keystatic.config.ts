import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: { owner: 'antoineallaux', name: 'woof' },
  },
  ui: {
    brand: { name: 'Woof! Admin' },
  },
  collections: {
    media: collection({
      label: 'Médias (images)',
      path: 'src/media/*',
      format: { data: 'json' },
      slugField: 'title',
      schema: {
        title: fields.slug({
          name: { label: 'Nom du média', description: 'Ex. : caniparc-hiver-drainage' },
          slug: { label: 'Slug (nom du fichier)', description: 'Détermine l’URL de l’image' },
        }),
        image: fields.image({
          label: 'Fichier image',
          description: 'WebP ou JPEG recommandé, ~1200px de large, < 200 Ko',
          directory: 'public/assets/blog',
          publicPath: '/assets/blog/',
          validation: { isRequired: true },
        }),
        alt: fields.text({
          label: 'Description (texte alternatif)',
          description: 'Décrit l’image pour le SEO et l’accessibilité',
        }),
      },
    }),
    blog: collection({
      label: 'Articles de blog',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['pubDate', 'category'],
      slugField: 'title',
      schema: {
        title: fields.slug({
          name: { label: 'Titre', description: "Titre affiché sur la page (H1)" },
          slug: { label: 'Slug (URL)', description: "Ne pas modifier après publication" },
        }),
        description: fields.text({ label: 'Chapô / description', multiline: true }),
        seoTitle: fields.text({
          label: 'Titre SEO (Google)',
          description: '50-60 caractères max, mot-clé en tête. Vide = titre de l’article.',
        }),
        seoDescription: fields.text({
          label: 'Description SEO (Google)',
          description: '130-160 caractères. Vide = chapô.',
          multiline: true,
        }),
        pubDate: fields.date({ label: 'Date de publication', validation: { isRequired: true } }),
        image: fields.text({
          label: 'Image de couverture',
          description: 'Chemin local (/assets/blog/...) ou URL complète',
        }),
        imageAlt: fields.text({ label: "Texte alternatif de l'image" }),
        category: fields.select({
          label: 'Catégorie',
          options: [
            { label: 'Guide Pratique', value: 'Guide Pratique' },
            { label: 'Règlementation', value: 'Règlementation' },
            { label: 'Conseils', value: 'Conseils' },
            { label: 'Équipements', value: 'Équipements' },
            { label: 'Témoignage', value: 'Témoignage' },
            { label: 'Actualités', value: 'Actualités' },
          ],
          defaultValue: 'Guide Pratique',
        }),
        content: fields.mdx({ label: 'Contenu' }),
      },
    }),
    products: collection({
      label: 'Produits',
      path: 'src/content/products/*',
      format: { data: 'json' },
      columns: ['ref', 'category'],
      slugField: 'name',
      schema: {
        name: fields.slug({
          name: { label: 'Nom du produit' },
          slug: { label: 'Slug (URL)', description: "Ne pas modifier après publication (liens et SEO)" },
        }),
        category: fields.select({
          label: 'Catégorie',
          options: [
            { label: 'Saut', value: 'saut' },
            { label: 'Tunnel', value: 'tunnel' },
            { label: 'Contact & Équilibre', value: 'contact' },
            { label: 'Plateforme', value: 'plateforme' },
            { label: 'Mobilier', value: 'mobilier' },
            { label: 'Agility', value: 'agility' },
          ],
          defaultValue: 'saut',
        }),
        description: fields.text({
          label: 'Description courte',
          description: 'Aussi utilisée comme meta description (≤160 caractères idéalement)',
          multiline: true,
        }),
        longDescription: fields.text({ label: 'Description longue', multiline: true }),
        image: fields.text({ label: 'Image', description: 'Chemin local, ex. /assets/products/AG16A.webp' }),
        imageAlt: fields.text({ label: "Texte alternatif de l'image" }),
        features: fields.array(fields.text({ label: 'Caractéristique' }), {
          label: 'Caractéristiques',
          itemLabel: (props) => props.value || 'Caractéristique',
        }),
        ref: fields.text({ label: 'Référence', description: 'Ex. AG16/A — devient le SKU' }),
        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Réponse', multiline: true }),
          }),
          { label: 'FAQ', itemLabel: (props) => props.fields.question.value || 'Question' }
        ),
        technicalSheet: fields.text({ label: 'Fiche technique (PDF)', description: 'URL ou chemin, optionnel' }),
        dwgFile: fields.text({ label: 'Fichier DWG', description: 'URL ou chemin, optionnel' }),
      },
    }),
  },
});
