import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Icon } from './primitives'

export default function AuthModal() {
  const open = useStore((s) => s.ui.auth)
  const openUI = useStore((s) => s.openUI)
  const user = useStore((s) => s.user)
  const signIn = useStore((s) => s.signIn)
  const signOut = useStore((s) => s.signOut)
  const toast = useStore((s) => s.toast)

  const [mode, setMode] = useState('in')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')

  useEffect(() => { document.body.classList.toggle('no-scroll', open); return () => document.body.classList.remove('no-scroll') }, [open])
  useEffect(() => { if (open) { setErr(''); setForm({ name: '', email: '', password: '' }) } }, [open, mode])

  const submit = (e) => {
    e.preventDefault()
    if (!form.email.includes('@')) return setErr('Please enter a valid email.')
    if (form.password.length < 4) return setErr('Password must be at least 4 characters.')
    if (mode === 'up' && !form.name.trim()) return setErr('Please tell us your name.')
    const name = mode === 'up' ? form.name.trim() : form.email.split('@')[0]
    signIn({ name: name.charAt(0).toUpperCase() + name.slice(1), email: form.email })
    toast(`Welcome${mode === 'up' ? '' : ' back'}, ${name.split(' ')[0]}`)
    openUI('auth', false)
  }

  return (
    <div className={`fixed inset-0 z-[85] ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-[4px] transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => openUI('auth', false)} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className={`relative w-full max-w-[420px] panel rounded-[26px] p-7 sm:p-8 shadow-[var(--shadow)] transition-all duration-500 ease-luxe ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
          <button onClick={() => openUI('auth', false)} className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full hover:text-accent" aria-label="Close"><Icon.Close /></button>

          {user ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)] text-[#17100a] grid place-items-center font-display text-2xl mb-4">{user.name.charAt(0)}</div>
              <div className="font-display text-3xl">{user.name}</div>
              <div className="text-3 text-sm mt-1">{user.email}</div>
              <div className="mt-6 grid gap-2 text-left">
                {['My Orders', 'Saved Cookies', 'Addresses', 'Subscription'].map((x) => (
                  <button key={x} className="flex items-center justify-between px-4 py-3 rounded-xl hairline border hover:border-[var(--accent)]/50 transition text-sm">{x}<Icon.Arrow width={16} height={16} /></button>
                ))}
              </div>
              <button onClick={() => { signOut(); toast('Signed out'); }} className="btn btn-ghost w-full justify-center mt-6">Sign Out</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <img src="./assets/img/logo.webp" alt="" className="h-10 mx-auto mb-3" />
                <div className="font-display text-3xl leading-none">{mode === 'in' ? 'Welcome back' : 'Join the table'}</div>
                <p className="text-3 text-sm mt-2">{mode === 'in' ? 'Sign in to track orders & save favourites.' : 'Create an account for faster checkout & rewards.'}</p>
              </div>
              <form onSubmit={submit} className="space-y-3">
                {mode === 'up' && <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Isabelle Renaud" />}
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="you@example.com" />
                <Field label="Password" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="••••••••" />
                {err && <div className="text-xs text-red-400">{err}</div>}
                <button type="submit" className="btn btn-primary w-full justify-center mt-1">{mode === 'in' ? 'Sign In' : 'Create Account'}</button>
              </form>
              <div className="text-center text-sm text-3 mt-5">
                {mode === 'in' ? "New here? " : 'Already have an account? '}
                <button onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="text-accent link-underline">{mode === 'in' ? 'Create account' : 'Sign in'}</button>
              </div>
              <p className="text-[0.66rem] text-3 text-center mt-4">Demo authentication — no real credentials are stored.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-transparent hairline border px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition"
      />
    </label>
  )
}
