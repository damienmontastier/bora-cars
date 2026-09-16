import { missingLanguages } from '../../lib/i18nValidation'
import { pickLocalized } from '../../lib/preview'
import { SINGLETON_TYPES } from '../../schemaTypes/constants'
import { GLOSSAIRE_SECTIONS } from '../../schemaTypes/singletons/glossaire'
import { BIO_VARIABLES, CAR_VARIABLES, PAGE_VARIABLES } from '../WhatsappTokenEditor'
import type { CarDoc, DashboardData, GlossaryEntry, ImageInfo, LegalDoc, Localized, LocationDoc, SingletonDoc } from './data'

// Vérifications du Dashboard. Chaque règle traduit une conséquence CONCRÈTE sur le
// site (ce que voit le visiteur, Google ou le client WhatsApp) — pas une contrainte
// de schéma : la validation Sanity bloque déjà la publication des champs requis.
//
// Les règles `test` tournent sur la version PUBLIÉE. Si un
// brouillon plus récent ne présente plus le problème, le point est marqué « corrigé
// dans le brouillon » : il ne reste qu'à publier.

export type Severity = 'critical' | 'warning' | 'tip'

export type Category = 'voitures' | 'lieux' | 'pages' | 'contact' | 'traductions' | 'general'

export const SEVERITIES: { id: Severity, title: string, subtitle: string }[] = [
  { id: 'critical', title: 'Bloquant', subtitle: 'Visible par les visiteurs — à corriger en priorité' },
  { id: 'warning', title: 'À corriger', subtitle: 'Nuit à l’image, au référencement ou aux demandes de contact' },
  { id: 'tip', title: 'Conseils', subtitle: 'Pour aller plus loin, quand vous avez un moment' },
]

export const CATEGORIES: { id: Category, title: string }[] = [
  { id: 'voitures', title: 'Voitures' },
  { id: 'lieux', title: 'Lieux' },
  { id: 'pages', title: 'Pages & SEO' },
  { id: 'contact', title: 'Contact & WhatsApp' },
  { id: 'traductions', title: 'Textes & traductions' },
  { id: 'general', title: 'Médias & paramètres' },
]

export const TYPE_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  proprietaire: 'Propriétaire',
  professionnel: 'Professionnel',
  contact: 'Contact',
  catalogue: 'Catalogue',
  catalogueProfessionnel: 'Catalogue professionnel',
  carPage: 'Page Voiture',
  bio: 'Bio (réseaux sociaux)',
  menu: 'Menu',
  footer: 'Footer',
  settings: 'Paramètres',
  glossaire: 'Glossaire (traductions)',
  car: 'Voiture',
  location: 'Lieu',
  legalPage: 'Page légale',
}

export interface Finding {
  /** Identifiant stable (masquage). */
  key: string
  checkId: string
  /** Id publié du document à ouvrir. */
  docId: string
  docType: string
  label: string
  details: string[]
  /** Champ à ouvrir dans le document (chemin Sanity). */
  path?: string
  imageUrl?: string
  fixedInDraft: boolean
}

interface CheckMeta {
  id: string
  severity: Severity
  category: Category
  title: string
  why: string
  fix: string
  /** Libellé court pour la liste « manque avant publication » des brouillons. */
  short?: string
}

export interface Issue extends CheckMeta {
  findings: Finding[]
}

interface Hit {
  detail?: string
  path?: string
  /** Sépare les hits d'un même document en lignes distinctes (ex. entrées du glossaire). */
  group?: string
  label?: string
}

interface GlobalHit extends Hit {
  docId: string
}

type AnyDoc = CarDoc | LocationDoc | LegalDoc | SingletonDoc

interface Context {
  cars: CarDoc[]
  locations: LocationDoc[]
  legalPages: LegalDoc[]
  singletons: Map<string, SingletonDoc>
  videos: DashboardData['videos']
  byId: Map<string, AnyDoc>
}

type DocRule = CheckMeta & {
  types: string[]
  test: (doc: any, ctx: Context) => Hit | Hit[] | null | undefined | false
}

type GlobalRule = CheckMeta & {
  run: (ctx: Context) => GlobalHit[]
}

type Rule = DocRule | GlobalRule

export const isDraftId = (id: string) => id.startsWith('drafts.')
export const publishedId = (id: string) => id.replace(/^drafts\./, '')

const isContentId = (id: string) => !id.startsWith('versions.')

export const clean = (s?: string | null) => (s ?? '').replace(/\s+/g, ' ').trim()

export function docLabel(doc: AnyDoc | undefined, fallbackType?: string): string {
  if (!doc) return TYPE_LABELS[fallbackType ?? ''] ?? 'Document'
  switch (doc._type) {
    case 'car': {
      const car = doc as CarDoc
      return clean(`${car.marque ?? ''} ${car.modele ?? ''}`) || 'Voiture sans nom'
    }
    case 'location':
      return pickLocalized((doc as LocationDoc).city) || 'Lieu sans nom'
    case 'legalPage':
      return pickLocalized((doc as LegalDoc).title) || 'Page légale sans titre'
    default:
      return TYPE_LABELS[doc._type] ?? doc._type
  }
}

export function thumbnailUrl(doc: AnyDoc | undefined): string | undefined {
  const url = doc?._type === 'car' ? (doc as CarDoc).image?.url : undefined
  return url ? `${url}?w=96&h=96&fit=crop&auto=format` : undefined
}

const megabytes = (bytes?: number) => `${Math.round((bytes ?? 0) / 1_000_000)} Mo`

const hasTranslationGap = (value: Localized) => {
  const missing = missingLanguages(value)
  return missing.length > 0 && missing.length < 2 ? missing : null
}

const pagePrice = (car: CarDoc) => car.prixMensuel ?? car.prixJournalier

const SPEC_LABELS: Record<string, string> = {
  gamme: 'gamme',
  annee: 'année',
  boiteVitesse: 'boîte de vitesse',
  carburant: 'carburant',
  nombrePlaces: 'nombre de places',
}

const MIN_PHOTO_WIDTH = 1600
const MAX_VIDEO_BYTES = 15_000_000
/** « — BORA CARS » ajouté automatiquement au titre (cf. champ SEO). */
const TITLE_SUFFIX_LENGTH = ' — BORA CARS'.length

// Pages dont le SEO vient de leur champ `seo`. PAS `carPage` : les fiches voitures
// calculent titre (Glossaire `car.seo.title`) et description (celle de la voiture), cf.
// web/app/pages/car/[uid].vue. PAS `bio` : page en noindex.
export const SEO_PAGE_TYPES = ['homepage', 'proprietaire', 'professionnel', 'contact', 'catalogue', 'catalogueProfessionnel', 'legalPage']
const MODULE_PAGE_TYPES = ['homepage', 'proprietaire', 'professionnel']
const PAGE_WHATSAPP_TYPES = ['proprietaire', 'professionnel', 'catalogue', 'catalogueProfessionnel']

const CAR_TEMPLATE_LABELS: Record<string, string> = {
  withPrice: 'Bloc tarif — avec prix',
  withoutPrice: 'Bloc tarif — sans prix',
  simpleWithPrice: 'Barre sticky — avec prix',
  simpleWithoutPrice: 'Barre sticky — sans prix',
}

interface WhatsappTemplate {
  docId: string
  label: string
  path: string
  allowed: Set<string>
  /** Barre sticky : pas de sélecteur durée / quand. */
  noDate?: boolean
  value: Localized<string>
}

const tokenSet = (vars: { name: string }[]) => new Set(vars.map(v => v.name))

function whatsappTemplates(ctx: Context): WhatsappTemplate[] {
  const templates: WhatsappTemplate[] = []
  const carPage = ctx.singletons.get('carPage')
  for (const [name, label] of Object.entries(CAR_TEMPLATE_LABELS)) {
    templates.push({
      docId: 'carPage',
      label: `Page Voiture — ${label}`,
      path: `whatsapp.${name}`,
      allowed: tokenSet(CAR_VARIABLES),
      noDate: name.startsWith('simple'),
      value: carPage?.whatsapp?.[name] ?? null,
    })
  }
  const bio = ctx.singletons.get('bio')
  if (bio) templates.push({ docId: 'bio', label: TYPE_LABELS.bio, path: 'whatsappMessage', allowed: tokenSet(BIO_VARIABLES), value: bio.whatsappMessage ?? null })
  for (const type of PAGE_WHATSAPP_TYPES) {
    const doc = ctx.singletons.get(type)
    if (doc) templates.push({ docId: type, label: TYPE_LABELS[type], path: 'whatsappMessage', allowed: tokenSet(PAGE_VARIABLES), value: doc.whatsappMessage ?? null })
  }
  return templates
}

const tokensOf = (text: string) => [...text.matchAll(/\{([^{}]*)\}/g)].map(m => m[1])

function templateHits(ctx: Context, check: (text: string, t: WhatsappTemplate) => string | null): GlobalHit[] {
  const hits: GlobalHit[] = []
  for (const t of whatsappTemplates(ctx)) {
    for (const item of t.value ?? []) {
      if (typeof item.value !== 'string' || !item.value.trim()) continue
      const problem = check(item.value, t)
      if (problem) {
        hits.push({
          docId: t.docId,
          group: `${t.path}.${item.language}`,
          label: `${t.label} (${(item.language ?? '').toUpperCase()})`,
          detail: problem,
          path: t.path,
        })
      }
    }
  }
  return hits
}

function lowResDetails(car: CarDoc): string[] {
  const details: string[] = []
  const tooSmall = (img?: ImageInfo | null) => Boolean(img?.url && img.width && img.width < MIN_PHOTO_WIDTH)
  if (tooSmall(car.image)) details.push(`photo principale : ${car.image!.width} px de large`)
  const gallery = (car.images ?? []).filter(tooSmall)
  if (gallery.length) {
    const widest = Math.max(...gallery.map(img => img.width ?? 0))
    details.push(`${gallery.length} photo${gallery.length > 1 ? 's' : ''} de galerie (≤ ${widest} px)`)
  }
  return details
}

const RULES: Rule[] = [
  {
    id: 'car-no-catalogue',
    severity: 'critical',
    category: 'voitures',
    short: 'type de client',
    title: 'Voiture absente des deux catalogues',
    why: 'Sa fiche existe, mais elle n’apparaît ni dans le Catalogue ni dans le Catalogue professionnel : les visiteurs ne peuvent pas la trouver.',
    fix: 'Dans la voiture, cochez « Particulier » et/ou « Professionnel » dans « Type de client ».',
    types: ['car'],
    test: (car: CarDoc) => Array.isArray(car.clientType)
      && !car.clientType.includes('particulier')
      && !car.clientType.includes('professionnel')
      && { path: 'clientType', detail: 'Aucun type de client coché' },
  },
  {
    id: 'car-no-price',
    severity: 'critical',
    category: 'voitures',
    short: 'prix',
    title: 'Voiture sans prix',
    why: 'Aucun tarif n’est affiché sur la carte du catalogue ni sur la fiche.',
    fix: 'Renseignez le « Prix journalier » OU le « Prix mensuel ».',
    types: ['car'],
    test: (car: CarDoc) => pagePrice(car) == null && { path: 'prixJournalier' },
  },
  {
    id: 'car-no-image',
    severity: 'critical',
    category: 'voitures',
    short: 'photo principale',
    title: 'Voiture sans photo principale',
    why: 'La carte du catalogue et le haut de la fiche s’affichent sans visuel.',
    fix: 'Ajoutez une photo dans le champ « Image » de la voiture.',
    types: ['car'],
    test: (car: CarDoc) => !car.image?.url && { path: 'image' },
  },
  {
    id: 'car-no-location',
    severity: 'critical',
    category: 'voitures',
    short: 'lieu',
    title: 'Voiture sans lieu',
    why: 'La fiche n’affiche ni la ville ni le téléphone de l’agence, et la voiture disparaît du filtre par ville.',
    fix: 'Choisissez l’agence dans le champ « Lieu ».',
    types: ['car'],
    test: (car: CarDoc) => !car.location && { path: 'location' },
  },
  {
    id: 'car-no-slug',
    severity: 'critical',
    category: 'voitures',
    short: 'slug (adresse web)',
    title: 'Voiture sans adresse web (slug)',
    why: 'Sans slug, la fiche n’a pas d’URL : le lien depuis le catalogue ne fonctionne pas.',
    fix: 'Dans le champ « Slug », cliquez sur « Générer ».',
    types: ['car'],
    test: (car: CarDoc) => !car.slug && { path: 'slug' },
  },
  {
    id: 'car-rental-types',
    severity: 'critical',
    category: 'voitures',
    short: 'type de location',
    title: 'Type de location manquant ou invalide',
    why: 'Le type (courte / longue durée) s’affiche sur la carte et détermine la présentation du tarif.',
    fix: 'Dans « Types de location », cochez « Courte durée » et/ou « Longue durée » (et retirez toute autre valeur).',
    types: ['car'],
    test: (car: CarDoc) => {
      const types = car.rentalTypes ?? []
      if (!types.length) return { path: 'rentalTypes', detail: 'Aucun type coché' }
      const invalid = types.filter(t => t !== 'courte-duree' && t !== 'longue-duree')
      return invalid.length > 0 && { path: 'rentalTypes', detail: `Valeur inconnue : « ${invalid.join('», «')} »` }
    },
  },
  {
    id: 'car-duplicate-slug',
    severity: 'critical',
    category: 'voitures',
    title: 'Deux voitures avec la même adresse web',
    why: 'Les deux fiches partagent la même URL : une seule des deux est accessible.',
    fix: 'Modifiez le « Slug » de l’une des voitures (ex. ajoutez la couleur ou l’année).',
    run: (ctx) => {
      const bySlug = new Map<string, CarDoc[]>()
      for (const car of ctx.cars) {
        if (!car.slug) continue
        bySlug.set(car.slug, [...(bySlug.get(car.slug) ?? []), car])
      }
      return [...bySlug.values()]
        .filter(cars => cars.length > 1)
        .flatMap(cars => cars.map(car => ({
          docId: car._id,
          path: 'slug',
          detail: `/${car.slug} — aussi utilisée par ${cars.filter(c => c !== car).map(c => docLabel(c)).join(', ')}`,
        })))
    },
  },
  {
    id: 'car-km-mismatch',
    severity: 'warning',
    category: 'voitures',
    title: 'Forfait kilométrique dans le mauvais champ',
    why: 'Cette voiture est louée au mois, mais le forfait est saisi en « Km par jour inclus » : la fiche annonce par exemple « 3 000 km par jour ».',
    fix: 'Déplacez la valeur dans « Km par mois inclus » et videz « Km par jour inclus ».',
    types: ['car'],
    test: (car: CarDoc) => car.prixMensuel != null
      && car.kmJourInclus != null
      && car.kmMoisInclus == null
      && !(car.rentalTypes ?? []).includes('courte-duree')
      && { path: 'kmJourInclus', detail: `Affiché : « ${car.kmJourInclus.toLocaleString('fr-FR')} km par jour inclus »` },
  },
  {
    id: 'car-description-missing',
    severity: 'warning',
    category: 'voitures',
    title: 'Voiture sans description',
    why: 'La fiche n’a aucun texte de présentation : moins convaincant pour le client, et Google affiche la description générique du site (la même sur toutes les fiches).',
    fix: 'Rédigez quelques lignes dans « Description » (FR et EN).',
    types: ['car'],
    test: (car: CarDoc) => missingLanguages(car.description).length === 2 && { path: 'description' },
  },
  {
    id: 'car-translation-missing',
    severity: 'warning',
    category: 'voitures',
    title: 'Traduction manquante sur une fiche voiture',
    why: 'Si l’anglais manque, les visiteurs anglophones voient le texte français. Si le français manque, le texte disparaît du site français.',
    fix: 'Complétez la langue manquante dans les champs indiqués.',
    types: ['car'],
    test: (car: CarDoc) => {
      const fields: [keyof CarDoc, string][] = [
        ['description', 'Description'],
        ['teinteExterieure', 'Teinte extérieure'],
        ['teinteInterieure', 'Teintes intérieures'],
        ['equipements', 'Équipements'],
      ]
      return fields.flatMap(([field, label]) => {
        const gap = hasTranslationGap(car[field] as Localized)
        return gap ? [{ path: field as string, detail: `${label} : ${gap.join(', ')} manquant` }] : []
      })
    },
  },
  {
    id: 'car-low-res',
    severity: 'warning',
    category: 'voitures',
    title: 'Photos en basse résolution',
    why: `Les photos s’affichent en plein écran en haut de la fiche : en dessous de ${MIN_PHOTO_WIDTH} px de large, elles paraissent floues sur ordinateur.`,
    fix: 'Remplacez-les par les fichiers d’origine (idéalement 2 400 px de large ou plus), pas par des captures ou des photos compressées par WhatsApp / Instagram.',
    types: ['car'],
    test: (car: CarDoc) => lowResDetails(car).map(detail => ({ path: detail.startsWith('photo principale') ? 'image' : 'images', detail })),
  },
  {
    id: 'car-alt-missing',
    severity: 'warning',
    category: 'voitures',
    title: 'Photo sans texte alternatif',
    why: 'Le texte alternatif décrit la photo à Google Images et aux personnes malvoyantes.',
    fix: 'Ouvrez la photo et remplissez « Texte alternatif » en FR et EN (ex. « Porsche 911 noire à Genève »).',
    types: ['car'],
    test: (car: CarDoc) => {
      const hits: Hit[] = []
      if (car.image?.url && missingLanguages(car.image.alt).length) hits.push({ path: 'image', detail: `Photo principale : ${missingLanguages(car.image.alt).join(', ')} manquant` })
      const gallery = (car.images ?? []).filter(img => img.url && missingLanguages(img.alt).length)
      if (gallery.length) hits.push({ path: 'images', detail: `${gallery.length} photo${gallery.length > 1 ? 's' : ''} de galerie` })
      return hits
    },
  },
  {
    id: 'car-no-gallery',
    severity: 'tip',
    category: 'voitures',
    title: 'Fiche avec une seule photo',
    why: 'Des photos supplémentaires (intérieur, arrière, détails) rassurent le client et donnent envie de réserver.',
    fix: 'Ajoutez 3 à 6 photos dans le champ « Images » de la voiture.',
    types: ['car'],
    test: (car: CarDoc) => !(car.images ?? []).length && { path: 'images' },
  },
  {
    id: 'car-no-hotspot',
    severity: 'tip',
    category: 'voitures',
    title: 'Point focal de la photo non réglé',
    why: 'La photo principale est recadrée selon l’écran (paysage sur ordinateur, vertical sur mobile et sur la page Bio). Le point focal indique la zone à garder visible.',
    fix: 'Ouvrez la photo principale, cliquez sur l’icône de recadrage et placez le cercle sur la voiture.',
    types: ['car'],
    test: (car: CarDoc) => Boolean(car.image?.url) && !car.image?.hasHotspot && { path: 'image' },
  },
  {
    id: 'car-specs-missing',
    severity: 'tip',
    category: 'voitures',
    title: 'Caractéristiques incomplètes',
    why: 'Ces caractéristiques s’affichent en haut de la fiche ; un champ vide est simplement masqué.',
    fix: 'Complétez les champs indiqués dans la voiture.',
    types: ['car'],
    test: (car: CarDoc) => {
      const missing = Object.keys(SPEC_LABELS).filter(key => car[key as keyof CarDoc] == null || car[key as keyof CarDoc] === '')
      return missing.length > 0 && { path: missing[0], detail: `Manquant : ${missing.map(k => SPEC_LABELS[k]).join(', ')}` }
    },
  },
  {
    id: 'car-name-spacing',
    severity: 'tip',
    category: 'voitures',
    title: 'Espace en trop dans la marque ou le modèle',
    why: 'Les espaces parasites se retrouvent dans le message WhatsApp pré-rempli et peuvent dédoubler une marque dans les listes.',
    fix: 'Supprimez les espaces au début, à la fin ou en double.',
    types: ['car'],
    test: (car: CarDoc) => (['marque', 'modele'] as const)
      .filter(field => typeof car[field] === 'string' && car[field] !== clean(car[field]))
      .map(field => ({ path: field, detail: `${field === 'marque' ? 'Marque' : 'Modèle'} : « ${car[field]} »` })),
  },
  {
    id: 'car-name-note',
    severity: 'tip',
    category: 'voitures',
    title: 'Mention entre parenthèses dans le nom',
    why: 'Le nom de la voiture est repris tel quel dans le titre Google, les partages et le message WhatsApp : une mention comme « (Bientôt disponible) » y apparaît aussi.',
    fix: 'Gardez uniquement la marque et le modèle, et retirez la mention quand elle n’est plus d’actualité.',
    types: ['car'],
    test: (car: CarDoc) => /[()]/.test(`${car.marque ?? ''}${car.modele ?? ''}`) && { path: 'modele', detail: `« ${clean(`${car.marque ?? ''} ${car.modele ?? ''}`)} »` },
  },
  {
    id: 'car-brand-variant',
    severity: 'tip',
    category: 'voitures',
    title: 'Marque écrite de plusieurs façons',
    why: 'Une même marque orthographiée différemment apparaît en double dans les listes et les filtres.',
    fix: 'Écrivez uniquement la marque dans « Marque » (ex. « Porsche ») et le reste dans « Modèle » (ex. « 911 Carrera 4S »).',
    run: (ctx) => {
      const brands = [...new Set(ctx.cars.map(c => clean(c.marque)).filter(Boolean))]
      return ctx.cars.flatMap((car) => {
        const brand = clean(car.marque)
        const base = brands.find(b => b !== brand && (brand.toLowerCase().startsWith(`${b.toLowerCase()} `) || brand.toLowerCase().startsWith(`${b.toLowerCase()}-`)))
        return base ? [{ docId: car._id, path: 'marque', detail: `« ${brand} » alors que « ${base} » existe déjà` }] : []
      })
    },
  },

  {
    id: 'location-no-phone',
    severity: 'critical',
    category: 'lieux',
    title: 'Lieu sans téléphone',
    why: 'Le numéro de l’agence s’affiche sur chaque fiche voiture rattachée à ce lieu.',
    fix: 'Renseignez le champ « Téléphone » (format international, ex. +41 77 …).',
    types: ['location'],
    test: (loc: LocationDoc) => !loc.phone && { path: 'phone' },
  },
  {
    id: 'location-city-translation',
    severity: 'warning',
    category: 'lieux',
    title: 'Nom de ville non traduit',
    why: 'Le nom de la ville s’affiche dans le menu, le footer et les fiches voitures.',
    fix: 'Complétez « Ville (libellé affiché) » dans la langue manquante (ex. Genève / Geneva).',
    types: ['location'],
    test: (loc: LocationDoc) => {
      const missing = missingLanguages(loc.city)
      return missing.length > 0 && { path: 'city', detail: `${missing.join(', ')} manquant` }
    },
  },
  {
    id: 'location-address',
    severity: 'warning',
    category: 'lieux',
    title: 'Adresse de l’agence incomplète',
    why: 'Google utilise cette adresse pour relier le site à votre fiche d’établissement et vous faire apparaître dans les recherches locales.',
    fix: 'Complétez la rue, le code postal, la ville réelle et le pays.',
    types: ['location'],
    test: (loc: LocationDoc) => {
      const missing = [
        !loc.address && 'rue',
        !loc.postalCode && 'code postal',
        !loc.addressLocality && 'ville (adresse réelle)',
        !loc.country && 'pays',
      ].filter(Boolean)
      return missing.length > 0 && { path: 'address', detail: `Manquant : ${missing.join(', ')}` }
    },
  },
  {
    id: 'location-no-google-link',
    severity: 'warning',
    category: 'lieux',
    title: 'Lieu sans lien vers la fiche Google',
    why: 'Le lien vers votre fiche Google Business renforce le référencement local de l’agence.',
    fix: 'Collez l’URL de la fiche Google de l’agence dans le champ « Lien ».',
    types: ['location'],
    test: (loc: LocationDoc) => !loc.link && { path: 'link' },
  },
  {
    id: 'location-short-google-link',
    severity: 'tip',
    category: 'lieux',
    title: 'Lien Google raccourci',
    why: 'Les liens courts (share.google, maps.app.goo.gl) sont des redirections : Google relie moins sûrement le site à la fiche de l’agence.',
    fix: 'Préférez l’URL complète « https://www.google.com/search?kgmid=… » (voir l’aide du champ « Lien »).',
    types: ['location'],
    test: (loc: LocationDoc) => /share\.google|goo\.gl/.test(loc.link ?? '') && { path: 'link', detail: loc.link },
  },
  {
    id: 'location-seo-extras',
    severity: 'tip',
    category: 'lieux',
    title: 'Coordonnées GPS ou horaires manquants',
    why: 'Informations facultatives, qui aident Google à afficher l’agence sur la carte avec ses horaires.',
    fix: 'Complétez « Coordonnées GPS » et « Horaires d’ouverture ».',
    types: ['location'],
    test: (loc: LocationDoc) => {
      const missing = [!loc.hasGeo && 'coordonnées GPS', !loc.hoursCount && 'horaires'].filter(Boolean)
      return missing.length > 0 && { path: loc.hasGeo ? 'openingHours' : 'geo', detail: `Manquant : ${missing.join(', ')}` }
    },
  },
  {
    id: 'location-not-in-nav',
    severity: 'tip',
    category: 'lieux',
    title: 'Lieu absent du menu ou du footer',
    why: 'Les visiteurs ne voient pas cette agence dans la navigation du site.',
    fix: 'Ajoutez le lieu dans la liste « Lieux » du Menu et/ou du Footer.',
    run: (ctx) => {
      const menu = new Set(ctx.singletons.get('menu')?.locationRefs ?? [])
      const footer = new Set(ctx.singletons.get('footer')?.locationRefs ?? [])
      return ctx.locations.flatMap((loc) => {
        const missing = [!menu.has(loc._id) && 'Menu', !footer.has(loc._id) && 'Footer'].filter(Boolean)
        return missing.length ? [{ docId: loc._id, detail: `Absent de : ${missing.join(', ')}` }] : []
      })
    },
  },
  {
    id: 'location-no-cars',
    severity: 'tip',
    category: 'lieux',
    title: 'Lieu sans voiture',
    why: 'Aucune voiture publiée n’est rattachée à cette agence : le filtre par ville ne propose rien pour elle.',
    fix: 'Rattachez des voitures à ce lieu, ou retirez-le du menu et du footer.',
    run: ctx => ctx.locations
      .filter(loc => !ctx.cars.some(car => car.location === loc._id))
      .map(loc => ({ docId: loc._id })),
  },

  {
    id: 'page-missing',
    severity: 'critical',
    category: 'pages',
    title: 'Page ou bloc jamais publié',
    why: 'Ce contenu n’existe pas en version publiée : la page ou le bloc correspondant est vide sur le site.',
    fix: 'Ouvrez le document, complétez-le puis cliquez sur « Publier ».',
    run: ctx => SINGLETON_TYPES
      .filter(type => !ctx.singletons.has(type))
      .map(type => ({ docId: type, label: TYPE_LABELS[type] })),
  },
  {
    id: 'page-no-modules',
    severity: 'critical',
    category: 'pages',
    title: 'Page sans contenu',
    why: 'Aucun module (Hero, textes, FAQ…) : la page s’affiche vide.',
    fix: 'Ajoutez des modules dans l’onglet « Editorial » de la page.',
    types: MODULE_PAGE_TYPES,
    test: (doc: SingletonDoc) => !(doc.moduleTypes ?? []).length && { path: 'modules' },
  },
  {
    id: 'menu-empty',
    severity: 'critical',
    category: 'pages',
    title: 'Menu sans lien',
    why: 'Le panneau de navigation du site est vide.',
    fix: 'Ajoutez les pages principales dans « Liens » du Menu.',
    types: ['menu'],
    test: (doc: SingletonDoc) => !doc.linksCount && { path: 'links' },
  },
  {
    id: 'legal-incomplete',
    severity: 'critical',
    category: 'pages',
    title: 'Page légale incomplète',
    why: 'Obligation légale : mentions légales, CGV et confidentialité doivent être complètes dans les deux langues.',
    fix: 'Complétez le titre et le contenu dans la langue manquante.',
    types: ['legalPage'],
    test: (doc: LegalDoc) => {
      const hits: Hit[] = []
      const title = missingLanguages(doc.title)
      const content = missingLanguages(doc.content)
      if (title.length) hits.push({ path: 'title', detail: `Titre : ${title.join(', ')} manquant` })
      if (content.length) hits.push({ path: 'content', detail: `Contenu : ${content.join(', ')} manquant` })
      if (!doc.slug) hits.push({ path: 'slug', detail: 'Slug (adresse web) manquant' })
      return hits
    },
  },
  {
    id: 'legal-no-footer-links',
    severity: 'critical',
    category: 'pages',
    title: 'Aucun lien légal dans le footer',
    why: 'Les mentions légales doivent être accessibles depuis toutes les pages du site.',
    fix: 'Dans le Footer, ajoutez les pages légales dans « Colonne Mentions légales ».',
    types: ['footer'],
    test: (doc: SingletonDoc) => !doc.legalLinksCount && { path: 'legalLinks' },
  },
  {
    id: 'seo-title-missing',
    severity: 'warning',
    category: 'pages',
    title: 'Titre Google (meta title) manquant',
    why: 'Sans titre, Google affiche un titre générique pour cette page, moins attractif dans les résultats.',
    fix: 'Onglet « SEO » de la page : remplissez « Meta title » en FR et EN (sans « BORA CARS », ajouté automatiquement).',
    types: SEO_PAGE_TYPES,
    test: (doc: SingletonDoc | LegalDoc) => {
      const missing = missingLanguages(doc.seo?.title)
      return missing.length > 0 && { path: 'seo.title', detail: `${missing.join(', ')} manquant` }
    },
  },
  {
    id: 'seo-description-missing',
    severity: 'warning',
    category: 'pages',
    title: 'Description Google (meta description) manquante',
    why: 'Google affiche alors la description générique du site, identique sur plusieurs pages — mauvais pour le référencement.',
    fix: 'Onglet « SEO » de la page : rédigez « Meta description » en FR et EN (120 à 160 caractères).',
    types: SEO_PAGE_TYPES,
    test: (doc: SingletonDoc | LegalDoc) => {
      const missing = missingLanguages(doc.seo?.description)
      return missing.length > 0 && { path: 'seo.description', detail: `${missing.join(', ')} manquant` }
    },
  },
  {
    id: 'seo-title-brand',
    severity: 'warning',
    category: 'pages',
    title: 'Marque en double dans le titre Google',
    why: '« — BORA CARS » est déjà ajouté automatiquement : le titre affiché dans Google contient la marque deux fois.',
    fix: 'Retirez « BORA CARS » du « Meta title » (onglet SEO).',
    types: SEO_PAGE_TYPES,
    test: (doc: SingletonDoc | LegalDoc) => (doc.seo?.title ?? [])
      .filter(item => /bora\s*cars/i.test(item.value ?? ''))
      .map(item => ({ path: 'seo.title', detail: `${(item.language ?? '').toUpperCase()} : « ${item.value} »` })),
  },
  {
    id: 'seo-title-long',
    severity: 'tip',
    category: 'pages',
    title: 'Titre Google un peu long',
    why: `Au-delà de ~60 caractères (« — BORA CARS » compris), Google coupe le titre avec « … ».`,
    fix: 'Raccourcissez le « Meta title » à l’essentiel (onglet SEO).',
    types: SEO_PAGE_TYPES,
    test: (doc: SingletonDoc | LegalDoc) => (doc.seo?.title ?? [])
      .filter(item => clean(item.value).length + TITLE_SUFFIX_LENGTH > 60)
      .map(item => ({ path: 'seo.title', detail: `${(item.language ?? '').toUpperCase()} : ${clean(item.value).length + TITLE_SUFFIX_LENGTH} caractères` })),
  },
  {
    id: 'seo-description-length',
    severity: 'tip',
    category: 'pages',
    title: 'Description Google trop longue ou trop courte',
    why: 'Au-delà de ~160 caractères Google la coupe ; en dessous de ~70 il la remplace souvent par un extrait de la page.',
    fix: 'Visez 120 à 160 caractères (onglet SEO → « Meta description »).',
    types: SEO_PAGE_TYPES,
    test: (doc: SingletonDoc | LegalDoc) => (doc.seo?.description ?? [])
      .filter(item => clean(item.value).length > 0 && (clean(item.value).length > 160 || clean(item.value).length < 70))
      .map(item => ({ path: 'seo.description', detail: `${(item.language ?? '').toUpperCase()} : ${clean(item.value).length} caractères` })),
  },
  {
    id: 'legal-slug-en',
    severity: 'tip',
    category: 'pages',
    title: 'Page légale sans adresse web anglaise',
    why: 'La version anglaise réutilise l’URL française (ex. /en/legal/mentions-legales).',
    fix: 'Renseignez « Slug (EN) » (ex. « legal-notice »).',
    types: ['legalPage'],
    test: (doc: LegalDoc) => Boolean(doc.slug) && !doc.slugEn && { path: 'slugEn' },
  },
  {
    id: 'bio-empty',
    severity: 'tip',
    category: 'pages',
    title: 'Page Bio (Instagram) sans voiture',
    why: 'Le lien en bio Instagram mène à une page vide.',
    fix: 'Ajoutez les voitures de vos derniers posts dans « Voitures citées sur les réseaux ».',
    types: ['bio'],
    test: (doc: SingletonDoc) => !(doc.bioCars ?? []).length && { path: 'cars' },
  },
  {
    id: 'bio-too-many',
    severity: 'tip',
    category: 'pages',
    title: 'Page Bio (Instagram) trop longue',
    why: 'Au-delà de 6 voitures, la page devient longue à faire défiler sur mobile.',
    fix: 'Retirez les voitures des posts les plus anciens (en bas de la liste).',
    types: ['bio'],
    test: (doc: SingletonDoc) => (doc.bioCars ?? []).length > 6 && { path: 'cars', detail: `${doc.bioCars!.length} voitures` },
  },

  {
    id: 'settings-contact-link',
    severity: 'critical',
    category: 'contact',
    title: 'Bouton « Contact » sans destination',
    why: 'Tous les boutons de contact du site (« Contacter un conseiller ») utilisent ce lien.',
    fix: 'Paramètres → Global → « Lien de contact » : choisissez la destination (WhatsApp, e-mail, page Contact…).',
    types: ['settings'],
    test: (doc: SingletonDoc) => !doc.contactLink?.target && { path: 'contactLink' },
  },
  {
    id: 'settings-contact-label',
    severity: 'warning',
    category: 'contact',
    title: 'Texte du bouton « Contact » non traduit',
    why: 'Le bouton de contact s’affiche sur toutes les pages.',
    fix: 'Paramètres → Global → « Lien de contact » : complétez le « Label » dans la langue manquante.',
    types: ['settings'],
    test: (doc: SingletonDoc) => {
      const missing = missingLanguages(doc.contactLink?.label)
      return Boolean(doc.contactLink?.target) && missing.length > 0 && { path: 'contactLink', detail: `${missing.join(', ')} manquant` }
    },
  },
  {
    id: 'settings-email',
    severity: 'warning',
    category: 'contact',
    title: 'E-mail de la marque manquant',
    why: 'Google l’associe à la marque dans ses résultats (données structurées).',
    fix: 'Paramètres → « Établissement (SEO local) » → « Email (marque) ».',
    types: ['settings'],
    test: (doc: SingletonDoc) => !doc.email && { path: 'email' },
  },
  {
    id: 'contact-subjects',
    severity: 'warning',
    category: 'contact',
    title: 'Formulaire de contact sans « Objet de la demande »',
    why: 'Le menu déroulant « Objet de la demande » du formulaire est vide.',
    fix: 'Page Contact → « Objets de la demande » : ajoutez les choix (location courte durée, longue durée…).',
    types: ['contact'],
    test: (doc: SingletonDoc) => !doc.subjectOptionsCount && { path: 'subjectOptions' },
  },
  {
    id: 'whatsapp-double-currency',
    severity: 'warning',
    category: 'contact',
    title: 'Devise en double dans un message WhatsApp',
    why: 'La variable Prix contient déjà la devise (« 900 € ») : le client reçoit « 900 €€ ».',
    fix: 'Supprimez le « € » (ou « EUR ») écrit juste à côté de la variable Prix.',
    run: ctx => templateHits(ctx, text =>
      /\{prix\}\s*(?:€|eur\b|euros?\b|chf\b)|(?:€|chf)\s*\{prix\}/i.test(text) ? 'Prix suivi d’une devise' : null),
  },
  {
    id: 'whatsapp-unknown-token',
    severity: 'warning',
    category: 'contact',
    title: 'Variable inconnue dans un message WhatsApp',
    why: 'Une variable mal orthographiée ou non disponible ici s’affiche telle quelle dans le message du client (ex. « {model} »).',
    fix: 'Supprimez-la et insérez la bonne variable depuis la palette de tags du champ.',
    run: ctx => templateHits(ctx, (text, t) => {
      const unknown = tokensOf(text).filter(token => !t.allowed.has(token))
      return unknown.length ? unknown.map(token => `{${token}}`).join(', ') : null
    }),
  },
  {
    id: 'whatsapp-date-token-sticky',
    severity: 'warning',
    category: 'contact',
    title: 'Durée ou « Quand » dans un message de la barre sticky',
    why: 'La barre sticky mobile n’a pas de sélecteur de durée : le message envoie une valeur que le client n’a jamais choisie.',
    fix: 'Retirez les variables Durée et Quand de ce message.',
    run: ctx => templateHits(ctx, (text, t) =>
      t.noDate && tokensOf(text).some(token => token === 'duree' || token === 'quand') ? 'Contient Durée / Quand' : null),
  },
  {
    id: 'whatsapp-empty',
    severity: 'tip',
    category: 'contact',
    title: 'Message WhatsApp pré-rempli vide',
    why: 'Le client arrive sur WhatsApp avec un message vierge : un message pré-rempli facilite le premier contact et vous indique d’où il vient.',
    fix: 'Rédigez le message dans l’onglet « WhatsApp » du document (FR et EN).',
    run: ctx => whatsappTemplates(ctx).flatMap((t) => {
      const missing = missingLanguages(t.value)
      return missing.length
        ? [{ docId: t.docId, group: t.path, label: t.label, path: t.path, detail: `${missing.join(', ')} vide` }]
        : []
    }),
  },

  {
    id: 'glossaire-missing',
    severity: 'warning',
    category: 'traductions',
    title: 'Texte du site non traduit',
    why: 'Boutons, libellés et messages du site viennent du Glossaire : une valeur vide peut laisser un texte manquant ou en français sur le site anglais.',
    fix: 'Ouvrez l’entrée et complétez la langue manquante.',
    types: ['glossaire'],
    test: (doc: SingletonDoc) => GLOSSAIRE_SECTIONS.flatMap((section) => {
      const entries = Array.isArray(doc[section.name]) ? (doc[section.name] as GlossaryEntry[]) : []
      return entries.flatMap((entry) => {
        const missing = missingLanguages(entry.value)
        if (!missing.length) return []
        const path = `${section.name}[_key=="${entry._key}"]`
        return [{ group: path, path, label: `${section.title} › ${entry.key ?? '?'}`, detail: `${missing.join(', ')} manquant` }]
      })
    }),
  },

  {
    id: 'media-heavy-video',
    severity: 'warning',
    category: 'general',
    title: 'Vidéo trop lourde',
    why: 'Les vidéos ne sont pas compressées automatiquement : un fichier lourd ralentit fortement l’affichage, surtout sur mobile.',
    fix: `Compressez la vidéo (ex. HandBrake, export « Web ») sous ${megabytes(MAX_VIDEO_BYTES)}, puis remplacez-la dans le document.`,
    run: ctx => ctx.videos
      .filter(video => (video.size ?? 0) > MAX_VIDEO_BYTES)
      .flatMap(video => video.usedBy
        .filter(ref => isContentId(ref._id))
        .map(ref => ({ docId: publishedId(ref._id), group: video._id, label: `${docLabel(ctx.byId.get(publishedId(ref._id)), ref._type)} — ${video.originalFilename ?? 'vidéo'}`, detail: megabytes(video.size) }))),
  },
  {
    id: 'media-mov',
    severity: 'warning',
    category: 'general',
    title: 'Vidéo au format .mov',
    why: 'Le format .mov (iPhone) n’est pas lu par tous les navigateurs : la vidéo peut rester noire chez certains visiteurs.',
    fix: 'Exportez la vidéo en .mp4 (H.264) et remplacez-la.',
    run: ctx => ctx.videos
      .filter(video => video.mimeType === 'video/quicktime')
      .flatMap(video => video.usedBy
        .filter(ref => isContentId(ref._id))
        .map(ref => ({ docId: publishedId(ref._id), group: video._id, label: `${docLabel(ctx.byId.get(publishedId(ref._id)), ref._type)} — ${video.originalFilename ?? 'vidéo'}` }))),
  },
  {
    id: 'settings-seo-description',
    severity: 'warning',
    category: 'general',
    title: 'Description de la marque manquante',
    why: 'Elle présente BORA CARS et ses agences à Google (données structurées de l’entreprise).',
    fix: 'Paramètres → SEO → « Meta description » en FR et EN.',
    types: ['settings'],
    test: (doc: SingletonDoc) => {
      const missing = missingLanguages(doc.seo?.description)
      return missing.length > 0 && { path: 'seo.description', detail: `${missing.join(', ')} manquant` }
    },
  },
  {
    id: 'settings-chf',
    severity: 'tip',
    category: 'general',
    title: 'Prix en francs suisses désactivés',
    why: 'Sans taux de conversion, les visiteurs ne peuvent pas afficher les prix en CHF sur les fiches et le catalogue.',
    fix: 'Paramètres → Devise → « Taux de conversion CHF » (ex. 0.94). À mettre à jour de temps en temps.',
    types: ['settings'],
    test: (doc: SingletonDoc) => !doc.tauxChf && { path: 'tauxChf' },
  },
  {
    id: 'settings-socials',
    severity: 'tip',
    category: 'general',
    title: 'Réseaux sociaux de la marque non renseignés',
    why: 'Google relie ces profils à la marque dans ses résultats.',
    fix: 'Paramètres → « Établissement (SEO local) » → « Réseaux sociaux (marque) ».',
    types: ['settings'],
    test: (doc: SingletonDoc) => !(doc.socialLinks ?? []).length && { path: 'socialLinks' },
  },
]

const toArray = (hits: Hit | Hit[] | null | undefined | false): Hit[] =>
  !hits ? [] : Array.isArray(hits) ? hits : [hits]

const hitIdentity = (hit: Hit) => `${hit.group ?? ''}|${hit.path ?? ''}`

export interface Snapshot {
  published: AnyDoc[]
  /** Brouillons, indexés par id publié. */
  drafts: Map<string, AnyDoc>
  context: Context
}

export function buildSnapshot(data: DashboardData): Snapshot {
  const all: AnyDoc[] = [...data.cars, ...data.locations, ...data.legalPages, ...data.singletons]
    .filter(doc => isContentId(doc._id))
  const published = all.filter(doc => !isDraftId(doc._id))
  const drafts = new Map(all.filter(doc => isDraftId(doc._id)).map(doc => [publishedId(doc._id), doc]))
  const context: Context = {
    cars: published.filter((d): d is CarDoc => d._type === 'car'),
    locations: published.filter((d): d is LocationDoc => d._type === 'location'),
    legalPages: published.filter((d): d is LegalDoc => d._type === 'legalPage'),
    singletons: new Map(published.filter(d => SINGLETON_TYPES.includes(d._type)).map(d => [d._type, d as SingletonDoc])),
    videos: data.videos,
    byId: new Map([...drafts.values(), ...published].map(d => [publishedId(d._id), d])),
  }
  return { published, drafts, context }
}

function toFindings(rule: CheckMeta, docId: string, docType: string, hits: Hit[], snapshot: Snapshot, draftHits: Set<string> | null): Finding[] {
  const doc = snapshot.context.byId.get(docId)
  const groups = new Map<string, Hit[]>()
  for (const hit of hits) groups.set(hit.group ?? '', [...(groups.get(hit.group ?? '') ?? []), hit])
  return [...groups.entries()].map(([group, groupHits]) => ({
    key: `${rule.id}|${docId}|${group}`,
    checkId: rule.id,
    docId,
    docType,
    label: groupHits[0].label ?? docLabel(doc, docType),
    details: groupHits.map(h => h.detail).filter((d): d is string => Boolean(d)),
    path: groupHits[0].path,
    imageUrl: thumbnailUrl(doc),
    fixedInDraft: draftHits !== null && groupHits.every(h => !draftHits.has(hitIdentity(h))),
  }))
}

export function runChecks(snapshot: Snapshot): Issue[] {
  const { published, drafts, context } = snapshot
  const issues: Issue[] = []

  for (const rule of RULES) {
    const { run, test, types, ...meta } = rule as Partial<DocRule & GlobalRule> & CheckMeta
    const findings: Finding[] = []

    if (test && types) {
      for (const doc of published.filter(d => types.includes(d._type))) {
        const hits = toArray(test(doc, context))
        if (!hits.length) continue
        // Un brouillon PLUS ANCIEN que la version publiée écraserait des changements
        // récents s'il était publié : on ne le présente pas comme une correction.
        const draft = drafts.get(doc._id)
        const draftHits = draft && draft._updatedAt > doc._updatedAt
          ? new Set(toArray(test(draft, context)).map(hitIdentity))
          : null
        findings.push(...toFindings(meta, doc._id, doc._type, hits, snapshot, draftHits))
      }
    }
    else if (run) {
      const byDoc = new Map<string, GlobalHit[]>()
      for (const hit of run(context)) byDoc.set(hit.docId, [...(byDoc.get(hit.docId) ?? []), hit])
      for (const [docId, hits] of byDoc) {
        const type = context.byId.get(docId)?._type ?? docId
        findings.push(...toFindings(meta, docId, type, hits, snapshot, null))
      }
    }

    if (findings.length) issues.push({ ...meta, findings })
  }

  return issues
}

/**
 * Points bloquants d'un brouillon jamais publié (ce qui manque avant de publier).
 * Libellés courts, ex. `['prix', 'lieu']`.
 */
export function missingBeforePublish(draft: AnyDoc, snapshot: Snapshot): string[] {
  return RULES
    .filter((rule): rule is DocRule => 'test' in rule && rule.severity === 'critical' && rule.types.includes(draft._type))
    .filter(rule => toArray(rule.test(draft, snapshot.context)).length > 0)
    .map(rule => rule.short ?? rule.title.toLowerCase())
}
