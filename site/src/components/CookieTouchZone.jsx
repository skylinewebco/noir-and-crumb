import { useEffect, useRef } from 'react'
import { setTargetFromClient } from '../three/cookieInput'

/**
 * Mobile-only transparent layer that lets the user drag to rotate the hero
 * cookie. Architecture that fixes the "drag accidentally taps the CTA" bug:
 *
 *  - z-index sits ABOVE the cookie canvas (z-3) but BELOW the hero content /
 *    CTAs (z-10), so a real tap on a button always reaches the button, while a
 *    drag over empty hero space is captured here and never becomes a click.
 *  - `touch-action: pan-y` lets the browser keep vertical scrolling; only
 *    horizontal intent is treated as rotation, so there is no scroll conflict.
 *  - Pointer capture keeps the whole gesture on this element, so dragging over
 *    a button mid-gesture cannot activate it.
 *  - A movement threshold means a stationary tap does nothing (no accidental
 *    rotation), and because this element has no onClick, a drag never fires a
 *    click on anything underneath.
 */
export default function CookieTouchZone() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let downX = 0, downY = 0, id = null
    let active = false, dragging = false

    const onDown = (e) => {
      if (e.pointerType === 'mouse') return // desktop uses the mouse handler
      active = true; dragging = false
      downX = e.clientX; downY = e.clientY; id = e.pointerId
    }
    const onMove = (e) => {
      if (!active || e.pointerId !== id) return
      const dx = e.clientX - downX
      const dy = e.clientY - downY
      if (!dragging) {
        // decide intent once past a small threshold
        if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return
        if (Math.abs(dy) > Math.abs(dx)) { active = false; return } // vertical -> let the page scroll
        dragging = true
        try { el.setPointerCapture(e.pointerId) } catch {}
      }
      setTargetFromClient(e.clientX, e.clientY)
    }
    const end = (e) => {
      if (e.pointerId !== id) return
      active = false; dragging = false; id = null
      try { el.releasePointerCapture(e.pointerId) } catch {}
    }

    el.addEventListener('pointerdown', onDown, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerup', end, { passive: true })
    el.addEventListener('pointercancel', end, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-0 z-[6] lg:hidden"
      style={{ touchAction: 'pan-y' }}
    />
  )
}
