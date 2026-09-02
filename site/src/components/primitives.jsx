import { useMagnetic } from '../hooks'

/* ---------- inline icons (stroke = currentColor) ---------- */
const svg = (p) => ({ width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', ...p })
export const Icon = {
  Cart: (p) => (<svg {...svg(p)}><path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L20 8H6" /><circle cx="9" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></svg>),
  Close: (p) => (<svg {...svg(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>),
  Plus: (p) => (<svg {...svg(p)}><path d="M12 5v14M5 12h14" /></svg>),
  Minus: (p) => (<svg {...svg(p)}><path d="M5 12h14" /></svg>),
  Heart: (p) => (<svg {...svg(p)}><path d="M12 20s-7-4.4-9.2-8.5C1.2 8.3 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 4.8 3.3 3.2 6.5C19 15.6 12 20 12 20z" /></svg>),
  Sun: (p) => (<svg {...svg(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>),
  Moon: (p) => (<svg {...svg(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>),
  Star: (p) => (<svg {...svg({ fill: 'currentColor', stroke: 'none', ...p })}><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 20.9l1.1-6.5L2.5 9.8l6.5-.9L12 2.5z" /></svg>),
  Arrow: (p) => (<svg {...svg(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>),
  Menu: (p) => (<svg {...svg(p)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>),
  User: (p) => (<svg {...svg(p)}><circle cx="12" cy="8" r="3.4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>),
  Check: (p) => (<svg {...svg(p)}><path d="M4 12l5 5L20 6" /></svg>),
  Leaf: (p) => (<svg {...svg(p)}><path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16 0-4 2-8 6-10" /></svg>),
}

/* ---------- magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useMagnetic(strength)
  return <span ref={ref} className={`magnetic ${className}`}>{children}</span>
}

export function MagneticButton({ children, className = '', strength = 0.4, ...props }) {
  const ref = useMagnetic(strength)
  return (
    <button ref={ref} className={`magnetic ${className}`} {...props}>
      <span className="inline-flex items-center gap-2 pointer-events-none">{children}</span>
    </button>
  )
}

/* ---------- star rating ---------- */
export function Stars({ n = 5, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--gold)]">
      {Array.from({ length: n }).map((_, i) => <Icon.Star key={i} width={size} height={size} />)}
    </span>
  )
}

/* ---------- eyebrow ---------- */
export function Eyebrow({ children, className = '', ...rest }) {
  return (
    <span className={`eyebrow inline-flex items-center gap-2 ${className}`} {...rest}>
      <span className="w-6 h-px bg-current opacity-60" />{children}
    </span>
  )
}
