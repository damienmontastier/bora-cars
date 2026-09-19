<script setup lang="ts">
interface Props {
  to: string
  title: string
  subtitle?: string
  variant?: 'primary' | 'secondary'
  trackingExtra?: Record<string, unknown>
}

withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  variant: 'primary',
  trackingExtra: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <UtilsBaseLink
    :to="to"
    class="app-atoms-link-card"
    :class="`app-atoms-link-card--${variant}`"
    :tracking-extra="trackingExtra"
    @click="emit('click', $event)"
  >
    <span class="app-atoms-link-card__text">
      <span class="app-atoms-link-card__title P1">{{ title }}</span>
      <span v-if="subtitle" class="app-atoms-link-card__subtitle P2 regular-text">{{ subtitle }}</span>
    </span>
    <span class="app-atoms-link-card__icon" aria-hidden="true">
      <SvgIconLinkArrow color="beige-100" />
    </span>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-atoms-link-card {
  display: flex;
  align-items: center;
  gap: desktop-vw(16px);
  width: 100%;
  padding: desktop-vw(24px) desktop-vw(28px);
  border: 1px solid transparent;
  border-radius: 4px;
  text-align: left;
  text-decoration: none;
  transition:
    background-color 0.3s var(--ease-out-cubic),
    border-color 0.3s var(--ease-out-cubic);

  @include mobile {
    gap: mobile-vw(16px);
    padding: mobile-vw(16px);
  }

  &:focus-visible {
    outline: 2px solid var(--c-black-100);
    outline-offset: 2px;
  }

  &__text {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: desktop-vw(4px);
    min-width: 0;

    @include mobile {
      gap: mobile-vw(4px);
    }
  }

  &__title {
    @include mobile {
      font-size: mobile-vw(18px);
      line-height: mobile-vw(22px);
    }
  }

  &__icon {
    flex: 0 0 auto;
    width: desktop-vw(30px);
    height: desktop-vw(30px);
    transition: transform 0.3s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(30px);
      height: mobile-vw(30px);
    }
  }

  &--primary {
    background: var(--c-orange-100);
    color: var(--c-beige-100);

    @include hover {
      &:hover {
        background: var(--c-black-100);
      }
    }
  }

  &--secondary {
    border-color: var(--c-black-20);
    color: var(--c-black-100);

    .app-atoms-link-card__subtitle {
      color: var(--c-black-70);
    }

    @include hover {
      &:hover {
        border-color: var(--c-black-100);
        background: var(--c-black-10);
      }
    }
  }

  @include hover {
    &:hover &__icon {
      transform: translateX(desktop-vw(4px));
    }
  }
}
</style>
