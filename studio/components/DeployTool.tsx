import { useCallback, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  Flex,
  Heading,
  Inline,
  Spinner,
  Stack,
  Text,
} from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { RocketIcon } from '@sanity/icons/Rocket'
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline'
import { BUILD_HOOK, formatDateTime, readLastTriggered, triggerBuild } from '../lib/netlifyDeploy'

// Outil « Mise en ligne » : redéclenche un build + redéploiement de la production (branche
// main) à la demande, sans attendre un push.

/** Déclenchement du build avec toasts. `onTriggered` reçoit la date ISO du déclenchement. */
export function useDeployTrigger(onTriggered?: (iso: string) => void) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const trigger = useCallback(async () => {
    setLoading(true)
    try {
      const iso = await triggerBuild()
      onTriggered?.(iso)
      toast.push({
        status: 'success',
        title: 'Mise en ligne lancée',
        description: 'Le site est en cours de reconstruction. Vos contenus publiés seront en ligne dans ~1–3 min.',
      })
    }
    catch {
      toast.push({
        status: 'error',
        title: 'Échec du déclenchement',
        description: 'Impossible de joindre Netlify. Vérifiez votre connexion et réessayez.',
      })
    }
    finally {
      setLoading(false)
    }
  }, [toast, onTriggered])

  return { available: Boolean(BUILD_HOOK), loading, trigger }
}

export function DeployConfirmDialog({ loading, onConfirm, onClose }: {
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      id="confirm-deploy"
      header="Mettre le site en ligne ?"
      width={0}
      onClose={loading ? undefined : onClose}
    >
      <Box padding={4}>
        <Stack gap={4}>
          <Text size={1}>
            Le site boracars.com va être reconstruit avec tout le contenu publié dans Sanity. Il
            sera à jour dans ~1–3 min.
          </Text>
          <Text size={1} muted>
            Les brouillons (contenus pas encore publiés) ne sont pas mis en ligne.
          </Text>
          <Flex justify="flex-end" gap={3}>
            <Button text="Annuler" mode="ghost" disabled={loading} onClick={onClose} />
            <Button
              icon={RocketIcon}
              text={loading ? 'Lancement…' : 'Mettre en ligne'}
              tone="primary"
              disabled={loading}
              loading={loading}
              onClick={onConfirm}
            />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  )
}

export function DeployTool() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastTriggered, setLastTriggered] = useState<string | null>(() => readLastTriggered())
  const { available, loading, trigger } = useDeployTrigger(setLastTriggered)

  const confirm = useCallback(async () => {
    await trigger()
    setConfirmOpen(false)
  }, [trigger])

  const lastTriggeredLabel = formatDateTime(lastTriggered)

  return (
    <Container width={1} paddingX={4} paddingY={6}>
      <Card padding={4} radius={3} shadow={1} border>
        <Stack gap={4}>
          <Flex align="center" gap={3}>
            <Box>
              <Text size={4}>
                <RocketIcon />
              </Text>
            </Box>
            <Stack gap={2}>
              <Heading size={2}>Mettre le site en ligne</Heading>
              <Text size={1} muted>
                Reconstruit le site boracars.com avec le contenu publié dans Sanity, pour que vos
                modifications apparaissent en ligne.
              </Text>
            </Stack>
          </Flex>

          {!available ? (
            <Card padding={3} radius={2} tone="caution" border>
              <Flex align="flex-start" gap={3}>
                <Text size={2}>
                  <WarningOutlineIcon />
                </Text>
                <Stack gap={2}>
                  <Text size={1} weight="semibold">
                    Build hook non configuré
                  </Text>
                  <Text size={1} muted>
                    Renseignez <code>SANITY_STUDIO_NETLIFY_BUILD_HOOK</code> dans le fichier{' '}
                    <code>studio/.env</code>, puis relancez le Studio (ou redéployez-le).
                  </Text>
                </Stack>
              </Flex>
            </Card>
          ) : (
            <Stack gap={4}>
              <Text size={1} muted>
                À utiliser après avoir publié des contenus : le site étant pré-généré pour être rapide,
                les changements n'apparaissent en ligne qu'après une mise en ligne.
              </Text>

              <Inline gap={3}>
                <Button
                  icon={RocketIcon}
                  text="Mettre en ligne"
                  tone="primary"
                  disabled={loading}
                  onClick={() => setConfirmOpen(true)}
                />
                {loading && <Spinner muted />}
              </Inline>

              <Flex align="center" gap={2}>
                <Text size={1} muted>
                  Dernière mise en ligne :
                </Text>
                {lastTriggeredLabel ? (
                  <Badge tone="positive" fontSize={0}>
                    {lastTriggeredLabel}
                  </Badge>
                ) : (
                  <Text size={1} muted>
                    aucune depuis cet appareil
                  </Text>
                )}
              </Flex>
            </Stack>
          )}
        </Stack>
      </Card>

      {confirmOpen && (
        <DeployConfirmDialog
          loading={loading}
          onConfirm={confirm}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </Container>
  )
}
