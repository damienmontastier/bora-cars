import { nextTick } from 'vue'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()

  if (config.public.IS_PROD)
    return

  // Imports dynamiques : sinon Tweakpane (~300 Ko) part dans le bundle de prod.
  const [{ Pane }, EssentialsPlugin] = await Promise.all([
    import('tweakpane'),
    import('@tweakpane/plugin-essentials'),
  ])

  let container = document.getElementById('app-debug-pane')
  container = document.createElement('div')
  container.id = 'app-debug-pane'
  document.body.appendChild(container)

  const pane = new Pane({ title: 'App', container, expanded: false })
  pane.registerPlugin(EssentialsPlugin)

  const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: '📈 FPS',
    rows: 2,
  })

  async function animate() {
    fpsGraph.begin()
    await nextTick()
    fpsGraph.end()
  }

  const unsubscribe = nuxtApp.$tempus.add(animate, { label: 'fps-graph' })

  nuxtApp.hook('app:unmounted', () => {
    unsubscribe()
    pane.dispose?.()
    container?.remove()
  })

  nuxtApp.provide('pane', pane)
})
