import React, { useCallback, useMemo } from 'react'
import { set, unset, useFormValue } from 'sanity'
import type { ObjectInputProps } from 'sanity'
import { Card, Checkbox, Flex, Select, Stack, Text } from '@sanity/ui'
import { pickLocalized } from '../lib/preview'

interface ConditionValue {
  field?: string
  values?: string[]
}

interface FieldValue {
  _key: string
  _type: string
  label?: unknown
  options?: { _key: string, label?: unknown }[]
}

interface StepValue {
  _key: string
  tab?: unknown
  fields?: FieldValue[]
}

interface Source {
  key: string
  step: string
  label: string
  answers: { value: string, label: string }[]
}

const SOURCE_TYPES = ['proFieldChoice', 'proFieldYesNo', 'proFieldCheckbox']

function answersOf(field: FieldValue): Source['answers'] {
  if (field._type === 'proFieldYesNo')
    return [{ value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' }]
  if (field._type === 'proFieldCheckbox')
    return [{ value: 'checked', label: 'Case cochée' }]
  return (field.options ?? []).map(o => ({ value: o._key, label: pickLocalized(o.label) || 'Choix sans libellé' }))
}

export function ProFieldConditionInput(props: ObjectInputProps<ConditionValue>) {
  const { value, onChange, path, readOnly } = props
  const steps = useFormValue(['proForm', 'steps']) as StepValue[] | undefined
  const self = path[path.length - 2] as { _key?: string } | undefined

  const sources = useMemo<Source[]>(() => (steps ?? []).flatMap((step, index) =>
    (step.fields ?? [])
      .filter(f => SOURCE_TYPES.includes(f._type) && f._key !== self?._key)
      .map(f => ({
        key: f._key,
        step: `${String.fromCharCode(65 + index)} · ${pickLocalized(step.tab) || 'Étape'}`,
        label: pickLocalized(f.label) || 'Question sans libellé',
        answers: answersOf(f),
      }))), [steps, self?._key])

  const source = sources.find(s => s.key === value?.field)
  const selected = value?.values ?? []

  const onSource = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const key = event.currentTarget.value
    if (!key) {
      onChange(unset())
      return
    }
    const next = sources.find(s => s.key === key)
    onChange(set({ field: key, values: next?.answers.length === 1 ? [next.answers[0]!.value] : [] }))
  }, [onChange, sources])

  const onAnswer = useCallback((answer: string, checked: boolean) => {
    const values = checked ? [...selected.filter(v => v !== answer), answer] : selected.filter(v => v !== answer)
    onChange(set({ field: value?.field, values }))
  }, [onChange, selected, value?.field])

  return (
    <Stack gap={3}>
      <Select value={value?.field ?? ''} onChange={onSource} disabled={readOnly}>
        <option value="">Toujours affiché</option>
        {value?.field && !source && <option value={value.field}>⚠ Question supprimée</option>}
        {sources.map(s => (
          <option key={s.key} value={s.key}>{`${s.step} — ${s.label}`}</option>
        ))}
      </Select>

      {value?.field && !source && (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>La question dont dépendait ce champ n’existe plus. Choisissez-en une autre, ou « Toujours affiché ».</Text>
        </Card>
      )}

      {source && (
        <Card padding={3} radius={2} border>
          <Stack gap={3}>
            <Text size={1} muted>Afficher ce champ si la réponse est :</Text>
            {source.answers.map(answer => (
              <Flex key={answer.value} align="center" gap={2} as="label">
                <Checkbox
                  checked={selected.includes(answer.value)}
                  disabled={readOnly}
                  onChange={event => onAnswer(answer.value, event.currentTarget.checked)}
                />
                <Text size={1}>{answer.label}</Text>
              </Flex>
            ))}
            {!selected.length && (
              <Text size={1} style={{ color: 'var(--card-badge-caution-fg-color)' }}>Cochez au moins une réponse.</Text>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
