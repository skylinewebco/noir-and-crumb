import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { PRODUCTS } from '../data/products'
import { useReveal } from '../hooks'
import { Icon, Eyebrow, Stars } from '../components/primitives'
import { gsap, ScrollTrigger } from '../lib/smooth'

const signature = PRODUCTS[2] // Double Chocolate

export default function Featured() {
  const revRef = useReveal()
  const addToCart = useStore((s) => s.addToCart)
  const toast = useStore((s) => s.toast)
  const openUI = useStore((s) => s.openUI)
  const imgWrap = useRef(null)

  useEffect(() => {
    const el = imgWrap.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelector('img'), { yPercent: 8, scale: 1.05 }, {
        yPercent: -8, scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => ctx.revert()
  }, [])

  const add = () => {
    addToCart({ id: signature.id, size: 'half', chocolate: 'dark', addons: [], qty: 1 })
    toast(`${signature.name} added to your box`)
    openUI('cart', true)
  }

  return (
    <section id="featured" ref={revRef} className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* image */}
        <div ref={imgWrap} className="relative order-1 lg:order-none" data-reveal>
          <div className="absolute -inset-6 rounded-[40px] cookie-surface -z-10" />
          <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden cookie-surface grid place-items-center">
            <img src="./assets/img/featured.webp" alt={signature.name} className="w-full h-full object-cover will-change-transform" />
            <img src="./assets/img/glow.webp" alt="" className="screen-glow absolute -bottom-1/4 left-1/2 -translate-x-1/2 w-[140%] max-w-none opacity-60" />
          </div>
          <div className="absolute -bottom-5 -left-3 sm:left-6 glass rounded-2xl px-5 py-4 shadow-[var(--shadow)]">
            <div className="flex items-center gap-2"><Stars size={13} /><span className="text-xs text-3">4.9</span></div>
            <div className="text-[0.7rem] text-2 mt-1 tracking-wide2 uppercase">Signature No.1</div>
          </div>
        </div>

        {/* copy */}
        <div>
          <Eyebrow className="mb-5" data-reveal>The Signature</Eyebrow>
          <h2 className="h-section" data-reveal>Molten to the<br /><span className="italic text-accent font-normal">very last</span> bite.</h2>
          <p className="text-2 mt-6 max-w-md leading-relaxed" data-reveal>
            Our cocoa-black dough is loaded with milk and dark chunks, under-baked by ninety seconds so the centre stays
            liquid. Finished with espresso salt. This is the one we built the bakery around.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-sm" data-reveal>
            {[['70%', 'Dark cacao'], ['48h', 'Fresh window'], ['360g', 'Per cookie']].map(([a, b]) => (
              <div key={b} className="rounded-2xl hairline border px-3 py-4 text-center">
                <div className="font-display text-2xl text-accent">{a}</div>
                <div className="text-[0.64rem] text-3 tracking-wide2 uppercase mt-1">{b}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-9" data-reveal>
            <button onClick={add} className="btn btn-primary">Add to Box · ${(signature.price * 5.4).toFixed(2)}</button>
            <button onClick={() => useStore.getState().openProduct(signature.id)} className="btn btn-ghost">Customise <Icon.Arrow width={16} height={16} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
