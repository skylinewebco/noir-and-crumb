import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useReveal } from '../hooks'
import { Icon, Eyebrow } from '../components/primitives'
import { gsap } from '../lib/smooth'

export default function Gifting() {
  const revRef = useReveal()
  const addToCart = useStore((s) => s.addToCart)
  const toast = useStore((s) => s.toast)
  const openUI = useStore((s) => s.openUI)
  const boxRef = useRef(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { rotate: -3, y: 30 }, {
        rotate: 2, y: -30, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => ctx.revert()
  }, [])

  const orderBox = () => {
    ;['double-chocolate', 'salted-caramel', 'pistachio-white'].forEach((id) =>
      addToCart({ id, size: 'half', chocolate: 'dark', addons: [], qty: 1 })
    )
    toast('Signature Gift Box added — 18 cookies')
    openUI('cart', true)
  }

  return (
    <section id="gifting" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src="./assets/img/bg-slate.webp" srcSet="./assets/img/bg-slate-sm.webp 1100w, ./assets/img/bg-slate.webp 2000w" sizes="100vw" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-[#0b0908]/82" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(var(--bg), transparent 14%, transparent 86%, var(--bg))' }} />
      </div>

      <div ref={revRef} className="mx-auto max-w-[1400px] px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center text-cream-100">
        {/* copy */}
        <div className="order-2 lg:order-none">
          <Eyebrow className="mb-5 !text-[var(--gold)]" data-reveal>Limited · Gifting</Eyebrow>
          <h2 className="h-section text-cream-50" data-reveal>The Signature<br /><span className="italic text-[var(--gold)] font-normal">Gift Box.</span></h2>
          <p className="text-cream-300/70 mt-6 max-w-md leading-relaxed" data-reveal>
            Eighteen cookies across our three most-loved flavours, hand-packed in a matte-black keepsake box with gold
            foil. Add a handwritten note at checkout — we’ll take care of the rest.
          </p>

          <ul className="mt-7 space-y-2.5 max-w-md" data-reveal>
            {['Double Chocolate · Salted Caramel · Pistachio', 'Matte keepsake box + gold seal', 'Free next-day delivery', 'Personal note included'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-cream-200/80">
                <span className="w-5 h-5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] grid place-items-center shrink-0"><Icon.Check width={12} height={12} /></span>{t}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4 mt-9" data-reveal>
            <button onClick={orderBox} className="btn btn-primary">Order the Box · $58</button>
            <div className="text-cream-300/50 text-xs tracking-wide2 uppercase">Only 200 boxes / week</div>
          </div>
        </div>

        {/* box images */}
        <div data-reveal className="relative">
          <div ref={boxRef} className="relative will-change-transform">
            <img src="./assets/img/box-open.webp" alt="Signature gift box, open" loading="lazy" decoding="async" className="w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]" />
          </div>
          <img src="./assets/img/box-closed.webp" alt="" loading="lazy" decoding="async" className="absolute -bottom-4 -left-2 w-1/2 max-w-[220px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] rotate-[-6deg]" />
        </div>
      </div>
    </section>
  )
}
