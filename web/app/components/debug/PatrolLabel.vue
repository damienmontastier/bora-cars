<script lang="ts" setup>

</script>

<template>
  <TextsP1 tag="div" color="white" class="app-debug-patrol-label">
    <div class="label-key">
      <slot name="key" />
    </div>
    <div class="label-value">
      <slot name="value" />
    </div>
  </TextsP1>
</template>

<style lang="scss">
.app-debug-patrol-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background-color: var(--c-black);
  gap: 5px;
  font-size: desktop-vw(22px);
  line-height: desktop-vw(22px);

  .label-key {
    font-weight: bold;
  }

  .label-value {
    background-color: var(--c-white);
    padding: 5px;
    color: var(--c-black);
    border-radius: 3px;
    font-style: italic;
    font-weight: 900;
    font-size: desktop-vw(18px);
    line-height: desktop-vw(18px);

    select {
      appearance: auto;
      background-color: var(--c-white);
      color: var(--c-black);
      border: 1px solid var(--c-black);
      border-radius: 3px;
      padding: 2px 4px;
      cursor: pointer;
      font-style: italic;
      font-weight: 900;
      font-size: desktop-vw(18px);
    }
  }
}
</style>
