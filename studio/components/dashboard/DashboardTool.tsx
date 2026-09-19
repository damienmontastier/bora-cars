import { useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Spinner, Stack, Tab, TabList, TabPanel, Text } from '@sanity/ui'
import { useCurrentUser } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { RefreshIcon } from '@sanity/icons/Refresh'
import { Drafts, RecentActivity } from './Activity'
import { CarsTab } from './CarsTab'
import { SEVERITIES, buildSnapshot, runChecks } from './checks'
import type { Issue, Severity } from './checks'
import { useDashboardData } from './data'
import { GoogleTab } from './GoogleTab'
import { HowItWorks, Shortcuts } from './Guide'
import { Issues, SEVERITY_STYLE } from './Issues'
import { Overview } from './Overview'
import { timeAgo, useHiddenFindings, useNow } from './shared'
import { SiteStatus } from './SiteStatus'

type View = 'overview' | 'cars' | 'google'

const VIEWS: { id: View, title: string }[] = [
  { id: 'overview', title: 'Vue d’ensemble' },
  { id: 'cars', title: 'Fiches voitures' },
  { id: 'google', title: 'Aperçu Google' },
]

const today = () => {
  const label = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function HealthBanner({ issues, hidden }: { issues: Issue[], hidden: Set<string> }) {
  const counts = useMemo(() => {
    const result: Record<Severity, number> = { critical: 0, warning: 0, tip: 0 }
    for (const issue of issues) result[issue.severity] += issue.findings.filter(f => !hidden.has(f.key)).length
    return result
  }, [issues, hidden])

  const tone = counts.critical ? 'critical' : counts.warning ? 'caution' : 'positive'
  const Icon = counts.critical ? SEVERITY_STYLE.critical.icon : counts.warning ? SEVERITY_STYLE.warning.icon : CheckmarkCircleIcon
  const message = counts.critical
    ? `${counts.critical} point${counts.critical > 1 ? 's' : ''} bloquant${counts.critical > 1 ? 's' : ''} à corriger en priorité`
    : counts.warning
      ? 'Aucun point bloquant — quelques corrections recommandées'
      : 'Tout est en ordre, rien d’important à corriger'

  return (
    <Card padding={4} radius={3} tone={tone} border>
      <Flex align="center" gap={4} wrap="wrap">
        <Text size={4}><Icon /></Text>
        <Stack gap={3} flex={1} style={{ minWidth: 240 }}>
          <Heading size={1} as="p">{message}</Heading>
          <Flex gap={2} wrap="wrap">
            {SEVERITIES.map(s => (
              <Badge key={s.id} tone={SEVERITY_STYLE[s.id].tone} fontSize={1} padding={2}>
                {SEVERITY_STYLE[s.id].label(counts[s.id])}
              </Badge>
            ))}
          </Flex>
        </Stack>
        {counts.critical + counts.warning + counts.tip > 0 && (
          <Button
            mode="ghost"
            text="Voir le détail"
            onClick={() => document.getElementById('dashboard-issues')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        )}
      </Flex>
    </Card>
  )
}

export function DashboardTool() {
  const user = useCurrentUser()
  const now = useNow()
  const { data, error, loading, refreshedAt, refresh } = useDashboardData()
  const { hidden, toggle } = useHiddenFindings()
  const [view, setView] = useState<View>('overview')

  const snapshot = useMemo(() => (data ? buildSnapshot(data) : null), [data])
  const issues = useMemo(() => (snapshot ? runChecks(snapshot) : []), [snapshot])
  const settings = snapshot?.context.singletons.get('settings')
  const firstName = user?.name?.split(' ')[0]

  return (
    <Card height="fill" overflow="auto">
      <Container width={3} paddingX={[3, 4, 5]} paddingY={[4, 5, 6]}>
        <Stack gap={5}>
          <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap">
            <Stack gap={3}>
              <Heading size={3} as="h1">{firstName ? `Bonjour ${firstName}` : 'Bonjour'} 👋</Heading>
              <Text size={1} muted>{today()} · Voici l’état du site et ce qui mérite votre attention.</Text>
            </Stack>
            <Flex align="center" gap={3}>
              {refreshedAt && (
                <Text size={1} muted>Actualisé {timeAgo(refreshedAt, Math.max(now, refreshedAt))}</Text>
              )}
              <Button
                mode="ghost"
                icon={RefreshIcon}
                text="Actualiser"
                fontSize={1}
                loading={loading && Boolean(data)}
                onClick={refresh}
              />
            </Flex>
          </Flex>

          {error && (
            <Card padding={3} radius={2} tone="critical" border>
              <Text size={1}>Impossible de charger le tableau de bord : {error}</Text>
            </Card>
          )}

          {!snapshot || !data ? (
            !error && (
              <Flex align="center" justify="center" gap={3} padding={6}>
                <Spinner muted />
                <Text muted>Analyse du contenu…</Text>
              </Flex>
            )
          ) : (
            <>
              <TabList gap={1} style={{ flexWrap: 'wrap' }}>
                {VIEWS.map(v => (
                  <Tab
                    key={v.id}
                    id={`dashboard-view-${v.id}`}
                    aria-controls={`dashboard-view-${v.id}-panel`}
                    label={v.title}
                    selected={view === v.id}
                    onClick={() => setView(v.id)}
                  />
                ))}
              </TabList>

              <TabPanel id={`dashboard-view-${view}-panel`} aria-labelledby={`dashboard-view-${view}`}>
                {view === 'overview' && (
                  <Stack gap={5}>
                    <HealthBanner issues={issues} hidden={hidden} />

                    <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
                      <SiteStatus snapshot={snapshot} now={now} />
                      <HowItWorks />
                    </Grid>

                    <Overview snapshot={snapshot} assets={data.assets} />

                    <Box id="dashboard-issues" style={{ scrollMarginTop: 16 }}>
                      <Issues issues={issues} hidden={hidden} onToggleHidden={toggle} />
                    </Box>

                    <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
                      <Drafts snapshot={snapshot} now={now} />
                      <RecentActivity snapshot={snapshot} now={now} />
                    </Grid>

                    <Shortcuts socialLinks={settings?.socialLinks ?? []} />
                  </Stack>
                )}
                {view === 'cars' && <CarsTab snapshot={snapshot} now={now} />}
                {view === 'google' && <GoogleTab snapshot={snapshot} />}
              </TabPanel>
            </>
          )}
        </Stack>
      </Container>
    </Card>
  )
}
