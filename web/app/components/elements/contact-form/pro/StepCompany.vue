<script setup lang="ts">
// Étape (B) « Société » du parcours Leasing pro.
import { CONTACT_MAX_LENGTH, PRO_BALANCE_SHEETS, PRO_CREATION_FIRST_YEAR, PRO_LEGAL_FORMS, PRO_REVENUES } from '~/config/CONTACT_PRO_CONFIG'

const { t } = useI18n()
const { form, errors, options, placeholder } = useContactProForm()

// Année courante figée dans le payload SSR : la liste des années est identique au
// prérendu et à l'hydratation, même si la page a été construite l'année précédente.
const currentYear = useState('contact-pro-current-year', () => new Date().getFullYear())
</script>

<template>
  <div class="app-elements-contact-form-pro__fields">
    <AtomsFieldSelect
      v-model="form.legalForm"
      :label="t('contact.pro.fields.legalForm')"
      :options="options('legalForm', PRO_LEGAL_FORMS)"
      :invalid="!!errors.legalForm"
      :error-message="errors.legalForm"
      floating-label
      required
    />

    <AtomsFieldMonthYear
      v-model:month="form.creationMonth"
      v-model:year="form.creationYear"
      :legend="t('contact.pro.fields.creationDate')"
      :month-label="t('contact.pro.fields.creationMonth')"
      :year-label="t('contact.pro.fields.creationYear')"
      :from-year="PRO_CREATION_FIRST_YEAR"
      :to-year="currentYear"
      :disabled="form.creationPending"
    >
      <AtomsFieldCheckbox
        v-model="form.creationPending"
        :label="t('contact.pro.fields.creationPending')"
        size="md"
      />
    </AtomsFieldMonthYear>

    <AtomsFieldText
      v-model="form.activity"
      :label="t('contact.pro.fields.activity')"
      :maxlength="CONTACT_MAX_LENGTH.activity"
      :placeholder="placeholder('activity')"
      :invalid="!!errors.activity"
      :error-message="errors.activity"
      required
    />

    <AtomsFieldSelect
      v-model="form.revenue"
      :label="t('contact.pro.fields.revenue')"
      :options="options('revenue', PRO_REVENUES)"
      :invalid="!!errors.revenue"
      :error-message="errors.revenue"
      floating-label
      required
    />

    <AtomsFieldSelect
      v-model="form.balanceSheets"
      :label="t('contact.pro.fields.balanceSheets')"
      :options="options('balanceSheets', PRO_BALANCE_SHEETS)"
      floating-label
    />
  </div>
</template>
