export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('menu-theme', {
    getSSRProps() {
      return {}
    },
  })
})
