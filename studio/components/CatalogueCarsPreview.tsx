import React, { useEffect, useState } from 'react'
import { useClient, useFormValue } from 'sanity'
import type { StringInputProps } from 'sanity'
import { IntentLink } from 'sanity/router'
import { Badge, Box, Card, Flex, Grid, Inline, Spinner, Stack, Text } from '@sanity/ui'

// Cast : les types React du Studio et de sanity/router peuvent diverger (TS2786).
const CarLink = IntentLink as unknown as React.FC<any>

interface CarRow {
  _id: string
  marque?: string
  modele?: string
  imageUrl?: string
  city?: string
  rentalTypes?: string[]
  prixJournalier?: number
  prixMensuel?: number
}

// Mêmes filtres que côté front (web/app/queries/catalogue.ts) :
// - professionnel : clientType contient "professionnel"
// - particulier (standard) : clientType non défini OU contient "particulier"
const FILTERS: Record<string, string> = {
  professionnel: '_type == "car" && "professionnel" in clientType',
  particulier: '_type == "car" && (!defined(clientType) || "particulier" in clientType)',
}

const RENTAL_LABELS: Record<string, string> = {
  'longue-duree': 'Longue durée',
  'courte-duree': 'Courte durée',
}

const buildQuery = (filter: string) => `*[${filter}] | order(marque asc, modele asc){
  _id,
  marque,
  modele,
  "imageUrl": image.asset->url,
  "city": location->city[_key == "fr"][0].value,
  rentalTypes,
  prixJournalier,
  prixMensuel
}`

function priceLabel(car: CarRow): string | null {
  if (typeof car.prixJournalier === 'number') return `${car.prixJournalier} € / jour`
  if (typeof car.prixMensuel === 'number') return `${car.prixMensuel} € / mois`
  return null
}

export function CatalogueCarsPreview(_props: StringInputProps) {
  const docType = useFormValue(['_type']) as string | undefined
  const audience = docType === 'catalogueProfessionnel' ? 'professionnel' : 'particulier'
  const client = useClient({ apiVersion: '2026-04-06' })

  const [cars, setCars] = useState<CarRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setCars(null)
    setError(null)
    client
      .fetch<CarRow[]>(buildQuery(FILTERS[audience]))
      .then((res) => { if (active) setCars(res ?? []) })
      .catch((e) => { if (active) setError(e?.message ?? 'Erreur de chargement') })
    return () => {
      active = false
    }
  }, [client, audience])

  if (error) {
    return (
      <Card padding={3} radius={2} tone="critical">
        <Text size={1}>Impossible de charger les véhicules : {error}</Text>
      </Card>
    )
  }

  if (cars === null) {
    return (
      <Flex align="center" gap={2} padding={3}>
        <Spinner muted />
        <Text size={1} muted>Chargement des véhicules…</Text>
      </Flex>
    )
  }

  if (cars.length === 0) {
    return (
      <Card padding={3} radius={2} tone="caution" border>
        <Text size={1}>Aucun véhicule dans ce catalogue pour le moment.</Text>
      </Card>
    )
  }

  return (
    <Stack space={3}>
      <Text size={1} muted>
        {cars.length} véhicule{cars.length > 1 ? 's' : ''} — lecture seule. Pour ajouter ou retirer une
        voiture, modifiez le champ « Type de client » de la voiture concernée.
      </Text>
      <Grid columns={[1, 2, 3]} gap={3}>
        {cars.map((car) => {
          const title = [car.marque, car.modele].filter(Boolean).join(' ') || 'Sans titre'
          const price = priceLabel(car)
          return (
            <CarLink
              key={car._id}
              intent="edit"
              params={{ id: car._id, type: 'car' }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card padding={0} radius={2} shadow={1} overflow="hidden" style={{ height: '100%' }}>
                <Box
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 10',
                    background: 'var(--card-muted-bg-color, #f1f3f6)',
                    backgroundImage: car.imageUrl ? `url(${car.imageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <Box padding={3}>
                  <Stack space={2}>
                    <Text size={1} weight="semibold">{title}</Text>
                    {car.city ? <Text size={1} muted>{car.city}</Text> : null}
                    <Inline space={2}>
                      {price ? (
                        <Badge tone="primary" mode="outline" radius={2} padding={1} fontSize={0}>
                          {price}
                        </Badge>
                      ) : null}
                      {(car.rentalTypes ?? []).map((rt) => (
                        <Badge key={rt} tone="default" mode="outline" radius={2} padding={1} fontSize={0}>
                          {RENTAL_LABELS[rt] ?? rt}
                        </Badge>
                      ))}
                    </Inline>
                  </Stack>
                </Box>
              </Card>
            </CarLink>
          )
        })}
      </Grid>
    </Stack>
  )
}
