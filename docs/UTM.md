# UTM Tracking — Bora Cars

## C'est quoi un UTM ?

Les **UTM** (Urchin Tracking Module) sont des paramètres ajoutés à une URL pour identifier **d'où vient un visiteur**.

```
https://bora-cars.com/?utm_source=instagram&utm_medium=story&utm_campaign=ferrari-launch
```

### Les 3 paramètres utilisés sur Bora Cars

| Paramètre | Sens | Exemple |
|---|---|---|
| `utm_source` | La **plateforme** d'origine | `instagram`, `google`, `newsletter` |
| `utm_medium` | Le **type de canal** | `cpc`, `email`, `social`, `story` |
| `utm_campaign` | La **campagne** précise | `ferrari-launch-mai2026` |

Les autres UTM standards (`utm_term`, `utm_content`) ne sont volontairement pas capturés — non utilisés pour le moment.

---

## À quoi ça sert

1. **Mesurer le ROI marketing** : savoir quelle campagne (Insta, Google Ads, newsletter, influenceur…) génère réellement des demandes de location.
2. **Attribution** : relier un lead reçu via le formulaire de contact à la pub qui l'a fait venir.
3. **Allocation budget** : si Instagram génère 80% des leads et Google Ads 5%, on sait où investir.

---

## Comment ça fonctionne ici

### 1. Pose des UTM sur les liens de pub

Les UTM se mettent sur **n'importe quel lien d'entrée**, peu importe la page de destination.

**Cas typique — lien pub vers la home :**
```
Pub Insta → https://bora-cars.com/?utm_source=instagram&utm_campaign=ferrari
```

**Cas direct — lien pub vers /contact :**
```
Pub Insta → https://bora-cars.com/contact?utm_source=instagram&utm_campaign=ferrari
```

**Cas page produit :**
```
Pub Insta → https://bora-cars.com/voitures/ferrari-488?utm_source=instagram
```

### 2. Capture côté client

Le composable `web/app/composables/useUtm.ts` :

- **`captureFromUrl()`** : lit les UTM dans `window.location.search` au chargement et les stocke dans `sessionStorage` (clé `bora_utm`).
- **`read()`** : ressort les UTM stockés au moment où on en a besoin (ex. submit du formulaire).

Le plugin `web/app/plugins/05.utm.client.ts` appelle `captureFromUrl()` au boot pour que la capture soit faite avant toute navigation interne.

### 3. Stratégie : **first-touch attribution**

```ts
if (sessionStorage.getItem(STORAGE_KEY)) return
```

Si des UTM existent déjà en session, on **n'écrase pas**. On garde la **première source** qui a fait découvrir Bora Cars au visiteur dans cette session de navigateur.

> Alternative possible : last-touch (écraser à chaque arrivée avec UTM). Choix conscient ici de privilégier first-touch.

### 4. Persistance pendant la navigation

Le `sessionStorage` permet de conserver les UTM même quand l'utilisateur quitte la page d'atterrissage :

```
Arrivée /?utm_source=instagram   → UTM stockés
→ navigation /proprietaire        → URL n'a plus de params, mais UTM en sessionStorage
→ navigation /contact             → idem
→ submit du form 10 min plus tard → UTM ressortis et envoyés au backend
```

Sans `sessionStorage`, dès le premier clic interne les UTM sont perdus.

### 5. Envoi au backend

Au submit du formulaire de contact (`web/app/components/elements/ContactForm.vue`), `useUtm().read()` est appelé et les UTM sont joints au payload envoyé à `web/server/api/contact.post.ts`.

---

## Limites et notes

- **Session-scoped** : les UTM sont perdus à la fermeture de l'onglet (sessionStorage, pas localStorage). Choix volontaire — un retour le lendemain compte comme une nouvelle visite, donc nouvelle attribution.
- **Mode privé** : si `sessionStorage` est indisponible, la capture échoue silencieusement (try/catch). Le formulaire fonctionne quand même, sans attribution.
- **Pas de fallback cookie** : si on veut suivre l'utilisateur sur plusieurs sessions, il faudra ajouter un cookie ou localStorage.

---

## Différence avec `@nuxt/scripts` / GA4 / GTM

`@nuxt/scripts` charge des trackers tiers (GA4, GTM, Meta Pixel…) qui captent les UTM **côté tracker** pour leurs propres dashboards.

Notre composable capte les UTM **côté backend Bora Cars** pour les attacher directement aux leads dans notre base — indépendamment de tout outil analytics tiers. Les deux sont complémentaires, pas redondants.
