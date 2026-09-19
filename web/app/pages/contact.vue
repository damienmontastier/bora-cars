<script lang="ts" setup>
import type { ContactProfile } from '~/config/CONTACT_PRO_CONFIG'
import type { ContactData } from '~/queries/contact'
import { CONTACT_PROFILE_QUERY } from '~/config/CONTACT_PRO_CONFIG'
import { CONTACT_QUERY } from '~/queries/contact'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<ContactData>(CONTACT_QUERY, params)

usePageSeo(computed(() => page.value?.seo))

useMenuCtaSnap()

// Onglet affiché, piloté par le lien direct `?profil=pro`. En prod la page est
// prérendue sans query : Nuxt (≥ 4.4) hydrate sur la route du payload puis restaure
// la vraie query — la lire au setup + la surveiller évite toute erreur d'hydratation
// (même principe que useCatalogueListing).
const route = useRoute()

function parseProfile(value: unknown): ContactProfile {
  return value === 'pro' ? 'pro' : 'general'
}

const profile = ref<ContactProfile>(parseProfile(route.query[CONTACT_PROFILE_QUERY]))
// Parcours réellement affiché par le formulaire : rejoint `profile` après l'animation de sortie
const shownProfile = ref<ContactProfile>(profile.value)
const proStep = ref(0)

watch(() => route.query[CONTACT_PROFILE_QUERY], (value) => {
  profile.value = parseProfile(value)
})

// Changer d'onglet met l'URL à jour (lien partageable, rechargement fidèle), sans
// nouvelle entrée d'historique ni remontage de la page (la query ne fait pas partie
// de la clé de page).
watch(profile, (value) => {
  if (parseProfile(route.query[CONTACT_PROFILE_QUERY]) === value)
    return
  const query = { ...route.query }
  if (value === 'pro')
    query[CONTACT_PROFILE_QUERY] = 'pro'
  else
    delete query[CONTACT_PROFILE_QUERY]
  navigateTo({ query }, { replace: true })
})

// Dossier pro envoyé : l'écran de succès remplace la page (prénom pour « Merci {prenom} »)
const proSuccessName = ref<string | null>(null)

function onProSuccess(firstName: string) {
  proSuccessName.value = firstName
}
</script>

<template>
  <main
    v-menu-theme="'black'"
    class="page-contact"
    :class="{ 'page-contact--pro-next-steps': shownProfile === 'pro' && proStep > 0 }"
  >
    <section class="page-contact__hero">
      <PageContactProSuccess
        v-if="proSuccessName !== null"
        :content="page?.proSuccess"
        :first-name="proSuccessName"
      />

      <div v-else class="page-contact__grid">
        <PageContactIntro
          class="page-contact__heading"
          :profile="profile"
          :heading="page?.heading"
          :pro-intro="page?.proIntro"
        />

        <div class="page-contact__form">
          <ElementsContactForm
            v-model:profile="profile"
            v-model:shown-profile="shownProfile"
            v-model:pro-step="proStep"
            :subject-options="page?.subjectOptions"
            :submit-label="page?.submitLabel"
            @pro-success="onProSuccess"
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

    // En colonne, une base à 0 ferait ignorer la hauteur animée par PageContactIntro
    @include mobile {
      flex: 0 0 auto;
    }

    .H1 {
      max-width: desktop-vw(656px);
      white-space: pre-line;

      @include mobile {
        max-width: none;
      }
    }
  }

  // Mobile : le texte d'accueil pro n'est affiché qu'à l'étape (A), comme dans le
  // prototype, pour que les étapes suivantes commencent en haut de l'écran.
  &--pro-next-steps &__heading {
    @include mobile {
      display: none;
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
