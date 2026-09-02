import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { gsap } from '../lib/smooth'

const CRITICAL = [
  './assets/img/hero-cookie.webp',
  './assets/img/logo.webp',
  './assets/img/glow.webp',
  './assets/img/prod-darkchoc.webp',
  './assets/img/prod-caramel.webp',
  './assets/img/featured.webp',
  './assets/img/bg-slate.webp',
]

export default function Preloader() {
  const setReady = useStore((s) => s.setReady)
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const rootRef = useRef(null)
  const numRef = useRef(null)

  useEffect(() => {
    let loaded = 0
    const start = performance.now()
    const total = CRITICAL.length
    const bump = () => {
      loaded++
      setPct(Math.round((loaded / total) * 100))
      if (loaded >= total) finish()
    }
    CRITICAL.forEach((src) => {
      const img = new Image()
      img.onload = bump
      img.onerror = bump
      img.src = src
    })
    const finish = () => {
      const elapsed = performance.now() - start
      const wait = Math.max(0, 900 - elapsed) // min brand moment
      setTimeout(() => {
        setReady(true)
        const tl = gsap.timeline({ onComplete: () => setDone(true) })
        tl.to(numRef.current, { opacity: 0, duration: 0.4 })
          .to('.pl-bar', { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, '<')
          .to('.pl-cover', { yPercent: -100, duration: 1.0, ease: 'expo.inOut', stagger: 0.06 }, '+=0.05')
          .to(rootRef.current, { autoAlpha: 0, duration: 0.01 })
      }, wait)
    }
  }, [setReady])

  if (done) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] pointer-events-none">
      {/* stacked covers for a layered wipe */}
      <div className="absolute inset-0 flex">
        <div className="pl-cover flex-1 bg-[#0a0806]" />
        <div className="pl-cover flex-1 bg-[#0c0907]" />
        <div className="pl-cover flex-1 bg-[#0a0806]" />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-6 px-8">
          <img src="./assets/img/logo.webp" alt="Noir & Crumb" className="h-16 w-auto opacity-90" />
          <div className="font-display text-cream-100 text-2xl tracking-tight">Noir <span className="text-[var(--accent)]">&amp;</span> Crumb</div>
          <div className="w-[220px] h-px bg-white/15 overflow-hidden">
            <div className="pl-bar h-full bg-[var(--accent)] origin-left" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <div ref={numRef} className="text-cream-300/70 text-xs tracking-luxe uppercase tabular-nums">Baking the experience · {pct}%</div>
        </div>
      </div>
    </div>
  )
}
