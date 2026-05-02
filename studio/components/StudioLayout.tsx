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
      <div
        style={{
          position: 'fixed',
          top: 8,
          right: 12,
          zIndex: 10000,
          padding: '4px 10px',
          borderRadius: 999,
          background: accent,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }}
      >
        {lang?.flag} {langId.toUpperCase()}
      </div>
      {props.renderDefault(props)}
    </>
  )
}
