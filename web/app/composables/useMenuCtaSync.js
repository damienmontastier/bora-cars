// Synchronization point between Menu.vue and Hero.vue.
// Menu.vue writes the final menuCta rect BEFORE Flip.from() applies parent transforms.
// Hero.vue reads it synchronously right after heroCTABus.emit('enter') returns.
const _state = { rect: null }

export function useMenuCtaSync() {
  return {
    setTargetRect(rect) { _state.rect = rect },
    getTargetRect() { return _state.rect },
  }
}
