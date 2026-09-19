import { TextsH1, TextsH2, TextsH3, TextsP1, TextsP2, UtilsBaseLink } from '#components'
import { h } from 'vue'

interface PortableTextOptions {
  color?: string
  eyebrow?: string
  eyebrowClass?: string
  animated?: boolean
}

export function getPortableTextComponents(colorOrOptions: string | PortableTextOptions = 'black-100') {
  const { color = 'black-100', eyebrow, eyebrowClass, animated } = typeof colorOrOptions === 'string'
    ? { color: colorOrOptions }
    : colorOrOptions

  const headingProps = animated === undefined ? {} : { animated }

  const renderBlock = (Component: any, tag: string, props: any, slots: any, extra: any = {}) => {
    const showEyebrow = eyebrow && props.index === 0
    if (showEyebrow) {
      return h(Component, { tag, color, ...extra }, () => [
        h(
          TextsP2,
          { tag: 'span', color, selectable: false, class: eyebrowClass },
          () => eyebrow,
        ),
        slots.default?.(),
      ])
    }
    return h(Component, { tag, color, ...extra }, slots.default)
  }

  return {
    block: {
      normal: (props: any, { slots }: any) => renderBlock(TextsP2, 'p', props, slots),
      h1: (props: any, { slots }: any) => renderBlock(TextsH1, 'h1', props, slots, headingProps),
      h2: (props: any, { slots }: any) => renderBlock(TextsH2, 'h2', props, slots, headingProps),
      h3: (props: any, { slots }: any) => renderBlock(TextsH3, 'h3', props, slots, headingProps),
      p1: (props: any, { slots }: any) => renderBlock(TextsP1, 'p', props, slots),
    },
    marks: {
      strong: (_: any, { slots }: any) => h('strong', {}, slots.default?.()),
      em: (_: any, { slots }: any) => h('em', {}, slots.default?.()),
      underline: (_: any, { slots }: any) => h('u', {}, slots.default?.()),
      link: ({ value }: any, { slots }: any) => h(UtilsBaseLink, { to: value, class: 'portable-link' }, slots.default),
    },
    list: {
      bullet: (_: any, { slots }: any) => h('ul', { class: 'portable-list portable-list--bullet' }, slots.default?.()),
      number: (_: any, { slots }: any) => h('ol', { class: 'portable-list portable-list--number' }, slots.default?.()),
    },
    listItem: {
      bullet: (_: any, { slots }: any) => h(TextsP2, { tag: 'li', color, class: 'portable-list__item' }, slots.default),
      number: (_: any, { slots }: any) => h(TextsP2, { tag: 'li', color, class: 'portable-list__item' }, slots.default),
    },
  }
}
