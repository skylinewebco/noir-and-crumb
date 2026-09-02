import { useEffect, useRef, useState } from 'react'
import { useStore, cartCount } from '../store/useStore'
import { scrollTo } from '../lib/smooth'
import { Icon, Magnetic } from './primitives'

const LINKS = [
  { label: 'Collection', to: '#collection' },
  { label: 'Ingredients', to: '#ingredients' },
  { label: 'Story', to: '#story' },
  { label: 'Gifting', to: '#gifting' },
  { label: 'Contact', to: '#contact' },
]

export default function Navbar() {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const openUI = useStore((s) => s.openUI)
  const cart = useStore((s) => s.cart)
  const user = useStore((s) => s.user)
  const count = cartCount(cart)

  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  const last = useRef(0)
  const bump = useRef(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setSolid(y > 40)
        setHidden(y > 320 && y > last.current && !menu)
        last.current = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [menu])

  // pulse cart when count changes
  useEffect(() => {
    if (!bump.current || count === 0) return
    bump.current.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
      { duration: 420, easing: 'cubic-bezier(0.16,1,0.3,1)' }
    )
  }, [count])

  const go = (to) => { setMenu(false); scrollTo(to) }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-500 ease-luxe ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className={`transition-all duration-500 ${solid ? 'glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)]' : 'bg-transparent'}`}>
          <nav className="mx-auto max-w-[1400px] px-5 sm:px-8 h-16 sm:h-[74px] flex items-center justify-between gap-4">
            {/* logo */}
            <button onClick={() => scrollTo('#top')} className="flex items-center gap-2.5 group shrink-0" aria-label="Noir and Crumb home">
              <img src="./assets/img/logo.webp" alt="" className="h-8 sm:h-9 w-auto" style={{ filter: theme === 'dark' ? 'none' : 'brightness(0.55) saturate(1.2)' }} />
              <span className="font-display text-lg sm:text-xl leading-none tracking-tight hidden xs:block sm:block">Noir&nbsp;<span className="text-accent">&amp;</span>&nbsp;Crumb</span>
            </button>

            {/* links */}
            <div className="hidden lg:flex items-center gap-8 text-[0.82rem] tracking-wide2 uppercase text-2">
              {LINKS.map((l) => (
                <button key={l.to} onClick={() => go(l.to)} className="link-underline hover:text-accent transition-colors">{l.label}</button>
              ))}
            </div>

            {/* actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Magnetic strength={0.25}>
                <button onClick={toggleTheme} aria-label="Toggle theme" className="w-10 h-10 grid place-items-center rounded-full hover:text-accent transition-colors">
                  {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
                </button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <button onClick={() => openUI('auth')} aria-label="Account" className="w-10 h-10 grid place-items-center rounded-full hover:text-accent transition-colors">
                  <Icon.User />
                </button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <button onClick={() => openUI('cart')} aria-label="Cart" className="relative w-10 h-10 grid place-items-center rounded-full hover:text-accent transition-colors">
                  <Icon.Cart />
                  <span ref={bump} className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-semibold bg-[var(--accent)] text-[#17100a] transition-opacity ${count ? 'opacity-100' : 'opacity-0'}`}>{count}</span>
                </button>
              </Magnetic>
              <button onClick={() => setMenu((m) => !m)} aria-label="Menu" className="lg:hidden w-10 h-10 grid place-items-center rounded-full hover:text-accent">
                {menu ? <Icon.Close /> : <Icon.Menu />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* mobile menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-500 ${menu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenu(false)} />
        <div className={`absolute top-0 right-0 h-full w-[82%] max-w-[360px] panel border-l flex flex-col pt-24 px-8 transition-transform duration-500 ease-luxe ${menu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="eyebrow mb-6">Menu</div>
          <div className="flex flex-col gap-1">
            {LINKS.map((l, i) => (
              <button key={l.to} onClick={() => go(l.to)} className="text-left font-display text-3xl py-2.5 hairline border-b hover:text-accent transition-colors">{l.label}</button>
            ))}
          </div>
          <button onClick={() => { setMenu(false); openUI('auth') }} className="btn btn-ghost mt-8 justify-center">
            <Icon.User width={16} height={16} /> {user ? user.name.split(' ')[0] : 'Sign In'}
          </button>
          <div className="mt-auto pb-10 text-3 text-xs tracking-wide2 uppercase">Crafted to crave · Baked to remember</div>
        </div>
      </div>
    </>
  )
}
