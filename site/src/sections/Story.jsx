import { useEffect, useRef, useState } from 'react'
import LazyVideo from '../components/LazyVideo'
import { useReveal } from '../hooks'
import { Eyebrow } from '../components/primitives'

function Counter({ to, suffix = '', duration = 1600 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setVal(Math.round(to * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])
  return <span ref={ref} className="tabular-nums">{val.toLocaleString()}{suffix}</span>
}

export default function Story() {
  const revRef = useReveal()
  return (
    <section id="story" ref={revRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* video */}
        <div data-reveal className="relative order-2 lg:order-none">
          <LazyVideo
            src="./assets/video/baking.mp4" poster="./assets/img/poster-baking.webp"
            className="aspect-[4/5] rounded-[32px]" objectPosition="center"
          />
          <div className="absolute -bottom-6 -right-3 sm:-right-6 glass rounded-2xl px-6 py-5 shadow-[var(--shadow)] max-w-[220px]">
            <div className="font-display text-4xl text-accent"><Counter to={100} suffix="%" /></div>
            <div className="text-2 text-xs mt-1 leading-snug">Baked the same morning it ships. Never frozen.</div>
          </div>
        </div>

        {/* copy */}
        <div>
          <Eyebrow className="mb-5" data-reveal>Our story</Eyebrow>
          <h2 className="h-section" data-reveal>Born from one<br /><span className="italic text-accent font-normal">stubborn recipe.</span></h2>
          <div className="space-y-4 text-2 mt-6 max-w-md leading-relaxed" data-reveal>
            <p>Noir &amp; Crumb began in a Paris apartment kitchen, chasing a single idea: a cookie with an edge that shatters and a centre that never fully sets.</p>
            <p>Three hundred failed batches later, we had it. Today every cookie is still scooped by hand, chilled overnight, and baked to that exact under-done second.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-md" data-reveal>
            {[[<Counter to={300} suffix="+" />, 'Test batches'], [<Counter to={12} />, 'Signature flavours'], [<Counter to={6} suffix="k" />, 'Five-star reviews']].map(([v, l], i) => (
              <div key={i}>
                <div className="font-display text-3xl sm:text-4xl text-accent">{v}</div>
                <div className="text-[0.64rem] text-3 tracking-wide2 uppercase mt-1.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
