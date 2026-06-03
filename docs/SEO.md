# SEO — Ranker #1 sur « bora cars »

> Objectif : quand on tape **« bora cars »** sur Google (FR/CH), `boracars.com`
> + ses fiches Google sortent en premier, avec knowledge panel de marque.

## Le contexte (juin 2026)

Difficulté structurelle : **triple collision de nom**.

- **Volkswagen Bora / Maserati Bora** = modèles de voiture → la requête exacte
  « bora cars » est interprétée par Google comme « voitures Bora » (Wikipédia VW/Maserati).
- **Bora Bora** (l'île) → « bora … location voiture » sort la location à Bora Bora.
- **Bora Cars** (la marque) → seul l'**Instagram `@bora.cars`** ressort ; `boracars.com`
  n'apparaît pas encore.

Conclusion : le frein n'est **pas technique**. Le site doit devenir une **entité de
marque reconnue** et être **indexé**. C'est 90 % hors-code.

## ✅ Côté code / données : déjà fait (rien à corriger)

- Domaine exact-match `boracars.com` ; `<title>` accueil mène par la marque.
- JSON-LD `Organization` (`#identity`) + un `AutoRental` par agence, généré dans
  `web/app/app.vue` depuis Sanity.
- Données prod complètes : `email`, `priceRange`, `areaServed`, **4 `sameAs`**
  (Instagram, LinkedIn, Facebook, TikTok), **2 agences** (Genève + Paris/Neuilly)
  avec adresse / géo / téléphone / horaires / lien Google.
- Indexabilité gérée par `NUXT_PUBLIC_IS_PROD` : prod (`main`) = `indexable`,
  `robots.txt` + `sitemap.xml` prérendus ; `develop` = `noindex`.
- Ajout récent : `alternateName: "Bora Cars"` + `slogan` sur l'`Organization`
  (désambiguïsation vs modèle VW Bora).

## Statut audit (2026-06-03) — technique 100 % vert

- ✅ **Indexé** : `site:boracars.com` renvoie les accueils `/fr` + `/en` (bons titres/descr).
- ✅ **robots.txt** : `User-agent: *`, **aucun `Disallow`**, `Sitemap: …/sitemap_index.xml`.
- ✅ **Sitemap** : index frais, 27 URLs/locale (accueil + 5 pages + 3 légales + 20 voitures).
- ✅ **Search Console** : propriété **vérifiée** (le « Êtes-vous le propriétaire ? » du
  SERP est juste l'encart générique Google, pas un signal). Reste à exploiter GSC :
  soumettre le sitemap, demander l'indexation des 27 URLs, suivre la requête « bora cars ».

- ✅ **Trailing-slash : aligné (CORRIGÉ).** Doc officielle Nuxt SEO : *« Most Nuxt sites
  don't need trailing slashes »* → la bonne pratique = **sans slash + cohérent partout**.
  Le site déclarait DÉJÀ tout en no-slash (canonical/hreflang/sitemap = `/fr`) ; seul le
  serveur redirigeait à contre-sens (`/fr` → `/fr/`, à cause de `fr/index.html`). Fix
  appliqué dans `nuxt.config.ts` : `site.trailingSlash: false` (explicite) +
  `nitro.prerender.autoSubfolderIndex: false` (écrit `fr.html` → Netlify sert `/fr` en
  200, redirige `/fr/` → `/fr`).
  - **✅ Validé en build local prod** (`nuxt build --dotenv .env.prod`, 0 erreur, 67 pages
    HTML) : sortie `dist/fr.html` + `en.html` + voitures `.html` plats — **plus aucun**
    `*/index.html` localisé ; `canonical` + `hreflang` + sitemap `__sitemap__/fr-FR.xml`
    **tous en no-slash** (0 `<loc>` finissant par `/`) ; fonctions Netlify (`/api/contact`,
    `/_i18n/*`, sitemap runtime) intactes. Baseline confirmée : prod (prérendu) `/fr` → 301
    `/fr/` ; develop (SSR) `/fr` → 200 déjà (le slash ne venait que du prerender static).
  - **Reste à confirmer au 1er deploy** : runtime Netlify `/fr` = 200 et `/fr/` → 301 `/fr`
    (comportement host, non testable en local). En attendant le redeploy `main`, inspecter
    dans GSC la forme **avec** slash (`/fr/`, `/en/`) ; après deploy, la forme **sans**.
  - Pas retenu : `site.trailingSlash: true` (Option B) → à contre-courant du défaut Nuxt
    et expose au bug i18n nuxt-modules/i18n#2096 (canonical i18n forcé en slash).

→ Côté code : terminé. Indexation OK, trailing-slash aligné.
**Le seul vrai levier reste : Google Business Profile + signaux de marque + temps.**

## 🎯 Le plan — par ordre d'impact (À FAIRE, hors-code)

### 0. Indexation (BLOQUANT — à vérifier en premier)

- [ ] Taper `site:boracars.com` dans Google. Si 0 résultat → le site n'est pas indexé.
- [ ] **Google Search Console** : ajouter la propriété **Domaine** (`boracars.com`,
      valide `/fr` + `/en` d'un coup via DNS).
- [ ] Soumettre `https://boracars.com/sitemap.xml`.
- [ ] « Inspection de l'URL » → **Demander une indexation** pour `/fr` et `/en`.
- [ ] Apex `boracars.com` → 301 vers `/fr` (locale par défaut, stratégie `prefix`).
- [ ] Vérifier que `https://boracars.com/robots.txt` n'a **pas** de `Disallow: /`
      (= confirme que la prod tourne bien avec `IS_PROD=true`).

### 1. Google Business Profile — LE plus gros levier de marque

> C'est la fiche établissement + knowledge panel qui s'affichent en premier sur une
> requête de marque locale. Le JSON-LD `AutoRental` (`sameAs` = lien Google) est déjà
> prêt à se connecter à ces fiches — il manque les fiches **vérifiées**.

- [ ] Créer/revendiquer **une fiche par agence** sur business.google.com :
  - **Paris** — 6 Rue Bellanger, 92200 Neuilly-sur-Seine — +33 6 86 89 80 93
  - **Genève** — Sq. du Mont-Blanc, 1201 Genève — +41 77 289 93 58
- [ ] Nom **exact** : `Bora Cars` (identique partout — NAP cohérent).
- [ ] Catégorie : **Agence de location de voitures** (+ secondaire « Location de
      voitures de luxe »).
- [ ] Site = `https://boracars.com`, horaires, **photos** (flotte + agence), description.
- [ ] **Vérifier** la fiche (carte postale / téléphone / vidéo) — sans vérification,
      pas de knowledge panel.
- [ ] Une fois vérifiées, remplacer les shortlinks `share.google/…` (champ « Lien » du
      Lieu dans Sanity) par l'URL canonique de chaque fiche Google.

### 2. Consolider l'entité de marque (désambiguïsation)

- [ ] Chaque profil social nommé **exactement « Bora Cars »**, bio claire
      (« location de véhicules haut de gamme, Paris & Genève »), lien retour vers
      `boracars.com`. (Déjà en `sameAs` : IG, LinkedIn, FB, TikTok.)
- [ ] Page / section **« À propos »** sur le site qui écrit noir sur blanc :
      « Bora Cars est une société de location de véhicules haut de gamme à Paris
      et Genève. » → texte crawlable qui sépare la marque du modèle VW.
- [ ] (Optionnel) Demander un **Google Knowledge Panel** une fois la marque établie.

### 3. Backlinks & citations (NAP cohérent partout)

- [ ] Annuaires : **Pages Jaunes** (FR), **local.ch / search.ch** (CH), annuaires
      location de luxe, Yelp.
- [ ] Mentions presse / partenaires avec lien `boracars.com`.
- [ ] Vérifier que **Nom / Adresse / Téléphone** sont strictement identiques sur le
      site, GBP, réseaux et annuaires (incohérence NAP = signal affaibli).

### 4. Suivi (4–8 semaines)

- [ ] GSC → Performances : surveiller la position moyenne sur la requête « bora cars ».
- [ ] `site:boracars.com` : nombre de pages indexées en hausse.
- [ ] Apparition du knowledge panel / map pack sur « bora cars ».

> Avec un domaine exact-match + GBP vérifié + `sameAs` cohérents, le n°1 sur la propre
> marque se stabilise généralement en **quelques semaines**. Le code est prêt ; le
> reste est exécution + patience.

---

## Annexe — Brief Google Business Profile (à transmettre au client)

**Créer 2 fiches** sur https://business.google.com (un compte, 2 établissements).

**Règles communes (NAP identique partout) :**
- **Nom** : `Bora Cars` (exactement — PAS « Bora Cars Paris », interdit par Google → risque
  de suspension ; c'est l'adresse qui différencie les 2 fiches).
- **Catégorie principale** : Agence de location de voitures.
  Secondaires : Location de voitures de luxe, Service de location de véhicules.
- **Site web** : `https://boracars.com`
- **Email** : `contact@boracars.com`
- **Horaires** : les horaires réels (ou 24h/24 si applicable).
- **Zone desservie** (livraison) : activer + lister les villes/régions couvertes.
- **Photos** (essentiel) : logo, photo de couverture, devanture, **chaque voiture de la
  flotte**, équipe. Min. 5–10 photos de qualité par fiche.
- **Produits** : ajouter les véhicules (nom + prix/jour) — renforce la fiche.
- **Vérification** : carte postale / téléphone / vidéo (24–72 h). **Sans vérification,
  pas de knowledge panel.**

**Fiche Paris** — 6 Rue Bellanger, 92200 Neuilly-sur-Seine — +33 6 86 89 80 93
**Fiche Genève** — Sq. du Mont-Blanc, 1201 Genève — +41 77 289 93 58

**Description (à coller, < 750 caractères) :**

> FR — Bora Cars est votre partenaire de location de véhicules haut de gamme à
> {Paris|Genève}. Sélection de voitures de luxe, sportives et premium (Lamborghini,
> Porsche, Mercedes, Audi, Range Rover…) en location courte et longue durée, avec service
> personnalisé et livraison possible. Pour un événement, un déplacement professionnel ou le
> simple plaisir de conduire, Bora Cars vous accompagne. Réservation simple et rapide.
> Également présents à {Genève|Paris}.

**Une fois les 2 fiches VÉRIFIÉES → récupérer l'URL Google Maps canonique de chacune**
(bouton « Partager » de la fiche) et me les transmettre : je remplacerai les shortlinks
`share.google/…` du champ « Lien » des Lieux dans Sanity → le `sameAs` du JSON-LD pointera
sur la fiche officielle (liaison d'entité plus forte).
