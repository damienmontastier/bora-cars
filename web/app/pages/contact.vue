<script lang="ts" setup>
import type { ContactData } from '~/queries/contact'
import { CONTACT_QUERY } from '~/queries/contact'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<ContactData>(CONTACT_QUERY, params)
</script>

<template>
  <main v-menu-theme="'white'" class="page-contact">
    <div style="height: 50vh; width: 100%; display: flex; align-items: center; justify-content: center;background-color: red;">
      <h1 v-if="page?.heading" class="page-contact__heading">
        {{ page.heading }}
      </h1>
    </div>

    <AppFooter theme="black" />
  </main>
</template>

<style lang="scss">
.page-contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--c-beige-100);

  &__heading {
    font-size: desktop-vw(80px);

    @include mobile {
      font-size: mobile-vw(40px);
    }
  }
}
</style>
