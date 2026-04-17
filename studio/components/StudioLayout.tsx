import type { LayoutProps } from 'sanity'

const STYLES = `
  /* Internationalized array — visual treatment for the read-only "reference" language row.
     Targets cards containing only disabled inputs/textareas (= locked language in the current workspace). */
  [data-ui="Card"]:has(> [data-ui="Flex"] [data-ui="TextInput"] input:disabled),
  [data-ui="Card"]:has(> [data-ui="Flex"] textarea:disabled),
  [data-ui="Card"]:has(> [data-ui="Flex"] [data-read-only="true"]) {
    opacity: 0.7;
    border-left: 2px solid var(--card-border-color, rgba(255, 255, 255, 0.15));
    padding-left: 10px !important;
    margin-top: 4px;
    background: var(--card-muted-bg-color, rgba(255, 255, 255, 0.02));
    border-radius: 3px;
    transition: opacity 0.15s ease;
  }

  [data-ui="Card"]:has(> [data-ui="Flex"] [data-ui="TextInput"] input:disabled):hover,
  [data-ui="Card"]:has(> [data-ui="Flex"] textarea:disabled):hover {
    opacity: 1;
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
