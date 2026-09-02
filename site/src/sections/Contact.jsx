import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useReveal } from '../hooks'
import { Icon, Eyebrow } from '../components/primitives'

export default function Contact() {
  const revRef = useReveal()
  const toast = useStore((s) => s.toast)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.includes('@')) { toast('Please add your name and a valid email'); return }
    setSent(true)
    toast('Message sent — we’ll reply within a day')
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section id="contact" ref={revRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* left */}
        <div>
          <Eyebrow className="mb-5" data-reveal>Say hello</Eyebrow>
          <h2 className="h-section" data-reveal>Questions, gifting,<br /><span className="italic text-accent font-normal">or wholesale?</span></h2>
          <p className="text-2 mt-6 max-w-md leading-relaxed" data-reveal>Whether it’s a corporate order of five hundred boxes or a single warm cookie emergency — we read every message.</p>

          <div className="mt-10 space-y-5" data-reveal>
            {[['Email', 'hello@noirandcrumb.co'], ['Studio', '12 Rue Saint-Honoré, Paris'], ['Hours', 'Tue–Sun · 8am – 8pm']].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-5">
                <span className="eyebrow w-16 shrink-0">{k}</span>
                <span className="text-[var(--text)]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* form */}
        <form onSubmit={submit} data-reveal className="panel border rounded-[28px] p-6 sm:p-8 self-start w-full">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
            <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
          </div>
          <label className="block mt-4">
            <span className="eyebrow block mb-1.5">Message</span>
            <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you’re dreaming of…" className="w-full rounded-xl bg-transparent hairline border px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition resize-none" />
          </label>
          <button type="submit" className="btn btn-primary w-full justify-center mt-5">
            {sent ? <>Sent <Icon.Check width={16} height={16} /></> : <>Send Message <Icon.Arrow width={16} height={16} /></>}
          </button>
        </form>
      </div>
    </section>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl bg-transparent hairline border px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition" />
    </label>
  )
}
