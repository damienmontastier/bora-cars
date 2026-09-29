import { Card, Flex, Text } from '@sanity/ui'
import { useFormValue } from 'sanity'
import type { ObjectItemProps } from 'sanity'

export function HeroArrayItem(props: ObjectItemProps) {
  const modules = useFormValue(['modules']) as Array<{ _type: string, _key: string }> | undefined
  const index = modules?.findIndex(m => m._key === props.value?._key) ?? 0
  const firstHeroIndex = modules?.findIndex(m => m._type === 'hero') ?? 0
  const isMain = index === 0
  const isSecondary = !isMain && firstHeroIndex === 0

  return (
    <Card
      radius={2}
      style={{
        outline: isMain || isSecondary ? '1.5px solid var(--card-badge-positive-dot-color)' : '2px solid var(--card-badge-critical-dot-color)',
      }}
    >
      {props.renderDefault(props)}
      {isSecondary && (
        <Flex padding={2} style={{ background: 'var(--card-badge-default-bg-color)' }}>
          <Text size={1} muted>
            Hero secondaire : affiché à cet endroit de la page, sans le grand logo, avec son propre bouton de contact.
          </Text>
        </Flex>
      )}
      {!isMain && !isSecondary && (
        <Flex padding={2} style={{ background: 'var(--card-badge-critical-bg-color)' }}>
          <Text size={1} style={{ color: 'var(--card-badge-critical-fg-color)' }}>
            ⚠️ Le premier Hero doit être en première position — déplacez-le vers le haut
          </Text>
        </Flex>
      )}
    </Card>
  )
}
