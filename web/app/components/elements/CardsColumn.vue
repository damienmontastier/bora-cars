<script setup lang="ts">
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'

interface CardItem {
  _key: string
  title: string
  description?: string
}

interface Props {
  heading?: string
  subtext?: string
  cards: CardItem[]
}

const props = defineProps<Props>()

const settings = useSettings()

const items = computed(() =>
  props.cards.map((card, index) => ({
    ...card,
    number: `(${index + 1}.)`,
  })),
)

// 'click' = snap au click uniquement | 'scroll' = snap au scroll + click
const SNAP_MODE: 'click' | 'scroll' = 'click'

const rootRef = ref<HTMLElement | null>(null)
const isSnapping = ref(false)
const lenis = useLenis()
let ctx: gsap.Context | null = null
let snap: { destroy: () => void, goTo: (index: number) => void, stop: () => void, start: () => void, addElements: (elements: HTMLElement[], options?: object) => void } | null = null

function snapToItem(index: number) {
  isSnapping.value = true
  snap?.goTo(index)
}

onMounted(async () => {
  const { default: LenisSnap } = await import('lenis/snap')

  if (lenis.value && rootRef.value) {
    snap = new LenisSnap(lenis.value, {
      type: 'proximity',
      distanceThreshold: '15%',
      debounce: 300,
      onSnapStart: () => { isSnapping.value = true },
      onSnapComplete: () => {
        isSnapping.value = false
        if (SNAP_MODE === 'click')
          snap?.stop()
      },
    })

    snap.addElements(
      Array.from(rootRef.value.querySelectorAll<HTMLElement>('.cards-column__item')),
      { align: ['center'] },
    )

    if (SNAP_MODE === 'click')
      snap.stop()
  }

  ctx = gsap.context(() => {
    const cardItems = gsap.utils.toArray<HTMLElement>('.cards-column__item', rootRef.value)

    cardItems.forEach((item) => {
      const bg = item.querySelector<HTMLElement>('.cards-column__item-bg')
      const bgContent = item.querySelector<HTMLElement>('.cards-column__item-bg-content')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top-=12.5% center',
          end: 'bottom+=12.5% center',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(bg, { yPercent: -100 }, { yPercent: 100, ease: 'none' }, 0)
      tl.fromTo(bgContent, { yPercent: 100 }, { yPercent: -100, ease: 'none' }, 0)
    })
  }, rootRef.value ?? undefined)
})

onUnmounted(() => {
  snap?.destroy()
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" class="app-elements-cards-column" :class="{ 'is-snapping': isSnapping }">
    <div class="app-elements-cards-column__left">
      <TextsH3 v-if="heading" tag="h2" class="app-elements-cards-column__left-heading" color="beige-100">
        {{ heading }}
      </TextsH3>

      <div class="app-elements-cards-column__left-bottom">
        <TextsP1 v-if="subtext" color="beige-100">
          {{ subtext }}
        </TextsP1>
        <AtomsCTA v-if="settings?.contactLink?.text" theme="white" :to="settings.contactLink" :tiret-after="0">
          {{ settings.contactLink.text }}
        </AtomsCTA>
      </div>
    </div>

    <ol class="app-elements-cards-column__list">
      <li
        v-for="(item, index) in items"
        :key="item._key"
        class="cards-column__item"
        @click="snapToItem(index)"
      >
        <TextsH3 :selectable="false" class="cards-column__item-number" color="beige-100">
          {{ item.number }}
        </TextsH3>

        <div class="cards-column__item-content">
          <TextsH3 tag="span" :selectable="false" class="cards-column__item-title" color="beige-100">
            {{ item.title }}
          </TextsH3>
          <TextsP2 :selectable="false" class="cards-column__item-description" color="beige-100">
            {{ item.description }}
          </TextsP2>
        </div>

        <div aria-hidden="true" class="cards-column__item-bg">
          <div class="cards-column__item-bg-content">
            <TextsH3 :selectable="false" class="cards-column__item-number" color="black-100">
              {{ item.number }}
            </TextsH3>
            <div class="cards-column__item-content">
              <TextsH3 tag="span" :selectable="false" class="cards-column__item-title" color="black-100">
                {{ item.title }}
              </TextsH3>
              <TextsP2 :selectable="false" class="cards-column__item-description" color="black-100">
                {{ item.description }}
              </TextsP2>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss">
.app-elements-cards-column {
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: desktop-vw(40px);
  padding: desktop-vw(40px) desktop-vw(24px) desktop-vw(50px) desktop-vw(24px);
  background: var(--c-black-100);

  &__left {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    flex-shrink: 0;
    width: desktop-vw(656px);
    gap: desktop-vw(40px);
  }

  &__left-heading {
    flex: 1;
  }

  &__left-bottom {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);
    align-items: flex-start;

    .P1 {
      width: 65%;
    }
  }

  &__list {
    flex: 1;
    min-width: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    margin-top: desktop-vw(200px);
  }
}

.cards-column__item {
  display: flex;
  align-items: flex-start;
  padding: desktop-vw(32px) 0;
  position: relative;
  overflow: hidden;
  gap: desktop-vw(64px);
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--c-beige-100);
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: screen;
  }

  &-number {
    flex-shrink: 0;
    width: desktop-vw(72px);
  }

  &-content {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(20px);
    flex: 1;
    min-width: 0;
    padding-right: desktop-vw(120px);
  }

  &-bg {
    position: absolute;
    top: -3px;
    bottom: -3px;
    left: 0;
    right: 0;
    background: var(--c-beige);
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  &-bg-content {
    display: flex;
    align-items: flex-start;
    padding: desktop-vw(32px) 0;
    height: 100%;
    gap: desktop-vw(64px);

    .cards-column__item-content {
      padding-right: desktop-vw(120px);
    }
  }
}
</style>
