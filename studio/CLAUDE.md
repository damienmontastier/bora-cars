# CLAUDE.md — `studio/` (Sanity Studio)

CMS de BORA CARS. Ce fichier ne couvre que `studio/` — vue d'ensemble du monorepo, déploiement et contrats avec le site : `../CLAUDE.md`. Locales : `../shared/CLAUDE.md`. Le Studio n'a **ni ESLint ni tests** : le filet est `npm run typecheck`.

## Commands (depuis `studio/`)

```bash
npm run dev          # sanity dev → :3334
npm run build        # sanity build
npm run typecheck    # tsc --noEmit — doit rester vert
npm run deploy       # sanity deploy (Studio hébergé par Sanity, appId dans sanity.cli.ts)
npx sanity migration run <dossier>                # dry-run par défaut
npx sanity migration run <dossier> --no-dry-run   # écrit dans le dataset
```

**Port du Studio : 3334**, pas le 3333 par défaut de Sanity (`server.port` dans `sanity.cli.ts`) — 3333 est partagé par tous les Studios de la machine, donc occupé dès qu'un autre projet Sanity tourne. Surchargeable par `SANITY_STUDIO_PORT` (lu depuis `.env`) ou en one-shot : `npm run dev -- --port 3335`.

Env : copier `.env.example` en `.env` — `SANITY_STUDIO_NETLIFY_BUILD_HOOK` (outil « Mise en ligne » + bouton du Dashboard), `SANITY_STUDIO_SITE_URL` (optionnel, défaut `https://boracars.com`) et `SANITY_STUDIO_PREVIEW_SITE_URL` (optionnel, défaut `https://develop.boracars.com`, lien « Site de test ») lus par le Dashboard, `SANITY_STUDIO_PORT`. Seules les variables préfixées `SANITY_STUDIO_` sont exposées au bundle ; les déclarer dans `env.d.ts`.

## Config

- Project ID: `xyw8hnp3`, dataset: `production`, apiVersion: `2026-04-06`. Les valeurs sont répétées à plusieurs endroits : projectId et dataset dans `sanity.config.ts` et `sanity.cli.ts`, apiVersion dans `components/dashboard/data.ts` (`API_VERSION`), et les trois côté web.
- Plugins (`sanity.config.ts`) : `linkField` (type `link`, `linkableSchemaTypes` = types vers lesquels un lien interne peut pointer), `internationalizedArray`, `assist`, `structureTool` (structure custom), `visionTool`
- Structure (`structure` dans `sanity.config.ts`) : **Pages** (Homepage, Propriétaire, Professionnel, Contact │ Catalogue, Catalogue professionnel │ Page Voiture, Pages légales │ Bio) → Voitures, Lieux → Menu, Footer → Glossaire (traductions), Paramètres
- Outil custom **« Dashboard »** (`components/dashboard/`) déclaré **en premier** dans `tools` = page d'arrivée du Studio (cf. § Dashboard)
- **Studio en français** : plugin `frFRLocale()` (`@sanity/locale-fr-fr`) en tête des `plugins`. Les textes du Dashboard citent les libellés FR du Studio (« Publier », « Brouillon », « Annuler les modifications », « Générer ») : les garder alignés. Certains plugins restent en anglais (i18n array « Add translation… », language-filter « Showing all », « Releases »).
- Outil custom **« Mise en ligne »** (`components/DeployTool.tsx` + `lib/netlifyDeploy.ts`) — **ne pas le renommer « Publier »** (= bouton des documents) ; vocabulaire client : *brouillon → publié → en ligne* : POST sur le build hook Netlify → rebuild de la prod (pages prérendues) pour mettre en ligne le contenu publié. `useDeployTrigger` / `DeployConfirmDialog` sont réutilisés par le Dashboard
- `studio.components.layout` = `components/StudioLayout.tsx` : CSS global (badges de langue de l'i18n array) + `InsertMenuHoverPreview` (aperçu au survol du menu d'insertion de modules)
- **Studio v6** (Node ≥ 22.12, build Vite 8/Rolldown, React 19, React strict mode activé en dev). Conventions d'import imposées par les libs qui l'accompagnent :
  - `@sanity/icons` v5 — **plus de barrel** : `import { HomeIcon } from '@sanity/icons/Home'` (sous-chemin = nom de l'icône sans le suffixe `Icon`), jamais `from '@sanity/icons'`.
  - `@sanity/ui` v4 — `Tooltip` → `@sanity/ui/tooltip`, `useToast`/`ToastProvider` → `@sanity/ui/toast` ; props renommées : `Stack`/`Inline` `space` → **`gap`**, `Grid` `columns`/`rows` → **`gridTemplateColumns`/`gridTemplateRows`**, `Badge` `mode` supprimée. Les anciennes ne sont plus lues au runtime (l'espacement disparaît silencieusement) — le typecheck les signale.
  - `@sanity/icons`, `@sanity/ui` et `@sanity/image-url` sont déclarés en dépendances directes (ils sont importés directement par le code du Studio).
- TypeScript 6.x (comme le web) ; les imports CSS d'effet de bord (`react-grid-layout/css/styles.css`) sont déclarés dans `env.d.ts` (TS2882).

## Schéma — `schemaTypes/`

Tout type doit être importé **et** ajouté au tableau `schemaTypes` de `schemaTypes/index.ts`.

| Dossier | Types |
|---------|-------|
| `singletons/` | `homepage`, `proprietaire`, `professionnel`, `contact`, `catalogue`, `catalogueProfessionnel`, `carPage`, `bio`, `menu`, `footer`, `settings`, `glossaire` |
| `documents/` | `car` (voiture), `location` (lieu = agence), `legalPage` |
| `modules/home/` | `hero`, `serviceCards`, `pitch`, `process`, `brandsSection`, `fullscreenMarquee`, `cardsColumn`, `testimonials` |
| `modules/shared/` | `title`, `text`, `faq` |
| `objects/` | `customImage`, `customVideo`, `customMedia`, `customLink`, `navLink`, `processStep`, `specsLayout`, `glossaryEntry` |

`objects/seo.ts` n'est **pas** un type global : `seoType` est importé et posé comme champ dans chaque singleton de page. `constants.ts` expose `GROUPS` (onglets Editorial/SEO), `SUPPORTED_LANGUAGES`, `SINGLETON_TYPES`, `LOCALIZED_DOCUMENT_TYPES`.

Les modules (`modules[]` des pages) sont rendus côté web par `PageModules` ; leurs miniatures d'aperçu sont `static/module-thumbnails/<type>.webp` (`ModuleThumbnailPreview`, `InsertMenuHoverPreview`).

### Ajouter / renommer

- **Singleton** : l'ID du document = le nom du type. Le déclarer à **deux** endroits : `SINGLETON_TYPES` (`constants.ts` — source unique : le `Set` `SINGLETONS` de `sanity.config.ts`, qui retire create/delete/duplicate, en dérive, le Dashboard aussi) et la `structure` (`S.document().schemaType(x).documentId(x)`). Plus `LOCALIZED_DOCUMENT_TYPES` s'il est localisé, et `linkableSchemaTypes` s'il doit être cible de lien.
- **Page liable** : côté web, ajouter aussi la route dans `SANITY_ROUTES` / `I18N_PAGES` (`web/app/config/I18N_CONFIG.ts`), sinon `BaseLink` ne sait pas la résoudre.
- **Singleton `contact`** : onglet « Leasing professionnel » (group `pro`) avec `proIntro` (texte d'accueil) et `proSuccess` (écran de confirmation : `text` accepte le jeton `{prenom}`, 2 cartes-liens `whatsapp` / `instagram`). Les textes du formulaire pro eux-mêmes sont dans le Glossaire (clés `contact.pro.*`, `contact.profile.*`). Les **valeurs** des listes pro ne sont pas éditables (constantes web, liées aux options Airtable).
- **Champ** : le web lit tout via des GROQ écrits à la main (`web/app/queries/`) — ajouter/renommer un champ ici impose de mettre à jour la projection et l'interface `*Data` côté web. Renommer un champ qui a des données ⇒ migration.

### Localisation des champs

`sanity-plugin-internationalized-array` (v5) génère les types `internationalizedArrayString`, `…Text`, `…Block` (styles H3), `…LegalBlock` (paragraphe/H3, liste, gras/souligné, annotation `link`), `…StringList`. Langues = `SUPPORTED_LANGUAGES` (depuis `shared/languages.ts`) ; le web filtre les valeurs par `language == $lang` avec fallback FR. Pour exiger toutes les langues : `validation: Rule => requireAllLanguages(Rule)` (`lib/i18nValidation.ts`, qui exporte aussi `missingLanguages`). Aperçus : `pickLocalized()` (`lib/preview.ts`, fallback FR).

`car.marque` / `car.modele` ne sont **pas** localisés (chaînes simples, cf. migration `unlocalize-marque-modele`).

## Glossaire (micro-copy du site)

Singleton `glossaire` : `GLOSSAIRE_SECTIONS` (`singletons/glossaire.ts`) = un onglet (field group) par namespace i18n top-level du site ; chaque onglet est une liste plate de `glossaryEntry` `{ key: 'dotted.path' (readOnly), value: internationalizedArrayText }`. Le web reconstruit l'arbre de messages vue-i18n à partir des clés au runtime (`web/app/plugins/i18n-sanity.ts`). Donc :
- **ajouter une clé `$t()`** = ajouter l'entrée dans le document `glossaire` (patch via API/MCP, la clé étant readOnly dans l'UI) puis **publier** — aucun fichier JSON à toucher ;
- une nouvelle section = une entrée dans `GLOSSAIRE_SECTIONS` dont le `name` = le namespace utilisé dans les clés ;
- `nuxtSiteConfig` n'est **pas** dans le glossaire (lu au build par nuxt-site-config, reste dans `web/i18n/locales/*.json`).

## Composants — `components/`

| Fichier | Rôle | Branché sur |
|---------|------|-------------|
| `StudioLayout.tsx` | Layout global (CSS + aperçu au survol du menu d'insertion) | `sanity.config.ts` |
| `DeployTool.tsx` | Outil « Mise en ligne » (build hook Netlify, dernier déclenchement) | `sanity.config.ts` `tools` |
| `ModuleThumbnailPreview.tsx` | Aperçu d'un module avec miniature `static/module-thumbnails/` | modules + tableaux `modules` |
| `InsertMenuHoverPreview.tsx` | Miniature au survol dans le menu d'insertion | `StudioLayout` |
| `HeroArrayItem.tsx` | Item de tableau signalant si le hero est bien en 1ʳᵉ position | `homepage`, `proprietaire`, `professionnel` |
| `GridMakerInput.tsx` | Éditeur de grille 12 colonnes (`react-grid-layout`) | `serviceCards` |
| `SpecsLayoutInput.tsx` | Drag & drop (`@dnd-kit`) de l'agencement des caractéristiques | `specsLayout` |
| `CatalogueCarsPreview.tsx` | Liste des voitures qui apparaîtront dans le catalogue. Reproduit le filtre `clientType` de `web/app/queries/catalogue.ts` — **à garder aligné** | `catalogue`, `catalogueProfessionnel` |
| `NavLinkPreview.tsx` | Aperçu localisé d'un `navLink` | `navLink` |
| `WhatsappTemplatesInput.tsx` | Les 4 templates WhatsApp de la fiche voiture | `carPage.whatsapp` |
| `WhatsappTokenEditor.tsx` + `whatsappTokenDom.ts` | Éditeur de message à tags (cf. ci-dessous) | `PageWhatsappMessageInput` (pages), `BioWhatsappMessageInput` (`bio`) |
| `dashboard/` | Dashboard (onglet par défaut) : état du site en ligne, points à vérifier, brouillons, activité — cf. § Dashboard | `sanity.config.ts` `tools` |

### Éditeur WhatsApp

- `carPage.whatsapp` = **objet** avec 4 sous-champs `internationalizedArrayText` (`withPrice` / `withoutPrice` / `simpleWithPrice` / `simpleWithoutPrice`). `WhatsappTemplatesInput` est posé en `components.input` sur **l'objet** (pas par champ) : une palette de tags partagée + `renderDefault` (les 4 sous-champs) + UN sélecteur voiture/langue qui pilote les 4 aperçus live. Les cas `simple*` (barre sticky) n'ont pas de sélecteur durée/quand sur le site → leurs descriptions mettent en garde contre `{duree}`/`{quand}`.
- **Tous les champs de message WhatsApp utilisent l'éditeur à tags** `WhatsappTokenEditor.tsx` (`PageWhatsappMessageInput` / `BioWhatsappMessageInput` / `WhatsappTokenObjectScope`) : un `contentEditable` où chaque `{token}` s'affiche comme un tag déplaçable (drag depuis la palette, déplacement dans le message, copie vers l'autre langue, clic = insertion au curseur, × ou Backspace = suppression).
- **Le stockage ne change pas** : chaîne simple contenant des `{token}`. Le moteur DOM `whatsappTokenDom.ts` (sans React) fait l'aller-retour à l'identique — pas de migration.
- Injection : override de `renderInput` dans `renderDefault` pour les inputs dont le path se termine par `value` (le texte par langue de l'`internationalizedArrayText`), ce qui garde l'UI du plugin i18n intacte.
- Jetons disponibles : `CAR_VARIABLES` (`marque`, `modele`, `prix`, `periode`, `duree`, `quand`, `url`), `BIO_VARIABLES` (sans `duree`/`quand`), `PAGE_VARIABLES` (`url` seul). **Ces listes doivent correspondre aux paramètres réellement remplis par le web** (`useCarContact`, `PageBioStory`, `provideWhatsappMessage`).
- Ne **pas** `preventDefault()` sur le `mousedown` des tags de la palette : ça tue silencieusement le drag HTML5 natif dans Chrome.

### Dashboard — `components/dashboard/`

Page d'arrivée du Studio, pensée pour le client non technique : texte en français simple, toujours formulé en conséquence sur le site.

Trois onglets (`DashboardTool.tsx`, état local) : **Vue d'ensemble** (site en ligne, points à vérifier, brouillons, activité), **Fiches voitures** (`CarsTab.tsx`) et **Aperçu Google** (`GoogleTab.tsx`).

La Vue d'ensemble assemble plusieurs fichiers :
- `SiteStatus.tsx` : état du site en ligne ;
- `Overview.tsx` : chiffres clés, avec les audiences du catalogue calquées sur `web/app/queries/catalogue.ts` (à garder alignées) ;
- `Issues.tsx` : points à vérifier ;
- `Activity.tsx` : `Drafts` et `RecentActivity` ;
- `Guide.tsx` : `HowItWorks` et `Shortcuts`.

`shared.tsx` regroupe l'UI commune (`Panel`, `IntentButton`, `timeAgo`, `useHiddenFindings`…).

- **Données** (`data.ts`) : UNE requête GROQ (`DASHBOARD_QUERY`) en perspective **`raw`** (publiés + `drafts.*`, pour les comparer), rejouée via `client.listen` (debounce 1,2 s) à chaque mutation d'un type de contenu.
- **Règles** (`checks.ts`, tableau `RULES`) : chaque règle = `severity` (`critical` / `warning` / `tip`) × `category` (onglet) + `why` (impact concret) + `fix` (marche à suivre). Deux formes : `types` + `test(doc)` (tourne sur la version **publiée** ; si un brouillon *plus récent* ne présente plus le problème → badge « Corrigé dans le brouillon ») ou `run(ctx)` (règles transverses : slug en double, marque écrite de plusieurs façons, messages WhatsApp…). Un `Hit` porte `path` (champ passé à l'intent « Ouvrir ») et `group` (une ligne par entrée, ex. glossaire). **Ajouter une vérification = ajouter une entrée à `RULES`**, rien d'autre à câbler. Les jetons WhatsApp autorisés viennent de `CAR_VARIABLES` / `BIO_VARIABLES` / `PAGE_VARIABLES`, jamais recopiés. Les règles critiques avec `short` alimentent aussi « Manque : … » sur les brouillons jamais publiés.
- **Site en ligne** (`SiteStatus.tsx`) : la prod étant prérendue, on lit la date du build en ligne dans le manifest Nuxt `/_nuxt/builds/latest.json` (`{ id, timestamp }`, `cache: 'no-store'` car servi `immutable`) et on liste les documents publiés depuis. « Mettre le site à jour » réutilise `useDeployTrigger` puis guette le changement d'`id` du manifest. **Exige l'en-tête `Access-Control-Allow-Origin` posé dans `web/netlify.toml`** : sans lui (ou hors ligne), le panneau affiche « Date de mise en ligne indisponible », le reste fonctionne.
- **Fiches voitures** (`completeness.ts`) : score 0–100 par voiture, pondéré (critères « Essentiel » ×3 : photo, prix, lieu, type de location, catalogue), groupes Photos / Textes FR/EN / Caractéristiques / Conditions calqués sur ce qu'affiche `web/app/components/page/car/*`. Une ligne par voiture sur sa version la plus récente (brouillon s'il est plus récent) ; chaque critère manquant ouvre son champ.
- **Aperçu Google** (`seoPreview.ts`) : reconstitue `<title>` + meta description **comme le site** (template `{texte} — BORA CARS`, accueil inversé, repli `settings.fallbackTitle` / Glossaire `seo.description`, fiches voitures = Glossaire `car.seo.title` + 160 premiers caractères de la description) et les coupe au pixel (canvas, Arial : titre 600 px, description 990 px). URLs traduites recopiées dans `ROUTES` : **à garder alignées avec `web/app/config/I18N_CONFIG.ts`**, comme le calcul du titre avec `app.vue` / `pages/index.vue` / `pages/car/[uid].vue`. Le SEO du singleton `carPage` n'est lu par aucune page : il est exclu des règles et de l'aperçu (`SEO_PAGE_TYPES`).
- **Masquer un point** : clé `checkId|docId|group` en `localStorage` (`bora:dashboard:hidden`), par appareil — confort d'affichage, pas une donnée.
- Réutilise `missingLanguages()` (`lib/i18nValidation.ts`), `SINGLETON_TYPES`, `GLOSSAIRE_SECTIONS`. Pour vérifier les règles sur le vrai dataset : un script `npx sanity exec <script> --with-user-token` qui importe `DASHBOARD_QUERY` + `buildSnapshot` / `runChecks` (le placer sous `studio/`, sinon `sanity/cli` ne se résout pas).

## Utilitaires — `lib/`

| Fichier | Exports | Utilisé par |
|---------|---------|-------------|
| `i18nValidation.ts` | `requireAllLanguages(Rule)` (validation), `missingLanguages(value)` (langues vides, en majuscules) | schémas, Dashboard |
| `preview.ts` | `pickLocalized(value, fallbackLang = 'fr')` | `preview.prepare` des schémas, `GridMakerInput`, Dashboard |
| `netlifyDeploy.ts` | `BUILD_HOOK`, `SITE_URL`, `PREVIEW_SITE_URL` (lus depuis l'env avec défauts), `triggerBuild()` (POST `no-cors` sur le hook), `readLastTriggered()`, `fetchLiveBuild()` (lecture de `latest.json`), `formatDateTime()` | `DeployTool`, Dashboard |

## Migrations — `migrations/`

Scripts one-shot `defineMigration` (`sanity/migrate`), un dossier par migration, lancés avec `npx sanity migration run <dossier>`. Historique des évolutions de schéma (localisation des champs, passage `customLink` → `navLink`…) : **vérifier l'état du dataset avant d'en relancer une**, et toujours passer d'abord en dry-run. Certaines embarquent leur propre copie de listes de types/champs (ex. `localize-fields`) : ne pas les considérer comme source de vérité.
