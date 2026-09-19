import React, { useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import type { ObjectInputProps, Path } from 'sanity'
import { Box, Card, Flex, Select, Stack, Text } from '@sanity/ui'
import type { TokenWarnings } from './WhatsappTokenEditor'
import { CAR_VARIABLES, WhatsappTokenObjectScope, WhatsappTokenPalette } from './WhatsappTokenEditor'

const FIELDS: { name: string, label: string, noDate: boolean }[] = [
  { name: 'withPrice', label: 'Bloc tarif — avec prix', noDate: false },
  { name: 'withoutPrice', label: 'Bloc tarif — sans prix', noDate: false },
  { name: 'simpleWithPrice', label: 'Barre sticky — avec prix', noDate: true },
  { name: 'simpleWithoutPrice', label: 'Barre sticky — sans prix', noDate: true },
]
const DATE_TOKENS = new Set(['duree', 'quand'])

const STICKY_WARNINGS: TokenWarnings = {
  duree: 'à éviter : la barre sticky n’a pas de sélecteur de durée, le client n’a rien choisi.',
  quand: 'à éviter : la barre sticky n’a pas de sélecteur « quand », le client n’a rien choisi.',
}

function warningsFor(path: Path): TokenWarnings | undefined {
  const field = FIELDS.find(f => path.includes(f.name))
  return field?.noDate ? STICKY_WARNINGS : undefined
}

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
    ? new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price)
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

const KNOWN_TOKENS = new Set(CAR_VARIABLES.map(v => v.name))
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

function renderPreview(template: string, car: CarOption, lang: Lang, noDate: boolean): React.ReactNode {
  const params = buildParams(car, lang)
  const cleaned = template.replace(/€\s*(\{prix\})/g, '$1').replace(/(\{prix\})\s*€/g, '$1')
  return cleaned.split(/(\{\w+\})/g).map((part, i) => {
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

export function WhatsappTemplatesInput(props: ObjectInputProps) {
  const { value } = props

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
      .catch(() => {})
    return () => { active = false }
  }, [client])

  const selectedCar = useMemo(
    () => cars.find(c => c._id === selectedId),
    [cars, selectedId],
  )

  const templates = useMemo(() => {
    const obj = (value ?? {}) as Record<string, TemplateValueItem[] | undefined>
    return FIELDS.map((f) => {
      const items = obj[f.name] ?? []
      const tpl = items.find(i => i.language === lang)?.value ?? ''
      return { ...f, tpl }
    })
  }, [value, lang])

  return (
    <WhatsappTokenObjectScope props={props} variables={CAR_VARIABLES} warningsFor={warningsFor}>
      {defaultInput => (
        <Stack gap={3}>
          <WhatsappTokenPalette
            readOnly={props.readOnly}
            hint="Tag orange = à éviter sur la barre sticky · violet = variable inconnue (sortira vide)."
          />

          {defaultInput}

          <Card padding={3} radius={2} tone="transparent" border>
            <Stack gap={3}>
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
                    <Stack gap={2}>
                      {templates.map(f => (
                        <Card key={f.name} padding={3} radius={2} tone={f.tpl.trim() ? 'positive' : 'caution'} border>
                          <Stack gap={2}>
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
      )}
    </WhatsappTokenObjectScope>
  )
}
