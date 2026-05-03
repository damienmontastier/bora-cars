import type { PreviewProps } from 'sanity'

type LabelEntry = { language: string; value: string }

export function NavLinkPreview(props: PreviewProps & { label?: LabelEntry[] }) {
  const lang =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? 'en' : 'fr'

  const entries = props.label ?? []
  const title =
    entries.find(e => e.language === lang)?.value ??
    entries.find(e => e.language === 'fr')?.value ??
    'Lien sans label'

  return props.renderDefault({ ...props, title })
}
