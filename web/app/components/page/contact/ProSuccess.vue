<script setup lang="ts">
// Écran de succès du parcours « Leasing professionnel » (maquette « Succès ») :
// confirmation à gauche, liens « restons en contact » à droite. Tous les textes et
// liens viennent du singleton Sanity `contact` (champ `proSuccess`).
import type { ContactProSuccessData } from '~/queries/contact'
import { useLenis } from 'lenis/vue'

interface Props {
  content?: ContactProSuccessData | null
  firstName?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: null,
  firstName: '',
})

const lenis = useLenis()
const titleRef = ref<HTMLElement | null>(null)

// Jeton {prenom} saisi dans le Studio. Le prénom est obligatoire dans le formulaire ;
// s'il manquait quand même, on retire le jeton plutôt que d'afficher « {prenom} ».
const text = computed(() => {
  const raw = props.content?.text ?? ''
  return props.firstName
    ? raw.replaceAll('{prenom}', props.firstName)
    : raw.replace(/\s*\{prenom\}/g, '')
})

// Instagram : sur mobile, tentative d'ouverture de l'appli puis repli sur le web
// (même logique que le prototype client).
function instagramUsername(url?: string | null) {
  if (!url)
    return null
  try {
    const parsed = new URL(url)
    if (!/(?:^|\.)instagram\.com$/i.test(parsed.hostname))
      return null
    return parsed.pathname.split('/').find(Boolean) ?? null
  }
  catch {
    return null
  }
}

function onInstagramClick(event: MouseEvent) {
  const web = props.content?.instagram?.url
  const user = instagramUsername(web)
  if (!web || !user || !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    return
  event.preventDefault()
  const start = Date.now()
  window.location.href = `instagram://user?username=${encodeURIComponent(user)}`
  // L'appli n'a pas pris la main (~800 ms) → on ouvre le profil web
  window.setTimeout(() => {
    if (Date.now() - start < 1500)
      window.open(web, '_blank', 'noopener')
  }, 800)
}

onMounted(() => {
  // Le formulaire disparaît : on remonte en haut de page et on annonce la confirmation
  lenis.value?.scrollTo(0, { duration: 1.2 })
  titleRef.value?.focus({ preventScroll: true })
})
</script>

<template>
  <div class="page-contact-pro-success">
    <div class="page-contact-pro-success__heading">
      <TextsLabel v-if="content?.kicker" color="orange-100">
        {{ content.kicker }}
      </TextsLabel>
      <h1
        v-if="content?.title"
        ref="titleRef"
        class="page-contact-pro-success__title H2"
        tabindex="-1"
      >
        {{ content.title }}
      </h1>
      <TextsP3 v-if="text" weight="regular" class="page-contact-pro-success__text">
        {{ text }}
      </TextsP3>
    </div>

    <div class="page-contact-pro-success__links">
      <TextsLabel v-if="content?.linksTitle" color="black-70">
        {{ content.linksTitle }}
      </TextsLabel>
      <AtomsLinkCard
        v-if="content?.whatsapp?.url && content.whatsapp.title"
        :to="content.whatsapp.url"
        :title="content.whatsapp.title"
        :subtitle="content.whatsapp.subtitle ?? undefined"
        :tracking-extra="{ source: 'contact_pro_success' }"
      />
      <AtomsLinkCard
        v-if="content?.instagram?.url && content.instagram.title"
        :to="content.instagram.url"
        :title="content.instagram.title"
        :subtitle="content.instagram.subtitle ?? undefined"
        :tracking-extra="{ source: 'contact_pro_success' }"
        variant="secondary"
        @click="onInstagramClick"
      />
    </div>
  </div>
</template>

<style lang="scss">
.page-contact-pro-success {
  display: flex;
  align-items: flex-start;
  gap: desktop-vw(80px);
  width: 100%;

  @include mobile {
    flex-direction: column;
    gap: mobile-vw(40px);
  }

  &__heading {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: desktop-vw(32px);
    min-width: 0;

    @include mobile {
      gap: mobile-vw(16px);
    }
  }

  &__title {
    max-width: desktop-vw(656px);
    color: var(--c-black-100);
    outline: none;

    @include mobile {
      max-width: none;
    }
  }

  // Desktop/Body/M/Regular ; Mobile/Body/L/Regular (20/26)
  &__text {
    max-width: desktop-vw(656px);

    @include mobile {
      max-width: none;
      font-size: mobile-vw(20px);
      line-height: mobile-vw(26px);
    }
  }

  &__links {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: desktop-vw(12px);
    min-width: 0;
    padding-top: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(8px);
      padding-top: 0;
    }
  }
}
</style>
