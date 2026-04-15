<script setup>
import { useDebounceFn, useResizeObserver } from '@vueuse/core'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'

const props = defineProps({
  to: {
    type: [String, Object],
  },
  tiretAfter: {
    type: Number,
    default: 0,
  },
  animated: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
    default: 'white',
    validator: v => ['white', 'black', 'orange'].includes(v),
  },
})

const { to } = toRefs(props)

const themeTextColor = computed(() => ({
  white: 'black-100',
  black: 'beige-100',
  orange: 'beige-100',
}[props.theme]))

const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)

const rootRef = useTemplateRef('rootRef')
const textRef = useTemplateRef('textRef')

let tl = null
let initialized = false
let originalText = ''

function reset() {
  tl?.kill()
  tl = null
  initialized = false
  const el = textRef.value?.root
  if (el && originalText) {
    el.textContent = originalText
  }
  if (rootRef.value?.$el) {
    rootRef.value.$el.style.minWidth = ''
  }
}

function init() {
  if (initialized) return
  if (!rootRef.value?.$el || rootRef.value.$el.offsetWidth === 0) return

  initialized = true

  const el = textRef.value.root

  if (!originalText) originalText = el.textContent.trim()

  const wordsList = originalText.split(' ')

  if (wordsList.length <= 1)
    return

  el.innerHTML = wordsList.map((word, i) => {
    const span = `<span class="app-atoms-cta__word">${word}</span>`
    if (i === props.tiretAfter) {
      return `${span}<span class="app-atoms-cta__tiret"></span>`
    }
    return span
  }).join(' ')

  const words = Array.from(el.querySelectorAll('.app-atoms-cta__word'))
  const tiretEl = el.querySelector('.app-atoms-cta__tiret')

  rootRef.value.$el.style.minWidth = `${rootRef.value.$el.offsetWidth}px`

  gsap.set(tiretEl, { display: 'none' })
  const finalState = Flip.getState(words)
  gsap.set(tiretEl, { display: 'inline-block' })

  tl = gsap.timeline({ paused: true, defaults: { easeReverse: true } })
    .to(tiretEl, {
      scaleX: 0,
      duration: 0.45,
      ease: 'power3.inOut',
      transformOrigin: 'center center',
    }, 0)
    .add(
      Flip.to(finalState, {
        duration: 0.45,
        ease: 'power3.inOut',
        simple: true,
      }),
      0,
    )
}

onMounted(() => {
  if (!props.animated) return
  watch(fontsLoaded, (loaded) => {
    if (loaded) init()
  }, { immediate: true })
})

const onResize = useDebounceFn(() => {
  if (!props.animated || !initialized) return
  reset()
  init()
}, 150)

useResizeObserver(rootRef, onResize)

onUnmounted(() => {
  tl?.kill()
})

defineExpose({ init })

function onEnter() {
  tl?.play()
}

function onLeave() {
  tl?.reverse()
}
</script>

<template>
  <UtilsBaseLink
    ref="rootRef"
    :to="to"
    class="app-atoms-cta"
    :class="`app-atoms-cta--${theme}`"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <TextsCTA ref="textRef" :selectable="false" :color="themeTextColor">
      <slot />
    </TextsCTA>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-atoms-cta {
  display: inline-flex;
  padding: desktop-vw(18px) desktop-vw(30px);
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  background: var(--c-light-2);
  border-radius: 4px;

  &--white {
    background: var(--c-white);
  }

  &--black {
    background: var(--c-black);
  }

  &--orange {
    background: var(--c-orange);
  }

  @include mobile {
    padding: mobile-vw(20px) mobile-vw(35px);
  }

  .CTA-TEXT {
    white-space: nowrap;
  }

  &__word {
    display: inline-block;
  }

  &__tiret {
    display: inline-block;
    width: desktop-vw(28px);
    height: 2px;
    background: currentColor;
    vertical-align: middle;
    margin: 0 desktop-vw(12px);

    @include mobile {
      width: mobile-vw(28px);
      height: mobile-vw(2.5px);
      margin: 0 mobile-vw(10px);
    }
  }
}
</style>
