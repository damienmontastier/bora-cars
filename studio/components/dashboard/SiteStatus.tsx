import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { LaunchIcon } from '@sanity/icons/Launch'
import { RocketIcon } from '@sanity/icons/Rocket'
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline'
import { DeployConfirmDialog, useDeployTrigger } from '../DeployTool'
import { PREVIEW_SITE_URL, SITE_URL, fetchLiveBuild } from '../../lib/netlifyDeploy'
import type { LiveBuild } from '../../lib/netlifyDeploy'
import { TYPE_LABELS, docLabel } from './checks'
import type { Snapshot } from './checks'
import { ExternalButton, Panel, longDate, plural, timeAgo } from './shared'

const POLL_INTERVAL_MS = 20_000
/** Au-delà, on arrête d'attendre le nouveau build (échec ou build très long). */
const POLL_TIMEOUT_MS = 10 * 60_000
const RECHECK_INTERVAL_MS = 5 * 60_000
const PENDING_PREVIEW = 5

interface Deploy {
  since: number
  previousId: string | null
}

/**
 * Le site de production est prérendu : un contenu publié dans Sanity n'est en ligne
 * qu'après un nouveau build. On compare la date du build en ligne (manifest Nuxt) aux
 * dates de publication des documents.
 */
export function SiteStatus({ snapshot, now }: { snapshot: Snapshot, now: number }) {
  const toast = useToast()
  const [build, setBuild] = useState<LiveBuild | null>(null)
  const [checked, setChecked] = useState(false)
  const [deploy, setDeploy] = useState<Deploy | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const check = useCallback(async (signal?: AbortSignal) => {
    const live = await fetchLiveBuild(signal)
    if (signal?.aborted) return null
    setBuild(live)
    setChecked(true)
    return live
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    check(controller.signal)
    const id = setInterval(() => check(controller.signal), RECHECK_INTERVAL_MS)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [check])

  // Pendant une mise en ligne : on guette l'arrivée du nouveau build.
  useEffect(() => {
    if (!deploy) return
    const controller = new AbortController()
    const id = setInterval(async () => {
      if (Date.now() - deploy.since > POLL_TIMEOUT_MS) {
        setDeploy(null)
        return
      }
      const live = await check(controller.signal)
      if (live && deploy.previousId && live.id !== deploy.previousId) {
        setDeploy(null)
        toast.push({
          status: 'success',
          title: 'Mise en ligne terminée',
          description: 'Vos derniers contenus publiés sont maintenant visibles sur boracars.com.',
        })
      }
    }, POLL_INTERVAL_MS)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [deploy, check, toast])

  const onTriggered = useCallback(() => {
    setDeploy({ since: Date.now(), previousId: build?.id ?? null })
  }, [build])
  const { available, loading, trigger } = useDeployTrigger(onTriggered)

  const confirm = useCallback(async () => {
    await trigger()
    setConfirmOpen(false)
  }, [trigger])

  const pending = useMemo(() => {
    if (!build) return []
    return snapshot.published
      .filter(doc => new Date(doc._updatedAt).getTime() > build.timestamp)
      .sort((a, b) => b._updatedAt.localeCompare(a._updatedAt))
  }, [snapshot, build])

  const draftsCount = snapshot.drafts.size

  return (
    <Panel
      icon={EarthGlobeIcon}
      title="Site en ligne"
      subtitle={SITE_URL.replace(/^https?:\/\//, '')}
      actions={<ExternalButton href={`${SITE_URL}/fr`} text="Voir le site" icon={LaunchIcon} />}
    >
      {deploy ? (
        <Card padding={3} radius={2} tone="primary" border>
          <Flex gap={3} align="flex-start">
            <Spinner muted />
            <Stack gap={2}>
              <Text size={1} weight="semibold">Mise en ligne en cours…</Text>
              <Text size={1} muted>
                Lancée {timeAgo(deploy.since, now)}. Le site sera à jour dans 1 à 3 minutes, inutile de
                relancer.
              </Text>
            </Stack>
          </Flex>
        </Card>
      ) : !checked ? (
        <Flex gap={3} align="center" padding={3}>
          <Spinner muted />
          <Text size={1} muted>Vérification du site…</Text>
        </Flex>
      ) : !build ? (
        <Card padding={3} radius={2} tone="default" border>
          <Flex gap={3} align="flex-start">
            <Text size={2}><InfoOutlineIcon /></Text>
            <Stack gap={2}>
              <Text size={1} weight="semibold">Date de mise en ligne indisponible</Text>
              <Text size={1} muted>
                Si vous avez publié des contenus récemment, lancez une mise en ligne pour être sûr
                qu’ils soient visibles sur le site.
              </Text>
            </Stack>
          </Flex>
        </Card>
      ) : pending.length === 0 ? (
        <Card padding={3} radius={2} tone="positive" border>
          <Flex gap={3} align="flex-start">
            <Text size={2}><CheckmarkCircleIcon /></Text>
            <Stack gap={2}>
              <Text size={1} weight="semibold">Le site en ligne est à jour</Text>
              <Text size={1} muted>
                Dernière mise en ligne : {longDate(build.timestamp)} ({timeAgo(build.timestamp, now)}).
              </Text>
            </Stack>
          </Flex>
        </Card>
      ) : (
        <Card padding={3} radius={2} tone="caution" border>
          <Flex gap={3} align="flex-start">
            <Text size={2}><WarningOutlineIcon /></Text>
            <Stack gap={3} flex={1}>
              <Stack gap={2}>
                <Text size={1} weight="semibold">
                  {plural(pending.length, 'contenu publié', 'contenus publiés')} pas encore en ligne
                </Text>
                <Text size={1} muted>
                  Dernière mise en ligne : {longDate(build.timestamp)} ({timeAgo(build.timestamp, now)}).
                </Text>
              </Stack>
              <Stack gap={2}>
                {pending.slice(0, PENDING_PREVIEW).map(doc => (
                  <Text key={doc._id} size={1}>
                    • {docLabel(doc)}
                    {doc._type === 'car' || doc._type === 'location' || doc._type === 'legalPage'
                      ? <span style={{ opacity: 0.6 }}> ({TYPE_LABELS[doc._type]})</span>
                      : null}
                    <span style={{ opacity: 0.6 }}> — publié {timeAgo(doc._updatedAt, now)}</span>
                  </Text>
                ))}
                {pending.length > PENDING_PREVIEW && (
                  <Text size={1} muted>
                    … et {plural(pending.length - PENDING_PREVIEW, 'autre')}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Flex>
        </Card>
      )}

      <Stack gap={3}>
        <Text size={1} muted>
          Le site de test affiche vos contenus publiés en quelques instants, sans mise en ligne :
          vérifiez-y vos changements, puis mettez en ligne.
        </Text>
        {available ? (
          <Flex gap={2} wrap="wrap">
            <Button
              icon={RocketIcon}
              text="Mettre en ligne"
              tone="primary"
              mode={pending.length > 0 || !build ? 'default' : 'ghost'}
              disabled={loading || Boolean(deploy)}
              onClick={() => setConfirmOpen(true)}
            />
            <ExternalButton href={`${PREVIEW_SITE_URL}/fr`} text="Voir le site de test" icon={LaunchIcon} />
          </Flex>
        ) : (
          <Stack gap={3}>
            <Text size={1} muted>
              Le bouton de mise en ligne n’est pas configuré sur ce Studio (build hook Netlify manquant).
            </Text>
            <Box>
              <ExternalButton href={`${PREVIEW_SITE_URL}/fr`} text="Voir le site de test" icon={LaunchIcon} />
            </Box>
          </Stack>
        )}
        {draftsCount > 0 && (
          <Text size={1} muted>
            {plural(draftsCount, 'brouillon')} ne ser{draftsCount > 1 ? 'ont' : 'a'} pas mis en ligne tant
            qu’{draftsCount > 1 ? 'ils ne sont' : 'il n’est'} pas publié{draftsCount > 1 ? 's' : ''} (voir « Brouillons en cours »).
          </Text>
        )}
      </Stack>

      {confirmOpen && (
        <DeployConfirmDialog loading={loading} onConfirm={confirm} onClose={() => setConfirmOpen(false)} />
      )}
    </Panel>
  )
}
