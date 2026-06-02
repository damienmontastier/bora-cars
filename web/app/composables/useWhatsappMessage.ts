import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'

// wa.me / whatsapp.com (et sous-domaines) — même règle que BaseLink / Pricing.
const WHATSAPP_HOST_RE = /^(?:[\w-]+\.)*(?:wa\.me|whatsapp\.com)$/i

const WHATSAPP_MESSAGE_KEY = Symbol('whatsapp-message') as InjectionKey<Ref<string | undefined>>

/**
 * À appeler une fois dans le `setup` d'une page pour définir le message
 * pré-rempli de TOUS les CTA WhatsApp rendus dans cette page (Hero, CardsColumn,
 * Pitch, BrandsSection…). L'injection réelle se fait dans `BaseLink`, point de
 * passage unique de tous les liens — les composants n'ont rien à changer.
 *
 * Le menu et la homepage n'appellent pas cette fonction → leurs CTA WhatsApp
 * gardent un message vierge.
 */
export function provideWhatsappMessage(message: MaybeRefOrGetter<string | undefined>) {
  provide(WHATSAPP_MESSAGE_KEY, toRef(message))
}

/**
 * Message WhatsApp de la page courante (`undefined` hors d'une page qui en
 * fournit un). Réactif : suit le changement de langue.
 */
export function useWhatsappMessage(): Ref<string | undefined> {
  return inject(WHATSAPP_MESSAGE_KEY, ref<string | undefined>(undefined))
}

/**
 * Injecte `?text=<message>` dans une URL WhatsApp (wa.me / whatsapp.com).
 * No-op si `url` n'est pas une URL WhatsApp, ou si `message` est vide.
 */
export function withWhatsappText(url: string | undefined, message?: string): string | undefined {
  if (!url || !message)
    return url

  let parsed: URL
  try {
    parsed = new URL(url)
  }
  catch {
    return url
  }

  if (!WHATSAPP_HOST_RE.test(parsed.hostname))
    return url

  parsed.searchParams.set('text', message)
  return parsed.toString()
}
