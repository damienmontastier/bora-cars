<script setup lang="ts">
import type { ProFieldData } from '~/config/CONTACT_PRO_CONFIG'

const props = defineProps<{
  fields: ProFieldData[]
}>()

const { visible } = useContactProForm()

interface Block {
  field: ProFieldData
  children: ProFieldData[]
}

function pairHalves<T>(items: T[], isHalf: (item: T) => boolean): T[][] {
  const rows: T[][] = []
  for (const item of items) {
    const last = rows.at(-1)
    if (isHalf(item) && last?.length === 1 && isHalf(last[0]!))
      last.push(item)
    else
      rows.push([item])
  }
  return rows
}

const rows = computed(() => {
  const blocks: Block[] = []
  for (const field of props.fields) {
    const last = blocks.at(-1)
    if (field.showIf?.field && last?.field._key === field.showIf.field)
      last.children.push(field)
    else
      blocks.push({ field, children: [] })
  }
  return pairHalves(blocks, b => !b.children.length && b.field.width === 'half')
    .map(row => row.map(block => ({
      ...block,
      childRows: pairHalves(block.children, f => f.width === 'half'),
    })))
})
</script>

<template>
  <div class="app-elements-contact-form-pro__fields">
    <template v-for="row in rows" :key="row[0]!.field._key">
      <div v-if="row.length > 1 && row.some(b => visible(b.field))" class="app-elements-contact-form-pro__row">
        <template v-for="block in row" :key="block.field._key">
          <ElementsContactFormProField v-if="visible(block.field)" :field="block.field" />
        </template>
      </div>

      <template v-else-if="row.length === 1 && visible(row[0]!.field)">
        <div v-if="row[0]!.children.length" class="app-elements-contact-form-pro__group">
          <ElementsContactFormProField :field="row[0]!.field" />
          <div v-if="row[0]!.children.some(visible)" class="app-elements-contact-form-pro__conditional">
            <template v-for="childRow in row[0]!.childRows" :key="childRow[0]!._key">
              <div v-if="childRow.length > 1 && childRow.some(visible)" class="app-elements-contact-form-pro__row">
                <template v-for="child in childRow" :key="child._key">
                  <ElementsContactFormProField v-if="visible(child)" :field="child" />
                </template>
              </div>
              <ElementsContactFormProField v-else-if="childRow.length === 1 && visible(childRow[0]!)" :field="childRow[0]!" />
            </template>
          </div>
        </div>
        <ElementsContactFormProField v-else :field="row[0]!.field" />
      </template>
    </template>
  </div>
</template>
