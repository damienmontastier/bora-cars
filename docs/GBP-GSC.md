# Guide — Google Business Profile + Search Console (Bora Cars)

> **À qui s'adresse ce doc :** pas-à-pas pour finaliser/optimiser le référencement de
> marque **hors-code**. Le code (SEO technique, JSON-LD, sitemap, analytics) est **100 %
> prêt et vérifié en prod** — il ne reste que ces actions « console », à faire dans le
> navigateur.
>
> **Où on en est (juin 2026) :**
> - ✅ Site online, indexable, sitemap + robots OK, `/fr` & `/en` en 200.
> - ✅ **Google Business Profile : 2 fiches créées et reconnues par Google** (chacune a un
>   *kgmid*, l'identifiant Knowledge Graph → la fiche est une vraie entité).
> - ✅ **Search Console : propriété en place.**
> - ➡️ Reste : **confirmer la vérification des fiches**, les **optimiser**, **soumettre le
>   sitemap** dans GSC, **demander l'indexation**, puis **suivre** sur 4-8 semaines.
>
> **Objectif final :** quand on tape **« bora cars »** sur Google (FR/CH), `boracars.com` +
> le knowledge panel de marque sortent en premier. Frein principal : collision de nom
> (modèle VW/Maserati « Bora », l'île « Bora Bora », et même `borocars.com`, un taxi à
> Scarborough). La solution = **entité de marque forte + vérifiée + cohérente**.

---

## 📌 Données de référence (vérifiées dans le JSON-LD en production)

À utiliser telles quelles partout (la **cohérence NAP** = Nom / Adresse / Téléphone à
l'identique sur site + GBP + réseaux + annuaires est un signal de ranking).

| | **Genève** | **Paris** |
|---|---|---|
| **Nom** | `Bora Cars` *(exactement — pas « Bora Cars Genève »)* | `Bora Cars` |
| **Adresse** | Sq. du Mont-Blanc, 1201 Genève (Suisse) | 6 Rue Bellanger, 92200 Neuilly-sur-Seine (France) |
| **Téléphone** | +41 77 289 93 58 | +33 6 86 89 80 93 |
| **Horaires** *(selon Sanity)* | 7j/7, 24h/24 | Lun–Ven, 10h00–18h00 |
| **Site web** | https://boracars.com | https://boracars.com |
| **Email** | contact@boracars.com | contact@boracars.com |
| **kgmid (entité Google)** | `/g/11yp0wsnj5` | `/g/11nhh0fc98` |

**Autres infos utiles :**
- **Sitemap à soumettre dans GSC :** `https://boracars.com/sitemap_index.xml`
- **Nombre d'URLs attendues :** **30 par langue** (1 accueil + 5 pages + 6 légales + 18 voitures), en `/fr` et `/en`.

> ⚠️ Si une de ces infos change (adresse, horaire, téléphone), elle se modifie **dans Sanity
> Studio** (document « Lieu ») — le site, le JSON-LD et le sitemap se mettent à jour seuls.
> Pense alors à reporter le changement **aussi dans GBP** pour garder le NAP cohérent.

---

# Partie 1 — Google Business Profile (GBP)

> C'est **le plus gros levier** : la fiche établissement + le knowledge panel s'affichent
> en premier sur une requête de marque locale. Les fiches existent déjà ; il faut les
> **vérifier** et les **remplir à fond**.

Accès : <https://business.google.com> (avec le compte Google du client).

## Étape 1.1 — Vérifier le statut de chaque fiche ⭐ (LE point critique)

Sans le **badge « Validé »**, **pas de knowledge panel** — c'est le point n°1.

1. Ouvre <https://business.google.com> → tu dois voir **2 établissements** (Paris + Genève).
2. Sur chaque fiche, regarde le bandeau de statut en haut :
   - ✅ **« Les modifications sont publiées » / badge validé** → la fiche est vérifiée, parfait.
   - ⚠️ **« Faites vérifier cette fiche » / « En attente de validation »** → clique dessus et
     lance la vérification :
     - **Téléphone / SMS** (le plus rapide, si proposé),
     - ou **vidéo** (filmer la devanture + l'intérieur + un justificatif),
     - ou **carte postale** (code reçu sous 5–14 jours, à saisir ensuite).
3. Tant qu'une fiche n'est pas vérifiée → **reviens finir cette étape avant tout le reste.**

> Les 2 fiches ont déjà un *kgmid* (entité Google), donc elles existent bien côté Google.
> Le badge « vérifié » se voit **uniquement dans le tableau de bord GBP** (impossible à
> contrôler de l'extérieur) → c'est à toi de confirmer ici.

## Étape 1.2 — Nom & cohérence NAP

1. **Nom** = `Bora Cars` **exactement** sur les 2 fiches.
   - ❌ Ne PAS mettre « Bora Cars Paris » / « Bora Cars Genève » (interdit par Google →
     risque de suspension). C'est **l'adresse** qui différencie les 2 fiches.
2. **Adresse + téléphone** : recopie **à l'identique** le tableau de référence ci-dessus.
3. Vérifie que le **téléphone** affiché correspond bien au pays (Genève = +41, Paris = +33).

## Étape 1.3 — Catégories

1. **Catégorie principale** (identique sur les 2) : **« Agence de location de voitures »**.
2. **Catégories secondaires** : « Location de voitures de luxe », « Service de location de véhicules ».

## Étape 1.4 — Site, horaires, zone desservie

1. **Site web** : `https://boracars.com` (pas une URL `/fr` — Google redirige tout seul).
2. **Horaires** : ceux du tableau (Genève 24h/24, Paris Lun–Ven 10–18) — ou les vrais s'ils ont changé.
3. **Zone desservie** (livraison) : activer + lister les villes/régions couvertes (utile car
   vous livrez) — ex. Genève + cantons voisins ; Paris + Île-de-France.
4. **Email** : `contact@boracars.com`.

## Étape 1.5 — Photos (essentiel pour le knowledge panel)

Min. **5–10 photos de qualité par fiche** :
- Logo + photo de couverture,
- Devanture / agence,
- **Chaque voiture de la flotte** (les mêmes que sur le site, c'est un gros plus),
- L'équipe si possible.

## Étape 1.6 — Produits (la flotte)

Dans l'onglet **Produits** de chaque fiche, ajoute les véhicules phares (nom + prix/jour +
photo). Ça renforce la fiche et fait remonter des requêtes « location \<modèle\> Paris/Genève ».

## Étape 1.7 — Description

Onglet **Description** (< 750 caractères). Texte prêt à coller (adapter `{ville}`) :

> Bora Cars est votre partenaire de location de véhicules haut de gamme à **{Paris|Genève}**.
> Sélection de voitures de luxe, sportives et premium (Lamborghini, Porsche, Mercedes, Audi,
> Range Rover…) en location courte et longue durée, avec service personnalisé et livraison
> possible. Pour un événement, un déplacement professionnel ou le simple plaisir de conduire,
> Bora Cars vous accompagne. Réservation simple et rapide. Également présents à **{Genève|Paris}**.

## Étape 1.8 — Entretien continu (après la mise en place)

- **Avis clients** : en demander régulièrement (lien d'avis depuis GBP), **répondre à chacun**
  (les avis + réponses sont un signal fort).
- **Google Posts** : publier de temps en temps (nouveauté flotte, offre) — garde la fiche active.

### ✅ Checklist GBP (à cocher pour chaque fiche)

- [ ] Genève **vérifiée** (badge validé)
- [ ] Paris **vérifiée** (badge validé)
- [ ] Nom = `Bora Cars` exact (×2)
- [ ] NAP identique au tableau de référence (×2)
- [ ] Catégorie principale « Agence de location de voitures » (×2)
- [ ] Site `https://boracars.com` + horaires + zone desservie (×2)
- [ ] ≥ 5–10 photos dont la flotte (×2)
- [ ] Produits / véhicules ajoutés (×2)
- [ ] Description remplie (×2)

---

# Partie 2 — Google Search Console (GSC)

Accès : <https://search.google.com/search-console>

## Étape 2.1 — Confirmer le bon type de propriété

1. En haut à gauche, ouvre le sélecteur de propriété.
2. Idéalement, la propriété doit être de type **« Domaine »** = `boracars.com`
   (validée par DNS) → elle couvre **`/fr` ET `/en`** d'un coup, en http/https/www.
   - Si tu n'as qu'une propriété **« Préfixe d'URL »** (ex. `https://boracars.com/`) :
     ça marche aussi, mais ajoute en plus la propriété **Domaine** (Ajouter une propriété →
     Domaine → suivre l'instruction d'enregistrement DNS TXT chez le registrar).

## Étape 2.2 — Soumettre le sitemap

1. Menu de gauche → **Sitemaps**.
2. Champ « Ajouter un sitemap » → saisir : **`sitemap_index.xml`**
   (URL complète : `https://boracars.com/sitemap_index.xml`).
3. **Envoyer** → le statut doit passer à **« Réussite »** (parfois après quelques heures).
4. Tu dois voir **2 sitemaps enfants découverts** (`fr-FR.xml`, `en-GB.xml`), ~**30 URLs
   chacun**.

## Étape 2.3 — Inspecter & demander l'indexation des pages clés

Pour les pages prioritaires — au minimum l'accueil **`https://boracars.com/fr`** et
**`https://boracars.com/en`** :

1. Colle l'URL dans la **barre « Inspection de l'URL »** (tout en haut).
2. Regarde le verdict :
   - ✅ **« L'URL est sur Google »** → rien à faire.
   - ⚠️ **« L'URL n'est pas sur Google »** → clique **« Demander une indexation »**.
3. Répète pour les pages importantes (catalogue, proprietaire, professionnel) si besoin.

> Pas besoin de demander l'indexation des 30 URLs une à une : le **sitemap** s'en charge.
> On force juste les pages prioritaires pour accélérer.

## Étape 2.4 — Lire le rapport « Pages / Indexation » (= la vraie réponse à « suis-je indexé ? »)

1. Menu de gauche → **Indexation → Pages**.
2. Regarde le nombre de pages **« Indexées »** vs **« Non indexées »**.
   - Objectif : se rapprocher de **~60 pages indexées** (30 × 2 langues).
   - Si des pages sont « Non indexées » → clique sur le motif (ex. « Détectée, actuellement
     non indexée » = normal au début, Google prend son temps ; « Exclue par balise noindex »
     = anormal en prod, à me signaler).

> C'est **ce rapport** (pas une recherche `site:` à la main) qui dit la vérité sur
> l'indexation.

## Étape 2.5 — Suivre la requête « bora cars »

1. Menu de gauche → **Performances → Résultats de recherche**.
2. Onglet **« Requêtes »** → cherche **`bora cars`** (et `boracars`, `bora cars genève`,
   `bora cars paris`).
3. Note la **position moyenne** de départ → c'est la métrique à faire baisser vers **1**.

### ✅ Checklist GSC

- [ ] Propriété **Domaine** `boracars.com` en place
- [ ] Sitemap `sitemap_index.xml` soumis → statut **Réussite**
- [ ] 2 sitemaps enfants + ~30 URLs/langue détectés
- [ ] Indexation demandée pour `/fr` et `/en`
- [ ] Rapport **Pages** lu (nb. de pages indexées noté)
- [ ] Position de départ « bora cars » notée

---

# Partie 3 — Suivi (4 à 8 semaines)

À regarder ~1×/semaine :

- [ ] **GSC → Performances** : position moyenne sur « bora cars » qui **descend vers 1**.
- [ ] **GSC → Pages** : nombre de pages indexées **en hausse**.
- [ ] **Google** : apparition du **knowledge panel** (encart de marque à droite) et du
      **map pack** (les 3 fiches sur carte) quand on tape « bora cars » / « location voiture
      luxe Genève/Paris ».
- [ ] **GBP** : nouveaux **avis** + y répondre.

> Avec un domaine exact-match (`boracars.com`) + GBP **vérifié** + NAP cohérent + entités
> déjà reconnues (kgmid), le **n°1 sur la marque** se stabilise en général en **quelques
> semaines**. Le code est prêt ; le reste = exécution + patience.

---

# Annexe — Récap des liens

| Quoi | Lien |
|---|---|
| Google Business Profile | <https://business.google.com> |
| Search Console | <https://search.google.com/search-console> |
| Sitemap à soumettre | `https://boracars.com/sitemap_index.xml` |
| Fiche Genève (partage actuel) | `https://share.google/4kxw4hMNnxR3a3xxh` |
| Fiche Paris (partage actuel) | `https://share.google/4Zeb6somWiJdb4H9Z` |

> Doc complémentaire : **`SEO.md`** (stratégie de fond) et **`ANALYTICS.md`** (GA4/GTM —
> à ne pas oublier : marquer `whatsapp_click` + `contact_form_submit` en événements clés, et
> créer le funnel Lead).
