'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, User, Sparkles, Trophy, Star, Shield, Sword, Crown, Zap, Target, Heart, Activity, Brain, BookOpen, Dumbbell, Flame, Gem, Award, Medal, X, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Info, TrendingUp, BarChart3, Lock, Unlock, CheckCircle2, Circle, Layers, Grid, List, Eye, EyeOff } from 'lucide-react'

export default function EvolutionChamber({ stats, studyLogs, health, exercise, goals, tasks, habits, skills, journal, refresh }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [avatarState, setAvatarState] = useState({
    intelligenceAura: 0,
    physiqueStrength: 0,
    energyField: 0,
    visualLevel: 0,
    evolutionStage: 'embryo',
    totalXP: 0,
    xpToNextLevel: 100
  })
  const [skillTree, setSkillTree] = useState([])
  const [achievements, setAchievements] = useState([])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('avatar') // avatar, skills, achievements, stats
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [evolutionInsights, setEvolutionInsights] = useState([])
  const [avatarCustomization, setAvatarCustomization] = useState({
    primaryColor: '#8b5cf6',
    secondaryColor: '#22d3ee',
    accentColor: '#fbbf24',
    style: 'default'
  })
  const [unlockedCosmetics, setUnlockedCosmetics] = useState([])
  const [equippedCosmetics, setEquippedCosmetics] = useState([])

  const [allocatedPoints, setAllocatedPoints] = useState({ strength: 0, agility: 0, intelligence: 0, vitality: 0, sense: 0 })
  const [activeRaid, setActiveRaid] = useState(null)
  const [streakCrucible, setStreakCrucible] = useState(null)
  const [allocLoading, setAllocLoading] = useState(false)
  const [raidLoading, setRaidLoading] = useState(false)
  const [crucibleLoading, setCrucibleLoading] = useState(false)

  useEffect(() => {
    if (stats?.gameStats?.allocatedStats) {
      setAllocatedPoints(stats.gameStats.allocatedStats)
    }
    if (stats?.gameStats?.activeRaid) {
      setActiveRaid(stats.gameStats.activeRaid)
    } else {
      setActiveRaid(null)
    }
    if (stats?.gameStats?.streakCrucible) {
      setStreakCrucible(stats.gameStats.streakCrucible)
    } else {
      setStreakCrucible(null)
    }
  }, [stats])

  const handleAllocateStats = async () => {
    setAllocLoading(true)
    try {
      const res = await fetch('/api/game/allocate-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(allocatedPoints)
      })
      if (res.ok) {
        if (refresh) refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAllocLoading(false)
    }
  }

  const handleBossRaid = async (action, goalId = null) => {
    setRaidLoading(true)
    try {
      const res = await fetch('/api/game/boss-raid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ action, goalId })
      })
      if (res.ok) {
        const data = await res.json()
        setActiveRaid(data.activeRaid)
        if (refresh) refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRaidLoading(false)
    }
  }

  const handleStreakCrucible = async (action) => {
    setCrucibleLoading(true)
    try {
      const res = await fetch('/api/game/streak-crucible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        const data = await res.json()
        setStreakCrucible(data.streakCrucible)
        if (refresh) refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCrucibleLoading(false)
    }
  }
  
  // Advanced avatar processing
  useEffect(() => {
    const processEvolution = () => {
      const totalStudyHours = studyLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0
      const totalExercise = exercise?.reduce((sum, ex) => sum + (ex.duration || 0), 0) || 0
      const healthScore = calculateHealthScore(health, habits)
      const completedGoals = goals?.filter(g => g.progress >= 100).length || 0
      const totalGoals = goals?.length || 0
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
      const totalTasks = tasks?.length || 0
      const streak = stats?.streak || 0
      const habitStreak = habits?.reduce((max, h) => Math.max(max, h.streak || 0), 0) || 0
      const journalEntries = journal?.length || 0
      const skillCount = skills?.length || 0
      const avgSkillConfidence = skills?.reduce((sum, s) => sum + (s.confidence || 0), 0) / (skills?.length || 1) || 0
      
      // Calculate XP
      const studyXP = totalStudyHours * 10
      const exerciseXP = totalExercise * 5
      const goalXP = completedGoals * 50
      const taskXP = completedTasks * 5
      const habitXP = habitStreak * 20
      const journalXP = journalEntries * 2
      const skillXP = skillCount * 15
      
      const totalXP = studyXP + exerciseXP + goalXP + taskXP + habitXP + journalXP + skillXP
      
      // Calculate level
      const visualLevel = Math.min(10, Math.floor(totalXP / 100))
      const xpToNextLevel = (visualLevel + 1) * 100 - totalXP
      
      // Intelligence aura based on study and skills
      const intelligenceAura = Math.min(100, (totalStudyHours * 2) + (avgSkillConfidence * 10))
      
      // Physique strength based on exercise and health
      const physiqueStrength = Math.min(100, (totalExercise * 0.5) + (healthScore * 0.3))
      
      // Energy field based on consistency (streak + habit streak + journal)
      const energyField = Math.min(100, (streak * 5) + (habitStreak * 3) + (journalEntries * 0.5))
      
      // Determine evolution stage
      const evolutionStage = determineEvolutionStage(visualLevel, totalXP)
      
      // Generate skill tree
      const generatedSkillTree = generateSkillTree(skills, studyLogs, goals, tasks)
      setSkillTree(generatedSkillTree)
      
      // Generate achievements
      const generatedAchievements = generateAchievements(studyLogs, exercise, goals, tasks, habits, journal, totalXP, streak)
      setAchievements(generatedAchievements)
      
      // Calculate analytics
      const analyticsData = calculateEvolutionAnalytics(totalXP, visualLevel, intelligenceAura, physiqueStrength, energyField, generatedSkillTree, generatedAchievements)
      setAnalytics(analyticsData)
      
      // Generate evolution insights
      const insights = generateEvolutionInsights(evolutionStage, totalXP, visualLevel, analyticsData)
      setEvolutionInsights(insights)
      
      // Determine unlocked cosmetics
      const cosmetics = determineUnlockedCosmetics(visualLevel, completedGoals, habitStreak)
      setUnlockedCosmetics(cosmetics)
      
      setAvatarState({
        intelligenceAura,
        physiqueStrength,
        energyField,
        visualLevel,
        evolutionStage,
        totalXP,
        xpToNextLevel,
        studyXP,
        exerciseXP,
        goalXP,
        taskXP,
        habitXP,
        journalXP,
        skillXP
      })
    }
    
    processEvolution()
  }, [stats, studyLogs, health, exercise, goals, tasks, habits, skills, journal])
  
  const calculateHealthScore = (health, habits) => {
    let score = 50
    if (health && health.length > 0) {
      const recentHealth = health.slice(-7)
      score = recentHealth.reduce((sum, h) => sum + (h.score || 50), 0) / recentHealth.length
    }
    const healthyHabits = habits?.filter(h => h.category === 'health' || h.category === 'exercise').length || 0
    score += healthyHabits * 5
    return Math.min(100, score)
  }
  
  const determineEvolutionStage = (level, xp) => {
    if (level === 0) return 'embryo'
    if (level < 3) return 'infant'
    if (level < 5) return 'child'
    if (level < 7) return 'adolescent'
    if (level < 9) return 'adult'
    return 'transcendent'
  }
  
  const generateSkillTree = (skills, studyLogs, goals, tasks) => {
    const skillNodes = []
    
    // Core skills
    const coreSkills = [
      { id: 'focus', name: 'Focus', category: 'mental', icon: Target, baseXP: 50, dependencies: [] },
      { id: 'discipline', name: 'Discipline', category: 'mental', icon: Shield, baseXP: 75, dependencies: ['focus'] },
      { id: 'learning', name: 'Learning', category: 'mental', icon: BookOpen, baseXP: 100, dependencies: ['focus'] },
      { id: 'strength', name: 'Strength', category: 'physical', icon: Dumbbell, baseXP: 50, dependencies: [] },
      { id: 'endurance', name: 'Endurance', category: 'physical', icon: Activity, baseXP: 75, dependencies: ['strength'] },
      { id: 'vitality', name: 'Vitality', category: 'physical', icon: Heart, baseXP: 100, dependencies: ['strength'] },
      { id: 'creativity', name: 'Creativity', category: 'creative', icon: Sparkles, baseXP: 50, dependencies: [] },
      { id: 'innovation', name: 'Innovation', category: 'creative', icon: Zap, baseXP: 75, dependencies: ['creativity'] },
      { id: 'mastery', name: 'Mastery', category: 'ultimate', icon: Crown, baseXP: 200, dependencies: ['discipline', 'learning', 'endurance', 'vitality', 'innovation'] }
    ]
    
    coreSkills.forEach(skill => {
      const relatedSkills = skills?.filter(s => s.category === skill.category) || []
      const avgConfidence = relatedSkills.length > 0 ? relatedSkills.reduce((sum, s) => sum + (s.confidence || 0), 0) / relatedSkills.length : 0
      const practiceCount = relatedSkills.reduce((sum, s) => sum + (s.practiceCount || 0), 0)
      
      const isUnlocked = skill.dependencies.length === 0 || skill.dependencies.every(depId => {
        const depSkill = skillNodes.find(s => s.id === depId)
        return depSkill && depSkill.unlocked
      })
      
      const progress = Math.min(100, (avgConfidence * 10) + (practiceCount * 5))
      const unlocked = isUnlocked && progress >= 50
      
      skillNodes.push({
        ...skill,
        progress,
        unlocked,
        level: Math.floor(progress / 20),
        metadata: {
          practiceCount,
          avgConfidence,
          relatedSkills: relatedSkills.length,
          lastPracticed: relatedSkills.length > 0 ? relatedSkills[0].lastPracticed : null
        }
      })
    })
    
    return skillNodes
  }
  
  const generateAchievements = (studyLogs, exercise, goals, tasks, habits, journal, totalXP, streak) => {
    const achievements = []
    
    // Study achievements
    const totalStudyHours = studyLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0
    if (totalStudyHours >= 10) achievements.push({ id: 'study-10', name: 'Dedicated Scholar', description: 'Study for 10 hours', icon: BookOpen, unlocked: true, category: 'study', xpReward: 50 })
    if (totalStudyHours >= 50) achievements.push({ id: 'study-50', name: 'Knowledge Seeker', description: 'Study for 50 hours', icon: BookOpen, unlocked: true, category: 'study', xpReward: 100 })
    if (totalStudyHours >= 100) achievements.push({ id: 'study-100', name: 'Master Learner', description: 'Study for 100 hours', icon: BookOpen, unlocked: true, category: 'study', xpReward: 200 })
    
    // Exercise achievements
    const totalExercise = exercise?.reduce((sum, ex) => sum + (ex.duration || 0), 0) || 0
    if (totalExercise >= 5) achievements.push({ id: 'exercise-5', name: 'Fitness Starter', description: 'Exercise for 5 hours', icon: Dumbbell, unlocked: true, category: 'exercise', xpReward: 50 })
    if (totalExercise >= 25) achievements.push({ id: 'exercise-25', name: 'Fitness Enthusiast', description: 'Exercise for 25 hours', icon: Dumbbell, unlocked: true, category: 'exercise', xpReward: 100 })
    
    // Goal achievements
    const completedGoals = goals?.filter(g => g.progress >= 100).length || 0
    if (completedGoals >= 5) achievements.push({ id: 'goals-5', name: 'Goal Achiever', description: 'Complete 5 goals', icon: Target, unlocked: true, category: 'goals', xpReward: 100 })
    if (completedGoals >= 20) achievements.push({ id: 'goals-20', name: 'Goal Master', description: 'Complete 20 goals', icon: Target, unlocked: true, category: 'goals', xpReward: 250 })
    
    // Streak achievements
    if (streak >= 7) achievements.push({ id: 'streak-7', name: 'Week Warrior', description: '7 day streak', icon: Flame, unlocked: true, category: 'streak', xpReward: 75 })
    if (streak >= 30) achievements.push({ id: 'streak-30', name: 'Monthly Legend', description: '30 day streak', icon: Flame, unlocked: true, category: 'streak', xpReward: 200 })
    
    // XP achievements
    if (totalXP >= 500) achievements.push({ id: 'xp-500', name: 'Rising Star', description: 'Earn 500 XP', icon: Star, unlocked: true, category: 'xp', xpReward: 0 })
    if (totalXP >= 2000) achievements.push({ id: 'xp-2000', name: 'XP Champion', description: 'Earn 2000 XP', icon: Star, unlocked: true, category: 'xp', xpReward: 0 })
    if (totalXP >= 5000) achievements.push({ id: 'xp-5000', name: 'XP Legend', description: 'Earn 5000 XP', icon: Star, unlocked: true, category: 'xp', xpReward: 0 })
    
    // Locked achievements
    if (totalStudyHours < 100) achievements.push({ id: 'study-100-locked', name: 'Master Learner', description: 'Study for 100 hours', icon: Lock, unlocked: false, category: 'study', xpReward: 200, progress: Math.min(100, totalStudyHours) })
    if (completedGoals < 20) achievements.push({ id: 'goals-20-locked', name: 'Goal Master', description: 'Complete 20 goals', icon: Lock, unlocked: false, category: 'goals', xpReward: 250, progress: Math.min(100, (completedGoals / 20) * 100) })
    if (streak < 30) achievements.push({ id: 'streak-30-locked', name: 'Monthly Legend', description: '30 day streak', icon: Lock, unlocked: false, category: 'streak', xpReward: 200, progress: Math.min(100, (streak / 30) * 100) })
    
    return achievements
  }
  
  const calculateEvolutionAnalytics = (totalXP, level, intelligence, physique, energy, skillTree, achievements) => {
    const unlockedSkills = skillTree.filter(s => s.unlocked).length
    const totalSkills = skillTree.length
    const unlockedAchievements = achievements.filter(a => a.unlocked).length
    const totalAchievements = achievements.length
    
    return {
      totalXP,
      level,
      intelligence,
      physique,
      energy,
      skillProgress: (unlockedSkills / totalSkills) * 100,
      achievementProgress: (unlockedAchievements / totalAchievements) * 100,
      unlockedSkills,
      totalSkills,
      unlockedAchievements,
      totalAchievements,
      xpBreakdown: {
        study: avatarState.studyXP,
        exercise: avatarState.exerciseXP,
        goals: avatarState.goalXP,
        tasks: avatarState.taskXP,
        habits: avatarState.habitXP,
        journal: avatarState.journalXP,
        skills: avatarState.skillXP
      }
    }
  }
  
  const generateEvolutionInsights = (stage, xp, level, analytics) => {
    const insights = []
    
    if (stage === 'transcendent') {
      insights.push({
        type: 'stage',
        icon: Crown,
        title: 'Transcendent Being',
        description: 'You have reached the pinnacle of evolution.',
        severity: 'success'
      })
    }
    
    if (analytics.skillProgress > 80) {
      insights.push({
        type: 'skills',
        icon: Sparkles,
        title: 'Skill Master',
        description: `${analytics.unlockedSkills}/${analytics.totalSkills} skills unlocked.`,
        severity: 'success'
      })
    }
    
    if (analytics.achievementProgress > 60) {
      insights.push({
        type: 'achievements',
        icon: Trophy,
        title: 'Achievement Hunter',
        description: `${analytics.unlockedAchievements}/${analytics.totalAchievements} achievements earned.`,
        severity: 'success'
      })
    }
    
    if (analytics.intelligence > 80) {
      insights.push({
        type: 'intelligence',
        icon: Brain,
        title: 'Brilliant Mind',
        description: 'Your intelligence aura is exceptional.',
        severity: 'success'
      })
    }
    
    return insights
  }
  
  const determineUnlockedCosmetics = (level, completedGoals, habitStreak) => {
    const cosmetics = []
    
    // Level-based cosmetics
    if (level >= 1) cosmetics.push({ id: 'halo-1', name: 'Basic Halo', type: 'head', rarity: 'common' })
    if (level >= 3) cosmetics.push({ id: 'armor-3', name: 'Shoulder Armor', type: 'body', rarity: 'rare' })
    if (level >= 5) cosmetics.push({ id: 'wings-5', name: 'Energy Wings', type: 'back', rarity: 'epic' })
    if (level >= 7) cosmetics.push({ id: 'particles-7', name: 'Orbital Particles', type: 'effect', rarity: 'legendary' })
    if (level >= 10) cosmetics.push({ id: 'aura-10', name: 'Ultimate Aura', type: 'effect', rarity: 'mythic' })
    
    // Achievement-based cosmetics
    if (completedGoals >= 10) cosmetics.push({ id: 'crown-goals', name: 'Goal Crown', type: 'head', rarity: 'epic' })
    if (habitStreak >= 30) cosmetics.push({ id: 'flame-streak', name: 'Streak Flame', type: 'effect', rarity: 'legendary' })
    
    return cosmetics
  }
  
  // Advanced canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationFrame
    let time = 0
    
    const getAnimationSpeed = () => {
      const speeds = { slow: 0.5, normal: 1, fast: 2 }
      return speeds[animationSpeed] || 1
    }
    
    const render = () => {
      const width = canvas.width = canvas.parentElement.clientWidth
      const height = canvas.height = canvas.parentElement.clientHeight
      const speed = getAnimationSpeed()
      
      ctx.clearRect(0, 0, width, height)
      
      // Apply transformations
      ctx.save()
      ctx.translate(width / 2 + pan.x, height / 2 + pan.y)
      ctx.scale(zoom, zoom)
      ctx.translate(-width / 2, -height / 2)
      
      if (viewMode === 'avatar') {
        drawAvatar(ctx, width, height, time)
      } else if (viewMode === 'skills') {
        drawSkillTree(ctx, width, height, time)
      } else if (viewMode === 'achievements') {
        drawAchievements(ctx, width, height, time)
      } else if (viewMode === 'stats') {
        drawStats(ctx, width, height, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [avatarState, skillTree, achievements, zoom, pan, viewMode, animationSpeed, showLabels, showConnections, selectedSkill, selectedAchievement, avatarCustomization])
  
  const drawAvatar = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Draw background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw energy field (outer glow)
    const energyRadius = 100 + (avatarState.energyField / 100) * 60
    const energyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, energyRadius)
    energyGradient.addColorStop(0, `${avatarCustomization.secondaryColor}${Math.floor(0.1 + avatarState.energyField / 200 * 255).toString(16).padStart(2, '0')}`)
    energyGradient.addColorStop(0.5, `${avatarCustomization.primaryColor}${Math.floor(0.05 + avatarState.energyField / 400 * 255).toString(16).padStart(2, '0')}`)
    energyGradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, energyRadius, 0, Math.PI * 2)
    ctx.fillStyle = energyGradient
    ctx.fill()
    
    // Pulsing energy rings
    for (let i = 0; i < 4; i++) {
      const ringRadius = energyRadius * (0.2 + i * 0.25)
      const pulse = Math.sin(time * 0.03 + i) * 0.5 + 0.5
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius + pulse * 15, 0, Math.PI * 2)
      ctx.strokeStyle = `${avatarCustomization.secondaryColor}${Math.floor((0.1 + pulse * 0.2) * 255).toString(16).padStart(2, '0')}`
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    // Draw intelligence aura (inner glow)
    const auraRadius = 60 + (avatarState.intelligenceAura / 100) * 40
    const auraGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, auraRadius)
    auraGradient.addColorStop(0, `${avatarCustomization.accentColor}${Math.floor(0.2 + avatarState.intelligenceAura / 200 * 255).toString(16).padStart(2, '0')}`)
    auraGradient.addColorStop(0.7, `${avatarCustomization.accentColor}${Math.floor(0.1 + avatarState.intelligenceAura / 400 * 255).toString(16).padStart(2, '0')}`)
    auraGradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2)
    ctx.fillStyle = auraGradient
    ctx.fill()
    
    // Draw avatar body based on evolution stage
    const stageSizes = {
      embryo: { bodyWidth: 30, bodyHeight: 40, headSize: 20 },
      infant: { bodyWidth: 35, bodyHeight: 50, headSize: 22 },
      child: { bodyWidth: 40, bodyHeight: 60, headSize: 25 },
      adolescent: { bodyWidth: 50, bodyHeight: 70, headSize: 28 },
      adult: { bodyWidth: 60, bodyHeight: 80, headSize: 30 },
      transcendent: { bodyWidth: 70, bodyHeight: 90, headSize: 35 }
    }
    
    const baseSize = stageSizes[avatarState.evolutionStage] || stageSizes.child
    const bodyWidth = baseSize.bodyWidth + (avatarState.physiqueStrength / 100) * 20
    const bodyHeight = baseSize.bodyHeight + (avatarState.physiqueStrength / 100) * 20
    const headSize = baseSize.headSize + (avatarState.intelligenceAura / 100) * 10
    
    // Body
    const bodyGradient = ctx.createRadialGradient(centerX, centerY + 20, 0, centerX, centerY + 20, bodyWidth)
    bodyGradient.addColorStop(0, avatarCustomization.primaryColor)
    bodyGradient.addColorStop(1, `${avatarCustomization.primaryColor}80`)
    
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + 20, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2)
    ctx.fillStyle = bodyGradient
    ctx.fill()
    
    // Body glow
    const bodyGlow = ctx.createRadialGradient(centerX, centerY + 20, 0, centerX, centerY + 20, bodyWidth * 1.2)
    bodyGlow.addColorStop(0, `${avatarCustomization.primaryColor}80`)
    bodyGlow.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + 20, bodyWidth * 1.2, bodyHeight / 2 * 1.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = bodyGlow
    ctx.fill()
    
    // Head
    const headGradient = ctx.createRadialGradient(centerX, centerY - 35, 0, centerX, centerY - 35, headSize)
    headGradient.addColorStop(0, avatarCustomization.secondaryColor)
    headGradient.addColorStop(1, `${avatarCustomization.secondaryColor}80`)
    
    ctx.beginPath()
    ctx.arc(centerX, centerY - 35, headSize, 0, Math.PI * 2)
    ctx.fillStyle = headGradient
    ctx.fill()
    
    // Head glow
    const headGlow = ctx.createRadialGradient(centerX, centerY - 35, 0, centerX, centerY - 35, headSize * 1.5)
    headGlow.addColorStop(0, `${avatarCustomization.secondaryColor}80`)
    headGlow.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(centerX, centerY - 35, headSize * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = headGlow
    ctx.fill()
    
    // Eyes
    const eyeGlow = Math.sin(time * 0.05) * 0.3 + 0.7
    ctx.beginPath()
    ctx.arc(centerX - 10, centerY - 37, 5, 0, Math.PI * 2)
    ctx.arc(centerX + 10, centerY - 37, 5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(34, 211, 238, ${eyeGlow})`
    ctx.fill()
    
    // Draw equipped cosmetics
    equippedCosmetics.forEach(cosmetic => {
      if (cosmetic.type === 'head' && cosmetic.id.includes('halo')) {
        ctx.beginPath()
        ctx.arc(centerX, centerY - 65, 18 + Math.sin(time * 0.02) * 3, 0, Math.PI * 2)
        ctx.strokeStyle = `${avatarCustomization.accentColor}${Math.floor((0.5 + Math.sin(time * 0.03) * 0.3) * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = 3
        ctx.stroke()
      }
    })
    
    // Visual upgrades based on level
    if (avatarState.visualLevel >= 1) {
      ctx.beginPath()
      ctx.arc(centerX, centerY - 65, 15 + Math.sin(time * 0.02) * 3, 0, Math.PI * 2)
      ctx.strokeStyle = `${avatarCustomization.accentColor}${Math.floor((0.5 + Math.sin(time * 0.03) * 0.3) * 255).toString(16).padStart(2, '0')}`
      ctx.lineWidth = 3
      ctx.stroke()
    }
    
    if (avatarState.visualLevel >= 3) {
      ctx.beginPath()
      ctx.ellipse(centerX - bodyWidth / 2 - 12, centerY + 10, 18, 12, -0.3, 0, Math.PI * 2)
      ctx.ellipse(centerX + bodyWidth / 2 + 12, centerY + 10, 18, 12, 0.3, 0, Math.PI * 2)
      ctx.fillStyle = avatarCustomization.accentColor
      ctx.fill()
    }
    
    if (avatarState.visualLevel >= 5) {
      const wingSpan = 70 + Math.sin(time * 0.02) * 10
      ctx.beginPath()
      ctx.moveTo(centerX - bodyWidth / 2, centerY)
      ctx.quadraticCurveTo(centerX - bodyWidth / 2 - wingSpan, centerY - 35, centerX - bodyWidth / 2 - wingSpan, centerY + 25)
      ctx.quadraticCurveTo(centerX - bodyWidth / 2 - wingSpan / 2, centerY + 45, centerX - bodyWidth / 2, centerY + 35)
      ctx.fillStyle = `${avatarCustomization.secondaryColor}${Math.floor((0.3 + Math.sin(time * 0.03) * 0.2) * 255).toString(16).padStart(2, '0')}`
      ctx.fill()
      
      ctx.beginPath()
      ctx.moveTo(centerX + bodyWidth / 2, centerY)
      ctx.quadraticCurveTo(centerX + bodyWidth / 2 + wingSpan, centerY - 35, centerX + bodyWidth / 2 + wingSpan, centerY + 25)
      ctx.quadraticCurveTo(centerX + bodyWidth / 2 + wingSpan / 2, centerY + 45, centerX + bodyWidth / 2, centerY + 35)
      ctx.fillStyle = `${avatarCustomization.secondaryColor}${Math.floor((0.3 + Math.sin(time * 0.03) * 0.2) * 255).toString(16).padStart(2, '0')}`
      ctx.fill()
    }
    
    if (avatarState.visualLevel >= 7) {
      for (let i = 0; i < 8; i++) {
        const angle = (time * 0.02) + (i * Math.PI / 4)
        const orbitRadius = 110 + Math.sin(time * 0.01 + i) * 12
        const px = centerX + Math.cos(angle) * orbitRadius
        const py = centerY + Math.sin(angle) * orbitRadius
        
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#f472b6'
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(px - Math.cos(angle) * 12, py - Math.sin(angle) * 12, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(244, 114, 182, 0.5)'
        ctx.fill()
      }
    }
    
    if (avatarState.visualLevel >= 10) {
      const ultimateGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 160)
      ultimateGradient.addColorStop(0, `${avatarCustomization.accentColor}4d`)
      ultimateGradient.addColorStop(0.5, `${avatarCustomization.primaryColor}33`)
      ultimateGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, 160, 0, Math.PI * 2)
      ctx.fillStyle = ultimateGradient
      ctx.fill()
    }
    
    // Floating particles
    for (let i = 0; i < 25; i++) {
      const angle = (time * 0.01) + (i * Math.PI / 12)
      const radius = 70 + Math.sin(time * 0.02 + i) * 25
      const px = centerX + Math.cos(angle) * radius
      const py = centerY + Math.sin(angle) * radius
      
      ctx.beginPath()
      ctx.arc(px, py, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `${avatarCustomization.primaryColor}${Math.floor((0.3 + Math.sin(time * 0.03 + i) * 0.3) * 255).toString(16).padStart(2, '0')}`
      ctx.fill()
    }
  }
  
  const drawSkillTree = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw skill nodes
    skillTree.forEach((skill, i) => {
      const angle = (i / skillTree.length) * Math.PI * 2
      const radius = 80 + (skill.level * 20)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      // Draw connections
      if (showConnections && skill.dependencies.length > 0) {
        skill.dependencies.forEach(depId => {
          const depSkill = skillTree.find(s => s.id === depId)
          if (depSkill) {
            const depIndex = skillTree.indexOf(depSkill)
            const depAngle = (depIndex / skillTree.length) * Math.PI * 2
            const depRadius = 80 + (depSkill.level * 20)
            const depX = centerX + Math.cos(depAngle) * depRadius
            const depY = centerY + Math.sin(depAngle) * depRadius
            
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(depX, depY)
            ctx.strokeStyle = skill.unlocked ? 'rgba(52, 211, 153, 0.5)' : 'rgba(148, 163, 184, 0.2)'
            ctx.lineWidth = 2
            ctx.stroke()
          }
        })
      }
      
      // Draw skill node
      const pulse = Math.sin(time * 0.003 + i) * 0.5 + 0.5
      const nodeRadius = 25 + skill.level * 5
      
      // Node background
      const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius)
      if (skill.unlocked) {
        nodeGradient.addColorStop(0, '#22c55e')
        nodeGradient.addColorStop(1, '#15803d')
      } else {
        nodeGradient.addColorStop(0, '#4b5563')
        nodeGradient.addColorStop(1, '#374151')
      }
      
      ctx.beginPath()
      ctx.arc(x, y, nodeRadius * pulse, 0, Math.PI * 2)
      ctx.fillStyle = nodeGradient
      ctx.fill()
      
      // Progress ring
      if (!skill.unlocked) {
        ctx.beginPath()
        ctx.arc(x, y, nodeRadius * pulse + 5, 0, Math.PI * 2 * (skill.progress / 100))
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      
      // Skill icon placeholder
      ctx.fillStyle = skill.unlocked ? 'white' : 'rgba(255, 255, 255, 0.5)'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(skill.unlocked ? '✓' : '○', x, y)
      
      // Skill label
      if (showLabels) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '11px Arial'
        ctx.fillText(skill.name, x, y + nodeRadius + 15)
      }
    })
  }
  
  const drawAchievements = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw achievements in a grid
    const cols = 5
    const startX = centerX - (cols * 80) / 2
    const startY = centerY - (Math.ceil(achievements.length / cols) * 80) / 2
    
    achievements.forEach((achievement, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * 80
      const y = startY + row * 80
      
      const pulse = Math.sin(time * 0.003 + i) * 0.5 + 0.5
      
      // Achievement background
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30)
      if (achievement.unlocked) {
        gradient.addColorStop(0, '#fbbf24')
        gradient.addColorStop(1, '#f59e0b')
      } else {
        gradient.addColorStop(0, '#374151')
        gradient.addColorStop(1, '#1f2937')
      }
      
      ctx.beginPath()
      ctx.arc(x, y, 30 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Achievement icon
      ctx.fillStyle = achievement.unlocked ? 'white' : 'rgba(255, 255, 255, 0.3)'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(achievement.unlocked ? '★' : '○', x, y)
      
      // Progress for locked achievements
      if (!achievement.unlocked && achievement.progress !== undefined) {
        ctx.beginPath()
        ctx.arc(x, y, 35, 0, Math.PI * 2 * (achievement.progress / 100))
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      
      // Achievement label
      if (showLabels) {
        ctx.fillStyle = achievement.unlocked ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'
        ctx.font = '9px Arial'
        ctx.fillText(achievement.name.substring(0, 10), x, y + 40)
      }
    })
  }
  
  const drawStats = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw stat bars
    const stats = [
      { label: 'Intelligence', value: avatarState.intelligenceAura, color: '#fbbf24' },
      { label: 'Physique', value: avatarState.physiqueStrength, color: '#8b5cf6' },
      { label: 'Energy', value: avatarState.energyField, color: '#22d3ee' },
      { label: 'Skills', value: analytics?.skillProgress || 0, color: '#34d399' },
      { label: 'Achievements', value: analytics?.achievementProgress || 0, color: '#f472b6' }
    ]
    
    stats.forEach((stat, i) => {
      const y = centerY - 100 + i * 50
      const barWidth = 200
      const barHeight = 20
      
      // Bar background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(centerX - barWidth / 2, y, barWidth, barHeight)
      
      // Bar fill
      const fillWidth = barWidth * (stat.value / 100)
      const gradient = ctx.createLinearGradient(centerX - barWidth / 2, y, centerX - barWidth / 2 + fillWidth, y)
      gradient.addColorStop(0, stat.color)
      gradient.addColorStop(1, `${stat.color}80`)
      
      ctx.fillStyle = gradient
      ctx.fillRect(centerX - barWidth / 2, y, fillWidth, barHeight)
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(stat.label, centerX - barWidth / 2, y - 8)
      
      // Value
      ctx.textAlign = 'right'
      ctx.fillText(`${Math.round(stat.value)}%`, centerX + barWidth / 2, y - 8)
    })
  }
  
  // Mouse interaction handlers
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }, [isDragging, dragStart])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }, [])
  
  // Export functionality
  const exportEvolution = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'evolution-chamber.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportEvolutionData = () => {
    const data = {
      avatarState,
      skillTree,
      achievements,
      analytics,
      evolutionInsights,
      unlockedCosmetics,
      equippedCosmetics,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'evolution-chamber.json'
    link.href = URL.createObjectURL(blob)
    link.click()
  }
  
  // Reset view
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  
  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel])
  
  const getLevelTitle = (level) => {
    const titles = ['Novice', 'Apprentice', 'Adept', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'Divine', 'Transcendent', 'Ascended']
    return titles[level] || 'Novice'
  }
  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading evolution chamber...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-full min-h-[600px] bg-black/40 rounded-2xl overflow-hidden border border-white/10" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      
      {/* Advanced Control Panel */}
      <div className="absolute top-4 left-4 space-y-3 max-w-xs">
        {/* View Mode */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">View Mode</span>
            <div className="flex gap-1">
              {['avatar', 'skills', 'achievements', 'stats', 'laboratory'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    viewMode === mode 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Animation</span>
            <div className="flex gap-1">
              {['slow', 'normal', 'fast'].map(speed => (
                <button
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    animationSpeed === speed 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Toggle Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Show Labels</span>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`w-10 h-5 rounded-full transition-all ${
                showLabels ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showLabels ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Show Connections</span>
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`w-10 h-5 rounded-full transition-all ${
                showConnections ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showConnections ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
          className="glass-card p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="w-4 h-4 text-white/60" />
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card px-3 py-2 rounded-lg"
        >
          <span className="text-xs text-white/60">{Math.round(zoom * 100)}%</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
          className="glass-card p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-white/60" />
        </motion.button>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={resetView}
          className="glass-card p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-white/60" />
        </motion.button>
      </div>
      
      {/* Analytics Panel */}
      <div className="absolute top-4 right-4 space-y-3 max-w-xs">
        {/* Level and XP */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Evolution Stage</span>
            <span className="text-lg font-bold text-emerald-400 capitalize">{avatarState.evolutionStage}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Level</span>
            <span className="text-lg font-bold text-violet-400">{avatarState.visualLevel} - {getLevelTitle(avatarState.visualLevel)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total XP</span>
            <span className="text-lg font-bold text-amber-400">{Math.round(avatarState.totalXP)}</span>
          </div>
        </motion.div>
        
        {/* Core Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Intelligence</span>
            <span className="text-lg font-bold text-amber-400">{Math.round(avatarState.intelligenceAura)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Physique</span>
            <span className="text-lg font-bold text-violet-400">{Math.round(avatarState.physiqueStrength)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Energy</span>
            <span className="text-lg font-bold text-cyan-400">{Math.round(avatarState.energyField)}%</span>
          </div>
        </motion.div>
        
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-3"
        >
          <div className="text-xs text-white/60 font-medium mb-2">XP to Next Level</div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((avatarState.totalXP % 100) / 100) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
            />
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>{avatarState.totalXP % 100} XP</span>
            <span>100 XP</span>
          </div>
        </motion.div>
        
        {/* Evolution Insights */}
        {evolutionInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Evolution Insights</div>
            <div className="space-y-2">
              {evolutionInsights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-black/40">
                  <insight.icon className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">{insight.title}</div>
                    <div className="text-[10px] text-white/40">{insight.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Export Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2"
        >
          <button
            onClick={exportEvolution}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportEvolutionData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Empty State */}
      {analytics.totalXP === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🧬
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your evolution journey begins</p>
            <p className="text-white/30 text-xs">Start learning, exercising, and achieving goals to evolve</p>
          </div>
        </div>
      )}

      {viewMode === 'laboratory' && (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-black/90 p-6 backdrop-blur-md flex flex-col lg:flex-row gap-6">
          {/* STAT POINTS ALLOCATION */}
          <div className="flex-1 glass-card p-6 rounded-2xl border border-violet-500/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Shield className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-white text-lg">RPG Stat Allocation</h3>
            </div>
            
            <p className="text-xs text-white/50">
              Distribute your earned stat points to upgrade your hunter capabilities. Unspent points: <span className="font-bold text-violet-400">{stats?.gameStats?.unspentPoints || 0}</span>
            </p>

            <div className="space-y-4">
              {['strength', 'agility', 'intelligence', 'vitality', 'sense'].map(attr => {
                const baseVal = stats?.gameStats?.attributes?.[attr] || 10
                const allocVal = allocatedPoints[attr] || 0
                return (
                  <div key={attr} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-white/80 capitalize font-medium">{attr}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (allocVal > (stats?.gameStats?.allocatedStats?.[attr] || 0)) {
                            setAllocatedPoints(prev => ({ ...prev, [attr]: allocVal - 1 }))
                          }
                        }}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs text-white font-bold min-w-[30px] text-center">{baseVal}</span>
                      <button
                        onClick={() => {
                          const spent = Object.values(allocatedPoints).reduce((sum, val) => sum + val, 0)
                          const totalAvailable = Math.max(0, ((stats?.gameStats?.level || 1) - 1) * 5)
                          if (spent < totalAvailable) {
                            setAllocatedPoints(prev => ({ ...prev, [attr]: allocVal + 1 }))
                          }
                        }}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleAllocateStats}
              disabled={allocLoading}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              {allocLoading ? 'Saving...' : 'Save Attribute Points'}
            </button>
          </div>

          {/* BOSS RAID SEQUENCER */}
          <div className="flex-1 glass-card p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sword className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-lg">Quest Boss Raid</h3>
            </div>

            {activeRaid ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Boss: {activeRaid.title}</span>
                    <span className="text-red-400">{activeRaid.health}/100 HP</span>
                  </div>
                  <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-red-500/20">
                    <motion.div
                      animate={{ width: `${activeRaid.health}%` }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-400"
                    />
                  </div>
                </div>

                <div className="h-32 bg-black/60 rounded-xl p-3 border border-white/5 overflow-y-auto space-y-1 font-mono text-[10px] text-emerald-400">
                  {activeRaid.combatLogs?.map((log, i) => (
                    <div key={i} className="leading-tight">
                      <span className="text-white/30">[{new Date(log.time).toLocaleTimeString()}]</span> {log.text}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBossRaid('strike')}
                    disabled={raidLoading || activeRaid.health === 0}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    Strike Boss
                  </button>
                  <button
                    onClick={() => handleBossRaid('flee')}
                    disabled={raidLoading}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                  >
                    Flee
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/50">
                  Select a milestone quest to launch a Dungeon Boss Raid. Defeating the boss awards massive XP.
                </p>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {goals?.filter(g => g.progress < 100).map(goal => (
                    <div key={goal.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="text-xs text-white font-semibold truncate">{goal.title}</div>
                        <div className="text-[10px] text-white/40">Category: {goal.category}</div>
                      </div>
                      <button
                        onClick={() => handleBossRaid('start', goal.id)}
                        disabled={raidLoading}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 transition-colors shrink-0"
                      >
                        Raid
                      </button>
                    </div>
                  ))}
                  {goals?.filter(g => g.progress < 100).length === 0 && (
                    <div className="text-center text-xs text-white/30 py-6">No pending milestones to raid.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STREAK INSURANCE CRUCIBLE */}
          <div className="w-full lg:w-[280px] glass-card p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-lg">Streak Crucible</h3>
            </div>

            {streakCrucible?.active ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-center">
                  <div className="text-xs font-bold text-amber-400">CRUCIBLE ACTIVE</div>
                  <p className="text-[10px] text-white/80 leading-relaxed">{streakCrucible.desc}</p>
                </div>
                
                <button
                  onClick={() => handleStreakCrucible('claim')}
                  disabled={crucibleLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
                >
                  Verify & Claim Shield
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center py-4">
                <div className="text-3xl">🛡️</div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Lapsed streaks will reset to zero. Activate insurance to protect your chains.
                </p>
                <button
                  onClick={() => handleStreakCrucible('start')}
                  disabled={crucibleLoading}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                >
                  Start Crucible Insurance
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
