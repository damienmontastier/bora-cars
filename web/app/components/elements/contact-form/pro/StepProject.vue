<script setup lang="ts">
import { CONTACT_MAX_LENGTH, PRO_DURATIONS, PRO_FINANCINGS, PRO_TIMELINES, PRO_USAGES } from '~/config/CONTACT_PRO_CONFIG'

const { t } = useI18n()
const { form, errors, options, placeholder } = useContactProForm()
</script>

<template>
  <div class="app-elements-contact-form-pro__fields">
    <AtomsFieldChoices
      v-model="form.usage"
      :legend="t('contact.pro.fields.usage')"
      :options="options('usage', PRO_USAGES)"
      :invalid="!!errors.usage"
      :error-message="errors.usage"
      required
    />

    <div class="app-elements-contact-form-pro__group">
      <AtomsFieldChoices
        v-model="form.financing"
        :legend="t('contact.pro.fields.financing')"
        :options="options('financing', PRO_FINANCINGS)"
      />
      <div v-if="form.financing" class="app-elements-contact-form-pro__conditional">
        <div class="app-elements-contact-form-pro__row">
          <AtomsFieldText
            v-model="form.mileage"
            :label="t('contact.pro.fields.mileage')"
            :maxlength="CONTACT_MAX_LENGTH.short"
            :placeholder="placeholder('mileage')"
            inputmode="numeric"
          />
          <AtomsFieldSelect
            v-model="form.duration"
            :label="t('contact.pro.fields.duration')"
            :options="options('duration', PRO_DURATIONS)"
            floating-label
          />
        </div>
      </div>
    </div>

    <AtomsFieldCheckbox
      v-model="form.wantsAdvice"
      class="app-elements-contact-form-pro__option"
      :label="t('contact.pro.fields.wantsAdvice')"
      size="md"
    />

    <AtomsFieldText
      v-model="form.models"
      :label="t('contact.pro.fields.models')"
      :maxlength="CONTACT_MAX_LENGTH.models"
      :placeholder="placeholder('models')"
    />

    <div class="app-elements-contact-form-pro__row">
      <AtomsFieldText
        v-model="form.vehicleCount"
        :label="t('contact.pro.fields.vehicleCount')"
        inputmode="numeric"
        :maxlength="2"
      />
      <AtomsFieldText
        v-model="form.budget"
        :label="t('contact.pro.fields.budget')"
        :maxlength="CONTACT_MAX_LENGTH.short"
        :placeholder="placeholder('budget')"
        inputmode="numeric"
      />
    </div>

    <AtomsFieldChoices
      v-model="form.timeline"
      :legend="t('contact.pro.fields.timeline')"
      :options="options('timeline', PRO_TIMELINES)"
      layout="row"
    />
  </div>
</template>
