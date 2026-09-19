<script setup lang="ts">
// Étape (A) « Vous » du parcours Leasing pro.
import { CONTACT_MAX_LENGTH } from '~/config/CONTACT_PRO_CONFIG'

const { t } = useI18n()
const { form, errors, placeholder } = useContactProForm()
</script>

<template>
  <div class="app-elements-contact-form-pro__fields">
    <div class="app-elements-contact-form-pro__row">
      <AtomsFieldText
        v-model="form.firstName"
        :label="t('contact.pro.fields.firstName')"
        :maxlength="CONTACT_MAX_LENGTH.name"
        :placeholder="placeholder('firstName')"
        autocomplete="given-name"
        :invalid="!!errors.firstName"
        :error-message="errors.firstName"
        required
      />
      <AtomsFieldText
        v-model="form.lastName"
        :label="t('contact.pro.fields.lastName')"
        :maxlength="CONTACT_MAX_LENGTH.name"
        :placeholder="placeholder('lastName')"
        autocomplete="family-name"
        :invalid="!!errors.lastName"
        :error-message="errors.lastName"
        required
      />
    </div>

    <AtomsFieldText
      v-model="form.city"
      :label="t('contact.pro.fields.city')"
      :maxlength="CONTACT_MAX_LENGTH.city"
      :placeholder="placeholder('city')"
      autocomplete="address-level2"
      :invalid="!!errors.city"
      :error-message="errors.city"
      required
    />

    <AtomsFieldPhone
      v-model="form.phone"
      :label="t('contact.pro.fields.phone')"
      :maxlength="CONTACT_MAX_LENGTH.phone"
      :placeholder="placeholder('phone')"
      :invalid="!!errors.phone"
      :error-message="errors.phone"
      required
    />

    <AtomsFieldText
      v-model="form.email"
      type="email"
      inputmode="email"
      :label="t('contact.pro.fields.email')"
      :maxlength="CONTACT_MAX_LENGTH.email"
      :placeholder="placeholder('email')"
      autocomplete="email"
      :invalid="!!errors.email"
      :error-message="errors.email"
    />

    <AtomsFieldText
      v-model="form.company"
      :label="t('contact.pro.fields.company')"
      :maxlength="CONTACT_MAX_LENGTH.company"
      :placeholder="placeholder('company')"
      autocomplete="organization"
      :invalid="!!errors.company"
      :error-message="errors.company"
      required
    />
  </div>
</template>
