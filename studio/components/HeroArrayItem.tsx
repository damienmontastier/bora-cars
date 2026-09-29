import { Card, Flex, Text } from '@sanity/ui'
import { useFormValue } from 'sanity'
import type { ObjectItemProps } from 'sanity'

export function HeroArrayItem(props: ObjectItemProps) {
  const modules = useFormValue(['modules']) as Array<{ _type: string, _key: string }> | undefined
  const heroes = modules?.filter(m => m._type === 'hero') ?? []
  const isFirstHero = heroes[0]?._key === props.value?._key
  const problem = !isFirstHero
    ? '⚠️ Un seul Hero par page : supprimez celui-ci et utilisez un bloc « Média + texte » à la place'
    : modules?.[0]?._key !== props.value?._key
      ? '⚠️ Le Hero doit être en première position — déplacez-le vers le haut'
      : null

  return (
    <Card
      radius={2}
      style={{
        outline: problem ? '2px solid var(--card-badge-critical-dot-color)' : '1.5px solid var(--card-badge-positive-dot-color)',
      }}
    >
      {props.renderDefault(props)}
      {problem && (
        <Flex padding={2} style={{ background: 'var(--card-badge-critical-bg-color)' }}>
          <Text size={1} style={{ color: 'var(--card-badge-critical-fg-color)' }}>
            {problem}
          </Text>
        </Flex>
      )}
    </Card>
  )
}
