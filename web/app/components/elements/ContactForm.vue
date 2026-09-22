<script setup lang="ts">
import type { ContactProfile, ProFormData } from '~/config/CONTACT_PRO_CONFIG'
import type { ContactProfileSwitchData, ContactSubjectOption } from '~/queries/contact'
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'
import { CONTACT_PROFILES } from '~/config/CONTACT_PRO_CONFIG'

interface Props {
  subjectOptions?: ContactSubjectOption[] | null
  submitLabel?: string | null
  profileSwitch?: ContactProfileSwitchData | null
  proForm?: ProFormData | null
}

const props = withDefaults(defineProps<Props>(), {
  subjectOptions: () => [],
  submitLabel: null,
  profileSwitch: null,
  proForm: null,
})

const emit = defineEmits<{
  proSuccess: [firstName: string]
}>()

const profile = defineModel<ContactProfile>('profile', { default: 'general' })
const proStep = defineModel<number>('proStep', { default: 0 })

const { website } = provideContactForm({
  onSuccess: (sent, body) => {
    if (sent === 'pro') {
      const firstName = (body.answers as Record<string, unknown> | undefined)?.firstName
      emit('proSuccess', typeof firstName === 'string' ? firstName.trim() : '')
    }
  },
})

const profileOptions = computed(() => CONTACT_PROFILES.map(value => ({
  value,
  title: props.profileSwitch?.[`${value}Title`] ?? '',
  subtitle: props.profileSwitch?.[`${value}Subtitle`] ?? undefined,
})))

const generalRef = ref<{ submit: () => void } | null>(null)
const proRef = ref<{ submit: () => void } | null>(null)

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

function cascadeItems(el: HTMLElement | null) {
  return Array.from(el?.children ?? []).flatMap(child =>
    child.hasAttribute('data-contact-cascade') ? Array.from(child.children) : [child])
}

function clearCascade(el: HTMLElement | null) {
  const items = cascadeItems(el)
  if (items.length)
    gsap.set(items, { clearProps: CASCADE_PROPS })
}

function settle() {
  clearCascade(panel('general'))
  clearCascade(panel('pro'))
  if (panelsRef.value)
    gsap.set(panelsRef.value, { clearProps: 'height' })
}

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
      :aria-label="profileSwitch?.label ?? undefined"
    />

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
        :form="proForm"
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
