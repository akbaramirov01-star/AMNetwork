import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/* ════════════════════════════════════════════════
   3D ROTATING GOLD MEDALLION (Zakat centerpiece)
   Pure CSS 3D — front + back faces + edge thickness
════════════════════════════════════════════════ */
export function Coin3D({ size = 260, speed = 14 }) {
  const layers = 16 // edge thickness slices
  return (
    <div style={{ perspective: 1400, width: size, height: size }}>
      <motion.div
        style={{
          width: size, height: size, position: 'relative',
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: 360, rotateX: [0, 8, 0, -8, 0] }}
        transition={{
          rotateY: { duration: speed, repeat: Infinity, ease: 'linear' },
          rotateX: { duration: speed * 1.6, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* Edge thickness slices */}
        {Array.from({ length: layers }).map((_, i) => {
          const z = (i - layers / 2) * 1.4
          return (
            <div key={i} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              transform: `translateZ(${z}px)`,
              background: i % 2 === 0
                ? 'radial-gradient(circle at 50% 40%, #8a6e1e, #5c4612)'
                : 'radial-gradient(circle at 50% 40%, #b8952a, #7c5f1c)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,.5)',
            }}/>
          )
        })}

        {/* FRONT face */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          transform: `translateZ(${(layers / 2) * 1.4}px)`,
          background: 'radial-gradient(circle at 38% 32%, #f5e070 0%, #e8c547 22%, #b8952a 55%, #8a6e1e 100%)',
          boxShadow: '0 0 60px rgba(232,197,71,.5), inset 0 0 40px rgba(140,95,28,.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <StarEngraving />
          {/* moving glare */}
          <motion.div style={{
            position: 'absolute', top: '-40%', left: '-40%', width: '60%', height: '180%',
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,.55), transparent)',
            filter: 'blur(6px)',
          }}
            animate={{ left: ['-40%', '120%'] }}
            transition={{ duration: speed / 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
          />
        </div>

        {/* BACK face */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          transform: `translateZ(${-(layers / 2) * 1.4}px) rotateY(180deg)`,
          background: 'radial-gradient(circle at 38% 32%, #d8b94a 0%, #b8952a 45%, #6e531a 100%)',
          boxShadow: 'inset 0 0 40px rgba(110,83,26,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: size * 0.26, fontWeight: 900, color: '#5c4612',
            letterSpacing: -2, textShadow: '0 1px 0 rgba(255,255,255,.25)',
          }}>AM</span>
        </div>
      </motion.div>
    </div>
  )
}

/* 8-pointed Islamic star engraving on coin face */
function StarEngraving() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '72%', height: '72%', filter: 'drop-shadow(0 1px 1px rgba(255,255,255,.3))' }}>
      <g fill="none" stroke="#7c5f1c" strokeWidth="2.2" opacity="0.85">
        {/* Rub el Hizb — two overlapping squares */}
        <rect x="24" y="24" width="52" height="52" />
        <rect x="24" y="24" width="52" height="52" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="11" />
      </g>
      <g fill="none" stroke="#fff4cf" strokeWidth="0.8" opacity="0.5">
        <rect x="24" y="24" width="52" height="52" />
        <rect x="24" y="24" width="52" height="52" transform="rotate(45 50 50)" />
      </g>
    </svg>
  )
}

/* ════════════════════════════════════════════════
   MORPHING GRADIENT BACKGROUND (per-scene environments)
════════════════════════════════════════════════ */
const ENVIRONMENTS = [
  { a: '#0e2014', b: '#1a3322', c: '#060a08' },  // 0 cover  — deep emerald
  { a: '#1a1410', b: '#2a2012', c: '#080604' },  // 1 opportunity — warm dark
  { a: '#1e1010', b: '#2a1414', c: '#080404' },  // 2 problem — cold red-black
  { a: '#101a20', b: '#16283a', c: '#060a0e' },  // 3 who — blue dusk
  { a: '#1a1208', b: '#2e2210', c: '#080603' },  // 4 stakes — amber
  { a: '#0e2014', b: '#1a3322', c: '#060a08' },  // 5 shield — emerald
  { a: '#101822', b: '#16304a', c: '#060a10' },  // 6 solution — tech blue
  { a: '#1a1608', b: '#2e2812', c: '#080703' },  // 7 market — gold
  { a: '#101a16', b: '#163a2a', c: '#060a08' },  // 8 business — green
  { a: '#161608', b: '#2a2a12', c: '#070703' },  // 9 traction — bright gold
  { a: '#101422', b: '#1a2444', c: '#06080e' },  // 10 roadmap — indigo
  { a: '#14140e', b: '#28281a', c: '#070703' },  // 11 team — neutral gold
  { a: '#1a1408', b: '#33260e', c: '#080603' },  // 12 ask — rich gold
  { a: '#0e2014', b: '#1a3322', c: '#060a08' },  // 13 closing — emerald
]

export function Background3D({ scene }) {
  const env = ENVIRONMENTS[scene] || ENVIRONMENTS[0]

  // mouse parallax
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 40, damping: 20 })
  const sy = useSpring(my, { stiffness: 40, damping: 20 })
  const o1x = useTransform(sx, v => v * 30)
  const o1y = useTransform(sy, v => v * 30)
  const o2x = useTransform(sx, v => v * -45)
  const o2y = useTransform(sy, v => v * -45)
  const o3x = useTransform(sx, v => v * 22)
  const o3y = useTransform(sy, v => v * 22)

  useEffect(() => {
    const h = e => {
      mx.set((e.clientX / innerWidth) - 0.5)
      my.set((e.clientY / innerHeight) - 0.5)
    }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [mx, my])

  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}
      animate={{ background: `radial-gradient(ellipse 130% 90% at 50% 30%, ${env.a} 0%, ${env.c} 75%)` }}
      transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Drifting gradient orbs */}
      <motion.div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        x: o1x, y: o1y, top: '-15%', left: '-10%', filter: 'blur(80px)',
      }}
        animate={{ background: `radial-gradient(circle, ${env.b}cc, transparent 70%)` }}
        transition={{ duration: 1.1 }}
      />
      <motion.div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        x: o2x, y: o2y, bottom: '-20%', right: '-12%', filter: 'blur(90px)',
      }}
        animate={{ background: `radial-gradient(circle, ${env.a}dd, transparent 70%)` }}
        transition={{ duration: 1.1 }}
      />
      <motion.div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        x: o3x, y: o3y, top: '35%', right: '20%', filter: 'blur(70px)',
      }}
        animate={{
          background: `radial-gradient(circle, ${env.b}aa, transparent 70%)`,
          scale: [1, 1.15, 1],
        }}
        transition={{ background: { duration: 1.1 }, scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
      />
      {/* subtle grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}/>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════
   PER-SCENE ATMOSPHERIC PARTICLES (canvas)
   mode: 'dust' | 'coins' | 'rain' | 'snow'
════════════════════════════════════════════════ */
const SCENE_PARTICLE_MODE = [
  'dust',  // 0 cover
  'dust',  // 1
  'rain',  // 2 problem — cold rain
  'snow',  // 3 who — gentle
  'dust',  // 4
  'dust',  // 5 shield
  'coins', // 6 solution — coins flow
  'dust',  // 7 market
  'coins', // 8 business
  'coins', // 9 traction
  'dust',  // 10 roadmap
  'dust',  // 11 team
  'coins', // 12 ask
  'dust',  // 13 closing
]

export function AtmosphereParticles({ scene }) {
  const ref = useRef(null)
  const modeRef = useRef('dust')
  modeRef.current = SCENE_PARTICLE_MODE[scene] || 'dust'

  useEffect(() => {
    const cvs = ref.current
    const ctx = cvs.getContext('2d')
    let W, H, raf
    const resize = () => { W = cvs.width = innerWidth; H = cvs.height = innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const R = (a, b) => a + Math.random() * (b - a)

    const N = 70
    const parts = Array.from({ length: N }).map(() => ({
      x: R(0, 1400), y: R(0, 900), r: R(1, 3),
      vx: R(-.2, .2), vy: R(-.5, -.1), a: R(.1, .5),
      spin: R(0, Math.PI * 2), vspin: R(-.05, .05),
      col: Math.random() > .5 ? '184,149,42' : '60,180,106',
    }))

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      const mode = modeRef.current
      parts.forEach(p => {
        if (mode === 'rain') {
          p.vy = 9; p.vx = -1.2; p.r = 1
          p.x += p.vx; p.y += p.vy
          if (p.y > H + 10) { p.y = -10; p.x = R(0, W + 200) }
          ctx.strokeStyle = `rgba(140,160,200,${p.a * .5})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 2, p.y + 12); ctx.stroke()
        } else if (mode === 'snow') {
          p.vy = 1.1; p.x += Math.sin(p.y / 40) * .6
          p.y += p.vy
          if (p.y > H + 10) { p.y = -10; p.x = R(0, W) }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220,230,240,${p.a * .7})`; ctx.fill()
        } else if (mode === 'coins') {
          p.vy = 2.4; p.spin += p.vspin
          p.y += p.vy; p.x += Math.sin(p.y / 60) * .5
          if (p.y > H + 14) { p.y = -14; p.x = R(0, W) }
          const w = Math.abs(Math.cos(p.spin)) * 7 + 1
          ctx.save(); ctx.translate(p.x, p.y)
          ctx.fillStyle = `rgba(232,197,71,${p.a})`
          ctx.beginPath(); ctx.ellipse(0, 0, w, 7, 0, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        } else { // dust — rising
          p.x += p.vx; p.y += p.vy
          if (p.y < -8) { p.y = H + 8; p.x = R(0, W) }
          if (p.x < -8) p.x = W + 8; if (p.x > W + 8) p.x = -8
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.col},${p.a})`; ctx.fill()
        }
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}

/* ════════════════════════════════════════════════
   SVG ICON SET (replaces emoji per ui-ux-pro-max)
════════════════════════════════════════════════ */
const I = (paths, vb = '0 0 24 24') => ({ stroke = '#B8952A', size = 24 }) => (
  <svg viewBox={vb} width={size} height={size} fill="none" stroke={stroke}
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
)

export const Icons = {
  eyeOff: I(<><path d="M9.9 4.24A9.1 9.1 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22M6.61 6.61A18.5 18.5 0 002 12s3 8 10 8a9.1 9.1 0 005.39-1.61"/></>),
  lock: I(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>),
  globe: I(<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20"/></>),
  shield: I(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  cpu: I(<><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/><rect x="9" y="9" width="6" height="6" rx="1"/></>),
  hexagon: I(<path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/>),
  pin: I(<><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>),
  sprout: I(<><path d="M12 22V11M12 11C12 7 9 4 4 4c0 5 3 7 8 7zM12 11c0-3 3-6 8-6 0 4-3 6-8 6z"/></>),
  home: I(<><path d="M3 11l9-8 9 8M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>),
  heartPulse: I(<><path d="M19 14c1.5-1.5 3-3.2 3-5.5A4.5 4.5 0 0012 6 4.5 4.5 0 002 8.5c0 2.3 1.5 4 3 5.5l7 7z"/><path d="M3.5 11h4l1.5-3 2 5 1.5-2h4"/></>),
  scroll: I(<><path d="M8 3H6a2 2 0 00-2 2v13a3 3 0 003 3h11a2 2 0 002-2v-1H8"/><path d="M16 3a2 2 0 012 2v12M8 7h6M8 11h6"/></>),
  bank: I(<><path d="M3 21h18M4 10h16M5 10l7-6 7 6M6 10v8M10 10v8M14 10v8M18 10v8"/></>),
  rocket: I(<><path d="M5 13c-1.5 1-2 5-2 5s4-.5 5-2M12 15l-3-3a18 18 0 014-8 7 7 0 016 0 18 18 0 01-8 4l3 3"/><circle cx="14" cy="9" r="1.2"/></>),
  target: I(<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></>),
  monitor: I(<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>),
  calendar: I(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></>),
  user: I(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>),
  users: I(<><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 5a3.5 3.5 0 010 6.5M22 21c0-3-2-4.8-5-5.3"/></>),
  book: I(<><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M19 17H6a2 2 0 00-2 2"/></>),
  check: I(<path d="M20 6L9 17l-5-5"/>),
}
