import { useCallback, useEffect, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Box, Button, Card, Flex, Heading, Stack, Text } from '@sanity/ui'
import type { ButtonMode, ButtonTone } from '@sanity/ui'
import { useIntentLink } from 'sanity/router'
import { ArrowRightIcon } from '@sanity/icons/ArrowRight'

const RELATIVE = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export function timeAgo(value: string | number, now: number): string {
  const seconds = (new Date(value).getTime() - now) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RELATIVE.format(Math.round(seconds / size), unit)
  }
  return 'à l’instant'
}

export function longDate(value: string | number): string {
  return new Date(value).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Horloge qui se rafraîchit toutes les `intervalMs` (libellés « il y a X min »). */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  `${n} ${n > 1 ? pluralForm : singular}`

export function IntentButton({ intent = 'edit', id, type, path, text = 'Ouvrir', mode = 'ghost', tone, icon, iconRight = ArrowRightIcon }: {
  intent?: 'edit' | 'create'
  id?: string
  type: string
  path?: string
  text?: string
  mode?: ButtonMode
  tone?: ButtonTone
  icon?: ComponentType
  iconRight?: ComponentType | null
}) {
  const params = intent === 'create' ? { type } : { id: id ?? type, type, ...(path ? { path } : {}) }
  const { href, onClick } = useIntentLink({ intent, params })
  return (
    <Button
      as="a"
      href={href}
      onClick={onClick}
      mode={mode}
      tone={tone}
      icon={icon}
      iconRight={iconRight ?? undefined}
      text={text}
      fontSize={1}
      padding={2}
    />
  )
}

export function ExternalButton({ href, text, icon, mode = 'ghost' }: {
  href: string
  text: string
  icon?: ComponentType
  mode?: ButtonMode
}) {
  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      mode={mode}
      icon={icon}
      text={text}
      fontSize={1}
      padding={3}
    />
  )
}

export function Panel({ icon: Icon, title, subtitle, actions, children }: {
  icon?: ComponentType
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Card padding={4} radius={3} shadow={1} style={{ height: '100%' }}>
      <Stack gap={4}>
        <Flex align="flex-start" gap={3}>
          {Icon && (
            <Text size={3}>
              <Icon />
            </Text>
          )}
          <Stack gap={2} flex={1}>
            <Heading size={1} as="h2">{title}</Heading>
            {subtitle && <Text size={1} muted>{subtitle}</Text>}
          </Stack>
          {actions && <Box>{actions}</Box>}
        </Flex>
        {children}
      </Stack>
    </Card>
  )
}

export function Thumbnail({ url }: { url?: string }) {
  return (
    <Box
      style={{
        width: 36,
        height: 36,
        flex: 'none',
        borderRadius: 4,
        background: 'var(--card-muted-bg-color, rgba(127, 127, 127, 0.15))',
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  )
}

const HIDDEN_KEY = 'bora:dashboard:hidden'

function readHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  }
  catch {
    return new Set()
  }
}

/**
 * Points que l'éditeur a choisi de masquer (ex. une mention voulue). Stockés sur cet
 * appareil uniquement : c'est un confort d'affichage, pas une donnée du site.
 */
export function useHiddenFindings() {
  const [hidden, setHidden] = useState<Set<string>>(readHidden)

  const toggle = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      try {
        localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]))
      }
      catch {
        // localStorage indisponible (mode privé) — le masquage dure la session.
      }
      return next
    })
  }, [])

  return { hidden, toggle }
}
