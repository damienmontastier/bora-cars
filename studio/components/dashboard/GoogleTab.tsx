import { useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Flex, Grid, Heading, Inline, Stack, Switch, Text } from '@sanity/ui'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { SearchIcon } from '@sanity/icons/Search'
import { SITE_URL } from '../../lib/netlifyDeploy'
import type { Snapshot } from './checks'
import { buildSerpEntries, glossaryEntryPath } from './seoPreview'
import type { Lang, SerpEntry, Section } from './seoPreview'
import { IntentButton, Panel, plural } from './shared'

const SECTIONS: { id: Section, title: string }[] = [
  { id: 'pages', title: 'Pages' },
  { id: 'cars', title: 'Fiches voitures' },
  { id: 'legal', title: 'Pages légales' },
]

const GOOGLE = {
  background: '#ffffff',
  border: '#dadce0',
  site: '#202124',
  url: '#4d5156',
  title: '#1a0dab',
  text: '#4d5156',
}

function GoogleResult({ entry }: { entry: SerpEntry }) {
  const [faviconOk, setFaviconOk] = useState(true)
  return (
    <div
      style={{
        background: GOOGLE.background,
        border: `1px solid ${GOOGLE.border}`,
        borderRadius: 8,
        padding: '14px 16px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: 652,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            flex: 'none',
            borderRadius: '50%',
            border: `1px solid ${GOOGLE.border}`,
            background: '#f1f3f4',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
        >
          {faviconOk && (
            <img src={`${SITE_URL}/favicon-96x96.png`} alt="" width={18} height={18} onError={() => setFaviconOk(false)} />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, lineHeight: '20px', color: GOOGLE.site }}>BORA CARS</div>
          <div style={{ fontSize: 12, lineHeight: '18px', color: GOOGLE.url, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.url}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 20,
          lineHeight: '26px',
          color: GOOGLE.title,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {entry.shownTitle}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, lineHeight: '22px', color: GOOGLE.text }}>
        {entry.shownDescription || <em>Aucune description</em>}
      </div>
    </div>
  )
}

function ResultRow({ entry }: { entry: SerpEntry }) {
  const good = entry.flags.length === 0
  return (
    <Card padding={3} radius={2} border>
      <Flex gap={4} wrap="wrap" align="flex-start">
        <Box style={{ flex: '2 1 460px', minWidth: 0 }}>
          <GoogleResult entry={entry} />
        </Box>
        <Stack gap={3} style={{ flex: '1 1 220px' }}>
          <Text size={1} weight="semibold">{entry.label}</Text>
          <Text size={1} muted>
            Titre : {entry.title.length} caractères · Description : {entry.description.length} caractères
          </Text>
          <Flex gap={2} wrap="wrap">
            {good
              ? <Badge tone="positive" fontSize={0}>Parfait</Badge>
              : entry.flags.map(flag => <Badge key={flag.text} tone={flag.tone} fontSize={0}>{flag.text}</Badge>)}
          </Flex>
          <Box>
            <IntentButton
              id={entry.docId}
              type={entry.docType}
              path={entry.editPath}
              text={entry.docType === 'car' ? 'Modifier la description' : 'Modifier le SEO'}
            />
          </Box>
        </Stack>
      </Flex>
    </Card>
  )
}

export function GoogleTab({ snapshot }: { snapshot: Snapshot }) {
  const [lang, setLang] = useState<Lang>('fr')
  const [section, setSection] = useState<Section>('pages')
  const [onlyIssues, setOnlyIssues] = useState(false)

  const entries = useMemo(() => buildSerpEntries(snapshot, lang), [snapshot, lang])
  const inSection = entries.filter(e => e.section === section)
  const visible = onlyIssues ? inSection.filter(e => e.flags.length) : inSection
  const toImprove = entries.filter(e => e.flags.length).length
  const carTitlePath = glossaryEntryPath(snapshot, 'car', 'seo.title')

  return (
    <Stack gap={4}>
      <Panel
        icon={SearchIcon}
        title="Aperçu Google"
        subtitle="Comment chaque page publiée apparaît dans les résultats Google sur ordinateur, avec le titre et la description que le site envoie. Google reformule parfois, mais c’est la version qu’il reçoit."
      >
        <Grid gridTemplateColumns={[1, 1, 3]} gap={3}>
          <Card padding={3} radius={2} border>
            <Stack gap={3}>
              <Text size={1} muted>Résultats analysés ({lang.toUpperCase()})</Text>
              <Heading size={2} as="p">{entries.length}</Heading>
            </Stack>
          </Card>
          <Card padding={3} radius={2} border tone={toImprove ? 'caution' : 'positive'}>
            <Stack gap={3}>
              <Text size={1} muted>À améliorer</Text>
              <Heading size={2} as="p">{toImprove}</Heading>
            </Stack>
          </Card>
          <Card padding={3} radius={2} border tone="positive">
            <Stack gap={3}>
              <Text size={1} muted>Parfaits</Text>
              <Heading size={2} as="p">{entries.length - toImprove}</Heading>
            </Stack>
          </Card>
        </Grid>

        <Flex gap={3} wrap="wrap" align="center" justify="space-between">
          <Inline gap={2}>
            {SECTIONS.map(s => (
              <Button
                key={s.id}
                mode={section === s.id ? 'default' : 'ghost'}
                tone={section === s.id ? 'primary' : 'default'}
                fontSize={1}
                padding={3}
                text={`${s.title} (${entries.filter(e => e.section === s.id).length})`}
                onClick={() => setSection(s.id)}
              />
            ))}
          </Inline>
          <Flex gap={4} align="center" wrap="wrap">
            <Inline gap={1}>
              {(['fr', 'en'] as const).map(l => (
                <Button
                  key={l}
                  mode={lang === l ? 'default' : 'bleed'}
                  fontSize={1}
                  padding={2}
                  text={l === 'fr' ? 'Français' : 'English'}
                  onClick={() => setLang(l)}
                />
              ))}
            </Inline>
            <Flex as="label" gap={2} align="center" style={{ cursor: 'pointer' }}>
              <Switch checked={onlyIssues} onChange={() => setOnlyIssues(v => !v)} />
              <Text size={1}>À améliorer seulement</Text>
            </Flex>
          </Flex>
        </Flex>
      </Panel>

      {section === 'cars' && (
        <Card padding={3} radius={2} tone="primary" border>
          <Flex gap={3} align="flex-start" wrap="wrap">
            <Text size={2}><InfoOutlineIcon /></Text>
            <Stack gap={2} flex={1} style={{ minWidth: 220 }}>
              <Text size={1} weight="semibold">Titre et description des fiches voitures : automatiques</Text>
              <Text size={1} muted>
                Le titre suit le modèle « Location {'{car}'} à {'{city}'} » du Glossaire (commun à toutes les voitures).
                La description reprend le début de la description de la voiture (160 caractères) : soignez sa première phrase.
              </Text>
            </Stack>
            {carTitlePath && <IntentButton type="glossaire" path={carTitlePath} text="Modifier le modèle de titre" />}
          </Flex>
        </Card>
      )}

      {visible.length === 0 ? (
        <Card padding={4} radius={2} tone="positive" border>
          <Flex gap={3} align="center">
            <Text size={2}><CheckmarkCircleIcon /></Text>
            <Text size={1} weight="semibold">
              {onlyIssues ? 'Rien à améliorer dans cette section.' : 'Aucune page publiée dans cette section.'}
            </Text>
          </Flex>
        </Card>
      ) : (
        <Stack gap={3}>
          {onlyIssues && (
            <Text size={1} muted>{plural(visible.length, 'résultat')} à améliorer sur {inSection.length}</Text>
          )}
          {visible.map(entry => <ResultRow key={entry.key} entry={entry} />)}
        </Stack>
      )}
    </Stack>
  )
}
