import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useIsMobile } from '../hooks'

/* -------------------------------------------------------------------------
   Shared, render-free state (no React re-renders per frame)
   - pointer: normalized mouse (-1..1), fed from a window listener so the
     canvas can stay pointer-events:none and never block clicks.
   - scroll:  live scroll metrics, read straight from the DOM each frame.
--------------------------------------------------------------------------- */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
const scroll = { y: 0, vh: 1, journey: 0, hero: 0 }

function readScroll() {
  scroll.y = window.scrollY || window.pageYOffset || 0
  scroll.vh = window.innerHeight || 1
  scroll.journey = scroll.y / scroll.vh // 0 at top, 1 after one viewport…
  scroll.hero = Math.min(1, scroll.journey)
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/* ---------- the real 3D cookie (textured disc with a baked rim) ---------- */
function Cookie({ mobile }) {
  const group = useRef()
  const tex = useTexture('./assets/img/hero-cookie.webp')

  // caps: zoom the UVs slightly so the disc samples only the solid cookie
  // interior (avoids transparent-corner holes at the rim).
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
    t.repeat.set(-0.74, 0.74) // mirror so the "underside" isn't an exact copy
    t.offset.set(1, 0)
    t.needsUpdate = true
    return t
  }, [capTex])

  // baked rim gradient => reads as a rounded, front-lit cookie edge
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
    new THREE.MeshBasicMaterial({ map: rimTex, transparent: true, toneMapped: false }),        // side
    new THREE.MeshBasicMaterial({ map: capTex, transparent: true, toneMapped: false }),         // top (front)
    new THREE.MeshBasicMaterial({ map: backTex, transparent: true, toneMapped: false, color: '#d9c3a1' }), // bottom (back)
  ]), [rimTex, capTex, backTex])

  // spring-integrated rotation state (for inertia / momentum)
  const rot = useRef({ yaw: 0, yawV: 0, pitch: 0.06, pitchV: 0 })
  const MAX_YAW = mobile ? 0.6 : 1.65   // ~95° on desktop -> reveals side & back
  const MAX_PITCH = mobile ? 0.45 : 1.15

  useFrame((state, dtRaw) => {
    const g = group.current
    if (!g) return
    readScroll()
    const t = state.clock.elapsedTime
    const dt = Math.min(dtRaw, 0.033) // clamp for spring stability
    const j = scroll.journey

    // --- ease pointer, then drive rotation with a damped spring (inertia) ---
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 6)
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 6)

    const targetYaw = pointer.x * MAX_YAW
    const targetPitch = 0.06 - pointer.y * MAX_PITCH
    const stiffness = 120, damping = 15 // slightly under-damped => gentle momentum
    const r = rot.current
    r.yawV += ((targetYaw - r.yaw) * stiffness - r.yawV * damping) * dt
    r.yaw += r.yawV * dt
    r.pitchV += ((targetPitch - r.pitch) * stiffness - r.pitchV * damping) * dt
    r.pitch += r.pitchV * dt

    // --- compose: interaction + idle life + scroll-driven tumble ---
    const fall = mobile ? 3.0 : 3.4
    g.rotation.y = r.yaw + j * 0.35
    g.rotation.x = r.pitch + Math.sin(t * 0.6) * 0.04 + j * (mobile ? 1.7 : 2.1)
    g.rotation.z = Math.sin(t * 0.35) * 0.03 + j * 0.6

    // --- position: idle float in hero, then travel down & drift aside ---
    const baseY = mobile ? -1.3 : 0
    g.position.y = baseY + Math.sin(t * 0.7) * 0.08 - j * fall
    g.position.x = (mobile ? 0 : 0.0) + j * (mobile ? 0.5 : 1.5)
    g.position.z = -j * 0.6 // recede slightly for depth

    // --- scale shrinks a touch as it travels ---
    const base = mobile ? 1.75 : 2.75
    g.scale.setScalar(base * (1 - clamp01(j) * 0.26))

    // --- opacity: full through hero, fade out as it leaves ---
    const op = clamp01(1 - (j - 0.7) / 1.7)
    materials[0].opacity = op
    materials[1].opacity = op
    materials[2].opacity = op
  })

  return (
    <group ref={group}>
      {/* cylinder groups => [side, top, bottom]; base x=PI/2 faces caps to camera */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
        <cylinderGeometry args={[0.5, 0.5, 0.14, 72, 1, false]} />
      </mesh>
    </group>
  )
}

/* ---------- volumetric glow (hero only) ---------- */
function Glow() {
  const tex = useTexture('./assets/img/glow.webp')
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.material.opacity = Math.max(0, 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.08 - scroll.hero * 0.55)
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
    const op = 0.7 - scroll.hero * 0.7
    pts.material.opacity = op
    if (op <= 0.001) return // fully faded -> skip position work
    const arr = pts.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt
      arr[i * 3] += Math.sin(state.clock.elapsedTime * 0.3 + i) * dt * 0.05
      if (arr[i * 3 + 1] > 4.6) arr[i * 3 + 1] = -4.6
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
    const px = pointer.x * 0.35
    const py = pointer.y * 0.22
    camera.position.x += (px - camera.position.x) * Math.min(1, dt * 2)
    camera.position.y += (py - camera.position.y) * Math.min(1, dt * 2)
    camera.lookAt(0, 0, 0)
  })
  return null
}

function SceneContents({ mobile }) {
  const [dpr, setDpr] = useState(mobile ? 1.3 : 1.75)
  return (
    <>
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.35))}
        onIncline={() => setDpr((d) => Math.min(mobile ? 1.4 : 2, d + 0.2))}
      />
      <AdaptiveDpr pixelated={false} />
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
  const wrapRef = useRef(null)

  // webgl support
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

  // only render while the cookie is still within its journey (top ~2.6 vh),
  // and add a gentle depth-of-field blur as it recedes into the page.
  useEffect(() => {
    let ticking = false
    const apply = () => {
      ticking = false
      const vh = window.innerHeight || 1
      const j = (window.scrollY || 0) / vh
      const shouldRender = j < 2.65
      setActive((prev) => (prev !== shouldRender ? shouldRender : prev))
      if (wrapRef.current) {
        const blur = j > 1 ? Math.min(6, (j - 1) * 4) : 0
        wrapRef.current.style.filter = blur ? `blur(${blur.toFixed(2)}px)` : 'none'
      }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    apply()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  // graceful fallback: static cookie pinned to the hero
  if (failed) {
    return (
      <div className="fixed inset-0 z-[3] pointer-events-none flex items-start justify-center">
        <img src="./assets/img/hero-cookie.webp" alt="Noir & Crumb signature cookie"
          className="w-[70vw] max-w-[520px] mt-[18vh]" style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))' }} />
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[3] pointer-events-none will-change-[filter]">
      <Canvas
        className="!fixed inset-0"
        style={{ pointerEvents: 'none' }}
        dpr={mobile ? [1, 1.4] : [1, 1.9]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
        camera={{ position: [0, 0, 6], fov: 42 }}
        frameloop={active ? 'always' : 'never'}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
      >
        <SceneContents mobile={mobile} />
      </Canvas>
    </div>
  )
}
