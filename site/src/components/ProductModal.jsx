import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PRODUCTS, CUSTOMIZE } from '../data/products'
import { Icon, Stars } from './primitives'

function Bar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-[0.7rem] uppercase tracking-wide2 text-3 shrink-0">{label}</span>
      <span className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <span className="block h-full bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent)]" style={{ width: `${value * 20}%` }} />
      </span>
    </div>
  )
}

export default function ProductModal() {
  const id = useStore((s) => s.ui.product)
  const openUI = useStore((s) => s.openUI)
  const openProduct = useStore((s) => s.openProduct)
  const addToCart = useStore((s) => s.addToCart)
  const toast = useStore((s) => s.toast)
  const wishlist = useStore((s) => s.wishlist)
  const toggleWishlist = useStore((s) => s.toggleWishlist)

  const product = PRODUCTS.find((p) => p.id === id)
  const open = !!product

  const [size, setSize] = useState('half')
  const [choc, setChoc] = useState('dark')
  const [addons, setAddons] = useState([])
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) { setSize('half'); setChoc('dark'); setAddons([]); setQty(1) }
  }, [id])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  const price = useMemo(() => {
    if (!product) return 0
    const mult = CUSTOMIZE.size.find((s) => s.key === size)?.mult ?? 1
    const c = CUSTOMIZE.chocolate.find((c) => c.key === choc)?.price ?? 0
    const a = addons.reduce((s, k) => s + (CUSTOMIZE.addons.find((x) => x.key === k)?.price ?? 0), 0)
    return (product.price * mult + c + a) * qty
  }, [product, size, choc, addons, qty])

  if (!product) return null
  const wished = wishlist.includes(product.id)

  const toggleAddon = (k) => setAddons((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]))
  const add = () => {
    addToCart({ id: product.id, size, chocolate: choc, addons, qty })
    toast(`${product.name} added to your box`)
    openProduct(null)
    openUI('cart', true)
  }

  return (
    <div className={`fixed inset-0 z-[85] ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-[4px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => openProduct(null)} />
      <div className="absolute inset-0 grid place-items-center p-3 sm:p-6 overflow-y-auto">
        <div className={`relative w-full max-w-[920px] panel rounded-[28px] overflow-hidden shadow-[var(--shadow)] transition-all duration-500 ease-luxe ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
          <button onClick={() => openProduct(null)} className="absolute top-4 right-4 z-10 w-10 h-10 grid place-items-center rounded-full glass hover:text-accent" aria-label="Close"><Icon.Close /></button>

          <div className="grid md:grid-cols-2">
            {/* image */}
            <div className="relative cookie-surface min-h-[280px] md:min-h-full grid place-items-center p-8">
              {product.badge && <span className="absolute top-5 left-5 text-[0.66rem] tracking-luxe uppercase px-3 py-1.5 rounded-full bg-[var(--accent)] text-[#17100a] font-semibold">{product.badge}</span>}
              <img src={product.img} alt={product.name} className="w-full max-w-[360px] object-contain drop-shadow-2xl" />
            </div>

            {/* details */}
            <div className="p-6 sm:p-8 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><Stars /> <span className="text-3 text-xs">128 reviews</span></div>
                <button onClick={() => toggleWishlist(product.id)} className={`w-9 h-9 grid place-items-center rounded-full hairline border transition ${wished ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-2 hover:text-accent'}`} aria-label="Save">
                  <Icon.Heart width={18} height={18} />
                </button>
              </div>

              <h2 className="font-display text-4xl mt-3 leading-none">{product.name}</h2>
              <p className="text-2 mt-3 text-[0.95rem] leading-relaxed">{product.profile}</p>

              <div className="mt-5 space-y-2">
                <Bar label="Sweet" value={product.flavor.sweet} />
                <Bar label="Rich" value={product.flavor.rich} />
                <Bar label="Salt" value={product.flavor.salt} />
              </div>

              {/* size */}
              <div className="mt-6">
                <div className="eyebrow mb-2">Box size</div>
                <div className="grid grid-cols-3 gap-2">
                  {CUSTOMIZE.size.map((s) => (
                    <button key={s.key} onClick={() => setSize(s.key)} className={`relative rounded-2xl border px-2 py-3 text-center transition ${size === s.key ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'hairline hover:border-[var(--accent)]/50'}`}>
                      {s.tag && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] tracking-wide2 uppercase px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-[#17100a] whitespace-nowrap">{s.tag}</span>}
                      <div className="text-sm font-medium leading-tight">{s.label}</div>
                      <div className="text-[0.66rem] text-3 mt-0.5">{s.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* chocolate */}
              <div className="mt-5">
                <div className="eyebrow mb-2">Chocolate</div>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMIZE.chocolate.map((c) => (
                    <button key={c.key} onClick={() => setChoc(c.key)} className={`px-3.5 py-2 rounded-full text-xs border transition ${choc === c.key ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]' : 'hairline text-2 hover:border-[var(--accent)]/50'}`}>
                      {c.label}{c.price ? ` +$${c.price}` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* addons */}
              <div className="mt-5">
                <div className="eyebrow mb-2">Finishing touches</div>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMIZE.addons.map((a) => (
                    <button key={a.key} onClick={() => toggleAddon(a.key)} className={`px-3.5 py-2 rounded-full text-xs border transition inline-flex items-center gap-1.5 ${addons.includes(a.key) ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'hairline text-2 hover:border-[var(--accent)]/50'}`}>
                      {addons.includes(a.key) && <Icon.Check width={12} height={12} />}{a.label} +${a.price}
                    </button>
                  ))}
                </div>
              </div>

              {/* qty + add */}
              <div className="mt-7 flex items-center gap-3">
                <div className="inline-flex items-center gap-4 rounded-full hairline border px-3 py-2.5">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="hover:text-accent" aria-label="Decrease"><Icon.Minus width={16} height={16} /></button>
                  <span className="tabular-nums w-4 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="hover:text-accent" aria-label="Increase"><Icon.Plus width={16} height={16} /></button>
                </div>
                <button onClick={add} className="btn btn-primary flex-1 justify-center">
                  Add to Box · <span className="tabular-nums">${price.toFixed(2)}</span>
                </button>
              </div>
              <p className="text-[0.7rem] text-3 mt-3">{product.calories} kcal / cookie · Baked & shipped within 24h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
