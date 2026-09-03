import { INGREDIENTS } from '../data/products'
import { useReveal } from '../hooks'
import { Eyebrow } from '../components/primitives'

export default function Ingredients() {
  const revRef = useReveal({ stagger: 0.07 })
  return (
    <section id="ingredients" className="relative py-24 sm:py-32 overflow-hidden">
      {/* bg */}
      <div className="absolute inset-0 -z-10">
        <img src="./assets/img/bg-slate.webp" srcSet="./assets/img/bg-slate-sm.webp 1100w, ./assets/img/bg-slate.webp 2000w" sizes="100vw" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0b0908]/78" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(var(--bg), transparent 12%, transparent 88%, var(--bg))' }} />
      </div>

      <div ref={revRef} className="mx-auto max-w-[1400px] px-5 sm:px-8 text-cream-100">
        <div className="max-w-2xl">
          <Eyebrow className="mb-5 !text-[var(--gold)]" data-reveal>What’s inside</Eyebrow>
          <h2 className="h-section text-cream-50" data-reveal>Six ingredients<br /><span className="italic text-[var(--gold)] font-normal">worth obsessing over.</span></h2>
          <p className="text-cream-300/70 mt-6 max-w-md leading-relaxed" data-reveal>
            No shortcuts, no fillers. We source single-origin cacao, cultured butter and whole nuts — then treat each one
            with the patience it deserves.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7 mt-14">
          {INGREDIENTS.map((ing, i) => (
            <div key={ing.name} data-reveal className="group relative">
              <div className="relative aspect-square rounded-[24px] overflow-hidden bg-white/[0.03] border border-white/10 grid place-items-center">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 70% at 50% 40%, rgba(220,174,99,0.12), transparent 70%)' }} />
                <img
                  src={ing.img} alt={ing.name} loading="lazy" decoding="async"
                  className="w-[74%] object-contain transition-transform duration-700 ease-luxe group-hover:scale-110"
                  style={{ animation: `float${i % 3} ${6 + (i % 3)}s ease-in-out infinite`, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                />
                <span className="absolute top-3 left-4 font-display text-cream-300/40 text-lg tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl mt-4 text-cream-50">{ing.name}</h3>
              <p className="text-cream-300/55 text-sm mt-1 leading-snug">{ing.note}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes float2{0%,100%{transform:translateY(-4px)}50%{transform:translateY(8px)}}
      `}</style>
    </section>
  )
}
