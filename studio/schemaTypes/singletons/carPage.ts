import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'
import { WhatsappTemplatesInput } from '../../components/WhatsappTemplatesInput'

const TITLE = 'Page Voiture'

// Les 4 cas de message WhatsApp (sous-champs de l'objet `whatsapp`), choisis côté
// front par useCarContact selon le contexte (bloc tarif vs barre sticky) × prix.
const WHATSAPP_TEMPLATES = [
  {
    name: 'withPrice',
    title: 'Bloc tarif — avec prix',
    description: 'Bloc tarif de la fiche, quand un prix est affiché. Le client y choisit une durée ET un « quand » → tu peux utiliser {duree} et {quand}. Variables : {marque} {modele} {prix} {periode} {duree} {quand} {url}.',
  },
  {
    name: 'withoutPrice',
    title: 'Bloc tarif — sans prix',
    description: 'Bloc tarif, quand aucun prix n\'est affiché. Durée/quand disponibles, mais pas de {prix}/{periode}. Variables : {marque} {modele} {duree} {quand} {url}.',
  },
  {
    name: 'simpleWithPrice',
    title: 'Barre sticky — avec prix',
    description: '⚠️ Barre sticky mobile : il n\'y a AUCUN sélecteur de durée ni de « quand » ici → n\'utilise PAS {duree} ni {quand} (ils afficheraient une valeur par défaut non choisie par le client). Variables : {marque} {modele} {prix} {periode} {url}.',
  },
  {
    name: 'simpleWithoutPrice',
    title: 'Barre sticky — sans prix',
    description: '⚠️ Barre sticky mobile, sans prix : toujours pas de durée ni de « quand » → seulement {marque} {modele} {url}.',
  },
] as const

export const carPageType = defineType({
  name: 'carPage',
  title: TITLE,
  type: 'document',
  icon: TagIcon,
  groups: [...GROUPS, { name: 'specs', title: 'Specs' }, { name: 'whatsapp', title: 'WhatsApp' }],
  fields: [
    defineField({
      name: 'contentPreFooter',
      title: 'Contenu (Bloc texte)',
      type: 'textBlock',
      group: 'editorial',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'specsLayout',
      title: 'Mise en page des specs (global)',
      type: 'specsLayout',
      group: 'specs',
      description: 'Ordre et répartition des caractéristiques, communs à TOUTES les fiches voiture. Sur une voiture, une spec ne s\'affiche que si son champ est renseigné — laisse le champ vide pour la masquer sur ce véhicule.',
      initialValue: {
        fixed: ['gamme', 'annee', 'boiteVitesse', 'carburant'],
        list: ['nombrePlaces', 'nombrePortes', 'teinteExterieure', 'teinteInterieure'],
      },
    }),
    defineField({
      name: 'whatsapp',
      title: 'Messages WhatsApp',
      type: 'object',
      group: 'whatsapp',
      description: '4 modèles de message pré-rempli (CTA « Contacter »), choisis automatiquement selon le contexte. Variables insérables via les boutons ; un aperçu commun (1 voiture + 1 langue) montre les 4 messages en bas. Laisser un champ vide = lien WhatsApp sans message pré-rempli.',
      components: { input: WhatsappTemplatesInput },
      options: { columns: 1 },
      fields: WHATSAPP_TEMPLATES.map(({ name, title, description }) =>
        defineField({
          name,
          title,
          type: 'internationalizedArrayText',
          description,
        }),
      ),
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: TagIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
