import { Button, Card, Flex } from '@sanity/ui'
import { useWorkspace } from 'sanity'
import type { NavbarProps } from 'sanity'

const LANGS: Array<{ id: 'fr' | 'en', label: string }> = [
  { id: 'fr', label: '🇫🇷 FR' },
  { id: 'en', label: '🇬🇧 EN' },
]

export function CustomNavbar(props: NavbarProps) {
  const workspace = useWorkspace()
  const currentLang = workspace.basePath.replace(/^\//, '') as 'fr' | 'en'

  const handleSwitch = (targetLang: 'fr' | 'en') => {
    if (targetLang === currentLang) return
    const newPath = window.location.pathname.replace(/^\/(fr|en)/, `/${targetLang}`)
    window.location.assign(newPath + window.location.search + window.location.hash)
  }

  return (
    <>
      {props.renderDefault(props)}
      <Card padding={2} tone="transparent" borderBottom>
        <Flex gap={2} justify="flex-end" align="center">
          {LANGS.map((lang) => (
            <Button
              key={lang.id}
              text={lang.label}
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
