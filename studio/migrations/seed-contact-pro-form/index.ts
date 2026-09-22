import { at, defineMigration, setIfMissing } from 'sanity/migrate'
import seed from './seed.json'

export default defineMigration({
  title: 'Seed contact.proForm + contact.profileSwitch from the glossaire (contact.pro.*, contact.profile.*)',
  documentTypes: ['contact'],
  migrate: {
    document(doc) {
      const patches = []
      if (!doc.proForm)
        patches.push(at('proForm', setIfMissing(seed.proForm)))
      if (!doc.profileSwitch)
        patches.push(at('profileSwitch', setIfMissing(seed.profileSwitch)))
      return patches
    },
  },
})
