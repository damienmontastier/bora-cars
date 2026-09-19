// Changement d'onglet de la page Contact (« Demande générale » ↔ « Leasing
// professionnel ») : le texte de gauche (PageContactIntro) et le formulaire
// (ElementsContactForm) sortent puis entrent ensemble. Mêmes durées des deux côtés :
// les cascades s'expriment en durée totale (`stagger.amount`), quel que soit le nombre
// de lignes ou de champs.
import { useMounted, usePreferredReducedMotion } from '@vueuse/core'
import gsap from 'gsap'

const CONTACT_SWITCH_MOTION = {
  // Sortie : vers le haut, en accélérant
  leave: { duration: 0.4, stagger: 0.08, ease: 'power2.in' },
  // Temps mort entre la sortie et l'entrée
  gap: 0.05,
  // Entrée : depuis le bas, en décélérant
  enter: { duration: 0.75, stagger: 0.15, ease: 'power3.out' },
  // Hauteur des colonnes, de l'ancien contenu au nouveau : démarre à l'échange et finit
  // avant que les dernières lignes n'apparaissent (sinon, sur mobile, le texte entrant
  // chevaucherait le sélecteur d'onglets situé juste dessous)
  height: { duration: 0.35, ease: 'power2.out' },
  // Retour en haut de page (Lenis) : même durée que les autres `scrollTo(0)` du site, ease
  // douce ; il se poursuit pendant l'entrée du nouveau contenu
  scroll: { duration: 1.2, ease: 'power3.inOut' },
  // Déplacement des lignes de texte (en % de leur hauteur) et des blocs du formulaire (px)
  textLeaveY: -30,
  textEnterY: 50,
  formLeaveY: -16,
  formEnterY: 32,
} as const

export function useContactSwitchMotion() {
  // Pas d'animation tant que le preloader couvre la page : sur le lien direct
  // `?profil=pro` d'une page prérendue, l'onglet bascule juste après l'hydratation.
  const { preloaderDone } = storeToRefs(useAppStore())
  const mounted = useMounted()
  const reducedMotion = usePreferredReducedMotion()

  function motionAllowed() {
    return mounted.value && preloaderDone.value && reducedMotion.value !== 'reduce'
  }

  function canAnimate(el: Element | null | undefined): el is HTMLElement {
    return !!el
      && motionAllowed()
      // Élément masqué (mobile : colonne de gauche aux étapes B–E du parcours pro)
      && el.getClientRects().length > 0
  }

  // Tweens et SplitText du composant, annulés au démontage. Contexte créé au premier
  // usage : les animations ne tournent que côté client, jamais au prérendu.
  let ctx: gsap.Context | null = null
  function track<T extends () => unknown>(fn: T): ReturnType<T> {
    ctx ??= gsap.context(() => {})
    return ctx.add(fn)
  }

  onBeforeUnmount(() => {
    ctx?.revert()
    ctx = null
  })

  return { motionAllowed, canAnimate, track, motion: CONTACT_SWITCH_MOTION }
}
