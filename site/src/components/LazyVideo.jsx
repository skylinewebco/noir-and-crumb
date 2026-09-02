import { useEffect, useRef, useState } from 'react'

/**
 * Performance-first looping video:
 * - src only attaches when near viewport (saves bandwidth / decode)
 * - plays only while visible, pauses when scrolled away
 * - poster shown until first frame; fades in
 */
export default function LazyVideo({
  src, poster, className = '', style, objectPosition = 'center',
  eager = false, overlay = true,
}) {
  const ref = useRef(null)
  const wrapRef = useRef(null)
  const [load, setLoad] = useState(eager)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = ref.current
          if (e.isIntersecting) {
            setLoad(true)
            if (v && v.readyState >= 2) v.play().catch(() => {})
          } else if (v) {
            v.pause()
          }
        })
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} style={style}>
      {poster && (
        <img
          src={poster} alt="" aria-hidden loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ objectPosition, opacity: ready ? 0 : 1 }}
        />
      )}
      {load && (
        <video
          ref={ref}
          className="w-full h-full object-cover"
          style={{ objectPosition, opacity: ready ? 1 : 0, transition: 'opacity .7s ease' }}
          src={src}
          poster={poster}
          muted playsInline loop autoPlay preload="metadata"
          onLoadedData={(e) => { setReady(true); e.currentTarget.play().catch(() => {}) }}
        />
      )}
      {overlay && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />}
    </div>
  )
}
