<script setup lang="ts">
import type { MediaBlockData } from '~/queries/modules'

interface Props {
  data: MediaBlockData
}

defineProps<Props>()

const settings = useSettings()
const rootRef = useTemplateRef<HTMLElement>('rootRef')
</script>

<template>
  <section ref="rootRef" v-menu-theme="'white'" class="app-elements-media-block">
    <div class="app-elements-media-block__background">
      <UtilsParallax
        v-if="data.media"
        class="app-elements-media-block__parallax"
        :trigger="rootRef"
        :speed="0.5"
        :scale="1.1"
      >
        <ElementsMedia
          v-if="data.media.mediaType === 'image'"
          :src="data.media.imageUrl"
          :alt="data.media.imageAlt ?? ''"
          provider="sanity"
          :hotspot="data.media.imageHotspot"
          :crop="data.media.imageCrop"
          :overlay="{ variant: 'panel', color: 'orange-100', duration: 0.5 }"
          sizes="sm:100vw xl:100vw"
        />
        <ElementsVideo
          v-else-if="data.media.mediaType === 'video' && data.media.videoUrl"
          class="app-elements-media-block__video"
          :src="data.media.videoUrl"
          :aria-label="data.media.videoAlt ?? ''"
        />
      </UtilsParallax>
    </div>

    <div class="app-elements-media-block__gradient" />

    <div class="app-elements-media-block__content">
      <div class="app-elements-media-block__titles">
        <TextsH2 v-if="data.heading" color="beige-100" :trigger="rootRef">
          {{ data.heading }}
        </TextsH2>
        <TextsH4 v-if="data.subheading" tag="p" color="beige-100" class="app-elements-media-block__subheading">
          {{ data.subheading }}
        </TextsH4>
      </div>

      <div v-if="data.text || (data.showCta && settings?.contactLink?.text)" class="app-elements-media-block__side">
        <TextsP2 v-if="data.text" color="beige-100" class="app-elements-media-block__text">
          {{ data.text }}
        </TextsP2>
        <AtomsCTA
          v-if="data.showCta && settings?.contactLink?.text"
          theme="orange"
          :to="settings.contactLink"
          :tracking-extra="{ source: 'media_block' }"
        >
          {{ settings.contactLink.text }}
        </AtomsCTA>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-media-block {
  position: relative;
  width: 100%;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  @include mobile {
    min-height: 85svh;
  }

  &__background {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__parallax,
  &__video {
    width: 100%;
    height: 100%;
  }

  &__gradient {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(12, 12, 10, 0) 35%, rgba(12, 12, 10, 0.75) 100%);
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: desktop-vw(72px);
    padding: desktop-vw(40px) desktop-vw(24px);

    @include mobile {
      flex-direction: column;
      align-items: stretch;
      gap: mobile-vw(32px);
      padding: mobile-vw(32px) mobile-vw(16px);
    }
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(16px);
    max-width: desktop-vw(1100px);

    @include mobile {
      gap: mobile-vw(12px);
      max-width: none;
    }
  }

  &__subheading {
    max-width: desktop-vw(720px);

    @include mobile {
      max-width: none;
    }
  }

  &__side {
    flex: 0 0 desktop-vw(310px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: desktop-vw(24px);

    @include mobile {
      flex: none;
      gap: mobile-vw(16px);
    }
  }
}
</style>
