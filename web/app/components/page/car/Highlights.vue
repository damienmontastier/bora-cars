<script setup lang="ts">
const props = defineProps<{
  puissance?: number
  acceleration?: number
}>()

const formattedAcceleration = computed(() => {
  const a = props.acceleration
  if (a == null)
    return null
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(a)
})

const hasContent = computed(() => !!props.puissance || formattedAcceleration.value != null)
</script>

<template>
  <div v-if="hasContent" class="car-highlights">
    <div v-if="puissance" class="car-highlights__item">
      <div class="car-highlights__value">
        <TextsH2 tag="span">
          {{ puissance }}
        </TextsH2>
        <TextsH3 tag="span">
          ch
        </TextsH3>
      </div>
      <TextsP2 class="car-highlights__label">
        Puissance (ch)
      </TextsP2>
    </div>
    <div v-if="formattedAcceleration" class="car-highlights__item">
      <div class="car-highlights__value">
        <TextsH2 tag="span">
          {{ formattedAcceleration }}
        </TextsH2>
        <TextsH3 tag="span">
          sec
        </TextsH3>
      </div>
      <TextsP2 class="car-highlights__label">
        Accélération de 0 à 100 km/h
      </TextsP2>
    </div>
  </div>
</template>

<style lang="scss">
.car-highlights {
  display: flex;
  gap: desktop-vw(32px);
  width: 100%;

  @include mobile {
    gap: mobile-vw(24px);
  }

  &__item {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(16px);
    color: var(--c-black-100);

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__label {
    color: var(--c-black-100);
  }
}
</style>
