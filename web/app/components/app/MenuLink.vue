<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
  },
})

const { to } = toRefs(props)
</script>

<template>
  <TextsP1 tag="li" class="app-menu-link">
    <UtilsBaseLink
      :to="to"
    >
      <slot />
    </UtilsBaseLink>
  </TextsP1>
</template>

<style lang="scss">
.app-menu-link {
  display: inline-flex;
  font-size: desktop-vw(28px);
  line-height: desktop-vw(28px);
  align-items: center;
  transition: transform 0.25s var(--ease-out-cubic);
  align-self: flex-start;
  cursor: pointer;

  @include hover {
    &:hover {
      transform: translateX(5px);
    }
  }

  &::before {
    content: '';
    display: inline-block;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 5px solid var(--c-black);
    margin-right: 5px;
  }
}
</style>
