import { useEffect, useRef, useState } from 'react'
import { prime, tryPlay } from '../lib/video'

/**
 * Performance-first, mobile-safe looping video.
 * - src attaches only when near viewport (saves bandwidth / decode)
 * - muted/playsInline set as DOM *properties* so iOS actually autoplays
 * - plays only while visible, pauses when scrolled away
 * - poster shown until first frame; retries play on user interaction if blocked
 */
export default function LazyVideo({
  src, poster, className = '', style, objectPosition = 'center',
  eager = false, overlay = true,
}) {
  const ref = useRef(null)
  const wrapRef = useRef(null)
  const visible = useRef(false)
  const [load, setLoad] = useState(eager)
  const [ready, setReady] = useState(false)

  // configure the element for autoplay the moment it mounts
  useEffect(() => { if (ref.current) prime(ref.current) }, [load])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        visible.current = e.isIntersecting
        const v = ref.current
        if (e.isIntersecting) {
          setLoad(true)
          if (v) tryPlay(v)
        } else if (v) {
          v.pause()
        }
      },
      { rootMargin: '250px 0px', threshold: 0.01 }
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
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onLoadedData={(e) => { setReady(true); if (visible.current) tryPlay(e.currentTarget) }}
          onCanPlay={(e) => { if (visible.current) tryPlay(e.currentTarget) }}
        />
      )}
      {overlay && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />}
    </div>
  )
}
