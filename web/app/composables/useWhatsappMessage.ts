import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import type { SanityLink } from '~/queries/modules'

const WHATSAPP_HOST_RE = /^(?:[\w-]+\.)*(?:wa\.me|whatsapp\.com)$/i

const WHATSAPP_MESSAGE_KEY = Symbol('whatsapp-message') as InjectionKey<Ref<string | undefined>>

export function provideWhatsappMessage(message: MaybeRefOrGetter<string | undefined>) {
  const { url: siteUrl } = useSiteConfig()
  const route = useRoute()
  provide(WHATSAPP_MESSAGE_KEY, computed(() => {
    const template = toValue(message)?.trim()
    return template ? fillWhatsappTemplate(template, { url: `${siteUrl}${route.path}` }) : undefined
  }))
}

export function useWhatsappMessage(): Ref<string | undefined> {
  return inject(WHATSAPP_MESSAGE_KEY, ref<string | undefined>(undefined))
}

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

export function fillWhatsappTemplate(template: string, params: Record<string, string>): string {
  return template
    .replace(/€\s*(\{prix\})/g, '$1')
    .replace(/(\{prix\})\s*€/g, '$1')
    .replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '')
}

export function whatsappContactTo(link: SanityLink | undefined, message: string): SanityLink | string | undefined {
  if (!link || link.type !== 'external' || !link.url)
    return link
  const withText = withWhatsappText(link.url, message)
  return withText === link.url ? link : withText
}
