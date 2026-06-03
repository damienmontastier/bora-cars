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

const { isMobile } = useBreakpoint()

const isAnimated = computed(() => props.animated && !isMobile.value)

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
// Vue's managed text node for the slot. Captured once, before init() overwrites
// innerHTML with word spans. After that the node is detached from the DOM but Vue
// keeps patching it on locale change (the persistent menu CTA never remounts) —
// observing it lets us re-split with the new translation when `settings` updates.
let sourceNode = null
let mo = null

function readSourceText() {
  const fromNode = sourceNode?.nodeValue
  if (fromNode != null)
    return fromNode.trim()
  return textRef.value?.root?.textContent?.trim() ?? ''
}

function reset() {
  tl?.kill()
  tl = null
  initialized = false
  const el = textRef.value?.root
  const text = readSourceText()
  // Never blank the element: when the source is transiently empty (e.g. settings
  // null mid-refetch) keep what's there rather than wiping the CTA text.
  if (el && text)
    el.textContent = text
  if (rootRef.value?.$el) {
    rootRef.value.$el.style.minWidth = ''
  }
}

// Vue patched the (now-detached) source text node — a locale switch landed the
// new translation. Rebuild the word-split so the CTA follows the language.
function onSourceTextChange() {
  if (!props.animated)
    return
  reset()
  nextTick(init)
}

function init() {
  if (initialized)
    return
  if (!props.animated)
    return
  if (!rootRef.value?.$el || rootRef.value.$el.offsetWidth === 0)
    return

  initialized = true

  const el = textRef.value.root

  // Capture Vue's text node once and observe it (never re-capture — Vue's vnode
  // keeps referencing this exact node even after we detach it below). Pick the
  // node that actually holds text: slot forwarding can leave empty boundary text
  // nodes first, and that empty one is NOT what Vue patches on a locale change.
  if (!sourceNode) {
    const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
    sourceNode = textNodes.find(n => n.nodeValue?.trim()) ?? textNodes[0] ?? null
    if (sourceNode) {
      mo = new MutationObserver(onSourceTextChange)
      mo.observe(sourceNode, { characterData: true })
    }
  }

  const wordsList = readSourceText().split(' ')

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

  // The hover morph (tiret collapse + words flipping together) is desktop-only.
  // On mobile the tiret stays statically visible as a decorative separator —
  // no timeline, no minWidth lock, no Flip. The split above already ran so the
  // tiret is in the DOM; CSS keeps it shown (no `display: none` on mobile).
  if (!isAnimated.value)
    return

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
  if (!props.animated)
    return
  watch(fontsLoaded, (loaded) => {
    if (loaded)
      init()
  }, { immediate: true })
})

const onResize = useDebounceFn(() => {
  if (!props.animated)
    return
  // Full rebuild on resize handles both breakpoint sides and any crossing:
  // desktop rebuilds the timeline, mobile re-splits the static tiret.
  if (!initialized) {
    init()
    return
  }
  reset()
  init()
}, 150)

useResizeObserver(rootRef, onResize)

onUnmounted(() => {
  tl?.kill()
  mo?.disconnect()
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

  @include mobile {
    padding: mobile-vw(14px) mobile-vw(24px);
  }

  &--white {
    background: var(--c-white);
  }

  &--black {
    background: var(--c-black);
  }

  &--orange {
    background: var(--c-orange);
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
      width: mobile-vw(18px);
      height: mobile-vw(2px);
      margin: 0 mobile-vw(6.5px);
    }
  }
}
</style>
