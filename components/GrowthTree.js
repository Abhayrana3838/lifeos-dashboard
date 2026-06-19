'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, TreeDeciduous, Sun, Cloud, CloudRain, Snowflake, Wind, Droplets, Thermometer, Calendar, TrendingUp, BarChart3, Sprout, Leaf, Apple, Flower2, X, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Info, Zap, Target, Heart, Activity, Clock, Layers } from 'lucide-react'

export default function GrowthTree({ studyLogs, health, habits, goals, tasks, journal }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [treeData, setTreeData] = useState({
    trunk: 0,
    branches: [],
    leaves: [],
    fruits: [],
    roots: [],
    flowers: [],
    growthStage: 'seed'
  })
  const [selectedElement, setSelectedElement] = useState(null)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [season, setSeason] = useState('spring') // spring, summer, autumn, winter
  const [timeOfDay, setTimeOfDay] = useState('day') // day, night, dawn, dusk
  const [weather, setWeather] = useState('clear') // clear, cloudy, rain, snow
  const [viewMode, setViewMode] = useState('tree') // tree, timeline, metrics, growth
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showWeatherEffects, setShowWeatherEffects] = useState(true)
  const [autoSeason, setAutoSeason] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [growthHistory, setGrowthHistory] = useState([])
  const [treeHealth, setTreeHealth] = useState(null)
  const [environmentalFactors, setEnvironmentalFactors] = useState(null)
  const [growthInsights, setGrowthInsights] = useState([])
  
  // Advanced tree processing with growth stages
  useEffect(() => {
    const processTree = () => {
      const totalStudyHours = studyLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
      const totalTasks = tasks?.length || 0
      const completedGoals = goals?.filter(g => g.progress >= 100).length || 0
      const totalGoals = goals?.length || 0
      const habitStreak = habits?.reduce((max, h) => Math.max(max, h.streak || 0), 0) || 0
      const avgHabitStreak = habits?.reduce((sum, h) => sum + (h.streak || 0), 0) / (habits.length || 1) || 0
      const journalEntries = journal?.length || 0
      const positiveMoodEntries = journal?.filter(j => j.mood && j.mood > 3).length || 0
      
      // Calculate health score
      const healthScore = calculateHealthScore(health, habits)
      
      // Calculate discipline score (habit streak + task completion)
      const disciplineScore = Math.min(100, (habitStreak * 5) + (completedTasks * 3) + (avgHabitStreak * 10))
      
      // Calculate knowledge score (study hours + goals)
      const knowledgeScore = Math.min(100, (totalStudyHours * 2) + (completedGoals * 10))
      
      // Calculate achievement score (goals + tasks)
      const achievementScore = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : (completedTasks * 5)
      
      // Calculate overall growth score
      const overallGrowth = (disciplineScore * 0.3 + knowledgeScore * 0.3 + healthScore * 0.2 + achievementScore * 0.2)
      
      // Determine growth stage
      const growthStage = determineGrowthStage(overallGrowth, totalStudyHours, completedTasks)
      
      // Trunk strength based on discipline
      const trunkStrength = disciplineScore
      
      // Branches based on knowledge (study hours + subjects)
      const subjects = [...new Set(studyLogs?.map(log => log.subject) || [])]
      const branchCount = Math.min(30, Math.floor(totalStudyHours / 3) + subjects.length)
      const branches = generateBranches(branchCount, totalStudyHours, subjects, studyLogs)
      
      // Leaves based on skills and study sessions
      const leafCount = Math.min(200, studyLogs?.length * 5 || 0)
      const leaves = generateLeaves(leafCount, studyLogs, habits, healthScore)
      
      // Fruits based on achievements (completed goals + milestones)
      const fruitCount = completedGoals + Math.floor(completedTasks / 10)
      const fruits = generateFruits(fruitCount, goals, tasks)
      
      // Flowers based on recent activity and positive mood
      const flowerCount = Math.min(50, positiveMoodEntries + Math.floor(habitStreak / 3))
      const flowers = generateFlowers(flowerCount, journal, habits)
      
      // Roots based on health and foundation
      const rootCount = Math.min(20, Math.floor(healthScore / 5) + Math.floor(disciplineScore / 10))
      const roots = generateRoots(rootCount, healthScore, disciplineScore, habits)
      
      // Calculate tree health
      const healthMetrics = calculateTreeHealth(trunkStrength, branches, leaves, fruits, roots, healthScore)
      setTreeHealth(healthMetrics)
      
      // Calculate environmental factors
      const envFactors = calculateEnvironmentalFactors(habits, journal, studyLogs)
      setEnvironmentalFactors(envFactors)
      
      // Generate growth history
      const history = generateGrowthHistory(studyLogs, tasks, goals, habits)
      setGrowthHistory(history)
      
      // Generate growth insights
      const insights = generateGrowthInsights(overallGrowth, growthStage, healthMetrics, envFactors)
      setGrowthInsights(insights)
      
      // Calculate analytics
      const analyticsData = calculateTreeAnalytics(trunkStrength, branches, leaves, fruits, roots, flowers, growthStage, healthMetrics)
      setAnalytics(analyticsData)
      
      setTreeData({
        trunk: trunkStrength,
        branches,
        leaves,
        fruits,
        roots,
        flowers,
        growthStage,
        overallGrowth,
        disciplineScore,
        knowledgeScore,
        healthScore,
        achievementScore,
        totalStudyHours,
        completedTasks,
        completedGoals,
        habitStreak,
        subjects
      })
    }
    
    processTree()
  }, [studyLogs, health, habits, goals, tasks, journal])
  
  const calculateHealthScore = (health, habits) => {
    let score = 50 // Base score
    
    if (health && health.length > 0) {
      const recentHealth = health.slice(-7)
      const avgHealth = recentHealth.reduce((sum, h) => sum + (h.score || 50), 0) / recentHealth.length
      score = avgHealth
    }
    
    // Boost from habits
    const healthyHabits = habits?.filter(h => h.category === 'health' || h.category === 'exercise').length || 0
    score += healthyHabits * 5
    
    return Math.min(100, score)
  }
  
  const determineGrowthStage = (growth, studyHours, completedTasks) => {
    if (growth < 20) return 'seed'
    if (growth < 40) return 'sprout'
    if (growth < 60) return 'sapling'
    if (growth < 80) return 'mature'
    return 'ancient'
  }
  
  const generateBranches = (count, studyHours, subjects, studyLogs) => {
    const branches = []
    
    for (let i = 0; i < count; i++) {
      const subject = subjects[i % subjects.length] || 'General'
      const subjectLogs = studyLogs?.filter(log => log.subject === subject) || []
      const subjectHours = subjectLogs.reduce((sum, log) => sum + (log.hours || 0), 0)
      
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
      const length = 60 + Math.random() * 80 + (subjectHours * 2)
      const thickness = 2 + (subjectHours / 20) + (studyHours / 100)
      const growth = Math.min(1, subjectHours / 10 + studyHours / 50)
      
      branches.push({
        id: `branch-${i}`,
        angle,
        length,
        thickness,
        growth,
        subject,
        subjectHours,
        level: Math.floor(i / 5), // Branch level (main, secondary, tertiary)
        children: [],
        metadata: {
          sessionCount: subjectLogs.length,
          avgSessionLength: subjectLogs.length > 0 ? subjectHours / subjectLogs.length : 0,
          lastStudied: subjectLogs.length > 0 ? subjectLogs[subjectLogs.length - 1].date : null,
          difficulty: Math.random() > 0.5 ? 'hard' : 'easy'
        }
      })
    }
    
    // Add sub-branches
    branches.forEach((branch, i) => {
      if (branch.level < 2 && branch.growth > 0.5) {
        const subBranchCount = Math.floor(Math.random() * 3)
        for (let j = 0; j < subBranchCount; j++) {
          const subAngle = branch.angle + (Math.random() - 0.5) * 0.5
          const subLength = branch.length * 0.4 + Math.random() * 20
          
          branch.children.push({
            id: `subbranch-${i}-${j}`,
            angle: subAngle,
            length: subLength,
            thickness: branch.thickness * 0.6,
            growth: branch.growth * 0.8,
            subject: branch.subject,
            level: branch.level + 1
          })
        }
      }
    })
    
    return branches
  }
  
  const generateLeaves = (count, studyLogs, habits, healthScore) => {
    const leaves = []
    
    for (let i = 0; i < count; i++) {
      const health = Math.random() * 0.4 + 0.4 + (healthScore / 200)
      const falling = health < 0.3 || Math.random() < 0.05
      
      leaves.push({
        id: `leaf-${i}`,
        x: 20 + Math.random() * 60,
        y: 10 + Math.random() * 50,
        size: 3 + Math.random() * 5,
        health,
        falling,
        age: Math.random(),
        color: getLeafColor(health, season),
        swayPhase: Math.random() * Math.PI * 2,
        metadata: {
          fromSubject: studyLogs?.[i % (studyLogs?.length || 1)]?.subject || 'General',
          growthRate: Math.random() * 0.1,
          photosynthesis: health * 0.8
        }
      })
    }
    
    return leaves
  }
  
  const generateFruits = (count, goals, tasks) => {
    const fruits = []
    const completedGoalsList = goals?.filter(g => g.progress >= 100) || []
    const milestoneTasks = tasks?.filter(t => t.status === 'completed' && t.priority === 'high') || []
    
    for (let i = 0; i < count; i++) {
      const goal = completedGoalsList[i % completedGoalsList.length]
      const task = milestoneTasks[i % milestoneTasks.length]
      
      fruits.push({
        id: `fruit-${i}`,
        x: 25 + Math.random() * 50,
        y: 15 + Math.random() * 40,
        size: 6 + Math.random() * 6,
        color: ['#fbbf24', '#34d399', '#f472b6', '#22d3ee', '#f97316'][i % 5],
        ripeness: 0.7 + Math.random() * 0.3,
        swayPhase: Math.random() * Math.PI * 2,
        metadata: {
          fromGoal: goal?.title || 'Achievement',
          fromTask: task?.title || 'Milestone',
          dateAchieved: goal?.completedAt || new Date().toISOString(),
          value: goal?.difficulty || task?.priority || 'medium'
        }
      })
    }
    
    return fruits
  }
  
  const generateFlowers = (count, journal, habits) => {
    const flowers = []
    
    for (let i = 0; i < count; i++) {
      const entry = journal?.[i % (journal?.length || 1)]
      const habit = habits?.[i % (habits?.length || 1)]
      
      flowers.push({
        id: `flower-${i}`,
        x: 20 + Math.random() * 60,
        y: 10 + Math.random() * 45,
        size: 4 + Math.random() * 4,
        color: ['#f472b6', '#a78bfa', '#fb7185', '#c084fc'][i % 4],
        bloomStage: 0.5 + Math.random() * 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        petals: 5 + Math.floor(Math.random() * 3),
        metadata: {
          fromJournal: entry?.mood ? `Mood: ${entry.mood}/5` : 'Positive entry',
          fromHabit: habit?.name || 'Good habit',
          date: entry?.date || new Date().toISOString()
        }
      })
    }
    
    return flowers
  }
  
  const generateRoots = (count, healthScore, disciplineScore, habits) => {
    const roots = []
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI + Math.PI / 2 + (Math.random() - 0.5) * 0.4
      const length = 40 + Math.random() * 60 + (healthScore * 0.5)
      const thickness = 2 + (healthScore / 30) + (disciplineScore / 50)
      
      roots.push({
        id: `root-${i}`,
        angle,
        length,
        thickness,
        depth: length,
        health: healthScore / 100,
        branching: Math.random() > 0.7,
        metadata: {
          fromHabit: habits?.[i % (habits?.length || 1)]?.name || 'Foundation',
          type: Math.random() > 0.5 ? 'main' : 'secondary',
          nutrientAbsorption: Math.random()
        }
      })
    }
    
    return roots
  }
  
  const getLeafColor = (health, currentSeason) => {
    const seasonColors = {
      spring: ['#4ade80', '#22c55e', '#16a34a'],
      summer: ['#22c55e', '#15803d', '#166534'],
      autumn: ['#eab308', '#f59e0b', '#d97706'],
      winter: ['#4b5563', '#6b7280', '#9ca3af']
    }
    
    const colors = seasonColors[currentSeason] || seasonColors.spring
    const healthIndex = Math.floor(health * (colors.length - 1))
    return colors[healthIndex]
  }
  
  const calculateTreeHealth = (trunk, branches, leaves, fruits, roots, healthScore) => {
    const trunkHealth = trunk / 100
    const branchHealth = branches.length > 0 ? branches.reduce((sum, b) => sum + b.growth, 0) / branches.length : 0
    const leafHealth = leaves.length > 0 ? leaves.reduce((sum, l) => sum + l.health, 0) / leaves.length : 0
    const rootHealth = roots.length > 0 ? roots.reduce((sum, r) => sum + r.health, 0) / roots.length : 0
    
    const overall = (trunkHealth * 0.25 + branchHealth * 0.25 + leafHealth * 0.25 + rootHealth * 0.25) * 100
    const status = overall > 80 ? 'thriving' : overall > 60 ? 'healthy' : overall > 40 ? 'struggling' : 'critical'
    
    return {
      overall: Math.round(overall),
      trunk: Math.round(trunkHealth * 100),
      branches: Math.round(branchHealth * 100),
      leaves: Math.round(leafHealth * 100),
      roots: Math.round(rootHealth * 100),
      status,
      recommendations: generateHealthRecommendations(trunkHealth, branchHealth, leafHealth, rootHealth)
    }
  }
  
  const generateHealthRecommendations = (trunk, branch, leaf, root) => {
    const recommendations = []
    
    if (trunk < 0.5) recommendations.push('Increase habit consistency to strengthen trunk')
    if (branch < 0.5) recommendations.push('Study more regularly to grow branches')
    if (leaf < 0.5) recommendations.push('Focus on skill development for healthier leaves')
    if (root < 0.5) recommendations.push('Improve health habits for stronger roots')
    
    return recommendations
  }
  
  const calculateEnvironmentalFactors = (habits, journal, studyLogs) => {
    const sunlight = Math.min(100, (journal?.length || 0) * 5)
    const water = Math.min(100, (habits?.filter(h => h.category === 'health').length || 0) * 15)
    const nutrients = Math.min(100, (studyLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0) * 2)
    const care = Math.min(100, (habits?.reduce((sum, h) => sum + (h.streak || 0), 0) || 0) * 2)
    
    return {
      sunlight,
      water,
      nutrients,
      care,
      overall: Math.round((sunlight + water + nutrients + care) / 4)
    }
  }
  
  const generateGrowthHistory = (studyLogs, tasks, goals, habits) => {
    const history = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 0; i < 12; i++) {
      const monthStudy = studyLogs?.filter(log => {
        const date = new Date(log.date)
        return date.getMonth() === i
      }).reduce((sum, log) => sum + (log.hours || 0), 0) || 0
      
      const monthTasks = tasks?.filter(task => {
        const date = new Date(task.createdAt)
        return date.getMonth() === i
      }).length || 0
      
      const monthGoals = goals?.filter(goal => {
        const date = new Date(goal.createdAt)
        return date.getMonth() === i
      }).length || 0
      
      history.push({
        month: months[i],
        studyHours: monthStudy,
        tasks: monthTasks,
        goals: monthGoals,
        growth: Math.min(100, (monthStudy * 5) + (monthTasks * 3) + (monthGoals * 10))
      })
    }
    
    return history
  }
  
  const generateGrowthInsights = (growth, stage, health, env) => {
    const insights = []
    
    if (growth > 80) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Exceptional Growth',
        description: 'Your tree is thriving with excellent growth metrics.',
        severity: 'success'
      })
    }
    
    if (stage === 'ancient') {
      insights.push({
        type: 'stage',
        icon: TreeDeciduous,
        title: 'Ancient Tree Achieved',
        description: 'Congratulations! Your tree has reached the ancient stage.',
        severity: 'success'
      })
    }
    
    if (health.status === 'thriving') {
      insights.push({
        type: 'health',
        icon: Heart,
        title: 'Tree is Thriving',
        description: 'All aspects of your tree are in excellent health.',
        severity: 'success'
      })
    } else if (health.status === 'critical') {
      insights.push({
        type: 'health',
        icon: Info,
        title: 'Tree Needs Care',
        description: 'Your tree requires attention in multiple areas.',
        severity: 'warning'
      })
    }
    
    if (health.status === 'critical' || health.status === 'struggling') {
      insights.push({
        type: 'storm',
        icon: Wind,
        title: 'Looming Habit Storm',
        description: 'Vitals decay has triggered a storm! Deepen your roots with recovery steps to prevent branch cracking.',
        severity: 'warning'
      })
    }

    if (env.water < 50 || env.sunlight < 40) {
      insights.push({
        type: 'nutrients',
        icon: Droplets,
        title: 'Nutrient Blockage Detected',
        description: 'Low sleep or hydration is blocking cognitive absorption. Your study sessions are yielding 30% less retention.',
        severity: 'warning'
      })
    }

    if (env.overall > 80) {
      insights.push({
        type: 'environment',
        icon: Sun,
        title: 'Perfect Environment',
        description: 'Environmental factors are optimal for growth.',
        severity: 'success'
      })
    }
    
    return insights
  }
  
  const calculateTreeAnalytics = (trunk, branches, leaves, fruits, roots, flowers, stage, health) => {
    return {
      trunk,
      branchCount: branches.length,
      leafCount: leaves.length,
      fruitCount: fruits.length,
      rootCount: roots.length,
      flowerCount: flowers.length,
      growthStage: stage,
      health,
      totalElements: branches.length + leaves.length + fruits.length + roots.length + flowers.length,
      avgBranchGrowth: branches.length > 0 ? branches.reduce((sum, b) => sum + b.growth, 0) / branches.length : 0,
      avgLeafHealth: leaves.length > 0 ? leaves.reduce((sum, l) => sum + l.health, 0) / leaves.length : 0,
      productivity: fruits.length / (branches.length || 1) * 100
    }
  }
  
  // Advanced canvas rendering with seasonal effects
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
      
      // Draw background based on time of day
      drawBackground(ctx, width, height, time)
      
      // Draw ground
      drawGround(ctx, width, height, time)
      
      // Draw roots
      drawRoots(ctx, width, height, treeData.roots, time)
      
      // Draw trunk
      drawTrunk(ctx, width, height, treeData.trunk, treeData.growthStage, time)
      
      // Draw branches
      drawBranches(ctx, width, height, treeData.branches, treeData.trunk, time)
      
      // Draw nutrient flow particles
      drawNutrientParticles(ctx, width, height, time)
      
      // Draw leaves
      drawLeaves(ctx, width, height, treeData.leaves, time)
      
      // Draw flowers (spring/summer)
      if (season === 'spring' || season === 'summer') {
        drawFlowers(ctx, width, height, treeData.flowers, time)
      }
      
      // Draw fruits
      drawFruits(ctx, width, height, treeData.fruits, time)
      
      // Draw weather effects
      if (showWeatherEffects) {
        drawWeatherEffects(ctx, width, height, time)
      }
      
      // Draw selection highlight
      if (selectedElement) {
        drawElementSelection(ctx, width, height, selectedElement, time)
      }
      
      // Draw hover effect
      if (hoveredElement) {
        drawElementHover(ctx, width, height, hoveredElement, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [treeData, zoom, pan, season, timeOfDay, weather, viewMode, animationSpeed, showLabels, showWeatherEffects, selectedElement, hoveredElement])
  
  const drawBackground = (ctx, width, height, time) => {
    // Sky gradient based on time of day
    const skyColors = {
      day: ['#87CEEB', '#E0F6FF', '#87CEEB'],
      night: ['#0a0a2e', '#1a1a4e', '#0a0a2e'],
      dawn: ['#ff7e5f', '#feb47b', '#87CEEB'],
      dusk: ['#ff6b6b', '#feca57', '#ff9f43']
    }
    
    const colors = skyColors[timeOfDay] || skyColors.day
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(0.5, colors[1])
    gradient.addColorStop(1, colors[2])
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Sun or moon
    if (timeOfDay === 'day' || timeOfDay === 'dawn') {
      const sunX = width * 0.8
      const sunY = height * 0.15
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60)
      sunGradient.addColorStop(0, '#fff7e6')
      sunGradient.addColorStop(0.5, '#ffd93d')
      sunGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = sunGradient
      ctx.beginPath()
      ctx.arc(sunX, sunY, 60, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const moonX = width * 0.8
      const moonY = height * 0.15
      const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40)
      moonGradient.addColorStop(0, '#f5f5f5')
      moonGradient.addColorStop(0.5, '#e0e0e0')
      moonGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = moonGradient
      ctx.beginPath()
      ctx.arc(moonX, moonY, 40, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Stars at night
    if (timeOfDay === 'night') {
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width
        const y = Math.random() * height * 0.6
        const twinkle = Math.sin(time * 0.003 + i) * 0.5 + 0.5
        
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`
        ctx.fill()
      }
    }
  }
  
  const drawGround = (ctx, width, height, time) => {
    const groundY = height * 0.85
    
    // Ground gradient based on season
    const groundColors = {
      spring: ['#4ade80', '#22c55e'],
      summer: ['#22c55e', '#15803d'],
      autumn: ['#d97706', '#b45309'],
      winter: ['#e5e7eb', '#d1d5db']
    }
    
    const colors = groundColors[season] || groundColors.spring
    const gradient = ctx.createLinearGradient(0, groundY, 0, height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(width / 2, groundY, width * 0.5, 40, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Grass details
    if (season !== 'winter') {
      for (let i = 0; i < 50; i++) {
        const x = width * 0.2 + Math.random() * width * 0.6
        const y = groundY - 5 + Math.random() * 10
        const height = 5 + Math.random() * 10
        const sway = Math.sin(time * 0.002 + i) * 3
        
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(x + sway, y - height / 2, x + sway * 0.5, y - height)
        ctx.strokeStyle = colors[0]
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
  
  const drawRoots = (ctx, width, height, roots, time) => {
    const centerX = width / 2
    const centerY = height * 0.85
    
    roots.forEach(root => {
      const rootX = centerX + Math.cos(root.angle) * root.length
      const rootY = centerY + Math.sin(root.angle) * root.length
      
      // Root gradient
      const gradient = ctx.createLinearGradient(centerX, centerY, rootX, rootY)
      gradient.addColorStop(0, '#8b5cf6')
      gradient.addColorStop(1, '#6d28d9')
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.quadraticCurveTo(
        centerX + Math.cos(root.angle) * root.length * 0.5,
        centerY + Math.sin(root.angle) * root.length * 0.5,
        rootX,
        rootY
      )
      ctx.strokeStyle = gradient
      ctx.lineWidth = root.thickness * root.health
      ctx.stroke()
      
      // Root tip glow
      const pulse = Math.sin(time * 0.002 + root.id) * 0.5 + 0.5
      ctx.beginPath()
      ctx.arc(rootX, rootY, 3 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(139, 92, 246, ${0.5 + pulse * 0.3})`
      ctx.fill()
      
      // Sub-roots
      if (root.branching) {
        const subAngle = root.angle + 0.3
        const subLength = root.length * 0.5
        const subX = centerX + Math.cos(subAngle) * subLength
        const subY = centerY + Math.sin(subAngle) * subLength
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.quadraticCurveTo(
          centerX + Math.cos(subAngle) * subLength * 0.5,
          centerY + Math.sin(subAngle) * subLength * 0.5,
          subX,
          subY
        )
        ctx.strokeStyle = '#7c3aed'
        ctx.lineWidth = root.thickness * 0.6 * root.health
        ctx.stroke()
      }
    })
  }
  
  const drawTrunk = (ctx, width, height, trunkStrength, growthStage, time) => {
    const centerX = width / 2
    const centerY = height * 0.85
    
    const stageSizes = {
      seed: { width: 5, height: 10 },
      sprout: { width: 8, height: 30 },
      sapling: { width: 15, height: 80 },
      mature: { width: 25, height: 150 },
      ancient: { width: 35, height: 200 }
    }
    
    const baseSize = stageSizes[growthStage] || stageSizes.sapling
    const trunkWidth = baseSize.width + (trunkStrength / 10)
    const trunkHeight = baseSize.height + (trunkStrength / 2)
    
    // Trunk gradient
    const gradient = ctx.createLinearGradient(
      centerX - trunkWidth / 2, centerY,
      centerX + trunkWidth / 2, centerY
    )
    gradient.addColorStop(0, '#8b5cf6')
    gradient.addColorStop(0.3, '#a78bfa')
    gradient.addColorStop(0.7, '#a78bfa')
    gradient.addColorStop(1, '#7c3aed')
    
    // Draw trunk with organic shape
    ctx.beginPath()
    ctx.moveTo(centerX - trunkWidth / 2, centerY)
    
    // Left side with slight curve
    ctx.bezierCurveTo(
      centerX - trunkWidth / 2, centerY - trunkHeight * 0.3,
      centerX - trunkWidth / 3, centerY - trunkHeight * 0.7,
      centerX - trunkWidth / 4, centerY - trunkHeight
    )
    
    // Top
    ctx.lineTo(centerX + trunkWidth / 4, centerY - trunkHeight)
    
    // Right side with slight curve
    ctx.bezierCurveTo(
      centerX + trunkWidth / 3, centerY - trunkHeight * 0.7,
      centerX + trunkWidth / 2, centerY - trunkHeight * 0.3,
      centerX + trunkWidth / 2, centerY
    )
    
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
    
    // Bark texture
    for (let i = 0; i < 10; i++) {
      const barkX = centerX + (Math.random() - 0.5) * trunkWidth * 0.8
      const barkY = centerY - Math.random() * trunkHeight * 0.9
      const barkSize = 2 + Math.random() * 3
      
      ctx.beginPath()
      ctx.ellipse(barkX, barkY, barkSize, barkSize * 0.5, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(124, 58, 237, 0.3)'
      ctx.fill()
    }
    
    // Growth rings (for mature/ancient trees)
    if (growthStage === 'mature' || growthStage === 'ancient') {
      const ringCount = Math.floor(trunkStrength / 10)
      for (let i = 0; i < ringCount; i++) {
        const ringY = centerY - trunkHeight * 0.1 - (i * 5)
        const ringWidth = trunkWidth * (1 - i * 0.05)
        
        ctx.beginPath()
        ctx.moveTo(centerX - ringWidth / 2, ringY)
        ctx.lineTo(centerX + ringWidth / 2, ringY)
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
  
  const drawBranches = (ctx, width, height, branches, trunkStrength, time) => {
    const centerX = width / 2
    const centerY = height * 0.85
    const trunkHeight = 100 + (trunkStrength / 2)
    const trunkTopY = centerY - trunkHeight
    
    branches.forEach(branch => {
      const branchX = centerX + Math.cos(branch.angle - Math.PI / 2) * branch.length * branch.growth
      const branchY = trunkTopY + Math.sin(branch.angle - Math.PI / 2) * branch.length * branch.growth
      
      // Branch gradient
      const gradient = ctx.createLinearGradient(centerX, trunkTopY, branchX, branchY)
      gradient.addColorStop(0, '#a78bfa')
      gradient.addColorStop(1, '#8b5cf6')
      
      // Draw main branch
      ctx.beginPath()
      ctx.moveTo(centerX, trunkTopY)
      ctx.quadraticCurveTo(
        centerX + Math.cos(branch.angle - Math.PI / 2) * branch.length * 0.3 * branch.growth,
        trunkTopY + Math.sin(branch.angle - Math.PI / 2) * branch.length * 0.3 * branch.growth,
        branchX,
        branchY
      )
      ctx.strokeStyle = gradient
      ctx.lineWidth = branch.thickness * branch.growth
      ctx.lineCap = 'round'
      ctx.stroke()
      
      // Draw sub-branches
      branch.children.forEach(subBranch => {
        const subX = centerX + Math.cos(subBranch.angle - Math.PI / 2) * subBranch.length * subBranch.growth
        const subY = trunkTopY + Math.sin(subBranch.angle - Math.PI / 2) * subBranch.length * subBranch.growth
        
        ctx.beginPath()
        ctx.moveTo(centerX, trunkTopY)
        ctx.quadraticCurveTo(
          centerX + Math.cos(subBranch.angle - Math.PI / 2) * subBranch.length * 0.3 * subBranch.growth,
          trunkTopY + Math.sin(subBranch.angle - Math.PI / 2) * subBranch.length * 0.3 * subBranch.growth,
          subX,
          subY
        )
        ctx.strokeStyle = '#c4b5fd'
        ctx.lineWidth = subBranch.thickness * subBranch.growth
        ctx.stroke()
      })
      
      // Branch tip glow
      const pulse = Math.sin(time * 0.003 + branch.id) * 0.5 + 0.5
      ctx.beginPath()
      ctx.arc(branchX, branchY, 4 * branch.growth * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(167, 139, 250, ${0.6 + pulse * 0.2})`
      ctx.fill()
    })
  }
  
  const drawLeaves = (ctx, width, height, leaves, time) => {
    leaves.forEach(leaf => {
      const leafX = (leaf.x / 100) * width
      const leafY = (leaf.y / 100) * (height * 0.6)
      
      // Falling animation
      let fallOffset = 0
      let fallRotation = 0
      if (leaf.falling) {
        fallOffset = Math.sin(time * 0.01 + leaf.id) * 30
        fallRotation = Math.sin(time * 0.005 + leaf.id) * 0.5
      }
      
      // Swaying animation
      const sway = Math.sin(time * 0.002 + leaf.swayPhase) * 5
      
      // Leaf color based on season and health
      const color = getLeafColor(leaf.health, season)
      
      ctx.save()
      ctx.translate(leafX + sway, leafY + fallOffset)
      ctx.rotate(fallRotation)
      
      // Draw leaf shape
      ctx.beginPath()
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2)
      ctx.fillStyle = `${color}${Math.floor(leaf.health * 200).toString(16).padStart(2, '0')}`
      ctx.fill()
      
      // Leaf vein
      ctx.beginPath()
      ctx.moveTo(-leaf.size, 0)
      ctx.lineTo(leaf.size, 0)
      ctx.strokeStyle = `${color}80`
      ctx.lineWidth = 0.5
      ctx.stroke()
      
      ctx.restore()
    })
  }
  
  const drawFlowers = (ctx, width, height, flowers, time) => {
    flowers.forEach(flower => {
      const flowerX = (flower.x / 100) * width
      const flowerY = (flower.y / 100) * (height * 0.5)
      
      // Swaying animation
      const sway = Math.sin(time * 0.002 + flower.swayPhase) * 3
      const bloomPulse = Math.sin(time * 0.003 + flower.id) * 0.1 + 0.9
      
      ctx.save()
      ctx.translate(flowerX + sway, flowerY)
      
      // Draw petals
      for (let i = 0; i < flower.petals; i++) {
        const angle = (i / flower.petals) * Math.PI * 2
        const petalX = Math.cos(angle) * flower.size * bloomPulse
        const petalY = Math.sin(angle) * flower.size * bloomPulse
        
        ctx.beginPath()
        ctx.ellipse(petalX, petalY, flower.size * 0.6, flower.size * 0.3, angle, 0, Math.PI * 2)
        ctx.fillStyle = `${flower.color}${Math.floor(flower.bloomStage * 200).toString(16).padStart(2, '0')}`
        ctx.fill()
      }
      
      // Flower center
      ctx.beginPath()
      ctx.arc(0, 0, flower.size * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
      
      ctx.restore()
    })
  }
  
  const drawFruits = (ctx, width, height, fruits, time) => {
    fruits.forEach(fruit => {
      const fruitX = (fruit.x / 100) * width
      const fruitY = (fruit.y / 100) * (height * 0.5)
      
      // Swaying animation
      const sway = Math.sin(time * 0.002 + fruit.swayPhase) * 2
      
      // Glow effect
      const gradient = ctx.createRadialGradient(fruitX + sway, fruitY, 0, fruitX + sway, fruitY, fruit.size * 2)
      gradient.addColorStop(0, fruit.color)
      gradient.addColorStop(0.5, `${fruit.color}80`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(fruitX + sway, fruitY, fruit.size * 2, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Core fruit
      ctx.beginPath()
      ctx.arc(fruitX + sway, fruitY, fruit.size, 0, Math.PI * 2)
      ctx.fillStyle = fruit.color
      ctx.fill()
      
      // Shine
      ctx.beginPath()
      ctx.arc(fruitX + sway - fruit.size * 0.3, fruitY - fruit.size * 0.3, fruit.size * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.fill()
      
      // Stem
      ctx.beginPath()
      ctx.moveTo(fruitX + sway, fruitY + fruit.size)
      ctx.quadraticCurveTo(fruitX + sway + 5, fruitY + fruit.size + 10, fruitX + sway + 3, fruitY + fruit.size + 20)
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }
  
  const drawWeatherEffects = (ctx, width, height, time) => {
    const activeWeather = (treeHealth?.status === 'critical' || treeHealth?.status === 'struggling') ? 'storm' : weather
    if (activeWeather === 'rain' || activeWeather === 'storm') {
      const dropCount = activeWeather === 'storm' ? 200 : 100
      for (let i = 0; i < dropCount; i++) {
        const x = Math.random() * width
        const y = (time * (activeWeather === 'storm' ? 0.9 : 0.5) + i * 10) % height
        const length = (activeWeather === 'storm' ? 15 : 10) + Math.random() * 10
        
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - (activeWeather === 'storm' ? 4 : 2), y + length)
        ctx.strokeStyle = activeWeather === 'storm' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(100, 149, 237, 0.5)'
        ctx.lineWidth = activeWeather === 'storm' ? 1.5 : 1
        ctx.stroke()
      }
      
      // Draw lightning flashes in a storm
      if (activeWeather === 'storm' && Math.random() < 0.015) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.fillRect(0, 0, width, height)
      }
    } else if (activeWeather === 'snow') {
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width
        const y = (time * 0.2 + i * 20) % height
        const size = 2 + Math.random() * 3
        
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fill()
      }
    } else if (activeWeather === 'cloudy') {
      for (let i = 0; i < 5; i++) {
        const x = (i * width / 5) + Math.sin(time * 0.001 + i) * 20
        const y = 50 + Math.sin(time * 0.002 + i) * 10
        
        ctx.beginPath()
        ctx.arc(x, y, 40, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fill()
      }
    }
  }

  const drawNutrientParticles = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height * 0.85
    
    // Draw 15 particles rising up
    for (let i = 0; i < 15; i++) {
      const progress = ((time * 0.2) + (i / 15)) % 1
      
      let x = centerX
      let y = centerY
      
      const rootIndex = i % (treeData.roots?.length || 1)
      const root = treeData.roots?.[rootIndex]
      const branchIndex = i % (treeData.branches?.length || 1)
      const branch = treeData.branches?.[branchIndex]
      
      if (progress < 0.4) {
        // Traveling up the root: from tip to center
        if (root) {
          const tipX = centerX + Math.cos(root.angle) * root.length
          const tipY = centerY + Math.sin(root.angle) * root.length
          x = tipX + (centerX - tipX) * (progress / 0.4)
          y = tipY + (centerY - tipY) * (progress / 0.4)
        }
      } else if (progress < 0.7) {
        // Traveling up the trunk
        const trunkProgress = (progress - 0.4) / 0.3
        const trunkHeight = 80 + (treeData.trunk / 2)
        x = centerX
        y = centerY - trunkHeight * trunkProgress
      } else {
        // Traveling along a branch
        const branchProgress = (progress - 0.7) / 0.3
        const trunkHeight = 80 + (treeData.trunk / 2)
        if (branch) {
          const branchEndX = centerX + Math.cos(branch.angle) * branch.length
          const branchEndY = (centerY - trunkHeight) + Math.sin(branch.angle) * branch.length
          x = centerX + (branchEndX - centerX) * branchProgress
          y = (centerY - trunkHeight) + (branchEndY - (centerY - trunkHeight)) * branchProgress
        }
      }
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      const absorptionGood = (environmentalFactors?.water || 100) > 50
      ctx.fillStyle = absorptionGood ? '#10b981' : '#f97316'
      ctx.fill()
    }
  }
  
  const drawElementSelection = (ctx, width, height, element, time) => {
    const pulse = Math.sin(time * 0.005) * 0.5 + 0.5
    
    ctx.beginPath()
    if (element.type === 'leaf') {
      ctx.arc((element.x / 100) * width, (element.y / 100) * height, element.size * 2 + pulse * 5, 0, Math.PI * 2)
    } else if (element.type === 'fruit') {
      ctx.arc((element.x / 100) * width, (element.y / 100) * height, element.size * 2 + pulse * 5, 0, Math.PI * 2)
    } else if (element.type === 'flower') {
      ctx.arc((element.x / 100) * width, (element.y / 100) * height, element.size * 2 + pulse * 5, 0, Math.PI * 2)
    }
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.3})`
    ctx.lineWidth = 2
    ctx.stroke()
  }
  
  const drawElementHover = (ctx, width, height, element, time) => {
    ctx.beginPath()
    if (element.type === 'leaf') {
      ctx.arc((element.x / 100) * width, (element.y / 100) * height, element.size * 3, 0, Math.PI * 2)
    } else if (element.type === 'fruit') {
      ctx.arc((element.x / 100) * width, (element.y / 100) * height, element.size * 3, 0, Math.PI * 2)
    } else if (element.type === 'flower') {
      ctx.arc((element.x / 100) * width, (element.y / 100) * height, element.size * 3, 0, Math.PI * 2)
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fill()
  }
  
  // Mouse interaction handlers
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
    
    // Check for element hover
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const width = canvas.width
    const height = canvas.height
    
    const transformedX = (x - width / 2 - pan.x) / zoom + width / 2
    const transformedY = (y - height / 2 - pan.y) / zoom + height / 2
    
    // Check leaves
    let found = null
    for (const leaf of treeData.leaves) {
      const leafX = (leaf.x / 100) * width
      const leafY = (leaf.y / 100) * height
      const distance = Math.sqrt(Math.pow(transformedX - leafX, 2) + Math.pow(transformedY - leafY, 2))
      
      if (distance < leaf.size * 2) {
        found = { ...leaf, type: 'leaf' }
        break
      }
    }
    
    // Check fruits
    if (!found) {
      for (const fruit of treeData.fruits) {
        const fruitX = (fruit.x / 100) * width
        const fruitY = (fruit.y / 100) * height
        const distance = Math.sqrt(Math.pow(transformedX - fruitX, 2) + Math.pow(transformedY - fruitY, 2))
        
        if (distance < fruit.size * 2) {
          found = { ...fruit, type: 'fruit' }
          break
        }
      }
    }
    
    // Check flowers
    if (!found) {
      for (const flower of treeData.flowers) {
        const flowerX = (flower.x / 100) * width
        const flowerY = (flower.y / 100) * height
        const distance = Math.sqrt(Math.pow(transformedX - flowerX, 2) + Math.pow(transformedY - flowerY, 2))
        
        if (distance < flower.size * 2) {
          found = { ...flower, type: 'flower' }
          break
        }
      }
    }
    
    setHoveredElement(found)
  }, [isDragging, dragStart, pan, zoom, treeData])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleClick = useCallback((e) => {
    if (hoveredElement) {
      setSelectedElement(hoveredElement)
    } else {
      setSelectedElement(null)
    }
  }, [hoveredElement])
  
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }, [])
  
  // Export functionality
  const exportTree = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'growth-tree.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportTreeData = () => {
    const data = {
      treeData,
      analytics,
      growthHistory,
      treeHealth,
      environmentalFactors,
      growthInsights,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'growth-tree.json'
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
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleClick, handleWheel])
  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading growth tree...</p>
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
        {/* Season Control */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Season</span>
            <div className="flex gap-1">
              {['spring', 'summer', 'autumn', 'winter'].map(s => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    season === s 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Time of Day</span>
            <div className="flex gap-1">
              {['day', 'night', 'dawn', 'dusk'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeOfDay(t)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    timeOfDay === t 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Weather</span>
            <div className="flex gap-1">
              {['clear', 'cloudy', 'rain', 'snow'].map(w => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    weather === w 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {w.charAt(0).toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* View Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">View Mode</span>
            <div className="flex gap-1">
              {['tree', 'timeline', 'metrics', 'growth'].map(mode => (
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
          transition={{ delay: 0.2 }}
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
            <span className="text-xs text-white/60">Weather Effects</span>
            <button
              onClick={() => setShowWeatherEffects(!showWeatherEffects)}
              className={`w-10 h-5 rounded-full transition-all ${
                showWeatherEffects ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showWeatherEffects ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Auto Season</span>
            <button
              onClick={() => setAutoSeason(!autoSeason)}
              className={`w-10 h-5 rounded-full transition-all ${
                autoSeason ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                autoSeason ? 'translate-x-5' : 'translate-x-0.5'
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
        {/* Growth Stage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Growth Stage</span>
            <span className="text-lg font-bold text-emerald-400 capitalize">{treeData.growthStage}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Overall Growth</span>
            <span className="text-lg font-bold text-violet-400">{Math.round(treeData.overallGrowth || 0)}%</span>
          </div>
        </motion.div>
        
        {/* Tree Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Trunk Strength</span>
            <span className="text-lg font-bold text-violet-400">{Math.round(treeData.trunk)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Branches</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.branchCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Leaves</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.leafCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Fruits</span>
            <span className="text-lg font-bold text-amber-400">{analytics.fruitCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Roots</span>
            <span className="text-lg font-bold text-purple-400">{analytics.rootCount}</span>
          </div>
        </motion.div>
        
        {/* Tree Health */}
        {treeHealth && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Tree Health</div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Overall</span>
              <span className={`text-sm font-bold ${
                treeHealth.status === 'thriving' ? 'text-emerald-400' : 
                treeHealth.status === 'healthy' ? 'text-green-400' : 
                treeHealth.status === 'struggling' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {treeHealth.overall}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${treeHealth.overall}%` }}
                className={`h-full rounded-full ${
                  treeHealth.status === 'thriving' ? 'bg-emerald-500' : 
                  treeHealth.status === 'healthy' ? 'bg-green-500' : 
                  treeHealth.status === 'struggling' ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </motion.div>
        )}
        
        {/* Growth Insights */}
        {growthInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Growth Insights</div>
            <div className="space-y-2">
              {growthInsights.slice(0, 3).map((insight, i) => (
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
            onClick={exportTree}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportTreeData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Element Details Panel */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-xl p-4 max-w-md w-full mx-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white capitalize">{selectedElement.type}</span>
              </div>
              <p className="text-xs text-white/60">{selectedElement.type === 'leaf' ? selectedElement.metadata?.fromSubject : selectedElement.metadata?.fromGoal || selectedElement.metadata?.fromJournal}</p>
            </div>
            <button
              onClick={() => setSelectedElement(null)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Size:</span>
              <span className="text-white ml-1">{selectedElement.size.toFixed(1)}</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Health:</span>
              <span className="text-white ml-1">{selectedElement.health ? (selectedElement.health * 100).toFixed(0) + '%' : 'N/A'}</span>
            </div>
          </div>
          
          {selectedElement.metadata && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs text-white/40 mb-2">Details</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedElement.metadata).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-black/30 rounded-lg p-2">
                    <span className="text-white/40 capitalize">{key}:</span>
                    <span className="text-white ml-1">{typeof value === 'number' ? value.toFixed(1) : String(value).substring(0, 12)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Empty State */}
      {analytics.branchCount === 0 && analytics.leafCount === 0 && (
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
              🌱
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your tree is just a seed</p>
            <p className="text-white/30 text-xs">Start learning and building habits to help it grow</p>
          </div>
        </div>
      )}
      
      {/* Hover Tooltip */}
      {hoveredElement && !selectedElement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-none glass-card rounded-lg px-3 py-2 z-50"
          style={{
            left: hoveredElement.x / 100 * containerRef.current?.clientWidth || 0 + 20,
            top: hoveredElement.y / 100 * containerRef.current?.clientHeight || 0 - 20
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-white capitalize">{hoveredElement.type}</span>
          </div>
          <p className="text-xs text-white/60 mt-1">{hoveredElement.type === 'leaf' ? hoveredElement.metadata?.fromSubject : hoveredElement.metadata?.fromGoal || hoveredElement.metadata?.fromJournal}</p>
        </motion.div>
      )}
    </div>
  )
}
