import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { Badge, Box, Button, Card, Flex, Heading, Stack, Tab, TabList, TabPanel, Text } from '@sanity/ui'
import type { BadgeTone, CardTone } from '@sanity/ui'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { ChevronDownIcon } from '@sanity/icons/ChevronDown'
import { ChevronRightIcon } from '@sanity/icons/ChevronRight'
import { ErrorOutlineIcon } from '@sanity/icons/ErrorOutline'
import { EyeClosedIcon } from '@sanity/icons/EyeClosed'
import { EyeOpenIcon } from '@sanity/icons/EyeOpen'
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline'
import { CATEGORIES, SEVERITIES } from './checks'
import type { Category, Finding, Issue, Severity } from './checks'
import { IntentButton, Panel, Thumbnail, plural } from './shared'

export const SEVERITY_STYLE: Record<Severity, { tone: BadgeTone, cardTone: CardTone, icon: ComponentType, label: (n: number) => string }> = {
  critical: { tone: 'critical', cardTone: 'critical', icon: ErrorOutlineIcon, label: n => plural(n, 'bloquant') },
  warning: { tone: 'caution', cardTone: 'caution', icon: WarningOutlineIcon, label: n => `${n} à corriger` },
  tip: { tone: 'primary', cardTone: 'default', icon: BulbOutlineIcon, label: n => plural(n, 'conseil') },
}

const FINDINGS_PREVIEW = 6

type Filter = 'all' | Category

function FindingRow({ finding, isHidden, onToggleHidden }: {
  finding: Finding
  isHidden: boolean
  onToggleHidden: (key: string) => void
}) {
  return (
    <Card padding={2} radius={2} border style={{ opacity: isHidden ? 0.55 : 1 }}>
      <Flex align="center" gap={3}>
        {finding.docType === 'car' && <Thumbnail url={finding.imageUrl} />}
        <Stack gap={2} flex={1} style={{ minWidth: 0 }}>
          <Text size={1} weight="semibold" textOverflow="ellipsis">{finding.label}</Text>
          {finding.details.length > 0 && (
            <Text size={1} muted>{finding.details.join(' · ')}</Text>
          )}
          {finding.fixedInDraft && (
            <Box>
              <Badge tone="positive" fontSize={0}>Corrigé dans le brouillon — pensez à publier</Badge>
            </Box>
          )}
        </Stack>
        <IntentButton id={finding.docId} type={finding.docType} path={finding.path} />
        <Button
          mode="bleed"
          icon={isHidden ? EyeOpenIcon : EyeClosedIcon}
          text={isHidden ? 'Réafficher' : 'Masquer'}
          padding={2}
          fontSize={1}
          title={isHidden ? 'Réafficher ce point' : 'Masquer ce point (choix volontaire, sur cet appareil)'}
          aria-label={isHidden ? 'Réafficher ce point' : 'Masquer ce point'}
          onClick={() => onToggleHidden(finding.key)}
        />
      </Flex>
    </Card>
  )
}

function IssueCard({ issue, findings, hidden, onToggleHidden }: {
  issue: Issue
  findings: Finding[]
  hidden: Set<string>
  onToggleHidden: (key: string) => void
}) {
  const style = SEVERITY_STYLE[issue.severity]
  const [open, setOpen] = useState(issue.severity !== 'tip')
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? findings : findings.slice(0, FINDINGS_PREVIEW)
  const Icon = style.icon

  return (
    <Card radius={2} border tone={style.cardTone}>
      <Button
        mode="bleed"
        width="fill"
        padding={3}
        justify="flex-start"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <Flex align="center" gap={3}>
          <Text size={2}><Icon /></Text>
          <Box flex={1}>
            <Text size={1} weight="semibold">{issue.title}</Text>
          </Box>
          <Badge tone={style.tone} fontSize={0}>{findings.length}</Badge>
          <Text size={1} muted>{open ? <ChevronDownIcon /> : <ChevronRightIcon />}</Text>
        </Flex>
      </Button>

      {open && (
        <Card padding={3} tone="default" radius={2} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Stack gap={3}>
            <Text size={1}>{issue.why}</Text>
            <Text size={1} muted>
              <strong>Comment corriger :</strong> {issue.fix}
            </Text>
            <Stack gap={2}>
              {visible.map(finding => (
                <FindingRow
                  key={finding.key}
                  finding={finding}
                  isHidden={hidden.has(finding.key)}
                  onToggleHidden={onToggleHidden}
                />
              ))}
            </Stack>
            {findings.length > FINDINGS_PREVIEW && (
              <Box>
                <Button
                  mode="bleed"
                  fontSize={1}
                  padding={2}
                  text={expanded ? 'Afficher moins' : `Afficher les ${findings.length - FINDINGS_PREVIEW} autres`}
                  onClick={() => setExpanded(e => !e)}
                />
              </Box>
            )}
          </Stack>
        </Card>
      )}
    </Card>
  )
}

export function Issues({ issues, hidden, onToggleHidden }: {
  issues: Issue[]
  hidden: Set<string>
  onToggleHidden: (key: string) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [showHidden, setShowHidden] = useState(false)

  const hiddenCount = useMemo(
    () => issues.reduce((n, issue) => n + issue.findings.filter(f => hidden.has(f.key)).length, 0),
    [issues, hidden],
  )

  const shown = useMemo(() => issues
    .map(issue => ({ issue, findings: issue.findings.filter(f => showHidden || !hidden.has(f.key)) }))
    .filter(({ findings }) => findings.length > 0), [issues, hidden, showHidden])

  const countFor = (category: Filter) => shown
    .filter(({ issue }) => category === 'all' || issue.category === category)
    .reduce((n, { findings }) => n + findings.length, 0)

  const filtered = shown.filter(({ issue }) => filter === 'all' || issue.category === filter)

  const tabs: { id: Filter, title: string }[] = [{ id: 'all', title: 'Tout' }, ...CATEGORIES]

  return (
    <Panel
      icon={WarningOutlineIcon}
      title="Points à vérifier"
      subtitle="Analyse automatique du contenu publié (ce qui est en ligne). La liste se met à jour dès que vous modifiez quelque chose."
      actions={hiddenCount > 0 && (
        <Button
          mode="bleed"
          fontSize={1}
          padding={2}
          icon={showHidden ? EyeClosedIcon : EyeOpenIcon}
          text={showHidden ? 'Cacher les points masqués' : `Voir les points masqués (${hiddenCount})`}
          onClick={() => setShowHidden(s => !s)}
        />
      )}
    >
      <TabList gap={1} style={{ flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            id={`dashboard-tab-${tab.id}`}
            aria-controls="dashboard-issues-panel"
            label={`${tab.title} (${countFor(tab.id)})`}
            selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
          />
        ))}
      </TabList>

      <TabPanel id="dashboard-issues-panel" aria-labelledby={`dashboard-tab-${filter}`}>
        {filtered.length === 0 ? (
          <Card padding={4} radius={2} tone="positive" border>
            <Flex gap={3} align="center">
              <Text size={2}><CheckmarkCircleIcon /></Text>
              <Text size={1} weight="semibold">Rien à signaler ici, tout est en ordre.</Text>
            </Flex>
          </Card>
        ) : (
          <Stack gap={5}>
            {SEVERITIES.map((severity) => {
              const group = filtered
                .filter(({ issue }) => issue.severity === severity.id)
                .sort((a, b) => b.findings.length - a.findings.length)
              if (!group.length) return null
              return (
                <Stack key={severity.id} gap={3}>
                  <Stack gap={2}>
                    <Heading size={0} as="h3">{severity.title}</Heading>
                    <Text size={1} muted>{severity.subtitle}</Text>
                  </Stack>
                  {group.map(({ issue, findings }) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      findings={findings}
                      hidden={hidden}
                      onToggleHidden={onToggleHidden}
                    />
                  ))}
                </Stack>
              )
            })}
          </Stack>
        )}
      </TabPanel>
    </Panel>
  )
}
