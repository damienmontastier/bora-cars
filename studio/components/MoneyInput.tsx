import { Button, Flex, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import type { ComponentType } from 'react'
import { useState } from 'react'
import type { NumberInputProps, Path } from 'sanity'
import { set, useClient, useFormValue } from 'sanity'
import type { CurrencyCode } from '../lib/currency'
import { fetchEcbChfRate, formatAmount } from '../lib/currency'

interface MoneyInputOptions {
  currency: CurrencyCode
  counterpart: Path
  decimals?: number
}

const OTHER: Record<CurrencyCode, CurrencyCode> = { EUR: 'CHF', CHF: 'EUR' }

function MoneyInput(props: NumberInputProps & { money: MoneyInputOptions }) {
  const { onChange, readOnly, money } = props
  const { currency, counterpart, decimals = 0 } = money
  const source = OTHER[currency]
  const sourceValue = useFormValue(counterpart) as number | undefined
  const client = useClient({ apiVersion: '2026-04-06' })
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function convert() {
    if (typeof sourceValue !== 'number')
      return
    setLoading(true)
    try {
      let rate = await client.fetch<number | null>('*[_id == "settings"][0].tauxChf')
      let rateLabel = 'taux des Paramètres'
      if (typeof rate !== 'number' || rate <= 0) {
        const ecb = await fetchEcbChfRate()
        rate = ecb.rate
        rateLabel = 'taux BCE du jour'
      }
      const raw = currency === 'CHF' ? sourceValue * rate : sourceValue / rate
      const factor = 10 ** decimals
      const converted = Math.round(raw * factor) / factor
      onChange(set(converted))
      toast.push({
        status: 'success',
        title: `${formatAmount(sourceValue, source)} → ${formatAmount(converted, currency)}`,
        description: `Converti avec le ${rateLabel} (1 € = ${rate.toLocaleString('fr-FR')} CHF). Tu peux arrondir le montant à la main.`,
      })
    }
    catch (err) {
      toast.push({
        status: 'error',
        title: 'Conversion impossible',
        description: `Renseigne le taux dans Paramètres › Devise ou saisis le montant à la main. (${err instanceof Error ? err.message : String(err)})`,
      })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Stack gap={2}>
      {props.renderDefault(props)}
      <Flex>
        <Button
          mode="bleed"
          fontSize={1}
          padding={2}
          text={`Convertir depuis le montant en ${source === 'EUR' ? '€' : 'CHF'}`}
          loading={loading}
          disabled={readOnly || loading || typeof sourceValue !== 'number'}
          onClick={convert}
        />
      </Flex>
      {typeof sourceValue !== 'number' && (
        <Text size={0} muted>
          {`Saisis d’abord le montant en ${source === 'EUR' ? '€' : 'CHF'} pour pouvoir le convertir.`}
        </Text>
      )}
    </Stack>
  )
}

export function moneyInput(money: MoneyInputOptions): ComponentType<NumberInputProps> {
  return function ConfiguredMoneyInput(props: NumberInputProps) {
    return <MoneyInput {...props} money={money} />
  }
}
