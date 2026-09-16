import { useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import type { BadgeTone } from '@sanity/ui'
import { ClockIcon } from '@sanity/icons/Clock'
import { EditIcon } from '@sanity/icons/Edit'
import { TYPE_LABELS, docLabel, isDraftId, missingBeforePublish, publishedId, thumbnailUrl } from './checks'
import type { Snapshot } from './checks'
import { IntentButton, Panel, Thumbnail, timeAgo } from './shared'

const PREVIEW = 6
const RECENT = 8

function Row({ id, type, label, imageUrl, badges, meta }: {
  id: string
  type: string
  label: string
  imageUrl?: string
  badges?: { text: string, tone: BadgeTone }[]
  meta: string
}) {
  return (
    <Card padding={2} radius={2} border>
      <Flex align="center" gap={3}>
        {type === 'car' && <Thumbnail url={imageUrl} />}
        <Stack gap={2} flex={1} style={{ minWidth: 0 }}>
          <Text size={1} weight="semibold" textOverflow="ellipsis">{label}</Text>
          <Text size={1} muted>{meta}</Text>
          {badges && badges.length > 0 && (
            <Flex gap={2} wrap="wrap">
              {badges.map(b => <Badge key={b.text} tone={b.tone} fontSize={0}>{b.text}</Badge>)}
            </Flex>
          )}
        </Stack>
        <IntentButton id={id} type={type} />
      </Flex>
    </Card>
  )
}

export function Drafts({ snapshot, now }: { snapshot: Snapshot, now: number }) {
  const [expanded, setExpanded] = useState(false)

  const rows = useMemo(() => [...snapshot.drafts.entries()]
    .map(([id, draft]) => {
      const published = snapshot.published.find(doc => doc._id === id)
      const badges: { text: string, tone: BadgeTone }[] = []
      if (!published) {
        badges.push({ text: 'Nouveau, jamais publié', tone: 'primary' })
        const missing = missingBeforePublish(draft, snapshot)
        badges.push(missing.length
          ? { text: `Manque : ${missing.join(', ')}`, tone: 'critical' }
          : { text: 'Prêt à publier', tone: 'positive' })
      }
      else if (draft._updatedAt > published._updatedAt) {
        badges.push({ text: 'Modifications non publiées', tone: 'caution' })
      }
      else {
        badges.push({ text: 'Brouillon plus ancien que la version en ligne', tone: 'critical' })
      }
      return {
        id,
        type: draft._type,
        label: docLabel(draft),
        imageUrl: thumbnailUrl(draft),
        badges,
        stale: Boolean(published) && draft._updatedAt <= published!._updatedAt,
        meta: `${TYPE_LABELS[draft._type] ?? draft._type} · modifié ${timeAgo(draft._updatedAt, now)}`,
        updatedAt: draft._updatedAt,
      }
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [snapshot, now])

  const visible = expanded ? rows : rows.slice(0, PREVIEW)
  const hasStale = rows.some(r => r.stale)

  return (
    <Panel
      icon={EditIcon}
      title="Brouillons en cours"
      subtitle="Contenus modifiés mais pas encore publiés : ils ne sont visibles que dans le Studio. Ouvrez-les puis cliquez sur « Publier »."
    >
      {rows.length === 0 ? (
        <Text size={1} muted>Aucun brouillon en attente.</Text>
      ) : (
        <Stack gap={2}>
          {hasStale && (
            <Card padding={3} radius={2} tone="critical" border>
              <Text size={1}>
                Un brouillon « plus ancien que la version en ligne » contient d’anciennes modifications :
                le publier annulerait des changements plus récents. Vérifiez-le, ou supprimez-le via le
                menu « ⋯ » du document → « Annuler les modifications ».
              </Text>
            </Card>
          )}
          {visible.map(row => <Row key={row.id} {...row} />)}
          {rows.length > PREVIEW && (
            <Box>
              <Button
                mode="bleed"
                fontSize={1}
                padding={2}
                text={expanded ? 'Afficher moins' : `Afficher les ${rows.length - PREVIEW} autres`}
                onClick={() => setExpanded(e => !e)}
              />
            </Box>
          )}
        </Stack>
      )}
    </Panel>
  )
}

export function RecentActivity({ snapshot, now }: { snapshot: Snapshot, now: number }) {
  const rows = useMemo(() => {
    const seen = new Set<string>()
    return [...snapshot.published, ...snapshot.drafts.values()]
      .sort((a, b) => b._updatedAt.localeCompare(a._updatedAt))
      .filter((doc) => {
        const id = publishedId(doc._id)
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .slice(0, RECENT)
  }, [snapshot])

  return (
    <Panel icon={ClockIcon} title="Dernières modifications" subtitle="Les contenus modifiés le plus récemment.">
      <Stack gap={2}>
        {rows.map(doc => (
          <Row
            key={doc._id}
            id={publishedId(doc._id)}
            type={doc._type}
            label={docLabel(doc)}
            imageUrl={thumbnailUrl(doc)}
            meta={`${TYPE_LABELS[doc._type] ?? doc._type} · ${isDraftId(doc._id) ? 'brouillon modifié' : 'publié'} ${timeAgo(doc._updatedAt, now)}`}
          />
        ))}
      </Stack>
    </Panel>
  )
}
