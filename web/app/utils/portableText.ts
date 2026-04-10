import { TextsH1, TextsH2, TextsH3, TextsP1, TextsP2 } from '#components'
import { h } from 'vue'

export function getPortableTextComponents(color = 'black-100') {
  return {
    block: {
      normal: (_: any, { slots }: any) =>
        h(TextsP2, { tag: 'p', color }, slots.default),
      h1: (_: any, { slots }: any) =>
        h(TextsH1, { tag: 'h1', color }, slots.default),
      h2: (_: any, { slots }: any) =>
        h(TextsH2, { tag: 'h2', color }, slots.default),
      h3: (_: any, { slots }: any) =>
        h(TextsH3, { tag: 'h3', color }, slots.default),
      p1: (_: any, { slots }: any) =>
        h(TextsP1, { tag: 'p', color }, slots.default),
    },
    marks: {
      strong: (_: any, { slots }: any) => h('strong', {}, slots.default?.()),
      em: (_: any, { slots }: any) => h('em', {}, slots.default?.()),
    },
  }
}
