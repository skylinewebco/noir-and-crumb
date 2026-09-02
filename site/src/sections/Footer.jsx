import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Icon } from '../components/primitives'

const COLS = [
  { title: 'Shop', links: [['Cookies', '/shop'], ['Collection', '/shop'], ['Gift Boxes', '/shop'], ['Ingredients', '/about']] },
  { title: 'Brand', links: [['Home', '/'], ['Our Story', '/about'], ['Experience', '/experience'], ['Contact', '/contact']] },
]

export default function Footer() {
  const navigate = useNavigate()
  const toast = useStore((s) => s.toast)
  const [email, setEmail] = useState('')
  const sub = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return toast('Enter a valid email')
    toast('Welcome to the table — 10% code sent')
    setEmail('')
  }
  return (
    <footer className="relative pt-20 pb-10 cookie-surface text-cream-100 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-10 md:gap-8 pb-14">
          {/* brand + newsletter */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src="./assets/img/logo.webp" alt="Noir & Crumb" className="h-10 w-auto" />
              <span className="font-display text-2xl">Noir <span className="text-[var(--gold)]">&amp;</span> Crumb</span>
            </div>
            <p className="text-cream-300/60 text-sm max-w-xs leading-relaxed">Crafted to crave, baked to remember. Small-batch cookies, shipped warm from Paris.</p>
            <form onSubmit={sub} className="mt-6 flex gap-2 max-w-sm">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for 10% off" className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] transition" />
              <button className="btn btn-primary !px-4 shrink-0" aria-label="Subscribe"><Icon.Arrow width={16} height={16} /></button>
            </form>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <div className="eyebrow !text-[var(--gold)] mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map(([l, to]) => (
                  <li key={l}><button onClick={() => navigate(to)} className="text-cream-300/70 hover:text-[var(--gold)] transition text-sm link-underline">{l}</button></li>
                ))}
              </ul>
            </div>
          ))}

          {/* hours / social */}
          <div>
            <div className="eyebrow !text-[var(--gold)] mb-4">Visit</div>
            <p className="text-cream-300/70 text-sm leading-relaxed">12 Rue Saint-Honoré<br />75001 Paris, France<br />Tue–Sun · 8am–8pm</p>
            <div className="flex gap-2 mt-5">
              {['IG', 'TT', 'X', 'FB'].map((s) => (
                <button key={s} className="w-10 h-10 rounded-full border border-white/10 grid place-items-center text-[0.7rem] tracking-wide text-cream-200/80 hover:border-[var(--gold)] hover:text-[var(--gold)] transition">{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-cream-300/50 text-xs">
          <div>© {new Date().getFullYear()} Noir &amp; Crumb. All rights reserved.</div>
          <div className="flex gap-6"><button className="hover:text-[var(--gold)]">Privacy</button><button className="hover:text-[var(--gold)]">Terms</button><button className="hover:text-[var(--gold)]">Shipping</button></div>
          <div className="tracking-wide2 uppercase">Made with butter &amp; patience</div>
        </div>
      </div>
    </footer>
  )
}
