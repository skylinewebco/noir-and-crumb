import { useEffect, useState } from 'react'
import { useStore, cartTotal, lineKey, linePrice } from '../store/useStore'
import { Icon } from './primitives'

const PAYMENTS = [
  { key: 'cod', label: 'Cash on Delivery', note: 'Pay when it arrives, still warm.' },
  { key: 'card', label: 'Credit / Debit Card', note: 'Visa · Mastercard · Amex' },
  { key: 'bank', label: 'Bank Transfer', note: 'Direct bank payment' },
  { key: 'wallet', label: 'Local Wallet', note: 'Regional online wallet' },
]

export default function CheckoutModal() {
  const open = useStore((s) => s.ui.checkout)
  const openUI = useStore((s) => s.openUI)
  const cart = useStore((s) => s.cart)
  const clearCart = useStore((s) => s.clearCart)
  const user = useStore((s) => s.user)
  const toast = useStore((s) => s.toast)

  const [step, setStep] = useState(0)
  const [pay, setPay] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [info, setInfo] = useState({ name: '', phone: '', address: '', city: '' })
  const subtotal = cartTotal(cart)
  const delivery = subtotal >= 40 || subtotal === 0 ? 0 : 4.5
  const total = subtotal + delivery

  useEffect(() => { document.body.classList.toggle('no-scroll', open); return () => document.body.classList.remove('no-scroll') }, [open])
  useEffect(() => { if (open) { setStep(0); setPlacing(false); if (user) setInfo((i) => ({ ...i, name: user.name })) } }, [open]) // eslint-disable-line

  const valid = info.name.trim() && info.phone.trim().length >= 6 && info.address.trim() && info.city.trim()

  const place = () => {
    setPlacing(true)
    setTimeout(() => { setStep(2); clearCart(); toast('Order confirmed — check your inbox') }, 1400)
  }

  const close = () => openUI('checkout', false)

  return (
    <div className={`fixed inset-0 z-[86] ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/75 backdrop-blur-[4px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={close} />
      <div className="absolute inset-0 grid place-items-center p-3 sm:p-6 overflow-y-auto">
        <div className={`relative w-full max-w-[880px] panel rounded-[28px] overflow-hidden shadow-[var(--shadow)] transition-all duration-500 ease-luxe ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
          <button onClick={close} className="absolute top-4 right-4 z-10 w-10 h-10 grid place-items-center rounded-full glass hover:text-accent" aria-label="Close"><Icon.Close /></button>

          {step === 2 ? (
            <div className="p-10 sm:p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-[var(--accent)] text-[#17100a] grid place-items-center mb-6" style={{ animation: 'pop .6s cubic-bezier(0.16,1,0.3,1)' }}><Icon.Check width={38} height={38} /></div>
              <div className="font-display text-4xl sm:text-5xl">Thank you.</div>
              <p className="text-2 mt-3 max-w-md mx-auto">Your cookies are heading to the oven. A confirmation is on its way to your inbox — order <span className="text-accent">#NC-{Math.floor(1000 + Math.random() * 9000)}</span>.</p>
              <button onClick={close} className="btn btn-primary mt-8 justify-center mx-auto">Back to Noir &amp; Crumb</button>
              <style>{`@keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}`}</style>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_360px]">
              {/* form side */}
              <div className="p-6 sm:p-8">
                <div className="font-display text-3xl mb-1">Checkout</div>
                {/* steps */}
                <div className="flex items-center gap-2 text-xs text-3 mb-6">
                  <span className={step >= 0 ? 'text-accent' : ''}>Details</span><span className="w-6 h-px bg-current opacity-40" />
                  <span className={step >= 1 ? 'text-accent' : ''}>Payment</span>
                </div>

                {step === 0 && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field className="sm:col-span-2" label="Full name" value={info.name} onChange={(v) => setInfo({ ...info, name: v })} placeholder="Isabelle Renaud" />
                    <Field label="Phone" value={info.phone} onChange={(v) => setInfo({ ...info, phone: v })} placeholder="+1 555 000 1234" />
                    <Field label="City" value={info.city} onChange={(v) => setInfo({ ...info, city: v })} placeholder="Paris" />
                    <Field className="sm:col-span-2" label="Delivery address" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} placeholder="12 Rue Saint-Honoré, Apt 4" />
                    <button onClick={() => valid && setStep(1)} disabled={!valid} className={`btn sm:col-span-2 justify-center mt-1 ${valid ? 'btn-primary' : 'btn-ghost opacity-50 cursor-not-allowed'}`}>Continue to Payment <Icon.Arrow width={16} height={16} /></button>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <div className="grid gap-2.5">
                      {PAYMENTS.map((p) => (
                        <button key={p.key} onClick={() => setPay(p.key)} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition ${pay === p.key ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'hairline hover:border-[var(--accent)]/50'}`}>
                          <span className={`w-4 h-4 rounded-full border-2 grid place-items-center ${pay === p.key ? 'border-[var(--accent)]' : 'border-current opacity-40'}`}>{pay === p.key && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}</span>
                          <span className="flex-1"><span className="block text-sm font-medium">{p.label}</span><span className="block text-[0.72rem] text-3">{p.note}</span></span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <button onClick={() => setStep(0)} className="btn btn-ghost">Back</button>
                      <button onClick={place} disabled={placing} className="btn btn-primary flex-1 justify-center">
                        {placing ? 'Placing order…' : <>Place Order · ${total.toFixed(2)}</>}
                      </button>
                    </div>
                    <p className="text-[0.66rem] text-3 mt-3 text-center">Demo checkout — no real payment is processed.</p>
                  </div>
                )}
              </div>

              {/* summary side */}
              <div className="cookie-surface p-6 sm:p-8 md:border-l hairline">
                <div className="eyebrow mb-4 text-cream-200">Order summary</div>
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {cart.length === 0 && <p className="text-cream-300/60 text-sm">Your box is empty.</p>}
                  {cart.map((i) => (
                    <div key={lineKey(i)} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-black/40 overflow-hidden grid place-items-center shrink-0"><img src={i.img} alt="" className="w-full h-full object-contain scale-110" /></div>
                      <div className="flex-1 min-w-0"><div className="text-sm text-cream-100 truncate">{i.name}</div><div className="text-[0.68rem] text-cream-300/60">Qty {i.qty}</div></div>
                      <div className="text-sm text-cream-100 tabular-nums">${linePrice(i).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-sm text-cream-300/80">
                  <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                  <Row label="Delivery" value={delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`} />
                  <div className="flex items-center justify-between pt-2 text-cream-50 text-lg"><span className="font-display text-2xl">Total</span><span className="tabular-nums font-medium">${total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow block mb-1.5">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl bg-transparent hairline border px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition" />
    </label>
  )
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span>{label}</span><span className="tabular-nums">{value}</span></div>
}
