import { useState } from 'react'
import { useStore } from '../store/useStore'
import { PRODUCTS, FILTERS } from '../data/products'
import { useReveal } from '../hooks'
import { Icon, Eyebrow } from '../components/primitives'

function Card({ p }) {
  const openProduct = useStore((s) => s.openProduct)
  const addToCart = useStore((s) => s.addToCart)
  const toast = useStore((s) => s.toast)
  const openUI = useStore((s) => s.openUI)
  const wishlist = useStore((s) => s.wishlist)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const wished = wishlist.includes(p.id)

  const quickAdd = (e) => {
    e.stopPropagation()
    addToCart({ id: p.id, size: 'single', chocolate: 'dark', addons: [], qty: 1 })
    toast(`${p.name} added to your box`)
    openUI('cart', true)
  }

  return (
    <article
      data-reveal
      onClick={() => openProduct(p.id)}
      className="group relative rounded-[26px] overflow-hidden cursor-pointer cookie-surface hairline border transition-transform duration-500 ease-luxe hover:-translate-y-1.5"
    >
      {/* badge + wishlist */}
      <div className="absolute top-4 inset-x-4 z-10 flex items-start justify-between">
        {p.badge ? <span className="text-[0.62rem] tracking-luxe uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-cream-100 border border-white/10">{p.badge}</span> : <span />}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }}
          className={`w-9 h-9 grid place-items-center rounded-full backdrop-blur border border-white/10 transition ${wished ? 'text-[var(--accent)] bg-black/40' : 'text-cream-100/80 bg-black/25 hover:text-[var(--accent)]'}`}
          aria-label="Save to wishlist"
        ><Icon.Heart width={17} height={17} /></button>
      </div>

      {/* image */}
      <div className="relative aspect-square grid place-items-center overflow-hidden">
        <img
          src={p.img} alt={p.name} loading="lazy"
          className="w-[86%] object-contain transition-transform duration-700 ease-luxe group-hover:scale-[1.07] group-hover:rotate-2"
        />
        <img src="./assets/img/glow.webp" alt="" className="screen-glow absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
      </div>

      {/* info */}
      <div className="p-5 pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl leading-none text-cream-50">{p.name}</h3>
          <span className="text-cream-100 tabular-nums shrink-0">${p.price.toFixed(2)}</span>
        </div>
        <p className="text-cream-300/60 text-sm mt-2">{p.tagline}</p>

        <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
          <button onClick={quickAdd} className="btn btn-primary !py-2.5 !px-4 justify-center text-[0.72rem]">
            <Icon.Plus width={15} height={15} /> Quick Add
          </button>
          <button onClick={(e) => { e.stopPropagation(); openProduct(p.id) }} className="btn btn-ghost !py-2.5 !px-4 !text-cream-100 border-white/15 text-[0.72rem]" aria-label="Customise">
            Customise
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Collection() {
  const [filter, setFilter] = useState('All')
  const list = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.tags.includes(filter))
  const revRef = useReveal({ stagger: 0.06 }, [filter])

  return (
    <section id="collection" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Eyebrow className="mb-4">The Collection</Eyebrow>
            <h2 className="h-section">Twelve flavours,<br /><span className="italic text-accent font-normal">zero compromise.</span></h2>
          </div>
          <p className="text-2 max-w-xs text-sm leading-relaxed md:text-right">Every cookie is scooped, chilled and baked in small batches. Tap any to build your own box.</p>
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs tracking-wide2 uppercase border transition ${filter === f ? 'bg-[var(--accent)] text-[#17100a] border-[var(--accent)]' : 'hairline text-2 hover:border-[var(--accent)]/50 hover:text-accent'}`}
            >{f}</button>
          ))}
        </div>

        {/* grid */}
        <div ref={revRef} key={filter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {list.map((p) => <Card key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  )
}
