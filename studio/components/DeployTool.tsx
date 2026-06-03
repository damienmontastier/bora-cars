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
  useToast,
} from '@sanity/ui'
import { RocketIcon, WarningOutlineIcon } from '@sanity/icons'

// Outil « Publier » : POST sur le build hook Netlify (production / branche main)
// pour redéclencher un build + redéploiement à la demande, sans attendre un push.
// Fire-and-forget : `mode: 'no-cors'` envoie la requête sans préflight CORS — le
// build part quoi qu'il arrive ; on ne lit pas la réponse (opaque).

const BUILD_HOOK = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK
const LAST_TRIGGERED_KEY = 'bora:netlify:last-triggered'

function readLastTriggered(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(LAST_TRIGGERED_KEY)
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DeployTool() {
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastTriggered, setLastTriggered] = useState<string | null>(() => readLastTriggered())

  const trigger = useCallback(async () => {
    if (!BUILD_HOOK) return
    setLoading(true)
    try {
      await fetch(BUILD_HOOK, { method: 'POST', mode: 'no-cors' })
      const now = new Date().toISOString()
      try {
        localStorage.setItem(LAST_TRIGGERED_KEY, now)
      } catch {
        // localStorage indisponible (mode privé) — sans gravité.
      }
      setLastTriggered(now)
      toast.push({
        status: 'success',
        title: 'Build déclenché',
        description: 'Netlify reconstruit le site de production. Comptez ~1–3 min avant la mise en ligne.',
      })
    } catch {
      toast.push({
        status: 'error',
        title: 'Échec du déclenchement',
        description: 'Impossible de joindre Netlify. Vérifiez votre connexion et réessayez.',
      })
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }, [toast])

  const lastTriggeredLabel = formatDate(lastTriggered)

  return (
    <Container width={1} paddingX={4} paddingY={6}>
      <Card padding={4} radius={3} shadow={1} border>
        <Stack space={4}>
          <Flex align="center" gap={3}>
            <Box>
              <Text size={4}>
                <RocketIcon />
              </Text>
            </Box>
            <Stack space={2}>
              <Heading size={2}>Publier le site</Heading>
              <Text size={1} muted>
                Reconstruit et met en ligne la production (branche <code>main</code>) avec le contenu
                actuel de Sanity.
              </Text>
            </Stack>
          </Flex>

          {!BUILD_HOOK ? (
            <Card padding={3} radius={2} tone="caution" border>
              <Flex align="flex-start" gap={3}>
                <Text size={2}>
                  <WarningOutlineIcon />
                </Text>
                <Stack space={2}>
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
            <Stack space={4}>
              <Text size={1} muted>
                À utiliser après avoir modifié du contenu : la production étant prérendue, les
                changements n'apparaissent en ligne qu'après un nouveau build.
              </Text>

              <Inline space={3}>
                <Button
                  icon={RocketIcon}
                  text="Lancer le build"
                  tone="primary"
                  disabled={loading}
                  onClick={() => setConfirmOpen(true)}
                />
                {loading && <Spinner muted />}
              </Inline>

              <Flex align="center" gap={2}>
                <Text size={1} muted>
                  Dernière publication :
                </Text>
                {lastTriggeredLabel ? (
                  <Badge tone="positive" mode="outline" fontSize={0}>
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
        <Dialog
          id="confirm-deploy"
          header="Publier le site ?"
          width={0}
          onClose={loading ? undefined : () => setConfirmOpen(false)}
        >
          <Box padding={4}>
            <Stack space={4}>
              <Text size={1}>
                Un nouveau build de production va être déclenché sur Netlify. Le site sera mis à jour
                avec le contenu actuel dans ~1–3 min.
              </Text>
              <Flex justify="flex-end" gap={3}>
                <Button
                  text="Annuler"
                  mode="ghost"
                  disabled={loading}
                  onClick={() => setConfirmOpen(false)}
                />
                <Button
                  icon={RocketIcon}
                  text={loading ? 'Déclenchement…' : 'Publier'}
                  tone="primary"
                  disabled={loading}
                  loading={loading}
                  onClick={trigger}
                />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Container>
  )
}
