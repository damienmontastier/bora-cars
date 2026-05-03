<script setup lang="ts">
interface Props {
  theme?: 'white' | 'black' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'black',
})

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const themeTextColor = computed(() => ({
  white: 'beige-100',
  black: 'black-100',
  orange: 'orange-100',
}[props.theme]))
</script>

<template>
  <div class="app-switch-langue" :class="`app-switch-langue--${theme}`">
    <template v-for="(loc, i) in locales" :key="loc.code">
      <NuxtLink
        :to="switchLocalePath(loc.code)"
        class="app-switch-langue__item"
        :class="{ 'is-active': locale === loc.code }"
      >
        <TextsCTA :color="themeTextColor">
          {{ loc.code.toUpperCase() }}
        </TextsCTA>
      </NuxtLink>
      <span
        v-if="i < locales.length - 1"
        class="app-switch-langue__divider"
        :style="{ background: `var(--c-${themeTextColor})` }"
      />
    </template>
  </div>
</template>

<style lang="scss">
.app-switch-langue {
  display: inline-flex;
  align-items: center;
  gap: desktop-vw(10px);

  &__item {
    display: inline-flex;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.35s var(--ease-out-cubic);

    &.is-active {
      opacity: 1;
    }

    @include hover {
      &:hover {
        opacity: 1;
      }
    }
  }

  &__divider {
    display: inline-block;
    width: 1px;
    height: desktop-vw(12px);
    opacity: 0.4;
  }
}
</style>
