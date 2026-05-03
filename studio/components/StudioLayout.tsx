import type { LayoutProps } from 'sanity'
import { useWorkspace } from 'sanity'
import { LANGUAGES, type LanguageId } from '../../shared/languages'

const ACCENT: Record<LanguageId, string> = {
  fr: '#1d4ed8',
  en: '#b91c1c',
}

export function StudioLayout(props: LayoutProps) {
  const workspace = useWorkspace()
  const langId = workspace.basePath.replace(/^\//, '') as LanguageId
  const lang = LANGUAGES.find((l) => l.id === langId)
  const accent = ACCENT[langId] ?? '#666'

  const styles = `
    /* Internationalized array — turn the per-language label (FR / EN above each input)
       into a small pill-style badge so it reads as a language indicator, not a field title. */
    [data-ui="Card"] > [data-ui="Flex"] [data-ui="Stack"] > [data-ui="Box"]:first-child [data-ui="Label"],
    [data-ui="Card"] [data-ui="Stack"] > div:first-child > [data-ui="Label"] {
      display: inline-block;
      padding: 2px 8px;
      border: 1px solid var(--card-border-color, rgba(255, 255, 255, 0.15));
      border-radius: 999px;
      background: var(--card-muted-bg-color, rgba(255, 255, 255, 0.04));
      font-size: 10px;
      letter-spacing: 0.08em;
      font-weight: 600;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    /* Workspace language accent — top stripe + corner badge for instant visual id */
    body {
      box-shadow: inset 0 4px 0 0 ${accent};
    }
  `

  return (
    <>
      <style>{styles}</style>
      {props.renderDefault(props)}
    </>
  )
}
