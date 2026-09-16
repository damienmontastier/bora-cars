/**
 * Moteur DOM de l'éditeur de message WhatsApp à tags (sans React, testable).
 *
 * Le format STOCKÉ ne change pas : une chaîne de texte où chaque variable est un
 * jeton `{nom}` (ex. « Bonjour, la {marque} {modele} est-elle dispo ? »). L'éditeur
 * se contente de l'AFFICHER autrement — chaque jeton devient un tag non éditable,
 * déplaçable — puis re-sérialise le DOM vers exactement la même chaîne. Le contenu
 * déjà saisi dans Sanity est donc relu tel quel, sans migration.
 */

const TOKEN_RE = /(\{\w+\})/g
const TOKEN_EXACT_RE = /^\{(\w+)\}$/
const ELEMENT_NODE = 1
const TEXT_NODE = 3

export type TokenTone = 'default' | 'warning' | 'unknown'

export interface TokenDisplay {
  label: string
  title: string
  tone: TokenTone
}

export type DescribeToken = (name: string) => TokenDisplay

export type Segment = { type: 'text', text: string } | { type: 'token', name: string }

export function parseTemplate(template: string): Segment[] {
  return template
    .split(TOKEN_RE)
    .filter(Boolean)
    .map((part) => {
      const m = part.match(TOKEN_EXACT_RE)
      return m ? { type: 'token', name: m[1]! } : { type: 'text', text: part }
    })
}

function isElement(node: Node | null | undefined): node is HTMLElement {
  return node?.nodeType === ELEMENT_NODE
}

export function isTokenNode(node: Node | null | undefined): node is HTMLElement {
  return isElement(node) && node.dataset.token != null
}

export function createTokenNode(doc: Document, name: string, describe: DescribeToken): HTMLSpanElement {
  const { label, title, tone } = describe(name)
  const el = doc.createElement('span')
  el.className = 'wa-token'
  el.contentEditable = 'false'
  el.dataset.token = name
  el.dataset.tone = tone
  el.title = title

  const text = doc.createElement('span')
  text.textContent = label

  const remove = doc.createElement('span')
  remove.className = 'wa-token__remove'
  remove.dataset.remove = ''
  remove.title = 'Retirer ce tag'
  remove.textContent = '×'

  el.append(text, remove)
  return el
}

export function buildFragment(doc: Document, template: string, describe: DescribeToken): DocumentFragment {
  const fragment = doc.createDocumentFragment()
  for (const seg of parseTemplate(template)) {
    fragment.append(seg.type === 'token'
      ? createTokenNode(doc, seg.name, describe)
      : doc.createTextNode(seg.text))
  }
  return fragment
}

// Un <br> en DERNIER enfant n'est jamais un vrai saut de ligne : c'est le
// placeholder que le navigateur (ou `normalizeEditor`) pose pour rendre
// visible une ligne vide finale.
export function serializeEditor(root: Node): string {
  let out = ''
  const children = Array.from(root.childNodes)
  children.forEach((node, index) => {
    if (node.nodeType === TEXT_NODE) {
      out += (node.nodeValue ?? '').replace(/\u200B/g, '')
      return
    }
    if (!isElement(node))
      return
    if (node.dataset.token != null) {
      out += `{${node.dataset.token}}`
      return
    }
    if (node.tagName === 'BR') {
      if (index < children.length - 1)
        out += '\n'
      return
    }
    // Bloc inséré par le navigateur (ne devrait pas arriver : Entrée/coller/déposer
    // sont interceptés) → une ligne.
    if (node.tagName === 'DIV' || node.tagName === 'P') {
      if (out && !out.endsWith('\n'))
        out += '\n'
    }
    out += serializeEditor(node)
  })
  return out
}

export function renderTemplate(root: HTMLElement, template: string, describe: DescribeToken) {
  root.replaceChildren(buildFragment(root.ownerDocument, template, describe))
  normalizeEditor(root)
}

const ZWSP = '\u200B'

function visibleText(node: Node | null | undefined): string | null {
  return node?.nodeType === TEXT_NODE ? (node.nodeValue ?? '').replace(/\u200B/g, '') : null
}

function isFiller(node: Node | null | undefined): boolean {
  return isElement(node) && node.tagName === 'BR' && node === node.parentNode?.lastChild
}

/**
 * Garde-fous de curseur, invisibles dans la valeur sérialisée :
 * - espace de largeur nulle (ZWSP) autour d'un tag en début/fin de texte ou collé à un
 *   autre tag — sinon Chrome ne sait pas placer le curseur après un élément non
 *   éditable (cas courant : message qui finit par {url}) ;
 * - <br> final quand le texte finit par « \n », sinon la ligne vide n'est pas visible.
 */
export function normalizeEditor(root: HTMLElement) {
  const doc = root.ownerDocument
  for (const token of Array.from(root.childNodes).filter(isTokenNode)) {
    const prev = token.previousSibling
    const next = token.nextSibling
    if (!prev || (visibleText(prev) == null && !isTokenNode(prev)))
      token.before(doc.createTextNode(ZWSP))
    if (!next || isTokenNode(next) || isFiller(next) || (isElement(next) && next.tagName === 'BR'))
      token.after(doc.createTextNode(ZWSP))
  }
  const last = root.lastChild
  if (serializeEditor(root).endsWith('\n') && !(isElement(last) && last.tagName === 'BR'))
    root.append(doc.createElement('br'))
}

// Le texte contient-il un `{jeton}` saisi à la main (pas encore transformé en tag) ?
export function hasRawTokens(root: HTMLElement): boolean {
  return Array.from(root.childNodes).some(n => n.nodeType === TEXT_NODE && /\{\w+\}/.test(n.nodeValue ?? ''))
}

function edgeChar(node: Node | null, dir: 'before' | 'after'): string | null {
  let current = node
  while (current) {
    if (current.nodeType === TEXT_NODE) {
      const t = (current.nodeValue ?? '').replace(/\u200B/g, '')
      if (t)
        return dir === 'before' ? t[t.length - 1]! : t[0]!
    }
    else if (isTokenNode(current)) {
      return 'A' // un tag compte comme un mot
    }
    else if (isElement(current) && current.tagName === 'BR') {
      return '\n'
    }
    current = dir === 'before' ? current.previousSibling : current.nextSibling
  }
  return null
}

function charAround(range: Range, dir: 'before' | 'after'): string | null {
  const { startContainer: c, startOffset: o } = range
  if (c.nodeType === TEXT_NODE) {
    const t = c.nodeValue ?? ''
    const side = (dir === 'before' ? t.slice(0, o) : t.slice(o)).replace(/\u200B/g, '')
    if (side)
      return dir === 'before' ? side[side.length - 1]! : side[0]!
    return edgeChar(dir === 'before' ? c.previousSibling : c.nextSibling, dir)
  }
  return edgeChar(dir === 'before' ? c.childNodes[o - 1] ?? null : c.childNodes[o] ?? null, dir)
}

// Espace auto autour d'un tag déposé contre un mot : « la{marque} » → « la {marque} ».
// Pas d'espace après « / », « ’ », « ( » ni avant « € », « / », ponctuation.
const WORD_BEFORE_RE = /[\p{L}\p{N},.;:!?»)]/u
const WORD_AFTER_RE = /[\p{L}\p{N}«(]/u

/** Insère un tag à `range` (repliée), avec espacement auto. Renvoie la position juste après. */
export function insertTokenAt(range: Range, name: string, describe: DescribeToken): Range {
  const doc = range.startContainer.ownerDocument ?? (range.startContainer as Document)
  range.deleteContents()
  const before = charAround(range, 'before')
  const after = charAround(range, 'after')

  const fragment = doc.createDocumentFragment()
  if (before && WORD_BEFORE_RE.test(before))
    fragment.append(doc.createTextNode(' '))
  const token = createTokenNode(doc, name, describe)
  fragment.append(token)
  let last: Node = token
  if (after && WORD_AFTER_RE.test(after)) {
    last = doc.createTextNode(' ')
    fragment.append(last)
  }
  range.insertNode(fragment)

  const next = doc.createRange()
  next.setStartAfter(last)
  next.collapse(true)
  return next
}

/** Insère du texte brut (coller / déposer) : les `{jetons}` qu'il contient deviennent des tags. */
export function insertTextAt(range: Range, text: string, describe: DescribeToken): Range {
  const doc = range.startContainer.ownerDocument ?? (range.startContainer as Document)
  range.deleteContents()
  const fragment = buildFragment(doc, text.replace(/\r\n?/g, '\n'), describe)
  const last = fragment.lastChild
  if (!last)
    return range
  range.insertNode(fragment)
  const next = doc.createRange()
  next.setStartAfter(last)
  next.collapse(true)
  return next
}

/** Retire un tag en évitant les doubles espaces qu'il laisserait. */
export function removeTokenNode(token: HTMLElement) {
  const prev = token.previousSibling
  const next = token.nextSibling
  token.remove()
  if (prev?.nodeType !== TEXT_NODE)
    return
  const text = prev as Text
  const trailingSpace = text.data.search(/ \u200B*$/)
  if (trailingSpace < 0)
    return
  const nextVisible = visibleText(next)
  const atEnd = next == null || isFiller(next) || (nextVisible === '' && (next!.nextSibling == null || isFiller(next!.nextSibling)))
  // « la {marque} {modele} » → retirer {marque} : « la {modele} » (pas « la  {modele} »).
  if (atEnd || (nextVisible != null && /^[\s,.;:!?)]/.test(nextVisible)))
    text.deleteData(trailingSpace, 1) // deleteData (et non nodeValue=) : garde les Range vivantes cohérentes
}

/** La position `range` est-elle collée au tag `token` (déposer là = ne rien bouger) ? */
export function isAdjacentTo(range: Range, token: HTMLElement): boolean {
  const { startContainer: c, startOffset: o } = range
  if (c === token.parentNode)
    return c.childNodes[o] === token || c.childNodes[o - 1] === token
  if (c.nodeType === TEXT_NODE) {
    const len = (c.nodeValue ?? '').length
    return (o === len && c.nextSibling === token) || (o === 0 && c.previousSibling === token)
  }
  return false
}

export function endRange(root: HTMLElement): Range {
  const range = root.ownerDocument.createRange()
  const last = root.lastChild
  if (isElement(last) && last.tagName === 'BR')
    range.setStartBefore(last)
  else
    range.selectNodeContents(root)
  range.collapse(false)
  return range
}

/** Position de dépôt sous le pointeur, bornée à `root` (jamais À L'INTÉRIEUR d'un tag). */
export function rangeFromPoint(root: HTMLElement, x: number, y: number): Range {
  const doc = root.ownerDocument as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node, offset: number } | null
    caretRangeFromPoint?: (x: number, y: number) => Range | null
  }
  let range: Range | null = null
  const pos = doc.caretPositionFromPoint?.(x, y)
  if (pos) {
    range = doc.createRange()
    range.setStart(pos.offsetNode, pos.offset)
    range.collapse(true)
  }
  else {
    range = doc.caretRangeFromPoint?.(x, y) ?? null
  }

  if (!range || !root.contains(range.startContainer))
    return endRange(root)

  let node: Node | null = range.startContainer
  while (node && node !== root) {
    if (isTokenNode(node)) {
      const rect = node.getBoundingClientRect()
      const r = doc.createRange()
      if (x < rect.left + rect.width / 2)
        r.setStartBefore(node)
      else
        r.setStartAfter(node)
      r.collapse(true)
      return r
    }
    node = node.parentNode
  }
  return range
}

/** Rectangle du curseur pour une position repliée (indicateur de dépôt). */
export function caretRect(range: Range): DOMRect | null {
  const rects = range.getClientRects()
  if (rects.length && rects[0]!.height)
    return rects[0]!
  // Position entre deux éléments : pas de rect natif → marqueur temporaire.
  const doc = range.startContainer.ownerDocument
  if (!doc)
    return null
  const marker = doc.createElement('span')
  marker.textContent = '\u200B'
  const probe = range.cloneRange()
  probe.insertNode(marker)
  const rect = marker.getBoundingClientRect()
  const parent = marker.parentNode
  marker.remove()
  parent?.normalize()
  return rect
}
