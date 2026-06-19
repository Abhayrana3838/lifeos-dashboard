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
  User, Waves, Infinity, Compass
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

// ─── Constants ────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Hunter Status', icon: LayoutDashboard, color: '#22d3ee' },
  { id: 'quiz-revision', label: 'Revision Gate', icon: Award, color: '#f59e0b' },
  { id: 'meditate', label: 'Meditation Chamber', icon: Zap, color: '#ec4899' },
  { id: 'ai-planner', label: 'AI Planner', icon: Bot, color: '#22d3ee', premium: 'ai-planner' },
  { id: 'daily-plan', label: 'Daily Plan', icon: Sparkles, color: '#8b5cf6', premium: 'ai-planner' },
  { id: 'study', label: 'Training logs', icon: BookOpen, color: '#34d399' },
  { id: 'habits', label: 'Habits', icon: Activity, color: '#f472b6' },
  { id: 'tasks', label: 'Quests', icon: ListChecks, color: '#fbbf24' },
  { id: 'goals', label: 'Milestones', icon: Target, color: '#f87171' },
  { id: 'health', label: 'Recovery Status', icon: Heart, color: '#f472b6' },
  { id: 'exercise', label: 'Physical training', icon: Dumbbell, color: '#a78bfa' },
  { id: 'journal', label: 'Journal', icon: NotebookPen, color: '#38bdf8' },
  { id: 'knowledge', label: 'Library', icon: Library, color: '#fb923c' },
  { id: 'analytics', label: 'Evaluation Charts', icon: BarChart3, color: '#4ade80', premium: 'advanced-analytics' },
  { id: 'pricing', label: 'Upgrade Plan', icon: Crown, color: '#fbbf24' },
  { id: 'constellation', label: 'Data Constellation', icon: Star, color: '#fbbf24', premium: 'data-constellation' },
  { id: 'neural-network', label: 'Neural Network', icon: Brain, color: '#8b5cf6', premium: 'neural-network' },
  { id: 'knowledge-galaxy', label: 'Knowledge Galaxy', icon: Globe, color: '#22d3ee', premium: 'knowledge-galaxy' },
  { id: 'growth-tree', label: 'Growth Tree', icon: TreeDeciduous, color: '#34d399', premium: 'growth-tree' },
  { id: 'evolution', label: 'Evolution Chamber', icon: User, color: '#f472b6', premium: 'evolution' },
  { id: 'digital-brain', label: 'Digital Brain', icon: Brain, color: '#a78bfa', premium: 'digital-brain' },
  { id: 'time-river', label: 'Time River', icon: Waves, color: '#38bdf8', premium: 'time-river' },
  { id: 'knowledge-fractal', label: 'Knowledge Fractal', icon: Infinity, color: '#fbbf24', premium: 'knowledge-fractal' },
  { id: 'predictive-future', label: 'Predictive Future', icon: Compass, color: '#4ade80', premium: 'predictive-future' },
]

const CHART_COLORS = ['#8b5cf6', '#22d3ee', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8']

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
const todayISO = () => new Date().toISOString().slice(0, 10)

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
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Status: Active Dual Dungeon Survivor</p>
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

          {/* Combat Power Frame */}
          <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 text-center w-full md:w-56 shrink-0 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-bl-sm" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-400 rounded-tr-sm" />
            <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-black">Combat Power</span>
            <span className="text-3xl font-black text-white mt-1 hunter-title-glow tracking-tighter">
              {g.combatPower.toLocaleString()}
            </span>
            <Separator className="my-3 bg-white/10" />
            <div className="text-[10px] text-white/40 space-y-1">
              <div className="flex justify-between">
                <span>MIND SHARPNESS:</span>
                <span className={g.mindSharpness > 60 ? "text-cyan-400 font-bold" : "text-rose-400 font-bold animate-pulse"}>
                  {g.mindSharpness}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>STREAK MULTIPLIER:</span>
                <span className="text-amber-400 font-bold">x{(1 + (stats.streak * 0.05)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>MANA STREAMS:</span>
                <span className="text-pink-400 font-bold">{g.totalMeditationMinutes || 0} min</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid of stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Today Training" value={`${stats.todayStudy}h`} hint="Hours logged today" color="#22d3ee" />
        <StatCard icon={CheckCircle2} label="Daily Quests" value={`${stats.todayTasks}/${stats.totalTasksToday}`} hint="Quests completed" color="#34d399" />
        <StatCard icon={Activity} label="Habits Linked" value={`${stats.todayHabits}/${stats.totalHabits}`} hint="Daily actions aligned" color="#f472b6" />
        <StatCard icon={Flame} label="Continuous Streak" value={`${stats.streak}d`} hint="Consecutive login streak" color="#fbbf24" />
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
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', target: 'daily' })
  const load = () => api.get('habits').then(setHabits)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.name) return toast.error('Name required')
    if (editingId) {
      await api.patch(`habits/${editingId}`, form)
      toast.success('Habit updated ✓')
    } else {
      await api.post('habits', form)
      toast.success('Habit created ✓')
    }
    setOpen(false)
    setEditingId(null)
    setForm({ name: '', target: 'daily' })
    load(); refresh()
  }
  const startEdit = (h) => {
    setEditingId(h.id)
    setForm({ name: h.name, target: h.target })
    setOpen(true)
  }
  const toggle = async (id, evt) => {
    await api.post(`habits/${id}/toggle`, {})
    load()
    refresh()
    if (evt) fireFX('habitToggle', { x: evt.clientX, y: evt.clientY })
  }
  const del = async (id) => { await api.del(`habits/${id}`); load(); refresh() }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Habit Tracker" desc="Build streaks. Stay consistent. Win every day." action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm({ name: '', target: 'daily' }) } }}>
          <DialogTrigger asChild><GlowButton onClick={() => { setEditingId(null); setForm({ name: '', target: 'daily' }) }}><Plus className="w-4 h-4" /> New Habit</GlowButton></DialogTrigger>
          <DialogContent style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(40px)' }}>
            <DialogHeader><DialogTitle className="aurora-text">{editingId ? 'Edit Habit' : 'Create Habit'}</DialogTitle></DialogHeader>
            <Field label="Habit Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Meditate 10 min" /></Field>
            <Field label="Frequency">
              <Select value={form.target} onValueChange={v => setForm({ ...form, target: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent>
              </Select>
            </Field>
            <DialogFooter><GlowButton onClick={submit}>{editingId ? 'Update' : 'Create'}</GlowButton></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      {habits.length === 0 ? (
        <motion.div variants={fadeUp} className="glass-card rounded-3xl p-16 text-center">
          <Activity className="w-14 h-14 mx-auto text-white/10 mb-4" />
          <p className="text-white/40">No habits yet. Build your first one.</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((h, i) => {
            const pct = h.completionPct || 0
            const circ = 2 * Math.PI * 40
            const offset = circ - (pct / 100) * circ
            return (
              <motion.div key={h.id} variants={scaleIn} layout>
                <div className={`glass-card rounded-2xl p-5 group relative overflow-hidden transition-all duration-500 ${h.completedToday ? 'neon-border-violet' : ''}`}>
                  {h.completedToday && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(139,92,246,0.08), transparent)' }} />}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white">{h.name}</h3>
                      <p className="text-xs text-white/30 mt-0.5 capitalize">{h.target}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(h)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                        <NotebookPen className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(h.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Flame className="w-4 h-4" style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
                      <span className="font-black text-white">{h.streak}</span>
                      <span className="text-white/30 text-xs">day streak</span>
                    </div>
                    <svg width="64" height="64" className="ring-glow -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#8b5cf6" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 - (pct / 100) * 2 * Math.PI * 26}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
                      <text x="32" y="36" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="bold" className="rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '32px 32px' }}>
                        {pct}%
                      </text>
                    </svg>
                  </div>
                  <button onClick={(e) => toggle(h.id, e)} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
                    ${h.completedToday ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                    style={h.completedToday
                      ? { background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {h.completedToday ? <><CheckCircle2 className="w-4 h-4" /> Done Today</> : <><Circle className="w-4 h-4" /> Mark Done</>}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
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
  const load = () => api.get('tasks').then(setTasks)
  useEffect(() => { load() }, [])

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
            <DialogHeader><DialogTitle className="aurora-text">{editingId ? 'Edit Task' : 'Create Task'}</DialogTitle></DialogHeader>
            <Field label="Title"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
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
// EXERCISE
// ══════════════════════════════════════════════════════════
function Exercise({ refresh }) {
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', sets: 3, reps: 10, weight: 0, duration: 0, calories: 0, date: todayISO(), notes: '' })
  const load = () => api.get('exercises').then(setItems)
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.name) return toast.error('Workout name required')
    if (editingId) {
      await api.patch(`exercises/${editingId}`, form)
      toast.success('Workout updated ✓')
    } else {
      await api.post('exercises', form)
      toast.success('Workout logged ✓')
    }
    setEditingId(null)
    setForm({ name: '', sets: 3, reps: 10, weight: 0, duration: 0, calories: 0, date: todayISO(), notes: '' })
    load(); refresh()
  }

  const startEdit = (i) => {
    setEditingId(i.id)
    setForm({
      name: i.name,
      sets: i.sets,
      reps: i.reps,
      weight: i.weight,
      duration: i.duration,
      calories: i.calories,
      date: i.date ? i.date.slice(0, 10) : todayISO(),
      notes: i.notes || ''
    })
  }

  const del = async (id) => {
    await api.del(`exercises/${id}`)
    toast.success('Workout deleted')
    load(); refresh()
  }

  const byDay = useMemo(() => {
    const m = {}; items.forEach(i => { m[i.date] = (m[i.date] || 0) + Number(i.calories || 0) })
    return Object.entries(m).map(([date, calories]) => ({ date, label: fmtDate(date), calories })).slice(-14)
  }, [items])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Exercise" desc="Track workouts, sets, reps & calories burned." />

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-violet-400" /> {editingId ? 'Edit Workout' : 'Log Workout'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Workout"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Bench Press" /></Field>
          <Field label="Sets"><Input type="number" value={form.sets} onChange={e => setForm({ ...form, sets: e.target.value })} /></Field>
          <Field label="Reps"><Input type="number" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} /></Field>
          <Field label="Weight (kg)"><Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></Field>
          <Field label="Duration (min)"><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Calories"><Input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Notes"><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex gap-2">
          <GlowButton onClick={submit}>
            {editingId ? 'Update Workout' : <><Plus className="w-4 h-4" /> Save</>}
          </GlowButton>
          {editingId && (
            <GlowButton variant="ghost" onClick={() => {
              setEditingId(null)
              setForm({ name: '', sets: 3, reps: 10, weight: 0, duration: 0, calories: 0, date: todayISO(), notes: '' })
            }}>
              Cancel
            </GlowButton>
          )}
        </div>
      </motion.div>

      <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4">Calories Burned (14d)</h3>
          {byDay.length === 0 ? <div className="h-48 flex items-center justify-center text-white/25 text-sm">No workouts yet</div> :
            <ResponsiveContainer width="100%" height={220}>
              <RBarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="calories" fill="#f472b6" radius={[6, 6, 0, 0]} />
              </RBarChart>
            </ResponsiveContainer>}
        </motion.div>
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-3">Recent Workouts</h3>
          {items.length === 0 ? <div className="h-48 flex items-center justify-center text-white/25 text-sm">No workouts logged</div> :
            <ScrollArea className="h-52">
              <ul className="space-y-2 pr-2">
                {items.slice(0, 12).map(i => (
                  <li key={i.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                    <div>
                      <p className="text-sm font-medium text-white">{i.name}</p>
                      <p className="text-xs text-white/30">{i.sets}×{i.reps} · {i.weight}kg · {fmtDate(i.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {i.duration > 0 && <span className="text-violet-400">{i.duration}min</span>}
                      {i.calories > 0 && <span className="text-pink-400 mr-2">{i.calories}cal</span>}
                      <button onClick={() => startEdit(i)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-cyan-400 hover:bg-cyan-400/10 transition-all edit-btn">
                        <NotebookPen className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(i.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-400/10 transition-all delete-btn">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>}
        </motion.div>
      </motion.div>
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
  const load = () => api.get('journal').then(setEntries)
  useEffect(() => { load() }, [])

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
        <div className="mt-4 flex gap-2">
          <GlowButton onClick={submit}>
            {editingId ? 'Update Entry' : <><Plus className="w-4 h-4" /> Save Entry</>}
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
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [graded, setGraded] = useState(false)
  const [score, setScore] = useState(0)

  const generate = async () => {
    if (!topic.trim()) return toast.error('Enter a topic or subject first')
    setLoading(true)
    setQuiz(null)
    setAnswers({})
    setGraded(false)
    try {
      const res = await api.post('ai/generate-quiz', { topic })
      if (res.error) throw new Error(res.error)
      setQuiz(res.quiz)
      toast.success('Revision Gate Open! Beat the test to restore Mind Sharpness! ⚔️')
    } catch (e) {
      toast.error(e.message || 'Failed to generate test questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (qIdx, optIdx) => {
    if (graded) return
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const submitQuiz = async () => {
    if (Object.keys(answers).length < 5) {
      return toast.error('Answer all 5 questions to complete the trial!')
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
      subtopic: `Passed Trial: Score ${correct}/5`,
      hours: 0.5,
      difficulty: 'hard',
      understanding: Math.max(1, correct),
      notes: `Revision trial completed via AI Gate. Score: ${correct}/5.`,
      resources: 'AI Instructor',
      revision: true
    })

    if (correct >= 4) {
      toast.success(`VICTORY! Score: ${correct}/5. Massive XP and mind sharpness restored! 🎉`)
    } else {
      toast.error(`DEFEAT! Score: ${correct}/5. You need at least 4 correct answers. Retry training. 💀`)
    }
    refresh()
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <SectionHeader title="Revision Gate" desc="Deploy AI-generated trials to alignment-check your knowledge streams. High-score grants XP and boosts Mind Sharpness." icon={Award} />

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
      </motion.div>

      {quiz && (
        <motion.div variants={stagger} className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-lg text-cyan-400">Gate Active: {topic}</h3>
            {graded && (
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${score >= 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                Result: {score >= 4 ? 'S-Rank Clean' : 'Trial Failed'} ({score}/5 Correct)
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
      <EvolutionChamber stats={stats} studyLogs={studyLogs} health={health} exercise={exercise} goals={goals} />
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

// ══════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════
function AppContent() {
  const { user, loading, token, logout } = useAuth()
  const [active, setActive] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [time, setTime] = useState('')
  const [activeTransition, setActiveTransition] = useState(null)
  const [pendingActive, setPendingActive] = useState(null)

  const triggerTransition = useCallback((targetId) => {
    let type = null
    if (targetId === 'quiz-revision') type = 'fire_slash'
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

  const sections = {
    dashboard: <Dashboard stats={stats} refresh={loadStats} go={triggerTransition} />,
    'quiz-revision': <QuizRevision refresh={loadStats} />,
    meditate: <Meditate refresh={loadStats} />,
    'ai-planner': <PremiumWrapper feature="ai-planner" onUpgrade={handleUpgrade}><AiPlanner /></PremiumWrapper>,
    'daily-plan': <PremiumWrapper feature="ai-planner" onUpgrade={handleUpgrade}><DailyPlanSection refresh={loadStats} /></PremiumWrapper>,
    study: <StudyTracker refresh={loadStats} />,
    habits: <Habits refresh={loadStats} />,
    tasks: <Tasks refresh={loadStats} />,
    goals: <Goals refresh={loadStats} />,
    health: <Health refresh={loadStats} />,
    exercise: <Exercise refresh={loadStats} />,
    journal: <Journal refresh={loadStats} />,
    knowledge: <Knowledge refresh={loadStats} />,
    analytics: <PremiumWrapper feature="advanced-analytics" onUpgrade={handleUpgrade}><Analytics stats={stats} /></PremiumWrapper>,
    pricing: <PricingSection />,
    constellation: <PremiumWrapper feature="data-constellation" onUpgrade={handleUpgrade}><DataConstellationSection refresh={loadStats} /></PremiumWrapper>,
    'neural-network': <PremiumWrapper feature="neural-network" onUpgrade={handleUpgrade}><NeuralNetworkSection refresh={loadStats} /></PremiumWrapper>,
    'knowledge-galaxy': <PremiumWrapper feature="knowledge-galaxy" onUpgrade={handleUpgrade}><KnowledgeGalaxySection refresh={loadStats} /></PremiumWrapper>,
    'growth-tree': <PremiumWrapper feature="growth-tree" onUpgrade={handleUpgrade}><GrowthTreeSection refresh={loadStats} /></PremiumWrapper>,
    evolution: <PremiumWrapper feature="evolution" onUpgrade={handleUpgrade}><EvolutionChamberSection refresh={loadStats} /></PremiumWrapper>,
    'digital-brain': <PremiumWrapper feature="digital-brain" onUpgrade={handleUpgrade}><DigitalBrainSection refresh={loadStats} /></PremiumWrapper>,
    'time-river': <PremiumWrapper feature="time-river" onUpgrade={handleUpgrade}><TimeRiverSection refresh={loadStats} /></PremiumWrapper>,
    'knowledge-fractal': <PremiumWrapper feature="knowledge-fractal" onUpgrade={handleUpgrade}><KnowledgeFractalSection refresh={loadStats} /></PremiumWrapper>,
    'predictive-future': <PremiumWrapper feature="predictive-future" onUpgrade={handleUpgrade}><PredictiveFutureSection refresh={loadStats} /></PremiumWrapper>,
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(mobileOpen || true) && (
          <motion.aside
            initial={false}
            className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:flex lg:static w-64 shrink-0 glass-sidebar flex-col`}>
            {/* Logo */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl logo-pulse flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)' }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-black tracking-tight aurora-text text-base leading-none">LifeOS</p>
                    <p className="text-[10px] text-white/30 mt-0.5">AI Growth System</p>
                  </div>
                </div>
                <button className="lg:hidden text-white/30 hover:text-white p-1" onClick={() => setMobileOpen(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
              {NAV.map(n => {
                const isActive = active === n.id
                return (
                  <motion.button key={n.id}
                    whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { triggerTransition(n.id); setMobileOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                      ${isActive ? 'nav-item-active text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/4'}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                      style={isActive ? { background: `${n.color}20`, border: `1px solid ${n.color}30` } : { background: 'rgba(255,255,255,0.04)' }}>
                      <n.icon className="w-3.5 h-3.5" style={isActive ? { color: n.color, filter: `drop-shadow(0 0 4px ${n.color})` } : {}} />
                    </div>
                    <span>{n.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: n.color }} />}
                  </motion.button>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/25">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-violet-400" />
                  <span>Build something great</span>
                </div>
                <span className="font-mono text-violet-400/60">{time}</span>
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
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}

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
              {sections[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

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
