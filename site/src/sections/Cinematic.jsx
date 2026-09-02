import LazyVideo from '../components/LazyVideo'
import { useReveal } from '../hooks'
import { Eyebrow } from '../components/primitives'

function Tile({ src, poster, label, sub, className = '', objectPosition = 'center' }) {
  return (
    <div data-reveal className={`group relative rounded-[24px] overflow-hidden ${className}`}>
      <LazyVideo src={src} poster={poster} className="w-full h-full min-h-[220px]" objectPosition={objectPosition} />
      <div className="absolute inset-0 flex flex-col justify-end p-6 pointer-events-none">
        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-luxe">
          <div className="font-display text-2xl sm:text-3xl text-cream-50">{label}</div>
          {sub && <div className="text-cream-200/70 text-xs tracking-wide2 uppercase mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  )
}

export default function Cinematic() {
  const revRef = useReveal({ stagger: 0.08 })
  return (
    <section className="relative py-24 sm:py-32 cookie-surface">
      <div ref={revRef} className="mx-auto max-w-[1400px] px-5 sm:px-8 text-cream-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow className="mb-5 !text-[var(--gold)]" data-reveal>The craft in motion</Eyebrow>
            <h2 className="h-section text-cream-50" data-reveal>Slow-baked.<br /><span className="italic text-[var(--gold)] font-normal">Fast disappearing.</span></h2>
          </div>
          <p className="text-cream-300/60 max-w-xs text-sm md:text-right" data-reveal>Melting chocolate, molten centres, the pull of a fresh break. This is what your box looks like up close.</p>
        </div>

        {/* bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] sm:auto-rows-[230px] gap-4">
          <Tile src="./assets/video/melt.mp4" poster="./assets/img/poster-melt.webp" label="Molten couverture" sub="70% dark, poured" className="col-span-2 row-span-1 md:row-span-2" />
          <Tile src="./assets/video/chips.mp4" poster="./assets/img/poster-chips.webp" label="The chunk drop" sub="Belgian chocolate" className="col-span-2 md:col-span-1 md:row-span-2" objectPosition="center" />
          <Tile src="./assets/video/rotate.mp4" poster="./assets/img/poster-rotate.webp" label="360° of crave" sub="Signature bake" className="col-span-1" />
          <Tile src="./assets/video/break.mp4" poster="./assets/img/poster-break.webp" label="The break" sub="Molten centre" className="col-span-1" />
          <Tile src="./assets/video/baking.mp4" poster="./assets/img/poster-baking.webp" label="Straight from the oven" sub="Baked daily" className="col-span-2 md:col-span-2" />
        </div>
      </div>
    </section>
  )
}
