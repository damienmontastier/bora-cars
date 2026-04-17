import type { LayoutProps } from 'sanity'

const STYLES = `
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
`

export function StudioLayout(props: LayoutProps) {
  return (
    <>
      <style>{STYLES}</style>
      {props.renderDefault(props)}
    </>
  )
}
