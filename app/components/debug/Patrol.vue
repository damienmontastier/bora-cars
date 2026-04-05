<script lang="ts" setup>
import { onClickOutside, onKeyStroke, useCssVar, useMagicKeys } from '@vueuse/core'

const gridColor = ref('red-2')
const isVisible = ref(false)

const itemsRef = useTemplateRef<HTMLElement>('items')

const patrolItems = reactive({
  grid: false,
  statesInfo: false,
})

const cssRawLayoutColumnsCount = useCssVar('--layout-columns-count')

const layoutColumnsCount = computed(() => Number(cssRawLayoutColumnsCount.value))

const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)

const webGLStore = useWebGLStore()
const { cameraType, scenes } = toRefs(webGLStore)

useMagicKeys({
  passive: false,
  onEventFired: (e) => {
    // Toggle debug panel
    if (
      (e.key === 'o' || e.key === 'O')
      && (e.ctrlKey || e.metaKey)
      && e.type === 'keydown'
    ) {
      e.preventDefault()
      isVisible.value = !isVisible.value
    }

    // Toggle grid debug
    if (
      (e.key === 'g' || e.key === 'G')
      && (e.ctrlKey || e.metaKey)
      && e.type === 'keydown'
    ) {
      e.preventDefault()
      patrolItems.grid = !patrolItems.grid
    }

    // Toggle states info
    if (
      (e.key === 'i' || e.key === 'I')
      && (e.ctrlKey || e.metaKey)
      && e.type === 'keydown'
    ) {
      e.preventDefault()
      patrolItems.statesInfo = !patrolItems.statesInfo
    }
  },
})

onKeyStroke('Escape', () => {
  if (isVisible.value) {
    isVisible.value = false
  }
}, { dedupe: true })

onClickOutside(itemsRef, () => {
  if (isVisible.value) {
    isVisible.value = false
  }
})
</script>

<template>
  <div :class="{ hide: !isVisible }" class="app-debug-patrol">
    <!-- ITEMS -->
    <div ref="items" :class="{ hide: !isVisible }" class="app-debug-patrol__items">
      <div :class="{ active: patrolItems.grid }" class="app-debug-patrol__item grid-item " @click="patrolItems.grid = !patrolItems.grid">
        #️⃣
      </div>
      <div :class="{ active: patrolItems.statesInfo }" class="app-debug-patrol__item states-info-item" @click="patrolItems.statesInfo = !patrolItems.statesInfo">
        🗂️
      </div>
    </div>

    <!-- BACKGROUND -->
    <div :class="{ hide: !isVisible }" class="app-debug-patrol__background" />

    <!-- GRID OVERLAY -->
    <div v-if="patrolItems.grid" class="app-debug-patrol__grid-overlay grid-inner">
      <span v-for="n in layoutColumnsCount" :key="n" class="grid-item" :style="{ background: `var(--c-${gridColor})` }" />
    </div>

    <!-- STATES INFO -->
    <div v-if="patrolItems.statesInfo" class="app-debug-patrol__states-info">
      <div class="app-debug-patrol__states-info__block">
        <TextsP1 color="black" class="app-debug-patrol__states-info__block__title">
          App <br>
          <!-- <button @click="cameraType = 'defaultbis'">
            defaultbis
          </button> <br>
          <button @click="cameraType = 'default'">
            default
          </button> -->
        </TextsP1>

        <div class="app-debug-patrol__states-info__block__items">
          <DebugPatrolLabel>
            <template #key>
              fontsLoaded
            </template>
            <template #value>
              {{ fontsLoaded }}
            </template>
          </DebugPatrolLabel>
        </div>
      </div>
      <div class="app-debug-patrol__states-info__block">
        <TextsP1 color="black" class="app-debug-patrol__states-info__block__title">
          WebGL
        </TextsP1>

        <div class="app-debug-patrol__states-info__block__items">
          <DebugPatrolLabel v-for="(value, key, index) in scenes" :key="`${key}-${index}`">
            <template #key>
              {{ key }}
            </template>
            <template #value>
              {{ value }}
            </template>
          </DebugPatrolLabel>

          <DebugPatrolLabel>
            <template #key>
              cameraType
            </template>
            <template #value>
              {{ cameraType }}
            </template>
          </DebugPatrolLabel>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-debug-patrol {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  pointer-events: none;

  &__items {
    display: flex;
    flex-direction: row;
    gap: 5px;
    z-index: 3;
    position: relative;
    background: var(--c-white);
    border: 1px solid var(--c-black);
    border-radius: 5px;
    padding: 5px;
    transition:
      transform 0.2s var(--ease-out-cubic) 0s,
      opacity 0.2s var(--ease-out-cubic) 0s;
    // top: 50%;
    // left: 50%;
    // transform: translate(-50%, -50%);
    pointer-events: auto;

    &.hide {
      opacity: 0;
      transform: scale(0.9);
      pointer-events: none;
    }
  }

  &__item {
    font-size: 60px;
    line-height: 60px;
    cursor: pointer;
    padding: 10px;
    user-select: none;

    &.active {
      background-image: linear-gradient(
        45deg,
        #000000 25%,
        #ffffff 25%,
        #ffffff 50%,
        #000000 50%,
        #000000 75%,
        #ffffff 75%,
        #ffffff 100%
      );
      background-size: 40px 40px;
    }
  }

  &__background {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0%;
    left: 0%;
    background-color: color-mix(in oklab, var(--c-black) 30%, transparent);
    backdrop-filter: blur(2px);
    transition: opacity 0.2s var(--ease-out-cubic) 0s;
    cursor: no-drop;
    pointer-events: auto;

    &.hide {
      opacity: 0;
      transition-delay: 0.15s;
      pointer-events: none;
    }
  }

  &__grid-overlay {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    top: 0%;
    left: 0%;

    span {
      opacity: 0.25;
    }
  }

  &__states-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 50%;
    background-color: color-mix(in oklab, black 70%, transparent);
    backdrop-filter: blur(2px);
    padding: 15px 10px;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 5px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    flex-flow: row wrap;
  }

  &__states-info__block {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: white;
    padding: 10px;
    border-radius: 5px;
    user-select: none;

    &__title {
      font-size: desktop-vw(22px);
      line-height: desktop-vw(22px);
    }

    &__items {
      display: flex;
      flex-direction: row;
      gap: 5px;
    }
  }
}
</style>
