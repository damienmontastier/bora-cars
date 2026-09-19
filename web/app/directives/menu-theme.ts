/**
 * v-menu-theme
 *
 * Change le `menuTheme` du store quand l'élément atteint le bas du menu fixe (.app-menu).
 *
 * --- Utilisation simple ---
 *
 *   <section v-menu-theme="'white'">...</section>
 *
 * --- Utilisation avec start/end custom ---
 *
 *   <section v-menu-theme="{ theme: 'white', start: 'top 80px' }">...</section>
 *
 *   Syntaxe ScrollTrigger standard :
 *     'top top'        → haut de l'élément atteint le haut du viewport
 *     'top 80px'       → haut de l'élément atteint 80px depuis le haut
 *     'top center'     → haut de l'élément atteint le centre du viewport
 *     'center center'  → centre de l'élément atteint le centre du viewport
 */

import type { DirectiveBinding } from 'vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type MenuTheme = 'white' | 'orange' | 'black'

interface MenuThemeBinding {
  theme: MenuTheme
  start?: string
  end?: string
}

interface MenuThemeEl extends HTMLElement {
  _menuThemeST?: ReturnType<typeof ScrollTrigger.create>
}

function sameBinding(a: MenuTheme | MenuThemeBinding | null | undefined, b: MenuTheme | MenuThemeBinding | null | undefined) {
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object')
    return a === b
  return a.theme === b.theme && a.start === b.start && a.end === b.end
}

function createTrigger(el: MenuThemeEl, binding: DirectiveBinding<MenuTheme | MenuThemeBinding>) {
  const appStore = useAppStore()

  const value = binding.value
  const theme: MenuTheme = typeof value === 'string' ? value : value.theme

  const menuBottom = () => `${document.querySelector('.app-menu')?.getBoundingClientRect().bottom ?? 0}px`
  const start = typeof value === 'object' ? (value.start ?? (() => `top ${menuBottom()}`)) : () => `top ${menuBottom()}`
  const end = typeof value === 'object' ? (value.end ?? (() => `bottom ${menuBottom()}`)) : () => `bottom ${menuBottom()}`

  el._menuThemeST = ScrollTrigger.create({
    trigger: el,
    start,
    end,
    onEnter: () => {
      appStore.menuThemePending = theme
    },
    onEnterBack: () => {
      appStore.menuThemePending = theme
    },
    onRefresh: (self) => {
      if (self.isActive) appStore.menuThemePending = theme
    },
  })
}

export default {
  mounted(el: MenuThemeEl, binding: DirectiveBinding<MenuTheme | MenuThemeBinding>) {
    if (!import.meta.client)
      return
    createTrigger(el, binding)
  },

  // `updated` tourne à CHAQUE re-render du composant parent (frappe dans la recherche
  // du catalogue, survol d'une marque…). Recréer le ScrollTrigger force une mesure du
  // layout à chaque fois : on ne le fait que si la valeur de la directive a changé.
  updated(el: MenuThemeEl, binding: DirectiveBinding<MenuTheme | MenuThemeBinding>) {
    if (!import.meta.client || sameBinding(binding.value, binding.oldValue))
      return
    el._menuThemeST?.kill()
    createTrigger(el, binding)
  },

  unmounted(el: MenuThemeEl) {
    el._menuThemeST?.kill()
    delete el._menuThemeST
  },
}
