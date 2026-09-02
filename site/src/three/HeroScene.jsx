import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/smooth'
import { useIsMobile, useReducedMotion } from '../hooks'

/* ---------- floating cookie ---------- */
function Cookie({ mobile }) {
  const group = useRef()
  const mesh = useRef()
  const tex = useTexture('./assets/img/hero-cookie.webp')
  useMemo(() => {
    tex.anisotropy = 8
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.generateMipmaps = true
  }, [tex])

  const target = useRef({ rx: 0, ry: 0 })
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const p = state.pointer
    // pointer-driven tilt (eased)
    target.current.ry = p.x * 0.32
    target.current.rx = -p.y * 0.24
    const g = group.current
    if (!g) return
    const hp = scrollState.heroProgress // 0..1 across first viewport
    g.rotation.y += (target.current.ry - g.rotation.y) * Math.min(1, dt * 3)
    g.rotation.x += (target.current.rx + 0.06 - g.rotation.x) * Math.min(1, dt * 3)
    // idle float
    const baseY = mobile ? -1.35 : 0
    g.position.y = baseY + Math.sin(t * 0.7) * 0.08 - hp * 2.4
    g.rotation.z = Math.sin(t * 0.35) * 0.03 - hp * 0.5
    const s = (1 - hp * 0.25)
    g.scale.setScalar(s * (mobile ? 2.0 : 3.15))
    g.position.x = mobile ? 0 : hp * 1.2
  })

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ---------- volumetric glow behind cookie ---------- */
function Glow() {
  const tex = useTexture('./assets/img/glow.webp')
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) ref.current.material.opacity = 0.5 + Math.sin(t * 0.8) * 0.08 - scrollState.heroProgress * 0.5
  })
  return (
    <mesh ref={ref} position={[0, 0, -1.4]} scale={9}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.5} toneMapped={false} />
    </mesh>
  )
}

/* ---------- drifting cocoa particles ---------- */
function Particles({ count = 140 }) {
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
    const arr = pts.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt
      arr[i * 3] += Math.sin(state.clock.elapsedTime * 0.3 + i) * dt * 0.05
      if (arr[i * 3 + 1] > 4.6) arr[i * 3 + 1] = -4.6
    }
    pts.geometry.attributes.position.needsUpdate = true
    pts.rotation.y = state.pointer.x * 0.15
    pts.material.opacity = 0.7 - scrollState.heroProgress * 0.7
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={tex} size={0.14} transparent opacity={0.7} depthWrite={false}
        blending={THREE.AdditiveBlending} sizeAttenuation color={'#e6be78'}
      />
    </points>
  )
}

function Rig() {
  const { camera } = useThree()
  useFrame((state, dt) => {
    const px = state.pointer.x * 0.4
    const py = state.pointer.y * 0.25
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
        {!mobile && <Particles count={130} />}
        {mobile && <Particles count={46} />}
      </Suspense>
      <Rig />
    </>
  )
}

export default function HeroScene() {
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(true)
  const wrapRef = useRef(null)

  useEffect(() => {
    // detect webgl
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2') || c.getContext('webgl')
      if (!gl) setFailed(true)
    } catch { setFailed(true) }
  }, [])

  // pause the render loop whenever the hero scrolls out of view
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (failed || reduced) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="./assets/img/hero-cookie.webp" alt="Noir & Crumb signature cookie"
          className="w-[78vw] max-w-[560px] drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))' }}
        />
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        className="!absolute inset-0"
        dpr={mobile ? [1, 1.4] : [1, 1.9]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
        camera={{ position: [0, 0, 6], fov: 42 }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
      >
        <SceneContents mobile={mobile} />
      </Canvas>
    </div>
  )
}
