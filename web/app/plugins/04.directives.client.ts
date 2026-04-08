import menuTheme from '~/directives/menu-theme'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('menu-theme', menuTheme)
})
