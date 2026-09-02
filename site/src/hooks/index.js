import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, ScrollTrigger } from '../lib/smooth'

/* media query hook */
export function useMedia(query) {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export const useIsMobile = () => useMedia('(max-width: 767px)')
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')

/* Reveal children marked [data-reveal] within a section on scroll */
export function useReveal(options = {}, deps = []) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = el.querySelectorAll('[data-reveal]')
    if (!items.length) return
    if (reduced) { gsap.set(items, { opacity: 1, y: 0 }); return }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 30 })
      ScrollTrigger.batch(items, {
        start: options.start || 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
            stagger: options.stagger ?? 0.09, overwrite: true,
          }),
      })
      // reveal anything already within the viewport on (re)mount
      requestAnimationFrame(() => {
        const vh = window.innerHeight
        items.forEach((it) => {
          const r = it.getBoundingClientRect()
          if (r.top < vh * 0.92 && r.bottom > 0) {
            gsap.to(it, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', overwrite: true })
          }
        })
      })
    }, el)
    return () => ctx.revert()
  }, deps) // eslint-disable-line
  return ref
}

/* Magnetic hover for buttons (desktop pointer only) */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => { xTo(0); yTo(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [strength])
  return ref
}

/* parallax on an element via scroll */
export function useParallax(amount = 60) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { yPercent: -amount / 10 }, {
        yPercent: amount / 10, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => ctx.revert()
  }, [amount])
  return ref
}

/* lock body scroll toggle */
export function useLockCallback() {
  return useCallback((lock) => {
    document.body.classList.toggle('no-scroll', lock)
  }, [])
}
