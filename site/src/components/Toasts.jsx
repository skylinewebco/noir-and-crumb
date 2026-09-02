import { useStore } from '../store/useStore'
import { Icon } from './primitives'

export default function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="fixed z-[90] bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-[92%] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto w-full glass rounded-full px-4 py-3 flex items-center gap-3 text-sm shadow-[var(--shadow)]"
          style={{ animation: 'toastIn .5s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <span className="w-6 h-6 grid place-items-center rounded-full bg-[var(--accent)] text-[#17100a] shrink-0">
            <Icon.Check width={14} height={14} />
          </span>
          <span className="text-2">{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
