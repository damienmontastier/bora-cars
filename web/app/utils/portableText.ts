import { TextsH1, TextsH2, TextsH3, TextsP1, TextsP2 } from '#components'
import { h } from 'vue'

interface PortableTextOptions {
  color?: string
  eyebrow?: string
  eyebrowClass?: string
}

export function getPortableTextComponents(colorOrOptions: string | PortableTextOptions = 'black-100') {
  const { color = 'black-100', eyebrow, eyebrowClass } = typeof colorOrOptions === 'string'
    ? { color: colorOrOptions }
    : colorOrOptions

  const renderBlock = (Component: any, tag: string, props: any, slots: any) => {
    const showEyebrow = eyebrow && props.index === 0
    if (showEyebrow) {
      return h(Component, { tag, color }, () => [
        h(
          TextsP2,
          { tag: 'span', color, selectable: false, class: eyebrowClass },
          () => eyebrow,
        ),
        slots.default?.(),
      ])
    }
    return h(Component, { tag, color }, slots.default)
  }

  return {
    block: {
      normal: (props: any, { slots }: any) => renderBlock(TextsP2, 'p', props, slots),
      h1: (props: any, { slots }: any) => renderBlock(TextsH1, 'h1', props, slots),
      h2: (props: any, { slots }: any) => renderBlock(TextsH2, 'h2', props, slots),
      h3: (props: any, { slots }: any) => renderBlock(TextsH3, 'h3', props, slots),
      p1: (props: any, { slots }: any) => renderBlock(TextsP1, 'p', props, slots),
    },
    marks: {
      strong: (_: any, { slots }: any) => h('strong', {}, slots.default?.()),
      em: (_: any, { slots }: any) => h('em', {}, slots.default?.()),
    },
  }
}
