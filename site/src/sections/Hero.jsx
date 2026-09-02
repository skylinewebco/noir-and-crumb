import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { scrollTo } from '../lib/smooth'
import { Icon } from '../components/primitives'
import { useReducedMotion } from '../hooks'
import { prime, tryPlay } from '../lib/video'
import CookieTouchZone from '../components/CookieTouchZone'

export default function Hero() {
  const navigate = useNavigate()
  const ready = useStore((s) => s.ready)
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!ready) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    return () => cancelAnimationFrame(id)
  }, [ready])

  return (
    <section id="top" className={`hero-root relative min-h-[100svh] flex items-center overflow-hidden ${shown ? 'shown' : ''}`}>
      {/* atmospheric background (always dark cinematic) */}
      <div className="absolute inset-0 -z-10 bg-[#0a0806]">
        <img src="./assets/img/bg-studio.webp" alt="" className="w-full h-full object-cover opacity-90" />
        <video
          ref={(el) => { if (el) { prime(el); tryPlay(el) } }}
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
          src="./assets/video/hero.mp4" poster="./assets/img/poster-hero.webp"
          muted playsInline loop autoPlay preload="metadata" aria-hidden
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 32%, transparent 34%, #0a0806 86%)' }} />
      </div>

      {/* 3D cookie is rendered by the global <CookieField/> (fixed layer) so it can
          travel down through the page on scroll. Static fallback only when reduced-motion. */}
      {reduced && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <img src="./assets/img/hero-cookie.webp" alt="Signature cookie" className="w-[70vw] max-w-[520px]" />
        </div>
      )}

      {/* mobile scrim for text legibility over the cookie */}
      <div className="absolute inset-0 z-[5] lg:hidden pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.35) 42%, rgba(10,8,6,0.55) 72%, rgba(10,8,6,0.9) 100%)' }} />

      {/* mobile drag-to-rotate layer (below CTAs, above the cookie canvas) */}
      <CookieTouchZone />

      {/* content — wrapper ignores pointer so canvas gets parallax; interactive bits re-enable */}
      <div className="relative z-10 w-full pointer-events-none text-cream-50">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-[760px] pt-24">
            <div className="hero-fade eyebrow mb-5 !text-[var(--gold)]" style={{ transitionDelay: '.05s' }}>Small-batch · Est. 2024</div>
            <h1 className="h-hero">
              <span className="reveal-line"><span style={{ transitionDelay: '.0s' }}>Crafted to crave.</span></span>
              <span className="reveal-line"><span className="text-[var(--gold)] italic font-normal" style={{ transitionDelay: '.1s' }}>Baked</span></span>
              <span className="reveal-line"><span style={{ transitionDelay: '.2s' }}>to remember.</span></span>
            </h1>
            <p className="hero-fade text-cream-200/80 mt-7 max-w-md text-[1.02rem] leading-relaxed" style={{ transitionDelay: '.32s' }}>
              Premium ingredients. Bold, quiet flavour. Each cookie pulled warm from the oven and shipped within the day.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-9">
              <button onClick={() => navigate('/shop')} className="hero-fade btn btn-primary pointer-events-auto" style={{ transitionDelay: '.42s' }}>
                Shop Cookies <Icon.Arrow width={16} height={16} />
              </button>
              <button onClick={() => scrollTo('#featured')} className="hero-fade btn btn-ghost pointer-events-auto !text-cream-100 border-white/20" style={{ transitionDelay: '.5s' }}>
                Explore the Signature
              </button>
            </div>
            <div className="hero-fade flex items-center gap-6 mt-12 text-cream-300/60 text-xs tracking-wide2 uppercase" style={{ transitionDelay: '.6s' }}>
              <span>12 Flavours</span><span className="w-px h-4 bg-current opacity-30" />
              <span>48h Fresh</span><span className="w-px h-4 bg-current opacity-30" />
              <span>4.9 ★ · 6k reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <button onClick={() => scrollTo('#featured')} className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream-300/60 hover:text-[var(--gold)] transition-colors pointer-events-auto" aria-label="Scroll down">
        <span className="text-[0.62rem] tracking-luxe uppercase">Scroll</span>
        <span className="w-px h-8 bg-current opacity-40 overflow-hidden relative">
          <span className="absolute inset-x-0 top-0 h-3 bg-[var(--gold)]" style={{ animation: 'scrollcue 1.8s ease-in-out infinite' }} />
        </span>
      </button>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(300%)}}`}</style>
    </section>
  )
}
