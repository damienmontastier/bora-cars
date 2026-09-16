import { Box, Card, Flex, Grid, Stack, Text } from '@sanity/ui'
import { AddIcon } from '@sanity/icons/Add'
import { ChartUpwardIcon } from '@sanity/icons/ChartUpward'
import { CogIcon } from '@sanity/icons/Cog'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { HomeIcon } from '@sanity/icons/Home'
import { LaunchIcon } from '@sanity/icons/Launch'
import { LinkIcon } from '@sanity/icons/Link'
import { SearchIcon } from '@sanity/icons/Search'
import { TranslateIcon } from '@sanity/icons/Translate'
import { PREVIEW_SITE_URL, SITE_URL } from '../../lib/netlifyDeploy'
import { ExternalButton, IntentButton, Panel } from './shared'

const STEPS = [
  {
    title: 'Modifier',
    text: 'Ouvrez un contenu dans l’onglet « Structure » et modifiez-le. Tout est enregistré automatiquement en brouillon : invisible sur le site.',
  },
  {
    title: 'Publier',
    text: 'Cliquez sur le bouton vert « Publier » en bas à droite du document. Le contenu apparaît en quelques instants sur le site de test (develop.boracars.com).',
  },
  {
    title: 'Mettre en ligne',
    text: 'boracars.com est pré-généré pour être ultra-rapide : cliquez sur « Mettre en ligne » (ci-contre ou onglet « Mise en ligne »). Visible en 1 à 3 minutes.',
  },
]

export function HowItWorks() {
  return (
    <Panel icon={HelpCircleIcon} title="Mettre une modification en ligne" subtitle="Trois étapes, toujours dans cet ordre : brouillon → publié → en ligne.">
      <Stack gap={3}>
        {STEPS.map((step, i) => (
          <Flex key={step.title} gap={3} align="flex-start">
            <Card
              radius={6}
              tone="primary"
              style={{ width: 26, height: 26, flex: 'none', display: 'grid', placeItems: 'center' }}
            >
              <Text size={1} weight="bold">{i + 1}</Text>
            </Card>
            <Stack gap={2} flex={1}>
              <Text size={1} weight="semibold">{step.title}</Text>
              <Text size={1} muted>{step.text}</Text>
            </Stack>
          </Flex>
        ))}
        <Card padding={3} radius={2} tone="transparent" border>
          <Text size={1} muted>
            Astuce : publiez plusieurs documents à la suite, vérifiez-les sur le site de test, puis mettez en ligne une seule fois à la fin.
          </Text>
        </Card>
      </Stack>
    </Panel>
  )
}

export function Shortcuts({ socialLinks }: { socialLinks: string[] }) {
  const instagram = socialLinks.find(url => url.includes('instagram.com'))

  return (
    <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
      <Panel icon={AddIcon} title="Raccourcis" subtitle="Les actions les plus courantes.">
        <Stack gap={2}>
          <Box><IntentButton intent="create" type="car" text="Ajouter une voiture" icon={AddIcon} iconRight={null} mode="default" tone="primary" /></Box>
          <Box><IntentButton type="bio" text="Mettre à jour la page Bio (Instagram)" icon={LinkIcon} /></Box>
          <Box><IntentButton type="homepage" text="Modifier la page d’accueil" icon={HomeIcon} /></Box>
          <Box><IntentButton type="glossaire" text="Modifier un texte du site (boutons, libellés…)" icon={TranslateIcon} /></Box>
          <Box><IntentButton type="settings" text="Paramètres : contact, devise, réseaux sociaux" icon={CogIcon} /></Box>
        </Stack>
      </Panel>

      <Panel icon={LaunchIcon} title="Liens utiles" subtitle="S’ouvrent dans un nouvel onglet.">
        <Flex gap={2} wrap="wrap">
          <ExternalButton href={`${SITE_URL}/fr`} text="Site (FR)" icon={EarthGlobeIcon} />
          <ExternalButton href={`${SITE_URL}/en`} text="Site (EN)" icon={EarthGlobeIcon} />
          <ExternalButton href={`${PREVIEW_SITE_URL}/fr`} text="Site de test (develop)" icon={EarthGlobeIcon} />
          <ExternalButton href={`${SITE_URL}/bio`} text="Page Bio" icon={LinkIcon} />
          {instagram && <ExternalButton href={instagram} text="Instagram" icon={LinkIcon} />}
          <ExternalButton href="https://search.google.com/search-console" text="Google Search Console" icon={SearchIcon} />
          <ExternalButton href="https://analytics.google.com" text="Google Analytics" icon={ChartUpwardIcon} />
        </Flex>
      </Panel>
    </Grid>
  )
}
