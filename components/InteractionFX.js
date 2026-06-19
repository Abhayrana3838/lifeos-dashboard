'use client'
import { useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTION FX ENGINE
   ─ Listens to custom window events and renders cinematic canvas effects
   
   Events dispatched from page.js:
     fx:taskComplete  { x, y }             → Supernova burst + shockwave
     fx:habitToggle   { x, y, name }        → Energy pulse + arc
     fx:xpGain        { x, y, amount }      → Gold XP counter float
     fx:levelUp       { level }             → Screen lightning + crown
     fx:questCreate   { x, y }             → Particle materialization
     fx:studyLog      { x, y, hours }       → Knowledge spark shower

   Each effect is self-contained and GPU-friendly via Canvas 2D.
════════════════════════════════════════════════════════════════════════ */

/* ── Particle class ──────────────────────────────────────────────── */
class Particle {
  constructor({ x, y, vx, vy, color, size, life, gravity = 0, drag = 0.985, glow = false, type = 'spark' }) {
    this.x = x; this.y = y
    this.vx = vx; this.vy = vy
    this.color = color; this.size = size
    this.life = 1; this.maxLife = life
    this.ttl = life
    this.gravity = gravity; this.drag = drag
    this.glow = glow; this.type = type
    this.rotation = Math.random() * Math.PI * 2
    this.rotSpeed = (Math.random() - 0.5) * 0.25
  }
  update(dt) {
    this.x  += this.vx * dt * 60
    this.y  += this.vy * dt * 60
    this.vy += this.gravity * dt * 60
    this.vx *= this.drag
    this.vy *= this.drag
    this.ttl -= dt
    this.life = Math.max(0, this.ttl / this.maxLife)
    this.rotation += this.rotSpeed
    return this.life > 0
  }
  draw(ctx) {
    const a = this.type === 'trail' ? this.life * 0.5 : this.life
    const sz = this.size * (this.type === 'spark' ? this.life + 0.2 : 1)

    ctx.save()
    ctx.globalAlpha = a
    ctx.translate(this.x, this.y)

    if (this.glow) {
      ctx.shadowBlur  = sz * 8
      ctx.shadowColor = this.color
    }

    if (this.type === 'diamond') {
      ctx.rotate(this.rotation)
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.moveTo(0, -sz); ctx.lineTo(sz*0.6, 0)
      ctx.lineTo(0, sz);  ctx.lineTo(-sz*0.6, 0)
      ctx.closePath(); ctx.fill()
    } else if (this.type === 'star') {
      ctx.rotate(this.rotation)
      ctx.fillStyle = this.color
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
        const x = Math.cos(angle) * sz, y = Math.sin(angle) * sz
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        const ia = angle + Math.PI / 5
        ctx.lineTo(Math.cos(ia) * sz * 0.4, Math.sin(ia) * sz * 0.4)
      }
      ctx.closePath(); ctx.fill()
    } else {
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(0, 0, Math.max(0.5, sz), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

/* ── Ripple ring ─────────────────────────────────────────────────── */
class Ripple {
  constructor({ x, y, color, maxR = 250, speed = 1.8, lineWidth = 2 }) {
    this.x = x; this.y = y; this.color = color
    this.r = 0; this.maxR = maxR; this.speed = speed
    this.lineWidth = lineWidth; this.life = 1
  }
  update(dt) {
    this.r    += this.speed * dt * 60
    this.life  = Math.max(0, 1 - this.r / this.maxR)
    return this.life > 0
  }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life * this.life
    ctx.strokeStyle = this.color
    ctx.lineWidth   = this.lineWidth * this.life + 0.5
    ctx.shadowBlur  = 20 * this.life
    ctx.shadowColor = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

/* ── Floating text ───────────────────────────────────────────────── */
class FloatText {
  constructor({ x, y, text, color, size = 26, life = 1.8, vy = -1.2 }) {
    this.x = x; this.y = y; this.text = text; this.color = color
    this.size = size; this.ttl = life; this.maxLife = life
    this.life = 1; this.vy = vy
  }
  update(dt) {
    this.y    += this.vy * dt * 60
    this.ttl  -= dt
    this.life  = Math.max(0, this.ttl / this.maxLife)
    return this.life > 0
  }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha  = this.life * this.life
    ctx.font         = `900 ${this.size}px 'Outfit', sans-serif`
    ctx.textAlign    = 'center'
    ctx.fillStyle    = this.color
    ctx.shadowBlur   = 20
    ctx.shadowColor  = this.color
    ctx.fillText(this.text, this.x, this.y)
    ctx.restore()
  }
}

/* ── Lightning bolt ──────────────────────────────────────────────── */
class Lightning {
  constructor({ x1, y1, x2, y2, color = '#a855f7', life = 0.35, branches = 4 }) {
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2
    this.color = color; this.ttl = life; this.maxLife = life
    this.life = 1; this.branches = branches
    this.segments = this._build(x1, y1, x2, y2, branches)
  }
  _build(x1, y1, x2, y2, depth) {
    if (depth <= 0) return [{ x1, y1, x2, y2, main: true }]
    const mx = (x1+x2)/2 + (Math.random()-0.5)*(Math.abs(y2-y1)*0.7+40)
    const my = (y1+y2)/2 + (Math.random()-0.5)*(Math.abs(x2-x1)*0.7+40)
    const segs = [
      ...this._build(x1, y1, mx, my, depth-1),
      ...this._build(mx, my, x2, y2, depth-1),
    ]
    if (Math.random() < 0.5) {
      const bx = mx + (Math.random()-0.5)*120
      const by = my + (Math.random()-0.5)*120
      segs.push(...this._build(mx, my, bx, by, depth-2))
    }
    return segs
  }
  update(dt) { this.ttl -= dt; this.life = Math.max(0, this.ttl / this.maxLife); return this.life > 0 }
  draw(ctx) {
    const flicker = Math.random() > 0.3 ? 1 : 0.3
    this.segments.forEach(s => {
      ctx.save()
      ctx.globalAlpha = this.life * this.life * flicker
      ctx.strokeStyle = this.color
      ctx.lineWidth   = s.main ? 2.5 : 1.2
      ctx.shadowBlur  = 18
      ctx.shadowColor = this.color
      ctx.beginPath()
      ctx.moveTo(s.x1, s.y1)
      ctx.lineTo(s.x2, s.y2)
      ctx.stroke()
      ctx.restore()
    })
  }
}

/* ── ScreenFlash ─────────────────────────────────────────────────── */
class ScreenFlash {
  constructor({ color = 'rgba(139,92,246,0.25)', life = 0.4 }) {
    this.color = color; this.life = 1; this.ttl = life; this.maxLife = life
  }
  update(dt) { this.ttl -= dt; this.life = Math.max(0, this.ttl / this.maxLife); return this.life > 0 }
  draw(ctx, W, H) {
    ctx.save()
    ctx.globalAlpha = this.life * this.life * 0.7
    ctx.fillStyle   = this.color
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }
}

/* ── Effect factories ────────────────────────────────────────────── */

function explodeSupernova(x, y, particles, ripples, texts) {
  /* 100 gold/cyan particles in all directions */
  const palette = ['#fbbf24','#f59e0b','#22d3ee','#a78bfa','#ffffff','#fde68a']
  for (let i = 0; i < 120; i++) {
    const ang   = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 7
    const color = palette[Math.floor(Math.random() * palette.length)]
    const type  = Math.random() < 0.2 ? 'star' : Math.random() < 0.3 ? 'diamond' : 'spark'
    particles.push(new Particle({
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      color,
      size: 2 + Math.random() * 5,
      life: 0.6 + Math.random() * 0.8,
      gravity: 0.08,
      drag: 0.96,
      glow: true,
      type,
    }))
  }
  /* 25 long trail sparks */
  for (let i = 0; i < 25; i++) {
    const ang = Math.random() * Math.PI * 2
    particles.push(new Particle({
      x, y,
      vx: Math.cos(ang) * (4 + Math.random() * 10),
      vy: Math.sin(ang) * (4 + Math.random() * 10),
      color: Math.random() < 0.5 ? '#22d3ee' : '#8b5cf6',
      size: 1.5 + Math.random() * 2.5,
      life: 1.0 + Math.random() * 0.6,
      gravity: 0.04,
      drag: 0.985,
      glow: true,
      type: 'trail',
    }))
  }

  /* 3 concentric shockwaves */
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      ripples.push(new Ripple({ x, y, color: i === 0 ? '#fbbf24' : i === 1 ? '#22d3ee' : '#8b5cf6', maxR: 300 - i*40, speed: 2.8 - i*0.4, lineWidth: 3 - i*0.5 }))
    }, i * 80)
  }

  /* "QUEST COMPLETE" text */
  texts.push(new FloatText({ x, y: y - 20, text: '✦ QUEST COMPLETE ✦', color: '#fbbf24', size: 22, life: 2.2, vy: -0.8 }))
}

function explodeHabitToggle(x, y, particles, ripples, texts, name) {
  const palette = ['#34d399','#22d3ee','#a78bfa']
  for (let i = 0; i < 45; i++) {
    const ang = Math.random() * Math.PI * 2
    particles.push(new Particle({
      x, y,
      vx: Math.cos(ang) * (1.5 + Math.random() * 4),
      vy: Math.sin(ang) * (1.5 + Math.random() * 4),
      color: palette[i % palette.length],
      size: 2 + Math.random() * 3,
      life: 0.5 + Math.random() * 0.6,
      gravity: 0.05, drag: 0.97, glow: true,
    }))
  }
  ripples.push(new Ripple({ x, y, color: '#34d399', maxR: 160, speed: 2.2, lineWidth: 2 }))
  texts.push(new FloatText({ x, y: y - 10, text: '⚡ +1 STREAK', color: '#34d399', size: 18, life: 1.6 }))
}

function explodeXpGain(x, y, amount, particles, texts) {
  for (let i = 0; i < 20; i++) {
    const ang = -Math.PI/2 + (Math.random()-0.5) * Math.PI
    particles.push(new Particle({
      x: x + (Math.random()-0.5)*20, y,
      vx: Math.cos(ang) * (0.5 + Math.random() * 2.5),
      vy: Math.sin(ang) * (0.5 + Math.random() * 2.5),
      color: '#fbbf24', size: 2 + Math.random() * 3,
      life: 0.8 + Math.random() * 0.5,
      gravity: -0.03, drag: 0.98, glow: true, type: 'star',
    }))
  }
  texts.push(new FloatText({ x, y: y - 5, text: `+${amount} XP`, color: '#fbbf24', size: 20, life: 1.5, vy: -1.0 }))
}

function explodeLevelUp(level, W, H, particles, ripples, texts, lightnings, flashes) {
  /* Full screen flash */
  flashes.push(new ScreenFlash({ color: 'rgba(139,92,246,0.35)', life: 0.5 }))
  flashes.push(new ScreenFlash({ color: 'rgba(34,211,238,0.15)', life: 0.9 }))

  /* Center text */
  const cx = W/2, cy = H/2
  texts.push(new FloatText({ x: cx, y: cy - 20, text: `LEVEL ${level}`, color: '#fbbf24', size: 52, life: 2.8, vy: -0.3 }))
  texts.push(new FloatText({ x: cx, y: cy + 40, text: 'ASCENSION UNLOCKED', color: '#22d3ee', size: 16, life: 2.5, vy: -0.2 }))

  /* Crown particles from top */
  const palette = ['#fbbf24','#f59e0b','#a78bfa','#22d3ee','#fff']
  for (let i = 0; i < 160; i++) {
    const ang   = -Math.PI/2 + (Math.random()-0.5) * Math.PI * 2.2
    const speed = 3 + Math.random() * 12
    particles.push(new Particle({
      x: cx, y: cy,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      color: palette[i % palette.length],
      size: 3 + Math.random() * 6,
      life: 1.0 + Math.random() * 1.2,
      gravity: 0.12, drag: 0.97, glow: true,
      type: Math.random() < 0.25 ? 'star' : Math.random() < 0.25 ? 'diamond' : 'spark',
    }))
  }

  /* Lightning arcs criss-crossing screen */
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      lightnings.push(new Lightning({
        x1: Math.random() * W, y1: Math.random() * H,
        x2: Math.random() * W, y2: Math.random() * H,
        color: Math.random() < 0.5 ? '#a855f7' : '#22d3ee',
        branches: 4, life: 0.5
      }))
    }, i * 80)
  }

  /* Expanding rings */
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      ripples.push(new Ripple({ x: cx, y: cy, color: i%2===0?'#fbbf24':'#a78bfa', maxR: 350+i*40, speed: 3 + i*0.4, lineWidth: 4 - i*0.4 }))
    }, i * 120)
  }
}

function explodeQuestCreate(x, y, particles, ripples, texts) {
  /* Particles converge to the point from outside */
  const palette = ['#8b5cf6','#22d3ee','#a78bfa']
  for (let i = 0; i < 35; i++) {
    const ang = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 100
    particles.push(new Particle({
      x: x + Math.cos(ang)*dist,
      y: y + Math.sin(ang)*dist,
      vx: -Math.cos(ang) * (2 + Math.random()*4),
      vy: -Math.sin(ang) * (2 + Math.random()*4),
      color: palette[i % palette.length],
      size: 2 + Math.random() * 3,
      life: 0.4 + Math.random() * 0.4,
      gravity: 0, drag: 0.95, glow: true,
    }))
  }
  ripples.push(new Ripple({ x, y, color: '#8b5cf6', maxR: 120, speed: 2.0, lineWidth: 2 }))
  texts.push(new FloatText({ x, y: y - 15, text: '⊕ NEW QUEST', color: '#a78bfa', size: 16, life: 1.4 }))
}

function explodeStudyLog(x, y, hours, particles, ripples, texts) {
  const palette = ['#22d3ee','#38bdf8','#a78bfa','#fff']
  for (let i = 0; i < 55; i++) {
    const ang = Math.random() * Math.PI * 2
    particles.push(new Particle({
      x, y,
      vx: Math.cos(ang) * (1 + Math.random() * 5),
      vy: Math.sin(ang) * (1 + Math.random() * 5) - 1,
      color: palette[i % palette.length],
      size: 1.5 + Math.random() * 3.5,
      life: 0.5 + Math.random() * 0.7,
      gravity: -0.02, drag: 0.97, glow: true,
      type: Math.random() < 0.3 ? 'diamond' : 'spark',
    }))
  }
  ripples.push(new Ripple({ x, y, color: '#22d3ee', maxR: 180, speed: 2.5 }))
  texts.push(new FloatText({ x, y: y - 15, text: `📚 +${hours}h POWER GAINED`, color: '#22d3ee', size: 17, life: 1.8 }))
}

/* ── Magic Spell Circle ──────────────────────────────────────────── */
class MagicSpell {
  constructor({ x, y, color, size = 70, life = 1.0 }) {
    this.x = x; this.y = y; this.color = color
    this.size = size; this.maxLife = life; this.ttl = life
    this.rotation = 0; this.life = 1
  }
  update(dt) {
    this.ttl -= dt
    this.life = Math.max(0, this.ttl / this.maxLife)
    this.rotation += dt * 3.5 // Rotate magic circle
    return this.life > 0
  }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life * this.life
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)

    // Glow effect
    ctx.shadowBlur  = 20 * this.life
    ctx.shadowColor = this.color
    ctx.strokeStyle = this.color

    // Outer circle ring
    ctx.lineWidth = 3.5 * this.life
    ctx.beginPath()
    ctx.arc(0, 0, this.size * this.life, 0, Math.PI * 2)
    ctx.stroke()

    // Inner dashed ring
    ctx.lineWidth = 1.5 * this.life
    ctx.setLineDash([6, 8])
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 0.7 * this.life, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Star/Polygon seal pattern
    ctx.lineWidth = 1.0 * this.life
    ctx.beginPath()
    const points = 6
    for (let i = 0; i < points; i++) {
      const angle = (i * Math.PI * 2) / points
      const x1 = Math.cos(angle) * this.size * this.life
      const y1 = Math.sin(angle) * this.size * this.life
      const nextAngle = ((i + 2) * Math.PI * 2) / points
      const x2 = Math.cos(nextAngle) * this.size * this.life
      const y2 = Math.sin(nextAngle) * this.size * this.life
      if (i === 0) ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    }
    ctx.closePath()
    ctx.stroke()

    // Outer notches/ticks
    ctx.lineWidth = 2.0 * this.life
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12
      const x1 = Math.cos(angle) * this.size * 0.9 * this.life
      const y1 = Math.sin(angle) * this.size * 0.9 * this.life
      const x2 = Math.cos(angle) * this.size * 1.1 * this.life
      const y2 = Math.sin(angle) * this.size * 1.1 * this.life
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    ctx.restore()
  }
}

function explodeSidebarSelect(x, y, color, particles, ripples, texts, spells) {
  // Spawn the magic circle seal
  spells.push(new MagicSpell({ x, y, color, size: 75, life: 1.0 }))

  // Spawn matching bursts of dynamic stars and diamond sparkles
  for (let i = 0; i < 30; i++) {
    const ang = Math.random() * Math.PI * 2
    const speed = 1.5 + Math.random() * 4.5
    const type = Math.random() < 0.35 ? 'star' : Math.random() < 0.5 ? 'diamond' : 'spark'
    particles.push(new Particle({
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      color,
      size: 2.0 + Math.random() * 4.0,
      life: 0.5 + Math.random() * 0.6,
      gravity: 0,
      drag: 0.96,
      glow: true,
      type
    }))
  }

  // Ripple aura
  ripples.push(new Ripple({ x, y, color, maxR: 120, speed: 2.0, lineWidth: 2 }))
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function InteractionFX() {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({
    particles: [], ripples: [], texts: [], lightnings: [], flashes: [], spells: [],
    raf: null, lastT: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /* Resize */
    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const s = stateRef.current

    /* Render loop */
    function render(timestamp) {
      s.raf = requestAnimationFrame(render)
      const dt = Math.min((timestamp - s.lastT) / 1000, 0.05)
      s.lastT = timestamp

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const W = canvas.width, H = canvas.height

      /* Draw flashes */
      s.flashes = s.flashes.filter(f => { if (f.update(dt)) { f.draw(ctx, W, H); return true } return false })

      /* Draw spells */
      s.spells = s.spells.filter(sp => { if (sp.update(dt)) { sp.draw(ctx); return true } return false })

      /* Draw ripples */
      s.ripples = s.ripples.filter(r => { if (r.update(dt)) { r.draw(ctx); return true } return false })

      /* Draw particles */
      s.particles = s.particles.filter(p => { if (p.update(dt)) { p.draw(ctx); return true } return false })

      /* Draw lightning */
      s.lightnings = s.lightnings.filter(l => { if (l.update(dt)) { l.draw(ctx); return true } return false })

      /* Draw texts */
      s.texts = s.texts.filter(t => { if (t.update(dt)) { t.draw(ctx); return true } return false })
    }
    s.raf = requestAnimationFrame(render)

    /* Event handlers */
    const handlers = {
      'fx:taskComplete': (e) => {
        const { x = window.innerWidth/2, y = window.innerHeight/2 } = e.detail || {}
        explodeSupernova(x, y, s.particles, s.ripples, s.texts)
      },
      'fx:habitToggle': (e) => {
        const { x = window.innerWidth/2, y = window.innerHeight/2, name = '' } = e.detail || {}
        explodeHabitToggle(x, y, s.particles, s.ripples, s.texts, name)
      },
      'fx:xpGain': (e) => {
        const { x = window.innerWidth/2, y = window.innerHeight/2, amount = 0 } = e.detail || {}
        explodeXpGain(x, y, amount, s.particles, s.texts)
      },
      'fx:levelUp': (e) => {
        const { level = 1 } = e.detail || {}
        explodeLevelUp(level, canvas.width, canvas.height, s.particles, s.ripples, s.texts, s.lightnings, s.flashes)
      },
      'fx:questCreate': (e) => {
        const { x = window.innerWidth/2, y = window.innerHeight/2 } = e.detail || {}
        explodeQuestCreate(x, y, s.particles, s.ripples, s.texts)
      },
      'fx:studyLog': (e) => {
        const { x = window.innerWidth/2, y = window.innerHeight/2, hours = 0 } = e.detail || {}
        explodeStudyLog(x, y, hours, s.particles, s.ripples, s.texts)
      },
      'fx:sidebarSelect': (e) => {
        const { x = window.innerWidth/2, y = window.innerHeight/2, color = '#fbbf24' } = e.detail || {}
        explodeSidebarSelect(x, y, color, s.particles, s.ripples, s.texts, s.spells)
      },
    }

    Object.entries(handlers).forEach(([evt, fn]) => window.addEventListener(evt, fn))

    return () => {
      cancelAnimationFrame(s.raf)
      window.removeEventListener('resize', resize)
      Object.entries(handlers).forEach(([evt, fn]) => window.removeEventListener(evt, fn))
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORTED TRIGGER HELPER — import this in page.js
   Usage: fireFX('taskComplete', { x: e.clientX, y: e.clientY })
══════════════════════════════════════════════════════════════════════ */
export function fireFX(type, detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`fx:${type}`, { detail }))
  }
}
