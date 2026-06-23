'use client'
import { fireFX } from '@/components/InteractionFX'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { AuthProvider } from '@/lib/auth'
import {
  LayoutDashboard, BookOpen, Activity, ListChecks, Target, Heart, NotebookPen,
  Library, BarChart3, Plus, Flame, Trophy, Clock, Brain, Sparkles, Trash2,
  CheckCircle2, Circle, TrendingUp, Calendar, Zap, Award, Search, X, Dumbbell,
  Bot, Upload, FileText, Send, ChevronRight, Layers, BarChart, PieChart as PieIcon,
  Radar, Moon, Droplets, Weight, Star, ArrowRight, Loader2, MessageSquare,
  GraduationCap, Lightbulb, CheckSquare, Map, Timer, TreeDeciduous, Globe,
  User, Waves, Infinity, Compass, Shield, Volume2, VolumeX
} from 'lucide-react'
import {
  AreaChart, Area, BarChart as RBarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  RadarChart, Radar as ReRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// Visualization components
import LivingBackground from '@/components/LivingBackground'
import DataConstellation from '@/components/DataConstellation'
import NeuralNetworkDashboard from '@/components/NeuralNetworkDashboard'
import KnowledgeGalaxy from '@/components/KnowledgeGalaxy'
import GrowthTree from '@/components/GrowthTree'
import EvolutionChamber from '@/components/EvolutionChamber'
import DigitalBrain from '@/components/DigitalBrain'
import TimeRiver from '@/components/TimeRiver'
import KnowledgeFractal from '@/components/KnowledgeFractal'
import PredictiveFuture from '@/components/PredictiveFuture'
import DailyPlanDashboard from '@/components/DailyPlanDashboard'
import PricingPlans from '@/components/PricingPlans'
import LockedFeature from '@/components/LockedFeature'
import { SubscriptionProvider, useSubscription, hasPremiumAccess } from '@/lib/subscription'
import { Crown } from 'lucide-react'
import CinematicOverlay from '@/components/CinematicOverlay'
import GuildChamber from '@/components/GuildChamber'

// ─── Constants ────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Hunter Status', spellName: 'Seer\'s Aura Scan', manaCost: 'Free', school: 'Divination', icon: LayoutDashboard, color: '#22d3ee', desc: 'Main status, stats & CP gauges' },
  { id: 'guilds', label: 'Hunter Guilds', spellName: 'Covenant Summoning', manaCost: '40 MP', school: 'Conjuration', icon: Trophy, color: '#fbbf24', desc: 'Raid lobby chat & rankings leaderboard' },
  { id: 'quiz-revision', label: 'Revision Gate', spellName: 'Chamber of Runes', manaCost: '15 MP', school: 'Evocation', icon: Award, color: '#f59e0b', desc: 'Solve study quizzes & clear mind decay' },
  { id: 'meditate', label: 'Meditation Chamber', spellName: 'Mana Influx Shield', manaCost: '5 MP', school: 'Restoration', icon: Zap, color: '#ec4899', desc: 'Calming breathing to restore Mana & Focus' },
  { id: 'ai-planner', label: 'AI Planner', spellName: 'Grand Grimoire', manaCost: '50 MP', school: 'Conjuration', icon: Bot, color: '#22d3ee', premium: 'ai-planner', desc: 'Generate optimized roadmaps from prompts' },
  { id: 'daily-plan', label: 'Daily Plan', spellName: 'Solar Alignment', manaCost: '10 MP', school: 'Conjuration', icon: Sparkles, color: '#8b5cf6', premium: 'ai-planner', desc: 'Checklist and hourly schedule for today' },
  { id: 'study', label: 'Training logs', spellName: 'Archivist Archive', manaCost: '20 MP', school: 'Evocation', icon: BookOpen, color: '#34d399', desc: 'History of logged study hours & topics' },
  { id: 'habits', label: 'Habits', spellName: 'Chrono Runic Bonds', manaCost: '10 MP', school: 'Evocation', icon: Activity, color: '#f472b6', desc: 'Build consistency and track active streaks' },
  { id: 'tasks', label: 'Quests', spellName: 'Task Extraction Gate', manaCost: '12 MP', school: 'Conjuration', icon: ListChecks, color: '#fbbf24', desc: 'Checklist of general quests & priorities' },
  { id: 'goals', label: 'Milestones', spellName: 'Pinnacle Sigil', manaCost: '30 MP', school: 'Conjuration', icon: Target, color: '#f87171', desc: 'Set and track long-term life objectives' },
  { id: 'health', label: 'Recovery Status', spellName: 'Vitalic Regeneration', manaCost: '5 MP', school: 'Restoration', icon: Heart, color: '#f472b6', desc: 'Monitor sleep, nutrition, water & weight' },
  { id: 'exercise', label: 'Physical training', spellName: 'Kinesis Might', manaCost: '25 MP', school: 'Evocation', icon: Dumbbell, color: '#a78bfa', desc: 'Record exercise workouts, sets, and reps' },
  { id: 'journal', label: 'Journal', spellName: 'Epistolary Soul Bind', manaCost: '8 MP', school: 'Restoration', icon: NotebookPen, color: '#38bdf8', desc: 'Write reflections, wins, and daily lessons' },
  { id: 'knowledge', label: 'Library', spellName: 'Cognitive Cache', manaCost: '15 MP', school: 'Conjuration', icon: Library, color: '#fb923c', desc: 'Catalog read books and confidence levels' },
  { id: 'analytics', label: 'Evaluation Charts', spellName: 'Chart Divination', manaCost: '30 MP', school: 'Divination', icon: BarChart3, color: '#4ade80', premium: 'advanced-analytics', desc: 'Analyze habits, heatmaps, and stats' },
  { id: 'pricing', label: 'Upgrade Plan', spellName: 'Apex Ascension Contract', manaCost: '99 MP', school: 'Conjuration', icon: Crown, color: '#fbbf24', desc: 'Manage subscription plan and payments' },
  { id: 'constellation', label: 'Data Constellation', spellName: 'Astraea Projection', manaCost: '45 MP', school: 'Divination', icon: Star, color: '#fbbf24', premium: 'data-constellation', desc: 'Interactive 3D graph of all study logs' },
  { id: 'neural-network', label: 'Neural Network', spellName: 'Synaptic Linkage', manaCost: '50 MP', school: 'Conjuration', icon: Brain, color: '#8b5cf6', premium: 'neural-network', desc: 'Synaptic map of linked tasks & habits' },
  { id: 'knowledge-galaxy', label: 'Knowledge Galaxy', spellName: 'Nebula Constellation', manaCost: '60 MP', school: 'Divination', icon: Globe, color: '#22d3ee', premium: 'knowledge-galaxy', desc: '3D floating nodes of logged topics' },
  { id: 'growth-tree', label: 'Growth Tree', spellName: 'Yggdrasil Rootage', manaCost: '40 MP', school: 'Conjuration', icon: TreeDeciduous, color: '#34d399', premium: 'growth-tree', desc: 'Watch tree grow as goals are achieved' },
  { id: 'evolution', label: 'Evolution Chamber', spellName: 'Ascendant Genesis', manaCost: '75 MP', school: 'Conjuration', icon: User, color: '#f472b6', premium: 'evolution', desc: 'Gamified upgrades linked to quest completions' },
  { id: 'digital-brain', label: 'Digital Brain', spellName: 'Cortex Matrix Overload', manaCost: '70 MP', school: 'Divination', icon: Brain, color: '#a78bfa', premium: 'digital-brain', desc: 'Active recall memory nodes visualizer' },
  { id: 'time-river', label: 'Time River', spellName: 'Chrono-Flux Stream', manaCost: '55 MP', school: 'Conjuration', icon: Waves, color: '#38bdf8', premium: 'time-river', desc: 'Weekly and monthly time stream breakdown' },
  { id: 'knowledge-fractal', label: 'Knowledge Fractal', spellName: 'Infinite Recur Sigil', manaCost: '80 MP', school: 'Conjuration', icon: Infinity, color: '#fbbf24', premium: 'knowledge-fractal', desc: 'Fractal geometry representing learning depth' },
  { id: 'predictive-future', label: 'Predictive Future', spellName: 'Temporal Foresight', manaCost: '90 MP', school: 'Divination', icon: Compass, color: '#4ade80', premium: 'predictive-future', desc: 'Forecast consistency and focus trends' },
  { id: 'settings', label: 'Settings Console', spellName: 'System Calibration', manaCost: 'Free', school: 'Restoration', icon: User, color: '#a78bfa', desc: 'Manage user profiles, health specs, and email report triggers' }
]

const CHART_COLORS = ['#8b5cf6', '#22d3ee', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8']

const NAV_CATEGORIES = [
  {
    title: "Core System",
    color: "#22d3ee",
    ids: ['dashboard', 'daily-plan', 'guilds']
  },
  {
    title: "Training Chamber",
    color: "#a78bfa",
    ids: ['exercise', 'meditate', 'quiz-revision', 'health']
  },
  {
    title: "Quests & Habits",
    color: "#fbbf24",
    ids: ['tasks', 'habits', 'goals']
  },
  {
    title: "Intellect & Reflection",
    color: "#38bdf8",
    ids: ['journal', 'knowledge', 'study']
  },
  {
    title: "Arcane Systems (Premium)",
    color: "#8b5cf6",
    ids: [
      'ai-planner', 'analytics', 'constellation', 'neural-network', 
      'knowledge-galaxy', 'growth-tree', 'evolution', 
      'digital-brain', 'time-river', 'knowledge-fractal', 
      'predictive-future'
    ]
  },
  {
    title: "System Config",
    color: "#94a3b8",
    ids: ['settings', 'pricing']
  }
]

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

const api = {
  get: (p, _t) => {
    const token = _t || getToken()
    return fetch(`/api/${p}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  },
  post: (p, b, _t) => {
    const token = _t || getToken()
    return fetch(`/api/${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }, body: JSON.stringify(b) })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  },
  patch: (p, b, _t) => {
    const token = _t || getToken()
    return fetch(`/api/${p}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }, body: JSON.stringify(b) })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  },
  del: (p, _t) => {
    const token = _t || getToken()
    return fetch(`/api/${p}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  },
}


const fmtDate = (d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })
const todayISO = () => {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const localDate = new Date(d.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 10)
}

function greet() {
  const h = new Date().getHours()
  if (h < 5) return 'Night Owl 🦉'
  if (h < 12) return 'Morning ☀️'
  if (h < 17) return 'Afternoon ⚡'
  if (h < 21) return 'Evening 🌆'
  return 'Night 🌙'
}

// ─── Motion Variants ──────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } } }

// ─── Tooltip Style ────────────────────────────────────────
const TT_STYLE = { background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, color: '#f8fafc', fontSize: 12 }

// ─── Premium ScoreRing ────────────────────────────────────
function ScoreRing({ label, value, color = '#8b5cf6', size = 140 }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / 40
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplayed(value); clearInterval(timer) }
      else setDisplayed(Math.round(start))
    }, 25)
    return () => clearInterval(timer)
  }, [value])

  const data = [{ name: label, value: displayed, fill: color }]
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative ring-glow" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <defs>
              <linearGradient id={`rg-${label}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={30} max={100}
              fill={`url(#rg-${label})`} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-black tracking-tight" style={{ color }}>{displayed}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Glass Stat Card ──────────────────────────────────────
function StatCard({ icon: Icon, label, value, hint, color = '#8b5cf6' }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="glass-card stat-card-shine rounded-2xl p-5 relative overflow-hidden group cursor-default">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-35"
          style={{ background: color }} />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{label}</p>
              <p className="text-3xl font-black tracking-tight text-white">{value}</p>
              {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section Header ───────────────────────────────────────
function SectionHeader({ title, desc, action, icon: Icon }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight aurora-text">{title}</h1>
        {desc && <p className="text-sm text-white/40 mt-2">{desc}</p>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

// ─── Field Helper ─────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/50 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  )
}

function Stat({ label, value, color = '#8b5cf6' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className="font-bold text-sm" style={{ color }}>{value}</span>
    </div>
  )
}

// ─── Heatmap ──────────────────────────────────────────────
function Heatmap({ data }) {
  const cells = data || []
  const max = Math.max(1, ...cells.map(c => c.value))
  const color = (v) => {
    if (v <= 0) return 'rgba(255,255,255,0.04)'
    const r = v / max
    if (r < 0.25) return 'rgba(139,92,246,0.2)'
    if (r < 0.5) return 'rgba(139,92,246,0.45)'
    if (r < 0.75) return 'rgba(139,92,246,0.7)'
    return '#8b5cf6'
  }
  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, w) => (
        <div key={w} className="flex flex-col gap-1">
          {cells.slice(w * 7, w * 7 + 7).map((c, i) => (
            <div key={i} title={`${c.date}: ${c.value}h`}
              className="heatmap-cell w-3.5 h-3.5 rounded-sm transition-all"
              style={{ background: color(c.value), boxShadow: c.value > 0 ? `0 0 4px rgba(139,92,246,${c.value / max * 0.6})` : 'none' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Premium Button ───────────────────────────────────────
function GlowButton({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const base = 'inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const vars = {
    primary: 'fab text-white',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}>
      {children}
    </button>
  )
}

// ══════════════════════════════════════════════════════════
// DASHBOARD (HUNTER STATUS WINDOW)
// ══════════════════════════════════════════════════════════
function Dashboard({ stats, refresh, go }) {
  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-white/40 text-sm">Synchronizing with Hunter Association Database…</p>
      </div>
    </div>
  )
  const s = stats.scores
  const g = stats.gameStats || { level: 1, xp: 0, currentXp: 0, xpNeeded: 500, rank: 'E', rankColor: '#94a3b8', combatPower: 150, mindSharpness: 100 }
  
  const xpPercent = Math.min(100, Math.round((g.currentXp / g.xpNeeded) * 100))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Solo Leveling Hunter Status Window Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl hunter-status-card p-6 md:p-8 border border-cyan-500/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px]"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px]"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)' }} />
        </div>
        
        <div className="relative flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded border animate-pulse"
                style={{ borderColor: g.rankColor, color: g.rankColor, textShadow: `0 0 6px ${g.rankColor}` }}>
                {g.rank}-Rank Hunter
              </span>
              <span className="text-xs text-white/40">Registered: 1 Year Target Level</span>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-baseline gap-2">
                LEVEL <span className="text-cyan-400 font-mono hunter-title-glow">{g.level}</span>
              </h1>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-white/40 text-xs uppercase tracking-widest leading-none">Status: Active Dual Dungeon Survivor</p>
                {g.fatigueActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/5 text-[9px] text-amber-400 font-mono uppercase tracking-wider w-fit mt-1.5 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span>Fatigue Active: Quest targets scaled to 70% • XP gains: +25% Endurance boost</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* XP progress bar */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-cyan-400/80">EXPERIENCE POINTS (XP)</span>
                <span className="text-white/60">{g.currentXp} / {g.xpNeeded} XP ({xpPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${xpPercent}%` }} 
                  transition={{ duration: 1 }} 
                  className="h-full rounded-full" 
                  style={{ background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)', boxShadow: '0 0 10px rgba(34,211,238,0.5)' }} 
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap gap-2">
              <GlowButton onClick={() => go('quiz-revision')} variant="primary" className="border border-cyan-400/30">
                <Award className="w-4 h-4 text-cyan-300" /> Enter Revision Gate
              </GlowButton>
              <GlowButton onClick={() => go('meditate')} variant="ghost">
                <Zap className="w-4 h-4 text-pink-400" /> Mana Meditation
              </GlowButton>
              <GlowButton onClick={() => go('ai-planner')} variant="ghost">
                <Bot className="w-4 h-4 text-violet-400" /> Plan Quest
              </GlowButton>
            </div>
          </div>

          {/* Holographic Hunter Status Panel */}
          <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 w-full md:w-80 shrink-0 relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 18, 36, 0.9) 0%, rgba(2, 6, 12, 0.95) 100%)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(34, 211, 238, 0.1)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />

            {/* Title & Class */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] tracking-widest text-cyan-400 font-mono uppercase">HUNTER STATUS WINDOW</span>
              <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase animate-pulse">{g.hunterClass || 'Shadow Monarch'}</span>
            </div>

            {/* Combat Power & Level Display */}
            <div className="text-center py-2 bg-cyan-950/20 border border-cyan-500/10 rounded-xl mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none animate-pulse" />
              <p className="text-[9px] tracking-widest text-cyan-300/60 uppercase font-mono">COMBAT POWER (CP)</p>
              <h2 className="text-4xl font-black text-white mt-1 hunter-title-glow tracking-tighter filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                {g.combatPower.toLocaleString()}
              </h2>
            </div>

            {/* Streak Gauge Indicator */}
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-cyan-500/20 pb-2.5 mb-3">
              <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> SYSTEM STREAK
              </span>
              <span className="text-amber-400 font-black text-xs px-2 py-0.5 rounded border border-amber-500/30 shadow-[0_0_6px_rgba(245,158,11,0.2)]">
                {stats.streak} DAYS ACTIVE
              </span>
            </div>

            {/* Attributes Grid */}
            <div className="space-y-3.5">
              <span className="text-[8px] font-black tracking-widest text-white/40 uppercase block mb-1 font-mono">PRIMARY ATTRIBUTES</span>
              
              {[
                { name: 'STR [Strength]', val: g.attributes?.strength || 10, max: 150, color: 'from-orange-500 to-red-600', glow: 'rgba(239,68,68,0.3)', desc: 'Increases exercise volume & quest capacity' },
                { name: 'AGI [Agility]', val: g.attributes?.agility || 10, max: 150, color: 'from-amber-400 to-yellow-500', glow: 'rgba(245,158,11,0.3)', desc: 'Boosts habit consistency & streak counts' },
                { name: 'INT [Intelligence]', val: g.attributes?.intelligence || 10, max: 150, color: 'from-cyan-400 to-violet-600', glow: 'rgba(139,92,246,0.3)', desc: 'Derived from study hours & library archives' },
                { name: 'VIT [Vitality]', val: g.attributes?.vitality || 10, max: 150, color: 'from-emerald-400 to-teal-500', glow: 'rgba(52,211,153,0.3)', desc: 'Calculated from sleep, water & health indicators' },
                { name: 'SEN [Sense]', val: g.attributes?.sense || 10, max: 150, color: 'from-pink-500 to-fuchsia-600', glow: 'rgba(217,70,239,0.3)', desc: 'Enhanced by meditation focus & journaling reflections' }
              ].map(attr => {
                const pct = Math.min(100, Math.round((attr.val / attr.max) * 100))
                return (
                  <div key={attr.name} className="group relative space-y-1 cursor-help">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-white/70 group-hover:text-cyan-300 transition-colors">{attr.name}</span>
                      <span className="text-white font-bold">{attr.val} <span className="text-[8px] text-white/30 font-normal">/ {attr.max}</span></span>
                    </div>
                    
                    {/* Glowing Progress Bar */}
                    <div className="w-full h-2 bg-black/60 rounded-full border border-white/5 overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${pct}%` }} 
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${attr.color}`}
                        style={{ boxShadow: `0 0 8px ${attr.glow}` }}
                      />
                    </div>

                    {/* Popover Hover Hint */}
                    <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-50 bg-black/95 border border-cyan-500/40 text-[9px] text-cyan-200/90 px-2.5 py-1.5 rounded-lg max-w-[220px] font-mono shadow-2xl backdrop-blur-md">
                      <p className="font-bold text-white mb-0.5">{attr.desc}</p>
                      <p className="text-[8px] text-white/40">Increases as you log more related activities in the dashboard.</p>
                    </div>
                  </div>
                )
              })}

              <Separator className="my-3 bg-white/10" />

              {/* Status Pools (Mana & Mind) */}
              <div className="space-y-2 text-[10px] font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400/80 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> FOCUS (MIND)
                  </span>
                  <span className={g.mindSharpness > 60 ? "text-cyan-400 font-bold" : "text-rose-400 font-bold animate-pulse"}>
                    {g.mindSharpness}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden relative">
                  <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" style={{ width: `${g.mindSharpness}%` }} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-pink-400/80 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> MANA STREAMS
                  </span>
                  <span className="text-pink-400 font-bold">{g.totalMeditationMinutes || 0} min</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden relative">
                  <div className="h-full bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899]" style={{ width: `${Math.min(100, (g.totalMeditationMinutes || 0) * 2)}%` }} />
                </div>

                <div className="flex justify-between text-[9px] text-white/40 pt-1.5">
                  <span>STREAK BOOST:</span>
                  <span className="text-amber-400 font-bold">x{(1 + (stats.streak * 0.05)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid of stats - All Features */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Today Training" value={`${stats.todayStudy}h`} hint="Hours logged today" color="#22d3ee" />
        <StatCard icon={CheckCircle2} label="Daily Quests" value={`${stats.todayTasks}/${stats.totalTasksToday}`} hint="Quests completed" color="#34d399" />
        <StatCard icon={Activity} label="Habits Linked" value={`${stats.todayHabits}/${stats.totalHabits}`} hint="Daily actions aligned" color="#f472b6" />
        <StatCard icon={Flame} label="Continuous Streak" value={`${stats.streak}d`} hint="Consecutive login streak" color="#fbbf24" />
        <StatCard icon={Dumbbell} label="Exercise" value={`${stats.todayExercise || 0}min`} hint="Physical training today" color="#a78bfa" />
        <StatCard icon={Heart} label="Health Score" value={`${stats.healthScore || 0}%`} hint="Overall health metrics" color="#f472b6" />
        <StatCard icon={Award} label="Quiz Score" value={`${stats.quizScore || 0}/20`} hint="Latest quiz result" color="#f59e0b" />
        <StatCard icon={BookOpen} label="Books Read" value={`${stats.booksRead || 0}`} hint="Library archives count" color="#fb923c" />
      </motion.div>

      {/* Runic scores and Evaluation */}
      <motion.div variants={stagger} className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white/90 text-sm">Weekly Combat Growth Graph</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.weeklyStudy}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <Tooltip contentStyle={TT_STYLE} />
              <Area type="monotone" dataKey="hours" stroke="#22d3ee" fill="url(#g1)" strokeWidth={2} dot={{ fill: '#22d3ee', r: 4 }} name="Training hrs" />
              <Line type="monotone" dataKey="tasks" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="Quests Done" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-violet-400" />
            <h2 className="font-bold text-white/90 text-sm">Subjects</h2>
          </div>
          {stats.subjectData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Brain className="w-10 h-10 text-white/10 mb-2" />
              <p className="text-xs text-white/30">Log study sessions to see breakdown</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={stats.subjectData.slice(0, 6)} dataKey="hours" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                  {stats.subjectData.slice(0, 6).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </motion.div>

      {/* Heatmap + Activity */}
      <motion.div variants={stagger} className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h2 className="font-bold text-white/90 text-sm">Study Heatmap — Last 90 Days</h2>
          </div>
          <Heatmap data={stats.heatmap} />
          <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
            <span>Less</span>
            {['rgba(255,255,255,0.04)', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.45)', 'rgba(139,92,246,0.7)', '#8b5cf6'].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span>More</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-violet-400" />
            <h2 className="font-bold text-white/90 text-sm">Recent Activity</h2>
          </div>
          {stats.activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Zap className="w-8 h-8 text-white/10 mb-2" />
              <p className="text-xs text-white/30">No activity yet. Start tracking!</p>
            </div>
          ) : (
            <ScrollArea className="h-[240px] pr-2">
              <ul className="space-y-3">
                {stats.activities.map((a, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 text-sm">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: a.type === 'study' ? '#22d3ee' : a.type === 'task' ? '#34d399' : '#f472b6', boxShadow: `0 0 6px ${a.type === 'study' ? '#22d3ee' : a.type === 'task' ? '#34d399' : '#f472b6'}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 truncate text-xs">{a.label}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{new Date(a.time).toLocaleString()}</p>
                    </div>
                    {a.meta && <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{a.meta}</span>}
                  </motion.li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </motion.div>
      </motion.div>

      {/* Feature Overview Cards */}
      <motion.div variants={stagger} className="grid lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => go('goals')}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold text-white/80">Milestones</h3>
          </div>
          <p className="text-2xl font-black text-white">{stats.activeGoals || 0}</p>
          <p className="text-[10px] text-white/40 mt-1">Active goals tracking</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => go('journal')}>
          <div className="flex items-center gap-2 mb-2">
            <NotebookPen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white/80">Journal</h3>
          </div>
          <p className="text-2xl font-black text-white">{stats.journalEntries || 0}</p>
          <p className="text-[10px] text-white/40 mt-1">Reflections logged</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => go('meditate')}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs font-bold text-white/80">Meditation</h3>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalMeditationMinutes || 0}m</p>
          <p className="text-[10px] text-white/40 mt-1">Total meditation time</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => go('quiz-revision')}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white/80">Quizzes</h3>
          </div>
          <p className="text-2xl font-black text-white">{stats.quizCount || 0}</p>
          <p className="text-[10px] text-white/40 mt-1">Quizzes completed</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// AI STUDY PLANNER
// ══════════════════════════════════════════════════════════
const PLAN_STAGES = ['Uploading', 'Extracting Text', 'AI Analysis', 'Plan Ready']

function PremiumWrapper({ feature, children, onUpgrade }) {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (!hasPremiumAccess(subscription, feature)) {
    return <LockedFeature featureName={feature} onUpgrade={onUpgrade} />
  }

  return children
}

function AiPlanner() {
  const [stage, setStage] = useState(-1)    // -1=idle, 0-2=processing, 3=done
  const [plan, setPlan] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [chatMsg, setChatMsg] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('plan')
  const fileRef = useRef(null)

  const processFile = useCallback(async (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      return toast.error('Please upload a PDF, DOCX, or TXT file')
    }
    setFileName(file.name)
    setPlan(null)
    setChatLog([])
    setStage(0)

    await new Promise(r => setTimeout(r, 600))
    setStage(1)
    await new Promise(r => setTimeout(r, 800))
    setStage(2)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/ai/study-plan', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed')
      setStage(3)
      setPlan(data.plan)
      toast.success('Study plan generated! 🎉')
    } catch (e) {
      toast.error(e.message || 'Failed to generate plan')
      setStage(-1)
    }
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const sendChat = async () => {
    if (!chatMsg.trim() || !plan) return
    const msg = chatMsg.trim()
    setChatMsg('')
    setChatLog(l => [...l, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const res = await api.post('ai/chat', { message: msg, context: { title: plan.title, topics: plan.topics?.map(t => t.name) } })
      setChatLog(l => [...l, { role: 'ai', content: res.reply }])
    } catch {
      setChatLog(l => [...l, { role: 'ai', content: 'Sorry, I could not process that. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="AI Study Planner" desc="Upload any PDF or DOCX — get an intelligent study plan with charts and a personalized schedule" icon={Bot} />

      {stage === -1 && (
        <motion.div variants={fadeUp}
          className={`drop-zone rounded-3xl p-12 text-center cursor-pointer ${dragOver ? 'active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
            onChange={e => e.target.files[0] && processFile(e.target.files[0])} />
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Upload className="w-9 h-9 text-violet-400" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Drop your document here</h3>
          <p className="text-white/40 text-sm mb-4">Supports PDF, DOCX, DOC, TXT</p>
          <GlowButton><FileText className="w-4 h-4" /> Browse Files</GlowButton>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {['Smart Study Plan', 'Topic Graphs', 'AI Chat Coach'].map((f, i) => (
              <div key={f} className="text-center">
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ background: `${CHART_COLORS[i]}15`, border: `1px solid ${CHART_COLORS[i]}30` }}>
                  {[<GraduationCap key="g" className="w-4 h-4" style={{ color: CHART_COLORS[0] }} />,
                  <BarChart key="b" className="w-4 h-4" style={{ color: CHART_COLORS[1] }} />,
                  <MessageSquare key="m" className="w-4 h-4" style={{ color: CHART_COLORS[2] }} />][i]}
                </div>
                <p className="text-xs text-white/40">{f}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {stage >= 0 && stage < 3 && (
        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            {PLAN_STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${i < stage ? 'step-done text-white' : i === stage ? 'step-active text-white' : 'step-idle text-white/30'}`}>
                    {i < stage ? <CheckCircle2 className="w-4 h-4" /> : i === stage ? <Loader2 className="w-4 h-4 animate-spin" /> : i + 1}
                  </div>
                  <span className={`text-[10px] whitespace-nowrap ${i <= stage ? 'text-white/70' : 'text-white/20'}`}>{s}</span>
                </div>
                {i < PLAN_STAGES.length - 1 && (
                  <div className={`w-12 h-px mb-4 transition-all duration-700 ${i < stage ? 'bg-violet-400' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-white/50 text-sm">{fileName && `Processing "${fileName}"…`}</div>
          <div className="mt-4 text-xs text-white/25">AI is reading and analyzing your document</div>
        </motion.div>
      )}

      {stage === 3 && plan && (
        <motion.div variants={stagger} className="space-y-6">
          {/* Header Card */}
          <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-xs text-violet-400 font-medium uppercase tracking-wider">AI-Generated Plan</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{plan.title}</h2>
                <p className="text-white/50 text-sm max-w-2xl leading-relaxed">{plan.summary}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}>
                    {plan.totalEstimatedHours}h Total
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium capitalize" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                    {plan.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {plan.weeklySchedule?.length} Weeks
                  </span>
                </div>
              </div>
              <GlowButton onClick={() => { setStage(-1); setPlan(null); setFileName('') }} variant="ghost" size="sm">
                <Upload className="w-3 h-3" /> New File
              </GlowButton>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp}>
            <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'plan', label: 'Study Plan', icon: Map },
                { id: 'charts', label: 'Analytics', icon: BarChart3 },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'chat', label: 'AI Coach', icon: MessageSquare },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300
                    ${activeTab === t.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                  style={activeTab === t.id ? { background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 15px rgba(139,92,246,0.15)' } : {}}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* PLAN TAB */}
              {activeTab === 'plan' && (
                <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.topics?.map((topic, i) => (
                      <motion.div key={topic.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="glass-card rounded-2xl p-5 group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}20`, color: CHART_COLORS[i % CHART_COLORS.length], border: `1px solid ${CHART_COLORS[i % CHART_COLORS.length]}30` }}>
                            {i + 1}
                          </div>
                          <div className="flex gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] capitalize"
                              style={{
                                background: topic.difficulty === 'hard' ? 'rgba(248,113,113,0.1)' : topic.difficulty === 'medium' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
                                color: topic.difficulty === 'hard' ? '#f87171' : topic.difficulty === 'medium' ? '#fbbf24' : '#34d399'
                              }}>
                              {topic.difficulty}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">{topic.name}</h3>
                        <p className="text-white/40 text-xs leading-relaxed mb-3">{topic.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-white/30 mb-3">
                          <Clock className="w-3 h-3" /> {topic.estimatedHours}h estimated
                        </div>
                        {topic.keyPoints?.length > 0 && (
                          <div className="space-y-1">
                            {topic.keyPoints.slice(0, 3).map((pt, j) => (
                              <div key={j} className="flex items-start gap-2 text-xs text-white/50">
                                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                {pt}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {plan.studyTips?.length > 0 && (
                    <div className="glass-card rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <h3 className="font-bold text-white text-sm">Study Tips</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {plan.studyTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-white/60 p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)' }}>
                            <Star className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" /> {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* CHARTS TAB */}
              {activeTab === 'charts' && (
                <motion.div key="charts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-4">
                  {/* Radar */}
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Radar className="w-4 h-4 text-violet-400" />
                      <h3 className="font-bold text-white text-sm">Learning Profile</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={plan.radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} />
                        <ReRadar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                        <Tooltip contentStyle={TT_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie */}
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <PieIcon className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-bold text-white text-sm">Time Allocation</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={plan.timeAllocation} dataKey="hours" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} strokeWidth={0}>
                          {plan.timeAllocation?.map((t, i) => <Cell key={i} fill={t.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={TT_STYLE} formatter={(v) => [`${v}h`]} />
                        <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar hours per topic */}
                  <div className="md:col-span-2 glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-white text-sm">Hours per Topic</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <RBarChart data={plan.topics?.map(t => ({ name: t.name.length > 18 ? t.name.slice(0, 16) + '…' : t.name, hours: t.estimatedHours }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                        <Tooltip contentStyle={TT_STYLE} />
                        <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                          {plan.topics?.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </RBarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* SCHEDULE TAB */}
              {activeTab === 'schedule' && (
                <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  {plan.weeklySchedule?.map((week, i) => (
                    <motion.div key={week.week} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass-card rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <div className="pl-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}20`, color: CHART_COLORS[i % CHART_COLORS.length] }}>
                              Week {week.week}
                            </span>
                            <span className="text-xs text-white/30">{week.dailyHours}h/day</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/30">
                            <Timer className="w-3 h-3" />
                            {(week.topics?.length || 0)} topics
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">{week.focus}</h3>
                        {week.milestone && (
                          <div className="flex items-start gap-2 mt-2">
                            <CheckSquare className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-white/50 leading-relaxed">{week.milestone}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {plan.assessmentMilestones?.length > 0 && (
                    <div className="glass-card rounded-2xl p-5 mt-4" style={{ border: '1px solid rgba(52,211,153,0.2)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-white text-sm">Assessment Milestones</h3>
                      </div>
                      <div className="space-y-2">
                        {plan.assessmentMilestones.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl overflow-hidden" style={{ height: 520 }}>
                  <div className="p-4 border-b border-white/5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                      <Bot className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">AI Study Coach</p>
                      <p className="text-[10px] text-white/30">Ask anything about your study plan</p>
                    </div>
                  </div>
                  <ScrollArea className="h-[380px] p-4">
                    {chatLog.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <Bot className="w-12 h-12 text-white/10 mb-3" />
                        <p className="text-white/30 text-sm">Ask me about "{plan.title}"</p>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                          {['What should I study first?', 'How many hours per day?', 'Give me a quiz question'].map(q => (
                            <button key={q} onClick={() => { setChatMsg(q); setTimeout(() => document.getElementById('chat-input')?.focus(), 100) }}
                              className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      {chatLog.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'text-white' : 'text-white/80 ai-response'}`}
                            style={m.role === 'user'
                              ? { background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.4)' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex gap-1">
                              {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-white/5 flex gap-2">
                    <input id="chat-input" value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                      placeholder="Ask your AI coach…"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                      style={{ caretColor: '#8b5cf6' }} />
                    <button onClick={sendChat} disabled={!chatMsg.trim() || chatLoading} className="p-2 rounded-lg transition-all disabled:opacity-40"
                      style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <Send className="w-4 h-4 text-violet-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// STUDY TRACKER
// ══════════════════════════════════════════════════════════
function StudyTracker({ refresh }) {
  const [logs, setLogs] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ subject: '', topic: '', subtopic: '', date: todayISO(), hours: 1, difficulty: 'medium', understanding: 3, notes: '', resources: '', revision: false })
  
  const load = () => api.get('study-logs').then(setLogs)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.subject) return toast.error('Subject required')
    if (editingId) {
      await api.patch(`study-logs/${editingId}`, form)
      toast.success('Session updated ✓')
    } else {
      await api.post('study-logs', form)
      toast.success('Session logged ✓')
    }
    setOpen(false)
    setEditingId(null)
    setForm({ subject: '', topic: '', subtopic: '', date: todayISO(), hours: 1, difficulty: 'medium', understanding: 3, notes: '', resources: '', revision: false })
    load(); refresh()
  }

  const startEdit = (l) => {
    setEditingId(l.id)
    setForm({
      subject: l.subject,
      topic: l.topic || '',
      subtopic: l.subtopic || '',
      date: l.date ? l.date.slice(0, 10) : todayISO(),
      hours: l.hours,
      difficulty: l.difficulty || 'medium',
      understanding: l.understanding || 3,
      notes: l.notes || '',
      resources: l.resources || '',
      revision: !!l.revision
    })
    setOpen(true)
  }

  const del = async (id) => { await api.del(`study-logs/${id}`); load(); refresh() }

  const bySubject = useMemo(() => {
    const m = {}
    logs.forEach(l => { m[l.subject] = (m[l.subject] || 0) + Number(l.hours || 0) })
    return Object.entries(m).map(([name, hours]) => ({ name, hours: +hours.toFixed(2) })).sort((a, b) => b.hours - a.hours)
  }, [logs])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Study Tracker" desc="Log every session. Analyze your learning patterns." action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm({ subject: '', topic: '', subtopic: '', date: todayISO(), hours: 1, difficulty: 'medium', understanding: 3, notes: '', resources: '', revision: false }) } }}>
          <DialogTrigger asChild>
            <GlowButton onClick={() => { setEditingId(null); setForm({ subject: '', topic: '', subtopic: '', date: todayISO(), hours: 1, difficulty: 'medium', understanding: 3, notes: '', resources: '', revision: false }) }}><Plus className="w-4 h-4" /> New Session</GlowButton>
          </DialogTrigger>
          <DialogContent className="max-w-lg" style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(40px)' }}>
            <DialogHeader><DialogTitle className="aurora-text">{editingId ? 'Edit Study Session' : 'Log Study Session'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Subject *"><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" /></Field>
              <Field label="Topic"><Input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Calculus" /></Field>
              <Field label="Subtopic"><Input value={form.subtopic} onChange={e => setForm({ ...form, subtopic: e.target.value })} placeholder="Integration" /></Field>
              <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Hours"><Input type="number" step="0.25" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} /></Field>
              <Field label="Difficulty">
                <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label={`Understanding (${form.understanding}/5)`}>
                <Input type="range" min="1" max="5" value={form.understanding} onChange={e => setForm({ ...form, understanding: Number(e.target.value) })} className="accent-violet-500" />
              </Field>
              <Field label="Resources"><Input value={form.resources} onChange={e => setForm({ ...form, resources: e.target.value })} placeholder="Book, video…" /></Field>
              <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Key insights…" /></Field></div>
            </div>
            <DialogFooter><GlowButton onClick={submit}>{editingId ? 'Update' : 'Save Session'}</GlowButton></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <motion.div variants={stagger} className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4">Hours by Subject</h3>
          {bySubject.length === 0 ? <div className="flex items-center justify-center h-40 text-white/25 text-sm">No sessions logged yet</div> :
            <ResponsiveContainer width="100%" height={260}>
              <RBarChart data={bySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {bySubject.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </RBarChart>
            </ResponsiveContainer>}
        </motion.div>
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 space-y-1">
          <h3 className="text-sm font-bold text-white/80 mb-3">Quick Stats</h3>
          <Stat label="Total Sessions" value={logs.length} color="#8b5cf6" />
          <Stat label="Total Hours" value={logs.reduce((a, b) => a + Number(b.hours || 0), 0).toFixed(1)} color="#22d3ee" />
          <Stat label="Unique Subjects" value={bySubject.length} color="#34d399" />
          <Stat label="Need Revision" value={logs.filter(l => l.revision).length} color="#fbbf24" />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-bold text-white/80">Recent Sessions</h3>
        </div>
        {logs.length === 0 ? (
          <div className="p-12 text-center text-white/25 text-sm">Click "New Session" to start tracking</div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.slice(0, 20).map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="p-4 flex items-start justify-between gap-3 group hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{l.subject}</span>
                    {l.topic && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{l.topic}</span>}
                    <span className="px-2 py-0.5 rounded-full text-[10px] border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>{l.difficulty}</span>
                    <span className="text-[10px] text-white/25">• {fmtDate(l.date)}</span>
                  </div>
                  {l.notes && <p className="text-xs text-white/35 mt-1 line-clamp-1">{l.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-lg font-bold mr-2" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>{l.hours}h</span>
                  <button onClick={() => startEdit(l)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                    <NotebookPen className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => del(l.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// HABITS
// ══════════════════════════════════════════════════════════
function Habits({ refresh }) {
  const [habits, setHabits] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '' })

  const loadHabits = async () => {
    try {
      const data = await api.get('habits')
      setHabits(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load habits:', e)
      setHabits([])
    }
  }

  useEffect(() => {
    loadHabits()
  }, [])

  const createHabit = async () => {
    if (!form.name.trim()) return
    try {
      await api.post('habits', { name: form.name, target: 'daily' })
      setForm({ name: '' })
      setOpen(false)
      loadHabits()
      refresh()
      toast.success('Habit created!')
    } catch (e) {
      toast.error('Failed to create habit')
    }
  }

  const toggleHabit = async (id) => {
    try {
      await api.post(`habits/${id}/toggle`, {})
      loadHabits()
      refresh()
    } catch (e) {
      toast.error('Failed to toggle habit')
    }
  }

  const deleteHabit = async (id) => {
    try {
      await api.del(`habits/${id}`)
      loadHabits()
      refresh()
      toast.success('Habit deleted')
    } catch (e) {
      toast.error('Failed to delete habit')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Habit Tracker</h2>
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
          + New Habit
        </button>
      </div>

      {open && (
        <div className="glass-card rounded-2xl p-6">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter habit name..."
            className="w-full px-4 py-2 bg-black/40 text-white rounded-lg border border-white/10 focus:border-violet-500 outline-none"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={createHabit} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
              Create
            </button>
            <button onClick={() => setOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
              Cancel
            </button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-white/40">No habits yet. Create your first habit!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => (
            <div key={habit.id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{habit.name}</h3>
                <p className="text-sm text-white/40">Streak: {habit.streak || 0} days</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`px-4 py-2 rounded-lg ${habit.completedToday ? 'bg-green-600' : 'bg-white/10'} text-white`}
                >
                  {habit.completedToday ? '✓ Done' : 'Mark Done'}
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TASKS
// ══════════════════════════════════════════════════════════
function Tasks({ refresh }) {
  const [tasks, setTasks] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: 'general', dueDate: todayISO(), type: 'daily' })
  const [filter, setFilter] = useState('all')
  const [suggestingQuest, setSuggestingQuest] = useState(false)

  const load = () => api.get('tasks').then(setTasks)
  useEffect(() => { load() }, [])

  const generateAIQuest = async () => {
    setSuggestingQuest(true)
    try {
      const res = await api.post('ai/suggest', { type: 'quest', context: { hunterClass: 'Shadow Monarch', level: 5 } })
      if (res.success && res.data) {
        setForm({
          ...form,
          title: res.data.title || '',
          description: res.data.description || '',
          priority: res.data.priority || 'medium'
        })
        toast.success('AI daily quest generated successfully! ⚔️')
      }
    } catch {
      toast.error('AI Quest generation failed')
    } finally {
      setSuggestingQuest(false)
    }
  }

  const submit = async () => {
    if (!form.title) return toast.error('Title required')
    if (editingId) {
      await api.patch(`tasks/${editingId}`, form)
      toast.success('Task updated ✓')
    } else {
      await api.post('tasks', form)
      toast.success('Task created ✓')
    }
    setOpen(false)
    setEditingId(null)
    setForm({ title: '', description: '', priority: 'medium', category: 'general', dueDate: todayISO(), type: 'daily' })
    load(); refresh()
  }

  const startEdit = (t) => {
    setEditingId(t.id)
    setForm({
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'medium',
      category: t.category || 'general',
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : todayISO(),
      type: t.type || 'daily'
    })
    setOpen(true)
  }

  const setStatus = async (id, status, evt) => {
    await api.patch(`tasks/${id}`, { status })
    load()
    refresh()
    if (status === 'done' && evt) {
      fireFX('taskComplete', { x: evt.clientX, y: evt.clientY })
    }
  }
  const del = async (id) => { await api.del(`tasks/${id}`); load(); refresh() }

  const filtered = tasks.filter(t => filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status !== 'done')
  const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date(todayISO())).length

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Tasks" desc="Daily, weekly & monthly tasks with deadlines." action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm({ title: '', description: '', priority: 'medium', category: 'general', dueDate: todayISO(), type: 'daily' }) } }}>
          <DialogTrigger asChild><GlowButton onClick={() => { setEditingId(null); setForm({ title: '', description: '', priority: 'medium', category: 'general', dueDate: todayISO(), type: 'daily' }) }}><Plus className="w-4 h-4" /> New Task</GlowButton></DialogTrigger>
          <DialogContent style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(40px)' }}>
            <DialogHeader>
              <div className="flex justify-between items-center pr-6">
                <DialogTitle className="aurora-text">{editingId ? 'Edit Task' : 'Create Task'}</DialogTitle>
                {!editingId && (
                  <GlowButton onClick={generateAIQuest} disabled={suggestingQuest} variant="ghost" className="text-[10px] border-violet-500/20 py-1">
                    {suggestingQuest ? 'Generating...' : '✨ Generate AI Quest'}
                  </GlowButton>
                )}
              </div>
            </DialogHeader>
            <Field label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-black/40 text-white border-white/10" /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Type">
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Category"><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></Field>
              <Field label="Due Date"><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></Field>
            </div>
            <DialogFooter><GlowButton onClick={submit}>{editingId ? 'Update' : 'Create'}</GlowButton></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={ListChecks} label="Total" value={tasks.length} color="#8b5cf6" />
        <StatCard icon={CheckCircle2} label="Done" value={tasks.filter(t => t.status === 'done').length} color="#34d399" />
        <StatCard icon={Circle} label="Open" value={tasks.filter(t => t.status !== 'done').length} color="#22d3ee" />
        <StatCard icon={Calendar} label="Overdue" value={overdue} color="#f87171" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="flex gap-1 p-1 rounded-xl mb-4 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['all', 'open', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'text-white' : 'text-white/40'}`}
              style={filter === f ? { background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' } : {}}>
              {f}
            </button>
          ))}
        </div>
        <div className="glass-card rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-white/25 text-sm">No tasks</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="p-4 flex items-center gap-3 group hover:bg-white/2 transition-colors">
                  <button onClick={(e) => setStatus(t.id, t.status === 'done' ? 'todo' : 'done', e)} className="transition-transform hover:scale-110">
                    {t.status === 'done'
                      ? <CheckCircle2 className="w-5 h-5" style={{ color: '#34d399', filter: 'drop-shadow(0 0 6px #34d399)' }} />
                      : <Circle className="w-5 h-5 text-white/20 hover:text-white/50 transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${t.status === 'done' ? 'line-through text-white/30' : 'text-white'}`}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: t.priority === 'high' ? 'rgba(248,113,113,0.4)' : t.priority === 'medium' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)',
                          color: t.priority === 'high' ? '#f87171' : t.priority === 'medium' ? '#fbbf24' : 'rgba(255,255,255,0.3)'
                        }}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-white/25">{t.type}</span>
                      <span className="text-[10px] text-white/25">Due {fmtDate(t.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(t)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                      <NotebookPen className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════════════════
function Goals({ refresh }) {
  const [goals, setGoals] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', term: 'short', deadline: '', progress: 0 })
  const load = () => api.get('goals').then(setGoals)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.title) return toast.error('Title required')
    if (editingId) {
      await api.patch(`goals/${editingId}`, form)
      toast.success('Goal updated ✓')
    } else {
      await api.post('goals', form)
      toast.success('Goal created ✓')
    }
    setOpen(false)
    setEditingId(null)
    setForm({ title: '', description: '', category: 'personal', term: 'short', deadline: '', progress: 0 })
    load(); refresh()
  }

  const startEdit = (g) => {
    setEditingId(g.id)
    setForm({
      title: g.title,
      description: g.description || '',
      category: g.category || 'personal',
      term: g.term || 'short',
      deadline: g.deadline ? g.deadline.slice(0, 10) : '',
      progress: g.progress || 0
    })
    setOpen(true)
  }

  const updateProgress = async (id, progress) => { await api.patch(`goals/${id}`, { progress }); load(); refresh() }
  const del = async (id) => { await api.del(`goals/${id}`); load(); refresh() }

  const byTerm = { short: goals.filter(g => g.term === 'short'), medium: goals.filter(g => g.term === 'medium'), long: goals.filter(g => g.term === 'long') }
  const termColors = { short: '#34d399', medium: '#fbbf24', long: '#a78bfa' }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Goals" desc="Short, medium & long-term objectives with visual progress." action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm({ title: '', description: '', category: 'personal', term: 'short', deadline: '', progress: 0 }) } }}>
          <DialogTrigger asChild><GlowButton onClick={() => { setEditingId(null); setForm({ title: '', description: '', category: 'personal', term: 'short', deadline: '', progress: 0 }) }}><Plus className="w-4 h-4" /> New Goal</GlowButton></DialogTrigger>
          <DialogContent style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(40px)' }}>
            <DialogHeader><DialogTitle className="aurora-text">{editingId ? 'Edit Goal' : 'Create Goal'}</DialogTitle></DialogHeader>
            <Field label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Term">
                <Select value={form.term} onValueChange={v => setForm({ ...form, term: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="short">Short-term</SelectItem><SelectItem value="medium">Medium-term</SelectItem><SelectItem value="long">Long-term</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Category"><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></Field>
              <Field label="Deadline"><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></Field>
              <Field label="Progress %"><Input type="number" value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} /></Field>
            </div>
            <DialogFooter><GlowButton onClick={submit}>{editingId ? 'Update' : 'Create'}</GlowButton></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <motion.div variants={stagger} className="grid lg:grid-cols-3 gap-4">
        {['short', 'medium', 'long'].map(term => (
          <motion.div key={term} variants={fadeUp} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-5 rounded-full" style={{ background: termColors[term] }} />
              <h3 className="font-bold text-white capitalize">{term}-term Goals</h3>
              <span className="ml-auto text-xs text-white/30">{byTerm[term].length}</span>
            </div>
            {byTerm[term].length === 0 ? <p className="text-xs text-white/25 py-6 text-center">No goals yet</p> :
              <div className="space-y-3">
                {byTerm[term].map(g => (
                  <div key={g.id} className="p-3 rounded-xl group" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm text-white truncate flex-1">{g.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => startEdit(g)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                          <NotebookPen className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => del(g.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {g.description && <p className="text-xs text-white/30 mb-2 line-clamp-2">{g.description}</p>}
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/30">Progress</span>
                      <span className="font-bold" style={{ color: termColors[term] }}>{g.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: termColors[term] }} />
                    </div>
                    <input type="range" min="0" max="100" value={g.progress}
                      onChange={e => updateProgress(g.id, Number(e.target.value))}
                      className="w-full accent-violet-500 cursor-pointer" style={{ accentColor: termColors[term] }} />
                    {g.deadline && <p className="text-[10px] text-white/25 mt-1">Due {fmtDate(g.deadline)}</p>}
                  </div>
                ))}
              </div>
            }
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}


// ══════════════════════════════════════════════════════════
// HEALTH
// ══════════════════════════════════════════════════════════
function Health({ refresh }) {
  const [logs, setLogs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ date: todayISO(), weight: '', sleep: '', water: '', calories: '', protein: '', carbs: '', fat: '', energy: 5 })
  const load = () => api.get('health').then(setLogs)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (editingId) {
      await api.patch(`health/${editingId}`, form)
      toast.success('Health entry updated ✓')
    } else {
      await api.post('health', form)
      toast.success('Health entry saved ✓')
    }
    setEditingId(null)
    setForm({ date: todayISO(), weight: '', sleep: '', water: '', calories: '', protein: '', carbs: '', fat: '', energy: 5 })
    load(); refresh()
  }

  const startEdit = (l) => {
    setEditingId(l.id)
    setForm({
      date: l.date ? l.date.slice(0, 10) : todayISO(),
      weight: l.weight || '',
      sleep: l.sleep || '',
      water: l.water || '',
      calories: l.calories || '',
      protein: l.protein || '',
      carbs: l.carbs || '',
      fat: l.fat || '',
      energy: l.energy || 5
    })
  }

  const del = async (id) => {
    await api.del(`health/${id}`)
    toast.success('Health entry deleted')
    load(); refresh()
  }

  const trend = logs.slice(-30).map(l => ({ ...l, label: new Date(l.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) }))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Health Tracker" desc="Sleep, hydration, nutrition, and energy levels." />

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400" /> {editingId ? 'Edit Health Entry' : 'Log Today'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Weight (kg)"><Input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></Field>
          <Field label="Sleep (h)"><Input type="number" step="0.1" value={form.sleep} onChange={e => setForm({ ...form, sleep: e.target.value })} /></Field>
          <Field label="Water (L)"><Input type="number" step="0.1" value={form.water} onChange={e => setForm({ ...form, water: e.target.value })} /></Field>
          <Field label="Calories"><Input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} /></Field>
          <Field label="Protein (g)"><Input type="number" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} /></Field>
          <Field label="Carbs (g)"><Input type="number" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} /></Field>
          <Field label="Fat (g)"><Input type="number" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex gap-2">
          <GlowButton onClick={submit}>
            {editingId ? 'Update Entry' : <><Plus className="w-4 h-4" /> Save Entry</>}
          </GlowButton>
          {editingId && (
            <GlowButton variant="ghost" onClick={() => {
              setEditingId(null)
              setForm({ date: todayISO(), weight: '', sleep: '', water: '', calories: '', protein: '', carbs: '', fat: '', energy: 5 })
            }}>
              Cancel
            </GlowButton>
          )}
        </div>
      </motion.div>

      <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2"><Moon className="w-4 h-4 text-violet-400" /> Sleep & Energy</h3>
          {trend.length === 0 ? <div className="h-48 flex items-center justify-center text-white/25 text-sm">No data yet</div> :
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip contentStyle={TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="sleep" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} name="Sleep (h)" />
                <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 3 }} name="Energy" />
              </LineChart>
            </ResponsiveContainer>}
        </motion.div>
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2"><Droplets className="w-4 h-4 text-cyan-400" /> Weight & Hydration</h3>
          {trend.length === 0 ? <div className="h-48 flex items-center justify-center text-white/25 text-sm">No data yet</div> :
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} /><stop offset="100%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.4} /><stop offset="100%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip contentStyle={TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="weight" stroke="#38bdf8" fill="url(#gw)" name="Weight" />
                <Area type="monotone" dataKey="water" stroke="#34d399" fill="url(#gh)" name="Water" />
              </AreaChart>
            </ResponsiveContainer>}
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4">Recent Entries</h3>
        {logs.length === 0 ? (
          <div className="text-center text-white/25 text-sm py-6">No entries logged yet</div>
        ) : (
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-2">
              {logs.slice().reverse().map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/2 transition-colors border border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <span className="font-semibold text-white">{fmtDate(l.date)}</span>
                    <span className="text-white/40">Weight: <strong className="text-white">{l.weight}kg</strong></span>
                    <span className="text-white/40">Sleep: <strong className="text-white">{l.sleep}h</strong></span>
                    <span className="text-white/40">Water: <strong className="text-white">{l.water}L</strong></span>
                    <span className="text-white/40 text-pink-400">{l.calories ? `${l.calories} kcal` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(l)} className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                      <NotebookPen className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(l.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// GOKU POWER COMPANION
// ══════════════════════════════════════════════════════════
const GOKU_FORMS = [
  {
    id: 'base', name: 'Base Form', img: '/goku/base.png',
    threshold: 0, aura: 'rgba(255,255,255,0)', auraColor: '#94a3b8',
    bgGrad: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)',
    border: 'rgba(148,163,184,0.3)', glowColor: 'rgba(148,163,184,0.12)',
    badge: '⬜ Mortal', xpLabel: 'Awakening',
    quotes: [
      "Every Saiyan starts somewhere. Begin your first set.",
      "I am always calm before battle. Are you ready?",
      "Train like there is no tomorrow. That is the Saiyan way.",
      "A warrior's journey begins with a single rep."
    ]
  },
  {
    id: 'ssj1', name: 'Super Saiyan', img: '/goku/ssj1.png',
    threshold: 10, aura: 'rgba(251,191,36,0.3)', auraColor: '#fbbf24',
    bgGrad: 'linear-gradient(135deg, #0d1117 0%, #1a1000 100%)',
    border: 'rgba(251,191,36,0.4)', glowColor: 'rgba(251,191,36,0.18)',
    badge: '🌟 Super Saiyan', xpLabel: 'Power Rising',
    quotes: [
      "This anger — this PAIN — transforms into POWER! Don't stop now!",
      "PUSH BEYOND YOUR LIMITS! The more you hurt, the stronger you get!",
      "I have trained through worse pain. One more set — DO IT!",
      "A real Super Saiyan doesn't rest until the dungeon is cleared!",
      "Feel that burn? That is your body leveling up. KEEP GOING!"
    ]
  },
  {
    id: 'ssj2', name: 'Super Saiyan 2', img: '/goku/ssj2.png',
    threshold: 30, aura: 'rgba(250,204,21,0.4)', auraColor: '#facc15',
    bgGrad: 'linear-gradient(135deg, #0d1117 0%, #1a1400 100%)',
    border: 'rgba(250,204,21,0.5)', glowColor: 'rgba(250,204,21,0.22)',
    badge: '⚡ Super Saiyan 2', xpLabel: 'Lightning Surge',
    quotes: [
      "LIGHTNING CRACKLES IN MY VEINS! DO YOU FEEL IT?! PUSH HARDER!",
      "This electric rage — channel it into your reps! DON'T HOLD BACK!",
      "The difference between SSJ1 and SSJ2 is ONE MORE REP! GO!",
      "I WILL NOT LOSE TO WEAKNESS! Neither will you!",
      "The electricity around me is your willpower made visible. SURGE!"
    ]
  },
  {
    id: 'ssjblue', name: 'Super Saiyan Blue', img: '/goku/ssjblue.png',
    threshold: 60, aura: 'rgba(6,182,212,0.35)', auraColor: '#06b6d4',
    bgGrad: 'linear-gradient(135deg, #060d1a 0%, #001a2e 100%)',
    border: 'rgba(6,182,212,0.5)', glowColor: 'rgba(6,182,212,0.22)',
    badge: '💠 Super Saiyan Blue', xpLabel: 'God Ki Flowing',
    quotes: [
      "God Ki flows through every rep. You are not just training — you are ASCENDING.",
      "Beerus said I could not handle divine power. I prove him wrong every session.",
      "Blue transcends limits. So does your training. Don't stop — EVOLVE!",
      "Whis watches your form. Make it perfect. One more — FLAWLESS!",
      "This is not just physical training. This is the path to godhood. CLAIM IT!"
    ]
  },
  {
    id: 'ui', name: 'Ultra Instinct', img: '/goku/ui.png',
    threshold: 100, aura: 'rgba(255,255,255,0.45)', auraColor: '#e2e8f0',
    bgGrad: 'linear-gradient(135deg, #040406 0%, #0a0a14 50%, #000810 100%)',
    border: 'rgba(255,255,255,0.55)', glowColor: 'rgba(255,255,255,0.25)',
    badge: '✨ Ultra Instinct', xpLabel: 'Beyond Mastery',
    quotes: [
      "Ultra Instinct. The body moves without thought. Your muscles remember every rep.",
      "In this state, there is no pain. Only the next set. TRANSCEND.",
      "Even the angels cannot predict what you will achieve. BEYOND LIMITS.",
      "Your body has become a weapon. Every exercise sharpens it further.",
      "The silver aura means your limits are GONE. There are only new heights."
    ]
  }
]

const GOKU_SPEECHES = [
  "Listen up! Master Roshi taught us: Work hard, study well, eat and sleep plenty! That is the Turtle Hermit way! We train not to defeat others, but to defeat our own weaknesses from yesterday. Let's do this set together, and push further!",
  "Even a low-class warrior can surpass an elite if he puts his mind to it and works hard enough! Don't let anyone tell you what your limits are. Squeeze your core, breathe, and drive that weight up! Show them what Saiyan power looks like!",
  "Power comes in response to a need, not a desire! You have to create that need! If you want to grow, you have to push your muscles to the absolute limit. Squeeze out one more rep! Let's go, push it!",
  "If you don't like your destiny, don't accept it! Instead, have the courage to change it the way you want it to be. Every rep you complete is a step toward rewriting your destiny. Don't quit now, we are just getting started!",
  "This is to go even further beyond! AAAAAAAAH! Feel the energy rising! Channel that power into this set. Don't look back, don't hesitate. Give it everything you've got!",
  "I'm the Saiyan who came all the way from Earth for the sole purpose of beating you. A true warrior never gives up! Even if you feel like your muscles are about to snap, remember why you started! One more rep! Break through your limits!",
  "When you feel like you can't lift another ounce, that's when the real training begins! Your mind will try to tell you to stop, but a Saiyan's body listens to nothing but the drive to grow stronger. Take a deep breath, focus your energy, and push!",
  "There's no shortcut to strength! Every single drop of sweat, every single set where you felt like falling over, it all counts. It's the path to unleashing your true potential. Don't look at how far you have to go; focus on this very moment and crush it!",
  "I've faced enemies that seemed completely unbeatable, but I never backed down! The secret isn't some magical power-up; it's simply refusing to quit no matter what. Keep your posture solid, squeeze your fists, and lift that weight like the universe depends on it!",
  "If a low-class warrior like me can match the gods themselves through sheer dedication, then there is absolutely nothing you can't achieve! Push past the burning in your muscles. That burn is just weakness leaving your body! Let's go!",
  "You can't just wish for a better version of yourself; you have to train for it every single day. When the morning is cold and you're tired, that's when you prove your resolve. Stand tall, brace your core, and let's get this set done!",
  "My body is screaming at me to stop, but my spirit is telling me to go further! That's the Saiyan pride! You have that same fire inside you. Don't let it flicker out when the weight gets heavy. Blow it up into a blazing aura and conquer this lift!",
  "We don't train to become better than others; we train to show ourselves what we are truly capable of. Every rep is a promise to your future self that you won't settle for average. Keep your eyes on the goal and drive it home!",
  "Sometimes you fail, and that's okay. I've been beaten down more times than I can count. But what matters is that you get back up, dust yourself off, and try again with even more intensity! Let's conquer this set together!",
  "Kaio-ken! Let's multiply our effort! Double the focus, double the power! Do not let the fatigue win. Squeeze out every ounce of energy from your reserves and make this final effort count! SAAAAAAH!"
];

const EXERCISE_ADVICE = {
  'bench press': "Keep your feet flat on the floor, arch your lower back slightly, and squeeze your shoulder blades together. Push the bar in a slight arc, and don't flare your elbows out! Let's conquer this weight!",
  'squat': "Keep your chest high, push your knees outward, and sit back as if sitting in a chair. Drop until your thighs are parallel to the floor, then drive up through your heels! Power up!",
  'deadlift': "Keep the bar close to your shins, flatten your back, and drive through your legs. Don't let your spine round! Lift it with the fury of a Super Saiyan!",
  'pull-up': "Pull from your elbows, squeeze your shoulder blades at the top, and lower yourself under control. Don't swing! Pure back power!",
  'overhead press': "Brace your core, squeeze your glutes, and push the bar straight up overhead. Move your head back slightly to clear the bar, then lock it out!",
  'bicep curl': "Keep your elbows pinned to your sides, don't swing your body, and squeeze the muscle hard at the top. Let's build those arms!",
  'plank': "Keep your body in a straight line from head to heels. Squeeze your glutes, brace your abs, and breathe! Hold the stance, warrior!"
};

const getGokuAdvice = (exName, muscleGroup) => {
  const nameLower = exName?.toLowerCase() || '';
  for (const [key, advice] of Object.entries(EXERCISE_ADVICE)) {
    if (nameLower.includes(key)) return advice;
  }
  
  const muscleLower = muscleGroup?.toLowerCase() || '';
  if (muscleLower.includes('chest') || muscleLower.includes('pec')) {
    return "Keep your chest puffed out, squeeze your shoulder blades, and focus on the contraction of your pectorals. Push hard!";
  }
  if (muscleLower.includes('back') || muscleLower.includes('lat')) {
    return "Focus on pulling with your elbows and squeezing your lats. Don't use momentum — let the back work!";
  }
  if (muscleLower.includes('shoulder') || muscleLower.includes('deltoid')) {
    return "Keep your core braced and don't flare your shoulders excessively. Control the weight, warrior!";
  }
  if (muscleLower.includes('leg') || muscleLower.includes('quad') || muscleLower.includes('hamstring') || muscleLower.includes('glute')) {
    return "Drive power from the floor through your heels! Squeeze your legs and keep your knees tracking over your toes!";
  }
  if (muscleLower.includes('arm') || muscleLower.includes('bicep') || muscleLower.includes('tricep')) {
    return "Keep your elbows stable and isolate the muscle. Concentrate on the pump and squeeze!";
  }
  if (muscleLower.includes('core') || muscleLower.includes('ab') || muscleLower.includes('belly')) {
    return "Keep your core braced, hold your breath slightly during the concentric phase, and pull your navel to your spine!";
  }
  
  return "Keep your breathing steady, focus on the muscle mind connection, and push past your limits!";
};


function GokuCompanion({ items, activeSession }) {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [formIdx, setFormIdx] = useState(0)
  const [powerAnim, setPowerAnim] = useState(false)
  const [showUnlock, setShowUnlock] = useState(null)
  
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showSpeakTip, setShowSpeakTip] = useState(true)
  
  const [speechIdx, setSpeechIdx] = useState(0)
  const [customSpeechText, setCustomSpeechText] = useState(null)

  const totalSessions = items.length
  const totalCalories = items.reduce((a,i)=>a+Number(i.calories||0),0)
  const powerLevel = Math.min(totalSessions * 10, 1000)

  const newFormIdx = useMemo(() =>
    GOKU_FORMS.reduce((acc, f, i) => totalSessions >= f.threshold ? i : acc, 0),
    [totalSessions]
  )
  const form = GOKU_FORMS[formIdx]

  const activeSessionRef = useRef(null)
  const prevCompletedCountRef = useRef(0)
  const prevExerciseIdxRef = useRef(-1)

  const playAudio = useCallback((filename, onEndedCallback = null) => {
    if (typeof window === 'undefined' || !speechEnabled) return;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      const audio = new Audio(`/goku/${filename}`)
      audio.volume = 0.9
      setIsSpeaking(true)
      audio.onended = () => {
        setIsSpeaking(false)
        if (onEndedCallback) onEndedCallback()
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        if (onEndedCallback) onEndedCallback()
      }
      audio.play().catch(e => {
        console.error("Failed to play audio clip:", e)
        setIsSpeaking(false)
        if (onEndedCallback) onEndedCallback()
      })
    } catch(e) {
      console.error(e)
      setIsSpeaking(false)
      if (onEndedCallback) onEndedCallback()
    }
  }, [speechEnabled])

  const speak = useCallback(async (text) => {
    if (typeof window === 'undefined' || !speechEnabled) return;
    try {
      setIsSpeaking(true)
      const res = await fetch('/api/goku/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: 'onyx' }),
      })
      if (!res.ok) throw new Error("TTS failed")
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.volume = 0.95
      
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch(e) {
      console.error("OpenAI TTS error, falling back to local synthesis:", e)
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.pitch = 0.95
        utterance.rate = 1.05
        const voices = window.speechSynthesis.getVoices()
        const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('google') && v.lang.startsWith('en'))
        if (maleVoice) utterance.voice = maleVoice

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      } else {
        setIsSpeaking(false)
      }
    }
  }, [speechEnabled])

  const handleToggleVoice = () => {
    const nextVal = !speechEnabled
    setSpeechEnabled(nextVal)
    setShowSpeakTip(false)
    
    if (nextVal) {
      setTimeout(() => {
        playAudio("goku-charge.mp3")
      }, 50)
      toast.success("🔊 Real Goku Sound System Activated!")
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      toast.info("🔇 Goku Voice System Muted")
    }
  }

  useEffect(() => {
    if (!speechEnabled) return

    if (activeSession) {
      const currentCompletedCount = activeSession.exercises?.reduce((acc, ex) => acc + (ex.setsArray?.filter(s => s.completed)?.length || 0), 0) || 0
      const currentExerciseIdx = activeSession.exercises?.findIndex(ex => ex.setsArray?.some(s => !s.completed)) ?? -1
      const currentExercise = activeSession.exercises?.[currentExerciseIdx]

      if (!activeSessionRef.current) {
        playAudio("goku-charge.mp3", () => {
          speak(`Yo! A new training dungeon has appeared: ${activeSession.routineName}. First up is ${activeSession.exercises[0]?.name || 'the first exercise'}. Push past your limits!`)
        })
      }
      else if (currentCompletedCount > prevCompletedCountRef.current) {
        const lastExIdx = activeSession.exercises?.findIndex((ex, idx) => {
          const oldEx = activeSessionRef.current?.exercises?.[idx]
          const oldDone = oldEx?.setsArray?.filter(s => s.completed)?.length || 0
          const newDone = ex.setsArray?.filter(s => s.completed)?.length || 0
          return newDone > oldDone
        })

        if (lastExIdx !== -1) {
          const changedEx = activeSession.exercises[lastExIdx]
          const isExDone = changedEx.setsArray?.every(s => s.completed)
          
          if (isExDone) {
            const nextExIdx = activeSession.exercises?.findIndex((ex, idx) => idx > lastExIdx && ex.setsArray?.some(s => !s.completed))
            playAudio("teleport.mp3", () => {
              if (nextExIdx !== -1) {
                const nextEx = activeSession.exercises[nextExIdx]
                speak(`Incredible! All sets for ${changedEx.name} are complete! Next up is ${nextEx.name}. Let's go!`)
              } else {
                speak(`Awesome! You've cleared every exercise in this dungeon! Hit the Claim Rewards button to lock in your power level!`)
              }
            })
          } else {
            playAudio("teleport.mp3", () => {
              const motivations = [
                "Nice job! That's another set down!",
                "Keep it up! Your power level is rising!",
                "No pain, no gain! Let's keep moving!",
                "Awesome effort! Keep that perfect form!",
                "Yes! That's how a Saiyan trains!"
              ]
              speak(motivations[Math.floor(Math.random() * motivations.length)])
            })
          }
        }
      }

      activeSessionRef.current = activeSession
      prevCompletedCountRef.current = currentCompletedCount
      prevExerciseIdxRef.current = currentExerciseIdx
    } else {
      if (activeSessionRef.current) {
        playAudio("kakarot.mp3", () => {
          speak("Fantastic work! Dungeon session closed. Hydrate, rest, and let's get ready for the next battle!")
        })
      }
      activeSessionRef.current = null
      prevCompletedCountRef.current = 0
      prevExerciseIdxRef.current = -1
    }
  }, [activeSession, speechEnabled, playAudio, speak])

  useEffect(() => {
    if (newFormIdx !== formIdx) {
      setFormIdx(newFormIdx)
      setPowerAnim(true)
      setShowUnlock(GOKU_FORMS[newFormIdx])
      toast.success(`🔥 GOKU POWERED UP! ${GOKU_FORMS[newFormIdx].name} UNLOCKED!`)
      
      if (speechEnabled) {
        if (newFormIdx === 4) {
          playAudio("ultra-instinct.mp3", () => {
            speak(`I have achieved Ultra Instinct. My limits are completely gone!`)
          })
        } else {
          playAudio("kamehameha.mp3", () => {
            speak(`Awesome power! I have transformed into ${GOKU_FORMS[newFormIdx].name}! Let's push further beyond!`)
          })
        }
      }

      const t = setTimeout(() => { setPowerAnim(false); setShowUnlock(null) }, 4000)
      return () => clearTimeout(t)
    }
  }, [newFormIdx])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(i => {
        const next = (i + 1) % form.quotes.length
        if (speechEnabled && activeSession && Math.random() > 0.4) {
          speak(form.quotes[next])
        }
        return next
      })
    }, activeSession ? 7000 : 15000)
    return () => clearInterval(interval)
  }, [form, activeSession, speechEnabled, speak])

  const nextForm = formIdx < GOKU_FORMS.length - 1 ? GOKU_FORMS[formIdx + 1] : null
  const progressToNext = nextForm
    ? Math.min(100, ((totalSessions - form.threshold) / Math.max(nextForm.threshold - form.threshold, 1)) * 100)
    : 100

  const handleAskAdvice = () => {
    if (activeSession) {
      const currentExerciseIdx = activeSession.exercises?.findIndex(ex => ex.setsArray?.some(s => !s.completed)) ?? -1
      const currentExercise = activeSession.exercises?.[currentExerciseIdx]
      if (currentExercise) {
        const advice = getGokuAdvice(currentExercise.name, currentExercise.muscleGroup)
        playAudio("teleport.mp3", () => {
          setCustomSpeechText(`Goku Advice: ${advice}`)
          speak(`Listen up! For ${currentExercise.name}: ${advice}`)
        })
        toast.info(`💬 Goku's advice: ${currentExercise.name}`)
      } else {
        speak("All exercises in this dungeon are clear! Hit the Claim Rewards button!")
      }
    } else {
      playAudio("teleport.mp3", () => {
        const fallbackMsg = "To get specific exercise advice, start a dungeon workout session first! For now, focus on your form, breathe regularly, and keep pushing your limits!"
        setCustomSpeechText(fallbackMsg)
        speak(fallbackMsg)
      })
    }
  }

  const handleMotivate = () => {
    const clips = ["its-over-9000.mp3", "kamehameha.mp3", "kakarot.mp3"]
    const randomClip = clips[Math.floor(Math.random() * clips.length)]
    playAudio(randomClip)
    setCustomSpeechText(null)
    toast.success("🔥 Goku is cheering you on!")
  }

  const handleSpeechCycle = () => {
    const text = GOKU_SPEECHES[speechIdx]
    setCustomSpeechText(text)
    speak(text)
    setSpeechIdx(prev => (prev + 1) % GOKU_SPEECHES.length)
    toast.success("🎙️ Playing Goku Motivation Speech!")
  }

  return (
    <div className="rounded-3xl overflow-hidden relative" style={{
      background: form.bgGrad,
      border: `1px solid ${form.border}`,
      boxShadow: `0 0 60px ${form.glowColor}, 0 0 120px ${form.glowColor}`,
      transition: 'all 1.5s ease'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gokuTalk {
          0% { transform: scale(1.03) translateY(0); filter: drop-shadow(0 0 20px ${form.auraColor}); }
          50% { transform: scale(1.08) translateY(-4px) rotate(1deg); filter: drop-shadow(0 0 35px ${form.auraColor}); }
          100% { transform: scale(1.03) translateY(0); filter: drop-shadow(0 0 20px ${form.auraColor}); }
        }
        .goku-speaking {
          animation: gokuTalk 0.4s infinite ease-in-out;
        }
      `}} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 animate-pulse" style={{ background: `radial-gradient(ellipse 60% 80% at 28% 50%, ${form.aura} 0%, transparent 70%)`, animationDuration:'3s' }} />
        {formIdx === 4 && <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize:'100% 4px' }} />}
      </div>

      {showUnlock && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">💥</div>
            <div className="text-2xl font-black text-white uppercase tracking-widest">POWER UP!</div>
            <div className="text-lg font-black mt-1" style={{ color: showUnlock.auraColor }}>{showUnlock.name} UNLOCKED</div>
            <div className="text-xs text-white/40 mt-2 uppercase tracking-widest">{totalSessions} sessions completed</div>
          </div>
        </motion.div>
      )}

      {powerAnim && <div className="absolute inset-0 pointer-events-none animate-pulse z-20" style={{ background:`radial-gradient(ellipse at 30% 50%, ${form.aura} 0%, transparent 60%)` }} />}

      <div className="relative flex flex-col md:flex-row items-stretch">
        <div className="relative md:w-60 shrink-0 flex items-end justify-center overflow-hidden" style={{ minHeight:'260px' }}>
          {formIdx >= 1 && [...Array(3)].map((_,i) => (
            <div key={i} className="absolute rounded-full animate-ping" style={{
              width:`${80+i*40}px`, height:`${80+i*40}px`,
              bottom:`${8+i*5}%`, left:'50%', transform:'translateX(-50%)',
              border:`1px solid ${form.auraColor}${['40','20','0c'][i]}`,
              animationDuration:`${1.5+i*0.8}s`, animationDelay:`${i*0.3}s`
            }} />
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background:`radial-gradient(ellipse 80% 40% at 50% 100%, ${form.aura} 0%, transparent 70%)` }} />
          
          <img src={form.img} alt={`Goku ${form.name}`} 
            className={`relative z-10 object-contain transition-all duration-1000 ${isSpeaking ? 'goku-speaking' : ''}`}
            style={{ height:'240px', width:'auto', maxWidth:'100%',
              filter: formIdx >= 1 ? `drop-shadow(0 0 18px ${form.auraColor}) drop-shadow(0 0 36px ${form.aura})` : 'none',
              transform: activeSession ? 'scale(1.06)' : 'scale(1)' }} />
          
          {activeSession && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-bounce" style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(10px)', border:`1px solid ${form.auraColor}77` }}>
                <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ background:form.auraColor }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color:form.auraColor }}>LIVE TRAINING</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background:`${form.auraColor}22`, color:form.auraColor, border:`1px solid ${form.auraColor}44` }}>{form.badge}</span>
                {activeSession && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse" style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' }}>⚡ LIVE SESSION</span>}
                {isSpeaking && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">🗣 SPEAKING</span>}
              </div>
              <h2 className="text-xl font-black text-white" style={{ textShadow:`0 0 20px ${form.auraColor}66` }}>Son Goku</h2>
              <p className="text-xs font-bold mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{form.name} · {form.xpLabel}</p>
            </div>
            
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button 
                onClick={handleToggleVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${speechEnabled ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'}`}
                style={{ border: '1px solid' }}
              >
                {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {speechEnabled ? "Voice: ON" : "Voice: MUTED"}
              </button>
              {showSpeakTip && (
                <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse mt-0.5">
                  ⚡ Click to unmute Goku!
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl px-4 py-3 relative overflow-hidden flex-1 flex items-center min-h-[56px]" style={{ background:`${form.auraColor}08`, border:`1px solid ${form.auraColor}20` }}>
            <div className="absolute top-1 left-2 text-3xl font-black leading-none opacity-10" style={{ color:form.auraColor }}>"</div>
            <motion.p key={customSpeechText || `${formIdx}-${quoteIdx}`} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              className="relative z-10 text-sm font-bold text-white/90 leading-relaxed">
              {customSpeechText || form.quotes[quoteIdx]}
            </motion.p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-1">
            <button 
              onClick={handleAskAdvice}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 transition-all hover:bg-white/10 active:scale-95 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: `${form.auraColor}25` }}
            >
              💬 Advice
            </button>
            <button 
              onClick={handleSpeechCycle}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 border bg-white/5"
              style={{ borderColor: `${form.auraColor}35` }}
            >
              🎙️ Speech
            </button>
            <button 
              onClick={handleMotivate}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${form.auraColor}, ${nextForm?.auraColor || form.auraColor})` }}
            >
              🔥 Yell!
            </button>
          </div>

          {nextForm && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.3)' }}>Next: {nextForm.name}</span>
                <span className="text-[9px] font-black" style={{ color:form.auraColor }}>{totalSessions}/{nextForm.threshold} sessions</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width:`${progressToNext}%`, background:`linear-gradient(90deg, ${form.auraColor}, ${nextForm.auraColor})` }}>
                  <div className="absolute inset-0 animate-pulse" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {[['Sessions',totalSessions,'🏋️'],['Calories',totalCalories.toLocaleString(),'🔥'],['Total Sets',items.reduce((a,i)=>a+Number(i.sets||0),0),'⚡'],['Power',`${powerLevel}/1K`,'💥']].map(([l,v,icon])=>(
              <div key={l} className="rounded-xl px-2 py-2 text-center" style={{ background:'rgba(0,0,0,0.3)', border:`1px solid ${form.auraColor}15` }}>
                <div className="text-lg mb-0.5">{icon}</div>
                <div className="text-sm font-black text-white">{v}</div>
                <div className="text-[8px] font-bold uppercase tracking-wider mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-center gap-1.5 px-3 py-5 border-l" style={{ borderColor:`${form.auraColor}12`, background:'rgba(0,0,0,0.25)' }}>
          {GOKU_FORMS.map((f, i) => {
            const unlocked = totalSessions >= f.threshold
            const isActive = i === formIdx
            return (
              <div key={f.id} className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-xl overflow-hidden transition-all duration-300 relative" style={{ opacity:unlocked?1:0.2, border:isActive?`2px solid ${f.auraColor}`:'1px solid rgba(255,255,255,0.06)', boxShadow:isActive?`0 0 12px ${f.auraColor}66`:'none', transform:isActive?'scale(1.12)':'scale(1)' }}>
                  <img src={f.img} alt={f.name} className="w-full h-full object-cover" style={{ objectPosition:'50% 10%' }} />
                  {!unlocked && <div className="absolute inset-0 flex items-center justify-center text-xs">🔒</div>}
                </div>
                {i < GOKU_FORMS.length-1 && <div className="w-px h-3" style={{ background:unlocked?`${f.auraColor}50`:'rgba(255,255,255,0.06)' }} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// EXERCISE
// ══════════════════════════════════════════════════════════
// EXERCISE - KINESIS MIGHT ELITE STUDIO
// ══════════════════════════════════════════════════════════
function Exercise({ refresh }) {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', sets: 3, reps: 10, weight: 0, duration: 0, calories: 0, date: todayISO(), notes: '' })
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiGoal, setAiGoal] = useState('Hypertrophy')
  const [aiSplit, setAiSplit] = useState('Full Body')
  const [aiLevel, setAiLevel] = useState('intermediate')
  const [aiInclude, setAiInclude] = useState('')
  const [aiExclude, setAiExclude] = useState('')
  const [aiDuration, setAiDuration] = useState('60')
  const [aiIntensity, setAiIntensity] = useState('Medium')
  const [generating, setGenerating] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [selectedMuscle, setSelectedMuscle] = useState(null)
  const [hoveredMuscle, setHoveredMuscle] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [bodyView, setBodyView] = useState('front')
  const [suggestingWorkout, setSuggestingWorkout] = useState(false)

  const askAIWorkout = async () => {
    setSuggestingWorkout(true)
    try {
      const res = await api.post('ai/suggest', {
        type: 'exercise',
        context: {
          hunterClass: 'Shadow Monarch',
          fatigue: stats?.gameStats?.muscleFatigue || {}
        }
      })
      if (res.success && res.data) {
        setForm({
          ...form,
          name: res.data.name || '',
          sets: res.data.sets || 3,
          reps: res.data.reps || 10,
          weight: res.data.weight || 0,
          duration: res.data.duration || 10,
          calories: (res.data.sets || 3) * (res.data.reps || 10) * 0.4
        })
        toast.success('Workout recommendation applied! 🏋️')
      }
    } catch {
      toast.error('AI suggestion failed')
    } finally {
      setSuggestingWorkout(false)
    }
  }

  const load = () => {
    api.get('exercises').then(setItems)
    api.get('stats').then(setStats).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.name) return toast.error('Exercise name required')
    if (editingId) { await api.patch(`exercises/${editingId}`, form); toast.success('Updated ✓') }
    else { await api.post('exercises', form); toast.success('Logged ✓') }
    setEditingId(null)
    setForm({ name: '', sets: 3, reps: 10, weight: 0, duration: 0, calories: 0, date: todayISO(), notes: '' })
    load(); if (refresh) refresh()
  }
  const startEdit = (i) => {
    setEditingId(i.id)
    setForm({ name: i.name, sets: i.sets, reps: i.reps, weight: i.weight, duration: i.duration, calories: i.calories, date: i.date?.slice(0,10) || todayISO(), notes: i.notes || '' })
  }
  const del = async (id) => { await api.del(`exercises/${id}`); toast.success('Deleted'); load(); if (refresh) refresh() }

  const fatigue = stats?.gameStats?.muscleFatigue || { chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0 }

  // Muscle group data
  const MUSCLES = {
    chest:     { label: 'Pectorals',   color: '#06b6d4', glow: 'rgba(6,182,212,0.6)',   exercises: ['Bench Press','Incline DB Press','Cable Crossover','Chest Dips','Push-Ups','Pec Deck Fly'] },
    back:      { label: 'Latissimus',  color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)',  exercises: ['Deadlift','Pull-Ups','Barbell Row','Lat Pulldown','Seated Cable Row','Face Pull'] },
    shoulders: { label: 'Deltoids',    color: '#f59e0b', glow: 'rgba(245,158,11,0.6)',  exercises: ['Overhead Press','Arnold Press','Lateral Raise','Front Raise','Rear Delt Fly','Upright Row'] },
    legs:      { label: 'Quadriceps',  color: '#10b981', glow: 'rgba(16,185,129,0.6)',  exercises: ['Barbell Squat','Leg Press','Romanian Deadlift','Leg Extension','Leg Curl','Calf Raise'] },
    arms:      { label: 'Biceps/Tris', color: '#ec4899', glow: 'rgba(236,72,153,0.6)',  exercises: ['Barbell Curl','Hammer Curl','Preacher Curl','Tricep Pushdown','Skull Crusher','Dips'] },
    core:      { label: 'Abdominals',  color: '#f97316', glow: 'rgba(249,115,22,0.6)',  exercises: ['Plank','Ab Wheel','Hanging Leg Raise','Cable Crunch','Russian Twist','Dragon Flag'] },
  }

  const getMuscleFill = (id) => {
    if (selectedMuscle === id) return MUSCLES[id]?.color + 'cc'
    if (hoveredMuscle === id) return MUSCLES[id]?.color + '66'
    const f = fatigue[id] || 0
    if (f > 70) return 'rgba(239,68,68,0.25)'
    if (f > 40) return 'rgba(245,158,11,0.15)'
    return 'rgba(255,255,255,0.04)'
  }
  const getMuscleStroke = (id) => {
    if (selectedMuscle === id) return MUSCLES[id]?.color
    if (hoveredMuscle === id) return MUSCLES[id]?.color + 'aa'
    const f = fatigue[id] || 0
    if (f > 70) return 'rgba(239,68,68,0.6)'
    return 'rgba(255,255,255,0.12)'
  }

  const muscleProps = (id) => ({
    fill: getMuscleFill(id),
    stroke: getMuscleStroke(id),
    strokeWidth: selectedMuscle === id ? 1.5 : 0.8,
    style: { cursor: 'pointer', transition: 'all 0.2s', filter: selectedMuscle === id ? `drop-shadow(0 0 8px ${MUSCLES[id]?.glow})` : 'none' },
    onMouseEnter: () => setHoveredMuscle(id),
    onMouseLeave: () => setHoveredMuscle(null),
    onClick: () => setSelectedMuscle(prev => prev === id ? null : id),
  })

  const handleGenerateWorkout = async () => {
    setGenerating(true); setGeneratedWorkout(null)
    try {
      const res = await api.post('ai/generate-workout', { goal: aiGoal, split: aiSplit, level: aiLevel, includeExercises: aiInclude, excludeExercises: aiExclude, duration: aiDuration, intensity: aiIntensity })
      if (res?.success && res.workout) {
        setGeneratedWorkout({ ...res.workout, exercises: (res.workout.exercises || []).map(ex => ({ ...ex, setsArray: Array.from({ length: Number(ex.sets || 3) }, () => ({ completed: false, reps: Number(ex.reps || 10), weight: 0 })) })) })
        toast.success('Program forged by the AI!')
      } else toast.error('Generation failed — check API key.')
    } catch(e) { toast.error(e.message) } finally { setGenerating(false) }
  }

  const startSession = (w) => {
    setActiveSession({ ...w, exercises: w.exercises.map(ex => ({ ...ex, setsArray: ex.setsArray || Array.from({ length: ex.sets||3 }, () => ({ completed:false, reps: ex.reps||10, weight:0 })) })) })
    setShowAiModal(false); setGeneratedWorkout(null)
    toast.success('⚔️ Dungeon activated — begin your quest!')
  }

  const toggleSet = (ei, si) => setActiveSession(prev => {
    const u = { ...prev, exercises: prev.exercises.map((ex,i) => i !== ei ? ex : { ...ex, setsArray: ex.setsArray.map((s,j) => j !== si ? s : { ...s, completed: !s.completed }) }) }
    if (!prev.exercises[ei].setsArray[si].completed) toast.info(`⚡ ${prev.exercises[ei].name} · Set ${si+1} cleared!`)
    return u
  })
  const addSet = (ei) => setActiveSession(prev => {
    const ex = prev.exercises[ei]; const last = ex.setsArray[ex.setsArray.length-1]
    return { ...prev, exercises: prev.exercises.map((e,i) => i !== ei ? e : { ...e, setsArray: [...e.setsArray, { completed:false, reps: last?.reps||10, weight: last?.weight||0 }] }) }
  })
  const updateSet = (ei, si, field, val) => setActiveSession(prev => ({
    ...prev, exercises: prev.exercises.map((ex,i) => i!==ei ? ex : { ...ex, setsArray: ex.setsArray.map((s,j) => j!==si ? s : { ...s, [field]: Number(val)||0 }) })
  }))

  const completeSession = async () => {
    if (!activeSession) return
    let count = 0
    for (const ex of activeSession.exercises) {
      const done = ex.setsArray.filter(s => s.completed)
      if (!done.length) continue
      await api.post('exercises', { name: ex.name, sets: done.length, reps: Math.round(done.reduce((a,s)=>a+s.reps,0)/done.length), weight: Math.max(...done.map(s=>s.weight)), duration: 10, calories: done.length * 25, date: todayISO(), notes: `Dungeon Quest · AI: ${ex.sets}×${ex.reps}` })
      count++
    }
    if (!count) { toast.warning('No completed sets found.'); return }
    toast.success(`🏆 DUNGEON CLEAR! ${count} exercises saved. XP awarded!`)
    setActiveSession(null); load(); if (refresh) refresh()
  }

  const byDay = useMemo(() => {
    const m = {}; items.forEach(i => { m[i.date] = (m[i.date]||0) + Number(i.calories||0) })
    return Object.entries(m).map(([date,calories]) => ({ date, label: fmtDate(date), calories })).slice(-14)
  }, [items])

  const weeklyVol = useMemo(() => {
    const last7 = [...Array(7)].map((_,i) => { const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10) })
    return last7.map(date => ({ label: new Date(date).toLocaleDateString('en',{weekday:'short'}), sets: items.filter(i=>i.date===date).reduce((a,i)=>a+Number(i.sets||0),0) }))
  }, [items])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-0">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl mb-6" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0f0a1a 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.08) 0%, transparent 60%)' }} />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #06b6d4, #8b5cf6)' }} />
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>KINESIS MIGHT</h1>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mt-0.5">Elite Training Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-5 mt-3">
              {[['Total Sessions', items.length], ['This Week', items.filter(i=>{const d=new Date();d.setDate(d.getDate()-7);return new Date(i.date)>=d}).length], ['Calories (30d)', items.slice(-30).reduce((a,i)=>a+Number(i.calories||0),0)]].map(([l,v])=>(
                <div key={l}>
                  <div className="text-xl font-black text-white">{v.toLocaleString()}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {activeSession && (
              <button onClick={()=>{if(confirm('Abort quest?')){setActiveSession(null);toast.error('Quest aborted.')}}}
                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest border rounded-xl transition-all"
                style={{ background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.3)', color:'#f87171' }}>
                Abort Quest
              </button>
            )}
            <button onClick={()=>setShowAiModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 font-black text-sm uppercase tracking-wider rounded-xl text-white transition-all hover:scale-105 active:scale-95"
              style={{ background:'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow:'0 0 30px rgba(6,182,212,0.3)' }}>
              <Sparkles className="w-4 h-4" />
              AI Wizard
            </button>
          </div>
        </div>

        {/* Fatigue strip */}
        <div className="flex border-t border-white/5 divide-x divide-white/5">
          {Object.entries(fatigue).map(([muscle, pct]) => {
            const m = MUSCLES[muscle]; const isFat = pct>70; const isMed = pct>40
            return (
              <div key={muscle} className="flex-1 px-3 py-2.5 text-center" style={{ cursor:'pointer' }} onClick={()=>setSelectedMuscle(muscle)}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: isFat?'#ef4444': isMed?'#f59e0b': m?.color || '#fff', opacity: 0.7 }}>{muscle}</div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: isFat?'linear-gradient(90deg,#ef4444,#ec4899)': isMed?'#f59e0b': m?.color||'#06b6d4' }} />
                </div>
                <div className="text-[9px] font-black mt-0.5" style={{ color: isFat?'#f87171':isMed?'#fbbf24':'rgba(255,255,255,0.3)' }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ ACTIVE DUNGEON SESSION ═══ */}
      {activeSession && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-6 rounded-3xl overflow-hidden" style={{ background:'linear-gradient(135deg, #030712 0%, #0a0f1e 100%)', border:'1px solid rgba(6,182,212,0.3)', boxShadow:'0 0 60px rgba(6,182,212,0.08), inset 0 1px 0 rgba(6,182,212,0.1)' }}>
          {/* Session Header */}
          <div className="relative px-6 py-5 border-b" style={{ borderColor:'rgba(6,182,212,0.15)', background:'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.05) 100%)' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(3)].map((_,i) => <div key={i} className="absolute h-px w-full opacity-20 animate-pulse" style={{ top:`${30*(i+1)}%`, background:`linear-gradient(90deg, transparent, rgba(6,182,212,${0.3-i*0.1}), transparent)`, animationDelay:`${i*0.7}s` }} />)}
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full animate-ping inline-block" style={{ background:'#06b6d4' }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color:'#67e8f9' }}>⚔ DUNGEON RUN ACTIVE</span>
                </div>
                <h2 className="text-lg font-black text-white">{activeSession.routineName}</h2>
                <p className="text-xs font-medium mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>{activeSession.focus}</p>
              </div>
              <button onClick={completeSession}
                className="flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest text-black rounded-xl transition-all hover:scale-105 active:scale-95 shrink-0"
                style={{ background:'linear-gradient(135deg, #06b6d4, #0ea5e9)', boxShadow:'0 0 25px rgba(6,182,212,0.4)' }}>
                <Zap className="w-4 h-4" />
                Claim Rewards
              </button>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto">
            {activeSession.exercises.map((ex, ei) => {
              const completedCount = ex.setsArray.filter(s=>s.completed).length
              const totalCount = ex.setsArray.length
              const pct = Math.round((completedCount/totalCount)*100)
              const muscleColor = Object.entries(MUSCLES).find(([,m])=>ex.muscleGroup?.toLowerCase().includes(Object.values(m).join(',').toLowerCase()))?.[1]?.color || '#06b6d4'

              return (
                <div key={ei} className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: muscleColor }} />
                        <h4 className="text-sm font-black text-white truncate">{ex.name}</h4>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.3)' }}>{ex.muscleGroup} · {ex.weightSuggestion || 'Bodyweight'}</div>
                    </div>
                    <button onClick={()=>addSet(ei)} className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105" style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      +Set
                    </button>
                  </div>
                  
                  {/* Progress ring */}
                  <div className="px-4 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background: pct===100 ? 'linear-gradient(90deg,#06b6d4,#10b981)' : muscleColor }} />
                      </div>
                      <span className="text-[10px] font-black shrink-0" style={{ color: pct===100?'#34d399':'rgba(255,255,255,0.4)' }}>{completedCount}/{totalCount}</span>
                    </div>
                    
                    <div className="space-y-1.5">
                      {ex.setsArray.map((set, si) => (
                        <div key={si} className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all" style={{ background: set.completed ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${set.completed ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.04)'}` }}>
                          <button onClick={()=>toggleSet(ei,si)} className="w-7 h-7 rounded-lg shrink-0 font-black text-xs flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                            style={{ background: set.completed ? '#06b6d4' : 'rgba(255,255,255,0.05)', color: set.completed ? '#000' : 'rgba(255,255,255,0.4)', boxShadow: set.completed ? '0 0 12px rgba(6,182,212,0.4)' : 'none' }}>
                            {set.completed ? '✓' : si+1}
                          </button>
                          <div className="flex-1 flex items-center gap-2">
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color:'rgba(255,255,255,0.25)' }}>Reps</div>
                              <input type="number" value={set.reps} onChange={e=>updateSet(ei,si,'reps',e.target.value)} className="w-12 text-center text-xs font-black rounded-lg bg-transparent border focus:outline-none" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.1)', padding:'2px 0' }} />
                            </div>
                            <div className="h-6 w-px" style={{ background:'rgba(255,255,255,0.06)' }} />
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color:'rgba(255,255,255,0.25)' }}>kg</div>
                              <input type="number" value={set.weight} onChange={e=>updateSet(ei,si,'weight',e.target.value)} className="w-14 text-center text-xs font-black rounded-lg bg-transparent border focus:outline-none" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.1)', padding:'2px 0' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {ex.notes && <div className="px-4 pb-3"><p className="text-[10px] italic" style={{ color:'rgba(139,92,246,0.7)' }}>💡 {ex.notes}</p></div>}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ MAIN STUDIO ═══ */}
      {!activeSession && (
        <div className="space-y-5">
          {/* Row 1: Body Map + Exercise Logger */}
          <div className="grid lg:grid-cols-5 gap-5">
            
            {/* ── ANATOMICAL BODY MAP ── (3 cols) */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden" style={{ background:'linear-gradient(135deg, #080c14 0%, #0d0a1a 100%)', border:'1px solid rgba(255,255,255,0.06)', minHeight:'560px' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Anatomical Target Map</h3>
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color:'rgba(255,255,255,0.3)' }}>Click any muscle group to select exercises</p>
                </div>
                <div className="flex gap-1 p-1 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  {['front','back'].map(v => (
                    <button key={v} onClick={()=>setBodyView(v)} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all" style={{ background: bodyView===v ? 'rgba(255,255,255,0.1)' : 'transparent', color: bodyView===v ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex">
                {/* SVG Body */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                  {/* Holographic grid background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                    backgroundImage: 'linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} />
                  
                  <svg viewBox="0 0 200 480" className="w-full" style={{ maxHeight:'420px', filter:'drop-shadow(0 0 20px rgba(6,182,212,0.05))' }}>
                    <defs>
                      <radialGradient id="bodyGrad" cx="50%" cy="30%" r="60%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                      </radialGradient>
                    </defs>

                    {bodyView === 'front' ? (
                      <g>
                        {/* ── HEAD ── */}
                        <ellipse cx="100" cy="28" rx="22" ry="26" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                        <ellipse cx="100" cy="35" rx="12" ry="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                        {/* Neck */}
                        <path d="M 88 50 Q 100 58 112 50 L 116 68 Q 100 74 84 68 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
                        
                        {/* ── SHOULDERS (Deltoids) ── */}
                        <path d="M 54 70 Q 40 68 32 82 Q 28 96 36 106 Q 44 115 56 110 L 68 85 Z" {...muscleProps('shoulders')} />
                        <path d="M 146 70 Q 160 68 168 82 Q 172 96 164 106 Q 156 115 144 110 L 132 85 Z" {...muscleProps('shoulders')} />
                        
                        {/* ── CHEST (Pectoralis Major) ── */}
                        <path d="M 68 72 Q 84 68 100 70 Q 100 70 100 70 Q 116 68 132 72 L 130 108 Q 115 118 100 122 Q 85 118 70 108 Z" {...muscleProps('chest')} />
                        {/* Chest division line */}
                        <line x1="100" y1="72" x2="100" y2="120" stroke={selectedMuscle==='chest' ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.05)'} strokeWidth="0.5" strokeDasharray="2,2" />
                        
                        {/* ── ARMS (Biceps) ── */}
                        <path d="M 36 106 Q 28 118 26 134 Q 24 150 30 162 Q 38 170 48 166 Q 58 158 58 142 L 56 110 Z" {...muscleProps('arms')} />
                        <path d="M 164 106 Q 172 118 174 134 Q 176 150 170 162 Q 162 170 152 166 Q 142 158 142 142 L 144 110 Z" {...muscleProps('arms')} />
                        {/* Forearms */}
                        <path d="M 30 162 Q 24 178 26 196 Q 28 210 38 216 Q 48 218 54 210 Q 58 196 56 178 L 48 166 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        <path d="M 170 162 Q 176 178 174 196 Q 172 210 162 216 Q 152 218 146 210 Q 142 196 144 178 L 152 166 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        
                        {/* ── CORE / ABS ── */}
                        <path d="M 70 122 Q 85 118 100 122 Q 115 118 130 122 L 132 185 Q 115 195 100 198 Q 85 195 68 185 Z" {...muscleProps('core')} />
                        {/* 6-pack grid lines */}
                        {[138, 155, 172].map(y => <line key={y} x1="75" y1={y} x2="125" y2={y} stroke={selectedMuscle==='core'?'rgba(249,115,22,0.25)':'rgba(255,255,255,0.04)'} strokeWidth="0.6" />)}
                        <line x1="100" y1="122" x2="100" y2="195" stroke={selectedMuscle==='core'?'rgba(249,115,22,0.25)':'rgba(255,255,255,0.04)'} strokeWidth="0.6" />
                        
                        {/* ── LEGS (Quadriceps) ── */}
                        <path d="M 68 200 Q 78 196 100 198 Q 100 198 86 198 L 82 260 Q 78 290 72 310 Q 66 330 62 350 Q 58 366 64 380 Q 70 390 82 390 Q 92 388 96 372 L 98 310 L 96 260 L 95 205 Q 83 200 68 200 Z" {...muscleProps('legs')} />
                        <path d="M 132 200 Q 122 196 100 198 Q 100 198 114 198 L 118 260 Q 122 290 128 310 Q 134 330 138 350 Q 142 366 136 380 Q 130 390 118 390 Q 108 388 104 372 L 102 310 L 104 260 L 105 205 Q 117 200 132 200 Z" {...muscleProps('legs')} />
                        {/* Calves */}
                        <path d="M 64 380 Q 68 400 70 420 Q 72 440 76 455 L 90 458 Q 96 440 96 420 L 96 390 Q 88 388 82 390 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        <path d="M 136 380 Q 132 400 130 420 Q 128 440 124 455 L 110 458 Q 104 440 104 420 L 104 390 Q 112 388 118 390 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        {/* Feet */}
                        <path d="M 76 455 Q 68 460 64 465 Q 62 470 72 472 L 96 470 Q 100 465 100 458 L 90 458 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        <path d="M 124 455 Q 132 460 136 465 Q 138 470 128 472 L 104 470 Q 100 465 100 458 L 110 458 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                      </g>
                    ) : (
                      <g>
                        {/* HEAD BACK */}
                        <ellipse cx="100" cy="28" rx="22" ry="26" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                        <ellipse cx="100" cy="24" rx="14" ry="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                        {/* Neck */}
                        <path d="M 88 50 Q 100 56 112 50 L 115 68 Q 100 73 85 68 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />

                        {/* ── REAR DELTS / TRAPS ── */}
                        <path d="M 85 68 Q 100 62 115 68 L 118 82 Q 100 78 82 82 Z" {...muscleProps('shoulders')} />
                        {/* Side shoulders */}
                        <path d="M 54 70 Q 40 68 32 82 Q 28 96 36 106 Q 44 115 56 110 L 68 85 Z" {...muscleProps('shoulders')} />
                        <path d="M 146 70 Q 160 68 168 82 Q 172 96 164 106 Q 156 115 144 110 L 132 85 Z" {...muscleProps('shoulders')} />

                        {/* ── BACK (Lats + Rhomboids) ── */}
                        {/* Trapezius upper */}
                        <path d="M 82 82 Q 100 78 118 82 L 130 108 Q 116 118 100 122 Q 84 118 70 108 Z" {...muscleProps('back')} />
                        {/* Lats */}
                        <path d="M 70 108 Q 84 118 100 122 L 96 185 Q 80 192 68 185 Q 58 175 56 155 Q 54 138 62 120 Z" {...muscleProps('back')} />
                        <path d="M 130 108 Q 116 118 100 122 L 104 185 Q 120 192 132 185 Q 142 175 144 155 Q 146 138 138 120 Z" {...muscleProps('back')} />
                        {/* Spine line */}
                        <line x1="100" y1="82" x2="100" y2="188" stroke={selectedMuscle==='back'?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.06)'} strokeWidth="0.7" strokeDasharray="3,3" />

                        {/* ── TRICEPS ── */}
                        <path d="M 36 106 Q 28 118 26 134 Q 24 150 30 162 Q 38 170 48 166 Q 58 158 58 142 L 56 110 Z" {...muscleProps('arms')} />
                        <path d="M 164 106 Q 172 118 174 134 Q 176 150 170 162 Q 162 170 152 166 Q 142 158 142 142 L 144 110 Z" {...muscleProps('arms')} />
                        {/* Forearms */}
                        <path d="M 30 162 Q 24 178 26 196 Q 28 210 38 216 Q 48 218 54 210 Q 58 196 56 178 L 48 166 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        <path d="M 170 162 Q 176 178 174 196 Q 172 210 162 216 Q 152 218 146 210 Q 142 196 144 178 L 152 166 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />

                        {/* ── GLUTES + HAMSTRINGS ── */}
                        <path d="M 68 188 Q 84 192 100 195 Q 85 195 82 205 L 78 250 Q 76 275 72 300 Q 68 325 64 350 Q 60 370 66 384 Q 72 392 84 390 Q 94 386 96 368 L 97 300 L 95 230 L 93 205 Q 83 200 68 200 Z" {...muscleProps('legs')} />
                        <path d="M 132 188 Q 116 192 100 195 Q 115 195 118 205 L 122 250 Q 124 275 128 300 Q 132 325 136 350 Q 140 370 134 384 Q 128 392 116 390 Q 106 386 104 368 L 103 300 L 105 230 L 107 205 Q 117 200 132 200 Z" {...muscleProps('legs')} />
                        {/* Calves back */}
                        <path d="M 66 384 Q 68 404 70 422 Q 72 442 76 456 L 90 458 Q 96 440 96 420 L 96 390 Q 88 388 84 390 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        <path d="M 134 384 Q 132 404 130 422 Q 128 442 124 456 L 110 458 Q 104 440 104 420 L 104 390 Q 112 388 116 390 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />

                        {/* ── LOWER BACK / CORE ── */}
                        <path d="M 82 185 Q 100 192 118 185 L 120 205 Q 100 210 80 205 Z" {...muscleProps('core')} />

                        {/* Feet */}
                        <path d="M 76 456 Q 68 462 63 467 Q 61 472 72 473 L 96 470 Q 100 465 100 458 L 90 458 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                        <path d="M 124 456 Q 132 462 137 467 Q 139 472 128 473 L 104 470 Q 100 465 100 458 L 110 458 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
                      </g>
                    )}

                    {/* Holographic scanline overlay */}
                    <rect x="0" y="0" width="200" height="480" fill="none" stroke="rgba(6,182,212,0.04)" strokeWidth="0.5" />
                  </svg>

                  {/* Active selection indicator */}
                  {selectedMuscle && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background:'rgba(0,0,0,0.6)', border:`1px solid ${MUSCLES[selectedMuscle]?.color}44`, backdropFilter:'blur(10px)' }}>
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: MUSCLES[selectedMuscle]?.color, boxShadow:`0 0 8px ${MUSCLES[selectedMuscle]?.glow}` }} />
                        <div>
                          <div className="text-xs font-black text-white">{MUSCLES[selectedMuscle]?.label}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>CNS Fatigue: {fatigue[selectedMuscle] || 0}%</div>
                        </div>
                        <button onClick={()=>setSelectedMuscle(null)} className="ml-auto text-white/20 hover:text-white/60 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercise Suggestions Panel */}
                {selectedMuscle && (
                  <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} className="w-48 shrink-0 border-l flex flex-col" style={{ borderColor:'rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.2)' }}>
                    <div className="px-3 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                      <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: MUSCLES[selectedMuscle]?.color }}>Exercises</div>
                      <div className="text-xs font-black text-white">{MUSCLES[selectedMuscle]?.label}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {MUSCLES[selectedMuscle]?.exercises.map(ex => (
                        <button key={ex} onClick={() => { setForm(f=>({...f, name:ex, sets:3, reps:10})); toast.success(`Selected: ${ex}`) }}
                          className="w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-bold group"
                          style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.7)' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                          onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                          {ex}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── EXERCISE LOGGER ── (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Log form */}
              <div className="rounded-3xl p-5 flex-1" style={{ background:'linear-gradient(135deg, #080c14, #0a0a12)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full" style={{ background:'linear-gradient(180deg, #06b6d4, #8b5cf6)' }} />
                    {editingId ? 'Edit Exercise' : 'Log Exercise'}
                  </h3>
                  {!editingId && (
                    <GlowButton onClick={askAIWorkout} disabled={suggestingWorkout} variant="ghost" className="text-[9px] uppercase tracking-widest border-violet-500/20 py-1">
                      {suggestingWorkout ? 'Recommending...' : '✨ Ask AI Recommendation'}
                    </GlowButton>
                  )}
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest mb-1 block" style={{ color:'rgba(255,255,255,0.35)' }}>Exercise Name</label>
                    <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Bench Press" className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white placeholder-white/20 focus:outline-none transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }} onFocus={e=>e.target.style.borderColor='rgba(6,182,212,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[['Sets','sets'],['Reps','reps'],['kg','weight']].map(([l,k])=>(
                      <div key={k}>
                        <label className="text-[9px] font-black uppercase tracking-widest mb-1 block" style={{ color:'rgba(255,255,255,0.35)' }}>{l}</label>
                        <input type="number" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full px-2 py-2.5 rounded-xl text-sm font-black text-white text-center focus:outline-none transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }} onFocus={e=>e.target.style.borderColor='rgba(6,182,212,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[['Duration (min)','duration'],['Calories','calories']].map(([l,k])=>(
                      <div key={k}>
                        <label className="text-[9px] font-black uppercase tracking-widest mb-1 block" style={{ color:'rgba(255,255,255,0.35)' }}>{l}</label>
                        <input type="number" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white focus:outline-none transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }} onFocus={e=>e.target.style.borderColor='rgba(6,182,212,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest mb-1 block" style={{ color:'rgba(255,255,255,0.35)' }}>Date</label>
                    <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white focus:outline-none transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', colorScheme:'dark' }} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest mb-1 block" style={{ color:'rgba(255,255,255,0.35)' }}>Notes</label>
                    <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Form cues, tempo, feel..." className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white placeholder-white/15 focus:outline-none transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }} onFocus={e=>e.target.style.borderColor='rgba(6,182,212,0.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={submit} className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95" style={{ background:'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow:'0 0 20px rgba(6,182,212,0.2)' }}>
                    {editingId ? 'Update' : '+ Log Exercise'}
                  </button>
                  {editingId && <button onClick={()=>{setEditingId(null);setForm({name:'',sets:3,reps:10,weight:0,duration:0,calories:0,date:todayISO(),notes:''})}} className="px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white/40 transition-all hover:text-white/70" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>Cancel</button>}
                </div>
              </div>

              {/* Weekly Volume Bars */}
              <div className="rounded-3xl p-5" style={{ background:'linear-gradient(135deg, #080c14, #0a0a12)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Weekly Set Volume</h3>
                <div className="flex items-end gap-1.5 h-20">
                  {weeklyVol.map(({label,sets},i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden" style={{ height:`${Math.max(4, sets ? (sets/Math.max(...weeklyVol.map(d=>d.sets),1))*64 : 4)}px`, background:'linear-gradient(180deg, #06b6d4, #8b5cf6)', opacity: sets ? 1 : 0.2 }}>
                        {sets > 0 && <div className="absolute inset-0 animate-pulse" style={{ background:'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)' }} />}
                      </div>
                      <span className="text-[9px] font-black uppercase" style={{ color:'rgba(255,255,255,0.25)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ GOKU POWER COMPANION ═══ */}
          <GokuCompanion items={items} activeSession={activeSession} />

          {/* Row 2: History + Calories chart */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-3xl p-5" style={{ background:'linear-gradient(135deg, #080c14, #0a0a12)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Calories Burned (14d)</h3>
              {byDay.length === 0 ? <div className="h-44 flex items-center justify-center text-white/20 text-xs">No data yet — start logging</div> :
                <ResponsiveContainer width="100%" height={176}>
                  <RBarChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.15)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} />
                    <Tooltip contentStyle={{ ...TT_STYLE, fontSize:11 }} />
                    <Bar dataKey="calories" radius={[6,6,0,0]}>
                      {byDay.map((_,i) => <Cell key={i} fill={`hsl(${190+i*5}, 80%, ${45+i*2}%)`} />)}
                    </Bar>
                  </RBarChart>
                </ResponsiveContainer>}
            </div>

            <div className="rounded-3xl p-5" style={{ background:'linear-gradient(135deg, #080c14, #0a0a12)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Recent Sessions</h3>
              {items.length === 0 ? <div className="h-44 flex items-center justify-center text-white/20 text-xs">No sessions yet</div> :
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {items.slice(0, 10).map(i => (
                    <div key={i.id} className="flex items-center justify-between py-2.5 px-3 rounded-2xl group transition-all" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                      <div>
                        <p className="text-xs font-black text-white">{i.name}</p>
                        <p className="text-[10px] font-medium mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{i.sets}×{i.reps} · {i.weight}kg · {fmtDate(i.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {i.calories > 0 && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background:'rgba(236,72,153,0.1)', color:'#f472b6', border:'1px solid rgba(236,72,153,0.2)' }}>{i.calories}cal</span>}
                        <button onClick={()=>startEdit(i)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all" style={{ color:'#67e8f9' }}><NotebookPen className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>del(i.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all" style={{ color:'#f87171' }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ AI WORKOUT WIZARD MODAL ═══ */}
      {showAiModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(20px)' }}>
          <motion.div initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} className="w-full max-w-xl rounded-3xl overflow-hidden relative" style={{ background:'linear-gradient(135deg, #080c14 0%, #0d0a1a 100%)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(6,182,212,0.08)' }}>
            {/* Glow top */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), rgba(139,92,246,0.6), transparent)' }} />
            
            <div className="px-6 pt-6 pb-5 border-b flex items-center justify-between" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))', border:'1px solid rgba(6,182,212,0.2)' }}>
                  <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">AI Workout Wizard</h3>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>Powered by GPT-4o — Biomechanical Optimization</p>
                </div>
              </div>
              <button onClick={()=>{setShowAiModal(false);setGeneratedWorkout(null)}} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10" style={{ color:'rgba(255,255,255,0.4)' }}><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {!generatedWorkout && !generating && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Training Goal', aiGoal, setAiGoal, ['Hypertrophy','Strength','Fat Loss','Endurance','Athletic Performance','Powerbuilding']],
                      ['Training Split', aiSplit, setAiSplit, ['Full Body','Push/Pull/Legs','Upper/Lower','Bro Split','Chest & Tris / Back & Bis','Core & Cardio']],
                      ['Expertise Level', aiLevel, setAiLevel, ['beginner','intermediate','advanced','elite']],
                      ['Intensity', aiIntensity, setAiIntensity, ['Low (Recovery)','Medium (Standard)','High (Intense)','Insane (Boss Fight)']],
                    ].map(([label, val, setter, opts]) => (
                      <div key={label}>
                        <label className="text-[9px] font-black uppercase tracking-widest mb-1.5 block" style={{ color:'rgba(255,255,255,0.35)' }}>{label}</label>
                        <select value={val} onChange={e=>setter(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white focus:outline-none transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', colorScheme:'dark' }}>
                          {opts.map(o => <option key={o} value={o} className="bg-zinc-900">{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest mb-1.5 block" style={{ color:'rgba(255,255,255,0.35)' }}>Duration (minutes)</label>
                      <input type="number" value={aiDuration} onChange={e=>setAiDuration(e.target.value)} placeholder="60" className="w-full px-3 py-2.5 rounded-xl text-sm font-black text-white focus:outline-none" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest mb-1.5 block" style={{ color:'rgba(16,185,129,0.7)' }}>Force-Include Exercises (optional)</label>
                    <input value={aiInclude} onChange={e=>setAiInclude(e.target.value)} placeholder="e.g. Bench Press, Deadlift" className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white placeholder-white/20 focus:outline-none" style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)' }} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest mb-1.5 block" style={{ color:'rgba(239,68,68,0.7)' }}>Exclude / Avoid (optional)</label>
                    <input value={aiExclude} onChange={e=>setAiExclude(e.target.value)} placeholder="e.g. Barbell Squat (knee injury)" className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white placeholder-white/20 focus:outline-none" style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)' }} />
                  </div>
                  <button onClick={handleGenerateWorkout} className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5" style={{ background:'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow:'0 0 40px rgba(6,182,212,0.25)' }}>
                    <Sparkles className="w-4 h-4" /> Forge My Program
                  </button>
                </>
              )}

              {generating && (
                <div className="py-16 flex flex-col items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 animate-spin" style={{ borderColor:'rgba(6,182,212,0.2)', borderTopColor:'#06b6d4' }} />
                    <div className="absolute inset-2 rounded-full border-2 animate-spin" style={{ borderColor:'rgba(139,92,246,0.2)', borderTopColor:'#8b5cf6', animationDirection:'reverse', animationDuration:'1.2s' }} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-white uppercase tracking-wider">AI Analyzing Biomechanics</div>
                    <p className="text-xs mt-2" style={{ color:'rgba(255,255,255,0.35)' }}>Computing optimal muscle activation patterns, recovery windows, and progressive overload...</p>
                  </div>
                </div>
              )}

              {generatedWorkout && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl" style={{ background:'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(139,92,246,0.06))', border:'1px solid rgba(6,182,212,0.15)' }}>
                    <h4 className="text-base font-black text-white">{generatedWorkout.routineName}</h4>
                    <p className="text-xs mt-1 font-medium" style={{ color:'rgba(6,182,212,0.8)' }}>{generatedWorkout.focus}</p>
                  </div>
                  <div className="space-y-2">
                    {generatedWorkout.exercises?.map((ex, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex-1">
                          <div className="text-xs font-black text-white">{ex.name}</div>
                          <div className="text-[10px] mt-0.5 font-medium" style={{ color:'rgba(255,255,255,0.35)' }}>{ex.muscleGroup} · {ex.weightSuggestion || 'Progressive'}</div>
                          {ex.notes && <div className="text-[9px] mt-1 italic" style={{ color:'rgba(139,92,246,0.7)' }}>{ex.notes}</div>}
                        </div>
                        <div className="px-3 py-1.5 rounded-xl shrink-0" style={{ background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.2)' }}>
                          <span className="text-xs font-black" style={{ color:'#67e8f9' }}>{ex.sets}×{ex.reps}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={()=>startSession(generatedWorkout)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95" style={{ background:'linear-gradient(135deg, #06b6d4, #0ea5e9)', boxShadow:'0 0 20px rgba(6,182,212,0.2)' }}>
                      ⚔ Enter Dungeon
                    </button>
                    <button onClick={()=>setGeneratedWorkout(null)} className="px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' }}>
                      Rebuild
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
// ══════════════════════════════════════════════════════════
// JOURNAL
// ══════════════════════════════════════════════════════════
function Journal({ refresh }) {
  const [entries, setEntries] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ date: todayISO(), reflection: '', wins: '', mistakes: '', lessons: '', mood: 'good', energy: 5, tomorrowPlan: '' })
  const [refining, setRefining] = useState(false)

  const load = () => api.get('journal').then(setEntries)
  useEffect(() => { load() }, [])

  const refineJournal = async () => {
    if (!form.reflection) return toast.error('Please write some raw notes first')
    setRefining(true)
    try {
      const res = await api.post('ai/suggest', {
        type: 'journal',
        context: { rawReflection: form.reflection }
      })
      if (res.success && res.data) {
        setForm({
          ...form,
          reflection: res.data.reflection || form.reflection,
          wins: res.data.wins || form.wins,
          mood: res.data.mood || form.mood
        })
        toast.success('Journal entry refined by AI! 🖋️')
      }
    } catch {
      toast.error('AI refinement failed')
    } finally {
      setRefining(false)
    }
  }

  const submit = async () => {
    if (!form.reflection && !form.wins) return toast.error('Write something first')
    if (editingId) {
      await api.patch(`journal/${editingId}`, form)
      toast.success('Journal entry updated ✓')
    } else {
      await api.post('journal', form)
      toast.success('Journal entry saved ✓')
    }
    setEditingId(null)
    setForm({ date: todayISO(), reflection: '', wins: '', mistakes: '', lessons: '', mood: 'good', energy: 5, tomorrowPlan: '' })
    load(); refresh()
  }

  const startEdit = (e) => {
    setEditingId(e.id)
    setForm({
      date: e.date ? e.date.slice(0, 10) : todayISO(),
      reflection: e.reflection || '',
      wins: e.wins || '',
      mistakes: e.mistakes || '',
      lessons: e.lessons || '',
      mood: e.mood || 'good',
      energy: e.energy || 5,
      tomorrowPlan: e.tomorrowPlan || ''
    })
  }

  const del = async (id) => {
    await api.del(`journal/${id}`)
    toast.success('Journal entry deleted')
    load(); refresh()
  }

  const moodColors = { amazing: '#34d399', good: '#22d3ee', okay: '#fbbf24', low: '#f87171' }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Daily Journal" desc="Reflect. Capture wins. Learn from mistakes." />

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-cyan-400" /> {editingId ? "Edit Today's Reflection" : "Today's Reflection"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Mood">
            <Select value={form.mood} onValueChange={v => setForm({ ...form, mood: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amazing">😄 Amazing</SelectItem>
                <SelectItem value="good">🙂 Good</SelectItem>
                <SelectItem value="okay">😐 Okay</SelectItem>
                <SelectItem value="low">😕 Low</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={`Energy (${form.energy}/10)`}>
            <Input type="range" min="1" max="10" value={form.energy} onChange={e => setForm({ ...form, energy: Number(e.target.value) })} className="accent-violet-500" />
          </Field>
        </div>
        <div className="space-y-3">
          <Field label="Reflection"><Textarea rows={3} value={form.reflection} onChange={e => setForm({ ...form, reflection: e.target.value })} placeholder="How was today?" /></Field>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="🏆 Wins"><Textarea rows={2} value={form.wins} onChange={e => setForm({ ...form, wins: e.target.value })} /></Field>
            <Field label="❌ Mistakes"><Textarea rows={2} value={form.mistakes} onChange={e => setForm({ ...form, mistakes: e.target.value })} /></Field>
            <Field label="💡 Lessons"><Textarea rows={2} value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} /></Field>
          </div>
          <Field label="📋 Tomorrow's Plan"><Textarea rows={2} value={form.tomorrowPlan} onChange={e => setForm({ ...form, tomorrowPlan: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <GlowButton onClick={submit}>
            {editingId ? 'Update Entry' : <><Plus className="w-4 h-4" /> Save Entry</>}
          </GlowButton>
          <GlowButton variant="ghost" onClick={refineJournal} disabled={refining} className="border-violet-500/20">
            {refining ? 'Refining...' : '🔮 Refine with AI'}
          </GlowButton>
          {editingId && (
            <GlowButton variant="ghost" onClick={() => {
              setEditingId(null)
              setForm({ date: todayISO(), reflection: '', wins: '', mistakes: '', lessons: '', mood: 'good', energy: 5, tomorrowPlan: '' })
            }}>
              Cancel
            </GlowButton>
          )}
        </div>
      </motion.div>

      <div className="space-y-3">
        {entries.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-5 group relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-white/30" />
                <span className="font-medium text-sm text-white">{fmtDate(e.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs mr-2" style={{ background: `${moodColors[e.mood] || '#8b5cf6'}15`, color: moodColors[e.mood] || '#8b5cf6' }}>
                  Mood: {e.mood}
                </span>
                <span className="text-xs text-white/30 mr-2">Energy: {e.energy}/10</span>
                <button onClick={() => startEdit(e)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                  <NotebookPen className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(e.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {e.reflection && <p className="text-sm text-white/70 mb-3 leading-relaxed">{e.reflection}</p>}
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              {e.wins && <div><p className="text-xs font-medium mb-1" style={{ color: '#34d399' }}>🏆 Wins</p><p className="text-white/40 text-xs">{e.wins}</p></div>}
              {e.mistakes && <div><p className="text-xs font-medium mb-1 text-red-400">❌ Mistakes</p><p className="text-white/40 text-xs">{e.mistakes}</p></div>}
              {e.lessons && <div><p className="text-xs font-medium mb-1 text-yellow-400">💡 Lessons</p><p className="text-white/40 text-xs">{e.lessons}</p></div>}
            </div>
            {e.tomorrowPlan && <div className="mt-3 pt-3 border-t border-white/5"><p className="text-xs font-medium text-cyan-400 mb-1">📋 Tomorrow</p><p className="text-xs text-white/40">{e.tomorrowPlan}</p></div>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// KNOWLEDGE
// ══════════════════════════════════════════════════════════
function Knowledge({ refresh }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'book', category: 'general', author: '', notes: '', confidence: 3, status: 'reading', revisionCount: 0 })
  const load = () => api.get('knowledge').then(setItems)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.title) return toast.error('Title required')
    if (editingId) {
      await api.patch(`knowledge/${editingId}`, form)
      toast.success('Knowledge updated ✓')
    } else {
      await api.post('knowledge', form)
      toast.success('Added to Vault ✓')
    }
    setOpen(false)
    setEditingId(null)
    setForm({ title: '', type: 'book', category: 'general', author: '', notes: '', confidence: 3, status: 'reading', revisionCount: 0 })
    load(); refresh()
  }

  const startEdit = (k) => {
    setEditingId(k.id)
    setForm({
      title: k.title,
      type: k.type || 'book',
      category: k.category || 'general',
      author: k.author || '',
      notes: k.notes || '',
      confidence: k.confidence || 3,
      status: k.status || 'reading',
      revisionCount: k.revisionCount || 0
    })
    setOpen(true)
  }

  const del = async (id) => { await api.del(`knowledge/${id}`); load(); refresh() }

  const filtered = items.filter(i =>
    (filterType === 'all' || i.type === filterType) &&
    (search === '' || (i.title + i.notes + i.author).toLowerCase().includes(search.toLowerCase()))
  )

  const typeIcons = { book: '📚', course: '🎓', article: '📰', paper: '📄', topic: '🏷️', concept: '💡' }
  const confidenceColors = ['#f87171', '#fbbf24', '#fbbf24', '#34d399', '#22d3ee']

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Knowledge Vault" desc="Books, courses, papers and concepts you've learned." action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm({ title: '', type: 'book', category: 'general', author: '', notes: '', confidence: 3, status: 'reading', revisionCount: 0 }) } }}>
          <DialogTrigger asChild><GlowButton onClick={() => { setEditingId(null); setForm({ title: '', type: 'book', category: 'general', author: '', notes: '', confidence: 3, status: 'reading', revisionCount: 0 }) }}><Plus className="w-4 h-4" /> New Entry</GlowButton></DialogTrigger>
          <DialogContent style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(40px)' }}>
            <DialogHeader><DialogTitle className="aurora-text">{editingId ? 'Edit Vault Entry' : 'Add to Vault'}</DialogTitle></DialogHeader>
            <Field label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['book', 'course', 'article', 'paper', 'topic', 'concept'].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="reading">In Progress</SelectItem><SelectItem value="done">Completed</SelectItem><SelectItem value="paused">Paused</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Author"><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></Field>
              <Field label="Category"><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></Field>
              <Field label={`Confidence (${form.confidence}/5)`}>
                <Input type="range" min="1" max="5" value={form.confidence} onChange={e => setForm({ ...form, confidence: Number(e.target.value) })} className="accent-violet-500" />
              </Field>
              <Field label="Revisions"><Input type="number" value={form.revisionCount} onChange={e => setForm({ ...form, revisionCount: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Notes"><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
            <DialogFooter><GlowButton onClick={submit}>{editingId ? 'Update' : 'Save'}</GlowButton></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vault…" className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilter}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {['book', 'course', 'article', 'paper', 'topic', 'concept'].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((k, i) => (
          <motion.div key={k.id} variants={scaleIn}>
            <div className="glass-card rounded-2xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{typeIcons[k.type] || '📖'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>{k.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(k)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                    <NotebookPen className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => del(k.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{k.title}</h3>
              {k.author && <p className="text-xs text-white/30 mb-1">{k.author}</p>}
              {k.notes && <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">{k.notes}</p>}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${k.status === 'done' ? '' : k.status === 'reading' ? '' : ''}`}
                  style={{
                    background: k.status === 'done' ? 'rgba(52,211,153,0.1)' : k.status === 'reading' ? 'rgba(34,211,238,0.1)' : 'rgba(251,191,36,0.1)',
                    color: k.status === 'done' ? '#34d399' : k.status === 'reading' ? '#22d3ee' : '#fbbf24'
                  }}>
                  {k.status}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="w-1.5 h-3 rounded-sm transition-all"
                      style={{ background: j <= k.confidence ? confidenceColors[k.confidence - 1] : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-white/25 text-sm py-12">No entries found</p>}
      </motion.div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════
function Analytics({ stats }) {
  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    </div>
  )
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Analytics" desc="Deep dive into every metric of your personal growth." />

      <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4">Monthly Study Trend (30d)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.monthlyStudy}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <Tooltip contentStyle={TT_STYLE} />
              <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#ag)" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4">Habit Completion (7d)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RBarChart data={stats.habit7}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <Tooltip contentStyle={TT_STYLE} />
              <Bar dataKey="percent" fill="#f472b6" radius={[6, 6, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-1">Subject Strengths</h3>
          <p className="text-xs text-white/25 mb-4">Average understanding score</p>
          {stats.strengths.length === 0 ? <div className="h-48 flex items-center justify-center text-white/25 text-sm">No data</div> :
            <ResponsiveContainer width="100%" height={240}>
              <RBarChart data={stats.strengths} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" domain={[0, 5]} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.2)" fontSize={10} width={100} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="score" fill="#22d3ee" radius={[0, 6, 6, 0]}>
                  {stats.strengths.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </RBarChart>
            </ResponsiveContainer>}
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4">Weekly Productivity Mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RBarChart data={stats.weeklyStudy}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <Tooltip contentStyle={TT_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
              <Bar dataKey="hours" fill="#8b5cf6" name="Study hrs" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" fill="#22d3ee" name="Tasks" radius={[4, 4, 0, 0]} />
              <Bar dataKey="habits" fill="#f472b6" name="Habits" radius={[4, 4, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4">Data Captured</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Study Logs', value: stats.counts.studyLogs, color: '#22d3ee' },
            { label: 'Habits', value: stats.counts.habits, color: '#f472b6' },
            { label: 'Tasks', value: stats.counts.tasks, color: '#34d399' },
            { label: 'Goals', value: stats.counts.goals, color: '#fbbf24' },
            { label: 'Journal', value: stats.counts.journal, color: '#a78bfa' },
          ].map(d => (
            <div key={d.label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-2xl font-black" style={{ color: d.color }}>{d.value}</p>
              <p className="text-xs text-white/30 mt-1">{d.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// REVISION GATE (AI MCQ SYSTEM)
// ══════════════════════════════════════════════════════════
function QuizRevision({ refresh }) {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingTime, setLoadingTime] = useState(0)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [graded, setGraded] = useState(false)
  const [score, setScore] = useState(0)
  const [savedQuizzes, setSavedQuizzes] = useState([])

  // Load saved quizzes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedQuizzes')
    if (saved) {
      setSavedQuizzes(JSON.parse(saved))
    }
  }, [])

  // Save quiz to localStorage when generated
  const saveQuizToStorage = (quizData, topicName) => {
    const newQuiz = {
      id: Date.now(),
      topic: topicName,
      quiz: quizData,
      createdAt: new Date().toISOString()
    }
    const updated = [newQuiz, ...savedQuizzes].slice(0, 20) // Keep last 20 quizzes
    setSavedQuizzes(updated)
    localStorage.setItem('savedQuizzes', JSON.stringify(updated))
  }

  // Load a saved quiz
  const loadSavedQuiz = (savedQuiz) => {
    setTopic(savedQuiz.topic)
    setQuiz(savedQuiz.quiz)
    setAnswers({})
    setGraded(false)
    setScore(0)
    toast.success(`Loaded quiz: ${savedQuiz.topic}`)
  }

  // Delete a saved quiz
  const deleteSavedQuiz = (id) => {
    const updated = savedQuizzes.filter(q => q.id !== id)
    setSavedQuizzes(updated)
    localStorage.setItem('savedQuizzes', JSON.stringify(updated))
    toast.success('Quiz deleted')
  }

  const generate = async () => {
    if (!topic.trim()) return toast.error('Enter a topic or subject first')
    setLoading(true)
    setLoadingProgress(0)
    setLoadingTime(0)
    setQuiz(null)
    setAnswers({})
    setGraded(false)
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
      setLoadingTime(prev => prev + 1)
    }, 1000)
    
    try {
      const res = await api.post('ai/generate-quiz', { topic, questionCount: 20 })
      if (res.error) throw new Error(res.error)
      setLoadingProgress(100)
      setQuiz(res.quiz)
      saveQuizToStorage(res.quiz, topic)
      toast.success('Revision Gate Open! Beat the test to restore Mind Sharpness! ⚔️')
    } catch (e) {
      toast.error(e.message || 'Failed to generate test questions')
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
      setLoadingProgress(0)
      setLoadingTime(0)
    }
  }

  const handleSelect = (qIdx, optIdx) => {
    if (graded) return
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const submitQuiz = async () => {
    if (Object.keys(answers).length < 20) {
      return toast.error('Answer all 20 questions to complete the trial!')
    }
    let correct = 0
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++
    })
    setScore(correct)
    setGraded(true)

    // Award bonus XP and reset sharpness decay via completing a trial session
    // We log a 0.5h revision training session automatically!
    await api.post('study-logs', {
      subject: 'Revision Gate',
      topic: topic,
      subtopic: `Passed Trial: Score ${correct}/20`,
      hours: 0.5,
      difficulty: 'hard',
      understanding: Math.max(1, correct),
      notes: `Revision trial completed via AI Gate. Score: ${correct}/20.`,
      resources: 'AI Instructor',
      revision: true
    })

    if (correct >= 16) {
      toast.success(`VICTORY! Score: ${correct}/20. Massive XP and mind sharpness restored! 🎉`)
    } else {
      toast.error(`DEFEAT! Score: ${correct}/20. You need at least 16 correct answers. Retry training. 💀`)
    }
    refresh()
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Revision Gate" desc="Deploy AI-generated trials to alignment-check your knowledge streams. High-score grants XP and boosts Mind Sharpness." icon={Award} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Quizzes Sidebar */}
        <motion.div variants={fadeUp} className="lg:col-span-1 glass-card rounded-3xl p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Library className="w-4 h-4 text-cyan-400" /> Saved Quizzes
          </h3>
          <ScrollArea className="h-[400px] pr-4">
            {savedQuizzes.length === 0 ? (
              <div className="text-center text-white/30 text-sm py-8">No saved quizzes yet</div>
            ) : (
              <div className="space-y-2">
                {savedQuizzes.map((saved) => (
                  <div key={saved.id} className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <button 
                        onClick={() => loadSavedQuiz(saved)}
                        className="flex-1 text-left"
                      >
                        <p className="text-xs font-semibold text-white/90 line-clamp-2">{saved.topic}</p>
                        <p className="text-[10px] text-white/40 mt-1">{new Date(saved.createdAt).toLocaleDateString()}</p>
                      </button>
                      <button 
                        onClick={() => deleteSavedQuiz(saved.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>

        {/* Main Quiz Area */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Configure Trial Gate</h3>
            <div className="flex gap-3">
              <Input 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                placeholder="e.g., Quantum Physics, Next.js Middleware, JavaScript Closures" 
                className="flex-1 bg-black/40 border-white/10"
                disabled={loading}
              />
              <GlowButton onClick={generate} disabled={loading} className="shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Open Revision Gate
              </GlowButton>
            </div>
            
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-400 font-semibold">Generating AI Trial...</span>
                  <span className="text-white/60">{Math.round(loadingProgress)}% • {loadingTime}s</span>
                </div>
                <Progress value={loadingProgress} className="h-2 bg-white/10" />
                <p className="text-[10px] text-white/40">
                  AI is crafting {20} challenging questions for "{topic}"... This may take up to 2 minutes due to high demand.
                </p>
              </motion.div>
            )}
          </motion.div>

      {quiz && (
        <motion.div variants={stagger} className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-lg text-cyan-400">Gate Active: {topic}</h3>
            {graded && (
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${score >= 16 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                Result: {score >= 16 ? 'S-Rank Clean' : 'Trial Failed'} ({score}/20 Correct)
              </span>
            )}
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, qIdx) => (
              <motion.div key={qIdx} variants={fadeUp} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
                <p className="font-semibold text-white/90 text-sm mb-3">Q{qIdx + 1}: {q.question}</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[qIdx] === optIdx
                    let optStyle = { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }
                    
                    if (isSelected) {
                      optStyle = { background: 'rgba(34,211,238,0.15)', borderColor: 'rgba(34,211,238,0.5)' }
                    }
                    if (graded) {
                      if (optIdx === q.correctAnswer) {
                        optStyle = { background: 'rgba(52,211,153,0.2)', borderColor: 'rgba(52,211,153,0.6)' }
                      } else if (isSelected) {
                        optStyle = { background: 'rgba(248,113,113,0.2)', borderColor: 'rgba(248,113,113,0.6)' }
                      }
                    }

                    return (
                      <button 
                        key={optIdx} 
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className="p-3 rounded-xl text-left text-xs transition-all border hover:border-cyan-500/40 text-white/70 hover:text-white"
                        style={optStyle}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {graded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
                    <strong className="text-cyan-400 block mb-1">Explanation:</strong>
                    {q.explanation}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {!graded && (
            <div className="flex justify-center pt-4">
              <GlowButton onClick={submitQuiz} className="px-8 py-3 text-base">
                ⚔️ Finalize Quest & Submit Analysis
              </GlowButton>
            </div>
          )}
        </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// MEDITATION CHAMBER (MANA BREATHING & ANIMATED CHAKRAS)
// ══════════════════════════════════════════════════════════
function Meditate({ refresh }) {
  const [active, setActive] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    let t
    if (active) {
      t = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(t)
  }, [active])

  // Canvas chakra animation logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frameId
    let rotation = 0

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = 360
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      
      // Draw animated chakra/mana core
      const pulse = 100 + Math.sin(Date.now() / 600) * 15
      
      // Draw flowing outer chakra streams
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      rotation += active ? 0.012 : 0.003

      // Draw star lines
      for (let i = 0; i < 6; i++) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.1 + (i * 0.05)})`
        ctx.lineWidth = 1.5
        ctx.arc(0, 0, pulse + (i * 20), 0, Math.PI * 1.5)
        ctx.stroke()
      }
      ctx.restore()

      // Draw central chakra core
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pulse * 0.6)
      grad.addColorStop(0, 'rgba(236, 72, 153, 0.9)')  // Pink core
      grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)') // Violet stream
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)')     // Cyan outer
      
      ctx.beginPath()
      ctx.fillStyle = grad
      ctx.arc(cx, cy, pulse * 0.7, 0, Math.PI * 2)
      ctx.fill()

      // Drawing orbit particles
      const count = 35
      for (let i = 0; i < count; i++) {
        const angle = (i * (Math.PI * 2) / count) + (Date.now() * 0.0005)
        const dist = pulse + Math.cos(Date.now() / 400 + i) * 12
        const px = cx + Math.cos(angle) * dist
        const py = cy + Math.sin(angle) * dist
        ctx.beginPath()
        ctx.fillStyle = i % 2 === 0 ? '#ec4899' : '#22d3ee'
        ctx.arc(px, py, 1.5 + Math.abs(Math.sin(Date.now() / 200 + i)) * 2, 0, Math.PI * 2)
        ctx.fill()
      }

      frameId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  const toggle = async () => {
    if (active) {
      // Complete meditation, log time
      const min = Math.round(seconds / 60)
      if (min > 0) {
        await api.post('meditations', { duration: min })
        toast.success(`Mana alignment session completed. Aligned ${min} min of chakra streams! 🧘`)
      } else {
        toast.error('Session too short to accumulate Mana.')
      }
      setSeconds(0)
      refresh()
    }
    setActive(!active)
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Meditation Chamber" desc="Realign your spiritual chakras. Calming breathing rhythm increases Mind Sharpness and recovers Mana." icon={Zap} />

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.04) 0%, transparent 80%)' }} />
          
          <div className="relative z-10 flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-pink-400 font-bold">Mana Alignment Flow</span>
            <span className="font-mono text-cyan-400 font-bold">{formatTime(seconds)}</span>
          </div>

          <div className="relative w-full h-[360px] flex items-center justify-center">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Breathing Pattern</span>
              <span className="text-xl font-bold text-white tracking-wide animate-pulse">
                {active ? 'BREATHE DEEP' : 'CHAMBER STANDBY'}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex justify-center pb-4">
            <button 
              onClick={toggle}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${active ? 'bg-rose-500/25 border border-rose-500/40 text-rose-400' : 'fab text-white'}`}
            >
              {active ? 'End Stream Alignment' : 'Initiate Mana Alignment'}
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <div className="glass-card rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Spiritual Alignment Instructions</h3>
            <div className="space-y-3 text-xs text-white/50 leading-relaxed">
              <p>1. Keep a straight back posture and relax your shoulders.</p>
              <p>2. Align your breathing frequency with the pulsing circle glow (Breathe in as it expands, out as it shrinks).</p>
              <p>3. Maintain focus on the central mana core. Let daily worries vanish.</p>
              <p>4. Completing at least 1 full minute awards XP and recovers Mind Sharpness attributes.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-pink-500/20 text-center">
            <span className="text-xs uppercase tracking-widest text-pink-400 font-bold block mb-1">Mana streams recovered today</span>
            <span className="text-3xl font-black text-white">{seconds > 0 ? Math.round(seconds / 60) : 0} min</span>
            <p className="text-[10px] text-white/30 mt-2">Mana alignment counters the decay of Mind Sharpness.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// VISUALIZATION SECTIONS
// ══════════════════════════════════════════════════════════

function DataConstellationSection({ refresh }) {
  const [tasks, setTasks] = useState([])
  const [studyLogs, setStudyLogs] = useState([])
  const [goals, setGoals] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('tasks').then(setTasks).catch(() => setTasks([])),
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('goals').then(setGoals).catch(() => setGoals([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Data Constellation" 
        desc="Your completed tasks become stars forming constellations in the night sky"
        icon={Star}
      />
      <DataConstellation tasks={tasks} studyLogs={studyLogs} goals={goals} />
    </motion.div>
  )
}

function NeuralNetworkSection({ refresh }) {
  const [subjects, setSubjects] = useState([])
  const [skills, setSkills] = useState([])
  const [goals, setGoals] = useState([])
  const [habits, setHabits] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('study-logs').then(logs => {
        const uniqueSubjects = [...new Set(logs?.map(l => l.subject) || [])].map(s => ({ name: s, hours: logs.filter(l => l.subject === s).reduce((sum, l) => sum + (l.hours || 0), 0) }))
        setSubjects(uniqueSubjects)
      }).catch(() => setSubjects([])),
      api.get('knowledge').then(setSkills).catch(() => setSkills([])),
      api.get('goals').then(setGoals).catch(() => setGoals([])),
      api.get('habits').then(setHabits).catch(() => setHabits([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Neural Network Dashboard" 
        desc="Subjects, skills, goals, and habits displayed as nodes in a living AI network"
        icon={Brain}
      />
      <NeuralNetworkDashboard subjects={subjects} skills={skills} goals={goals} habits={habits} />
    </motion.div>
  )
}

function KnowledgeGalaxySection({ refresh }) {
  const [knowledge, setKnowledge] = useState([])
  const [studyLogs, setStudyLogs] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('knowledge').then(setKnowledge).catch(() => setKnowledge([])),
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Knowledge Galaxy" 
        desc="Force-directed graph where knowledge entries become stars with neural links"
        icon={Globe}
      />
      <KnowledgeGalaxy knowledge={knowledge} studyLogs={studyLogs} />
    </motion.div>
  )
}

function GrowthTreeSection({ refresh }) {
  const [studyLogs, setStudyLogs] = useState([])
  const [health, setHealth] = useState([])
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [tasks, setTasks] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('health').then(setHealth).catch(() => setHealth([])),
      api.get('habits').then(setHabits).catch(() => setHabits([])),
      api.get('goals').then(setGoals).catch(() => setGoals([])),
      api.get('tasks').then(setTasks).catch(() => setTasks([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Dynamic Growth Tree" 
        desc="Your life as a tree: knowledge=branches, health=roots, discipline=trunk, achievements=fruits"
        icon={TreeDeciduous}
      />
      <GrowthTree studyLogs={studyLogs} health={health} habits={habits} goals={goals} tasks={tasks} />
    </motion.div>
  )
}

function EvolutionChamberSection({ refresh }) {
  const [stats, setStats] = useState(null)
  const [studyLogs, setStudyLogs] = useState([])
  const [health, setHealth] = useState([])
  const [exercise, setExercise] = useState([])
  const [goals, setGoals] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('stats').then(setStats).catch(() => setStats(null)),
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('health').then(setHealth).catch(() => setHealth([])),
      api.get('exercise').then(setExercise).catch(() => setExercise([])),
      api.get('goals').then(setGoals).catch(() => setGoals([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Evolution Chamber" 
        desc="Digital avatar that evolves based on metrics (intelligence aura, physique, energy field, visual upgrades)"
        icon={User}
      />
      <EvolutionChamber stats={stats} studyLogs={studyLogs} health={health} exercise={exercise} goals={goals} refresh={refresh} />
    </motion.div>
  )
}

function DigitalBrainSection({ refresh }) {
  const [studyLogs, setStudyLogs] = useState([])
  const [knowledge, setKnowledge] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('knowledge').then(setKnowledge).catch(() => setKnowledge([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Digital Brain" 
        desc="3D brain visualization where study sessions activate neurons and strengthen pathways"
        icon={Brain}
      />
      <DigitalBrain studyLogs={studyLogs} knowledge={knowledge} />
    </motion.div>
  )
}

function TimeRiverSection({ refresh }) {
  const [studyLogs, setStudyLogs] = useState([])
  const [goals, setGoals] = useState([])
  const [tasks, setTasks] = useState([])
  const [journal, setJournal] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('goals').then(setGoals).catch(() => setGoals([])),
      api.get('tasks').then(setTasks).catch(() => setTasks([])),
      api.get('journal').then(setJournal).catch(() => setJournal([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Time River" 
        desc="Flowing river timeline where study sessions are memory orbs, goals are islands, achievements are monuments"
        icon={Waves}
      />
      <TimeRiver studyLogs={studyLogs} goals={goals} tasks={tasks} journal={journal} />
    </motion.div>
  )
}

function KnowledgeFractalSection({ refresh }) {
  const [knowledge, setKnowledge] = useState([])
  const [studyLogs, setStudyLogs] = useState([])
  
  useEffect(() => {
    Promise.all([
      api.get('knowledge').then(setKnowledge).catch(() => setKnowledge([])),
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([]))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Knowledge Fractal" 
        desc="Hierarchical knowledge expansion with infinite zoom capability"
        icon={Infinity}
      />
      <KnowledgeFractal knowledge={knowledge} studyLogs={studyLogs} />
    </motion.div>
  )
}

function PricingSection() {
  const { subscription, refreshSubscription } = useSubscription()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (plan) => {
    setLoading(true)
    try {
      // Create Razorpay order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ planId: plan.id, amount: plan.price }),
      })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        setLoading(false)
        return
      }

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'LifeOS',
          description: `${plan.name} Subscription`,
          order_id: data.orderId,
          handler: async function (response) {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.error) {
              toast.error(verifyData.error)
            } else {
              toast.success('Payment successful! Premium features unlocked.')
              refreshSubscription()
            }
            setLoading(false)
          },
          prefill: {
            name: 'LifeOS User',
            email: 'user@example.com',
          },
          theme: {
            color: '#8b5cf6',
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (e) {
      console.error('Payment error:', e)
      toast.error('Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader title="Upgrade Your Journey" desc="Unlock premium features to accelerate your personal growth" icon={Crown} />
      {subscription.isActive && (
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white">Premium Active</p>
              <p className="text-sm text-white/60">Plan: {subscription.plan} • Expires: {new Date(subscription.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
      <PricingPlans onSubscribe={handleSubscribe} loading={loading} />
    </motion.div>
  )
}

function PredictiveFutureSection({ refresh }) {
  const [studyLogs, setStudyLogs] = useState([])
  const [tasks, setTasks] = useState([])
  const [goals, setGoals] = useState([])
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    Promise.all([
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('tasks').then(setTasks).catch(() => setTasks([])),
      api.get('goals').then(setGoals).catch(() => setGoals([])),
      api.get('stats').then(setStats).catch(() => setStats(null))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Predictive Future" 
        desc="Branching timelines showing current path vs future projections (1 year, 5 years)"
        icon={Compass}
      />
      <PredictiveFuture studyLogs={studyLogs} tasks={tasks} goals={goals} stats={stats} />
    </motion.div>
  )
}

function DailyPlanSection({ refresh }) {
  const [studyLogs, setStudyLogs] = useState([])
  const [tasks, setTasks] = useState([])
  const [goals, setGoals] = useState([])
  const [habits, setHabits] = useState([])
  const [exercise, setExercise] = useState([])
  const [meditation, setMeditation] = useState([])
  const [stats, setStats] = useState(null)
  
  const handlePlanUpdate = (plan) => {
    console.log('Plan updated:', plan)
    // Store plan in localStorage or send to API
    localStorage.setItem('dailyPlan', JSON.stringify(plan))
  }
  
  const handleTaskComplete = (itemId, completed, item) => {
    console.log('Task completed:', itemId, completed, item)
    // Update tracking based on item type
    if (item.category === 'study') {
      // Could trigger study log creation
    } else if (item.category === 'exercise') {
      // Could trigger exercise log creation
    } else if (item.category === 'meditation') {
      // Could trigger meditation log creation
    }
  }
  
  useEffect(() => {
    Promise.all([
      api.get('study-logs').then(setStudyLogs).catch(() => setStudyLogs([])),
      api.get('tasks').then(setTasks).catch(() => setTasks([])),
      api.get('goals').then(setGoals).catch(() => setGoals([])),
      api.get('habits').then(setHabits).catch(() => setHabits([])),
      api.get('exercise').then(setExercise).catch(() => setExercise([])),
      api.get('meditations').then(setMeditation).catch(() => setMeditation([])),
      api.get('stats').then(setStats).catch(() => setStats(null))
    ])
  }, [])
  
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <SectionHeader 
        title="Daily Plan Dashboard" 
        desc="AI-generated personalized daily plans with interactive checklists that connect to all your tracking data"
        icon={Sparkles}
      />
      <DailyPlanDashboard 
        studyLogs={studyLogs} 
        tasks={tasks} 
        goals={goals} 
        habits={habits} 
        exercise={exercise} 
        meditation={meditation} 
        stats={stats}
        onPlanUpdate={handlePlanUpdate}
        onTaskComplete={handleTaskComplete}
      />
    </motion.div>
  )
}

function SidebarManaParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 250),
        y: Math.random() * (canvas.height || 800),
        size: Math.random() * 1.5 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        color: ['#fbbf24', '#a78bfa', '#22d3ee', '#34d399'][Math.floor(Math.random() * 4)]
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y += p.speedY
        p.x += p.speedX
        if (p.y < 0) {
          p.y = canvas.height
          p.x = Math.random() * canvas.width
        }
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30 z-0"
    />
  )
}

function HolographicProjector({ activeId }) {
  const activeItem = useMemo(() => {
    return NAV.find(n => n.id === activeId) || NAV[0]
  }, [activeId])

  return (
    <div className="relative h-44 flex flex-col items-center justify-end pb-4 border-b border-white/5 overflow-hidden w-full shrink-0">
      {/* Light Projection Rays */}
      <div 
        className="absolute bottom-6 w-24 h-32 pointer-events-none transition-all duration-500"
        style={{
          background: `linear-gradient(0deg, ${activeItem.color}25 0%, ${activeItem.color}00 80%)`,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(8px)',
        }}
      />
      <div 
        className="absolute bottom-6 w-12 h-28 pointer-events-none transition-all duration-500 animate-pulse"
        style={{
          background: `linear-gradient(0deg, ${activeItem.color}35 0%, ${activeItem.color}00 100%)`,
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(4px)',
        }}
      />

      {/* Floating Holographic Info */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 flex flex-col items-center text-center z-10 w-full px-4"
      >
        {/* Rotating Magic Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border border-dashed flex items-center justify-center mb-1"
          style={{ borderColor: `${activeItem.color}40`, boxShadow: `0 0 10px ${activeItem.color}20` }}
        >
          <div className="w-8 h-8 rounded-full border border-double" style={{ borderColor: `${activeItem.color}25` }} />
        </motion.div>

        {/* Dynamic Hologram Stats */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border mb-1 font-mono"
              style={{ color: activeItem.color, borderColor: `${activeItem.color}30`, background: `${activeItem.color}08` }}>
              {activeItem.school} School
            </span>
            <span className="text-[10px] font-black uppercase text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] truncate max-w-[200px]">
              {activeItem.spellName}
            </span>
            <span className="text-[8px] font-mono mt-0.5 text-white/50">
              Mana Cost: <span className="font-bold" style={{ color: activeItem.color }}>{activeItem.manaCost}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Vector Open Grimoire Book */}
      <div className="relative z-10 flex flex-col items-center">
        <svg viewBox="0 0 100 60" className="w-20 h-12 transition-all duration-500" style={{ color: activeItem.color, filter: `drop-shadow(0 0 8px ${activeItem.color}40)` }} fill="currentColor">
          {/* Left Page shadow/backing */}
          <path d="M50,55 C35,50 15,50 5,53 L5,15 C15,12 35,12 50,17 Z" fill="rgba(0,0,0,0.4)" />
          {/* Right Page shadow/backing */}
          <path d="M50,55 C65,50 85,50 95,53 L95,15 C85,12 65,12 50,17 Z" fill="rgba(0,0,0,0.4)" />
          
          {/* Left Page Page */}
          <path d="M50,53 C35,48 15,48 5,51 L5,13 C15,10 35,10 50,15 Z" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeWidth="1.2" />
          {/* Right Page Page */}
          <path d="M50,53 C65,48 85,48 95,51 L95,13 C85,10 65,10 50,15 Z" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeWidth="1.2" />
          
          {/* Book Spine */}
          <line x1="50" y1="13" x2="50" y2="53" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Runic text lines left page */}
          <path d="M12,20 C22,18 38,18 45,21 M12,28 C22,26 38,28 45,31 M12,36 C22,34 38,36 45,39 M12,44 C22,42 38,42 45,45" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 2" />
          {/* Runic text lines right page */}
          <path d="M88,20 C78,18 62,18 55,21 M88,28 C78,26 62,28 55,31 M88,36 C78,34 62,36 55,39 M88,44 C78,42 62,42 55,45" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 2" />
        </svg>
        <span className="text-[7px] font-mono uppercase tracking-widest text-white/30 mt-1">Active Grimoire</span>
      </div>
    </div>
  )
}

const sidebarSpellVariants = {
  closed: {
    x: '-100%',
    opacity: 0,
    rotateY: -45,
    skewY: -4,
    scale: 0.92,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 35
    }
  },
  open: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    skewY: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 24,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

function SidebarContent({
  mobileOpen,
  setMobileOpen,
  desktopCollapsed,
  setDesktopCollapsed,
  setGrimoireExpanded,
  active,
  triggerTransition,
  time,
  logout,
  stats
}) {
  return (
    <>
      {/* Golden corner grimoire accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/40 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/40 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/40 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/40 pointer-events-none z-10" />

      <SidebarManaParticles />

      {/* Logo */}
      <div className="p-5 border-b border-white/5 relative z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl logo-pulse flex items-center justify-center animate-pulse"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 0 10px rgba(251,191,36,0.3)' }}>
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="font-black tracking-tight text-white text-base leading-none uppercase">SYSTEM PANEL</p>
              <p className="text-[10px] text-amber-500/80 font-mono tracking-widest mt-0.5">Active Control Center</p>
            </div>
          </div>
          {/* Desktop Collapse button */}
          <button 
            className="hidden lg:block text-white/30 hover:text-amber-400 p-1 ml-auto transition-colors cursor-pointer group animate-pulse" 
            onClick={() => setDesktopCollapsed(true)}
            title="Collapse Sidebar"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          {/* Mobile Close button */}
          <button className="lg:hidden text-white/30 hover:text-white p-1" onClick={() => setMobileOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expand Grimoire Deck Button */}
      <div className="p-3 border-b border-white/5 relative z-10 shrink-0">
        <button
          onClick={() => setGrimoireExpanded(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>🔮 Expand System Panel</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-4.5 flex-1 overflow-y-auto relative z-10 scrollbar-thin">
        {NAV_CATEGORIES.map(cat => {
          const catItems = NAV.filter(item => cat.ids.includes(item.id))
          return (
            <div key={cat.title} className="space-y-1.5">
              <span className="px-2.5 text-[8px] font-black uppercase tracking-widest block font-mono" style={{ color: `${cat.color}aa` }}>
                // {cat.title}
              </span>
              <div className="space-y-1">
                {catItems.map(n => {
                  const isActive = active === n.id
                  return (
                    <motion.button key={n.id}
                      whileHover={{ 
                        scale: 1.02, 
                        x: 4, 
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        boxShadow: `0 0 12px ${n.color}15`,
                        borderColor: `${n.color}30`
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        fireFX('sidebarSelect', { x: e.clientX, y: e.clientY, color: n.color })
                        triggerTransition(n.id)
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all duration-300 relative overflow-hidden
                        ${isActive ? 'text-white font-bold bg-white/5' : 'text-white/40 hover:text-white/80'}`}
                      style={{
                        borderColor: isActive ? `${n.color}40` : 'rgba(255,255,255,0.03)',
                        background: isActive ? `linear-gradient(90deg, ${n.color}08, transparent)` : 'transparent'
                      }}
                    >
                      {/* Active dynamic runic ring highlight */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeRunicBorder"
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                          style={{ backgroundColor: n.color, boxShadow: `0 0 10px ${n.color}` }}
                        />
                      )}
                      
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 relative overflow-hidden"
                        style={isActive ? { background: `${n.color}15`, border: `1px solid ${n.color}35`, boxShadow: `0 0 10px ${n.color}30` } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {isActive && (
                          <motion.div 
                            className="absolute inset-0 rounded-lg border border-dashed pointer-events-none opacity-40"
                            style={{ borderColor: n.color }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                        <n.icon className="w-3.5 h-3.5 z-10" style={isActive ? { color: n.color, filter: `drop-shadow(0 0 4px ${n.color})` } : {}} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center leading-none">
                          <span className="text-[11px] font-bold tracking-wide truncate">{n.label}</span>
                          <span className="text-[6px] font-bold opacity-60 uppercase tracking-widest px-1 py-0.2 rounded border ml-2"
                            style={{ color: n.color, borderColor: `${n.color}20`, background: `${n.color}05` }}>
                            {n.manaCost}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs text-white/25">
          <div className="flex items-center gap-1.5">
            <Award className="w-3 h-3 text-amber-500" />
            <span>Build something great</span>
          </div>
          <span className="font-mono text-amber-500/60">{time}</span>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full py-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs font-medium"
        >
          Sign Out
        </Button>
        {stats && (
          <div className="mt-2 flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-orange-400" style={{ filter: 'drop-shadow(0 0 4px #fb923c)' }} />
            <span className="text-xs text-white/40">{stats.streak} day streak</span>
          </div>
        )}
      </div>
    </>
  )
}

function ExpandedGrimoireDeck({ isOpen, onClose, active, triggerTransition, stats }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredCategories = NAV_CATEGORIES.map(cat => {
    const items = NAV.filter(item => {
      if (!cat.ids.includes(item.id)) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        item.label.toLowerCase().includes(term) ||
        item.spellName.toLowerCase().includes(term) ||
        (item.desc && item.desc.toLowerCase().includes(term)) ||
        cat.title.toLowerCase().includes(term)
      );
    });
    return { ...cat, items };
  }).filter(cat => cat.items.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-6 md:p-12 overflow-y-auto"
      style={{
        background: 'radial-gradient(circle at center, rgba(13, 10, 30, 0.98) 0%, rgba(2, 2, 5, 0.99) 100%)',
      }}
    >
      {/* Background magical circle pattern */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-10 mix-blend-screen">
        <svg className="w-[800px] h-[800px] text-amber-500 animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="90" strokeWidth="0.5" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="82" strokeWidth="0.8" />
          <polygon points="100,18 135,125 45,60 155,60 65,125" strokeWidth="0.5" strokeLinejoin="round" />
          <circle cx="100" cy="100" r="50" strokeWidth="0.4" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6 mb-8 max-w-7xl mx-auto w-full">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">System Deck Portal</h1>
              <p className="text-xs text-amber-500/80 font-mono tracking-widest mt-0.5">All System Tools & Navigation</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-300 hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 max-w-md mx-auto w-full mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search spells, attributes, systems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-black/60 text-white placeholder-white/20 text-sm font-mono focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300"
          />
        </div>
      </div>

      {/* Categories & Cards Grid */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full space-y-12 pb-12">
        {filteredCategories.map(cat => (
          <div key={cat.title} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <h2 className="font-mono font-black text-xs uppercase tracking-widest text-white/50">{cat.title}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cat.items.map(n => {
                const isActive = active === n.id
                return (
                  <motion.div
                    key={n.id}
                    onClick={(e) => {
                      fireFX('sidebarSelect', { x: e.clientX, y: e.clientY, color: n.color })
                      triggerTransition(n.id)
                      onClose()
                    }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 group overflow-hidden ${
                      isActive ? 'bg-white/5' : 'bg-white/[0.01]'
                    }`}
                    style={{
                      borderColor: isActive ? `${n.color}50` : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isActive ? `0 0 25px ${n.color}15` : 'none'
                    }}
                  >
                    {/* Glowing coordinate background matching color */}
                    <div 
                      className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-500"
                      style={{ background: n.color }}
                    />
                    
                    <div className="flex items-start gap-4">
                      {/* Icon wrapper with rotating spell ring on hover */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative overflow-hidden transition-all duration-300"
                        style={{
                          background: isActive ? `${n.color}20` : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isActive ? `${n.color}40` : 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <motion.div 
                          className="absolute inset-0 rounded-xl border border-dashed pointer-events-none opacity-0 group-hover:opacity-40"
                          style={{ borderColor: n.color }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        />
                        <n.icon className="w-5 h-5 z-10 transition-transform duration-300 group-hover:scale-110" style={{ color: n.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center leading-none">
                          <span className="text-sm font-black tracking-wide text-white group-hover:text-white/95">{n.label}</span>
                          <span className="text-[7px] font-bold opacity-60 uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/10"
                            style={{ color: n.color }}>
                            {n.manaCost}
                          </span>
                        </div>
                        
                        <p className="text-[10px] font-mono opacity-50 mt-1" style={{ color: n.color }}>{n.spellName}</p>
                        
                        {n.desc && (
                          <p className="text-[10px] text-white/40 leading-snug mt-2.5 font-medium group-hover:text-white/50 transition-colors">
                            {n.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SettingsSection({ refresh }) {
  const { user, refreshUser } = useAuth()
  const { subscription, refreshSubscription } = useSubscription()
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    waterNotifications: false,
    waterInterval: 30
  })
  const [saving, setSaving] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [simulatedReport, setSimulatedReport] = useState('')
  const [sendingReport, setSendingReport] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        age: user.age || '',
        weight: user.weight || '',
        height: user.height || '',
        waterNotifications: user.waterNotifications || false,
        waterInterval: user.waterInterval || 30
      })
    }
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.patch('user/profile', {
        name: profile.name,
        age: Number(profile.age) || 0,
        weight: Number(profile.weight) || 0,
        height: Number(profile.height) || 0,
        waterNotifications: profile.waterNotifications,
        waterInterval: Number(profile.waterInterval) || 30
      })
      toast.success('System parameters calibrated successfully!')
      await refreshUser()
      if (refresh) refresh()
    } catch (e) {
      toast.error('Failed to update system parameters')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const triggerProgressReport = async () => {
    setSendingReport(true)
    try {
      const res = await api.post('user/send-report', {})
      setSimulatedReport(res.report)
      setReportModalOpen(true)
      toast.success('Progress report email dispatched successfully!')
    } catch (e) {
      toast.error('Failed to generate progress report')
      console.error(e)
    } finally {
      setSendingReport(false)
    }
  }

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your hunter contract ascension?')) return
    try {
      await api.post('subscription/cancel', {})
      toast.success('Subscription cancelled successfully')
      if (refreshSubscription) await refreshSubscription()
    } catch (e) {
      toast.error('Failed to cancel subscription')
      console.error(e)
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader 
        title="Settings Console" 
        desc="Calibrate your user profile, vital specifications, notification limits, and account status." 
        icon={User} 
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6 border border-cyan-500/10">
          <h3 className="text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Vital Specifications
          </h3>
          <div className="space-y-4">
            <Field label="Hunter Designation (Name)">
              <Input 
                value={profile.name} 
                onChange={e => setProfile({ ...profile, name: e.target.value })} 
                className="bg-black/40 border-white/10 text-white"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Age">
                <Input 
                  type="number" 
                  value={profile.age} 
                  onChange={e => setProfile({ ...profile, age: e.target.value })} 
                  className="bg-black/40 border-white/10 text-white"
                />
              </Field>
              <Field label="Weight (kg)">
                <Input 
                  type="number" 
                  value={profile.weight} 
                  onChange={e => setProfile({ ...profile, weight: e.target.value })} 
                  className="bg-black/40 border-white/10 text-white"
                />
              </Field>
              <Field label="Height (cm)">
                <Input 
                  type="number" 
                  value={profile.height} 
                  onChange={e => setProfile({ ...profile, height: e.target.value })} 
                  className="bg-black/40 border-white/10 text-white"
                />
              </Field>
            </div>
            
            <GlowButton onClick={saveProfile} disabled={saving} className="w-full justify-center">
              {saving ? 'Calibrating...' : 'Update Vitals'}
            </GlowButton>
          </div>
        </motion.div>

        {/* Notifications & Hydration Alerts */}
        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6 border border-pink-500/10">
          <h3 className="text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-pink-400" /> Hydration Core Reminders
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">Water Intake Notifications</p>
                <p className="text-xs text-white/40 mt-0.5">Enable regular alerts to drink water</p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, waterNotifications: !profile.waterNotifications })}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${profile.waterNotifications ? 'bg-pink-500 justify-end' : 'bg-white/10 justify-start'}`}
              >
                <motion.div 
                  className="w-4 h-4 rounded-full bg-white shadow-md"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <Field label="Reminder Interval">
              <Select 
                value={String(profile.waterInterval)} 
                onValueChange={v => setProfile({ ...profile, waterInterval: Number(v) })}
              >
                <SelectTrigger className="bg-black/40 border-white/10 text-white">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <SelectItem value="15">Every 15 Minutes</SelectItem>
                  <SelectItem value="30">Every 30 Minutes</SelectItem>
                  <SelectItem value="60">Every 1 Hour</SelectItem>
                  <SelectItem value="120">Every 2 Hours</SelectItem>
                  <SelectItem value="180">Every 3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <GlowButton onClick={saveProfile} disabled={saving} variant="primary" className="w-full justify-center border-pink-500/30">
              Save Notification Preferences
            </GlowButton>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Account Security & Info */}
        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6 border border-cyan-500/10 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" /> Security & Account status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                <span className="text-white/40">Email Identification</span>
                <span className="text-white font-bold">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                <span className="text-white/40">Hunter Rank Status</span>
                <span className="text-cyan-400 font-bold font-mono">AUTHORIZED MEMBER</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5">
                <span className="text-white/40">Registered Identity Code</span>
                <span className="text-white/60 font-mono text-xs">{user?.id}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <GlowButton variant="ghost" onClick={triggerProgressReport} disabled={sendingReport} className="w-full justify-center">
              {sendingReport ? 'Generating Report...' : 'Simulate Progress Report Email'}
            </GlowButton>
          </div>
        </motion.div>

        {/* Subscription Status Card */}
        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-6 border border-amber-500/10 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" /> Active Subscription Contract
            </h3>
            {subscription && subscription.isActive ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/40">Ascended Rank Tier</span>
                  <span className="text-amber-400 font-black uppercase tracking-wider">{subscription.plan} Level</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/40">Contract Expiration Date</span>
                  <span className="text-white font-bold font-mono">{new Date(subscription.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1.5">
                  <span className="text-white/40">Payment Authentication</span>
                  <span className="text-emerald-400 font-bold font-mono">VERIFIED</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white/60">You are currently on the <span className="text-white font-bold">Standard Free Tier</span>.</p>
                <p className="text-xs text-white/30">Ascend to premium tiers to unlock advanced artificial intelligence features and interactive charts.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            {subscription && subscription.isActive ? (
              <GlowButton onClick={cancelSubscription} variant="danger" className="w-full justify-center">
                Cancel Premium Contract
              </GlowButton>
            ) : (
              <GlowButton onClick={() => window.location.hash = '#pricing'} variant="primary" className="w-full justify-center">
                Ascend to Premium Tier
              </GlowButton>
            )}
          </div>
        </motion.div>
      </div>

      {/* Progress Report Simulation Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent style={{ background: 'rgba(10,8,20,0.98)', border: '1px solid rgba(139,92,246,0.3)', backdropFilter: 'blur(45px)', maxWidth: '600px' }}>
          <DialogHeader>
            <DialogTitle className="aurora-text text-xl font-black">Daily Progress Report Sent!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <p className="text-sm text-white/60">
              The daily report has been simulated in the system logs and dispatched to <span className="text-cyan-400 font-bold">{user?.email}</span>. Here is the report body structure:
            </p>
            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
              {simulatedReport}
            </pre>
          </div>
          <DialogFooter>
            <GlowButton variant="ghost" onClick={() => {
              navigator.clipboard.writeText(simulatedReport)
              toast.success('Report copied to clipboard!')
            }}>
              Copy to Clipboard
            </GlowButton>
            <GlowButton onClick={() => setReportModalOpen(false)}>
              Close
            </GlowButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════
function AppContent() {
  const { user, loading, token, logout, refreshUser } = useAuth()
  const [active, setActive] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [time, setTime] = useState('')
  const [activeTransition, setActiveTransition] = useState(null)
  const [pendingActive, setPendingActive] = useState(null)
  const [grimoireExpanded, setGrimoireExpanded] = useState(false)
  const [showWaterAlert, setShowWaterAlert] = useState(false)

  useEffect(() => {
    if (!user || !user.waterNotifications) {
      setShowWaterAlert(false)
      return
    }
    const intervalMs = (user.waterInterval || 30) * 60 * 1000
    const timer = setInterval(() => {
      setShowWaterAlert(true)
    }, intervalMs)

    // Trigger initial demo reminder after 12 seconds so they can verify it works
    const initialTimer = setTimeout(() => {
      setShowWaterAlert(true)
    }, 12000)

    return () => {
      clearInterval(timer)
      clearTimeout(initialTimer)
    }
  }, [user?.waterNotifications, user?.waterInterval])

  const logQuickWater = async () => {
    try {
      const healthLogs = await api.get('health')
      const todayStr = new Date().toISOString().slice(0, 10)
      const todayEntry = healthLogs.find(l => l.date && l.date.slice(0, 10) === todayStr)
      
      if (todayEntry) {
        const currentWater = Number(todayEntry.water) || 0
        await api.patch(`health/${todayEntry.id}`, { water: +(currentWater + 0.25).toFixed(2) })
      } else {
        await api.post('health', { date: todayStr, water: 0.25 })
      }
      
      toast.success('Logged 250ml of water! Vitality restored. 🥤')
      setShowWaterAlert(false)
      loadStats()
    } catch (e) {
      toast.error('Failed to log water intake')
      console.error(e)
    }
  }

  const disableWaterNotifications = async () => {
    try {
      await api.patch('user/profile', {
        name: user.name,
        age: user.age,
        weight: user.weight,
        height: user.height,
        waterNotifications: false,
        waterInterval: user.waterInterval || 30
      })
      toast.success('Water notifications disabled.')
      setShowWaterAlert(false)
      await refreshUser()
    } catch (e) {
      toast.error('Failed to update preferences')
      console.error(e)
    }
  }

  const triggerTransition = useCallback((targetId) => {
    let type = null
    if (targetId === 'quiz-revision') type = 'fire_slash'
    else if (targetId === 'guilds') type = 'monarch_domain'
    else if (targetId === 'meditate') type = 'water_calm'
    else if (targetId === 'ai-planner') type = 'grimoire'
    else if (targetId === 'daily-plan') type = 'arise'
    else if (targetId === 'study') type = 'black_divider'
    else if (targetId === 'habits') type = 'thunderclap'
    else if (targetId === 'tasks') type = 'dismantle'
    else if (targetId === 'goals') type = 'monarch_domain'
    else if (targetId === 'health') type = 'constant_flux'
    else if (targetId === 'exercise') type = 'rasengan'
    else if (targetId === 'journal') type = 'tsukuyomi'
    else if (targetId === 'knowledge') type = 'spirit_storm'
    else if (targetId === 'analytics') type = 'hollow_purple'
    else if (targetId === 'pricing') type = 'shadow_extract'
    else if (targetId === 'constellation') type = 'constellation'
    else if (targetId === 'neural-network') type = 'chidori'
    else if (targetId === 'knowledge-galaxy') type = 'shadow_garden'
    else if (targetId === 'growth-tree') type = 'deep_forest'
    else if (targetId === 'evolution') type = 'evolution'
    else if (targetId === 'digital-brain') type = 'chidori_brain'
    else if (targetId === 'time-river') type = 'time_ripple'
    else if (targetId === 'knowledge-fractal') type = 'fractal'
    else if (targetId === 'predictive-future') type = 'sharingan'
    else if (targetId === 'settings') type = 'constant_flux'

    if (type) {
      setActiveTransition(type)
      setPendingActive(targetId)
    } else {
      setActive(targetId)
    }
  }, [])

  const loadStats = useCallback(() => {
    if (token) {
      api.get('stats', token).then(setStats).catch(e => console.error('Stats error:', e))
    }
  }, [token])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900/20 via-cyan-900/20 to-emerald-900/20">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900/20 via-cyan-900/20 to-emerald-900/20 p-4">
        <Card className="glass-card border-violet-500/30 bg-violet-950/20 max-w-md w-full">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-black text-white tracking-tight">LifeOS</CardTitle>
              <CardDescription className="text-white/60 mt-2">Sign in to access your personal growth dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full py-6 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-bold text-base"
            >
              Sign In
            </Button>
            <Button
              onClick={() => window.location.href = '/signup'}
              variant="outline"
              className="w-full py-6 border-violet-500/30 text-white hover:bg-violet-500/10 font-bold text-base"
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUpgrade = () => setActive('pricing')

  const renderSection = () => {
    switch (active) {
      case 'dashboard': return <Dashboard stats={stats} refresh={loadStats} go={triggerTransition} />
      case 'guilds': return <GuildChamber stats={stats} refresh={loadStats} />
      case 'quiz-revision': return <QuizRevision refresh={loadStats} />
      case 'meditate': return <Meditate refresh={loadStats} />
      case 'ai-planner': return <PremiumWrapper feature="ai-planner" onUpgrade={handleUpgrade}><AiPlanner /></PremiumWrapper>
      case 'daily-plan': return <PremiumWrapper feature="ai-planner" onUpgrade={handleUpgrade}><DailyPlanSection refresh={loadStats} /></PremiumWrapper>
      case 'study': return <StudyTracker refresh={loadStats} />
      case 'habits': return <Habits refresh={loadStats} />
      case 'tasks': return <Tasks refresh={loadStats} />
      case 'goals': return <Goals refresh={loadStats} />
      case 'health': return <Health refresh={loadStats} />
      case 'exercise': return <Exercise refresh={loadStats} />
      case 'journal': return <Journal refresh={loadStats} />
      case 'knowledge': return <Knowledge refresh={loadStats} />
      case 'analytics': return <PremiumWrapper feature="advanced-analytics" onUpgrade={handleUpgrade}><Analytics stats={stats} /></PremiumWrapper>
      case 'pricing': return <PricingSection />
      case 'constellation': return <PremiumWrapper feature="data-constellation" onUpgrade={handleUpgrade}><DataConstellationSection refresh={loadStats} /></PremiumWrapper>
      case 'neural-network': return <PremiumWrapper feature="neural-network" onUpgrade={handleUpgrade}><NeuralNetworkSection refresh={loadStats} /></PremiumWrapper>
      case 'knowledge-galaxy': return <PremiumWrapper feature="knowledge-galaxy" onUpgrade={handleUpgrade}><KnowledgeGalaxySection refresh={loadStats} /></PremiumWrapper>
      case 'growth-tree': return <PremiumWrapper feature="growth-tree" onUpgrade={handleUpgrade}><GrowthTreeSection refresh={loadStats} /></PremiumWrapper>
      case 'evolution': return <PremiumWrapper feature="evolution" onUpgrade={handleUpgrade}><EvolutionChamberSection refresh={loadStats} /></PremiumWrapper>
      case 'digital-brain': return <PremiumWrapper feature="digital-brain" onUpgrade={handleUpgrade}><DigitalBrainSection refresh={loadStats} /></PremiumWrapper>
      case 'time-river': return <PremiumWrapper feature="time-river" onUpgrade={handleUpgrade}><TimeRiverSection refresh={loadStats} /></PremiumWrapper>
      case 'knowledge-fractal': return <PremiumWrapper feature="knowledge-fractal" onUpgrade={handleUpgrade}><KnowledgeFractalSection refresh={loadStats} /></PremiumWrapper>
      case 'predictive-future': return <PremiumWrapper feature="predictive-future" onUpgrade={handleUpgrade}><PredictiveFutureSection refresh={loadStats} /></PremiumWrapper>
      case 'settings': return <SettingsSection refresh={loadStats} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar Toggle / Collapsed Grimoire Button */}
      <AnimatePresence>
        {desktopCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, rotate: -90, x: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90, x: -30 }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDesktopCollapsed(false)}
            className="hidden lg:flex fixed left-5 top-5 z-40 w-12 h-12 rounded-xl items-center justify-center border border-amber-500/40 bg-black/85 text-amber-400 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="absolute inset-0 border border-dashed border-amber-500/20 rounded-xl animate-[spin_20s_linear_infinite]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{
          width: desktopCollapsed ? 0 : 256,
          opacity: desktopCollapsed ? 0 : 1,
          rotateY: desktopCollapsed ? -30 : 0,
          scale: desktopCollapsed ? 0.95 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 160,
          damping: 24,
        }}
        className="hidden lg:flex shrink-0 glass-sidebar flex-col relative overflow-hidden h-screen"
        style={{
          borderRight: desktopCollapsed ? '0px solid transparent' : '1px solid rgba(251, 191, 36, 0.15)',
          boxShadow: desktopCollapsed ? 'none' : 'inset -5px 0 25px rgba(0, 0, 0, 0.5)',
          transformOrigin: 'left center'
        }}
      >
        {/* Fixed-width wrapper to prevent layout squishing of children during collapse */}
        <div className="w-64 h-full flex flex-col shrink-0 relative overflow-hidden">
          {/* Spinning background magical circle on desktop */}
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-20 mix-blend-screen"
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-[380px] h-[380px] text-amber-500" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              <circle cx="100" cy="100" r="90" strokeWidth="0.8" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="82" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="50" strokeWidth="0.8" />
              <polygon points="100,18 135,125 45,60 155,60 65,125" strokeWidth="0.8" strokeLinejoin="round" />
              <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.4" />
            </svg>
          </motion.div>

            <SidebarContent
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              desktopCollapsed={desktopCollapsed}
              setDesktopCollapsed={setDesktopCollapsed}
              setGrimoireExpanded={setGrimoireExpanded}
              active={active}
              triggerTransition={triggerTransition}
              time={time}
              logout={logout}
              stats={stats}
            />
          </div>
        </motion.aside>

      {/* Mobile Sidebar with Magical Summoning Animation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/75 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Rotating magical spell summoning circle overlay */}
            <motion.div
              className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50 lg:hidden opacity-30 mix-blend-screen"
              initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
              animate={{ opacity: [0, 0.35, 0.15], scale: [0.4, 1.4, 1.1], rotate: 180 }}
              exit={{ opacity: 0, scale: 0.6, rotate: -45 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            >
              <svg className="w-[450px] h-[450px] text-amber-500 animate-[spin_30s_linear_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                <circle cx="100" cy="100" r="90" strokeWidth="0.8" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="82" strokeWidth="1.2" />
                <circle cx="100" cy="100" r="65" strokeWidth="0.5" strokeDasharray="1 3" />
                <circle cx="100" cy="100" r="50" strokeWidth="0.8" />
                <polygon points="100,18 135,125 45,60 155,60 65,125" strokeWidth="0.8" strokeLinejoin="round" />
                <polygon points="100,182 65,75 155,140 45,140 135,75" strokeWidth="0.4" strokeLinejoin="round" opacity="0.4" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 100 + 72 * Math.cos(angle);
                  const y1 = 100 + 72 * Math.sin(angle);
                  const x2 = 100 + 78 * Math.cos(angle);
                  const y2 = 100 + 78 * Math.sin(angle);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.2" />;
                })}
                <circle cx="100" cy="100" r="8" fill="currentColor" className="animate-pulse opacity-40" />
              </svg>
            </motion.div>

            {/* Sidebar content container */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarSpellVariants}
              className="fixed inset-y-0 left-0 z-50 w-64 glass-sidebar flex flex-col overflow-y-auto lg:hidden"
              style={{
                borderRight: '1px solid rgba(251, 191, 36, 0.25)',
                boxShadow: '0 0 50px rgba(0, 0, 0, 0.8), inset -5px 0 25px rgba(251, 191, 36, 0.05)',
                transformOrigin: 'left center'
              }}
            >
              {/* Extra magical particle burst overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-cyan-500/0 to-transparent pointer-events-none mix-blend-screen" />
              
              <SidebarContent
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                desktopCollapsed={desktopCollapsed}
                setDesktopCollapsed={setDesktopCollapsed}
                setGrimoireExpanded={setGrimoireExpanded}
                active={active}
                triggerTransition={triggerTransition}
                time={time}
                logout={logout}
                stats={stats}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b border-white/5"
          style={{ background: 'rgba(10,8,20,0.8)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-white/60" />
          </button>
          <span className="font-black aurora-text">LifeOS</span>
          <div className="w-9" />
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {grimoireExpanded && (
          <ExpandedGrimoireDeck
            isOpen={grimoireExpanded}
            onClose={() => setGrimoireExpanded(false)}
            active={active}
            triggerTransition={triggerTransition}
            stats={stats}
          />
        )}
      </AnimatePresence>

      <CinematicOverlay
        activeTransition={activeTransition}
        onComplete={() => {
          if (pendingActive) {
            setActive(pendingActive)
            setPendingActive(null)
          }
          setActiveTransition(null)
        }}
      />

      <AnimatePresence>
        {showWaterAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md"
          >
            <div 
              className="glass-card border border-pink-500/40 p-4 rounded-2xl flex flex-col gap-3 shadow-[0_0_30px_rgba(236,72,153,0.25)] bg-black/90 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 10, 25, 0.95) 0%, rgba(10, 5, 15, 0.98) 100%)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30 shrink-0 mt-0.5">
                  <Droplets className="w-5 h-5 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    Vitality Reminder <span className="text-[9px] text-pink-400 border border-pink-500/30 px-1 py-0.2 rounded font-mono uppercase">Hydration Core</span>
                  </h4>
                  <p className="text-xs text-white/60 mt-1">Drink 250ml water to maintain your Vitality (VIT) and stick to your growth path.</p>
                </div>
                <button
                  onClick={() => setShowWaterAlert(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-2 mt-1">
                <button
                  onClick={disableWaterNotifications}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 border border-white/10 text-[10px] font-bold transition-all"
                >
                  Mute Notifications
                </button>
                <button
                  onClick={logQuickWater}
                  className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(236,72,153,0.3)] transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Log 250ml
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  )
}
