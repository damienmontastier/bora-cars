<script lang="ts" setup>
import type { LegalPageData } from '~/queries/legal'
import { LEGAL_PAGE_QUERY } from '~/queries/legal'
import { getPortableTextComponents } from '~/utils/portableText'

const route = useRoute()
const lang = useSanityLang()
const { t, locale } = useI18n()

const params = reactive({ lang: lang.value, uid: route.params.slug as string })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<LegalPageData>(LEGAL_PAGE_QUERY, params)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: t('legal.notFound') })
}

usePageSeo(computed(() => page.value?.seo))
useMenuCtaSnap()

const portableTextComponents = computed(() => getPortableTextComponents({ color: 'black-100' }))

const lastUpdatedLabel = computed(() => {
  if (!page.value?.updatedAt)
    return null
  const date = new Date(page.value.updatedAt)
  if (Number.isNaN(date.getTime()))
    return null
  const formatted = new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(date)
  return t('legal.lastUpdated', { date: formatted })
})
</script>

<template>
  <main v-menu-theme="'black'" class="page-legal">
    <header class="page-legal__header">
      <TextsLabel
        v-if="lastUpdatedLabel"
        class="page-legal__last-updated"
        :selectable="false"
      >
        {{ lastUpdatedLabel }}
      </TextsLabel>

      <TextsH2 v-if="page?.title" tag="h1" class="page-legal__title" :animated="false">
        {{ page.title }}
      </TextsH2>
    </header>

    <section v-if="page?.content?.length" class="page-legal__body">
      <SanityContent :value="page.content" :components="portableTextComponents" />
    </section>

    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-legal {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--c-beige-100);

  &__header {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(16px);
    width: 100%;
    max-width: desktop-vw(720px);
    margin: 0 auto;
    padding: desktop-vw(165px) 0 desktop-vw(24px);

    @include mobile {
      max-width: none;
      gap: mobile-vw(12px);
      padding: mobile-vw(100px) mobile-vw(16px) mobile-vw(16px);
    }
  }

  &__last-updated {
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  &__title {
    width: 100%;
  }

  &__body {
    width: 100%;
    max-width: desktop-vw(720px);
    margin: 0 auto;
    padding: desktop-vw(24px) 0 desktop-vw(80px);
    color: var(--c-black-100);

    @include mobile {
      max-width: none;
      padding: mobile-vw(16px) mobile-vw(16px) mobile-vw(64px);
    }

    > * + * {
      margin-top: desktop-vw(22px);

      @include mobile {
        margin-top: mobile-vw(18px);
      }
    }

    > .H3,
    > .H3 + * {
      margin-top: desktop-vw(40px);

      @include mobile {
        margin-top: mobile-vw(28px);
      }
    }

    strong {
      font-family: var(--font-haas-grot-disp-bold);
      font-weight: 700;
    }

    u {
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }

    .portable-list {
      padding-left: desktop-vw(28px);

      @include mobile {
        padding-left: mobile-vw(20px);
      }

      &--bullet {
        list-style: disc outside;
      }

      &--number {
        list-style: decimal outside;
      }

      &__item::marker {
        color: currentColor;
      }
    }
  }
}
</style>
