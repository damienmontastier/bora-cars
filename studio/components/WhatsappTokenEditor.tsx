import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { set, unset } from 'sanity'
import type { ArrayOfObjectsInputProps, InputProps, ObjectInputProps, Path, RenderInputCallback, StringInputProps } from 'sanity'
import { Card, Flex, Stack, Text } from '@sanity/ui'
import type { DescribeToken } from './whatsappTokenDom'
import {
  caretRect,
  endRange,
  hasRawTokens,
  insertTextAt,
  insertTokenAt,
  isAdjacentTo,
  isTokenNode,
  normalizeEditor,
  rangeFromPoint,
  removeTokenNode,
  renderTemplate,
  serializeEditor,
} from './whatsappTokenDom'

export interface WhatsappVariable {
  name: string
  label: string
  description: string
}

const MARQUE: WhatsappVariable = { name: 'marque', label: 'Marque', description: 'Marque de la voiture (ex. Porsche).' }
const MODELE: WhatsappVariable = { name: 'modele', label: 'Modèle', description: 'Modèle de la voiture (ex. 911 Carrera).' }
const PRIX: WhatsappVariable = { name: 'prix', label: 'Prix', description: 'Montant AVEC la devise (« 900 € »), vide si pas de prix : n’ajoute pas de €.' }
const PERIODE: WhatsappVariable = { name: 'periode', label: 'Période', description: '« par jour » ou « par mois ».' }

export const CAR_VARIABLES: WhatsappVariable[] = [
  MARQUE,
  MODELE,
  PRIX,
  PERIODE,
  { name: 'duree', label: 'Durée', description: 'Durée choisie par le client dans le bloc tarif (ex. 24h).' },
  { name: 'quand', label: 'Quand', description: '« Quand » choisi par le client dans le bloc tarif (ex. ce week-end).' },
  { name: 'url', label: 'Lien fiche', description: 'Lien complet de la fiche voiture.' },
]

export const BIO_VARIABLES: WhatsappVariable[] = [
  MARQUE,
  MODELE,
  PRIX,
  PERIODE,
  { name: 'url', label: 'Lien fiche', description: 'Lien complet de la fiche de la voiture de la story.' },
]

export const PAGE_VARIABLES: WhatsappVariable[] = [
  { name: 'url', label: 'Lien de la page', description: 'Lien complet de la page d’où part le message : tu sais d’où vient le contact.' },
]

export type TokenWarnings = Record<string, string>

const CSS = `
.wa-editor { position: relative; }
.wa-editor__input {
  box-sizing: border-box;
  min-height: 5.5em;
  padding: 10px 12px;
  border: 1px solid var(--card-border-color);
  border-radius: 3px;
  background: var(--card-bg-color);
  color: var(--card-fg-color);
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
  cursor: text;
}
.wa-editor__input:focus { border-color: var(--card-focus-ring-color); box-shadow: inset 0 0 0 1px var(--card-focus-ring-color); }
.wa-editor[data-dragover] .wa-editor__input { border-color: var(--card-focus-ring-color); border-style: dashed; }
.wa-editor[data-readonly] .wa-editor__input { cursor: default; opacity: .8; }
.wa-editor__placeholder {
  position: absolute; top: 11px; left: 13px; right: 13px;
  color: var(--card-muted-fg-color); pointer-events: none; line-height: 1.9;
}
.wa-editor__caret {
  position: absolute; top: 0; left: 0; width: 2px; border-radius: 1px;
  background: var(--card-focus-ring-color); pointer-events: none; display: none;
}
.wa-token {
  --wa-tone: #2276fc;
  display: inline-block;
  margin: 0 1px;
  padding: 0 4px 0 8px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--wa-tone) 45%, transparent);
  background: color-mix(in srgb, var(--wa-tone) 14%, transparent);
  color: var(--wa-tone);
  font: inherit;
  font-size: .86em;
  font-weight: 600;
  line-height: 1.55;
  white-space: nowrap;
  vertical-align: baseline;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.wa-token[data-tone="warning"] { --wa-tone: #d97706; }
.wa-token[data-tone="unknown"] { --wa-tone: #8b5cf6; }
.wa-token.is-dragging { opacity: .35; }
.wa-token__remove {
  display: inline-block; margin-left: 3px; padding: 0 4px; border-radius: 999px;
  opacity: .5; cursor: pointer; font-weight: 400;
}
.wa-token__remove:hover { opacity: 1; background: color-mix(in srgb, var(--wa-tone) 22%, transparent); }
.wa-editor[data-readonly] .wa-token { cursor: default; }
.wa-editor[data-readonly] .wa-token__remove { display: none; }
button.wa-token { padding-right: 8px; }
button.wa-token:disabled { cursor: not-allowed; opacity: .5; }
button.wa-token:focus-visible { outline: 2px solid var(--card-focus-ring-color); outline-offset: 1px; }
.wa-token--ghost {
  position: fixed; left: 0; top: 0; z-index: 100000; margin: 0; padding-right: 8px;
  pointer-events: none;
  background: color-mix(in srgb, var(--wa-tone) 14%, #fff);
  box-shadow: 0 6px 16px rgba(0, 0, 0, .2);
}
html.wa-dragging, html.wa-dragging * { cursor: grabbing !important; user-select: none !important; -webkit-user-select: none !important; }
`

interface EditorHandle {
  root: HTMLElement
  insertToken: (name: string) => void
  dropToken: (name: string, x: number, y: number, moving?: HTMLElement) => void
  showDropCaret: (x: number, y: number) => void
  hideDropCaret: () => void
}

interface ScopeValue {
  variables: WhatsappVariable[]
  warningsFor?: (path: Path) => TokenWarnings | undefined
  register: (handle: EditorHandle) => () => void
  setActive: (handle: EditorHandle) => void
  insert: (name: string) => void
  startDrag: (e: React.PointerEvent, name: string, label: string, moving?: HTMLElement) => void
  consumeDragClick: () => boolean
}

const ScopeContext = createContext<ScopeValue | null>(null)

const DRAG_THRESHOLD = 4

function WhatsappTokenScope({ variables, warningsFor, children }: {
  variables: WhatsappVariable[]
  warningsFor?: (path: Path) => TokenWarnings | undefined
  children: React.ReactNode
}) {
  const editors = useRef(new Set<EditorHandle>())
  const active = useRef<EditorHandle | null>(null)
  const justDragged = useRef(false)

  const value = useMemo<ScopeValue>(() => {
    const connected = () => Array.from(editors.current)
      .filter(e => e.root.isConnected)
      .sort((a, b) => (a.root.compareDocumentPosition(b.root) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))

    const editorAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)
      const wrapper = el?.closest('.wa-editor')
      return wrapper ? connected().find(e => wrapper.contains(e.root)) ?? null : null
    }

    return {
      variables,
      warningsFor,
      register(handle) {
        editors.current.add(handle)
        return () => {
          editors.current.delete(handle)
          if (active.current === handle)
            active.current = null
        }
      },
      setActive(handle) {
        active.current = handle
      },
      insert(name) {
        const target = active.current?.root.isConnected ? active.current : connected()[0]
        target?.insertToken(name)
      },
      consumeDragClick() {
        const dragged = justDragged.current
        justDragged.current = false
        return dragged
      },
      startDrag(e, name, label, moving) {
        if (e.button !== 0)
          return
        e.preventDefault()
        const source = e.currentTarget as HTMLElement
        const startX = e.clientX
        const startY = e.clientY
        let ghost: HTMLElement | null = null
        let over: EditorHandle | null = null

        const onMove = (ev: PointerEvent) => {
          if (!ghost) {
            if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD)
              return
            ghost = document.createElement('span')
            ghost.className = 'wa-token wa-token--ghost'
            ghost.dataset.tone = moving?.dataset.tone ?? 'default'
            ghost.textContent = label
            ghost.style.fontFamily = getComputedStyle(source).fontFamily
            document.body.append(ghost)
            document.documentElement.classList.add('wa-dragging')
            moving?.classList.add('is-dragging')
          }
          ghost.style.transform = `translate(${ev.clientX + 10}px, ${ev.clientY + 10}px)`
          const target = editorAt(ev.clientX, ev.clientY)
          if (over && over !== target)
            over.hideDropCaret()
          over = target
          target?.showDropCaret(ev.clientX, ev.clientY)
        }

        const cleanup = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          window.removeEventListener('pointercancel', cleanup)
          over?.hideDropCaret()
          ghost?.remove()
          document.documentElement.classList.remove('wa-dragging')
          moving?.classList.remove('is-dragging')
        }

        const onUp = (ev: PointerEvent) => {
          const dragged = ghost != null
          cleanup()
          if (!dragged)
            return
          justDragged.current = true
          setTimeout(() => { justDragged.current = false }, 0)
          const target = editorAt(ev.clientX, ev.clientY)
          target?.dropToken(name, ev.clientX, ev.clientY, moving && target.root.contains(moving) ? moving : undefined)
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', cleanup)
      },
    }
  }, [variables, warningsFor])

  return (
    <ScopeContext.Provider value={value}>
      <style>{CSS}</style>
      {children}
    </ScopeContext.Provider>
  )
}

export function WhatsappTokenPalette({ readOnly, hint }: { readOnly?: boolean, hint?: React.ReactNode }) {
  const scope = useContext(ScopeContext)
  if (!scope)
    return null
  return (
    <Card padding={3} radius={2} tone="primary" border>
      <Stack gap={3}>
        <Text size={1} weight="semibold" muted>
          Tags — glisse-les dans le message (ou clique pour insérer au curseur). Un tag placé se déplace en le glissant, × pour le retirer.
        </Text>
        <Flex gap={2} wrap="wrap">
          {scope.variables.map(v => (
            <button
              key={v.name}
              type="button"
              className="wa-token"
              title={`{${v.name}} — ${v.description}`}
              disabled={readOnly}
              onPointerDown={e => scope.startDrag(e, v.name, v.label)}
              onClick={() => {
                if (!scope.consumeDragClick())
                  scope.insert(v.name)
              }}
            >
              {v.label}
            </button>
          ))}
        </Flex>
        {hint && <Text size={1} muted>{hint}</Text>}
      </Stack>
    </Card>
  )
}

function useDescribe(variables: WhatsappVariable[], warnings: TokenWarnings | undefined): DescribeToken {
  return useCallback((name) => {
    const variable = variables.find(v => v.name === name)
    if (!variable)
      return { label: `${name} ?`, title: `{${name}} — variable inconnue ici : sortira vide sur le site`, tone: 'unknown' }
    const warning = warnings?.[name]
    return warning
      ? { label: variable.label, title: `{${name}} — ${warning}`, tone: 'warning' }
      : { label: variable.label, title: `{${name}} — ${variable.description}`, tone: 'default' }
  }, [variables, warnings])
}

function WhatsappTokenTextInput(props: StringInputProps) {
  const { value = '', onChange, readOnly, elementProps, path } = props
  const scope = useContext(ScopeContext)!
  const warnings = scope.warningsFor?.(path)
  const describe = useDescribe(scope.variables, warnings)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const caretRef = useRef<HTMLDivElement>(null)
  const savedRange = useRef<Range | null>(null)
  const [empty, setEmpty] = useState(!value)

  const latest = useRef({ value, onChange, describe, readOnly })
  useLayoutEffect(() => {
    latest.current = { value, onChange, describe, readOnly }
  })
  const emitted = useRef<{ value: string, at: number }[]>([])

  const setRootRef = useCallback((el: HTMLDivElement | null) => {
    rootRef.current = el
    const ref = elementProps.ref as React.RefObject<HTMLElement | null> | undefined
    if (ref)
      ref.current = el
  }, [elementProps.ref])

  const emit = useCallback(() => {
    const root = rootRef.current
    if (!root)
      return
    normalizeEditor(root)
    const next = serializeEditor(root)
    setEmpty(!next)
    if (next === (latest.current.value ?? ''))
      return
    emitted.current = [...emitted.current.slice(-19), { value: next, at: performance.now() }]
    latest.current.onChange(next ? set(next) : unset())
  }, [])

  const placeCaret = useCallback((range: Range) => {
    const root = rootRef.current
    if (!root)
      return
    root.focus({ preventScroll: true })
    const selection = root.ownerDocument.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    savedRange.current = range.cloneRange()
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root)
      return
    const shown = serializeEditor(root)
    if (shown === value) {
      emitted.current = []
      return
    }
    const now = performance.now()
    if (emitted.current.some(e => e.value === value && now - e.at < 1000))
      return
    renderTemplate(root, value, describe)
    setEmpty(!value)
  }, [value, describe])

  useEffect(() => {
    const root = rootRef.current
    if (!root)
      return

    const handle: EditorHandle = {
      root,
      insertToken(name) {
        if (latest.current.readOnly)
          return
        const range = savedRange.current && root.contains(savedRange.current.startContainer)
          ? savedRange.current
          : endRange(root)
        placeCaret(insertTokenAt(range, name, latest.current.describe))
        emit()
      },
      dropToken(name, x, y, moving) {
        if (latest.current.readOnly)
          return
        const range = rangeFromPoint(root, x, y)
        if (moving) {
          if (isAdjacentTo(range, moving))
            return
          removeTokenNode(moving)
        }
        const next = insertTokenAt(range, name, latest.current.describe)
        root.normalize()
        placeCaret(next)
        emit()
      },
      showDropCaret(x, y) {
        const caret = caretRef.current
        const wrapper = wrapperRef.current
        if (!caret || !wrapper || latest.current.readOnly)
          return
        wrapper.setAttribute('data-dragover', '')
        const rect = caretRect(rangeFromPoint(root, x, y))
        if (!rect || (!rect.height && !rect.left)) {
          caret.style.display = 'none'
          return
        }
        const box = wrapper.getBoundingClientRect()
        caret.style.display = 'block'
        caret.style.height = `${rect.height || 20}px`
        caret.style.transform = `translate(${rect.left - box.left - 1}px, ${rect.top - box.top}px)`
      },
      hideDropCaret() {
        wrapperRef.current?.removeAttribute('data-dragover')
        if (caretRef.current)
          caretRef.current.style.display = 'none'
      },
    }
    const unregister = scope.register(handle)

    const onSelectionChange = () => {
      const selection = root.ownerDocument.getSelection()
      if (selection?.rangeCount && root.contains(selection.anchorNode)) {
        savedRange.current = selection.getRangeAt(0).cloneRange()
        scope.setActive(handle)
      }
    }
    root.ownerDocument.addEventListener('selectionchange', onSelectionChange)
    return () => {
      unregister()
      root.ownerDocument.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [scope, emit, placeCaret])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const root = rootRef.current
    if (e.key !== 'Enter' || e.nativeEvent.isComposing || !root)
      return
    e.preventDefault()
    const selection = root.ownerDocument.getSelection()
    if (!selection?.rangeCount)
      return
    placeCaret(insertTextAt(selection.getRangeAt(0), '\n', describe))
    emit()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const root = rootRef.current
    e.preventDefault()
    if (!root || readOnly)
      return
    const text = e.clipboardData.getData('text/plain')
    const selection = root.ownerDocument.getSelection()
    if (!text || !selection?.rangeCount)
      return
    placeCaret(insertTextAt(selection.getRangeAt(0), text, describe))
    emit()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-remove]')) {
      e.preventDefault()
      return
    }
    const token = target.closest('.wa-token')
    if (readOnly || !isTokenNode(token))
      return
    scope.startDrag(e, token.dataset.token!, token.firstChild?.textContent ?? token.dataset.token!, token)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const remove = (e.target as HTMLElement).closest('[data-remove]')
    const token = remove?.closest('.wa-token')
    if (readOnly || !isTokenNode(token))
      return
    removeTokenNode(token)
    emit()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const root = rootRef.current
    e.preventDefault()
    const text = e.dataTransfer.getData('text/plain')
    if (!root || readOnly || !text)
      return
    placeCaret(insertTextAt(rangeFromPoint(root, e.clientX, e.clientY), text, describe))
    emit()
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const root = rootRef.current
    if (root && hasRawTokens(root))
      renderTemplate(root, serializeEditor(root), describe)
    elementProps.onBlur(e as unknown as React.FocusEvent<HTMLInputElement>)
  }

  return (
    <div ref={wrapperRef} className="wa-editor" data-readonly={readOnly ? '' : undefined}>
      <div
        ref={setRootRef}
        id={elementProps.id}
        className="wa-editor__input"
        role="textbox"
        aria-multiline="true"
        aria-describedby={elementProps['aria-describedby']}
        contentEditable={!readOnly}
        spellCheck
        onInput={emit}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onDragStart={e => e.preventDefault()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onFocus={e => elementProps.onFocus(e as unknown as React.FocusEvent<HTMLInputElement>)}
        onBlur={handleBlur}
      />
      {empty && (
        <div className="wa-editor__placeholder">
          {readOnly ? '' : 'Écris le message et glisse des tags ici… (vide = message vierge)'}
        </div>
      )}
      <div ref={caretRef} className="wa-editor__caret" />
    </div>
  )
}

type ComplexInputProps = ArrayOfObjectsInputProps | ObjectInputProps

function useTokenRenderInput(props: ComplexInputProps): RenderInputCallback {
  const { renderInput } = props
  return useCallback((inputProps) => {
    const isLocalizedText = inputProps.schemaType.jsonType === 'string'
      && inputProps.path[inputProps.path.length - 1] === 'value'
    return isLocalizedText
      ? <WhatsappTokenTextInput {...(inputProps as StringInputProps)} />
      : renderInput(inputProps)
  }, [renderInput])
}

function ScopedDefault({ props, children }: { props: ComplexInputProps, children?: (defaultInput: React.ReactNode) => React.ReactNode }) {
  const renderInput = useTokenRenderInput(props)
  const defaultInput = props.renderDefault({ ...props, renderInput } as InputProps)
  return <>{children ? children(defaultInput) : defaultInput}</>
}

export function createWhatsappMessageInput(variables: WhatsappVariable[], hint?: React.ReactNode) {
  return function WhatsappMessageInput(props: ArrayOfObjectsInputProps) {
    return (
      <WhatsappTokenScope variables={variables}>
        <Stack gap={3}>
          <WhatsappTokenPalette readOnly={props.readOnly} hint={hint} />
          <ScopedDefault props={props} />
        </Stack>
      </WhatsappTokenScope>
    )
  }
}

export function WhatsappTokenObjectScope({ props, variables, warningsFor, children }: {
  props: ObjectInputProps
  variables: WhatsappVariable[]
  warningsFor?: (path: Path) => TokenWarnings | undefined
  children: (defaultInput: React.ReactNode) => React.ReactNode
}) {
  return (
    <WhatsappTokenScope variables={variables} warningsFor={warningsFor}>
      <ScopedDefault props={props}>{children}</ScopedDefault>
    </WhatsappTokenScope>
  )
}

export const PageWhatsappMessageInput = createWhatsappMessageInput(PAGE_VARIABLES)
export const BioWhatsappMessageInput = createWhatsappMessageInput(BIO_VARIABLES)
