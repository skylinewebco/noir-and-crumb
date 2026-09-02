import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
if (typeof window !== 'undefined') window.gsap = gsap

let lenis = null
// live scroll progress (0..1 of hero height) shared with the 3D scene without React re-renders
export const scrollState = { y: 0, velocity: 0, progress: 0, heroProgress: 0 }

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initSmoothScroll() {
  if (lenis || prefersReduced()) return null
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    lerp: 0.1,
  })

  lenis.on('scroll', (e) => {
    scrollState.y = e.scroll
    scrollState.velocity = e.velocity
    const vh = window.innerHeight || 1
    scrollState.heroProgress = Math.min(1, e.scroll / vh)
    ScrollTrigger.update()
  })

  const raf = (time) => {
    lenis && lenis.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  ScrollTrigger.refresh()
  return lenis
}

export function getLenis() { return lenis }

export function stopScroll() { lenis ? lenis.stop() : document.body.classList.add('no-scroll') }
export function startScroll() { lenis ? lenis.start() : document.body.classList.remove('no-scroll') }

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2, ...opts })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el && el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export { gsap, ScrollTrigger }
