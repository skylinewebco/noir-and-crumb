import { useEffect, useRef, lazy, Suspense } from 'react'
import { useStore } from './store/useStore'
import { initSmoothScroll, ScrollTrigger } from './lib/smooth'
import { useReducedMotion } from './hooks'

const CookieField = lazy(() => import('./three/CookieField'))

import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Toasts from './components/Toasts'
import CartDrawer from './components/CartDrawer'
import ProductModal from './components/ProductModal'
import AuthModal from './components/AuthModal'
import CheckoutModal from './components/CheckoutModal'

import Hero from './sections/Hero'
import Marquee from './sections/Marquee'
import Featured from './sections/Featured'
import Collection from './sections/Collection'
import Ingredients from './sections/Ingredients'
import Story from './sections/Story'
import Cinematic from './sections/Cinematic'
import Gifting from './sections/Gifting'
import Reviews from './sections/Reviews'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

function ProgressBar() {
  const ref = useRef(null)
  useEffect(() => {
    let ticking = false
    const paint = () => {
      ticking = false
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    paint()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])
  return <div className="fixed top-0 left-0 right-0 z-[55] h-[2px] origin-left bg-[var(--accent)]" style={{ transform: 'scaleX(0)' }} ref={ref} />
}

export default function App() {
  const theme = useStore((s) => s.theme)
  const ready = useStore((s) => s.ready)
  const reduced = useReducedMotion()

  // theme -> <html> class
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0806' : '#faf5ec')
  }, [theme])

  // smooth scroll + scrolltrigger
  useEffect(() => {
    initSmoothScroll()
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    const t = setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => { window.removeEventListener('load', onLoad); clearTimeout(t) }
  }, [])

  // refresh triggers once assets settle after preloader completes
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => clearTimeout(t)
  }, [ready])

  return (
    <>
      <Preloader />
      {/* global 3D cookie that lives in the hero and travels down the page on scroll */}
      {ready && !reduced && (
        <Suspense fallback={null}><CookieField /></Suspense>
      )}
      <div className="grain-overlay" aria-hidden />
      <ProgressBar />
      <Navbar />

      <main>
        <Hero />
        <Marquee />
        <Featured />
        <Collection />
        <Ingredients />
        <Story />
        <Cinematic />
        <Gifting />
        <Reviews />
        <Contact />
      </main>
      <Footer />

      {/* overlays */}
      <CartDrawer />
      <ProductModal />
      <AuthModal />
      <CheckoutModal />
      <Toasts />
    </>
  )
}
