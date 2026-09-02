/* -------------------------------------------------------------------------
   Mobile-safe autoplay helper.

   iOS Safari (and some Android browsers) will only autoplay a <video> that is
   BOTH muted and playsinline — and React does NOT reliably set the `muted`
   *property* from the JSX attribute, which silently breaks autoplay. We set the
   properties imperatively and, if the browser still refuses (e.g. iOS Low Power
   Mode), we retry on the first user interaction so nothing stays a black box.
--------------------------------------------------------------------------- */

const pending = new Set()
let unlockBound = false

function bindUnlock() {
  if (unlockBound || typeof window === 'undefined') return
  unlockBound = true
  const tryAll = () => {
    pending.forEach((v) => {
      if (!v || !v.isConnected) { pending.delete(v); return }
      v.muted = true
      const p = v.play()
      if (p && p.then) p.then(() => pending.delete(v)).catch(() => {})
    })
  }
  const opts = { passive: true }
  window.addEventListener('touchend', tryAll, opts)
  window.addEventListener('pointerdown', tryAll, opts)
  window.addEventListener('click', tryAll, opts)
  window.addEventListener('scroll', tryAll, opts)
}

/** Configure a <video> element for reliable muted inline autoplay. */
export function prime(video) {
  if (!video) return
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
}

/** Try to play; if blocked, queue a retry on the next user interaction. */
export function tryPlay(video) {
  if (!video) return
  prime(video)
  const p = video.play()
  if (p && p.then) {
    p.catch(() => { pending.add(video); bindUnlock() })
  }
}
