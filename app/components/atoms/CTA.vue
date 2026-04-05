<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
  },
})

const { to } = toRefs(props)

const textRef = useTemplateRef('textRef')

let split = null

onMounted(() => {
  // split = new SplitText(textRef.value.$el, {
  //   type: 'chars,lines',
  // })
})
</script>

<template>
  <UtilsBaseLink
    :to="to"
    class="app-atoms-cta"
  >
    <TextsCTA ref="textRef" :selectable="false">
      <slot />
    </TextsCTA>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-atoms-cta {
  display: inline-flex;
  padding: desktop-vw(25px) desktop-vw(35px) desktop-vw(25px) desktop-vw(35px);
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  background: var(--c-light-2);
  border-radius: 5px;

  @include mobile {
    padding: mobile-vw(20px) mobile-vw(35px) mobile-vw(20px) mobile-vw(35px);
  }

  &.active {
  }
}
</style>
