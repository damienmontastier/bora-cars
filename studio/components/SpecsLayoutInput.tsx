import React, { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { set, unset, useFormValue } from 'sanity'
import type { ObjectInputProps } from 'sanity'
import { Badge, Box, Card, Flex, Stack, Text, Tooltip } from '@sanity/ui'
import { WarningOutlineIcon } from '@sanity/icons'

const SPECS: { key: string, label: string }[] = [
  { key: 'teinteExterieure', label: 'Teinte extérieure' },
  { key: 'teinteInterieure', label: 'Teintes intérieures & matière' },
  { key: 'nombrePlaces', label: 'Nombre de places' },
  { key: 'nombrePortes', label: 'Nombre de portes' },
  { key: 'gamme', label: 'Gamme' },
  { key: 'annee', label: 'Année' },
  { key: 'boiteVitesse', label: 'Boîte de vitesse' },
  { key: 'carburant', label: 'Carburant' },
]

const SPEC_LABEL: Record<string, string> = Object.fromEntries(SPECS.map(s => [s.key, s.label]))
const ALL_KEYS = SPECS.map(s => s.key)

type ZoneId = 'pool' | 'fixed' | 'list'

interface SpecsLayoutValue {
  fixed?: string[]
  list?: string[]
}

interface State {
  pool: string[]
  fixed: string[]
  list: string[]
}

function computeState(value?: SpecsLayoutValue): State {
  const fixed = (value?.fixed ?? []).filter(k => ALL_KEYS.includes(k))
  const list = (value?.list ?? []).filter(k => ALL_KEYS.includes(k))
  const used = new Set([...fixed, ...list])
  const pool = ALL_KEYS.filter(k => !used.has(k))
  return { pool, fixed, list }
}

function findZone(state: State, id: UniqueIdentifier): ZoneId | null {
  if (id === 'pool' || id === 'fixed' || id === 'list') return id as ZoneId
  if (state.pool.includes(id as string)) return 'pool'
  if (state.fixed.includes(id as string)) return 'fixed'
  if (state.list.includes(id as string)) return 'list'
  return null
}

function isI18nArrayFilled(value: unknown): boolean {
  if (!Array.isArray(value)) return false
  return value.some((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const v = (entry as { value?: unknown }).value
    return typeof v === 'string' ? v.trim().length > 0 : v != null
  })
}

function isSpecFilled(key: string, doc: any): boolean {
  if (!doc) return false
  const v = doc[key]
  switch (key) {
    case 'teinteExterieure':
    case 'teinteInterieure':
      return isI18nArrayFilled(v)
    case 'nombrePlaces':
    case 'nombrePortes':
      return typeof v === 'number' && v > 0
    case 'gamme':
    case 'annee':
    case 'boiteVitesse':
    case 'carburant':
      return typeof v === 'string' && v.length > 0
    default:
      return v != null && v !== ''
  }
}

function SortableItem({ id, label, missing, isDragging }: { id: string, label: string, missing?: boolean, isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: dragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dragging || isDragging ? 0.4 : 1,
    touchAction: 'none',
    cursor: 'grab',
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        padding={2}
        radius={2}
        shadow={1}
        tone={missing ? 'caution' : 'default'}
        style={{ userSelect: 'none' }}
      >
        <Flex align="center" gap={2}>
          <Text size={1} weight="medium" style={{ flex: 1 }}>⋮⋮ {label}</Text>
          {missing
            ? (
                <Tooltip
                  content={(
                    <Box padding={2}>
                      <Text size={1}>Le champ « {label} » est vide — il ne s'affichera pas sur le site.</Text>
                    </Box>
                  )}
                  placement="top"
                  portal
                >
                  <Badge tone="caution" mode="outline" radius={2} padding={1}>
                    <Flex align="center" gap={1}>
                      <WarningOutlineIcon />
                      <Text size={0} weight="semibold">vide</Text>
                    </Flex>
                  </Badge>
                </Tooltip>
              )
            : null}
        </Flex>
      </Card>
    </div>
  )
}

function Zone({
  id,
  title,
  items,
  missingByKey,
  emptyHint,
}: {
  id: ZoneId
  title: string
  items: string[]
  missingByKey: Record<string, boolean>
  emptyHint: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <Stack space={2}>
      <Text size={1} weight="semibold" muted>{title}</Text>
      <div
        ref={setNodeRef}
        style={{
          minHeight: 60,
          padding: 8,
          borderRadius: 6,
          background: isOver ? 'var(--card-muted-bg-color, #f1f3f6)' : 'var(--card-bg-color, transparent)',
          border: '1px dashed var(--card-border-color, #d1d6dd)',
          transition: 'background 120ms ease',
        }}
      >
        <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
          <Stack space={2}>
            {items.length === 0
              ? <Text size={1} muted style={{ fontStyle: 'italic', padding: 4 }}>{emptyHint}</Text>
              : items.map(key => (
                <SortableItem
                  key={key}
                  id={key}
                  label={SPEC_LABEL[key] ?? key}
                  missing={missingByKey[key]}
                />
              ))}
          </Stack>
        </SortableContext>
      </div>
    </Stack>
  )
}

export function SpecsLayoutInput(props: ObjectInputProps<SpecsLayoutValue>) {
  const { value, onChange } = props
  const [activeId, setActiveId] = useState<string | null>(null)

  const doc = useFormValue([]) as Record<string, unknown> | undefined

  const state = useMemo(() => computeState(value), [value])

  const missingByKey = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const { key } of SPECS) map[key] = !isSpecFilled(key, doc)
    return map
  }, [doc])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const emit = useCallback((next: State) => {
    const patch = { fixed: next.fixed, list: next.list }
    const isEmpty = next.fixed.length === 0 && next.list.length === 0
    onChange(isEmpty ? unset() : set(patch))
  }, [onChange])

  const moveBetweenZones = useCallback((current: State, activeKey: string, from: ZoneId, to: ZoneId, overKey?: string): State => {
    if (from === to) return current
    const next: State = { pool: [...current.pool], fixed: [...current.fixed], list: [...current.list] }
    next[from] = next[from].filter(k => k !== activeKey)
    const overIndex = overKey ? next[to].indexOf(overKey) : -1
    if (overIndex >= 0) next[to].splice(overIndex, 0, activeKey)
    else next[to].push(activeKey)
    return next
  }, [])

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id))
  }, [])

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const activeKey = String(active.id)
    const overId = String(over.id)
    const from = findZone(state, active.id)
    const to = findZone(state, over.id)
    if (!from || !to || from === to) return
    const next = moveBetweenZones(state, activeKey, from, to, overId === to ? undefined : overId)
    emit(next)
  }, [state, moveBetweenZones, emit])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const activeKey = String(active.id)
    const overKey = String(over.id)
    const from = findZone(state, active.id)
    const to = findZone(state, over.id)
    if (!from || !to) return

    if (from === to) {
      const arr = state[from]
      const oldIndex = arr.indexOf(activeKey)
      const newIndex = arr.indexOf(overKey)
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return
      const reordered = arrayMove(arr, oldIndex, newIndex)
      emit({ ...state, [from]: reordered })
    }
  }, [state, emit])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <Stack space={4}>
        <Zone id="fixed" title="ROW FIXE (en haut)" items={state.fixed} missingByKey={missingByKey} emptyHint="Glisse une spec ici" />
        <Zone id="list" title="LISTE (en dessous)" items={state.list} missingByKey={missingByKey} emptyHint="Glisse une spec ici" />
        <Zone id="pool" title="DISPONIBLES (non affichées)" items={state.pool} missingByKey={missingByKey} emptyHint="Toutes les specs sont placées" />
      </Stack>
      <DragOverlay>
        {activeId
          ? (
              <Card padding={2} radius={2} shadow={3} tone="primary" style={{ cursor: 'grabbing' }}>
                <Text size={1} weight="medium">⋮⋮ {SPEC_LABEL[activeId] ?? activeId}</Text>
              </Card>
            )
          : null}
      </DragOverlay>
    </DndContext>
  )
}
