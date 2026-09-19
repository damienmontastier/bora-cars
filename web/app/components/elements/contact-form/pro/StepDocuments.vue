<script setup lang="ts">
// Étape (E) « Justificatifs » du parcours Leasing pro.
import { CONTACT_MAX_LENGTH, PRO_DOCUMENTS, PRO_DOCUMENTS_WITH_HINT } from '~/config/CONTACT_PRO_CONFIG'

const { t } = useI18n()
const { form, errors, options, placeholder, showDocumentsHint } = useContactProForm()
</script>

<template>
  <div class="app-elements-contact-form-pro__fields">
    <AtomsHelpNote v-if="showDocumentsHint">
      {{ t('contact.pro.documentsHint') }}
    </AtomsHelpNote>

    <AtomsFieldChoices
      v-model="form.documents"
      type="checkbox"
      :legend="t('contact.pro.fields.documents')"
      :options="options('documents', PRO_DOCUMENTS, PRO_DOCUMENTS_WITH_HINT)"
    />

    <AtomsFieldTextarea
      v-model="form.message"
      :label="t('contact.pro.fields.message')"
      :maxlength="CONTACT_MAX_LENGTH.message"
      :placeholder="placeholder('message')"
    />

    <AtomsFieldCheckbox
      v-model="form.consent"
      class="app-elements-contact-form-pro__consent"
      size="md"
      :invalid="!!errors.consent"
      :error-message="errors.consent"
      required
    >
      {{ t('contact.pro.consent.before') }}
      <!-- Nouvel onglet : quitter la page viderait le dossier en cours -->
      <UtilsBaseLink
        :to="{ name: 'legal-slug', params: { slug: t('legal.privacySlug') } }"
        target="_blank"
        rel="noopener"
      >
        {{ t('contact.pro.consent.linkLabel') }}
      </UtilsBaseLink>{{ t('contact.pro.consent.after') }}
    </AtomsFieldCheckbox>
  </div>
</template>
