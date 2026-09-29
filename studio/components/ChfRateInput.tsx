import { RefreshIcon } from '@sanity/icons/Refresh'
import { Button, Flex, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { useState } from 'react'
import type { NumberInputProps } from 'sanity'
import { set } from 'sanity'

const RATE_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=CHF'

interface RateResponse {
  date?: string
  rates?: { CHF?: number }
}

function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export function ChfRateInput(props: NumberInputProps) {
  const { onChange, readOnly } = props
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState<{ rate: number, date: string } | null>(null)

  async function fetchRate() {
    setLoading(true)
    try {
      const res = await fetch(RATE_URL, { cache: 'no-store' })
      if (!res.ok)
        throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as RateResponse
      const rate = json.rates?.CHF
      if (typeof rate !== 'number' || rate <= 0 || !json.date)
        throw new Error('Réponse inattendue')
      const rounded = Math.round(rate * 10000) / 10000
      onChange(set(rounded))
      setFetched({ rate: rounded, date: json.date })
      toast.push({
        status: 'success',
        title: `Taux mis à jour : 1 € = ${rounded.toLocaleString('fr-FR')} CHF`,
        description: 'Pense à publier les Paramètres, puis à mettre le site en ligne.',
      })
    }
    catch (err) {
      toast.push({
        status: 'error',
        title: 'Impossible de récupérer le taux',
        description: `Réessaie plus tard ou saisis le taux à la main. (${err instanceof Error ? err.message : String(err)})`,
      })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      <Flex align="center" gap={3} wrap="wrap">
        <Button
          icon={RefreshIcon}
          mode="ghost"
          text="Récupérer le taux du jour"
          loading={loading}
          disabled={readOnly || loading}
          onClick={fetchRate}
        />
        <Text size={1} muted>
          {fetched
            ? `Taux officiel BCE du ${formatDate(fetched.date)} : 1 € = ${fetched.rate.toLocaleString('fr-FR')} CHF`
            : 'Taux officiel de la Banque centrale européenne (mis à jour chaque jour ouvré).'}
        </Text>
      </Flex>
    </Stack>
  )
}
