/* Shared, render-free pointer target for the hero cookie.
   Both the WebGL scene (CookieField) and the mobile touch layer (CookieTouchZone)
   write to this so desktop mouse and mobile drag drive the same rotation. */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

/** Map an absolute client position to the normalized rotation target (-1..1). */
export function setTargetFromClient(cx, cy) {
  const w = window.innerWidth || 1
  const h = window.innerHeight || 1
  pointer.tx = Math.max(-1, Math.min(1, (cx / w) * 2 - 1))
  pointer.ty = Math.max(-1, Math.min(1, -((cy / h) * 2 - 1)))
}

export function resetTarget() { pointer.tx = 0; pointer.ty = 0 }
