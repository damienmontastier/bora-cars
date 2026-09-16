// Nuxt remet `scrollRestoration` à 'auto', réglage stocké par entrée d'historique : sans ça,
// au back le navigateur re-scrolle l'ancienne page avant que la transition ne la couvre.
export default defineNuxtPlugin(() => {
  if (!('scrollRestoration' in window.history))
    return

  const setManual = () => {
    window.history.scrollRestoration = 'manual'
  }

  setManual()
  useRouter().afterEach(setManual)
})
