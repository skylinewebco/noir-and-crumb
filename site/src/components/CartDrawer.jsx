import { useEffect } from 'react'
import { useStore, cartTotal, cartCount, lineKey, linePrice } from '../store/useStore'
import { CUSTOMIZE } from '../data/products'
import { Icon } from './primitives'
import { scrollTo } from '../lib/smooth'

const desc = (i) => {
  const size = CUSTOMIZE.size.find((s) => s.key === i.size)?.label
  const choc = CUSTOMIZE.chocolate.find((c) => c.key === i.chocolate)?.label
  const adds = (i.addons || []).map((k) => CUSTOMIZE.addons.find((a) => a.key === k)?.label).filter(Boolean)
  return [size, choc, ...adds].filter(Boolean).join(' · ')
}

export default function CartDrawer() {
  const open = useStore((s) => s.ui.cart)
  const openUI = useStore((s) => s.openUI)
  const cart = useStore((s) => s.cart)
  const updateQty = useStore((s) => s.updateQty)
  const removeLine = useStore((s) => s.removeLine)
  const total = cartTotal(cart)
  const count = cartCount(cart)
  const freeAt = 40
  const pct = Math.min(100, (total / freeAt) * 100)

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  const checkout = () => { openUI('cart', false); openUI('checkout', true) }

  return (
    <div className={`fixed inset-0 z-[80] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-[3px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => openUI('cart', false)} />
      <aside className={`absolute top-0 right-0 h-full w-full sm:w-[440px] panel border-l flex flex-col transition-transform duration-500 ease-luxe ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* header */}
        <div className="flex items-center justify-between px-6 h-[74px] hairline border-b shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl">Your Box</span>
            <span className="text-3 text-sm">{count} item{count !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={() => openUI('cart', false)} className="w-10 h-10 grid place-items-center rounded-full hover:text-accent hover:bg-black/5 dark:hover:bg-white/5 transition" aria-label="Close cart"><Icon.Close /></button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="w-20 h-20 rounded-full cookie-surface grid place-items-center text-3"><Icon.Cart width={30} height={30} /></div>
            <div>
              <div className="font-display text-2xl mb-1">Your box is empty</div>
              <p className="text-3 text-sm">Warm, small-batch cookies are waiting.</p>
            </div>
            <button onClick={() => { openUI('cart', false); scrollTo('#collection') }} className="btn btn-primary">Explore Cookies</button>
          </div>
        ) : (
          <>
            {/* free shipping meter */}
            <div className="px-6 pt-4 shrink-0">
              <div className="text-xs text-3 mb-2">{total >= freeAt ? 'You’ve unlocked complimentary delivery 🎉' : `$${(freeAt - total).toFixed(2)} away from free delivery`}</div>
              <div className="h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden"><div className="h-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} /></div>
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {cart.map((i) => {
                const key = lineKey(i)
                return (
                  <div key={key} className="flex gap-4 items-center group">
                    <div className="w-[74px] h-[74px] rounded-2xl cookie-surface overflow-hidden shrink-0 grid place-items-center">
                      <img src={i.img} alt={i.name} className="w-full h-full object-contain scale-110" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium leading-tight">{i.name}</div>
                        <button onClick={() => removeLine(key)} className="text-3 hover:text-accent transition shrink-0" aria-label="Remove"><Icon.Close width={16} height={16} /></button>
                      </div>
                      <div className="text-3 text-[0.72rem] mt-0.5 truncate">{desc(i)}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center gap-3 rounded-full hairline border px-2 py-1">
                          <button onClick={() => updateQty(key, -1)} className="hover:text-accent" aria-label="Decrease"><Icon.Minus width={14} height={14} /></button>
                          <span className="text-sm tabular-nums w-4 text-center">{i.qty}</span>
                          <button onClick={() => updateQty(key, 1)} className="hover:text-accent" aria-label="Increase"><Icon.Plus width={14} height={14} /></button>
                        </div>
                        <div className="text-sm tabular-nums font-medium">${linePrice(i).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* footer */}
            <div className="px-6 py-5 hairline border-t shrink-0 space-y-4">
              <div className="flex items-center justify-between text-sm text-2"><span>Subtotal</span><span className="tabular-nums text-[var(--text)] text-base font-medium">${total.toFixed(2)}</span></div>
              <button onClick={checkout} className="btn btn-primary w-full justify-center">Proceed to Checkout <Icon.Arrow width={16} height={16} /></button>
              <button onClick={() => openUI('cart', false)} className="text-xs text-3 hover:text-accent w-full text-center tracking-wide2 uppercase">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
