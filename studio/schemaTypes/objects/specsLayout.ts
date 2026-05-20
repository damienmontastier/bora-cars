import { defineArrayMember, defineField, defineType } from 'sanity'
import { SpecsLayoutInput } from '../../components/SpecsLayoutInput'

export const specsLayoutType = defineType({
  name: 'specsLayout',
  title: 'Mise en page des specs',
  type: 'object',
  components: { input: SpecsLayoutInput as any },
  fields: [
    defineField({
      name: 'fixed',
      title: 'Row fixe',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'list',
      title: 'Liste',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
  ],
})
