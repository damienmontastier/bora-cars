const _state = { rect: null }

export function useMenuCtaSync() {
  return {
    setTargetRect(rect) { _state.rect = rect },
    getTargetRect() { return _state.rect },
  }
}
