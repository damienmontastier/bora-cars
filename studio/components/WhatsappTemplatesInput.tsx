import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClient } from 'sanity'
import type { ObjectInputProps } from 'sanity'
import { Box, Card, Flex, Select, Stack, Text } from '@sanity/ui'

interface TemplateVariable {
  token: string
  label: string
}

// Variables interpolées côté front par useCarContact (fillTemplate).
// À garder synchronisées avec `whatsappParams` dans web/.../composables/useCarContact.ts.
const VARIABLES: TemplateVariable[] = [
  { token: '{marque}', label: 'Marque' },
  { token: '{modele}', label: 'Modèle' },
  { token: '{prix}', label: 'Prix' },
  { token: '{periode}', label: 'Période' },
  { token: '{duree}', label: 'Durée' },
  { token: '{quand}', label: 'Quand' },
  { token: '{url}', label: 'Lien fiche' },
]

// Les 4 cas — même ordre/clé que l'objet `whatsapp` du schéma carPage.
// `noDate` = barre sticky : pas de sélecteur durée/quand → {duree}/{quand} interdits.
const FIELDS: { name: string, label: string, noDate: boolean }[] = [
  { name: 'withPrice', label: 'Bloc tarif — avec prix', noDate: false },
  { name: 'withoutPrice', label: 'Bloc tarif — sans prix', noDate: false },
  { name: 'simpleWithPrice', label: 'Barre sticky — avec prix', noDate: true },
  { name: 'simpleWithoutPrice', label: 'Barre sticky — sans prix', noDate: true },
]
const DATE_TOKENS = new Set(['duree', 'quand'])

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

// Reflètent les libellés réels du front (car.pricing.*) — valeurs PAR DÉFAUT des sélecteurs.
const SAMPLE = {
  fr: { duree: '24h', quand: 'Ce week-end', perDay: 'par jour', perMonth: 'par mois' },
  en: { duree: '24h', quand: 'This weekend', perDay: 'per day', perMonth: 'per month' },
}

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
    url: car.slug ? `/${lang}/voiture/${car.slug}` : '',
  }
}

const KNOWN_TOKENS = new Set(VARIABLES.map(v => v.token.slice(1, -1)))
const CAR_TOKENS = new Set(['marque', 'modele', 'prix', 'url'])

function carFieldPresent(car: CarOption, token: string): boolean {
  switch (token) {
    case 'marque': return Boolean(car.marque)
    case 'modele': return Boolean(car.modele)
    case 'prix': return (car.prixMensuel ?? car.prixJournalier) != null
    case 'url': return Boolean(car.slug)
    default: return true
  }
}

// Marqueur surligné INLINE dans l'aperçu.
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

// Aperçu d'un template en segments : valeurs absentes / variables interdites surlignées.
function renderPreview(template: string, car: CarOption, lang: Lang, noDate: boolean): React.ReactNode {
  const params = buildParams(car, lang)
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/)
    if (!m)
      return <React.Fragment key={i}>{part}</React.Fragment>
    const token = m[1]!
    if (!KNOWN_TOKENS.has(token)) {
      return (
        <Marker key={i} color="#8b5cf6" title="Variable inconnue — sortira vide sur le site">
          [{token} ?]
        </Marker>
      )
    }
    if (noDate && DATE_TOKENS.has(token)) {
      return (
        <Marker key={i} color="#e8a400" title="La barre sticky n'a pas de sélecteur durée/quand — cette valeur par défaut n'est PAS choisie par le client">
          [{token} à éviter]
        </Marker>
      )
    }
    if (CAR_TOKENS.has(token) && !carFieldPresent(car, token)) {
      return (
        <Marker key={i} color="#e11900" title="Non renseigné sur cette voiture — sortira vide sur le site">
          [{token} absent]
        </Marker>
      )
    }
    return <React.Fragment key={i}>{params[token] ?? ''}</React.Fragment>
  })
}

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
 * Input de l'objet `whatsapp` (carPage) : les 4 templates partagent UNE seule barre
 * de variables et UN seul aperçu (1 sélecteur voiture + 1 sélecteur langue), qui
 * affiche les 4 messages finaux côte à côte.
 */
export function WhatsappTemplatesInput(props: ObjectInputProps) {
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

  const selectedCar = useMemo(
    () => cars.find(c => c._id === selectedId),
    [cars, selectedId],
  )

  // Template courant de chaque champ, pour la langue choisie.
  const templates = useMemo(() => {
    const obj = (value ?? {}) as Record<string, TemplateValueItem[] | undefined>
    return FIELDS.map((f) => {
      const items = obj[f.name] ?? []
      const tpl = items.find(i => i.language === lang)?.value ?? ''
      return { ...f, tpl }
    })
  }, [value, lang])

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
              Aperçu des 4 messages
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

            {selectedCar
              ? (
                  <Stack space={2}>
                    {templates.map(f => (
                      <Card key={f.name} padding={3} radius={2} tone={f.tpl.trim() ? 'positive' : 'caution'} border>
                        <Stack space={2}>
                          <Text size={0} weight="semibold" muted>{f.label}</Text>
                          {f.tpl.trim()
                            ? <Text size={1} style={{ whiteSpace: 'pre-wrap' }}>{renderPreview(f.tpl, selectedCar, lang, f.noDate)}</Text>
                            : <Text size={1} muted style={{ fontStyle: 'italic' }}>Vide → lien WhatsApp sans message pré-rempli.</Text>}
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )
              : (
                  <Text size={1} muted style={{ fontStyle: 'italic' }}>
                    Choisis une voiture pour voir les 4 messages finaux.
                  </Text>
                )}

            <Text size={0} muted>
              Surligné : valeur absente sur la voiture (rouge), variable inconnue (violet) ou date à éviter sur la barre sticky (orange) · durée/quand = valeurs par défaut · lien = chemin de la fiche (le domaine est ajouté sur le site).
            </Text>
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}
