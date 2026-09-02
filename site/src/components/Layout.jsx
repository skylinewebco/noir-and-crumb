import { useEffect, useRef, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getLenis, ScrollTrigger } from '../lib/smooth'
import { useReducedMotion } from '../hooks'

import Preloader from './Preloader'
import Navbar from './Navbar'
import Toasts from './Toasts'
import CartDrawer from './CartDrawer'
import ProductModal from './ProductModal'
import AuthModal from './AuthModal'
import CheckoutModal from './CheckoutModal'
import Footer from '../sections/Footer'

const CookieField = lazy(() => import('../three/CookieField'))

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

// Reset scroll to the top on route change and recalc scroll-triggered anims.
function ScrollManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 140)
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 520)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pathname])
  return null
}

export default function Layout() {
  const ready = useStore((s) => s.ready)
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <>
      <Preloader />
      {/* the travelling 3D cookie only lives on the home hero */}
      {isHome && ready && !reduced && (
        <Suspense fallback={null}><CookieField /></Suspense>
      )}
      <div className="grain-overlay" aria-hidden />
      <ProgressBar />
      <Navbar />
      <ScrollManager />

      <main key={pathname} className="min-h-[60svh]">
        <Outlet />
      </main>
      <Footer />

      {/* overlays (persist across routes) */}
      <CartDrawer />
      <ProductModal />
      <AuthModal />
      <CheckoutModal />
      <Toasts />
    </>
  )
}
