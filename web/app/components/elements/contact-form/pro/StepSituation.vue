<script setup lang="ts">
import { PRO_DEPOSITS, PRO_INCOME_TYPES, PRO_YES_NO } from '~/config/CONTACT_PRO_CONFIG'

const { t } = useI18n()
const { form, errors, options } = useContactProForm()
</script>

<template>
  <div class="app-elements-contact-form-pro__fields">
    <div class="app-elements-contact-form-pro__group">
      <AtomsFieldChoices
        v-model="form.hasIncome"
        :legend="t('contact.pro.fields.hasIncome')"
        :options="options('yesNo', PRO_YES_NO)"
        layout="row"
      />
      <div v-if="form.hasIncome === 'yes'" class="app-elements-contact-form-pro__conditional">
        <AtomsFieldSelect
          v-model="form.incomeType"
          :label="t('contact.pro.fields.incomeType')"
          :options="options('incomeType', PRO_INCOME_TYPES)"
          floating-label
        />
      </div>
    </div>

    <AtomsFieldChoices
      v-model="form.deposit"
      :legend="t('contact.pro.fields.deposit')"
      :options="options('deposit', PRO_DEPOSITS)"
      :invalid="!!errors.deposit"
      :error-message="errors.deposit"
      required
    />

    <AtomsFieldChoices
      v-model="form.leaseRefused"
      :legend="t('contact.pro.fields.leaseRefused')"
      :options="options('yesNo', PRO_YES_NO)"
      layout="row"
    />
  </div>
</template>
