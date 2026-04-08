import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GridLayout, noCompactor, useContainerWidth } from 'react-grid-layout'
import type { EventCallback, Layout, LayoutItem } from 'react-grid-layout'
import { set } from 'sanity'
import type { ArrayOfObjectsInputProps } from 'sanity'
import 'react-grid-layout/css/styles.css'

const COLS = 12
const ROW_HEIGHT = 50
const MARGIN: [number, number] = [6, 6]
const MIN_ROWS = 8

interface CardGrid {
  x: number
  y: number
  w: number
  h: number
}

interface CardValue {
  _key: string
  _type: string
  categoryLabel?: string
  subtitle?: string
  grid?: CardGrid
}

function getDefaultPosition(index: number): CardGrid {
  const perRow = 3
  return {
    x: (index % perRow) * 4,
    y: Math.floor(index / perRow) * 3,
    w: 4,
    h: 3,
  }
}

const CARD_COLORS = ['#b91c1c', '#1e3a5f', '#1e3d2f', '#3b1f54', '#1a3550', '#7c2d12']

function GridCard({
  card,
  layoutItem,
  color,
}: {
  card: CardValue
  layoutItem?: LayoutItem
  color: string
}) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '10px 12px',
        height: '100%',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: 9,
          fontFamily: 'monospace',
          marginBottom: 3,
          letterSpacing: '0.05em',
        }}
      >
        {layoutItem
          ? `${layoutItem.w} col × ${layoutItem.h} row — [${layoutItem.x}, ${layoutItem.y}]`
          : ''}
      </span>
      <span
        style={{
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.2,
          fontFamily: 'sans-serif',
        }}
      >
        {card.categoryLabel || 'Sans titre'}
      </span>
      {card.subtitle && (
        <span
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 10,
            fontFamily: 'sans-serif',
            marginTop: 2,
          }}
        >
          {card.subtitle}
        </span>
      )}
    </div>
  )
}

function GridMakerInner({
  cards,
  layout,
  onLayoutCommit,
}: {
  cards: CardValue[]
  layout: Layout
  onLayoutCommit: (layout: Layout) => void
}) {
  const { width, containerRef, mounted } = useContainerWidth()

  // localLayout drives the visual grid. We never sync from onLayoutChange to avoid
  // the feedback loop (append → onLayoutChange → setLocalLayout → re-render → …)
  // that causes the trembling on newly added items.
  // currentRef tracks the latest committed positions so "add at bottom" is accurate.
  const [localLayout, setLocalLayout] = useState<Layout>(layout)
  const currentRef = useRef<Layout>(layout)

  useEffect(() => {
    const current = currentRef.current
    const currentKeys = new Set(current.map((l) => l.i))
    const nextKeys = new Set(layout.map((l) => l.i))

    const kept = current.filter((l) => nextKeys.has(l.i))
    const newItems = layout.filter((l) => !currentKeys.has(l.i))

    if (newItems.length === 0 && kept.length === current.length) return

    // Place new items at the bottom of the current committed layout
    const bottomY = kept.reduce((max, l) => Math.max(max, l.y + l.h), 0)
    const appended = newItems.map((item, i) => ({
      ...item,
      x: 0,
      y: bottomY + i * (item.h ?? 3),
    }))

    const next = [...kept, ...appended]
    currentRef.current = next
    setLocalLayout(next)
  }, [layout])

  const handleCommit: EventCallback = useCallback(
    (committedLayout) => {
      currentRef.current = committedLayout
      setLocalLayout(committedLayout)
      onLayoutCommit(committedLayout)
    },
    [onLayoutCommit]
  )

  const maxRow = Math.max(
    localLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0),
    MIN_ROWS
  )
  const gridHeight = maxRow * (ROW_HEIGHT + MARGIN[1]) + MARGIN[1]

  return (
    <div
      style={{
        background: '#0f0f0f',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#b91c1c' }}
          />
          <span
            style={{
              color: '#888',
              fontSize: 11,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Grid Maker — {COLS} colonnes
          </span>
        </div>
        <span style={{ color: '#444', fontSize: 11, fontFamily: 'monospace' }}>
          glisser · redimensionner
        </span>
      </div>

      {/* Grid container */}
      <div ref={containerRef as React.RefObject<HTMLDivElement>} style={{ position: 'relative' }}>
        {/* Column guides */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: `${MARGIN[0]}px`,
            pointerEvents: 'none',
            zIndex: 0,
            height: gridHeight,
          }}
        >
          {Array.from({ length: COLS }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
                borderRight:
                  i === COLS - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
              }}
            />
          ))}
        </div>

        {/* Grid layout */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {mounted && (
            <GridLayout
              layout={localLayout}
              gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT }}
              resizeConfig={{
                enabled: true,
                handles: ['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n'],
              }}
              compactor={noCompactor}
              width={width}
              onDragStop={handleCommit}
              onResizeStop={handleCommit}
              style={{ minHeight: gridHeight }}
            >
              {cards
                .filter((card) => Boolean(card._key))
                .map((card, i) => (
                  <div key={card._key}>
                    <GridCard
                      card={card}
                      color={CARD_COLORS[i % CARD_COLORS.length]}
                      layoutItem={localLayout.find((l) => l.i === card._key)}
                    />
                  </div>
                ))}
            </GridLayout>
          )}
        </div>
      </div>

      {/* Footer legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#444', fontSize: 10, fontFamily: 'monospace' }}>
          1 row = {ROW_HEIGHT}px · {maxRow} rangée{maxRow > 1 ? 's' : ''}
        </span>
        {cards.map((card, i) => {
          const item = localLayout.find((l) => l.i === card._key)
          return (
            <span
              key={card._key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#555',
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: CARD_COLORS[i % CARD_COLORS.length],
                  flexShrink: 0,
                }}
              />
              {card.categoryLabel || `carte ${i + 1}`}
              {item ? ` (${item.w}×${item.h})` : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function GridMakerInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, renderDefault } = props
  const cards = value as CardValue[]

  const layout = useMemo<Layout>(
    () =>
      cards
        .filter((card) => Boolean(card._key))
        .map((card, i) => {
          const grid = card.grid ?? getDefaultPosition(i)
          return {
            i: card._key,
            x: grid.x ?? 0,
            y: grid.y ?? 0,
            w: grid.w ?? 4,
            h: grid.h ?? 3,
            minW: 1,
            minH: 1,
          }
        }),
    [cards]
  )

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      const patches = Array.from(newLayout).map((item) =>
        set({ x: item.x, y: item.y, w: item.w, h: item.h }, [{ _key: item.i }, 'grid'])
      )
      onChange(patches)
    },
    [onChange]
  )

  if (cards.length === 0) {
    return <>{renderDefault(props)}</>
  }

  return (
    <div>
      <GridMakerInner
        cards={cards}
        layout={layout}
        onLayoutCommit={handleLayoutChange}
      />
      {renderDefault(props)}
    </div>
  )
}
