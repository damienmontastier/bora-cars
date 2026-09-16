import { missingLanguages } from '../../lib/i18nValidation'
import type { CarDoc, ImageInfo, Localized } from './data'

// Score de complétude d'une fiche voiture : ce que la fiche AFFICHE réellement
// (web/app/components/page/car/*). Un critère « essentiel » pèse plus lourd : sans
// lui la carte ou la fiche est cassée, pas seulement moins riche.

export interface Criterion {
  id: string
  label: string
  ok: boolean
  /** Ce qui manque, en clair (quand `ok` est faux). */
  detail?: string
  /** Champ ouvert par « Ouvrir ». */
  path: string
  weight: number
}

export interface CriteriaGroup {
  id: string
  title: string
  items: Criterion[]
}

export interface CarScore {
  /** 0–100. */
  score: number
  groups: CriteriaGroup[]
  missing: Criterion[]
}

const MIN_PHOTO_WIDTH = 1600
const MIN_GALLERY = 3

const has = (v: unknown) => v != null && v !== ''

const langGap = (value: Localized | undefined) => {
  const missing = missingLanguages(value)
  return missing.length ? `${missing.length === 2 ? 'vide' : `${missing.join(', ')} manquant`}` : undefined
}

const listMissing = (entries: [string, unknown][]) => {
  const missing = entries.filter(([, v]) => !has(v)).map(([label]) => label)
  return missing.length ? `Manque : ${missing.join(', ')}` : undefined
}

function criterion(id: string, label: string, path: string, weight: number, detail: string | undefined | false): Criterion {
  return { id, label, path, weight, ok: !detail, detail: detail || undefined }
}

export function scoreCar(car: CarDoc): CarScore {
  const photos: ImageInfo[] = [car.image, ...(car.images ?? [])].filter((img): img is ImageInfo => Boolean(img?.url))
  const lowRes = photos.filter(img => img.width && img.width < MIN_PHOTO_WIDTH).length
  const noAlt = photos.filter(img => missingLanguages(img.alt).length).length
  const gallery = (car.images ?? []).filter(img => img?.url).length
  const rentalTypes = (car.rentalTypes ?? []).filter(t => t === 'courte-duree' || t === 'longue-duree')
  const monthly = car.prixMensuel != null
  const clientTypes = car.clientType

  const groups: CriteriaGroup[] = [
    {
      id: 'essentiel',
      title: 'Essentiel',
      items: [
        criterion('image', 'Photo principale', 'image', 3, !car.image?.url && 'Aucune photo'),
        criterion('prix', 'Prix', 'prixJournalier', 3, car.prixJournalier == null && car.prixMensuel == null && 'Ni prix journalier ni mensuel'),
        criterion('lieu', 'Lieu', 'location', 3, !car.location && 'Aucun lieu choisi'),
        criterion('rental', 'Type de location', 'rentalTypes', 3, !rentalTypes.length && 'Courte / longue durée non coché'),
        criterion('catalogue', 'Visible dans un catalogue', 'clientType',
          3,
          Array.isArray(clientTypes) && !clientTypes.includes('particulier') && !clientTypes.includes('professionnel') && 'Aucun type de client coché'),
      ],
    },
    {
      id: 'photos',
      title: 'Photos',
      items: [
        criterion('gallery', `Galerie (${MIN_GALLERY} photos ou plus)`, 'images', 2, gallery < MIN_GALLERY && `${gallery} photo${gallery > 1 ? 's' : ''} dans la galerie`),
        criterion('hd', 'Photos en haute définition', 'image', 2, lowRes > 0 && `${lowRes} photo${lowRes > 1 ? 's' : ''} sous ${MIN_PHOTO_WIDTH} px de large`),
        criterion('hotspot', 'Point focal réglé', 'image', 1, Boolean(car.image?.url) && !car.image?.hasHotspot && 'Photo principale sans point focal'),
        criterion('alt', 'Textes alternatifs FR/EN', 'image', 1, noAlt > 0 && `${noAlt} photo${noAlt > 1 ? 's' : ''} sans texte complet`),
      ],
    },
    {
      id: 'textes',
      title: 'Textes FR/EN',
      items: [
        criterion('description', 'Description', 'description', 2, langGap(car.description)),
        criterion('teinteExterieure', 'Teinte extérieure', 'teinteExterieure', 1, langGap(car.teinteExterieure)),
        criterion('teinteInterieure', 'Teintes intérieures', 'teinteInterieure', 1, langGap(car.teinteInterieure)),
        criterion('equipements', 'Équipements', 'equipements', 1, langGap(car.equipements)),
      ],
    },
    {
      id: 'caracteristiques',
      title: 'Caractéristiques',
      items: [
        criterion('specs', 'Gamme, année, boîte, carburant', 'gamme', 1, listMissing([
          ['gamme', car.gamme],
          ['année', car.annee],
          ['boîte de vitesse', car.boiteVitesse],
          ['carburant', car.carburant],
        ])),
        criterion('places', 'Places et portes', 'nombrePlaces', 1, listMissing([['places', car.nombrePlaces], ['portes', car.nombrePortes]])),
        criterion('performances', 'Puissance et 0 à 100 km/h', 'puissance', 1, listMissing([['puissance', car.puissance], ['0 à 100 km/h', car.acceleration0to100]])),
      ],
    },
    {
      id: 'location',
      title: 'Conditions',
      items: [
        criterion('caution', 'Caution', 'caution', 1, !has(car.caution) && 'Non renseignée'),
        criterion('conducteur', 'Âge minimum et ancienneté du permis', 'ageMinimum', 1, listMissing([['âge minimum', car.ageMinimum], ['ancienneté du permis', car.anciennetePermis]])),
        criterion('duree', 'Durée minimum', 'dureeMinimum', 1, !has(car.dureeMinimum) && 'Non renseignée'),
        criterion('km', monthly ? 'Km par mois inclus' : 'Km par jour inclus', monthly ? 'kmMoisInclus' : 'kmJourInclus', 1,
          !has(monthly ? car.kmMoisInclus : car.kmJourInclus) && 'Non renseigné'),
        criterion('kmSup', 'Prix du km supplémentaire', 'prixKmSupplementaire', 1, !has(car.prixKmSupplementaire?.prix) && 'Non renseigné'),
        criterion('paiements', 'Paiements acceptés', 'paiementsAcceptes', 1, !(car.paiementsAcceptes ?? []).length && 'Aucun moyen coché'),
      ],
    },
  ]

  const all = groups.flatMap(g => g.items)
  const total = all.reduce((n, c) => n + c.weight, 0)
  const earned = all.filter(c => c.ok).reduce((n, c) => n + c.weight, 0)

  return {
    score: Math.round((earned / total) * 100),
    groups,
    missing: all.filter(c => !c.ok),
  }
}

export const scoreTone = (score: number) => (score >= 90 ? 'positive' : score >= 60 ? 'caution' : 'critical') as 'positive' | 'caution' | 'critical'
