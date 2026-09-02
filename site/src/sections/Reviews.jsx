import { useEffect, useRef } from 'react'
import { REVIEWS } from '../data/products'
import { useReveal } from '../hooks'
import { Eyebrow, Stars } from '../components/primitives'
import { gsap } from '../lib/smooth'

function ReviewCard({ r }) {
  return (
    <div className="w-[300px] sm:w-[360px] shrink-0 rounded-[24px] panel border hairline p-6 mx-3">
      <Stars size={15} />
      <p className="text-2 mt-4 leading-relaxed text-[0.95rem]">“{r.text}”</p>
      <div className="flex items-center gap-3 mt-6">
        <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-[#17100a] grid place-items-center font-display text-lg">{r.name.charAt(0)}</div>
        <div><div className="text-sm font-medium">{r.name}</div><div className="text-3 text-xs">{r.city}</div></div>
      </div>
    </div>
  )
}

export default function Reviews() {
  const revRef = useReveal()
  const track = useRef(null)
  useEffect(() => {
    const el = track.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const half = el.scrollWidth / 2
    const tween = gsap.to(el, { x: -half, duration: 34, ease: 'none', repeat: -1 })
    const enter = () => tween.timeScale(0.15)
    const leave = () => tween.timeScale(1)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tween.play() : tween.pause()), { threshold: 0 })
    io.observe(el)
    return () => { tween.kill(); io.disconnect(); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave) }
  }, [])

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div ref={revRef} className="mx-auto max-w-[1400px] px-5 sm:px-8 text-center mb-14">
        <Eyebrow className="mb-5 justify-center" data-reveal>Loved everywhere</Eyebrow>
        <h2 className="h-section" data-reveal>4.9 stars from<br /><span className="italic text-accent font-normal">six thousand</span> humans.</h2>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-[var(--bg)] to-transparent" />
        <div ref={track} className="flex w-max">
          {[...REVIEWS, ...REVIEWS].map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>
    </section>
  )
}
