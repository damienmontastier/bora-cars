<script lang="ts" setup>
import type { ContactData } from '~/queries/contact'
import { CONTACT_QUERY } from '~/queries/contact'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<ContactData>(CONTACT_QUERY, params)

usePageSeo(computed(() => page.value?.seo))

useMenuCtaSnap()
</script>

<template>
  <main v-menu-theme="'black'" class="page-contact">
    <section class="page-contact__hero">
      <div class="page-contact__grid">
        <div class="page-contact__heading">
          <TextsH2 v-if="page?.heading" :animated="false">
            {{ page.heading }}
          </TextsH2>
        </div>

        <div class="page-contact__form">
          <ElementsContactForm
            :subject-options="page?.subjectOptions"
            :submit-label="page?.submitLabel"
          />
        </div>
      </div>
    </section>

    <ElementsPartners theme="orange" />
    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-contact {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--c-beige-100);

  &__hero {
    width: 100%;
    padding: desktop-vw(165px) desktop-vw(24px) desktop-vw(120px);

    @include mobile {
      padding: mobile-vw(100px) mobile-vw(16px) mobile-vw(80px);
    }
  }

  &__grid {
    display: flex;
    align-items: flex-start;
    gap: desktop-vw(80px);
    width: 100%;

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(48px);
    }
  }

  &__heading {
    flex: 1 0 0;
    min-width: 0;

    .H1 {
      max-width: desktop-vw(656px);
      white-space: pre-line;

      @include mobile {
        max-width: none;
      }
    }
  }

  &__form {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    justify-content: flex-end;

    @include mobile {
      width: 100%;
    }
  }
}
</style>
