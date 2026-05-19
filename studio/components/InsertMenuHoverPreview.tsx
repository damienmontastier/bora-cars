import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Card, Flex, Box, Text } from '@sanity/ui'
import { EyeOpenIcon } from '@sanity/icons'
import { useSchema } from 'sanity'

interface HoverInfo {
  typeName: string
  rect: DOMRect
}

const HOVER_WIDTH = 360

function humanize(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim()
}

export function InsertMenuHoverPreview() {
  const schema = useSchema()
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})

  const titleMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const name of schema.getTypeNames()) {
      const type = schema.get(name)
      if (type) {
        const title = (type.title ?? name).trim()
        if (title) map.set(title, name)
      }
    }
    return map
  }, [schema])

  useEffect(() => {
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const item = target.closest('[data-ui="MenuItem"]')
      if (!item) return

      const text = (item.textContent ?? '').trim()
      if (!text) return

      const typeName = titleMap.get(text)
      if (!typeName) {
        setHover(null)
        return
      }

      setHover({ typeName, rect: item.getBoundingClientRect() })
    }

    const onOut = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const item = target?.closest('[data-ui="MenuItem"]')
      if (!item) return
      const related = e.relatedTarget as HTMLElement | null
      if (related && item.contains(related)) return
      setHover(null)
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [titleMap])

  useEffect(() => {
    if (!hover) return
    if (hover.typeName in availability) return
    const typeName = hover.typeName
    const img = new Image()
    img.onload = () => setAvailability(a => ({ ...a, [typeName]: true }))
    img.onerror = () => setAvailability(a => ({ ...a, [typeName]: false }))
    img.src = `/static/module-thumbnails/${typeName}.webp`
  }, [hover, availability])

  if (!hover) return null
  if (availability[hover.typeName] !== true) return null

  const src = `/static/module-thumbnails/${hover.typeName}.webp`
  const left = Math.min(hover.rect.right + 8, window.innerWidth - HOVER_WIDTH - 8)
  const top = Math.max(8, Math.min(hover.rect.top, window.innerHeight - 320))

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 999999,
        pointerEvents: 'none',
      }}
    >
      <Card radius={2} shadow={3} style={{ width: HOVER_WIDTH, overflow: 'hidden' }}>
        <Flex
          align="center"
          gap={2}
          padding={2}
          style={{ borderBottom: '1px solid var(--card-border-color)' }}
        >
          <Text size={1} muted>
            <EyeOpenIcon />
          </Text>
          <Text size={1} muted>
            Aperçu —
          </Text>
          <Text size={1} weight="medium">
            {humanize(hover.typeName)}
          </Text>
        </Flex>
        <Box style={{ background: 'var(--card-muted-bg-color)' }}>
          <img src={src} alt="" style={{ width: '100%', display: 'block' }} />
        </Box>
      </Card>
    </div>,
    document.body,
  )
}
