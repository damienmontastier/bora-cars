import { TranslateIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const TITLE = 'Glossaire'

/**
 * Sections du glossaire = onglets (field groups). Une par namespace i18n
 * top-level des fichiers `web/i18n/locales/*.json`. L'ordre/les noms doivent
 * rester alignés avec ces JSON (le sync au build reconstruit les clés `<name>.…`).
 */
// NB : `nuxtSiteConfig` (nom/description du site) n'est PAS ici — il est lu au
// build par nuxt-site-config (avant le runtime), donc l'éditer dans Sanity n'aurait
// aucun effet. Sa valeur reste le fallback dans i18n/locales/*.json.
const SECTIONS: { name: string, title: string, description: string }[] = [
  {
    name: 'seo',
    title: 'SEO / slogan',
    description: 'Slogan de marque (donnée structurée Organization) et description SEO de SECOURS — cette description n\'est utilisée que si la « Meta description » de Paramètres est laissée vide.',
  },
  { name: 'breadcrumb', title: 'Fil d\'Ariane', description: 'Libellés du fil d\'Ariane (Accueil, Catalogue) affiché sur les fiches voiture.' },
  { name: 'error', title: 'Erreur 404', description: 'Textes de la page d\'erreur 404 (page introuvable).' },
  { name: 'underConstruction', title: 'Coming soon', description: 'Textes de la page « bientôt en ligne ».' },
  { name: 'footer', title: 'Footer', description: 'Pied de page : copyright et bouton « retour en haut ».' },
  { name: 'menu', title: 'Menu', description: 'Menu principal : libellés Ouvrir / Fermer et lien Accueil.' },
  { name: 'catalogue', title: 'Catalogue', description: 'Page catalogue : cartes voiture (« À partir de… ») et filtres (marque, ville, prix, réinitialiser, aucun résultat).' },
  { name: 'car', title: 'Voiture (fiche)', description: 'Fiche voiture : en-tête, description, caractéristiques (specs), informations de location, bloc tarif et sélecteurs durée / quand.' },
  { name: 'testimonials', title: 'Témoignages', description: 'Carrousel de témoignages : boutons précédent / suivant.' },
  { name: 'contact', title: 'Contact (formulaire)', description: 'Formulaire de contact : libellés des champs, messages d\'erreur, états d\'envoi et texte de consentement.' },
  { name: 'media', title: 'Media', description: 'Textes des composants média (ex. « image manquante »).' },
  { name: 'legal', title: 'Légal', description: 'Pages légales : titre « introuvable », date de mise à jour et slug d\'URL de la page Confidentialité (⚠ modifier le slug change l\'URL).' },
  { name: 'cookies', title: 'Cookies', description: 'Bandeau et fenêtre de gestion des cookies / consentement (catégories, boutons, descriptions).' },
]

export const glossaireType = defineType({
  name: 'glossaire',
  title: TITLE,
  type: 'document',
  icon: TranslateIcon,
  groups: SECTIONS.map(({ name, title }, i) => ({ name, title, default: i === 0 })),
  fields: SECTIONS.map(({ name, title, description }) =>
    defineField({
      name,
      title,
      description,
      type: 'array',
      group: name,
      of: [defineArrayMember({ type: 'glossaryEntry' })],
    }),
  ),
  preview: {
    prepare() {
      return { media: TranslateIcon, title: TITLE, subtitle: 'Singleton — traductions de l\'interface' }
    },
  },
})
