<script setup lang="ts">
// Colonne de gauche de la page Contact : titre de la « Demande générale » ou texte
// d'accueil du « Leasing professionnel ». Au changement d'onglet, le texte sortant
// monte et s'efface ligne par ligne, puis le texte entrant apparaît ligne par ligne
// depuis le bas, en même temps que le formulaire (useContactSwitchMotion). Pas de
// masque : les lignes bougent peu et se fondent. La hauteur de la colonne suit, pour
// que le formulaire ne saute pas sur mobile.
import type { ContactProfile } from '~/config/CONTACT_PRO_CONFIG'
import type { ContactProIntroData } from '~/queries/contact'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

interface Props {
  profile: ContactProfile
  heading?: string | null
  proIntro?: ContactProIntroData | null
}

defineProps<Props>()

const rootRef = ref<HTMLElement | null>(null)

const { motionAllowed, canAnimate, track, motion } = useContactSwitchMotion()
const leaveTotal = motion.leave.duration + motion.leave.stagger

// Animation en cours par élément (un clic rapide peut interrompre une entrée)
const running = new WeakMap<Element, { split?: SplitText, tween: gsap.core.Animation }>()
let heightTween: gsap.core.Tween | null = null
// Sortie sautée parce que la colonne était masquée
let leaveSkipped = false

// Blocs de texte à découper : les `.app-text` les plus externes, sans la copie
// `.sr-only` que les Texts* gardent pour les lecteurs d'écran (cf. useSplitTextAnimation).
function textTargets(el: Element) {
  return Array.from(el.querySelectorAll<HTMLElement>('.app-text')).filter((node) => {
    for (let parent = node.parentElement; parent && parent !== el; parent = parent.parentElement) {
      if (parent.classList.contains('sr-only') || parent.classList.contains('app-text'))
        return false
    }
    return true
  })
}

function stop(el: Element) {
  const current = running.get(el)
  if (!current)
    return
  current.tween.kill()
  current.split?.revert()
  running.delete(el)
}

// Découpe en lignes et lance l'animation dans `onSplit` (motif de la doc SplitText) :
// avec `autoSplit`, un changement de police ou de largeur pendant l'animation
// re-découpe le texte et resynchronise la tween retournée.
function animateLines(el: Element, animate: (lines: Element[]) => gsap.core.Tween) {
  track(() => SplitText.create(textTargets(el), {
    type: 'lines',
    linesClass: 'line',
    // Comme useSplitTextAnimation : les titres ont déjà leur copie `.sr-only`, et
    // `auto` poserait un aria-label sur un <span> (signalé par Lighthouse)
    aria: 'none',
    autoSplit: true,
    onSplit: (self) => {
      const tween = animate(self.lines)
      running.set(el, { split: self, tween })
      return tween
    },
  }))
}

function onLeave(el: Element, done: () => void) {
  stop(el)
  leaveSkipped = !canAnimate(el)
  if (leaveSkipped) {
    // Jamais de `done()` synchrone ici : en mode out-in, Vue re-rendrait la transition
    // en plein patch (erreur « reading 'parentNode' »)
    nextTick(done)
    return
  }
  // La colonne garde sa hauteur pendant l'échange (sinon elle s'effondre entre les deux textes)
  heightTween?.kill()
  if (rootRef.value)
    gsap.set(rootRef.value, { height: rootRef.value.offsetHeight })

  animateLines(el, lines => gsap.to(lines, {
    autoAlpha: 0,
    yPercent: motion.textLeaveY,
    duration: motion.leave.duration,
    ease: motion.leave.ease,
    stagger: { amount: motion.leave.stagger },
    onComplete: () => {
      running.delete(el)
      done()
    },
  }))
}

// Entrée ligne par ligne. La hauteur passe de celle du texte sortant à celle du
// nouveau dès l'échange (avant que les lignes ne soient visibles), puis revient à `auto`.
function reveal(el: HTMLElement, done: () => void, delay: number) {
  const root = rootRef.value
  if (root?.style.height) {
    heightTween?.kill()
    heightTween = track(() => gsap.to(root, {
      height: el.offsetHeight,
      ...motion.height,
      onComplete: () => {
        gsap.set(root, { clearProps: 'height' })
      },
    }))
  }

  animateLines(el, lines => gsap.fromTo(lines, { autoAlpha: 0, yPercent: motion.textEnterY }, {
    autoAlpha: 1,
    yPercent: 0,
    delay,
    duration: motion.enter.duration,
    ease: motion.enter.ease,
    stagger: { amount: motion.enter.stagger },
    onComplete: () => {
      // Texte rendu à son état naturel (doc SplitText : revert() une fois l'animation finie)
      running.get(el)?.split?.revert()
      running.delete(el)
      done()
    },
  }))
}

function onEnter(el: Element, done: () => void) {
  stop(el)
  if (canAnimate(el)) {
    reveal(el, done, motion.gap)
    return
  }

  if (rootRef.value)
    gsap.set(rootRef.value, { clearProps: 'height' })

  // Colonne masquée qui réapparaît avec la « Demande générale » (mobile, depuis les
  // étapes B–E) : la page ne l'affiche qu'une fois le formulaire sorti ; le texte
  // attend jusque-là, invisible
  if (leaveSkipped && motionAllowed() && el instanceof HTMLElement) {
    gsap.set(el, { autoAlpha: 0 })
    running.set(el, {
      tween: track(() => gsap.delayedCall(leaveTotal + motion.gap, () => {
        running.delete(el)
        gsap.set(el, { clearProps: 'opacity,visibility' })
        if (canAnimate(el))
          reveal(el, done, 0)
        else
          done()
      })),
    })
    return
  }

  done()
}
</script>

<template>
  <div ref="rootRef" class="page-contact-intro">
    <Transition :css="false" mode="out-in" @leave="onLeave" @enter="onEnter">
      <div v-if="profile === 'pro'" key="pro" class="page-contact-intro__pro">
        <TextsH3 v-if="proIntro?.heading" tag="h1" :animated="false">
          {{ proIntro.heading }}
        </TextsH3>
        <TextsP3 v-if="proIntro?.lead" weight="regular" class="page-contact-intro__lead">
          {{ proIntro.lead }}
        </TextsP3>
        <TextsP1 v-if="proIntro?.text" weight="regular" color="black-70">
          {{ proIntro.text }}
        </TextsP1>
      </div>
      <div v-else key="general" class="page-contact-intro__general">
        <TextsH2 v-if="heading" tag="h1" :animated="false">
          {{ heading }}
        </TextsH2>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
.page-contact-intro {
  &__pro {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(32px);
    max-width: desktop-vw(656px);
    white-space: pre-line;

    @include mobile {
      gap: mobile-vw(16px);
      max-width: none;
    }
  }

  // Desktop/Body/M/Regular ; Mobile/Body/L/Regular (20/26)
  &__lead {
    @include mobile {
      font-size: mobile-vw(20px);
      line-height: mobile-vw(26px);
    }
  }
}
</style>
