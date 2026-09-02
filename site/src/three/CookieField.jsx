import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useIsMobile } from '../hooks'

/* -------------------------------------------------------------------------
   Shared, render-free state (no React re-renders per frame).
   - pointer: normalized mouse (-1..1), fed from a window listener so the
     canvas can stay pointer-events:none and never block clicks.
   - scroll:  live scroll metrics. `vh` is cached (updated on resize only) so
     we never force a layout read inside the render loop. `jS`/`heroS` are the
     temporally-smoothed values the visuals actually use — this removes any
     jitter caused by the R3F loop sampling scroll on a different rAF tick
     than Lenis writes it.
--------------------------------------------------------------------------- */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
let vhCache = typeof window !== 'undefined' ? window.innerHeight || 1 : 1
const scroll = { y: 0, journey: 0, jS: 0, heroS: 0 }

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/* Runs first each frame: reads scroll cheaply and smooths it once. */
function ScrollDriver() {
  useFrame((_, dtRaw) => {
    const dt = dtRaw > 0.05 ? 0.05 : dtRaw
    scroll.y = window.scrollY || window.pageYOffset || 0
    scroll.journey = scroll.y / vhCache
    // critically-smoothed follow — kills cross-loop micro-jitter, keeps travel fluid
    const k = 1 - Math.pow(0.0016, dt) // ~time-based lerp, frame-rate independent
    scroll.jS += (scroll.journey - scroll.jS) * k
    scroll.heroS = scroll.jS < 1 ? scroll.jS : 1
  })
  return null
}

/* ---------- the real 3D cookie (textured disc with a baked rim) ---------- */
function Cookie({ mobile }) {
  const group = useRef()
  const tex = useTexture('./assets/img/hero-cookie.webp')

  const capTex = useMemo(() => {
    const t = tex.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.center.set(0.5, 0.5)
    t.repeat.set(0.74, 0.74)
    t.needsUpdate = true
    return t
  }, [tex])

  const backTex = useMemo(() => {
    const t = capTex.clone()
    t.center.set(0.5, 0.5)
    t.repeat.set(-0.74, 0.74)
    t.offset.set(1, 0)
    t.needsUpdate = true
    return t
  }, [capTex])

  const rimTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 8; c.height = 128
    const ctx = c.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0.0, '#20140d')
    g.addColorStop(0.28, '#4a3121')
    g.addColorStop(0.5, '#6b4630')
    g.addColorStop(0.72, '#402a1c')
    g.addColorStop(1.0, '#1b110b')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  const materials = useMemo(() => ([
    new THREE.MeshBasicMaterial({ map: rimTex, transparent: true, toneMapped: false }),
    new THREE.MeshBasicMaterial({ map: capTex, transparent: true, toneMapped: false }),
    new THREE.MeshBasicMaterial({ map: backTex, transparent: true, toneMapped: false, color: '#d9c3a1' }),
  ]), [rimTex, capTex, backTex])

  const rot = useRef({ yaw: 0, yawV: 0, pitch: 0.06, pitchV: 0 })
  const lastOp = useRef(1)
  const MAX_YAW = mobile ? 0.6 : 1.65
  const MAX_PITCH = mobile ? 0.45 : 1.15

  useFrame((state, dtRaw) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const dt = dtRaw > 0.033 ? 0.033 : dtRaw
    const j = scroll.jS // smoothed journey

    // ease pointer, then drive rotation with a damped spring (inertia)
    const pe = dt * 6
    pointer.x += (pointer.tx - pointer.x) * (pe < 1 ? pe : 1)
    pointer.y += (pointer.ty - pointer.y) * (pe < 1 ? pe : 1)

    const targetYaw = pointer.x * MAX_YAW
    const targetPitch = 0.06 - pointer.y * MAX_PITCH
    const stiffness = 120, damping = 15
    const r = rot.current
    r.yawV += ((targetYaw - r.yaw) * stiffness - r.yawV * damping) * dt
    r.yaw += r.yawV * dt
    r.pitchV += ((targetPitch - r.pitch) * stiffness - r.pitchV * damping) * dt
    r.pitch += r.pitchV * dt

    // compose: interaction + idle life + scroll-driven tumble
    const fall = mobile ? 3.0 : 3.4
    g.rotation.y = r.yaw + j * 0.35
    g.rotation.x = r.pitch + Math.sin(t * 0.6) * 0.04 + j * (mobile ? 1.7 : 2.1)
    g.rotation.z = Math.sin(t * 0.35) * 0.03 + j * 0.6

    const baseY = mobile ? -1.3 : 0
    g.position.y = baseY + Math.sin(t * 0.7) * 0.08 - j * fall
    g.position.x = j * (mobile ? 0.5 : 1.5)
    g.position.z = -j * 0.9 // recede for depth (compensates the removed blur)

    const base = mobile ? 1.75 : 2.75
    g.scale.setScalar(base * (1 - clamp01(j) * 0.3))

    // opacity: full through hero, fade out as it leaves (write only on change)
    const op = clamp01(1 - (j - 0.7) / 1.7)
    if (op !== lastOp.current) {
      materials[0].opacity = op
      materials[1].opacity = op
      materials[2].opacity = op
      g.visible = op > 0.001
      lastOp.current = op
    }
  })

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
        <cylinderGeometry args={[0.5, 0.5, 0.14, 64, 1, false]} />
      </mesh>
    </group>
  )
}

/* ---------- volumetric glow (hero only) ---------- */
function Glow() {
  const tex = useTexture('./assets/img/glow.webp')
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const o = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.08 - scroll.heroS * 0.55
    ref.current.material.opacity = o > 0 ? o : 0
    ref.current.visible = o > 0.001
  })
  return (
    <mesh ref={ref} position={[0, 0, -1.4]} scale={9}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.5} toneMapped={false} />
    </mesh>
  )
}

/* ---------- drifting cocoa particles (hero only) ---------- */
function Particles({ count = 130 }) {
  const ref = useRef()
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1
      speeds[i] = 0.06 + Math.random() * 0.14
    }
    return { positions, speeds }
  }, [count])

  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(230,190,120,0.9)'); g.addColorStop(1, 'rgba(230,190,120,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])

  useFrame((state, dt) => {
    const pts = ref.current
    if (!pts) return
    const op = 0.7 - scroll.heroS * 0.7
    if (op <= 0.001) {
      if (pts.visible) { pts.visible = false; pts.material.opacity = 0 }
      return // fully faded past the hero -> no buffer work, no draw
    }
    pts.visible = true
    pts.material.opacity = op
    const arr = pts.geometry.attributes.position.array
    const et = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1
      arr[iy] += speeds[i] * dt
      arr[i * 3] += Math.sin(et * 0.3 + i) * dt * 0.05
      if (arr[iy] > 4.6) arr[iy] = -4.6
    }
    pts.geometry.attributes.position.needsUpdate = true
    pts.rotation.y = pointer.x * 0.15
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.14} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation color={'#e6be78'} />
    </points>
  )
}

function Rig() {
  const { camera } = useThree()
  useFrame((_, dt) => {
    const s = dt * 2 < 1 ? dt * 2 : 1
    camera.position.x += (pointer.x * 0.35 - camera.position.x) * s
    camera.position.y += (pointer.y * 0.22 - camera.position.y) * s
    camera.lookAt(0, 0, 0)
  })
  return null
}

function SceneContents({ mobile, setDpr, maxDpr }) {
  return (
    <>
      {/* adaptive DPR — actually wired to the Canvas dpr now, so it drops
          resolution under sustained load and restores it when there's headroom */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, +(d + 0.15).toFixed(2)))}
      />
      <ScrollDriver />
      <Suspense fallback={null}>
        <Glow />
        <Cookie mobile={mobile} />
        <Particles count={mobile ? 46 : 130} />
      </Suspense>
      <Rig />
    </>
  )
}

export default function CookieField() {
  const mobile = useIsMobile()
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(true)
  const [dpr, setDpr] = useState(mobile ? 1.25 : 1.6)
  const maxDpr = mobile ? 1.4 : 1.9

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) setFailed(true)
    } catch { setFailed(true) }
  }, [])

  // global pointer (window-level so the canvas can be pointer-events:none)
  useEffect(() => {
    const onMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => { pointer.tx = 0; pointer.ty = 0 }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onLeave, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerout', onLeave) }
  }, [])

  // Pause the render loop once the cookie has left (perf), and cache viewport
  // height so the render loop never triggers a layout read. No per-frame DOM
  // writes here — the previous CSS blur was removed (it was the main jank).
  useEffect(() => {
    let ticking = false
    const apply = () => {
      ticking = false
      const j = (window.scrollY || 0) / vhCache
      const shouldRender = j < 2.5
      setActive((prev) => (prev !== shouldRender ? shouldRender : prev))
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply) } }
    const onResize = () => { vhCache = window.innerHeight || 1; apply() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    apply()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  if (failed) {
    return (
      <div className="fixed inset-0 z-[3] pointer-events-none flex items-start justify-center">
        <img src="./assets/img/hero-cookie.webp" alt="Noir & Crumb signature cookie"
          className="w-[70vw] max-w-[520px] mt-[18vh]" style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))' }} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[3] pointer-events-none" style={{ contain: 'layout paint' }}>
      <Canvas
        className="!fixed inset-0"
        style={{ pointerEvents: 'none' }}
        dpr={dpr}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
        camera={{ position: [0, 0, 6], fov: 42 }}
        frameloop={active ? 'always' : 'never'}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
      >
        <SceneContents mobile={mobile} setDpr={setDpr} maxDpr={maxDpr} />
      </Canvas>
    </div>
  )
}
