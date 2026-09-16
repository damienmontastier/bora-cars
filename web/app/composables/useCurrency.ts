export type CurrencyCode = 'EUR' | 'CHF'

const CURRENCY_COOKIE = 'bora-currency'
const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Devise d'AFFICHAGE choisie par le visiteur (sélecteur EUR / CHF de la fiche voiture).
 *
 * Le catalogue reste tarifé en euros dans Sanity : le CHF est une simple conversion
 * à l'affichage (tarif de location, caution, prix du km supplémentaire). Le prix
 * canonique — celui du JSON-LD `Offer` — ne bouge donc pas, cf. `pages/car/[uid].vue`.
 *
 * Le taux vient de Sanity (Paramètres › Devise) et non d'une API de change : le site
 * est prérendu, un taux « live » serait figé au build et impossible à corriger sans
 * redéploiement. Taux absent → `chfAvailable` est faux → le sélecteur ne s'affiche
 * pas et tout reste en euros (mieux que des montants convertis au hasard).
 */
export function useCurrency() {
  const { locale } = useI18n()
  const settings = useSettings()

  // État partagé par toute l'app (fiche voiture ET cartes du catalogue) : le visiteur
  // ne doit jamais voir deux devises différentes d'une page à l'autre.
  const selected = useState<CurrencyCode>('currency', () => 'EUR')

  // Le cookie ne sert QUE de persistance, il n'est pas lu au rendu serveur : en SSG
  // le HTML est figé au build (donc en EUR), le lire au SSR provoquerait un mismatch
  // d'hydratation. On applique la préférence après le mount — un tick plus tard, sans
  // avertissement Vue ni HTML prérendu erroné.
  const stored = useCookie<CurrencyCode | null>(CURRENCY_COOKIE, {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    path: '/',
  })

  onMounted(() => {
    if (stored.value === 'CHF' || stored.value === 'EUR')
      selected.value = stored.value
  })

  // 1 € = X CHF.
  const chfRate = computed(() => {
    const rate = settings.value?.tauxChf
    return typeof rate === 'number' && rate > 0 ? rate : null
  })

  const chfAvailable = computed(() => chfRate.value != null)

  // Garde-fou : une préférence CHF mémorisée ne doit pas survivre au retrait du taux
  // côté Sanity.
  const currency = computed<CurrencyCode>(() =>
    selected.value === 'CHF' && chfAvailable.value ? 'CHF' : 'EUR',
  )

  function setCurrency(next: CurrencyCode) {
    selected.value = next
    stored.value = next
  }

  // Locale de contenu (et non locale suisse) : la devise change, pas la façon d'écrire
  // les nombres sur le site.
  const numberLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-GB'))

  /**
   * Formate un montant **saisi en euros** dans la devise active.
   *
   * `decimals` : 0 pour les tarifs et la caution (montants ronds), 2 pour le prix au km.
   * `style: 'currency'` place le symbole selon la locale — « 600 € » en FR, « €600 » en
   * EN — au lieu du « 600€ » concaténé à la main, incorrect en anglais.
   */
  function formatPrice(amountEur: number, decimals = 0): string {
    const amount = currency.value === 'CHF' && chfRate.value != null
      ? amountEur * chfRate.value
      : amountEur

    return new Intl.NumberFormat(numberLocale.value, {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  return { currency, chfAvailable, setCurrency, formatPrice }
}
