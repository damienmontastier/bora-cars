import { useMemo } from 'react'
import { Card, Grid, Heading, Stack, Text } from '@sanity/ui'
import { docLabel } from './checks'
import type { Snapshot } from './checks'
import type { CarDoc, DashboardData } from './data'
import { plural } from './shared'

const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`

function range(values: (number | null | undefined)[]): string | null {
  const nums = values.filter((v): v is number => typeof v === 'number')
  if (!nums.length) return null
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? euros(min) : `${min.toLocaleString('fr-FR')} – ${euros(max)}`
}

const inStandardCatalogue = (car: CarDoc) => car.clientType == null || car.clientType.includes('particulier')
const inProCatalogue = (car: CarDoc) => (car.clientType ?? []).includes('professionnel')

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

export function Overview({ snapshot, assets }: { snapshot: Snapshot, assets: DashboardData['assets'] }) {
  const stats = useMemo(() => {
    const { cars, locations } = snapshot.context
    const drafts = [...snapshot.drafts.keys()]
    const newDrafts = drafts.filter(id => !snapshot.published.some(doc => doc._id === id))
    return {
      cars: cars.length,
      standard: cars.filter(inStandardCatalogue).length,
      pro: cars.filter(inProCatalogue).length,
      short: cars.filter(car => (car.rentalTypes ?? []).includes('courte-duree')).length,
      long: cars.filter(car => (car.rentalTypes ?? []).includes('longue-duree')).length,
      daily: range(cars.map(car => car.prixJournalier)),
      monthly: range(cars.map(car => car.prixMensuel)),
      byLocation: locations
        .map(loc => ({ label: docLabel(loc), count: cars.filter(car => car.location === loc._id).length }))
        .sort((a, b) => b.count - a.count),
      drafts: drafts.length,
      newDrafts: newDrafts.length,
    }
  }, [snapshot])

  return (
    <Grid gridTemplateColumns={[2, 3, 3, 6]} gap={3}>
      <Tile
        label="Voitures en ligne"
        value={String(stats.cars)}
        sub={`${stats.standard} au catalogue · ${stats.pro} en pro`}
      />
      <Tile
        label="Formules"
        value={`${stats.short} · ${stats.long}`}
        sub="courte durée · longue durée"
      />
      <Tile
        label="Tarifs"
        value={stats.daily ?? stats.monthly ?? '—'}
        sub={stats.daily
          ? ['par jour', stats.monthly && `${stats.monthly} par mois`].filter(Boolean).join(' · ')
          : stats.monthly ? 'par mois' : undefined}
      />
      <Tile
        label="Lieux"
        value={String(stats.byLocation.length)}
        sub={stats.byLocation.map(l => `${l.label} ${l.count}`).join(' · ')}
      />
      <Tile
        label="Brouillons en cours"
        value={String(stats.drafts)}
        sub={stats.newDrafts ? `dont ${plural(stats.newDrafts, 'jamais publié', 'jamais publiés')}` : 'tous déjà publiés une fois'}
      />
      <Tile
        label="Médias"
        value={String(assets.images + assets.files)}
        sub={assets.unused ? `${plural(assets.unused, 'inutilisé')}` : 'tous utilisés'}
      />
    </Grid>
  )
}
