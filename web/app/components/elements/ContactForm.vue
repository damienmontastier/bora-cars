<script setup lang="ts">
// Formulaire de la page Contact : sélecteur « Demande générale » / « Leasing
// professionnel », honeypot, état d'envoi et statut (useContactForm). Chaque parcours
// a son composant ; les deux restent montés (v-show) pour qu'un changement d'onglet
// ne vide pas les réponses déjà saisies.
import type { ContactProfile } from '~/config/CONTACT_PRO_CONFIG'
import type { ContactSubjectOption } from '~/queries/contact'
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'
import { CONTACT_PROFILES } from '~/config/CONTACT_PRO_CONFIG'

interface Props {
  subjectOptions?: ContactSubjectOption[] | null
  submitLabel?: string | null
}

withDefaults(defineProps<Props>(), {
  subjectOptions: () => [],
  submitLabel: null,
})

const emit = defineEmits<{
  // Dossier pro envoyé : la page affiche l'écran de succès
  proSuccess: [firstName: string]
}>()

const profile = defineModel<ContactProfile>('profile', { default: 'general' })
const proStep = defineModel<number>('proStep', { default: 0 })

const { t } = useI18n()

const { website } = provideContactForm({
  onSuccess: (sent, body) => {
    if (sent === 'pro')
      emit('proSuccess', typeof body.firstName === 'string' ? body.firstName.trim() : '')
  },
})

const profileOptions = computed(() => CONTACT_PROFILES.map(value => ({
  value,
  title: t(`contact.profile.${value}.title`),
  subtitle: t(`contact.profile.${value}.subtitle`),
})))

const generalRef = ref<{ submit: () => void } | null>(null)
const proRef = ref<{ submit: () => void } | null>(null)

// Changement d'onglet (même chorégraphie que PageContactIntro, cf. useContactSwitchMotion) :
// les blocs du parcours affiché sortent en cascade vers le haut, puis ceux de l'autre
// entrent depuis le bas pendant que la hauteur passe de l'un à l'autre.
// `shown` (le parcours visible) ne rejoint `profile` qu'une fois la sortie finie ; la page
// s'en sert pour masquer son texte d'accueil sur mobile au bon moment.
const shown = defineModel<ContactProfile>('shownProfile', { default: 'general' })
const panelsRef = ref<HTMLElement | null>(null)

const { canAnimate, track, motion } = useContactSwitchMotion()
const lenis = useLenis()
let switchTween: gsap.core.Animation | null = null
let switchId = 0

const CASCADE_PROPS = 'opacity,visibility,transform'

function panel(value: ContactProfile) {
  return panelsRef.value?.querySelector<HTMLElement>(`:scope > [data-contact-panel="${value}"]`) ?? null
}

// Blocs animés : enfants directs du parcours, et un à un les champs des listes
// marquées `data-contact-cascade`
function cascadeItems(el: HTMLElement | null) {
  return Array.from(el?.children ?? []).flatMap(child =>
    child.hasAttribute('data-contact-cascade') ? Array.from(child.children) : [child])
}

function clearCascade(el: HTMLElement | null) {
  const items = cascadeItems(el)
  if (items.length)
    gsap.set(items, { clearProps: CASCADE_PROPS })
}

// État de repos : plus aucun style inline, hauteur rendue à `auto`
function settle() {
  clearCascade(panel('general'))
  clearCascade(panel('pro'))
  if (panelsRef.value)
    gsap.set(panelsRef.value, { clearProps: 'height' })
}

// `fresh` : parcours qui vient d'apparaître ; sinon il revient de l'état où l'a laissé
// une sortie interrompue (clic sur l'onglet de départ pendant l'échange)
function enter(root: HTMLElement, el: HTMLElement, fresh: boolean) {
  const tl = gsap.timeline({ onComplete: settle })
  if (root.style.height)
    tl.to(root, { height: el.offsetHeight, ...motion.height }, 0)

  const to = {
    autoAlpha: 1,
    y: 0,
    duration: motion.enter.duration,
    ease: motion.enter.ease,
    stagger: { amount: motion.enter.stagger },
  }
  const items = cascadeItems(el)
  if (fresh)
    tl.fromTo(items, { autoAlpha: 0, y: motion.formEnterY }, to, motion.gap)
  else
    tl.to(items, to, 0)
  return tl
}

watch(profile, (next) => {
  const id = ++switchId
  switchTween?.kill()
  switchTween = null

  const root = panelsRef.value
  const current = panel(shown.value)
  const animated = canAnimate(root) && canAnimate(current)

  // Chaque changement d'onglet repart du haut de la page : sinon le texte d'accueil, qui
  // change de hauteur au-dessus du formulaire, pousse le sélecteur hors de l'écran (mobile).
  // Via Lenis, verrouillé le temps du trajet. Ignoré tant que Lenis est arrêté (preloader),
  // et la page est alors déjà en haut.
  lenis.value?.scrollTo(0, animated
    ? { duration: motion.scroll.duration, easing: gsap.parseEase(motion.scroll.ease), lock: true }
    : { immediate: true })

  if (!animated) {
    shown.value = next
    settle()
    return
  }

  if (shown.value === next) {
    switchTween = track(() => enter(root, current, false))
    return
  }

  // Hauteur figée pendant l'échange, puis ajustée au nouveau parcours
  gsap.set(root, { height: root.offsetHeight })
  switchTween = track(() => gsap.to(cascadeItems(current), {
    autoAlpha: 0,
    y: motion.formLeaveY,
    duration: motion.leave.duration,
    ease: motion.leave.ease,
    stagger: { amount: motion.leave.stagger },
    onComplete: () => {
      shown.value = next
      nextTick(() => {
        if (id !== switchId)
          return
        // Parcours sorti désormais masqué (v-show) : il retrouve ses styles
        clearCascade(current)
        const incoming = panel(next)
        if (incoming)
          switchTween = track(() => enter(root, incoming, true))
        else
          settle()
      })
    },
  }))
})

// Un seul <form> (le honeypot doit en faire partie) : l'envoi est délégué au parcours affiché.
function onSubmit() {
  if (shown.value === 'pro')
    proRef.value?.submit()
  else
    generalRef.value?.submit()
}
</script>

<template>
  <form class="app-elements-contact-form" novalidate @submit.prevent="onSubmit">
    <AtomsProfileSwitch
      v-model="profile"
      :options="profileOptions"
      :aria-label="t('contact.profile.label')"
    />

    <!-- Honeypot: bots fill it, humans never see it. Server discards filled submissions. -->
    <div class="app-elements-contact-form__honeypot" aria-hidden="true">
      <label for="contact-form-website">Website (do not fill)</label>
      <input
        id="contact-form-website"
        v-model="website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <div ref="panelsRef" class="app-elements-contact-form__panels">
      <ElementsContactFormGeneral
        v-show="shown === 'general'"
        ref="generalRef"
        data-contact-panel="general"
        :subject-options="subjectOptions"
        :submit-label="submitLabel"
      />
      <ElementsContactFormPro
        v-show="shown === 'pro'"
        ref="proRef"
        v-model:step="proStep"
        data-contact-panel="pro"
      />
    </div>
  </form>
</template>

<style lang="scss">
.app-elements-contact-form {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(32px);
  width: 100%;
  // Marge sous le menu fixe quand le parcours pro remonte en haut du formulaire (Lenis)
  scroll-margin-top: desktop-vw(120px);

  @include mobile {
    gap: mobile-vw(24px);
    scroll-margin-top: mobile-vw(88px);
  }

  &__honeypot {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
}
</style>
