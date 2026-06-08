import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

/* ════════════════════════════════════════════════
   CONSTELLATION PARTICLE NETWORK
   Canvas: 80 particles + connecting lines within 150px
════════════════════════════════════════════════ */
export function ConstellationBg() {
  const ref = useRef(null)
  useEffect(() => {
    const cvs = ref.current, ctx = cvs.getContext('2d')
    let W, H, pts = [], raf
    const resize = () => { W = cvs.width = innerWidth; H = cvs.height = innerHeight }
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 88; i++) pts.push({
      x: Math.random() * 1600, y: Math.random() * 900,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .15,
      r: .5 + Math.random() * 1.4,
      a: .15 + Math.random() * .55,
      col: Math.random() > .45 ? '201,168,76' : (Math.random() > .5 ? '13,200,120' : '80,160,240')
    })
    const MAX = 155
    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20
      })
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX) {
            const a = (1 - d / MAX) * .09
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(201,168,76,${a})`
            ctx.lineWidth = .5; ctx.stroke()
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.col},${p.a})`; ctx.fill()
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}

/* ════════════════════════════════════════════════
   HOLOGRAPHIC ISLAMIC STAR — cover slide only
   Slowly rotating 8-pointed star with layered glow
════════════════════════════════════════════════ */
export function HolographicStar() {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 520, height: 520, pointerEvents: 'none', zIndex: 2 }}>
      {/* outer bloom */}
      <div style={{ position: 'absolute', inset: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,.18) 0%, rgba(201,168,76,.06) 40%, transparent 70%)', filter: 'blur(30px)' }} />
      {/* mid glow */}
      <div style={{ position: 'absolute', inset: 40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,.22) 0%, transparent 65%)', filter: 'blur(18px)' }} />
      {/* outer dashed orbit — counter-rotating */}
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: -50 }}>
        <svg viewBox="0 0 620 620" width="620" height="620" style={{ opacity: .22 }}>
          <circle cx="310" cy="310" r="300" fill="none" stroke="rgba(201,168,76,.6)" strokeWidth=".6" strokeDasharray="5 10" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i * 22.5) * Math.PI / 180
            return <circle key={i} cx={310 + 300 * Math.cos(a)} cy={310 + 300 * Math.sin(a)} r="2.2" fill="rgba(201,168,76,.7)" />
          })}
        </svg>
      </motion.div>
      {/* inner orbit */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 60 }}>
        <svg viewBox="0 0 400 400" width="400" height="400" style={{ opacity: .3 }}>
          <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(201,168,76,.4)" strokeWidth=".5" strokeDasharray="3 14" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45) * Math.PI / 180
            return <circle key={i} cx={200 + 190 * Math.cos(a)} cy={200 + 190 * Math.sin(a)} r="2.5" fill="rgba(245,224,112,.9)" />
          })}
        </svg>
      </motion.div>
      {/* main 8-pointed Islamic star — slow rotation */}
      <motion.div
        initial={{ opacity: 0, scale: .7 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{ opacity: { duration: 1.8 }, scale: { duration: 1.8, ease: [.16, 1, .3, 1] }, rotate: { duration: 120, repeat: Infinity, ease: 'linear' } }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <svg viewBox="0 0 520 520" width="520" height="520">
          <defs>
            <radialGradient id="sg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F5E070" stopOpacity=".95" />
              <stop offset="35%" stopColor="#C9A84C" stopOpacity=".75" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity=".05" />
            </radialGradient>
            <filter id="gl">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="gl2">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* outer 8-pointed star */}
          <path d="M260,50 L274,186 L375,118 L307,225 L440,250 L307,275 L375,382 L274,314 L260,450 L246,314 L145,382 L213,275 L80,250 L213,225 L145,118 L246,186 Z"
            fill="none" stroke="url(#sg)" strokeWidth="1.6" filter="url(#gl)" opacity=".85" />
          {/* inner star */}
          <path d="M260,120 L270,200 L340,165 L305,235 L385,250 L305,265 L340,335 L270,300 L260,380 L250,300 L180,335 L215,265 L135,250 L215,235 L180,165 L250,200 Z"
            fill="none" stroke="rgba(201,168,76,.35)" strokeWidth="1" opacity=".5" />
          {/* rings */}
          <circle cx="260" cy="250" r="95" fill="none" stroke="rgba(201,168,76,.25)" strokeWidth=".8" />
          <circle cx="260" cy="250" r="62" fill="none" stroke="rgba(201,168,76,.4)" strokeWidth=".8" />
          <circle cx="260" cy="250" r="28" fill="none" stroke="rgba(201,168,76,.5)" strokeWidth=".8" />
          {/* center glow */}
          <circle cx="260" cy="250" r="14" fill="rgba(201,168,76,.7)" filter="url(#gl2)" />
          <circle cx="260" cy="250" r="6" fill="#F5E070" filter="url(#gl)" />
          {/* 8 outer node dots */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 - 22.5) * Math.PI / 180
            return <circle key={i} cx={260 + 175 * Math.cos(a)} cy={250 + 175 * Math.sin(a)} r="4" fill="#F5E070" filter="url(#gl)" />
          })}
        </svg>
      </motion.div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   DEEP SPACE BACKGROUND — scene-tinted nebula
════════════════════════════════════════════════ */
const SCENE_COLOR = [
  ['rgba(201,168,76,.22)', 'rgba(13,138,80,.08)'],   // 0 cover
  ['rgba(201,168,76,.14)', 'rgba(13,138,80,.06)'],   // 1 opportunity
  ['rgba(180,50,50,.16)', 'rgba(100,20,20,.08)'],    // 2 problem
  ['rgba(30,90,180,.15)', 'rgba(20,60,140,.07)'],    // 3 who
  ['rgba(180,90,20,.16)', 'rgba(120,50,10,.08)'],    // 4 stakes
  ['rgba(13,138,80,.18)', 'rgba(201,168,76,.06)'],   // 5 sharia
  ['rgba(30,100,200,.16)', 'rgba(13,138,80,.06)'],   // 6 solution
  ['rgba(180,100,20,.14)', 'rgba(201,168,76,.06)'],  // 7 market
  ['rgba(13,138,80,.14)', 'rgba(201,168,76,.06)'],   // 8 business
  ['rgba(201,168,76,.16)', 'rgba(13,138,80,.06)'],   // 9 traction
  ['rgba(30,80,200,.16)', 'rgba(13,138,80,.06)'],    // 10 roadmap
  ['rgba(80,30,160,.16)', 'rgba(30,60,160,.06)'],    // 11 team
  ['rgba(201,168,76,.18)', 'rgba(13,138,80,.07)'],   // 12 ask
  ['rgba(13,138,80,.18)', 'rgba(201,168,76,.08)'],   // 13 closing
]

export function ProBackground({ scene }) {
  const [c1, c2] = SCENE_COLOR[scene] || SCENE_COLOR[0]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#020810' }}>
      {/* scene nebula — slow crossfade */}
      <motion.div key={scene} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1 }}
        style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 110% 80% at 50% -5%, ${c1} 0%, transparent 65%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 70% at 15% 85%, ${c2} 0%, transparent 60%)` }} />
      </motion.div>
      {/* Islamic geometric tiling — cover only */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.2, delay: .4 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ opacity: .25 }}>
            <defs>
              <pattern id="islamicDeck" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50,9 L55,36 L79,25 L64,45 L88,55 L61,57 L65,82 L49,66 L33,82 L37,57 L10,55 L34,45 L19,25 L43,36 Z"
                  fill="none" stroke="rgba(201,168,76,.13)" strokeWidth=".8" />
                <circle cx="50" cy="50" r="5.5" fill="none" stroke="rgba(201,168,76,.07)" strokeWidth=".6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamicDeck)" />
          </svg>
        </motion.div>
      )}
      {/* subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .025,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%,#000 30%,transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%,#000 30%,transparent 80%)',
      }} />
      {/* bottom vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(2,8,16,.92),transparent 38%)' }} />
    </div>
  )
}

/* ════════════════════════════════════════════════
   SVG ICON SET (clean, consistent — Lucide-style)
════════════════════════════════════════════════ */
const I = (paths, vb = '0 0 24 24') => ({ stroke = '#C9A84C', size = 24 }) => (
  <svg viewBox={vb} width={size} height={size} fill="none" stroke={stroke}
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
)

export const Icons = {
  eyeOff: I(<><path d="M9.9 4.24A9.1 9.1 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22M6.61 6.61A18.5 18.5 0 002 12s3 8 10 8a9.1 9.1 0 005.39-1.61"/></>),
  lock: I(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>),
  globe: I(<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20"/></>),
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
