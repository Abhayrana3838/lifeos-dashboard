'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldAlert, Users, Trophy, MessageSquare, Award, Clock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { fireFX } from '@/components/InteractionFX'

const GUILDS = [
  {
    id: 'scavenger',
    name: 'Scavenger Guild',
    minRank: 'E',
    color: '#94a3b8',
    description: 'Specializes in dungeon cleanup, mining mana crystals, and auxiliary support. Low risk, steady rewards.',
    cpRequired: 100,
    perks: ['Basic Mana Crystal Mining', '+5% Gold from quests', 'Scavenger Badge'],
    raids: [
      { name: 'Goblins Nest', level: 'E-Rank', xp: 50, gold: 200 },
      { name: 'Giant Centipede Burrow', level: 'D-Rank', xp: 90, gold: 450 }
    ]
  },
  {
    id: 'white-tiger',
    name: 'White Tiger Guild',
    minRank: 'C',
    color: '#38bdf8',
    description: 'One of the top major guilds. Focuses on raid coordination, mid-tier dungeon clearances, and hunter teamwork.',
    cpRequired: 1200,
    perks: ['Aether Portal Access', '+15% Quest Experience', 'Combat Stat Buff'],
    raids: [
      { name: 'Red Gate Escape', level: 'C-Rank', xp: 450, gold: 2500 },
      { name: 'Ice Elves Citadel', level: 'B-Rank', xp: 900, gold: 5000 }
    ]
  },
  {
    id: 'hunters',
    name: 'Hunters Guild',
    minRank: 'A',
    color: '#f59e0b',
    description: 'The elite guild of the nation. Handles S-rank gate breakouts, legendary beast suppression, and raid lobbies.',
    cpRequired: 8000,
    perks: ['Shadow Army Cooperation', '+30% Combat Power Gain', 'Legendary Hunter Insignia'],
    raids: [
      { name: 'Jeju Island Raid', level: 'S-Rank', xp: 5000, gold: 30000 },
      { name: 'Monarch Throne Room', level: 'S-Rank', xp: 12000, gold: 80000 }
    ]
  }
]

const CHAT_TEMPLATES = [
  { user: 'IronFist_Kahn', msg: 'Need a tank for the D-Rank Goblin gate! Immediate entry.', time: 'Just now' },
  { user: 'ShadowMonarch_99', msg: 'Has anyone seen the boss room in the Jeju dungeon? It looks insane.', time: '2m ago' },
  { user: 'HealerLina', msg: 'Ready to support. Clean records, B-rank healing certificate.', time: '5m ago' },
  { user: 'FlameWielder', msg: 'White Tiger Guild is recruiting active C-rank hunters. Drop your CP below.', time: '8m ago' },
  { user: 'Guildmaster_Choi', msg: 'Hunters Guild S-rank raid starts in 30 minutes. Buffs active.', time: '12m ago' }
]

const LEADERBOARD = [
  { rank: 1, name: 'Hunters Guild', cp: 849000, members: 142, color: '#f59e0b' },
  { rank: 2, name: 'White Tiger Guild', cp: 520000, members: 98, color: '#38bdf8' },
  { rank: 3, name: 'Fame Guild', cp: 412000, members: 76, color: '#c084fc' },
  { rank: 4, name: 'Draw Sword Guild', cp: 389000, members: 110, color: '#10b981' },
  { rank: 5, name: 'Scavenger Guild', cp: 120400, members: 245, color: '#94a3b8' }
]

export default function GuildChamber({ stats, refresh }) {
  const [activeTab, setActiveTab] = useState('guilds') // 'guilds', 'chat', 'leaderboard'
  const [joinedGuild, setJoinedGuild] = useState(null)
  const [raidLoading, setRaidLoading] = useState(null)
  const [messages, setMessages] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const chatEndRef = useRef(null)

  const g = stats?.gameStats || { level: 1, xp: 0, currentXp: 0, xpNeeded: 500, rank: 'E', rankColor: '#94a3b8', combatPower: 150 }

  // Ranks numeric order to check locks
  const rankWeight = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 }
  const userRankVal = rankWeight[g.rank] || 1

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/guilds/chat', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (e) {
      console.error('Failed to fetch guild chat:', e)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/guilds/leaderboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data)
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e)
    }
  }

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchChat()
      const interval = setInterval(fetchChat, 5000) // Poll chat every 5s
      return () => clearInterval(interval)
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard()
    }
  }, [activeTab])

  const handleJoinGuild = (guild) => {
    const requiredWeight = rankWeight[guild.minRank]
    if (userRankVal < requiredWeight) {
      toast.error(`Admission Refused: Minimum ${guild.minRank}-Rank required! 🛡️`)
      return
    }
    setJoinedGuild(guild.id)
    fireFX('levelUp', { level: guild.name.split(' ')[0] })
    toast.success(`Welcome to the ${guild.name}! Crest unlocked. ⚔️`)
  }

  const handleRaid = async (raidName, xpReward, goldReward) => {
    setRaidLoading(raidName)
    // Simulate raid timing
    await new Promise((r) => setTimeout(r, 2200))
    setRaidLoading(null)
    
    // Fire dynamic completion sparks
    fireFX('taskComplete', { x: window.innerWidth / 2, y: window.innerHeight / 2 })
    toast.success(`Raid Cleared! Earned +${xpReward} XP & +${goldReward} Gold! 💰`)
    refresh?.()
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    try {
      const res = await fetch('/api/guilds/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ msg: newMsg.trim() })
      })
      if (res.ok) {
        setNewMsg('')
        fetchChat()
      }
    } catch (e) {
      toast.error('Failed to broadcast message')
    }
  }

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-500" /> Hunter Guilds Chamber
          </h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
            Enlist in national guilds, join raids, and level up with fellow hunters
          </p>
        </div>

        {/* Current status tag */}
        <div className="glass-card rounded-2xl px-4 py-2 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black" style={{ background: `${g.rankColor}20`, border: `1px solid ${g.rankColor}30`, color: g.rankColor }}>
            {g.rank}
          </div>
          <div>
            <div className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Your Hunter Rank</div>
            <div className="text-xs font-black text-white">{g.combatPower.toLocaleString()} Combat Power</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <Button
          onClick={() => setActiveTab('guilds')}
          variant="ghost"
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${activeTab === 'guilds' ? 'bg-white/5 text-amber-400' : 'text-white/40 hover:text-white'}`}
        >
          <Users className="w-3.5 h-3.5 mr-2" /> Guild Directory
        </Button>
        <Button
          onClick={() => setActiveTab('chat')}
          variant="ghost"
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${activeTab === 'chat' ? 'bg-white/5 text-amber-400' : 'text-white/40 hover:text-white'}`}
        >
          <MessageSquare className="w-3.5 h-3.5 mr-2" /> Raid Lobby Chat
        </Button>
        <Button
          onClick={() => setActiveTab('leaderboard')}
          variant="ghost"
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${activeTab === 'leaderboard' ? 'bg-white/5 text-amber-400' : 'text-white/40 hover:text-white'}`}
        >
          <Trophy className="w-3.5 h-3.5 mr-2" /> Guild Rankings
        </Button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'guilds' && (
          <motion.div
            key="guilds"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {GUILDS.map((guild) => {
              const isLocked = userRankVal < rankWeight[guild.minRank]
              const isJoined = joinedGuild === guild.id

              return (
                <div
                  key={guild.id}
                  className="glass-card rounded-3xl p-6 border flex flex-col justify-between relative overflow-hidden group"
                  style={{ borderColor: isJoined ? `${guild.color}50` : 'rgba(255,255,255,0.06)' }}
                >
                  {/* Lock glow overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 pointer-events-none" />
                  )}

                  <div className="space-y-4 relative z-20">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${guild.color}15`, border: `1px solid ${guild.color}30` }}>
                        {isLocked ? <ShieldAlert className="w-5 h-5 text-rose-500" /> : <Shield className="w-5 h-5" style={{ color: guild.color }} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                        style={{ color: guild.color, borderColor: `${guild.color}30`, background: `${guild.color}08` }}>
                        Min Rank {guild.minRank}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">{guild.name}</h3>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">{guild.description}</p>
                    </div>

                    {/* Perks list */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[9px] uppercase tracking-wider font-bold text-white/30">Guild Benefits:</div>
                      {guild.perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>

                    {/* Raid missions inside joined guilds */}
                    {isJoined && (
                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="text-[9px] uppercase tracking-wider font-bold text-amber-500">Available Guild Raids:</div>
                        {guild.raids.map((r, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                            <div>
                              <div className="text-xs font-black text-white">{r.name}</div>
                              <div className="text-[9px] font-mono text-white/40">{r.level} Raid</div>
                            </div>
                            <Button
                              onClick={() => handleRaid(r.name, r.xp, r.gold)}
                              disabled={!!raidLoading}
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-wider px-3 py-1.5 h-7 rounded-lg"
                            >
                              {raidLoading === r.name ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enter Gate'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 relative z-20">
                    {isLocked ? (
                      <Button disabled className="w-full bg-rose-950/20 border border-rose-500/20 text-rose-500/50 rounded-xl py-5 font-black text-xs uppercase tracking-widest">
                        Rank Insufficient
                      </Button>
                    ) : isJoined ? (
                      <Button variant="outline" disabled className="w-full border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-xl py-5 font-black text-xs uppercase tracking-widest">
                        Currently Active Member
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinGuild(guild)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-5 font-black text-xs uppercase tracking-widest transition-all duration-300 hover:border-white/20"
                      >
                        Sign Guild Contract <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Live Chat feed */}
            <div className="glass-card rounded-3xl border border-white/5 p-5 md:col-span-2 flex flex-col justify-between h-[450px]">
              <div className="overflow-y-auto space-y-4 pr-2 flex-1 scrollbar-thin">
                {messages.map((m, idx) => (
                  <div key={idx} className="flex flex-col gap-1 bg-white/5 p-3 rounded-2xl border border-white/5 max-w-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-cyan-400">{m.user}</span>
                      <span className="text-[9px] text-white/30">{m.time}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{m.msg}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Message inputs */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-white/5 mt-4">
                <input
                  type="text"
                  placeholder="Broadcast message to active channels..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-cyan-400"
                />
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl">
                  Send
                </Button>
              </form>
            </div>

            {/* Simulated Raid Lobbies status */}
            <div className="glass-card rounded-3xl border border-white/5 p-5 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Active Dungeon Gates
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Gate #928', danger: 'C-Rank Orc Cave', status: 'Raid in Progress', progress: 65, color: '#38bdf8' },
                  { name: 'Gate #929', danger: 'A-Rank Demon Spire', status: 'Forming Party', progress: 20, color: '#f59e0b' },
                  { name: 'Gate #930', danger: 'E-Rank Dungeon', status: 'Clearing Complete', progress: 100, color: '#10b981' }
                ].map((gate, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white">{gate.name}</span>
                      <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: gate.color }}>{gate.status}</span>
                    </div>
                    <div className="text-[10px] text-white/40">{gate.danger}</div>
                    <Progress value={gate.progress} className="h-1 bg-black/40" style={{ '--progress-background': gate.color }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto glass-card rounded-3xl border border-white/5 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">Top Performing Hunters</h3>
                <p className="text-[10px] text-white/40">National registry ranking computed by computed Combat Power (CP)</p>
              </div>
            </div>

            <div className="space-y-3">
              {leaderboard.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between border rounded-2xl p-4 transition-all duration-300 hover:bg-white/10
                    ${item.isYou ? 'bg-amber-500/10 border-amber-500/35' : 'bg-white/5 border-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-black text-sm text-white/30 w-6">#{item.rank}</span>
                    <div className="w-1.5 h-10 rounded-full" style={{ background: item.color }} />
                    <div>
                      <div className="text-sm font-black text-white">{item.name}</div>
                      <div className="text-[10px] text-white/40 font-mono" style={{ color: item.color }}>{item.hunterRank}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black tracking-tight" style={{ color: item.color }}>{item.cp.toLocaleString()} CP</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/30">Total Combat Rating</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
