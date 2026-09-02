import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smooth'

const ITEMS = ['Brown Butter', '·', 'Single-Origin Cacao', '·', 'Sea Salt', '·', 'Baked Daily', '·', 'Molten Centres', '·', 'Small Batch', '·']

export default function Marquee() {
  const track = useRef(null)
  useEffect(() => {
    const el = track.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const half = el.scrollWidth / 2
    const tween = gsap.to(el, { x: -half, duration: 22, ease: 'none', repeat: -1 })
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tween.play() : tween.pause()), { threshold: 0 })
    io.observe(el)
    return () => { tween.kill(); io.disconnect() }
  }, [])
  return (
    <div className="relative py-5 border-y hairline overflow-hidden select-none cookie-surface">
      <div ref={track} className="marquee-track gap-8">
        {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className={`font-display text-2xl sm:text-3xl ${t === '·' ? 'text-[var(--accent)]' : 'text-cream-100/80'}`}>{t}</span>
        ))}
      </div>
    </div>
  )
}
