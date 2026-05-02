import { Card, Flex, Text } from '@sanity/ui'
import { useFormValue } from 'sanity'
import type { ObjectItemProps } from 'sanity'

export function HeroArrayItem(props: ObjectItemProps) {
  const modules = useFormValue(['modules']) as Array<{ _type: string }> | undefined
  const heroIndex = modules?.findIndex(m => m._type === 'hero') ?? 0
  const isFirst = heroIndex === 0

  return (
    <Card
      radius={2}
      style={{
        outline: isFirst ? '1.5px solid var(--card-badge-positive-dot-color)' : '2px solid var(--card-badge-critical-dot-color)',
      }}
    >
      {props.renderDefault(props)}
      {!isFirst && (
        <Flex padding={2} style={{ background: 'var(--card-badge-critical-bg-color)' }}>
          <Text size={1} style={{ color: 'var(--card-badge-critical-fg-color)' }}>
            ⚠️ Le Hero doit être en première position — déplacez-le vers le haut
          </Text>
        </Flex>
      )}
    </Card>
  )
}
