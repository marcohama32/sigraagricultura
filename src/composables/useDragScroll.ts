import { watch, onBeforeUnmount, type Ref } from 'vue'

/**
 * Enables click-and-drag horizontal scrolling on a container element.
 */
export function useDragScroll(elRef: Ref<HTMLElement | null>) {
  let isDown = false
  let startX = 0
  let scrollLeft = 0
  let wasDragged = false
  let currentEl: HTMLElement | null = null

  console.log('[DragScroll] composable created, initial ref value:', elRef.value)

  function onMouseDown(e: MouseEvent) {
    const el = elRef.value
    console.log('[DragScroll] mousedown, el:', el)
    if (!el) return
    isDown = true
    wasDragged = false
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
    el.style.cursor = 'grabbing'
    console.log('[DragScroll] drag started at x:', startX)
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDown) return
    const el = elRef.value
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    if (Math.abs(x - startX) > 3) wasDragged = true
    el.scrollLeft = scrollLeft - (x - startX)
  }

  function onMouseUp() {
    if (isDown) console.log('[DragScroll] mouseup, wasDragged:', wasDragged)
    isDown = false
    const el = elRef.value
    if (el) el.style.cursor = ''
  }

  function onClick(e: MouseEvent) {
    if (wasDragged) {
      console.log('[DragScroll] click blocked (was dragging)')
      e.stopPropagation()
      e.preventDefault()
      wasDragged = false
    }
  }

  function attach(el: HTMLElement) {
    console.log('[DragScroll] ATTACHING listeners to:', el.className, el.tagName)
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseUp)
    el.addEventListener('click', onClick, true)
    currentEl = el
  }

  function detach() {
    if (!currentEl) return
    console.log('[DragScroll] DETACHING listeners from:', currentEl.className)
    currentEl.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    currentEl.removeEventListener('mouseleave', onMouseUp)
    currentEl.removeEventListener('click', onClick, true)
    currentEl = null
  }

  watch(elRef, (newEl, oldEl) => {
    console.log('[DragScroll] watch fired — oldEl:', oldEl, 'newEl:', newEl)
    if (oldEl) detach()
    if (newEl) attach(newEl)
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    console.log('[DragScroll] onBeforeUnmount — cleaning up')
    detach()
  })
}
