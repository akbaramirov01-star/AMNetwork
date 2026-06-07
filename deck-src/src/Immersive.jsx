import { motion } from 'framer-motion'

/* ════════════════════════════════════════════════
   CLEAN PROFESSIONAL BACKGROUND
   Gamma/Canva-style: calm, static, tasteful.
   One soft brand glow + faint grid. No movement noise.
════════════════════════════════════════════════ */
const SCENE_TINT = [
  '#13301e', // 0 cover
  '#13301e', // 1
  '#241218', // 2 problem (subtle warm)
  '#122433', // 3 who
  '#241c10', // 4 stakes
  '#13301e', // 5 sharia
  '#11222e', // 6 solution
  '#241c10', // 7 market
  '#12281c', // 8 business
  '#1f1c0e', // 9 traction
  '#141a2e', // 10 roadmap
  '#1a1a14', // 11 team
  '#241c10', // 12 ask
  '#13301e', // 13 closing
]

export function ProBackground({ scene }) {
  const tint = SCENE_TINT[scene] || SCENE_TINT[0]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#070b09' }}>
      {/* soft top glow, tinted per scene — slow, calm crossfade */}
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        animate={{ background: `radial-gradient(ellipse 120% 80% at 50% -10%, ${tint} 0%, #070b09 60%)` }}
        transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      />
      {/* Islamic geometric star pattern — cover slide only */}
      {scene === 0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2,delay:0.3}}
          style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{opacity:0.45}}>
            <defs>
              <pattern id="islamicDeckStar" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40,7 L44,29 L63,20 L51,36 L70,44 L48,45 L52,66 L39,53 L26,66 L30,45 L8,44 L27,36 L15,20 L34,29 Z"
                  fill="none" stroke="rgba(184,149,42,0.09)" strokeWidth="0.8"/>
                <circle cx="40" cy="40" r="4.5" fill="none" stroke="rgba(184,149,42,0.04)" strokeWidth="0.5"/>
                <circle cx="0" cy="0" r="1.5" fill="rgba(184,149,42,0.04)"/>
                <circle cx="80" cy="0" r="1.5" fill="rgba(184,149,42,0.04)"/>
                <circle cx="0" cy="80" r="1.5" fill="rgba(184,149,42,0.04)"/>
                <circle cx="80" cy="80" r="1.5" fill="rgba(184,149,42,0.04)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamicDeckStar)"/>
          </svg>
        </motion.div>
      )}
      {/* faint static grid for depth */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.035,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, #000 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, #000 30%, transparent 80%)',
      }} />
      {/* bottom vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(7,11,9,.9), transparent 35%)',
      }} />
    </div>
  )
}

/* ════════════════════════════════════════════════
   SVG ICON SET (clean, consistent — Lucide-style)
════════════════════════════════════════════════ */
const I = (paths, vb = '0 0 24 24') => ({ stroke = '#B8952A', size = 24 }) => (
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
