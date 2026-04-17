import imageUrlBuilder from '@sanity/image-url'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GridLayout, noCompactor, useContainerWidth } from 'react-grid-layout'
import type { EventCallback, Layout } from 'react-grid-layout'
import { set, useClient } from 'sanity'
import type { ArrayOfObjectsInputProps } from 'sanity'
import 'react-grid-layout/css/styles.css'
import { pickLocalized } from '../lib/preview'

const COLS = 12
const ROW_HEIGHT = 120
const MARGIN: [number, number] = [6, 6]
const MIN_ROWS = 4

interface CardGrid {
  x: number
  y: number
  w: number
  h: number
}

type CardType = 'xxl' | 'xl' | 'l' | 'm'

interface SanityImageRef {
  _type: 'image'
  asset?: { _ref?: string; _type?: string; url?: string }
}

interface CardMedia {
  mediaType?: 'image' | 'video'
  image?: SanityImageRef
}

interface CardValue {
  _key: string
  _type: string
  cardType?: CardType
  categoryLabel?: unknown
  subtitle?: unknown
  grid?: CardGrid
  media?: CardMedia
}

const CARD_TYPE_SIZE: Record<CardType, { w: number, h: number }> = {
  xxl: { w: 6, h: 1 },
  xl:  { w: 6, h: 1 },
  l:   { w: 3, h: 1 },
  m:   { w: 3, h: 1 },
}

function getSizeFromType(cardType?: CardType): { w: number, h: number } {
  return CARD_TYPE_SIZE[cardType ?? 'xl']
}

// Trouve le premier slot libre dans la grille sans overlap
function findFreeSlot(occupied: boolean[][], w: number, h: number): { x: number, y: number } {
  let y = 0
  while (true) {
    for (let x = 0; x <= COLS - w; x++) {
      let fits = true
      outer: for (let row = y; row < y + h; row++) {
        for (let col = x; col < x + w; col++) {
          if (occupied[row]?.[col]) { fits = false; break outer }
        }
      }
      if (fits) return { x, y }
    }
    y++
  }
}

function occupySlot(occupied: boolean[][], x: number, y: number, w: number, h: number) {
  for (let row = y; row < y + h; row++) {
    if (!occupied[row]) occupied[row] = []
    for (let col = x; col < x + w; col++) {
      occupied[row][col] = true
    }
  }
}

const TYPE_LABEL: Record<CardType, string> = { xxl: 'XXL', xl: 'XL', l: 'L', m: 'M' }

function GridCard({ card, imageUrl }: { card: CardValue; imageUrl?: string }) {
  const typeLabel = TYPE_LABEL[card.cardType ?? 'xl']
  const categoryLabel = pickLocalized(card.categoryLabel)
  const subtitle = pickLocalized(card.subtitle)
  return (
    <div
      style={{
        background: '#1c1c1c',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box',
        userSelect: 'none',
        cursor: 'grab',
      }}
    >
      {/* Image area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
        )}
        {/* Type badge */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          {typeLabel}
        </div>
      </div>

      {/* Label area */}
      <div
        style={{
          background: '#e6e7df',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: '#0c0c0a',
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {categoryLabel || 'Sans titre'}
        </span>
        {subtitle && (
          <>
            <span style={{ color: '#0c0c0a', fontSize: 9, opacity: 0.4 }}>—</span>
            <span
              style={{
                color: '#0c0c0a',
                fontSize: 9,
                fontFamily: 'sans-serif',
                opacity: 0.6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function GridMakerInner({
  cards,
  layout,
  onLayoutCommit,
  imageUrls,
}: {
  cards: CardValue[]
  layout: Layout
  onLayoutCommit: (layout: Layout) => void
  imageUrls: Record<string, string>
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

    // Sync w/h for existing items whose type changed
    const kept = current
      .filter((l) => nextKeys.has(l.i))
      .map((currentItem) => {
        const nextItem = layout.find((l) => l.i === currentItem.i)
        if (nextItem && (nextItem.w !== currentItem.w || nextItem.h !== currentItem.h)) {
          return { ...currentItem, w: nextItem.w, h: nextItem.h }
        }
        return currentItem
      })

    const newItems = layout.filter((l) => !currentKeys.has(l.i))
    const sizeChanged = kept.some((k) => {
      const prev = current.find(c => c.i === k.i)
      return prev && (prev.w !== k.w || prev.h !== k.h)
    })

    if (newItems.length === 0 && !sizeChanged && kept.length === current.length) return

    // Place new items at the bottom without overlapping
    let nextY = kept.reduce((max, l) => Math.max(max, l.y + l.h), 0)
    const appended = newItems.map((item) => {
      const placed = { ...item, x: 0, y: nextY }
      nextY += item.h
      return placed
    })

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
          glisser pour repositionner
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
              resizeConfig={{ enabled: false }}
              compactor={noCompactor}
              width={width}
              onDragStop={handleCommit}
              onResizeStop={handleCommit}
              style={{ minHeight: gridHeight }}
            >
              {cards
                .filter((card) => Boolean(card._key))
                .map((card) => (
                  <div key={card._key}>
                    <GridCard card={card} imageUrl={imageUrls[card._key]} />
                  </div>
                ))}
            </GridLayout>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}
      >
        {cards.map((card) => (
          <span
            key={card._key}
            style={{
              color: '#555',
              fontSize: 10,
              fontFamily: 'monospace',
              background: 'rgba(255,255,255,0.04)',
              padding: '2px 6px',
              borderRadius: 3,
            }}
          >
            {TYPE_LABEL[card.cardType ?? 'xl']} · {pickLocalized(card.categoryLabel) || '—'}
          </span>
        ))}
      </div>
    </div>
  )
}

export function GridMakerInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, renderDefault } = props
  const cards = value as CardValue[]
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = useMemo(() => imageUrlBuilder(client), [client])

  const imageUrls = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    for (const card of cards) {
      if (!card._key) continue
      const ref = card.media?.image?.asset?._ref
      if (ref) {
        result[card._key] = builder.image(ref).width(400).auto('format').url()
      }
    }
    return result
  }, [cards, builder])

  const layout = useMemo<Layout>(() => {
    const occupied: boolean[][] = []
    const result: Array<{ i: string, x: number, y: number, w: number, h: number }> = []

    for (const card of cards.filter(c => Boolean(c._key))) {
      const { w, h } = getSizeFromType(card.cardType)
      const saved = card.grid

      if (saved) {
        let fits = true
        outer: for (let row = saved.y; row < saved.y + h; row++) {
          for (let col = saved.x; col < saved.x + w; col++) {
            if (occupied[row]?.[col]) { fits = false; break outer }
          }
        }
        if (fits) {
          occupySlot(occupied, saved.x, saved.y, w, h)
          result.push({ i: card._key, x: saved.x, y: saved.y, w, h })
          continue
        }
      }

      const { x, y } = findFreeSlot(occupied, w, h)
      occupySlot(occupied, x, y, w, h)
      result.push({ i: card._key, x, y, w, h })
    }

    return result as Layout
  }, [cards])

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
        imageUrls={imageUrls}
      />
      {renderDefault(props)}
    </div>
  )
}
