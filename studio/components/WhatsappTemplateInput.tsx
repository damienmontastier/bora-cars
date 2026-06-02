import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClient } from 'sanity'
import type { ArrayOfObjectsInputProps } from 'sanity'
import { Box, Card, Flex, Select, Stack, Text } from '@sanity/ui'

interface TemplateVariable {
  token: string
  label: string
}

// Variables interpolées côté front par Pricing.vue (fillTemplate).
// Doivent rester synchronisées avec `whatsappParams` dans web/.../car/Pricing.vue.
const VARIABLES: TemplateVariable[] = [
  { token: '{marque}', label: 'Marque' },
  { token: '{modele}', label: 'Modèle' },
  { token: '{prix}', label: 'Prix' },
  { token: '{periode}', label: 'Période' },
  { token: '{duree}', label: 'Durée' },
  { token: '{quand}', label: 'Quand' },
  { token: '{url}', label: 'Lien fiche' },
]

type Lang = 'fr' | 'en'
const LANGS: { id: Lang, label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
]

interface CarOption {
  _id: string
  marque?: string
  modele?: string
  slug?: string
  prixJournalier?: number
  prixMensuel?: number
}

interface TemplateValueItem {
  _key?: string
  language?: string
  value?: string
}

// Reflètent les libellés réels du front (web/i18n/locales/*.json → car.pricing.*).
// duree/quand = valeurs PAR DÉFAUT des sélecteurs de la fiche.
const SAMPLE = {
  fr: { duree: '24h', quand: 'Ce week-end', perDay: 'par jour', perMonth: 'par mois' },
  en: { duree: '24h', quand: 'This weekend', perDay: 'per day', perMonth: 'per month' },
}

// 1ʳᵉ lettre en minuscule — miroir de Pricing.vue (libellé « Quand » en milieu de phrase).
function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

function buildParams(car: CarOption, lang: Lang): Record<string, string> {
  const isMonthly = car.prixMensuel != null
  const price = car.prixMensuel ?? car.prixJournalier
  const prix = price != null
    ? new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB').format(price)
    : ''
  const s = SAMPLE[lang]
  return {
    marque: car.marque ?? '',
    modele: car.modele ?? '',
    prix,
    periode: isMonthly ? s.perMonth : s.perDay,
    duree: s.duree,
    quand: lowerFirst(s.quand),
    url: car.slug ? `/${lang}/car/${car.slug}` : '',
  }
}

// Tokens connus (sans accolades) et ceux dont la valeur vient du document `car`.
const KNOWN_TOKENS = new Set(VARIABLES.map(v => v.token.slice(1, -1)))
const CAR_TOKENS = new Set(['marque', 'modele', 'prix', 'url'])

// Une variable issue du document `car` est-elle renseignée sur cette voiture ?
function carFieldPresent(car: CarOption, token: string): boolean {
  switch (token) {
    case 'marque': return Boolean(car.marque)
    case 'modele': return Boolean(car.modele)
    case 'prix': return (car.prixMensuel ?? car.prixJournalier) != null
    case 'url': return Boolean(car.slug)
    default: return true
  }
}

// Marqueur surligné INLINE dans l'aperçu (valeur absente ou variable inconnue).
function Marker({ color, title, children }: { color: string, title: string, children: React.ReactNode }) {
  return (
    <span
      title={title}
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}66`,
        borderRadius: 3,
        padding: '0 4px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

// Insère du texte dans un <textarea> contrôlé par React en déclenchant un vrai
// event `input` — sinon Sanity (composant contrôlé) ne voit pas le changement.
function insertIntoTextarea(textarea: HTMLTextAreaElement, token: string) {
  const start = textarea.selectionStart ?? textarea.value.length
  const end = textarea.selectionEnd ?? textarea.value.length
  const next = textarea.value.slice(0, start) + token + textarea.value.slice(end)

  const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  setValue?.call(textarea, next)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))

  const pos = start + token.length
  textarea.focus()
  textarea.setSelectionRange(pos, pos)
}

/**
 * Wrapper de champ pour le template de message WhatsApp de la fiche voiture.
 * Conserve l'UI internationalisée par défaut (`renderDefault`, textareas FR/EN)
 * et ajoute :
 *  - une barre de "chips" de variables (clic = insère / glisser-dépose = drop) ;
 *  - un aperçu du message final pour une voiture choisie dans la liste.
 */
export function WhatsappTemplateInput(props: ArrayOfObjectsInputProps) {
  const { renderDefault, value } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLTextAreaElement | null>(null)

  const client = useClient({ apiVersion: '2026-04-06' })
  const [cars, setCars] = useState<CarOption[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [lang, setLang] = useState<Lang>('fr')

  useEffect(() => {
    let active = true
    client
      .fetch<CarOption[]>(
        `*[_type == "car"] | order(marque asc, modele asc){
          _id, marque, modele, "slug": slug.current, prixJournalier, prixMensuel
        }`,
      )
      .then((res) => { if (active) setCars(res ?? []) })
      .catch(() => { /* silencieux : l'aperçu est optionnel */ })
    return () => { active = false }
  }, [client])

  const handleFocusCapture = useCallback((e: React.FocusEvent) => {
    if (e.target instanceof HTMLTextAreaElement)
      lastFocused.current = e.target
  }, [])

  const insert = useCallback((token: string) => {
    const root = containerRef.current
    if (!root)
      return
    let textarea = lastFocused.current
    if (!textarea || !root.contains(textarea))
      textarea = root.querySelector('textarea')
    if (textarea)
      insertIntoTextarea(textarea, token)
  }, [])

  const template = useMemo(() => {
    const items = (value ?? []) as TemplateValueItem[]
    return items.find(i => i.language === lang)?.value ?? ''
  }, [value, lang])

  const selectedCar = useMemo(
    () => cars.find(c => c._id === selectedId),
    [cars, selectedId],
  )

  // Aperçu rendu en segments : chaque valeur absente / variable inconnue est
  // surlignée INLINE, à l'endroit exact où elle manque dans la phrase.
  const previewNodes = useMemo(() => {
    if (!selectedCar || !template.trim())
      return null
    const params = buildParams(selectedCar, lang)
    return template.split(/(\{\w+\})/g).map((part, i) => {
      const m = part.match(/^\{(\w+)\}$/)
      if (!m)
        return <React.Fragment key={i}>{part}</React.Fragment>
      const token = m[1]
      if (!KNOWN_TOKENS.has(token)) {
        return (
          <Marker key={i} color="#8b5cf6" title="Variable inconnue — sortira vide sur le site">
            [{token} ?]
          </Marker>
        )
      }
      if (CAR_TOKENS.has(token) && !carFieldPresent(selectedCar, token)) {
        return (
          <Marker key={i} color="#e11900" title="Non renseigné sur cette voiture — sortira vide sur le site">
            [{token} absent]
          </Marker>
        )
      }
      return <React.Fragment key={i}>{params[token] ?? ''}</React.Fragment>
    })
  }, [selectedCar, template, lang])

  return (
    <div ref={containerRef} onFocusCapture={handleFocusCapture}>
      <Stack space={3}>
        <Card padding={3} radius={2} tone="primary" border>
          <Stack space={3}>
            <Text size={1} weight="semibold" muted>
              Variables — clique pour insérer dans le champ actif, ou glisse-dépose dans le texte
            </Text>
            <Flex gap={2} wrap="wrap">
              {VARIABLES.map(v => (
                <Card
                  key={v.token}
                  as="button"
                  type="button"
                  padding={2}
                  radius={2}
                  tone="primary"
                  border
                  draggable
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('text/plain', v.token)
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => insert(v.token)}
                  style={{ cursor: 'grab' }}
                >
                  <Flex align="center" gap={2}>
                    <Text size={1} weight="medium">⋮⋮ {v.label}</Text>
                    <Text size={0} muted>
                      <code>{v.token}</code>
                    </Text>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Stack>
        </Card>

        {renderDefault(props)}

        <Card padding={3} radius={2} tone="transparent" border>
          <Stack space={3}>
            <Text size={1} weight="semibold" muted>
              Aperçu du message
            </Text>

            <Flex gap={2} wrap="wrap">
              <Box flex={1} style={{ minWidth: 200 }}>
                <Select
                  fontSize={1}
                  value={selectedId}
                  onChange={e => setSelectedId(e.currentTarget.value)}
                >
                  <option value="">— Choisir une voiture —</option>
                  {cars.map(c => (
                    <option key={c._id} value={c._id}>
                      {[c.marque, c.modele].filter(Boolean).join(' ') || c._id}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box style={{ minWidth: 130 }}>
                <Select
                  fontSize={1}
                  value={lang}
                  onChange={e => setLang(e.currentTarget.value as Lang)}
                >
                  {LANGS.map(l => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </Select>
              </Box>
            </Flex>

            {previewNodes
              ? (
                  <Card padding={3} radius={2} tone="positive" border>
                    <Text size={1} style={{ whiteSpace: 'pre-wrap' }}>{previewNodes}</Text>
                  </Card>
                )
              : (
                  <Text size={1} muted style={{ fontStyle: 'italic' }}>
                    {selectedId
                      ? 'Le template est vide pour cette langue → le message par défaut (i18n) sera utilisé.'
                      : 'Choisis une voiture pour voir le message final.'}
                  </Text>
                )}

            <Text size={0} muted>
              Surligné = valeur absente (rouge) ou variable inconnue (violet) → sortira vide sur le site. durée / quand = valeurs par défaut · lien = chemin de la fiche (le domaine est ajouté sur le site).
            </Text>
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}
