import Tempus from 'tempus'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('tempus', Tempus)
})
