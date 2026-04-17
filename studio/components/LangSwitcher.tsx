import { Button, Card, Flex } from '@sanity/ui'
import { useWorkspace } from 'sanity'
import type { NavbarProps } from 'sanity'
import { LANGUAGES, type LanguageId } from '../../shared/languages'

const LANG_IDS_PATTERN = new RegExp(`^\\/(${LANGUAGES.map((l) => l.id).join('|')})`)

export function CustomNavbar(props: NavbarProps) {
  const workspace = useWorkspace()
  const currentLang = workspace.basePath.replace(/^\//, '') as LanguageId

  const handleSwitch = (targetLang: LanguageId) => {
    if (targetLang === currentLang) return
    const newPath = window.location.pathname.replace(LANG_IDS_PATTERN, `/${targetLang}`)
    window.location.assign(newPath + window.location.search + window.location.hash)
  }

  return (
    <>
      {props.renderDefault(props)}
      <Card padding={2} tone="transparent" borderBottom>
        <Flex gap={2} justify="flex-end" align="center">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.id}
              text={`${lang.flag} ${lang.id.toUpperCase()}`}
              mode={lang.id === currentLang ? 'default' : 'ghost'}
              tone={lang.id === currentLang ? 'primary' : 'default'}
              onClick={() => handleSwitch(lang.id)}
              fontSize={1}
              padding={2}
            />
          ))}
        </Flex>
      </Card>
    </>
  )
}
