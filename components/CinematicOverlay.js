'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED MATH UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
const easeIn = (t) => t * t * t
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max + 1))
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const TAU = Math.PI * 2

// ─────────────────────────────────────────────────────────────────────────────
// PERLIN NOISE (Simplex-like) — for organic motion
// ─────────────────────────────────────────────────────────────────────────────
const perlinPerm = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]]
  }
  return [...p, ...p]
})()

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
function grad(hash, x, y) {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v)
}
function noise2D(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255
  x -= Math.floor(x); y -= Math.floor(y)
  const u = fade(x), v = fade(y)
  const a = perlinPerm[X] + Y, b = perlinPerm[X + 1] + Y
  return lerp(v,
    lerp(u, grad(perlinPerm[a], x, y), grad(perlinPerm[b], x - 1, y)),
    lerp(u, grad(perlinPerm[a + 1], x, y - 1), grad(perlinPerm[b + 1], x - 1, y - 1))
  ) * 0.5 + 0.5
}

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS PARTICLE CLASS
// ─────────────────────────────────────────────────────────────────────────────
class Particle {
  constructor(opts = {}) {
    Object.assign(this, {
      x: 0, y: 0, z: 1,
      vx: 0, vy: 0,
      ax: 0, ay: 0,
      life: 1, decay: 0.01,
      size: 3, sizeDecay: 0,
      color: '#ffffff',
      alpha: 1,
      rotation: 0, rotSpeed: 0,
      type: 'circle',
      trail: [], trailMax: 0,
      gravity: 0, drag: 0.99,
      bloom: 0,
      ...opts
    })
  }
  update(dt = 1) {
    this.vx = (this.vx + this.ax * dt) * this.drag
    this.vy = (this.vy + (this.ay + this.gravity) * dt) * this.drag
    if (this.trailMax > 0) {
      this.trail.push({ x: this.x, y: this.y, alpha: this.life })
      if (this.trail.length > this.trailMax) this.trail.shift()
    }
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.life -= this.decay * dt
    this.size = Math.max(0, this.size - this.sizeDecay * dt)
    this.rotation += this.rotSpeed * dt
    this.alpha = this.life
    return this.life > 0
  }
  draw(ctx) {
    if (this.life <= 0) return
    // Draw trail
    if (this.trail.length > 1) {
      for (let i = 1; i < this.trail.length; i++) {
        const t0 = this.trail[i - 1], t1 = this.trail[i]
        const a = (i / this.trail.length) * this.alpha * 0.4
        ctx.beginPath()
        ctx.strokeStyle = this.color
        ctx.globalAlpha = a
        ctx.lineWidth = (i / this.trail.length) * this.size * 0.5
        ctx.moveTo(t0.x, t0.y)
        ctx.lineTo(t1.x, t1.y)
        ctx.stroke()
      }
    }
    if (this.bloom > 0) {
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * (3 + this.bloom))
      let c0 = this.color
      let c03 = this.color
      let c1 = 'rgba(0,0,0,0)'
      if (this.color.startsWith('#')) {
        c0 = this.color + 'ff'
        c03 = this.color + '80'
        c1 = this.color + '00'
      } else if (this.color.startsWith('rgba') || this.color.startsWith('hsla')) {
        const lastComma = this.color.lastIndexOf(',')
        if (lastComma !== -1) {
          const prefix = this.color.substring(0, lastComma + 1)
          c0 = prefix + ' 1)'
          c03 = prefix + ' 0.5)'
          c1 = prefix + ' 0)'
        }
      }
      grd.addColorStop(0, c0)
      grd.addColorStop(0.3, c03)
      grd.addColorStop(1, c1)
      ctx.fillStyle = grd
      ctx.globalAlpha = this.alpha * 0.6
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * (3 + this.bloom), 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    if (this.type === 'circle') {
      ctx.beginPath()
      ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, TAU)
      ctx.fill()
    } else if (this.type === 'square') {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation)
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
      ctx.restore()
    } else if (this.type === 'spark') {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(Math.atan2(this.vy, this.vx))
      const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.5
      ctx.beginPath()
      ctx.ellipse(0, 0, Math.max(len, this.size), this.size * 0.3, 0, 0, TAU)
      ctx.fill()
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTNING BOLT GENERATOR — recursive branching
// ─────────────────────────────────────────────────────────────────────────────
function generateLightning(x1, y1, x2, y2, roughness = 80, depth = 4) {
  if (depth === 0) return [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * roughness
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * roughness
  return [
    ...generateLightning(x1, y1, mx, my, roughness * 0.55, depth - 1),
    ...generateLightning(mx, my, x2, y2, roughness * 0.55, depth - 1).slice(1),
  ]
}

function drawLightning(ctx, pts, color, width, alpha, bloom = true) {
  if (pts.length < 2) return
  if (bloom) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = width * 6
    ctx.globalAlpha = alpha * 0.08
    ctx.filter = 'blur(8px)'
    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.stroke()
    ctx.filter = 'none'
    ctx.restore()
  }
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = width * 0.4
  ctx.globalAlpha = alpha * 0.5
  ctx.beginPath()
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.globalAlpha = alpha
  ctx.beginPath()
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
  ctx.stroke()
  ctx.globalAlpha = 1
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRE SIMULATION — cellular automaton
// ─────────────────────────────────────────────────────────────────────────────
class FireSim {
  constructor(w, h, scale = 4) {
    this.scale = scale
    this.cols = Math.ceil(w / scale)
    this.rows = Math.ceil(h / scale)
    this.grid = new Float32Array(this.cols * this.rows)
    this.w = w; this.h = h
  }
  seed(intensity = 1) {
    const bottom = this.rows - 1
    for (let x = 0; x < this.cols; x++) {
      this.grid[bottom * this.cols + x] = rand(0.8, 1) * intensity
    }
  }
  step() {
    const { cols, rows, grid } = this
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols; x++) {
        const below = grid[(y + 1) * cols + x] || 0
        const blowL = grid[(y + 1) * cols + Math.max(0, x - 1)] || 0
        const blowR = grid[(y + 1) * cols + Math.min(cols - 1, x + 1)] || 0
        const spread = (below + blowL + blowR) / 3
        grid[y * cols + x] = Math.max(0, spread - rand(0.008, 0.025))
      }
    }
    this.seed()
  }
  draw(ctx, palette) {
    const { cols, rows, grid, scale } = this
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = grid[y * cols + x]
        if (v < 0.01) continue
        const ci = Math.min(palette.length - 1, Math.floor(v * palette.length))
        ctx.fillStyle = palette[ci]
        ctx.globalAlpha = v
        ctx.fillRect(x * scale, y * scale, scale + 1, scale + 1)
      }
    }
    ctx.globalAlpha = 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WATER / RIPPLE SIMULATION
// ─────────────────────────────────────────────────────────────────────────────
class RippleSim {
  constructor(w, h, scale = 6) {
    this.scale = scale
    this.cols = Math.ceil(w / scale)
    this.rows = Math.ceil(h / scale)
    this.cur = new Float32Array(this.cols * this.rows)
    this.prv = new Float32Array(this.cols * this.rows)
    this.w = w; this.h = h
  }
  drop(cx, cy, radius = 3, strength = 255) {
    const { cols, rows, scale, cur } = this
    const gx = Math.floor(cx / scale), gy = Math.floor(cy / scale)
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue
        const nx = clamp(gx + dx, 0, cols - 1)
        const ny = clamp(gy + dy, 0, rows - 1)
        cur[ny * cols + nx] = strength
      }
    }
  }
  step() {
    const { cols, rows, cur, prv } = this
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const sum = cur[(y - 1) * cols + x] + cur[(y + 1) * cols + x]
          + cur[y * cols + x - 1] + cur[y * cols + x + 1]
        const v = (sum / 2 - prv[y * cols + x]) * 0.98
        prv[y * cols + x] = clamp(v, -255, 255)
      }
    }
    const t = this.prv; this.prv = this.cur; this.cur = t
  }
  draw(ctx, color = '#22d3ee', alpha = 0.8) {
    const { cols, rows, cur, scale } = this
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const v = cur[y * cols + x]
        if (Math.abs(v) < 2) continue
        const a = Math.min(1, Math.abs(v) / 80) * alpha
        ctx.fillStyle = color
        ctx.globalAlpha = a
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
    ctx.globalAlpha = 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC FIELD LINES
// ─────────────────────────────────────────────────────────────────────────────
function drawFieldLines(ctx, poles, count = 24, steps = 120, color = '#a78bfa') {
  for (let i = 0; i < count; i++) {
    const startAngle = (i / count) * TAU
    const pole = poles[0]
    let x = pole.x + Math.cos(startAngle) * 8
    let y = pole.y + Math.sin(startAngle) * 8
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < steps; s++) {
      let fx = 0, fy = 0
      poles.forEach(p => {
        const dx = x - p.x, dy = y - p.y
        const d2 = dx * dx + dy * dy + 1
        const f = p.charge / d2
        fx += dx * f; fy += dy * f
      })
      const len = Math.sqrt(fx * fx + fy * fy) + 0.001
      x += (fx / len) * 3; y += (fy / len) * 3
      ctx.lineTo(x, y)
      if (x < -50 || x > 1500 || y < -50 || y > 1500) break
    }
    ctx.strokeStyle = color
    ctx.globalAlpha = 0.25
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHROMATIC ABERRATION POST-PROCESS
// ─────────────────────────────────────────────────────────────────────────────
function chromaticAberration(ctx, canvas, amount = 3) {
  const offR = document.createElement('canvas')
  const offG = document.createElement('canvas')
  offR.width = offG.width = canvas.width
  offR.height = offG.height = canvas.height
  const ctxR = offR.getContext('2d')
  const ctxG = offG.getContext('2d')
  ctxR.drawImage(canvas, 0, 0)
  ctxG.drawImage(canvas, 0, 0)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.6
  ctx.drawImage(offR, amount, 0)
  ctx.drawImage(offG, -amount, 0)
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// BEZIER CURVE PARTICLE PATH
// ─────────────────────────────────────────────────────────────────────────────
function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN-SHAKE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
class ScreenShake {
  constructor() { this.trauma = 0; this.decay = 0.85 }
  add(v) { this.trauma = Math.min(1, this.trauma + v) }
  update() { this.trauma *= this.decay; return this.trauma > 0.001 }
  get offset() {
    const s = this.trauma * this.trauma
    return { x: rand(-1, 1) * s * 20, y: rand(-1, 1) * s * 20 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicOverlay({ activeTransition, onComplete }) {
  const canvasRef = useRef(null)
  const offscreenRef = useRef(null)
  const [phase, setPhase] = useState('none')
  const stateRef = useRef({})

  useEffect(() => {
    if (!activeTransition) { setPhase('none'); return }
    setPhase('entering')
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) return

    // Offscreen for post-processing
    const off = document.createElement('canvas')
    offscreenRef.current = off
    const ctxOff = off.getContext('2d', { willReadFrequently: false })

    let animId, startTime = null
    const shake = new ScreenShake()
    let particles = []
    let frameCount = 0
    let simData = {}

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      off.width = canvas.width
      off.height = canvas.height
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => window.innerWidth
    const H = () => window.innerHeight
    const MX = () => window.innerWidth / 2
    const MY = () => window.innerHeight / 2

    // ── INIT SYSTEMS ─────────────────────────────────────────────────────────
    const initSystems = () => {
      particles = []
      simData = {}
      const w = W(), h = H(), mx = MX(), my = MY()

      // ── 1. HINOKAMI KAGURA ───────────────────────────────────────────────
      if (activeTransition === 'fire_slash') {
        simData.fire = new FireSim(w, h, 3)
        simData.firePalette = [
          '#000000', '#1a0000', '#3d0000', '#660000', '#991a00',
          '#cc3300', '#e64d00', '#ff6600', '#ff8800', '#ffaa00',
          '#ffcc22', '#ffee66', '#ffffa0', '#ffffff',
        ]
        simData.slashPts = null
        simData.slashProgress = 0
        simData.emberCount = 0
        shake.add(0.4)
        // Pre-seed fire at bottom
        for (let i = 0; i < 3; i++) simData.fire.seed(1.2)
      }

      // ── 2. WATER CALM ─────────────────────────────────────────────────────
      else if (activeTransition === 'water_calm') {
        simData.ripple = new RippleSim(w, h, 4)
        simData.ripple.drop(mx, my, 8, 200)
        simData.petals = Array.from({ length: 40 }, () => ({
          x: Math.random() * w,
          y: Math.random() * -h,
          vx: rand(-0.5, 0.5),
          vy: rand(0.6, 1.5),
          size: rand(6, 14),
          angle: Math.random() * TAU,
          va: rand(-0.015, 0.015),
          phase: Math.random() * TAU,
          hue: rand(310, 340),
          opacity: rand(0.6, 1),
        }))
        simData.waveTime = 0
        simData.nextDrop = 0
      }

      // ── 3. GRIMOIRE ───────────────────────────────────────────────────────
      else if (activeTransition === 'grimoire') {
        simData.runeRings = [
          { r: 200, rot: 0, speed: 0.008, segments: 24, color: '#fbbf24', width: 2 },
          { r: 160, rot: 0, speed: -0.012, segments: 16, color: '#a78bfa', width: 1.5 },
          { r: 120, rot: 0, speed: 0.02, segments: 12, color: '#fbbf24', width: 1 },
          { r: 80, rot: 0, speed: -0.03, segments: 8, color: '#ffffff', width: 1 },
        ]
        simData.sigils = Array.from({ length: 7 }, (_, i) => ({
          angle: (i / 7) * TAU,
          r: 170,
          symbol: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ'][i],
          pulse: Math.random() * TAU,
        }))
        simData.pentagram = { sides: 5, r: 145, rot: -Math.PI / 2, spin: 0.005 }
        simData.manaParticles = Array.from({ length: 80 }, () => {
          const a = Math.random() * TAU, r = rand(0, 220)
          return new Particle({
            x: mx + Math.cos(a) * r, y: my + Math.sin(a) * r,
            vx: rand(-0.5, 0.5), vy: rand(-1.5, -0.5),
            life: 1, decay: rand(0.006, 0.012),
            size: rand(1.5, 4),
            color: Math.random() > 0.5 ? '#fbbf24' : '#c084fc',
            bloom: 0.8, trailMax: 8,
          })
        })
      }

      // ── 4. ARISE / SHADOW EXTRACT ─────────────────────────────────────────
      else if (activeTransition === 'arise' || activeTransition === 'shadow_extract') {
        shake.add(0.6)
        simData.shadowPool = { r: 0, maxR: Math.max(w, h) * 0.7, alpha: 0 }
        simData.shadowStreaks = Array.from({ length: 60 }, () => ({
          x: Math.random() * w,
          y: h + rand(0, 100),
          speed: rand(4, 12),
          size: rand(20, 80),
          wobble: Math.random() * TAU,
          wobbleSpeed: rand(0.02, 0.06),
        }))
        simData.glyphRings = Array.from({ length: 3 }, (_, i) => ({
          r: 80 + i * 60, rot: (i * TAU) / 3, speed: (i % 2 === 0 ? 1 : -1) * 0.015,
          alpha: 0,
        }))
        simData.eyeAlpha = 0
        simData.crownRays = Array.from({ length: 16 }, (_, i) => ({
          angle: (i / 16) * TAU,
          len: 0,
          maxLen: rand(80, 180),
          speed: rand(2, 6),
        }))
        simData.soulsRising = Array.from({ length: 20 }, () => ({
          x: rand(mx - 150, mx + 150),
          y: rand(my + 50, h),
          alpha: 0,
          vy: rand(0.5, 1.5),
          size: rand(20, 50),
        }))
      }

      // ── 5. RASENGAN ───────────────────────────────────────────────────────
      else if (activeTransition === 'rasengan') {
        shake.add(0.3)
        simData.rings = Array.from({ length: 5 }, (_, i) => ({
          r: 20 + i * 22, rot: 0, speed: (i % 2 === 0 ? 1 : -1) * (0.04 - i * 0.005),
          segments: 8 + i * 4,
          color: i < 2 ? '#ffffff' : i < 4 ? '#22d3ee' : '#60a5fa',
          width: 3 - i * 0.4,
        }))
        simData.chakraDots = Array.from({ length: 200 }, () => {
          const a = Math.random() * TAU, d = rand(10, 180)
          return new Particle({
            x: mx + Math.cos(a) * d, y: my + Math.sin(a) * d,
            vx: -Math.sin(a) * rand(1.5, 3.5),
            vy: Math.cos(a) * rand(1.5, 3.5),
            life: 1, decay: rand(0.004, 0.01),
            size: rand(1, 3.5),
            color: Math.random() > 0.4 ? '#22d3ee' : '#ffffff',
            bloom: 0.5, trailMax: 12, drag: 0.985,
          })
        })
        simData.windLines = Array.from({ length: 30 }, (_, i) => ({
          a: (i / 30) * TAU, r: rand(60, 200), arc: rand(0.3, 1.2),
          speed: rand(0.03, 0.07), alpha: rand(0.2, 0.5),
        }))
        simData.coreSize = 0
        simData.corePulse = 0
      }

      // ── 6. CHIDORI ────────────────────────────────────────────────────────
      else if (activeTransition === 'chidori' || activeTransition === 'chidori_brain') {
        shake.add(0.8)
        simData.bolts = []
        simData.boltTimer = 0
        simData.sphereR = 0
        simData.electricParticles = Array.from({ length: 120 }, () =>
          new Particle({
            x: mx + rand(-30, 30), y: my + rand(-30, 30),
            vx: rand(-8, 8), vy: rand(-8, 8),
            life: 1, decay: rand(0.02, 0.05),
            size: rand(1, 3), type: 'spark',
            color: randPick(['#e0f2fe', '#38bdf8', '#ffffff', '#7dd3fc']),
            bloom: 0.5, drag: 0.94, gravity: -0.05,
          })
        )
        simData.magneticPoles = [
          { x: mx, y: my, charge: -4000 },
          { x: mx - 200, y: my - 150, charge: 2000 },
          { x: mx + 200, y: my - 150, charge: 2000 },
        ]
        simData.outerSparks = []
      }

      // ── 7. TSUKUYOMI / SHARINGAN ──────────────────────────────────────────
      else if (activeTransition === 'tsukuyomi' || activeTransition === 'sharingan') {
        simData.eyeR = 0
        simData.eyeMaxR = Math.min(w, h) * 0.42
        simData.eyeGrowth = 4
        simData.tomoeAngle = 0
        simData.bloodDrips = []
        simData.tears = []
        simData.vignetteAlpha = 0
        simData.redNoise = 0
        simData.mangekyo = activeTransition === 'sharingan'
        simData.innerRotation = 0
        simData.outerRotation = 0
        simData.rippleR = 0
        simData.glitchOffset = 0
        simData.particles = Array.from({ length: 40 }, (_, i) => ({
          angle: (i / 40) * TAU, r: rand(20, 60),
          speed: rand(0.02, 0.05) * (Math.random() > 0.5 ? 1 : -1),
          size: rand(2, 5),
          color: Math.random() > 0.5 ? '#dc2626' : '#fbbf24',
          alpha: rand(0.4, 1),
        }))
      }

      // ── 8. THUNDERCLAP ───────────────────────────────────────────────────
      else if (activeTransition === 'thunderclap') {
        shake.add(1.0)
        simData.flashAlpha = 0
        simData.flashWhite = 0
        simData.dashProgress = 0
        simData.afterImages = []
        simData.dashPath = null
        simData.bolts = []
        simData.boltTimer = 0
        simData.sparks = Array.from({ length: 200 }, () =>
          new Particle({
            x: mx + rand(-50, 50), y: my + rand(-50, 50),
            vx: rand(-20, 20), vy: rand(-20, 5),
            life: 1, decay: rand(0.03, 0.08),
            size: rand(1, 4), type: 'spark',
            color: randPick(['#fbbf24', '#fef08a', '#ffffff', '#f59e0b']),
            bloom: 1, drag: 0.92, gravity: 0.3, trailMax: 6,
          })
        )
        simData.speedLines = Array.from({ length: 60 }, (_, i) => ({
          angle: rand(-0.15, 0.15),
          x: rand(0, w), y: rand(0, h),
          len: rand(60, 250), speed: rand(0.3, 0.8),
          alpha: rand(0.3, 0.9),
          width: rand(0.5, 2),
        }))
      }

      // ── 9. HOLLOW PURPLE ─────────────────────────────────────────────────
      else if (activeTransition === 'hollow_purple') {
        shake.add(0.7)
        simData.lhsParticles = Array.from({ length: 80 }, () =>
          new Particle({
            x: rand(0, mx * 0.4), y: rand(my - 150, my + 150),
            vx: rand(5, 12), vy: rand(-1, 1),
            life: 1, decay: rand(0.008, 0.018),
            size: rand(2, 6), type: 'spark',
            color: '#ef4444', bloom: 0.4, trailMax: 10, drag: 0.985,
          })
        )
        simData.rhsParticles = Array.from({ length: 80 }, () =>
          new Particle({
            x: rand(mx * 1.6, w), y: rand(my - 150, my + 150),
            vx: rand(-12, -5), vy: rand(-1, 1),
            life: 1, decay: rand(0.008, 0.018),
            size: rand(2, 6), type: 'spark',
            color: '#3b82f6', bloom: 0.4, trailMax: 10, drag: 0.985,
          })
        )
        simData.coreR = 0
        simData.coreMaxR = 300
        simData.shockwave = { r: 0, alpha: 0 }
        simData.ripples = []
        simData.voidCracks = null
        simData.fieldLines = { poles: [{ x: mx * 0.3, y: my, charge: 3000 }, { x: mx * 1.7, y: my, charge: 3000 }] }
      }

      // ── 10. DEEP FOREST ───────────────────────────────────────────────────
      else if (activeTransition === 'deep_forest') {
        simData.branches = []
        const spawnBranch = (x, y, angle, len, width, depth) => {
          if (depth <= 0 || len < 4) return
          simData.branches.push({
            x, y, angle, len, width, depth,
            progress: 0, speed: rand(0.02, 0.05),
            children: [],
            childSpawned: false,
            color: `hsl(${rand(100, 140)}, ${rand(50, 80)}%, ${rand(15, 35)}%)`,
          })
        }
        for (let i = 0; i < 5; i++) {
          spawnBranch(
            mx + rand(-100, 100), h,
            -Math.PI / 2 + rand(-0.4, 0.4),
            rand(180, 280), rand(12, 20), 5
          )
        }
        simData.spawnBranch = spawnBranch
        simData.leaves = []
        simData.pollen = Array.from({ length: 40 }, () => new Particle({
          x: rand(0, w), y: rand(-h, 0),
          vx: rand(-0.5, 0.5), vy: rand(0.3, 1.2),
          life: 1, decay: 0.001,
          size: rand(1.5, 3.5),
          color: `hsl(${rand(80, 140)}, 90%, 70%)`,
          bloom: 0.3, drag: 0.999,
        }))
        simData.glowSpots = Array.from({ length: 8 }, () => ({
          x: rand(mx - 150, mx + 150), y: rand(my - 100, my + 200),
          r: 0, maxR: rand(40, 100),
          hue: rand(90, 140),
        }))
        simData.vineProgress = 0
      }

      // ── 11. EVOLUTION AURA ────────────────────────────────────────────────
      else if (activeTransition === 'evolution') {
        shake.add(0.5)
        simData.auraLayers = Array.from({ length: 8 }, (_, i) => ({
          r: 30 + i * 25, rot: 0, rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.01 + i * 0.003),
          segments: 20 - i * 2, alpha: 0.6 - i * 0.06,
          color: i < 3 ? '#22d3ee' : i < 6 ? '#34d399' : '#f97316',
          noise: Math.random() * TAU,
          noiseSpeed: rand(0.01, 0.03),
          points: [],
        }))
        simData.energyParticles = Array.from({ length: 150 }, () => {
          const a = Math.random() * TAU, r = rand(30, 200)
          return new Particle({
            x: mx + Math.cos(a) * r, y: my + 150 + rand(-30, 30),
            vx: rand(-1.5, 1.5), vy: rand(-12, -4),
            life: 1, decay: rand(0.008, 0.02),
            size: rand(3, 10),
            color: Math.random() > 0.3 ? 'rgba(34,211,238,0.6)' : 'rgba(249,115,22,0.6)',
            bloom: 1.2, drag: 0.97, gravity: -0.05,
          })
        })
        simData.groundcrack = { progress: 0 }
        simData.lightBeam = { h: 0, alpha: 0 }
        simData.shockPulse = { r: 0, alpha: 0 }
      }

      // ── 12. BLACK DIVIDER / DISMANTLE ─────────────────────────────────────
      else if (activeTransition === 'black_divider' || activeTransition === 'dismantle') {
        shake.add(0.9)
        const isDivider = activeTransition === 'black_divider'
        simData.slashGroups = Array.from({ length: isDivider ? 1 : 5 }, (_, gi) => ({
          delay: gi * 120,
          slashes: isDivider
            ? [{ angle: rand(-0.15, 0.15), color: '#dc2626', width: 18, length: Math.max(w, h) * 1.2 }]
            : [{ angle: rand(-Math.PI, Math.PI), color: '#f43f5e', width: 10, length: Math.max(w, h) * 0.9 }],
          progress: 0, done: false,
          speed: 0.04,
          afterglow: 0,
        }))
        simData.cutDebris = []
        simData.screenSlice = null
        simData.energyTrail = []
      }

      // ── 13. MONARCH DOMAIN ───────────────────────────────────────────────
      else if (activeTransition === 'monarch_domain') {
        shake.add(0.5)
        simData.domainR = 0
        simData.domainMaxR = Math.max(w, h) * 0.85
        simData.shadowTentacles = Array.from({ length: 12 }, (_, i) => ({
          angle: (i / 12) * TAU, r: 0, maxR: rand(200, 400),
          speed: rand(2, 5), wobble: 0, wobbleSpeed: rand(0.03, 0.08),
          color: '#7c3aed', width: rand(3, 10),
          pts: [],
        }))
        simData.shadowOrbs = Array.from({ length: 30 }, () => ({
          x: mx + rand(-200, 200), y: my + rand(-200, 200),
          r: rand(5, 20), alpha: 0, targetAlpha: rand(0.3, 0.8),
          speed: rand(0.01, 0.03),
        }))
        simData.wings = { spread: 0, maxSpread: w * 0.5 }
        simData.crownGlow = 0
        simData.pillarCount = 8
        simData.pillarHeights = new Float32Array(8)
        simData.symbols = Array.from({ length: 12 }, (_, i) => ({
          angle: (i / 12) * TAU, r: 150, rot: 0,
          char: ['✦', '◈', '⬡', '⟁', '⌬', '◉', '⊛', '⟐', '⧫', '◇', '⬢', '◈'][i],
          alpha: 0, size: rand(14, 22),
        }))
      }

      // ── 14. CONSTANT FLUX ────────────────────────────────────────────────
      else if (activeTransition === 'constant_flux') {
        simData.dragonT = 0
        simData.dragonPath = []
        simData.dragonBody = Array.from({ length: 80 }, (_, i) => ({
          tOffset: -i * 0.05,
          size: Math.max(2, 12 - i * 0.12),
          color: `hsl(${200 + i * 0.3}, 90%, ${70 - i * 0.3}%)`,
          alpha: 1 - i * 0.008,
        }))
        simData.ripple = new RippleSim(w, h, 5)
        simData.waterParticles = Array.from({ length: 60 }, () =>
          new Particle({
            x: rand(0, w), y: rand(0, h),
            vx: rand(-1, 1), vy: rand(-1, 1),
            life: 1, decay: 0.003, size: rand(2, 6),
            color: `rgba(${randInt(20, 60)}, ${randInt(150, 220)}, 255, 0.7)`,
            bloom: 0.3, drag: 0.992,
          })
        )
        simData.dragonEyeGlow = 0
        simData.waveAmplitude = 0
      }

      // ── 15. SPIRIT STORM ─────────────────────────────────────────────────
      else if (activeTransition === 'spirit_storm') {
        shake.add(0.4)
        simData.vortexR = 0
        simData.vortexMaxR = Math.min(w, h) * 0.5
        simData.windStreaks = Array.from({ length: 80 }, () => ({
          angle: Math.random() * TAU, r: rand(20, 300),
          dr: rand(-3, -0.5), arc: rand(0.1, 0.5),
          alpha: rand(0.3, 0.9), speed: rand(0.04, 0.1),
          color: Math.random() > 0.5 ? '#10b981' : '#34d399',
          width: rand(0.5, 2.5),
        }))
        simData.spiritOrbs = Array.from({ length: 20 }, () => ({
          angle: Math.random() * TAU, r: rand(50, 250),
          speed: rand(0.02, 0.05), size: rand(8, 20),
          alpha: 0, pulse: Math.random() * TAU,
          color: Math.random() > 0.5 ? '#10b981' : '#6ee7b7',
        }))
        simData.tornadoCore = { r: 0, alpha: 0 }
        simData.dustParticles = Array.from({ length: 100 }, () =>
          new Particle({
            x: rand(0, w), y: rand(0, h),
            vx: rand(-4, 4), vy: rand(-4, 4),
            life: 1, decay: rand(0.005, 0.015),
            size: rand(1, 4),
            color: Math.random() > 0.6 ? '#10b981' : '#064e3b',
            bloom: 0.2, drag: 0.96,
          })
        )
        simData.noiseOffset = 0
      }

      // ── 16. SHADOW GARDEN ─────────────────────────────────────────────────
      else if (activeTransition === 'shadow_garden') {
        simData.shadowBlobs = Array.from({ length: 20 }, (_, i) => ({
          x: mx + rand(-50, 50), y: my + rand(-50, 50),
          vx: (Math.random() - 0.5) * rand(1, 4),
          vy: (Math.random() - 0.5) * rand(1, 4),
          r: rand(10, 40), maxR: rand(100, 300),
          color: `hsl(${rand(230, 270)}, 50%, ${rand(5, 15)}%)`,
          alpha: 0,
        }))
        simData.creatures = Array.from({ length: 8 }, (_, i) => ({
          x: mx + Math.cos((i / 8) * TAU) * 150,
          y: my + Math.sin((i / 8) * TAU) * 80,
          phase: (i / 8) * TAU, speed: rand(0.015, 0.04),
          r: 150, eyes: true, alpha: 0,
        }))
        simData.roots = Array.from({ length: 6 }, () => ({
          pts: [{ x: mx + rand(-100, 100), y: h }],
          angle: -Math.PI / 2 + rand(-0.5, 0.5),
          speed: rand(3, 7), width: rand(4, 12),
          alive: true,
        }))
        simData.void = { r: 0, maxR: 200, alpha: 0 }
      }

      // ── 17. CONSTELLATION ────────────────────────────────────────────────
      else if (activeTransition === 'constellation') {
        simData.stars = Array.from({ length: 60 }, () => ({
          x: rand(40, w - 40), y: rand(40, h - 40),
          size: rand(1.5, 5), alpha: 0,
          twinkle: Math.random() * TAU, twinkleSpeed: rand(0.02, 0.08),
          color: randPick(['#ffffff', '#e0f2fe', '#bfdbfe', '#c7d2fe', '#fef9c3']),
          connections: [], bloom: rand(0.5, 2),
        }))
        simData.stars.forEach((s, i) => {
          simData.stars.forEach((o, j) => {
            if (i >= j) return
            const d = Math.hypot(s.x - o.x, s.y - o.y)
            if (d < 180 && s.connections.length < 4 && o.connections.length < 4) {
              s.connections.push({ star: o, alpha: 0, progress: 0 })
            }
          })
        })
        simData.constellationName = { alpha: 0, text: 'CAELUM INFINITUM' }
        simData.shootingStars = []
        simData.nebula = { alpha: 0, hue: rand(180, 280) }
        simData.grid = { alpha: 0 }
      }

      // ── 18. TIME RIPPLE ──────────────────────────────────────────────────
      else if (activeTransition === 'time_ripple') {
        simData.clockR = 0
        simData.clockMaxR = 160
        simData.clockRot = 0
        simData.clockSpeed = -0.05
        simData.clockAccel = -0.005
        simData.ripples = []
        simData.fragments = Array.from({ length: 40 }, () => ({
          x: mx + rand(-100, 100), y: my + rand(-100, 100),
          vx: rand(-3, 3), vy: rand(-3, 3),
          size: rand(10, 40), rotation: Math.random() * TAU,
          rotSpeed: rand(-0.05, 0.05),
          alpha: 0, type: randPick(['circle', 'square', 'triangle']),
          color: `hsl(${rand(30, 50)}, 90%, ${rand(50, 70)}%)`,
        }))
        simData.hourGlass = { alpha: 0, sandProgress: 0 }
        simData.warpEffect = 0
        simData.glitchFrames = 0
      }

      // ── 19. FRACTAL ──────────────────────────────────────────────────────
      else if (activeTransition === 'fractal') {
        simData.polygons = Array.from({ length: 9 }, (_, i) => ({
          sides: 3 + i, r: 40 + i * 38, rot: i * 0.12,
          rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.01 + i * 0.002),
          alpha: 0.9 - i * 0.08,
          color: `hsl(${20 + i * 18}, 85%, ${55 + i * 2}%)`,
          width: 2.5 - i * 0.2,
        }))
        simData.mandalaRays = Array.from({ length: 24 }, (_, i) => ({
          angle: (i / 24) * TAU, r: 0, maxR: 300,
          speed: 3, alpha: rand(0.2, 0.7),
        }))
        simData.recursiveSquares = 0
        simData.goldenSpiral = { t: 0, pts: [] }
        simData.fractalParticles = Array.from({ length: 80 }, () => {
          const a = Math.random() * TAU, r = rand(40, 280)
          return new Particle({
            x: mx + Math.cos(a) * r, y: my + Math.sin(a) * r,
            vx: -Math.sin(a) * rand(0.5, 2),
            vy: Math.cos(a) * rand(0.5, 2),
            life: 1, decay: rand(0.005, 0.012),
            size: rand(1.5, 4),
            color: `hsl(${rand(20, 60)}, 90%, 60%)`,
            bloom: 0.5, drag: 0.995,
          })
        })
        simData.noiseTime = 0
      }
    }

    initSystems()

    // ── SCREEN-SHAKE HELPER ───────────────────────────────────────────────
    const applyShake = (ctx, w, h) => {
      if (shake.trauma > 0.001) {
        const o = shake.offset
        ctx.translate(o.x, o.y)
        shake.update()
      }
    }

    // ── VIGNETTE HELPER ───────────────────────────────────────────────────
    const drawVignette = (ctx, w, h, color = 'rgba(0,0,0,0.65)', inner = 0.35) => {
      const grd = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * inner, w / 2, h / 2, Math.sqrt(w * w + h * h) / 2)
      grd.addColorStop(0, 'rgba(0,0,0,0)')
      grd.addColorStop(1, color)
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)
    }

    // ── RENDER LOOP ───────────────────────────────────────────────────────
    const render = (ts) => {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const t = elapsed / 1000
      const w = W(), h = H(), mx = MX(), my = MY()
      frameCount++

      // Bind drawings to offscreen context
      const ctx = ctxOff

      ctx.save()
      ctx.clearRect(0, 0, off.width, off.height)
      const dpr = window.devicePixelRatio || 1
      ctx.scale(dpr, dpr)
      applyShake(ctx, w, h)

      // ══════════════════════════════════════════════════════════════════════
      // 1. HINOKAMI KAGURA — Fire Breathing
      // ══════════════════════════════════════════════════════════════════════
      if (activeTransition === 'fire_slash') {
        const { fire, firePalette } = simData

        // Darken background
        ctx.fillStyle = '#050000'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Fire simulation
        fire.step()
        fire.draw(ctx, firePalette)

        // Slash arc with motion blur
        const slashStart = 0.15, slashEnd = 0.75
        if (t >= slashStart && t <= slashEnd + 0.3) {
          const slashT = clamp((t - slashStart) / 0.5, 0, 1)
          const bright = Math.max(0, 1 - (t - slashEnd) * 3)

          if (!simData.slashPts) {
            simData.slashPts = generateLightning(
              w * 0.1, h * 0.85,
              w * 0.88, h * 0.12,
              60, 4
            )
          }

          const endIdx = Math.floor(simData.slashPts.length * slashT)
          const visible = simData.slashPts.slice(0, Math.max(2, endIdx))

          // Motion blur passes
          for (let mb = 4; mb >= 1; mb--) {
            const mbT = clamp((t - slashStart - mb * 0.015) / 0.5, 0, 1)
            const mbEnd = Math.floor(simData.slashPts.length * mbT)
            const mbVis = simData.slashPts.slice(0, Math.max(2, mbEnd))
            drawLightning(ctx, mbVis, '#ff6600', 10 + mb * 6, bright * 0.08, false)
          }

          drawLightning(ctx, visible, '#ff8800', 16, bright * 0.4, false)
          drawLightning(ctx, visible, '#ffaa00', 8, bright * 0.7, false)
          drawLightning(ctx, visible, '#ffffff', 3, bright, false)

          // Slash tip sparks
          if (endIdx < simData.slashPts.length - 1 && bright > 0.1) {
            const tip = simData.slashPts[endIdx]
            for (let s = 0; s < 3; s++) {
              particles.push(new Particle({
                x: tip.x + rand(-5, 5), y: tip.y + rand(-5, 5),
                vx: rand(-6, 6), vy: rand(-6, 6),
                life: 1, decay: rand(0.07, 0.15),
                size: rand(2, 6), type: 'spark',
                color: randPick(['#ff6600', '#ffaa00', '#ffffff']),
                bloom: 1.5, drag: 0.93,
              }))
            }
          }
        }

        // Periodic ember burst
        if (frameCount % 2 === 0) {
          for (let i = 0; i < 5; i++) {
            particles.push(new Particle({
              x: rand(0, w), y: rand(h * 0.3, h),
              vx: rand(-3, 3), vy: rand(-8, -2),
              life: 1, decay: rand(0.01, 0.025),
              size: rand(1, 4), type: 'spark',
              color: randPick(firePalette.slice(7)),
              bloom: 0.8, drag: 0.97, gravity: 0.05,
            }))
          }
        }

        particles = particles.filter(p => { const alive = p.update(); p.draw(ctx); return alive })
        drawVignette(ctx, w, h, 'rgba(0,0,0,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 2. WATER CALM — Dead Calm
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'water_calm') {
        const { ripple, petals } = simData
        simData.waveTime += 0.02

        // Deep ocean gradient
        const bg = ctx.createLinearGradient(0, 0, 0, h)
        bg.addColorStop(0, '#010814')
        bg.addColorStop(0.4, '#061a30')
        bg.addColorStop(1, '#010814')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        // Draw caustic light patterns
        for (let i = 0; i < 6; i++) {
          const cx = mx + Math.sin(t * 0.4 + i * 1.1) * 150
          const cy = my + Math.cos(t * 0.3 + i * 0.9) * 80
          const r = 80 + Math.sin(t * 0.7 + i) * 30
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
          grd.addColorStop(0, 'rgba(34,211,238,0.05)')
          grd.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = grd
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill()
        }

        // Ripple simulation
        if (elapsed > simData.nextDrop) {
          ripple.drop(
            mx + rand(-250, 250), my + rand(-100, 100),
            rand(3, 7), rand(120, 200)
          )
          simData.nextDrop = elapsed + rand(300, 700)
        }
        ripple.step(); ripple.step()
        ripple.draw(ctx, '#38bdf8', 0.7)

        // Horizontal wave lines
        ctx.globalAlpha = 0.12
        for (let i = 0; i < 20; i++) {
          const yy = my - 100 + i * 12
          ctx.beginPath()
          ctx.moveTo(0, yy)
          for (let x = 0; x <= w; x += 4) {
            const y = yy + Math.sin((x * 0.01) + simData.waveTime + i * 0.5) * 6
            ctx.lineTo(x, y)
          }
          ctx.strokeStyle = '#7dd3fc'
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
        ctx.globalAlpha = 1

        // Sakura petals
        petals.forEach(p => {
          p.y += p.vy
          p.x += Math.sin(p.y * 0.008 + p.phase) * 0.8 + p.vx
          p.angle += p.va
          if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle)
          ctx.globalAlpha = p.opacity * (0.6 + 0.4 * Math.sin(t * 2 + p.phase))
          const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
          pg.addColorStop(0, `hsla(${p.hue}, 80%, 80%, 1)`)
          pg.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`)
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, TAU)
          ctx.fill()
          ctx.restore()
        })

        drawVignette(ctx, w, h, 'rgba(1,8,20,0.6)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 3. GRIMOIRE — Anti-Magic Spell
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'grimoire') {
        ctx.fillStyle = 'rgba(4,2,10,0.96)'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        const { runeRings, sigils, pentagram, manaParticles } = simData
        const cAlpha = Math.min(1, t * 2)

        // Ground shadow glow
        const sg = ctx.createRadialGradient(mx, h, 0, mx, h, 250)
        sg.addColorStop(0, 'rgba(251,191,36,0.15)')
        sg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = sg
        ctx.fillRect(0, 0, w, h)

        // Rune rings
        runeRings.forEach(ring => {
          ring.rot += ring.speed
          ctx.save()
          ctx.translate(mx, my)
          ctx.rotate(ring.rot)
          ctx.globalAlpha = cAlpha * 0.7
          ctx.strokeStyle = ring.color
          ctx.lineWidth = ring.width
          // Dashed segmented ring
          const segArc = TAU / ring.segments
          for (let i = 0; i < ring.segments; i++) {
            if (i % 2 === 0) continue
            ctx.beginPath()
            ctx.arc(0, 0, ring.r, i * segArc + 0.05, (i + 1) * segArc - 0.05)
            ctx.stroke()
          }
          ctx.restore()
        })

        // Pentagram
        pentagram.rot += pentagram.speed
        ctx.save()
        ctx.translate(mx, my)
        ctx.rotate(pentagram.rot)
        ctx.globalAlpha = cAlpha * 0.4
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        const step = (TAU / 5)
        for (let i = 0; i < 5; i++) {
          const a = step * (i * 2)
          const b = step * (i * 2 + 2)
          ctx.moveTo(Math.cos(a) * pentagram.r, Math.sin(a) * pentagram.r)
          ctx.lineTo(Math.cos(b) * pentagram.r, Math.sin(b) * pentagram.r)
        }
        ctx.stroke()
        ctx.restore()

        // Sigils around outer ring
        sigils.forEach(s => {
          s.pulse += 0.04
          const sx = mx + Math.cos(s.angle + t * 0.2) * s.r
          const sy = my + Math.sin(s.angle + t * 0.2) * s.r
          const alpha = cAlpha * (0.5 + 0.5 * Math.sin(s.pulse))
          ctx.globalAlpha = alpha
          ctx.fillStyle = '#fbbf24'
          ctx.font = 'bold 20px serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(s.symbol, sx, sy)
        })
        ctx.globalAlpha = 1

        // Inner circle with sacred geometry
        ctx.save()
        ctx.translate(mx, my)
        ctx.rotate(-t * 0.15)
        ctx.globalAlpha = cAlpha * 0.35
        ctx.strokeStyle = '#a78bfa'
        ctx.lineWidth = 1
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU
          ctx.beginPath()
          ctx.arc(Math.cos(a) * 55, Math.sin(a) * 55, 55, 0, TAU)
          ctx.stroke()
        }
        ctx.restore()

        // Mana particles
        manaParticles.forEach((p, i) => {
          if (!p.update()) {
            const a = Math.random() * TAU, r = rand(0, 220)
            manaParticles[i] = new Particle({
              x: mx + Math.cos(a) * r, y: my + Math.sin(a) * r,
              vx: rand(-0.5, 0.5), vy: rand(-1.5, -0.5),
              life: 1, decay: rand(0.006, 0.012),
              size: rand(1.5, 4),
              color: Math.random() > 0.5 ? '#fbbf24' : '#c084fc',
              bloom: 0.8, trailMax: 8,
            })
          } else p.draw(ctx)
        })

        drawVignette(ctx, w, h, 'rgba(4,2,10,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 4. ARISE / SHADOW EXTRACT — Shadow Monarch
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'arise' || activeTransition === 'shadow_extract') {
        const { shadowPool, shadowStreaks, glyphRings, crownRays, soulsRising } = simData

        // Deep black void
        ctx.fillStyle = '#020008'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Shadow pool expanding from bottom
        shadowPool.r = Math.min(shadowPool.maxR, t * 300)
        shadowPool.alpha = Math.min(0.85, t * 1.5)
        if (shadowPool.r > 0) {
          const spg = ctx.createRadialGradient(mx, h * 1.3, 0, mx, h * 1.3, shadowPool.r)
          spg.addColorStop(0, `rgba(88,28,135,${shadowPool.alpha})`)
          spg.addColorStop(0.4, `rgba(46,16,101,${shadowPool.alpha * 0.6})`)
          spg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = spg
          ctx.fillRect(0, 0, w, h)
        }

        // Shadow streaks rising
        shadowStreaks.forEach(s => {
          s.y -= s.speed
          s.wobble += s.wobbleSpeed
          if (s.y < -100) { s.y = h + 50; s.x = Math.random() * w }
          const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size)
          sg.addColorStop(0, 'rgba(167,139,250,0.12)')
          sg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = sg
          ctx.beginPath(); ctx.ellipse(s.x, s.y, s.size * 0.3, s.size, 0, 0, TAU); ctx.fill()
        })

        // Glyph rings appearing
        glyphRings.forEach((ring, i) => {
          if (t > 0.3 + i * 0.15) {
            ring.alpha = Math.min(0.7, ring.alpha + 0.02)
            ring.rot += ring.speed
          }
          if (ring.alpha > 0) {
            ctx.save()
            ctx.translate(mx, my - 40)
            ctx.rotate(ring.rot)
            ctx.globalAlpha = ring.alpha
            ctx.strokeStyle = '#a78bfa'
            ctx.lineWidth = 1.5
            ctx.setLineDash([8, 16])
            ctx.beginPath(); ctx.arc(0, 0, ring.r, 0, TAU); ctx.stroke()
            ctx.setLineDash([])
            // Rune marks
            for (let k = 0; k < 8; k++) {
              const ka = (k / 8) * TAU
              const ks = 4
              ctx.fillStyle = '#c084fc'
              ctx.beginPath()
              ctx.arc(Math.cos(ka) * ring.r, Math.sin(ka) * ring.r, ks, 0, TAU)
              ctx.fill()
            }
            ctx.restore()
          }
        })

        // Crown rays from top
        if (t > 0.8) {
          crownRays.forEach(ray => {
            ray.len = Math.min(ray.maxLen, ray.len + ray.speed)
            const rx = mx + Math.cos(ray.angle - Math.PI / 2) * ray.len
            const ry = (my - 180) + Math.sin(ray.angle - Math.PI / 2) * ray.len
            ctx.beginPath()
            ctx.moveTo(mx, my - 180)
            ctx.lineTo(rx, ry)
            ctx.strokeStyle = '#7c3aed'
            ctx.globalAlpha = 0.35 * (ray.len / ray.maxLen)
            ctx.lineWidth = 1.5
            ctx.stroke()
            ctx.globalAlpha = 1
          })
        }

        // Souls rising
        soulsRising.forEach((soul, i) => {
          if (t > 0.5 + i * 0.08) {
            soul.alpha = Math.min(0.4, soul.alpha + 0.01)
            soul.y -= soul.vy
          }
          if (soul.alpha > 0) {
            const sg = ctx.createRadialGradient(soul.x, soul.y, 0, soul.x, soul.y, soul.size)
            sg.addColorStop(0, `rgba(167,139,250,${soul.alpha})`)
            sg.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = sg
            ctx.beginPath(); ctx.arc(soul.x, soul.y, soul.size, 0, TAU); ctx.fill()
          }
        })

        // King's glowing eyes
        if (t > 0.5) {
          simData.eyeAlpha = Math.min(1, (t - 0.5) * 2)
          const ea = simData.eyeAlpha
          ctx.save()
          ctx.globalAlpha = ea

          // Eye glow bloom
          const eyeY = my - 60
          const eyeBloom = ctx.createRadialGradient(mx, eyeY, 0, mx, eyeY, 120)
          eyeBloom.addColorStop(0, 'rgba(34,211,238,0.2)')
          eyeBloom.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = eyeBloom
          ctx.beginPath(); ctx.arc(mx, eyeY, 120, 0, TAU); ctx.fill()

          ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 40
          ctx.fillStyle = '#22d3ee'

          // Left eye slit
          ctx.save(); ctx.translate(mx - 90, eyeY)
          ctx.beginPath()
          ctx.moveTo(-30, 0); ctx.quadraticCurveTo(0, -18, 30, 0); ctx.quadraticCurveTo(0, 8, -30, 0)
          ctx.fill(); ctx.restore()

          // Right eye slit
          ctx.save(); ctx.translate(mx + 90, eyeY)
          ctx.beginPath()
          ctx.moveTo(-30, 0); ctx.quadraticCurveTo(0, -18, 30, 0); ctx.quadraticCurveTo(0, 8, -30, 0)
          ctx.fill(); ctx.restore()

          ctx.shadowBlur = 0; ctx.restore()
        }

        // Purple particle burst
        if (frameCount % 3 === 0) {
          for (let i = 0; i < 3; i++) {
            const a = Math.random() * TAU
            particles.push(new Particle({
              x: mx + Math.cos(a) * rand(0, 80), y: my - 40 + Math.sin(a) * 40,
              vx: Math.cos(a) * rand(0.5, 3), vy: Math.sin(a) * rand(0.5, 3) - 1,
              life: 1, decay: rand(0.01, 0.02),
              size: rand(2, 6),
              color: randPick(['#a78bfa', '#7c3aed', '#22d3ee']),
              bloom: 1, trailMax: 6,
            }))
          }
        }
        particles = particles.filter(p => { const alive = p.update(); p.draw(ctx); return alive })

        drawVignette(ctx, w, h, 'rgba(2,0,8,0.55)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 5. RASENGAN — Vortex Chakra Sphere
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'rasengan') {
        const { rings, chakraDots, windLines } = simData

        ctx.fillStyle = '#010710'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Growing core size
        simData.coreSize = Math.min(85, simData.coreSize + 2.5)
        simData.corePulse = t * 5

        // Wind spiral arcs
        windLines.forEach(wl => {
          wl.a -= wl.speed
          const x1 = mx + Math.cos(wl.a) * wl.r
          const y1 = my + Math.sin(wl.a) * wl.r
          const x2 = mx + Math.cos(wl.a + wl.arc) * (wl.r * 0.7)
          const y2 = my + Math.sin(wl.a + wl.arc) * (wl.r * 0.7)
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.quadraticCurveTo(mx + (x1 - mx) * 0.5, my + (y1 - my) * 0.5, x2, y2)
          ctx.strokeStyle = '#22d3ee'
          ctx.globalAlpha = wl.alpha * 0.3
          ctx.lineWidth = 0.8
          ctx.stroke()
          ctx.globalAlpha = 1
        })

        // Rotating energy rings
        rings.forEach(ring => {
          ring.rot += ring.speed
          ctx.save()
          ctx.translate(mx, my)
          ctx.rotate(ring.rot)
          ctx.globalAlpha = 0.8
          ctx.strokeStyle = ring.color
          ctx.lineWidth = ring.width
          const segAngle = TAU / ring.segments
          for (let i = 0; i < ring.segments; i++) {
            if (i % 3 === 2) continue
            ctx.beginPath()
            ctx.arc(0, 0, ring.r, i * segAngle, (i + 0.6) * segAngle)
            ctx.stroke()
          }
          ctx.restore()
        })

        // Chakra dot particles
        chakraDots.forEach((p, i) => {
          if (!p.update()) {
            const a = Math.random() * TAU, d = rand(10, 180)
            chakraDots[i] = new Particle({
              x: mx + Math.cos(a) * d, y: my + Math.sin(a) * d,
              vx: -Math.sin(a) * rand(1.5, 3.5), vy: Math.cos(a) * rand(1.5, 3.5),
              life: 1, decay: rand(0.004, 0.01),
              size: rand(1, 3.5),
              color: Math.random() > 0.4 ? '#22d3ee' : '#ffffff',
              bloom: 0.5, trailMax: 12, drag: 0.985,
            })
          } else p.draw(ctx)
        })

        // Glowing core
        const cs = simData.coreSize
        const pulse = 1 + 0.08 * Math.sin(simData.corePulse)
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, cs * pulse)
        cg.addColorStop(0, '#ffffff')
        cg.addColorStop(0.15, '#a0f0ff')
        cg.addColorStop(0.5, 'rgba(34,211,238,0.4)')
        cg.addColorStop(1, 'rgba(3,7,18,0)')
        ctx.fillStyle = cg
        ctx.beginPath(); ctx.arc(mx, my, cs * pulse * 1.5, 0, TAU); ctx.fill()

        // Hard white center
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 0.95
        ctx.beginPath(); ctx.arc(mx, my, cs * 0.22, 0, TAU); ctx.fill()
        ctx.globalAlpha = 1

        drawVignette(ctx, w, h, 'rgba(1,7,16,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 6. CHIDORI — Lightning Blade
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'chidori' || activeTransition === 'chidori_brain') {
        const { electricParticles, magneticPoles } = simData

        ctx.fillStyle = '#010510'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Magnetic field lines
        drawFieldLines(ctx, magneticPoles, 20, 100, '#22d3ee')

        // Growing sphere
        simData.sphereR = Math.min(100, simData.sphereR + 2)
        const sr = simData.sphereR
        if (sr > 5) {
          const sg = ctx.createRadialGradient(mx, my, 0, mx, my, sr)
          sg.addColorStop(0, 'rgba(255,255,255,0.9)')
          sg.addColorStop(0.2, 'rgba(186,230,253,0.6)')
          sg.addColorStop(0.7, 'rgba(56,189,248,0.2)')
          sg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = sg
          ctx.beginPath(); ctx.arc(mx, my, sr * 2, 0, TAU); ctx.fill()
        }

        // Lightning bolts regenerating every 3 frames
        if (frameCount % 3 === 0) {
          simData.bolts = []
          for (let i = 0; i < 10; i++) {
            const angle = rand(0, TAU)
            const dist = rand(40, 200)
            const ex = mx + Math.cos(angle) * dist
            const ey = my + Math.sin(angle) * dist
            simData.bolts.push({
              pts: generateLightning(mx, my, ex, ey, 40, 3),
              color: randPick(['#e0f2fe', '#7dd3fc', '#38bdf8', '#ffffff']),
              width: rand(0.8, 2.5),
              alpha: rand(0.4, 1),
            })
            // Secondary bolts
            if (Math.random() > 0.6) {
              const bx = ex + rand(-80, 80)
              const by = ey + rand(-80, 80)
              simData.bolts.push({
                pts: generateLightning(ex, ey, bx, by, 20, 2),
                color: '#b0e6ff',
                width: rand(0.4, 0.9),
                alpha: rand(0.3, 0.7),
              })
            }
          }
          // Outer sparks
          simData.outerSparks = Array.from({ length: 8 }, () =>
            new Particle({
              x: mx + rand(-30, 30), y: my + rand(-30, 30),
              vx: rand(-10, 10), vy: rand(-10, 5),
              life: 1, decay: rand(0.08, 0.18),
              size: rand(1, 3), type: 'spark',
              color: '#e0f2fe', bloom: 1.2, drag: 0.92,
            })
          )
        }

        simData.bolts.forEach(b => drawLightning(ctx, b.pts, b.color, b.width, b.alpha))
        simData.outerSparks = simData.outerSparks.filter(p => { const alive = p.update(); p.draw(ctx); return alive })

        // Electric particles
        electricParticles.forEach((p, i) => {
          if (!p.update()) {
            electricParticles[i] = new Particle({
              x: mx + rand(-30, 30), y: my + rand(-30, 30),
              vx: rand(-8, 8), vy: rand(-8, 8),
              life: 1, decay: rand(0.02, 0.05),
              size: rand(1, 3), type: 'spark',
              color: randPick(['#e0f2fe', '#38bdf8', '#ffffff', '#7dd3fc']),
              bloom: 0.5, drag: 0.94, gravity: -0.05,
            })
          } else p.draw(ctx)
        })

        drawVignette(ctx, w, h, 'rgba(1,5,16,0.55)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 7. TSUKUYOMI / SHARINGAN — Genjutsu Realm
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'tsukuyomi' || activeTransition === 'sharingan') {
        const { mangekyo } = simData

        // Blood-red void
        ctx.fillStyle = '#1a0000'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Atmospheric noise texture
        simData.redNoise += 0.008
        for (let i = 0; i < 15; i++) {
          const nx = rand(0, w), ny = rand(0, h)
          const nv = noise2D(nx * 0.005 + simData.redNoise, ny * 0.005) * 0.08
          ctx.fillStyle = `rgba(139,0,0,${nv})`
          ctx.fillRect(nx - 30, ny - 30, 60, 60)
        }

        // Eye growing
        simData.eyeR = Math.min(simData.eyeMaxR, simData.eyeR + simData.eyeGrowth)
        const er = simData.eyeR
        simData.innerRotation += 0.04
        simData.outerRotation -= 0.025

        ctx.save()
        ctx.translate(mx, my)

        // Outer red iris
        const irisG = ctx.createRadialGradient(0, 0, er * 0.1, 0, 0, er)
        irisG.addColorStop(0, '#000000')
        irisG.addColorStop(0.22, '#000000')
        irisG.addColorStop(0.25, '#cc0000')
        irisG.addColorStop(0.85, '#880000')
        irisG.addColorStop(1, '#440000')
        ctx.fillStyle = irisG
        ctx.beginPath(); ctx.arc(0, 0, er, 0, TAU); ctx.fill()

        // Sclera white edges
        ctx.strokeStyle = '#1a0000'
        ctx.lineWidth = er * 0.08
        ctx.beginPath(); ctx.arc(0, 0, er, 0, TAU); ctx.stroke()

        // Outer rotating detail ring
        ctx.rotate(simData.outerRotation)
        ctx.strokeStyle = '#660000'
        ctx.lineWidth = 3
        for (let i = 0; i < 32; i++) {
          const a = (i / 32) * TAU
          ctx.beginPath()
          ctx.moveTo(Math.cos(a) * er * 0.88, Math.sin(a) * er * 0.88)
          ctx.lineTo(Math.cos(a) * er * 0.96, Math.sin(a) * er * 0.96)
          ctx.stroke()
        }
        ctx.rotate(-simData.outerRotation)

        // Inner ring
        ctx.rotate(simData.innerRotation)
        ctx.strokeStyle = '#aa0000'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(0, 0, er * 0.65, 0, TAU); ctx.stroke()
        ctx.rotate(-simData.innerRotation)

        // Tomoe
        for (let i = 0; i < 3; i++) {
          const ta = simData.tomoeAngle + (i / 3) * TAU
          const tx = Math.cos(ta) * er * 0.62
          const ty = Math.sin(ta) * er * 0.62
          ctx.save(); ctx.translate(tx, ty); ctx.rotate(ta + Math.PI / 2)
          ctx.fillStyle = '#000000'
          ctx.beginPath(); ctx.arc(0, 0, er * 0.1, 0, TAU); ctx.fill()
          // Tomoe tail — teardrop
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.bezierCurveTo(er * 0.14, -er * 0.04, er * 0.1, -er * 0.2, 0, -er * 0.16)
          ctx.bezierCurveTo(-er * 0.05, -er * 0.06, -er * 0.03, er * 0.02, 0, 0)
          ctx.fill()
          ctx.restore()
        }
        simData.tomoeAngle += 0.022

        if (mangekyo) {
          // Mangekyou pattern — 3 pinwheel blades
          ctx.save()
          ctx.rotate(t * 0.3)
          ctx.globalAlpha = 0.85
          ctx.fillStyle = '#000000'
          for (let i = 0; i < 3; i++) {
            ctx.save(); ctx.rotate((i / 3) * TAU)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.bezierCurveTo(er * 0.5, -er * 0.15, er * 0.3, -er * 0.55, er * 0.4, -er * 0.6)
            ctx.bezierCurveTo(er * 0.1, -er * 0.4, -er * 0.2, -er * 0.5, -er * 0.1, -er * 0.2)
            ctx.fill()
            ctx.restore()
          }
          ctx.restore()
          ctx.globalAlpha = 1
        }

        // Pupil
        ctx.fillStyle = '#000000'
        ctx.beginPath(); ctx.arc(0, 0, er * 0.18, 0, TAU); ctx.fill()

        // Pupil glow
        const pgr = ctx.createRadialGradient(0, 0, 0, 0, 0, er * 0.2)
        pgr.addColorStop(0, 'rgba(220,38,38,0.6)')
        pgr.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = pgr
        ctx.beginPath(); ctx.arc(0, 0, er * 0.2, 0, TAU); ctx.fill()

        ctx.restore()

        // Blood drips from edges of eye
        if (t > 0.5 && Math.random() > 0.97) {
          simData.bloodDrips.push(new Particle({
            x: mx + rand(-er * 0.8, er * 0.8),
            y: my + er * 0.3 + rand(-10, 10),
            vx: rand(-0.3, 0.3), vy: rand(1, 3),
            life: 1, decay: rand(0.008, 0.015),
            size: rand(3, 8), type: 'circle',
            color: '#8b0000', gravity: 0.1, drag: 0.99,
          }))
        }
        simData.bloodDrips = simData.bloodDrips.filter(p => { const alive = p.update(); p.draw(ctx); return alive })

        // Particles orbiting eye
        simData.particles.forEach(p => {
          p.angle += p.speed
          const px = mx + Math.cos(p.angle) * (er + p.r)
          const py = my + Math.sin(p.angle) * (er + p.r)
          ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha
          ctx.beginPath(); ctx.arc(px, py, p.size, 0, TAU); ctx.fill()
          ctx.globalAlpha = 1
        })

        drawVignette(ctx, w, h, 'rgba(80,0,0,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 8. THUNDERCLAP — Zenitsu Lightning Dash
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'thunderclap') {
        const { sparks, speedLines } = simData

        ctx.fillStyle = '#020200'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Speed lines
        speedLines.forEach(sl => {
          sl.alpha *= 0.98
          const ex = sl.x + Math.cos(sl.angle) * sl.len
          const ey = sl.y + Math.sin(sl.angle + Math.PI * 0.5) * sl.len
          ctx.beginPath()
          ctx.moveTo(sl.x, sl.y)
          ctx.lineTo(ex, sl.y + Math.sin(sl.angle) * 20)
          ctx.strokeStyle = '#fbbf24'
          ctx.globalAlpha = sl.alpha * 0.25
          ctx.lineWidth = sl.width
          ctx.stroke()
          ctx.globalAlpha = 1
        })

        // Flash white on impact
        if (t < 0.2) {
          simData.flashWhite = 1 - t * 5
          ctx.fillStyle = `rgba(255,255,200,${simData.flashWhite * 0.6})`
          ctx.fillRect(0, 0, w, h)
        }

        // Lightning regenerating
        if (frameCount % 2 === 0) {
          simData.bolts = []
          // Main cross-screen bolt
          simData.bolts.push({
            pts: generateLightning(-50, my + 80, w + 50, my - 100, 80, 5),
            color: '#ffffff', width: 5, alpha: 0.9,
          })
          simData.bolts.push({
            pts: generateLightning(-50, my + 80, w + 50, my - 100, 50, 4),
            color: '#fbbf24', width: 2.5, alpha: 0.7,
          })
          // Branch bolts
          for (let i = 0; i < 6; i++) {
            const sx = rand(100, w - 100), sy = rand(my - 100, my + 100)
            simData.bolts.push({
              pts: generateLightning(sx, sy, sx + rand(-200, 200), sy + rand(-200, 200), 40, 3),
              color: '#fef08a', width: 1, alpha: rand(0.3, 0.6),
            })
          }
        }

        simData.bolts.forEach(b => drawLightning(ctx, b.pts, b.color, b.width, b.alpha))

        // Yellow flare core
        if (t < 1.2) {
          const fa = Math.max(0, 1 - t * 0.8)
          const fg = ctx.createRadialGradient(mx, my - 20, 0, mx, my - 20, 200)
          fg.addColorStop(0, `rgba(255,255,100,${fa * 0.5})`)
          fg.addColorStop(0.5, `rgba(250,180,0,${fa * 0.15})`)
          fg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = fg
          ctx.beginPath(); ctx.arc(mx, my - 20, 200, 0, TAU); ctx.fill()
        }

        // Sparks
        sparks.forEach((p, i) => {
          if (!p.update()) {
            sparks[i] = new Particle({
              x: mx + rand(-80, 80), y: my + rand(-40, 40),
              vx: rand(-18, 18), vy: rand(-18, 5),
              life: 1, decay: rand(0.04, 0.1),
              size: rand(1, 3.5), type: 'spark',
              color: randPick(['#fbbf24', '#fef08a', '#ffffff', '#f59e0b']),
              bloom: 1.2, drag: 0.92, gravity: 0.4, trailMax: 8,
            })
          } else p.draw(ctx)
        })

        drawVignette(ctx, w, h, 'rgba(2,2,0,0.55)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 9. HOLLOW PURPLE — Gojo Convergence
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'hollow_purple') {
        const { lhsParticles, rhsParticles, fieldLines, ripples } = simData

        ctx.fillStyle = '#050010'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Magnetic field between poles
        drawFieldLines(ctx, fieldLines.poles, 16, 80, '#a855f7')

        // Red + blue convergent particles
        lhsParticles.forEach((p, i) => {
          p.update()
          if (p.x > w + 50) {
            lhsParticles[i] = new Particle({
              x: rand(-20, mx * 0.3), y: my + rand(-200, 200),
              vx: rand(5, 12), vy: rand(-0.5, 0.5),
              life: 1, decay: rand(0.004, 0.012),
              size: rand(2, 6), type: 'spark',
              color: '#ef4444', bloom: 0.5, trailMax: 14, drag: 0.99,
            })
          } else p.draw(ctx)
        })
        rhsParticles.forEach((p, i) => {
          p.update()
          if (p.x < -50) {
            rhsParticles[i] = new Particle({
              x: rand(mx * 1.7, w + 20), y: my + rand(-200, 200),
              vx: rand(-12, -5), vy: rand(-0.5, 0.5),
              life: 1, decay: rand(0.004, 0.012),
              size: rand(2, 6), type: 'spark',
              color: '#3b82f6', bloom: 0.5, trailMax: 14, drag: 0.99,
            })
          } else p.draw(ctx)
        })

        // Growing purple void
        if (t > 0.3) {
          simData.coreR = Math.min(simData.coreMaxR, simData.coreR + (t > 1 ? 4 : 6))
          const cr = simData.coreR
          const pulse = 1 + 0.05 * Math.sin(t * 8)

          // Outer implosion ring
          if (cr > 20) {
            ctx.beginPath()
            ctx.arc(mx, my, cr * 1.3, 0, TAU)
            ctx.strokeStyle = '#c084fc'
            ctx.globalAlpha = 0.25
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.globalAlpha = 1
          }

          // Core void
          const cvg = ctx.createRadialGradient(mx, my, 0, mx, my, cr * pulse)
          cvg.addColorStop(0, '#ffffff')
          cvg.addColorStop(0.1, '#e9d5ff')
          cvg.addColorStop(0.4, 'rgba(168,85,247,0.8)')
          cvg.addColorStop(0.7, 'rgba(126,34,206,0.4)')
          cvg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = cvg
          ctx.beginPath(); ctx.arc(mx, my, cr * 2, 0, TAU); ctx.fill()

          // Shockwave rings
          if (frameCount % 20 === 0) {
            simData.ripples.push({ r: cr * 0.5, alpha: 0.8, speed: 6 })
          }
          simData.ripples = simData.ripples.filter(r => {
            r.r += r.speed; r.alpha -= 0.015
            if (r.alpha <= 0) return false
            ctx.beginPath(); ctx.arc(mx, my, r.r, 0, TAU)
            ctx.strokeStyle = '#a855f7'; ctx.globalAlpha = r.alpha
            ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1
            return true
          })
        }

        drawVignette(ctx, w, h, 'rgba(5,0,16,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 10. DEEP FOREST — Wood Style Emergence
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'deep_forest') {
        const { branches, leaves, pollen, glowSpots, spawnBranch } = simData

        // Forest atmosphere
        const bg = ctx.createLinearGradient(0, 0, 0, h)
        bg.addColorStop(0, '#010a04')
        bg.addColorStop(0.6, '#021505')
        bg.addColorStop(1, '#000a02')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        // Ambient glow spots (bioluminescence)
        glowSpots.forEach(gs => {
          gs.r = Math.min(gs.maxR, gs.r + 0.5)
          if (gs.r > 0) {
            const gg = ctx.createRadialGradient(gs.x, gs.y, 0, gs.x, gs.y, gs.r)
            gg.addColorStop(0, `hsla(${gs.hue}, 80%, 55%, 0.12)`)
            gg.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = gg
            ctx.beginPath(); ctx.arc(gs.x, gs.y, gs.r, 0, TAU); ctx.fill()
          }
        })

        // Grow and draw branches
        branches.forEach((b, bi) => {
          b.progress = Math.min(1, b.progress + b.speed)
          const ep = b.progress
          const endX = b.x + Math.cos(b.angle) * b.len * ep
          const endY = b.y + Math.sin(b.angle) * b.len * ep

          ctx.beginPath()
          ctx.moveTo(b.x, b.y)
          ctx.quadraticCurveTo(
            b.x + Math.cos(b.angle + 0.3) * b.len * ep * 0.5,
            b.y + Math.sin(b.angle + 0.3) * b.len * ep * 0.5,
            endX, endY
          )
          ctx.strokeStyle = b.color
          ctx.lineWidth = b.width * (1 - ep * 0.3)
          ctx.lineCap = 'round'
          ctx.globalAlpha = 0.9
          ctx.stroke()
          ctx.globalAlpha = 1

          // Spawn sub-branches at progress 0.4 and 0.7
          if (!b.childSpawned && ep > 0.4 && b.depth > 1) {
            b.childSpawned = true
            for (let c = 0; c < 2; c++) {
              const branchAngle = b.angle + rand(-0.6, 0.6)
              spawnBranch(endX, endY, branchAngle, b.len * rand(0.5, 0.75), b.width * rand(0.4, 0.65), b.depth - 1)
            }
          }

          // Leaves at tips
          if (ep > 0.8 && Math.random() > 0.95) {
            leaves.push({
              x: endX + rand(-15, 15), y: endY + rand(-10, 10),
              angle: Math.random() * TAU, size: rand(4, 10),
              hue: rand(90, 150), alpha: 0,
            })
          }
        })

        // Draw leaves
        leaves.forEach(l => {
          l.alpha = Math.min(0.9, l.alpha + 0.02)
          ctx.save()
          ctx.translate(l.x, l.y); ctx.rotate(l.angle)
          ctx.globalAlpha = l.alpha
          ctx.fillStyle = `hsl(${l.hue}, 75%, 35%)`
          ctx.beginPath()
          ctx.ellipse(0, 0, l.size * 1.5, l.size * 0.7, 0, 0, TAU)
          ctx.fill()
          // Leaf vein
          ctx.strokeStyle = `hsl(${l.hue}, 80%, 55%)`
          ctx.lineWidth = 0.5; ctx.globalAlpha = l.alpha * 0.5
          ctx.beginPath(); ctx.moveTo(-l.size * 1.5, 0); ctx.lineTo(l.size * 1.5, 0); ctx.stroke()
          ctx.restore()
        })

        // Pollen drift
        pollen.forEach(p => { p.update(); p.draw(ctx) })

        drawVignette(ctx, w, h, 'rgba(0,5,1,0.6)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 11. EVOLUTION AURA — Super Saiyan Powerup
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'evolution') {
        const { auraLayers, energyParticles, shockPulse, lightBeam } = simData

        ctx.fillStyle = '#030303'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Light beam upward
        lightBeam.alpha = Math.min(0.4, t * 0.5)
        lightBeam.h = Math.min(h, t * 400)
        if (lightBeam.alpha > 0) {
          const lb = ctx.createLinearGradient(mx - 40, my, mx + 40, my)
          lb.addColorStop(0, 'rgba(0,0,0,0)')
          lb.addColorStop(0.5, `rgba(34,211,238,${lightBeam.alpha})`)
          lb.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = lb
          ctx.fillRect(mx - 40, my - lightBeam.h, 80, lightBeam.h)
        }

        // Aura flame layers
        auraLayers.forEach(layer => {
          layer.rot += layer.rotSpeed
          layer.noise += layer.noiseSpeed

          // Generate noisy polygon points
          const pts = []
          for (let i = 0; i < 60; i++) {
            const a = (i / 60) * TAU
            const nv = noise2D(Math.cos(a) * 2 + layer.noise, Math.sin(a) * 2 + layer.noise)
            const r = layer.r + nv * 25 - 12
            pts.push({ x: mx + Math.cos(a + layer.rot) * r, y: my + Math.sin(a + layer.rot) * r })
          }

          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y)
          pts.forEach(p => ctx.lineTo(p.x, p.y))
          ctx.closePath()
          ctx.strokeStyle = layer.color
          ctx.globalAlpha = layer.alpha
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.globalAlpha = 1
        })

        // Energy particles rising
        energyParticles.forEach((p, i) => {
          if (!p.update()) {
            energyParticles[i] = new Particle({
              x: mx + rand(-120, 120), y: my + 180 + rand(-20, 20),
              vx: rand(-1.5, 1.5), vy: rand(-12, -4),
              life: 1, decay: rand(0.008, 0.02),
              size: rand(3, 10),
              color: Math.random() > 0.3 ? 'rgba(34,211,238,0.6)' : 'rgba(249,115,22,0.6)',
              bloom: 1.2, drag: 0.97, gravity: -0.05,
            })
          } else p.draw(ctx)
        })

        // Shockwave pulse
        if (frameCount % 30 === 0) {
          simData.shockPulse = { r: 10, alpha: 0.7 }
        }
        if (simData.shockPulse.alpha > 0) {
          simData.shockPulse.r += 8
          simData.shockPulse.alpha -= 0.025
          ctx.beginPath(); ctx.arc(mx, my, simData.shockPulse.r, 0, TAU)
          ctx.strokeStyle = '#22d3ee'; ctx.globalAlpha = simData.shockPulse.alpha
          ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1
        }

        // Ground energy ring
        const gr = ctx.createEllipse ? null : null
        ctx.save()
        ctx.translate(mx, my + 160)
        ctx.scale(1, 0.3)
        const ering = ctx.createRadialGradient(0, 0, 0, 0, 0, 120)
        ering.addColorStop(0, 'rgba(34,211,238,0.3)')
        ering.addColorStop(0.7, 'rgba(34,211,238,0.08)')
        ering.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = ering; ctx.beginPath(); ctx.arc(0, 0, 120, 0, TAU); ctx.fill()
        ctx.restore()

        drawVignette(ctx, w, h, 'rgba(3,3,3,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 12. BLACK DIVIDER / DISMANTLE — Slash Attack
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'black_divider' || activeTransition === 'dismantle') {
        const isDivider = activeTransition === 'black_divider'
        const bgColor = isDivider ? '#080008' : '#090003'
        ctx.fillStyle = bgColor
        ctx.fillRect(-w, -h, w * 3, h * 3)

        simData.slashGroups.forEach((group, gi) => {
          if (elapsed < group.delay) return
          group.progress = Math.min(1, group.progress + group.speed)

          group.slashes.forEach(slash => {
            const pEnd = Math.floor(simData.slashPts?.length * group.progress || 1)
            ctx.save()
            ctx.translate(mx, my)
            ctx.rotate(slash.angle)

            // Motion blur passes
            for (let mb = 5; mb >= 0; mb--) {
              const mbP = Math.max(0, group.progress - mb * 0.08)
              const mbEnd = -slash.length / 2 + slash.length * mbP
              ctx.globalAlpha = (0.05 - mb * 0.008) * group.progress
              ctx.strokeStyle = isDivider ? '#dc2626' : '#f43f5e'
              ctx.lineWidth = slash.width * (1.5 + mb)
              ctx.lineCap = 'round'
              ctx.beginPath()
              ctx.moveTo(-slash.length / 2, 0)
              ctx.lineTo(mbEnd, 0)
              ctx.stroke()
            }

            // Core slash
            const slashEnd = -slash.length / 2 + slash.length * group.progress
            ctx.globalAlpha = 1
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = slash.width * 0.3
            ctx.beginPath()
            ctx.moveTo(-slash.length / 2, 0); ctx.lineTo(slashEnd, 0); ctx.stroke()

            ctx.strokeStyle = isDivider ? '#dc2626' : '#f43f5e'
            ctx.lineWidth = slash.width
            ctx.globalAlpha = 0.7
            ctx.beginPath()
            ctx.moveTo(-slash.length / 2, 0); ctx.lineTo(slashEnd, 0); ctx.stroke()

            // Slash tip sparks
            if (group.progress < 1) {
              for (let s = 0; s < 2; s++) {
                particles.push(new Particle({
                  x: slashEnd, y: rand(-5, 5),
                  vx: rand(-4, 4), vy: rand(-8, 8),
                  life: 1, decay: rand(0.06, 0.15),
                  size: rand(2, 5), type: 'spark',
                  color: isDivider ? '#ef4444' : '#fb7185',
                  bloom: 1.5, drag: 0.93,
                }))
              }
            }
            ctx.globalAlpha = 1
            ctx.restore()
          })
        })

        particles = particles.filter(p => { const alive = p.update(); p.draw(ctx); return alive })
        drawVignette(ctx, w, h, isDivider ? 'rgba(8,0,8,0.55)' : 'rgba(9,0,3,0.55)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 13. MONARCH DOMAIN — Shadow King Territory
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'monarch_domain') {
        const { shadowTentacles, shadowOrbs, wings, symbols, pillarHeights } = simData

        ctx.fillStyle = '#020008'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Domain expanding
        simData.domainR = Math.min(simData.domainMaxR, simData.domainR + 8)
        const dr = simData.domainR

        // Domain boundary ring
        const dg = ctx.createRadialGradient(mx, my, dr * 0.8, mx, my, dr)
        dg.addColorStop(0, 'rgba(0,0,0,0)')
        dg.addColorStop(0.7, 'rgba(124,58,237,0.08)')
        dg.addColorStop(1, 'rgba(124,58,237,0.3)')
        ctx.fillStyle = dg
        ctx.beginPath(); ctx.arc(mx, my, dr, 0, TAU); ctx.fill()

        // Pulsing domain circle
        ctx.beginPath(); ctx.arc(mx, my, dr, 0, TAU)
        ctx.strokeStyle = '#7c3aed'
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 4)
        ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1

        // Shadow tentacles growing from center
        shadowTentacles.forEach(ten => {
          ten.r = Math.min(ten.maxR, ten.r + ten.speed)
          ten.wobble += ten.wobbleSpeed
          if (ten.r < 10) return

          ctx.beginPath()
          ctx.moveTo(mx, my)
          const steps = 20
          for (let i = 0; i <= steps; i++) {
            const prog = i / steps
            const wobble = Math.sin(prog * 6 + ten.wobble) * 15 * prog
            const len = ten.r * prog
            const px = mx + Math.cos(ten.angle) * len + Math.sin(ten.angle) * wobble
            const py = my + Math.sin(ten.angle) * len - Math.cos(ten.angle) * wobble
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.strokeStyle = ten.color
          ctx.globalAlpha = 0.6
          ctx.lineWidth = ten.width * (1 - ten.r / ten.maxR * 0.7)
          ctx.lineCap = 'round'
          ctx.stroke()
          ctx.globalAlpha = 1
        })

        // Shadow orbs floating
        shadowOrbs.forEach(orb => {
          orb.alpha += (orb.targetAlpha - orb.alpha) * 0.05
          orb.x += Math.sin(t * orb.speed * 3 + orb.r) * 0.3
          orb.y += Math.cos(t * orb.speed * 2 + orb.r) * 0.3
          const og = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * 2)
          og.addColorStop(0, `rgba(139,92,246,${orb.alpha})`)
          og.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = og
          ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.r * 2, 0, TAU); ctx.fill()
        })

        // Floating symbols
        symbols.forEach((sym, i) => {
          if (t > 0.5 + i * 0.05) sym.alpha = Math.min(0.8, sym.alpha + 0.02)
          sym.rot += 0.01
          const sx = mx + Math.cos(sym.angle + t * 0.15) * sym.r
          const sy = my + Math.sin(sym.angle * 0.7 + t * 0.1) * sym.r * 0.5
          ctx.save()
          ctx.translate(sx, sy); ctx.rotate(sym.rot)
          ctx.globalAlpha = sym.alpha
          ctx.fillStyle = '#7c3aed'
          ctx.font = `${sym.size}px serif`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(sym.char, 0, 0)
          ctx.restore()
        })

        // Shadow pillar columns
        for (let i = 0; i < simData.pillarCount; i++) {
          pillarHeights[i] = Math.min(h * 0.4, pillarHeights[i] + rand(2, 6))
          const px = mx + (i - simData.pillarCount / 2 + 0.5) * 60
          const pg = ctx.createLinearGradient(px, h, px, h - pillarHeights[i])
          pg.addColorStop(0, 'rgba(88,28,135,0.6)')
          pg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = pg
          ctx.fillRect(px - 4, h - pillarHeights[i], 8, pillarHeights[i])
        }

        drawVignette(ctx, w, h, 'rgba(2,0,8,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 14. CONSTANT FLUX — Water Dragon Dance
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'constant_flux') {
        const { dragonBody, ripple, waterParticles } = simData

        // Deep ocean background
        const bg = ctx.createLinearGradient(0, 0, 0, h)
        bg.addColorStop(0, '#010a1e')
        bg.addColorStop(1, '#000510')
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)

        // Dragon path — Lemniscate of Bernoulli
        simData.dragonT += 0.03
        simData.waveAmplitude = Math.min(1, t * 0.8)

        const dragonX = (dt) => {
          const s = Math.sin(dt)
          return mx + (w * 0.35 * Math.cos(dt)) / (1 + s * s)
        }
        const dragonY = (dt) => {
          const s = Math.sin(dt)
          const amp = simData.waveAmplitude * my * 0.55
          return my + (amp * Math.sin(dt * 2)) / (1 + s * s)
        }

        // Draw water trail effect
        for (let i = dragonBody.length - 1; i >= 0; i--) {
          const segment = dragonBody[i]
          const segT = simData.dragonT + segment.tOffset
          const sx = dragonX(segT), sy = dragonY(segT)
          const nx = dragonX(segT + 0.01), ny = dragonY(segT + 0.01)

          // Water glow
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, segment.size * 2)
          sg.addColorStop(0, segment.color)
          sg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = sg
          ctx.globalAlpha = segment.alpha * 0.5
          ctx.beginPath(); ctx.arc(sx, sy, segment.size * 2, 0, TAU); ctx.fill()
          ctx.globalAlpha = 1

          // Disturb ripple sim
          if (i % 4 === 0 && t > 0.3) {
            ripple.drop(sx, sy, 2, 60)
          }
        }
        ripple.step(); ripple.step()
        ripple.draw(ctx, '#7dd3fc', 0.3)

        // Dragon head — larger glowing orb
        const hx = dragonX(simData.dragonT), hy = dragonY(simData.dragonT)
        const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 30)
        hg.addColorStop(0, '#ffffff')
        hg.addColorStop(0.3, '#22d3ee')
        hg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, 30, 0, TAU); ctx.fill()

        // Water particle spray around dragon
        waterParticles.forEach((p, i) => {
          if (!p.update()) {
            waterParticles[i] = new Particle({
              x: rand(0, w), y: rand(0, h),
              vx: rand(-1, 1), vy: rand(-1, 1),
              life: 1, decay: 0.004, size: rand(2, 6),
              color: `rgba(${randInt(20, 60)},${randInt(150, 220)},255,0.7)`,
              bloom: 0.3, drag: 0.992,
            })
          } else p.draw(ctx)
        })

        drawVignette(ctx, w, h, 'rgba(1,10,30,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 15. SPIRIT STORM — Wind Tornado
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'spirit_storm') {
        const { windStreaks, spiritOrbs, dustParticles } = simData

        ctx.fillStyle = '#020c06'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        simData.noiseOffset += 0.01
        simData.vortexR = Math.min(simData.vortexMaxR, simData.vortexR + 3)
        const vr = simData.vortexR

        // Tornado wind streaks — spiral inward
        windStreaks.forEach(ws => {
          ws.angle -= ws.speed
          ws.r += ws.dr
          if (ws.r <= 5) ws.r = rand(150, 300)
          if (ws.r >= 350) ws.r = 10

          const endAngle = ws.angle + ws.arc
          const r2 = ws.r * 0.85
          ctx.beginPath()
          ctx.moveTo(mx + Math.cos(ws.angle) * ws.r, my + Math.sin(ws.angle) * ws.r)
          ctx.quadraticCurveTo(
            mx + Math.cos((ws.angle + endAngle) / 2) * ((ws.r + r2) / 2),
            my + Math.sin((ws.angle + endAngle) / 2) * ((ws.r + r2) / 2),
            mx + Math.cos(endAngle) * r2, my + Math.sin(endAngle) * r2
          )
          ctx.strokeStyle = ws.color
          ctx.globalAlpha = ws.alpha * (vr / simData.vortexMaxR)
          ctx.lineWidth = ws.width; ctx.stroke(); ctx.globalAlpha = 1
        })

        // Spirit orbs orbiting
        spiritOrbs.forEach((orb, i) => {
          orb.pulse += 0.04
          if (t > 0.5 + i * 0.06) orb.alpha = Math.min(0.9, orb.alpha + 0.015)
          orb.angle -= orb.speed
          const ox = mx + Math.cos(orb.angle) * orb.r
          const oy = my + Math.sin(orb.angle) * orb.r
          const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size * (1 + 0.2 * Math.sin(orb.pulse)))
          og.addColorStop(0, orb.color)
          og.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = og
          ctx.globalAlpha = orb.alpha
          ctx.beginPath(); ctx.arc(ox, oy, orb.size * 1.5, 0, TAU); ctx.fill()
          ctx.globalAlpha = 1
        })

        // Tornado core
        simData.tornadoCore.r = Math.min(40, simData.tornadoCore.r + 1)
        simData.tornadoCore.alpha = Math.min(0.9, simData.tornadoCore.alpha + 0.02)
        const tc = simData.tornadoCore
        if (tc.r > 2) {
          const cg = ctx.createRadialGradient(mx, my, 0, mx, my, tc.r * 3)
          cg.addColorStop(0, `rgba(16,185,129,${tc.alpha})`)
          cg.addColorStop(0.5, `rgba(6,78,59,${tc.alpha * 0.4})`)
          cg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(mx, my, tc.r * 3, 0, TAU); ctx.fill()
        }

        dustParticles.forEach((p, i) => {
          if (!p.update()) {
            dustParticles[i] = new Particle({
              x: rand(0, w), y: rand(0, h),
              vx: rand(-4, 4), vy: rand(-4, 4),
              life: 1, decay: rand(0.005, 0.015),
              size: rand(1, 4),
              color: Math.random() > 0.6 ? '#10b981' : '#064e3b',
              bloom: 0.2, drag: 0.96,
            })
          } else p.draw(ctx)
        })

        drawVignette(ctx, w, h, 'rgba(2,12,6,0.55)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 16. SHADOW GARDEN — Chimera Shadows
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'shadow_garden') {
        const { shadowBlobs, creatures, roots, void: vd } = simData

        ctx.fillStyle = '#020305'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Roots growing
        roots.forEach(root => {
          if (!root.alive) return
          const last = root.pts[root.pts.length - 1]
          if (last.y < my - 80) { root.alive = false; return }
          const nx = last.x + Math.cos(root.angle + rand(-0.3, 0.3)) * root.speed
          const ny = last.y + Math.sin(root.angle + rand(-0.1, 0.1)) * root.speed
          root.pts.push({ x: nx, y: ny })

          ctx.beginPath()
          root.pts.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y)
            else ctx.lineTo(pt.x, pt.y)
          })
          ctx.strokeStyle = '#1e1b4b'
          ctx.lineWidth = root.width * (1 - root.pts.length / 200)
          ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1
        })

        // Shadow blobs expanding
        shadowBlobs.forEach(blob => {
          blob.x += blob.vx; blob.y += blob.vy
          blob.r = Math.min(blob.maxR, blob.r + 0.8)
          blob.alpha = Math.min(0.85, blob.alpha + 0.01)
          const bg = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r)
          bg.addColorStop(0, blob.color.replace(')', `,${blob.alpha})`).replace('hsl', 'hsla'))
          bg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(blob.x, blob.y, blob.r, 0, TAU); ctx.fill()
        })

        // Chimera creature eyes
        creatures.forEach((c, i) => {
          if (t > 0.4 + i * 0.1) c.alpha = Math.min(0.8, c.alpha + 0.015)
          c.phase += c.speed
          const cx = mx + Math.cos(c.phase) * c.r
          const cy = my + Math.sin(c.phase * 0.7) * 60
          if (c.eyes && c.alpha > 0.1) {
            // Yellow eyes
            ctx.globalAlpha = c.alpha
            ctx.fillStyle = '#fbbf24'
            ctx.beginPath(); ctx.ellipse(cx - 8, cy, 5, 3, 0, 0, TAU); ctx.fill()
            ctx.beginPath(); ctx.ellipse(cx + 8, cy, 5, 3, 0, 0, TAU); ctx.fill()
            ctx.fillStyle = '#000000'
            ctx.beginPath(); ctx.ellipse(cx - 8, cy, 2, 3, 0, 0, TAU); ctx.fill()
            ctx.beginPath(); ctx.ellipse(cx + 8, cy, 2, 3, 0, 0, TAU); ctx.fill()
            ctx.globalAlpha = 1
          }
        })

        // Void center
        vd.r = Math.min(vd.maxR, vd.r + 1.5)
        vd.alpha = Math.min(0.7, vd.alpha + 0.01)
        const vg = ctx.createRadialGradient(mx, my, 0, mx, my, vd.r)
        vg.addColorStop(0, `rgba(0,0,0,${vd.alpha * 0.9})`)
        vg.addColorStop(0.6, `rgba(15,12,30,${vd.alpha * 0.5})`)
        vg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(mx, my, vd.r, 0, TAU); ctx.fill()

        drawVignette(ctx, w, h, 'rgba(2,3,5,0.6)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 17. CONSTELLATION — Starlight Network
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'constellation') {
        const { stars, nebula, grid } = simData

        ctx.fillStyle = '#010108'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Nebula glow
        nebula.alpha = Math.min(0.3, nebula.alpha + 0.003)
        if (nebula.alpha > 0) {
          for (let i = 0; i < 4; i++) {
            const nx = mx + rand(-200, 200), ny = my + rand(-150, 150)
            const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 200)
            ng.addColorStop(0, `hsla(${nebula.hue + i * 20}, 70%, 40%, ${nebula.alpha * 0.4})`)
            ng.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(nx, ny, 200, 0, TAU); ctx.fill()
          }
        }

        // Background star field
        if (frameCount % 60 === 0) {
          for (let i = 0; i < 3; i++) {
            particles.push(new Particle({
              x: rand(0, w), y: rand(0, h),
              life: 1, decay: 0.003,
              size: rand(0.5, 1.5),
              color: '#ffffff', alpha: rand(0.3, 0.8),
            }))
          }
        }

        // Constellation connections appearing
        stars.forEach(star => {
          star.alpha = Math.min(1, star.alpha + 0.015)
          star.twinkle += star.twinkleSpeed
          star.connections.forEach(conn => {
            conn.progress = Math.min(1, conn.progress + 0.02)
            conn.alpha = conn.progress * 0.4
            if (conn.progress > 0.01) {
              const tp = conn.progress
              const ex = lerp(star.x, conn.star.x, tp)
              const ey = lerp(star.y, conn.star.y, tp)
              ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(ex, ey)
              ctx.strokeStyle = '#93c5fd'; ctx.globalAlpha = conn.alpha
              ctx.lineWidth = 0.6; ctx.stroke(); ctx.globalAlpha = 1
            }
          })
        })

        // Draw stars with bloom
        stars.forEach(star => {
          const twinkle = 0.7 + 0.3 * Math.sin(star.twinkle)
          // Bloom glow
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * star.bloom * 3)
          sg.addColorStop(0, star.color + 'ff')
          sg.addColorStop(1, star.color + '00')
          ctx.fillStyle = sg; ctx.globalAlpha = star.alpha * 0.4 * twinkle
          ctx.beginPath(); ctx.arc(star.x, star.y, star.size * star.bloom * 3, 0, TAU); ctx.fill()
          // Core
          ctx.fillStyle = star.color; ctx.globalAlpha = star.alpha * twinkle
          ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, TAU); ctx.fill()
          ctx.globalAlpha = 1
        })

        // Occasional shooting star
        if (frameCount % 120 === 0) {
          simData.shootingStars.push(new Particle({
            x: rand(0, w), y: rand(0, h * 0.5),
            vx: rand(5, 12), vy: rand(2, 6),
            life: 1, decay: 0.03,
            size: 2, type: 'spark',
            color: '#ffffff', bloom: 1, trailMax: 20,
          }))
        }
        simData.shootingStars = simData.shootingStars.filter(p => { const alive = p.update(); p.draw(ctx); return alive })

        particles = particles.filter(p => { const alive = p.update(); p.draw(ctx); return alive })
        drawVignette(ctx, w, h, 'rgba(1,1,8,0.5)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 18. TIME RIPPLE — Chrono Disruption
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'time_ripple') {
        const { fragments, ripples } = simData

        ctx.fillStyle = '#0a0600'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        // Ambient time distortion — shifting grid
        simData.warpEffect = (1 + Math.sin(t * 2)) * 0.5
        ctx.save()
        ctx.globalAlpha = 0.06
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 0.5
        for (let i = 0; i < w; i += 40) {
          ctx.beginPath()
          for (let j = 0; j <= h; j += 5) {
            const warp = Math.sin((j * 0.02) + t * 3 + i * 0.01) * 8 * simData.warpEffect
            if (j === 0) ctx.moveTo(i + warp, j)
            else ctx.lineTo(i + warp, j)
          }
          ctx.stroke()
        }
        for (let j = 0; j < h; j += 40) {
          ctx.beginPath()
          for (let i = 0; i <= w; i += 5) {
            const warp = Math.sin((i * 0.02) + t * 2 + j * 0.01) * 8 * simData.warpEffect
            if (i === 0) ctx.moveTo(i, j + warp)
            else ctx.lineTo(i, j + warp)
          }
          ctx.stroke()
        }
        ctx.restore()

        // Ripple rings
        if (frameCount % 25 === 0) {
          ripples.push({ r: 10, alpha: 0.7, speed: 4 })
        }
        simData.ripples = ripples.filter(r => {
          r.r += r.speed; r.alpha -= 0.014
          if (r.alpha <= 0) return false
          ctx.beginPath(); ctx.arc(mx, my, r.r, 0, TAU)
          ctx.strokeStyle = '#f59e0b'; ctx.globalAlpha = r.alpha
          ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1
          return true
        })

        // Clock face
        simData.clockSpeed += simData.clockAccel
        simData.clockRot += simData.clockSpeed
        simData.clockR = Math.min(simData.clockMaxR, simData.clockR + 2.5)
        const cr = simData.clockR, crot = simData.clockRot

        ctx.save()
        ctx.translate(mx, my)

        // Clock glow
        const cg = ctx.createRadialGradient(0, 0, cr * 0.5, 0, 0, cr * 1.5)
        cg.addColorStop(0, 'rgba(245,158,11,0.1)')
        cg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, cr * 1.5, 0, TAU); ctx.fill()

        ctx.rotate(crot)

        // Clock face
        ctx.strokeStyle = 'rgba(245,158,11,0.6)'; ctx.lineWidth = 4
        ctx.beginPath(); ctx.arc(0, 0, cr, 0, TAU); ctx.stroke()
        ctx.strokeStyle = 'rgba(245,158,11,0.25)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(0, 0, cr * 0.85, 0, TAU); ctx.stroke()

        // Hour markers
        for (let i = 0; i < 12; i++) {
          const ha = (i / 12) * TAU
          const hlen = i % 3 === 0 ? cr * 0.15 : cr * 0.08
          ctx.beginPath()
          ctx.moveTo(Math.cos(ha) * (cr - hlen), Math.sin(ha) * (cr - hlen))
          ctx.lineTo(Math.cos(ha) * cr, Math.sin(ha) * cr)
          ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = i % 3 === 0 ? 3 : 1
          ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1
        }

        // Roman numerals ring
        ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#f59e0b'; ctx.globalAlpha = 0.6
        const nums = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']
        nums.forEach((n, i) => {
          const na = (i / 12) * TAU - Math.PI / 2
          ctx.fillText(n, Math.cos(na) * cr * 0.75, Math.sin(na) * cr * 0.75)
        })
        ctx.globalAlpha = 1

        // Clock hands — spinning backward fast
        const hourAngle = -t * 3; const minAngle = -t * 15
        // Hour hand
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(hourAngle) * cr * 0.55, Math.sin(hourAngle) * cr * 0.55); ctx.stroke()
        // Minute hand
        ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(minAngle) * cr * 0.78, Math.sin(minAngle) * cr * 0.78); ctx.stroke()
        // Second hand
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-t * 60) * cr * 0.88, Math.sin(-t * 60) * cr * 0.88); ctx.stroke()

        // Center dot
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill()
        ctx.restore()

        // Time fragments
        fragments.forEach(f => {
          if (t < 0.6) return
          f.alpha = Math.min(0.7, f.alpha + 0.01)
          f.x += f.vx; f.y += f.vy
          f.rotation += f.rotSpeed
          if (f.alpha > 0.05) {
            ctx.save()
            ctx.translate(f.x, f.y); ctx.rotate(f.rotation)
            ctx.globalAlpha = f.alpha * 0.5
            ctx.strokeStyle = f.color; ctx.lineWidth = 1
            if (f.type === 'circle') { ctx.beginPath(); ctx.arc(0, 0, f.size * 0.3, 0, TAU); ctx.stroke() }
            else if (f.type === 'square') { ctx.strokeRect(-f.size * 0.3, -f.size * 0.3, f.size * 0.6, f.size * 0.6) }
            ctx.restore()
          }
        })

        drawVignette(ctx, w, h, 'rgba(10,6,0,0.55)')
      }

      // ══════════════════════════════════════════════════════════════════════
      // 19. FRACTAL — Dimension Fold
      // ══════════════════════════════════════════════════════════════════════
      else if (activeTransition === 'fractal') {
        const { polygons, mandalaRays, fractalParticles } = simData

        ctx.fillStyle = '#050200'
        ctx.fillRect(-w, -h, w * 3, h * 3)

        simData.noiseTime += 0.01

        // Mandala rays
        mandalaRays.forEach(ray => {
          ray.r = Math.min(ray.maxR, ray.r + ray.speed)
          const rx = mx + Math.cos(ray.angle) * ray.r
          const ry = my + Math.sin(ray.angle) * ray.r
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(rx, ry)
          ctx.strokeStyle = '#f97316'; ctx.globalAlpha = ray.alpha * 0.3
          ctx.lineWidth = 0.8; ctx.stroke(); ctx.globalAlpha = 1
        })

        // Nested rotating polygons
        polygons.forEach((poly, pi) => {
          poly.rot += poly.rotSpeed
          // Noise deformation
          const deformAmount = 8 + pi * 3
          ctx.beginPath()
          for (let i = 0; i <= poly.sides; i++) {
            const a = (i / poly.sides) * TAU + poly.rot
            const nv = noise2D(Math.cos(a) * 1.5 + simData.noiseTime + pi, Math.sin(a) * 1.5)
            const r = poly.r + (nv - 0.5) * deformAmount
            const px = mx + Math.cos(a) * r
            const py = my + Math.sin(a) * r
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.strokeStyle = poly.color; ctx.globalAlpha = poly.alpha * 0.8
          ctx.lineWidth = poly.width; ctx.stroke(); ctx.globalAlpha = 1

          // Fill innermost
          if (pi === 0) {
            ctx.fillStyle = poly.color; ctx.globalAlpha = 0.06
            ctx.fill(); ctx.globalAlpha = 1
          }
        })

        // Golden ratio spiral
        simData.goldenSpiral.t += 0.12
        const phi = 1.618
        if (simData.goldenSpiral.t > 0.5) {
          ctx.beginPath()
          for (let st = 0; st <= simData.goldenSpiral.t; st += 0.1) {
            const gr = Math.pow(phi, st / (Math.PI / 2)) * 5
            const spx = mx + Math.cos(st) * gr
            const spy = my + Math.sin(st) * gr
            if (st <= 0.1) ctx.moveTo(spx, spy)
            else ctx.lineTo(spx, spy)
            if (gr > 300) break
          }
          ctx.strokeStyle = '#fbbf24'; ctx.globalAlpha = 0.4
          ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1
        }

        // Orbiting fractal particles
        fractalParticles.forEach((p, i) => {
          if (!p.update()) {
            const a = Math.random() * TAU, r = rand(40, 280)
            fractalParticles[i] = new Particle({
              x: mx + Math.cos(a) * r, y: my + Math.sin(a) * r,
              vx: -Math.sin(a) * rand(0.5, 2), vy: Math.cos(a) * rand(0.5, 2),
              life: 1, decay: rand(0.005, 0.012),
              size: rand(1.5, 4),
              color: `hsl(${rand(20, 60)}, 90%, 60%)`,
              bloom: 0.5, drag: 0.995,
            })
          } else p.draw(ctx)
        })

        // Central glow
        const center = ctx.createRadialGradient(mx, my, 0, mx, my, 60)
        center.addColorStop(0, 'rgba(249,115,22,0.3)')
        center.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = center; ctx.beginPath(); ctx.arc(mx, my, 60, 0, TAU); ctx.fill()

        drawVignette(ctx, w, h, 'rgba(5,2,0,0.5)')
      }

      // ── Default / Fallback ────────────────────────────────────────────────
      else {
        ctx.fillStyle = 'rgba(5,2,10,0.95)'
        ctx.fillRect(0, 0, w, h)
        const dg = ctx.createRadialGradient(mx, my, 0, mx, my, 250)
        dg.addColorStop(0, 'rgba(124,58,237,0.3)')
        dg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(mx, my, 250, 0, TAU); ctx.fill()
      }

      ctx.restore()

      // Copy offscreen to screen with chromatic overlay
      const screenCtx = canvas.getContext('2d')
      screenCtx.clearRect(0, 0, canvas.width, canvas.height)

      const glitch = (Math.sin(t * 35) > 0.82 ? 7 : 2) * (shake.trauma * 2.5 + 0.4)

      screenCtx.save()
      screenCtx.globalAlpha = 0.55
      screenCtx.drawImage(off, -glitch, 0)
      screenCtx.globalAlpha = 0.55
      screenCtx.drawImage(off, glitch, 0)
      screenCtx.globalAlpha = 0.90
      screenCtx.drawImage(off, 0, 0)
      screenCtx.restore()

      // Phase timing
      if (elapsed > 700 && phase !== 'active') setPhase('active')
      if (elapsed > 3000 && phase !== 'leaving') {
        setPhase('leaving')
        onComplete?.()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [activeTransition, onComplete])

  // ── TITLE MAP ─────────────────────────────────────────────────────────────
  const getTitles = () => {
    const map = {
      fire_slash: { ja: 'HINOKAMI KAGURA', en: 'Flame Breathing · Fire Slash' },
      water_calm: { ja: 'DEAD CALM', en: 'Water Breathing · Eleventh Form' },
      grimoire: { ja: 'GRIMOIRE UNLEASHED', en: 'Anti-Magic Spell Awakening' },
      arise: { ja: 'ARISE', en: 'System Alert · Shadow Extraction' },
      shadow_extract: { ja: 'SHADOW MONARCH', en: 'Extraction Protocol Active' },
      rasengan: { ja: 'RASENGAN', en: 'Swirling Chakra Vortex Sphere' },
      chidori: { ja: 'CHIDORI', en: 'Lightning Blade Spark Burst' },
      chidori_brain: { ja: 'NEURAL OVERLOAD', en: 'Chidori Protocol Initiated' },
      tsukuyomi: { ja: 'TSUKUYOMI', en: 'Itachi Mangekyou Illusion Realm' },
      sharingan: { ja: 'SHARINGAN ACTIVE', en: 'Mangekyou Vision Enabled' },
      thunderclap: { ja: 'THUNDERCLAP & FLASH', en: 'Thunder Breathing · Six Fold' },
      hollow_purple: { ja: 'HOLLOW PURPLE', en: 'Gojo Technique · Infinite Convergence' },
      deep_forest: { ja: 'DEEP FOREST', en: 'Wood Style Emergence' },
      evolution: { ja: 'LIMIT BREAK', en: 'Evolution Chamber · Super Saiyan Aura' },
      black_divider: { ja: 'BLACK DIVIDER', en: 'Anti-Magic Great Sword Slash' },
      dismantle: { ja: 'DISMANTLE', en: 'Cursed Technique Slashes' },
      constant_flux: { ja: 'CONSTANT FLUX', en: 'Water Breathing · Dragon Dance' },
      spirit_storm: { ja: 'SPIRIT STORM', en: 'Wind Magic Storm Unleashed' },
      shadow_garden: { ja: 'SHADOW GARDEN', en: 'Chimera Domain Expansion' },
      constellation: { ja: 'CONSTELLATION', en: 'Starlight Network Active' },
      time_ripple: { ja: 'TIME RIVER', en: 'Temporal Ripple Distortion' },
      fractal: { ja: 'KNOWLEDGE FRACTAL', en: 'Geometric Dimension Fold' },
      monarch_domain: { ja: 'MONARCH DOMAIN', en: 'Shadow Monarch Domain Expansion' },
    }
    return map[activeTransition] || { ja: 'DOMAIN EXPANSION', en: 'System Transition Active' }
  }

  const getThemeColor = () => {
    if (['fire_slash', 'black_divider'].includes(activeTransition)) return '#f97316'
    if (['water_calm', 'constant_flux', 'rasengan', 'chidori', 'chidori_brain'].includes(activeTransition)) return '#22d3ee'
    if (['grimoire', 'fractal'].includes(activeTransition)) return '#fbbf24'
    if (['arise', 'shadow_extract', 'hollow_purple', 'shadow_garden', 'monarch_domain'].includes(activeTransition)) return '#a78bfa'
    if (['tsukuyomi', 'sharingan', 'dismantle'].includes(activeTransition)) return '#ef4444'
    if (['spirit_storm', 'deep_forest'].includes(activeTransition)) return '#34d399'
    if (['thunderclap'].includes(activeTransition)) return '#fbbf24'
    if (['constellation'].includes(activeTransition)) return '#e0f2fe'
    if (['time_ripple'].includes(activeTransition)) return '#f59e0b'
    if (['evolution'].includes(activeTransition)) return '#22d3ee'
    return '#ffffff'
  }

  const titles = getTitles()
  const themeColor = getThemeColor()

  return (
    <AnimatePresence>
      {activeTransition && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Scan line overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)',
              mixBlendMode: 'overlay',
            }}
          />

          <div className="relative text-center z-10 px-4 select-none">
            <AnimatePresence mode="wait">
              {phase === 'entering' && (
                <motion.div
                  key="entering"
                  initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="font-mono tracking-[0.5em] text-[11px] uppercase"
                    style={{ color: `${themeColor}99` }}
                  >
                    ▶ System activating...
                  </div>
                </motion.div>
              )}

              {phase === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 40, filter: 'blur(16px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -40, filter: 'blur(16px)' }}
                  transition={{ type: 'spring', stiffness: 110, damping: 13 }}
                >
                  {/* Decorative line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    style={{ background: themeColor, height: 1, marginBottom: 16, opacity: 0.5 }}
                  />

                  {/* Japanese title */}
                  <h2
                    style={{
                      color: themeColor,
                      textShadow: `0 0 30px ${themeColor}cc, 0 0 60px ${themeColor}66, 0 0 100px ${themeColor}33`,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 'clamp(3rem, 10vw, 7rem)',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {titles.ja}
                  </h2>

                  {/* Separator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, justifyContent: 'center' }}>
                    <div style={{ flex: 1, height: '0.5px', background: `${themeColor}40`, maxWidth: 60 }} />
                    <div style={{ color: `${themeColor}80`, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.2em' }}>◆</div>
                    <div style={{ flex: 1, height: '0.5px', background: `${themeColor}40`, maxWidth: 60 }} />
                  </div>

                  {/* English subtitle */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      marginTop: 10,
                    }}
                  >
                    {titles.en}
                  </motion.p>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ background: themeColor, height: 1, marginTop: 16, opacity: 0.5 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}