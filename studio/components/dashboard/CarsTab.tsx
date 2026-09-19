import { useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Flex, Grid, Heading, Select, Stack, Text, TextInput } from '@sanity/ui'
import type { BadgeTone } from '@sanity/ui'
import { CheckmarkIcon } from '@sanity/icons/Checkmark'
import { ChevronDownIcon } from '@sanity/icons/ChevronDown'
import { ChevronRightIcon } from '@sanity/icons/ChevronRight'
import { CloseIcon } from '@sanity/icons/Close'
import { SearchIcon } from '@sanity/icons/Search'
import { pickLocalized } from '../../lib/preview'
import { docLabel } from './checks'
import type { Snapshot } from './checks'
import { scoreCar, scoreTone } from './completeness'
import type { CarScore } from './completeness'
import type { CarDoc } from './data'
import { IntentButton, Panel, plural, timeAgo } from './shared'

type StatusFilter = 'all' | 'published' | 'pending' | 'new'
type Sort = 'score-asc' | 'score-desc' | 'name' | 'recent'

interface Row {
  id: string
  car: CarDoc
  label: string
  city: string
  price: string | null
  status: { id: Exclude<StatusFilter, 'all'>, text: string, tone: BadgeTone }
  result: CarScore
}

const BAR_COLORS = { positive: '#2f9e5b', caution: '#e39b17', critical: '#e5484d' }

function ScoreBar({ score }: { score: number }) {
  const tone = scoreTone(score)
  return (
    <Flex align="center" gap={2} style={{ minWidth: 150 }}>
      <Box flex={1} style={{ height: 6, borderRadius: 3, background: 'var(--card-border-color)', overflow: 'hidden' }}>
        <Box style={{ width: `${score}%`, height: '100%', borderRadius: 3, background: BAR_COLORS[tone] }} />
      </Box>
      <Badge tone={tone} fontSize={1}>{score} %</Badge>
    </Flex>
  )
}

function CarRow({ row, now }: { row: Row, now: number }) {
  const [open, setOpen] = useState(false)
  const { car, result } = row

  return (
    <Card radius={2} border>
      <Button mode="bleed" width="fill" padding={3} justify="flex-start" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <Flex align="center" gap={3} wrap="wrap">
          <Box
            style={{
              width: 56,
              height: 42,
              flex: 'none',
              borderRadius: 4,
              background: 'var(--card-muted-bg-color, rgba(127, 127, 127, 0.15))',
              backgroundImage: car.image?.url ? `url(${car.image.url}?w=112&h=84&fit=crop&auto=format)` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Stack gap={2} flex={1} style={{ minWidth: 180 }}>
            <Text size={1} weight="semibold" textOverflow="ellipsis">{row.label}</Text>
            <Text size={1} muted>
              {[row.city, row.price, `modifiée ${timeAgo(car._updatedAt, now)}`].filter(Boolean).join(' · ')}
            </Text>
            <Flex gap={2} wrap="wrap">
              <Badge tone={row.status.tone} fontSize={0}>{row.status.text}</Badge>
              {result.groups.map((group) => {
                const done = group.items.filter(i => i.ok).length
                const tone: BadgeTone = done === group.items.length ? 'positive' : group.id === 'essentiel' ? 'critical' : 'default'
                return <Badge key={group.id} tone={tone} fontSize={0}>{group.title} {done}/{group.items.length}</Badge>
              })}
            </Flex>
          </Stack>
          <ScoreBar score={result.score} />
          <Text size={1} muted>{open ? <ChevronDownIcon /> : <ChevronRightIcon />}</Text>
        </Flex>
      </Button>

      {open && (
        <Box padding={3} paddingTop={0}>
          <Grid gridTemplateColumns={[1, 1, 2, 3]} gap={3}>
            {result.groups.map(group => (
              <Card key={group.id} padding={3} radius={2} tone="transparent" border>
                <Stack gap={3}>
                  <Text size={1} weight="semibold">{group.title}</Text>
                  {group.items.map(item => (
                    <Flex key={item.id} gap={2} align="flex-start">
                      <Text size={1}>
                        <span style={{ color: item.ok ? BAR_COLORS.positive : BAR_COLORS.critical }}>
                          {item.ok ? <CheckmarkIcon /> : <CloseIcon />}
                        </span>
                      </Text>
                      <Stack gap={2} flex={1}>
                        <Text size={1} muted={item.ok}>{item.label}</Text>
                        {!item.ok && item.detail && <Text size={0} muted>{item.detail}</Text>}
                      </Stack>
                      {!item.ok && <IntentButton id={row.id} type="car" path={item.path} text="Ouvrir" iconRight={null} />}
                    </Flex>
                  ))}
                </Stack>
              </Card>
            ))}
          </Grid>
          <Flex justify="flex-end" paddingTop={3}>
            <IntentButton id={row.id} type="car" text="Ouvrir la fiche" mode="default" />
          </Flex>
        </Box>
      )}
    </Card>
  )
}

function Tile({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <Card padding={3} radius={2} border>
      <Stack gap={3}>
        <Text size={1} muted>{label}</Text>
        <Heading size={2} as="p">{value}</Heading>
        {sub && <Text size={1} muted>{sub}</Text>}
      </Stack>
    </Card>
  )
}

export function CarsTab({ snapshot, now }: { snapshot: Snapshot, now: number }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<Sort>('score-asc')

  const rows = useMemo<Row[]>(() => {
    const ids = new Set([
      ...snapshot.context.cars.map(car => car._id),
      ...[...snapshot.drafts.entries()].filter(([, doc]) => doc._type === 'car').map(([id]) => id),
    ])
    return [...ids].map((id) => {
      const published = snapshot.context.cars.find(car => car._id === id)
      const draft = snapshot.drafts.get(id) as CarDoc | undefined
      const car = draft && (!published || draft._updatedAt > published._updatedAt) ? draft : published!
      const rowStatus: Row['status'] = !published
        ? { id: 'new', text: 'Jamais publiée', tone: 'primary' }
        : car === draft
          ? { id: 'pending', text: 'Publiée · modifications en brouillon', tone: 'caution' }
          : { id: 'published', text: 'Publiée', tone: 'positive' }
      const price = car.prixMensuel != null
        ? `${car.prixMensuel.toLocaleString('fr-FR')} €/mois`
        : car.prixJournalier != null ? `${car.prixJournalier.toLocaleString('fr-FR')} €/jour` : null
      return { id, car, label: docLabel(car), city: pickLocalized(car.city), price, status: rowStatus, result: scoreCar(car) }
    })
  }, [snapshot])

  const cities = useMemo(() => [...new Set(rows.map(r => r.city).filter(Boolean))].sort(), [rows])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter(r => !q || r.label.toLowerCase().includes(q))
      .filter(r => location === 'all' || r.city === location)
      .filter(r => status === 'all' || r.status.id === status)
      .sort((a, b) => {
        switch (sort) {
          case 'score-desc': return b.result.score - a.result.score
          case 'name': return a.label.localeCompare(b.label, 'fr')
          case 'recent': return b.car._updatedAt.localeCompare(a.car._updatedAt)
          default: return a.result.score - b.result.score
        }
      })
  }, [rows, query, location, status, sort])

  const stats = useMemo(() => {
    const scores = rows.map(r => r.result.score)
    const average = scores.length ? Math.round(scores.reduce((n, s) => n + s, 0) / scores.length) : 0
    const missingCount = new Map<string, { label: string, count: number }>()
    for (const row of rows) {
      for (const item of row.result.missing) {
        const entry = missingCount.get(item.id) ?? { label: item.label, count: 0 }
        entry.count++
        missingCount.set(item.id, entry)
      }
    }
    const top = [...missingCount.values()].sort((a, b) => b.count - a.count)[0]
    return {
      average,
      complete: scores.filter(s => s >= 90).length,
      weak: scores.filter(s => s < 60).length,
      top,
    }
  }, [rows])

  return (
    <Stack gap={4}>
      <Grid gridTemplateColumns={[1, 2, 2, 4]} gap={3}>
        <Tile label="Complétude moyenne" value={`${stats.average} %`} sub={plural(rows.length, 'fiche')} />
        <Tile label="Fiches complètes" value={String(stats.complete)} sub="90 % ou plus" />
        <Tile label="À compléter en priorité" value={String(stats.weak)} sub="moins de 60 %" />
        <Tile
          label="Le plus souvent manquant"
          value={stats.top ? String(stats.top.count) : '—'}
          sub={stats.top ? stats.top.label : 'rien, bravo'}
        />
      </Grid>

      <Panel
        title="Fiches voitures"
        subtitle="Score de complétude de chaque fiche, calculé sur ce que le site affiche. Cliquez sur une voiture pour voir ce qui manque. Les brouillons sont évalués dans leur version en cours."
      >
        <Grid gridTemplateColumns={[1, 2, 2, 4]} gap={2}>
          <TextInput
            icon={SearchIcon}
            placeholder="Rechercher une voiture…"
            value={query}
            onChange={e => setQuery(e.currentTarget.value)}
            fontSize={1}
          />
          <Select fontSize={1} value={location} onChange={e => setLocation(e.currentTarget.value)}>
            <option value="all">Tous les lieux</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </Select>
          <Select fontSize={1} value={status} onChange={e => setStatus(e.currentTarget.value as StatusFilter)}>
            <option value="all">Toutes les voitures</option>
            <option value="published">Publiées</option>
            <option value="pending">Publiées avec modifications en brouillon</option>
            <option value="new">Jamais publiées</option>
          </Select>
          <Select fontSize={1} value={sort} onChange={e => setSort(e.currentTarget.value as Sort)}>
            <option value="score-asc">Les moins complètes d’abord</option>
            <option value="score-desc">Les plus complètes d’abord</option>
            <option value="recent">Modifiées récemment</option>
            <option value="name">Nom (A → Z)</option>
          </Select>
        </Grid>

        {visible.length === 0 ? (
          <Text size={1} muted>Aucune voiture ne correspond à ces filtres.</Text>
        ) : (
          <Stack gap={2}>
            {visible.map(row => <CarRow key={row.id} row={row} now={now} />)}
          </Stack>
        )}
      </Panel>
    </Stack>
  )
}
