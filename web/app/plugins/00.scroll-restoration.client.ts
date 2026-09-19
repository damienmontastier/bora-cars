export default defineNuxtPlugin(() => {
  if (!('scrollRestoration' in window.history))
    return

  const setManual = () => {
    window.history.scrollRestoration = 'manual'
  }

  setManual()
  useRouter().afterEach(setManual)
})
