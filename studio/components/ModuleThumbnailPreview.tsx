import { useState, useEffect } from 'react'
import type { PreviewProps } from 'sanity'
import { Tooltip, Box, Flex, Text, Card } from '@sanity/ui'
import { EyeOpenIcon } from '@sanity/icons'

const HOVER_WIDTH = 360

export function ModuleThumbnailPreview(props: PreviewProps) {
  const schemaType = (props as PreviewProps & { schemaType?: { name: string, title?: string } }).schemaType
  const variant = (props as PreviewProps & { variant?: string }).variant
  const typeName = schemaType?.name
  const typeTitle = schemaType?.title ?? typeName
  const filename = typeName === 'hero' && variant ? `hero-${variant}` : typeName
  const src = filename ? `/static/module-thumbnails/${filename}.webp` : null
  const [available, setAvailable] = useState(false)

  if (typeName === 'hero') {
    // eslint-disable-next-line no-console
    console.log('[ModuleThumbnailPreview] hero', { variant, filename, src, props })
  }

  useEffect(() => {
    if (!src) return
    let cancelled = false
    const img = new Image()
    img.onload = () => { if (!cancelled) setAvailable(true) }
    img.onerror = () => { if (!cancelled) setAvailable(false) }
    img.src = src
    return () => { cancelled = true }
  }, [src])

  if (!src || !available) return props.renderDefault(props)

  return (
    <Tooltip
      portal
      placement="right"
      fallbackPlacements={['left', 'top', 'bottom']}
      content={
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
              {typeTitle}
            </Text>
          </Flex>
          <Box style={{ background: 'var(--card-muted-bg-color)' }}>
            <img
              src={src}
              alt=""
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
        </Card>
      }
    >
      <Box style={{ width: '100%' }}>
        {props.renderDefault(props)}
      </Box>
    </Tooltip>
  )
}
