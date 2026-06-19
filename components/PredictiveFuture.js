'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, TrendingUp, TrendingDown, Activity, Target, Award, Calendar, BarChart3, LineChart, PieChart, Radar, Play, Pause, RotateCcw, Info, Eye, EyeOff, Sliders, GitBranch, Lightbulb, AlertTriangle, CheckCircle2, Clock, Zap, Flame, Star, ArrowRight, ArrowUp, ArrowDown, Minus, Plus } from 'lucide-react'

export default function PredictiveFuture({ studyLogs, tasks, goals, stats, habits, exercise, health }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [whatIfParams, setWhatIfParams] = useState({
    studyIncrease: 0,
    taskIncrease: 0,
    goalIncrease: 0,
    habitIncrease: 0,
    exerciseIncrease: 0
  })
  const [projections, setProjections] = useState(null)
  const [viewMode, setViewMode] = useState('timeline') // timeline, radar, comparison, heatmap
  const [timeHorizon, setTimeHorizon] = useState(5) // years
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConfidence, setShowConfidence] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [futureInsights, setFutureInsights] = useState([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Advanced predictive processing
  useEffect(() => {
    const processPredictions = () => {
      // Calculate baseline metrics
      const baseline = calculateBaselineMetrics()
      
      // Generate scenarios
      const generatedScenarios = generateScenarios(baseline)
      setScenarios(generatedScenarios)
      
      // Calculate projections for all scenarios
      const projectionData = calculateProjections(generatedScenarios, baseline)
      setProjections(projectionData)
      
      // Calculate analytics
      const analyticsData = calculatePredictiveAnalytics(generatedScenarios, projectionData, baseline)
      setAnalytics(analyticsData)
      
      // Generate future insights
      const insights = generateFutureInsights(analyticsData, projectionData)
      setFutureInsights(insights)
      
      // Select default scenario
      setSelectedScenario(generatedScenarios[1]?.id || null)
    }
    
    processPredictions()
  }, [studyLogs, tasks, goals, stats, habits, exercise, health, whatIfParams, timeHorizon])
  
  const calculateBaselineMetrics = () => {
    const totalStudyHours = studyLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0
    const studyDays = Math.max(1, studyLogs?.length || 1)
    const avgStudyHoursPerDay = totalStudyHours / studyDays
    
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
    const taskDays = Math.max(1, 30)
    const avgTasksPerDay = completedTasks / taskDays
    
    const completedGoals = goals?.filter(g => g.progress >= 100).length || 0
    const goalDays = Math.max(1, 90)
    const avgGoalsPerDay = completedGoals / goalDays
    
    const activeHabits = habits?.filter(h => h.completed).length || 0
    const habitDays = Math.max(1, 30)
    const avgHabitsPerDay = activeHabits / habitDays
    
    const exerciseMinutes = exercise?.reduce((sum, ex) => sum + (ex.duration || 0), 0) || 0
    const exerciseDays = Math.max(1, exercise?.length || 1)
    const avgExercisePerDay = exerciseMinutes / exerciseDays
    
    const avgHealthScore = health?.reduce((sum, h) => sum + (h.score || 50), 0) / (health?.length || 1) || 50
    
    return {
      avgStudyHoursPerDay,
      avgTasksPerDay,
      avgGoalsPerDay,
      avgHabitsPerDay,
      avgExercisePerDay,
      avgHealthScore,
      totalStudyHours,
      completedTasks,
      completedGoals
    }
  }
  
  const generateScenarios = (baseline) => {
    const scenarios = [
      {
        id: 'optimistic',
        name: 'Optimistic',
        color: '#34d399',
        probability: 0.20,
        description: 'Best case scenario with accelerated growth',
        modifiers: {
          study: 1.5 + (whatIfParams.studyIncrease / 100),
          tasks: 1.4 + (whatIfParams.taskIncrease / 100),
          goals: 1.3 + (whatIfParams.goalIncrease / 100),
          habits: 1.2 + (whatIfParams.habitIncrease / 100),
          exercise: 1.25 + (whatIfParams.exerciseIncrease / 100)
        },
        confidence: 0.6
      },
      {
        id: 'realistic',
        name: 'Realistic',
        color: '#22d3ee',
        probability: 0.50,
        description: 'Most likely outcome based on current trends',
        modifiers: {
          study: 1.0 + (whatIfParams.studyIncrease / 200),
          tasks: 1.0 + (whatIfParams.taskIncrease / 200),
          goals: 1.0 + (whatIfParams.goalIncrease / 200),
          habits: 1.0 + (whatIfParams.habitIncrease / 200),
          exercise: 1.0 + (whatIfParams.exerciseIncrease / 200)
        },
        confidence: 0.8
      },
      {
        id: 'conservative',
        name: 'Conservative',
        color: '#fbbf24',
        probability: 0.20,
        description: 'Conservative estimate with moderate growth',
        modifiers: {
          study: 0.8 + (whatIfParams.studyIncrease / 300),
          tasks: 0.85 + (whatIfParams.taskIncrease / 300),
          goals: 0.9 + (whatIfParams.goalIncrease / 300),
          habits: 0.85 + (whatIfParams.habitIncrease / 300),
          exercise: 0.9 + (whatIfParams.exerciseIncrease / 300)
        },
        confidence: 0.9
      },
      {
        id: 'pessimistic',
        name: 'Pessimistic',
        color: '#f472b6',
        probability: 0.10,
        description: 'Worst case scenario with slowed progress',
        modifiers: {
          study: 0.6,
          tasks: 0.7,
          goals: 0.8,
          habits: 0.75,
          exercise: 0.8
        },
        confidence: 0.95
      }
    ]
    
    return scenarios
  }
  
  const calculateProjections = (scenarios, baseline) => {
    const projectionData = {}
    const years = Array.from({ length: timeHorizon + 1 }, (_, i) => i)
    
    scenarios.forEach(scenario => {
      projectionData[scenario.id] = years.map(year => {
        const compoundFactor = Math.pow(scenario.modifiers.study, year)
        const studyHours = baseline.avgStudyHoursPerDay * 365 * year * compoundFactor
        
        const taskCompound = Math.pow(scenario.modifiers.tasks, year)
        const tasksCompleted = baseline.avgTasksPerDay * 365 * year * taskCompound
        
        const goalCompound = Math.pow(scenario.modifiers.goals, year)
        const goalsAchieved = baseline.avgGoalsPerDay * 365 * year * goalCompound
        
        const habitCompound = Math.pow(scenario.modifiers.habits, year)
        const habitsMaintained = baseline.avgHabitsPerDay * 365 * year * habitCompound
        
        const exerciseCompound = Math.pow(scenario.modifiers.exercise, year)
        const exerciseMinutes = baseline.avgExercisePerDay * 365 * year * exerciseCompound
        
        const healthScore = Math.min(100, baseline.avgHealthScore + year * 5 * scenario.modifiers.exercise)
        
        const totalScore = (studyHours * 10) + (tasksCompleted * 5) + (goalsAchieved * 20) + (habitsMaintained * 3) + (exerciseMinutes * 0.1) + (healthScore * 10)
        
        return {
          year,
          studyHours,
          tasksCompleted,
          goalsAchieved,
          habitsMaintained,
          exerciseMinutes,
          healthScore,
          totalScore,
          confidence: scenario.confidence * (1 - year * 0.05) // Confidence decreases over time
        }
      })
    })
    
    return projectionData
  }
  
  const calculatePredictiveAnalytics = (scenarios, projectionData, baseline) => {
    const scenarioComparison = scenarios.map(scenario => {
      const points = projectionData[scenario.id]
      const finalPoint = points[points.length - 1]
      
      return {
        id: scenario.id,
        name: scenario.name,
        color: scenario.color,
        probability: scenario.probability,
        finalScore: finalPoint.totalScore,
        finalStudyHours: finalPoint.studyHours,
        finalTasks: finalPoint.tasksCompleted,
        finalGoals: finalPoint.goalsAchieved,
        growthRate: finalPoint.totalScore / (baseline.totalStudyHours * 10 + baseline.completedTasks * 5 + baseline.completedGoals * 20 + 100)
      }
    })
    
    const bestScenario = scenarioComparison.reduce((best, current) => 
      current.finalScore > best.finalScore ? current : best
    )
    
    const worstScenario = scenarioComparison.reduce((worst, current) => 
      current.finalScore < worst.finalScore ? current : worst
    )
    
    const avgGrowthRate = scenarioComparison.reduce((sum, s) => sum + s.growthRate, 0) / scenarioComparison.length
    
    const riskFactors = []
    if (baseline.avgStudyHoursPerDay < 1) riskFactors.push({ type: 'study', severity: 'high', message: 'Low study rate' })
    if (baseline.avgTasksPerDay < 0.5) riskFactors.push({ type: 'tasks', severity: 'medium', message: 'Low task completion' })
    if (baseline.avgHealthScore < 60) riskFactors.push({ type: 'health', severity: 'high', message: 'Poor health metrics' })
    
    return {
      scenarioComparison,
      bestScenario,
      worstScenario,
      avgGrowthRate,
      riskFactors,
      baselineImprovement: {
        study: baseline.avgStudyHoursPerDay,
        tasks: baseline.avgTasksPerDay,
        goals: baseline.avgGoalsPerDay,
        habits: baseline.avgHabitsPerDay,
        exercise: baseline.avgExercisePerDay,
        health: baseline.avgHealthScore
      }
    }
  }
  
  const generateFutureInsights = (analytics, projectionData) => {
    const insights = []
    
    if (analytics.bestScenario.growthRate > 2) {
      insights.push({
        type: 'growth',
        icon: TrendingUp,
        title: 'High Growth Potential',
        description: `${analytics.bestScenario.name} scenario shows ${analytics.bestScenario.growthRate.toFixed(1)}x growth potential.`,
        severity: 'success'
      })
    }
    
    if (analytics.riskFactors.length > 0) {
      insights.push({
        type: 'risk',
        icon: AlertTriangle,
        title: 'Risk Factors Identified',
        description: `${analytics.riskFactors.length} risk factors may impact your future projections.`,
        severity: 'warning'
      })
    }
    
    const realisticProjection = projectionData['realistic']
    if (realisticProjection) {
      const year3Projection = realisticProjection[3]
      if (year3Projection.totalScore > 5000) {
        insights.push({
          type: 'achievement',
          icon: Award,
          title: 'Strong 3-Year Outlook',
          description: `Projected to reach ${year3Projection.totalScore.toFixed(0)} points in 3 years.`,
          severity: 'success'
        })
      }
    }
    
    if (analytics.baselineImprovement.health > 70) {
      insights.push({
        type: 'health',
        icon: Activity,
        title: 'Strong Health Foundation',
        description: `Current health score of ${analytics.baselineImprovement.health.toFixed(0)} supports future growth.`,
        severity: 'success'
      })
    }
    
    return insights
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
      
      if (viewMode === 'timeline') {
        drawTimelineView(ctx, width, height, time)
      } else if (viewMode === 'radar') {
        drawRadarView(ctx, width, height, time)
      } else if (viewMode === 'comparison') {
        drawComparisonView(ctx, width, height, time)
      } else if (viewMode === 'heatmap') {
        drawHeatmapView(ctx, width, height, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [projections, scenarios, zoom, pan, viewMode, animationSpeed, showLabels, showConfidence, selectedScenario, timeHorizon])
  
  const drawTimelineView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    const startX = 80
    const endX = width - 80
    const startY = height - 80
    const endY = 80
    
    // Draw time axis
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, startY)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw year markers
    for (let i = 0; i <= timeHorizon; i++) {
      const x = startX + (i / timeHorizon) * (endX - startX)
      
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, startY + 10)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Year ${i}`, x, startY + 25)
    }
    
    // Draw scenario lines
    scenarios.forEach(scenario => {
      const points = projections[scenario.id]
      if (!points) return
      
      ctx.beginPath()
      points.forEach((point, i) => {
        const x = startX + (point.year / timeHorizon) * (endX - startX)
        const y = startY - (point.totalScore / 10000) * (startY - endY)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.strokeStyle = scenario.color
      ctx.lineWidth = selectedScenario === scenario.id ? 4 : 2
      ctx.stroke()
      
      // Draw confidence interval
      if (showConfidence) {
        points.forEach((point, i) => {
          const x = startX + (point.year / timeHorizon) * (endX - startX)
          const y = startY - (point.totalScore / 10000) * (startY - endY)
          const confidenceHeight = (1 - point.confidence) * 50
          
          ctx.beginPath()
          ctx.moveTo(x, y - confidenceHeight)
          ctx.lineTo(x, y + confidenceHeight)
          ctx.strokeStyle = scenario.color + '40'
          ctx.lineWidth = 1
          ctx.stroke()
        })
      }
      
      // Draw points
      points.forEach((point, i) => {
        const x = startX + (point.year / timeHorizon) * (endX - startX)
        const y = startY - (point.totalScore / 10000) * (startY - endY)
        
        const pulse = Math.sin(time * 0.03 + i) * 0.5 + 0.5
        const size = selectedScenario === scenario.id ? 8 : 6
        
        ctx.beginPath()
        ctx.arc(x, y, size + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = scenario.color
        ctx.fill()
        
        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, scenario.color + '80')
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Label
        if (showLabels && i === points.length - 1) {
          ctx.fillStyle = scenario.color
          ctx.font = 'bold 11px Arial'
          ctx.textAlign = 'left'
          ctx.fillText(scenario.name, x + 15, y)
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.font = '10px Arial'
          ctx.fillText(`${Math.round(scenario.probability * 100)}%`, x + 15, y + 15)
        }
      })
    })
    
    // Draw current position
    ctx.beginPath()
    ctx.arc(startX, startY, 12, 0, Math.PI * 2)
    ctx.fillStyle = '#8b5cf6'
    ctx.fill()
    
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('NOW', startX, startY + 30)
  }
  
  const drawRadarView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    const metrics = ['Study', 'Tasks', 'Goals', 'Habits', 'Exercise', 'Health']
    const numMetrics = metrics.length
    
    // Draw radar grid
    for (let level = 1; level <= 5; level++) {
      ctx.beginPath()
      for (let i = 0; i <= numMetrics; i++) {
        const angle = (i / numMetrics) * Math.PI * 2 - Math.PI / 2
        const r = (radius / 5) * level
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
    
    // Draw axis lines
    for (let i = 0; i < numMetrics; i++) {
      const angle = (i / numMetrics) * Math.PI * 2 - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // Labels
      const labelX = centerX + Math.cos(angle) * (radius + 30)
      const labelY = centerY + Math.sin(angle) * (radius + 30)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(metrics[i], labelX, labelY)
    }
    
    // Draw scenario polygons
    scenarios.forEach(scenario => {
      const points = projections[scenario.id]
      if (!points) return
      
      const finalPoint = points[points.length - 1]
      const values = [
        finalPoint.studyHours / 1000,
        finalPoint.tasksCompleted / 100,
        finalPoint.goalsAchieved / 50,
        finalPoint.habitsMaintained / 365,
        finalPoint.exerciseMinutes / 5000,
        finalPoint.healthScore / 100
      ]
      
      ctx.beginPath()
      values.forEach((value, i) => {
        const angle = (i / numMetrics) * Math.PI * 2 - Math.PI / 2
        const r = radius * Math.min(value, 1)
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.closePath()
      ctx.fillStyle = scenario.color + '40'
      ctx.fill()
      ctx.strokeStyle = scenario.color
      ctx.lineWidth = selectedScenario === scenario.id ? 3 : 2
      ctx.stroke()
    })
  }
  
  const drawComparisonView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    const barWidth = (width - 200) / scenarios.length
    const maxHeight = height - 150
    
    scenarios.forEach((scenario, i) => {
      const points = projections[scenario.id]
      if (!points) return
      
      const finalPoint = points[points.length - 1]
      const barHeight = (finalPoint.totalScore / 10000) * maxHeight
      const x = 100 + i * barWidth
      const y = height - 100 - barHeight
      
      // Bar
      const gradient = ctx.createLinearGradient(x, y, x, height - 100)
      gradient.addColorStop(0, scenario.color)
      gradient.addColorStop(1, scenario.color + '40')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x + 10, y, barWidth - 20, barHeight)
      
      // Border
      ctx.strokeStyle = selectedScenario === scenario.id ? 'white' : scenario.color
      ctx.lineWidth = selectedScenario === scenario.id ? 3 : 2
      ctx.strokeRect(x + 10, y, barWidth - 20, barHeight)
      
      // Label
      ctx.fillStyle = 'white'
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(scenario.name, x + barWidth / 2, height - 80)
      
      // Value
      ctx.fillStyle = scenario.color
      ctx.font = 'bold 12px Arial'
      ctx.fillText(finalPoint.totalScore.toFixed(0), x + barWidth / 2, y - 10)
    })
  }
  
  const drawHeatmapView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, width, height)
    
    const cellWidth = (width - 100) / (timeHorizon + 1)
    const cellHeight = (height - 150) / scenarios.length
    
    scenarios.forEach((scenario, i) => {
      const points = projections[scenario.id]
      if (!points) return
      
      points.forEach((point, j) => {
        const x = 50 + j * cellWidth
        const y = 50 + i * cellHeight
        
        const intensity = point.totalScore / 10000
        const hue = scenario.id === 'optimistic' ? 150 : scenario.id === 'realistic' ? 180 : scenario.id === 'conservative' ? 45 : 330
        
        ctx.fillStyle = `hsla(${hue}, 70%, ${30 + intensity * 40}%, 0.8)`
        ctx.fillRect(x, y, cellWidth - 5, cellHeight - 5)
        
        // Value
        if (showLabels) {
          ctx.fillStyle = 'white'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(point.totalScore.toFixed(0), x + cellWidth / 2, y + cellHeight / 2 + 4)
        }
      })
    })
    
    // Year labels
    for (let j = 0; j <= timeHorizon; j++) {
      const x = 50 + j * cellWidth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Year ${j}`, x + cellWidth / 2, height - 30)
    }
    
    // Scenario labels
    scenarios.forEach((scenario, i) => {
      const y = 50 + i * cellHeight
      ctx.fillStyle = scenario.color
      ctx.font = '11px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(scenario.name, 40, y + cellHeight / 2 + 4)
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
  const exportPrediction = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'predictive-future.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportPredictionData = () => {
    const data = {
      scenarios,
      projections,
      analytics,
      futureInsights,
      whatIfParams,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'predictive-future.json'
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
  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading predictions...</p>
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
              {['timeline', 'radar', 'comparison', 'heatmap'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    viewMode === mode 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Time Horizon</span>
            <div className="flex gap-1">
              {[3, 5, 7, 10].map(years => (
                <button
                  key={years}
                  onClick={() => setTimeHorizon(years)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    timeHorizon === years 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {years}y
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* What-If Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="text-xs text-white/60 font-medium mb-2">What-If Analysis</div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/60">Study</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setWhatIfParams(prev => ({ ...prev, studyIncrease: Math.max(-50, prev.studyIncrease - 10) }))} className="w-5 h-5 rounded bg-black/40 text-white/60 text-xs hover:bg-white/10">-</button>
                <span className="text-[10px] text-white w-8 text-center">{whatIfParams.studyIncrease}%</span>
                <button onClick={() => setWhatIfParams(prev => ({ ...prev, studyIncrease: Math.min(100, prev.studyIncrease + 10) }))} className="w-5 h-5 rounded bg-black/40 text-white/60 text-xs hover:bg-white/10">+</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/60">Tasks</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setWhatIfParams(prev => ({ ...prev, taskIncrease: Math.max(-50, prev.taskIncrease - 10) }))} className="w-5 h-5 rounded bg-black/40 text-white/60 text-xs hover:bg-white/10">-</button>
                <span className="text-[10px] text-white w-8 text-center">{whatIfParams.taskIncrease}%</span>
                <button onClick={() => setWhatIfParams(prev => ({ ...prev, taskIncrease: Math.min(100, prev.taskIncrease + 10) }))} className="w-5 h-5 rounded bg-black/40 text-white/60 text-xs hover:bg-white/10">+</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/60">Goals</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setWhatIfParams(prev => ({ ...prev, goalIncrease: Math.max(-50, prev.goalIncrease - 10) }))} className="w-5 h-5 rounded bg-black/40 text-white/60 text-xs hover:bg-white/10">-</button>
                <span className="text-[10px] text-white w-8 text-center">{whatIfParams.goalIncrease}%</span>
                <button onClick={() => setWhatIfParams(prev => ({ ...prev, goalIncrease: Math.min(100, prev.goalIncrease + 10) }))} className="w-5 h-5 rounded bg-black/40 text-white/60 text-xs hover:bg-white/10">+</button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setWhatIfParams({ studyIncrease: 0, taskIncrease: 0, goalIncrease: 0, habitIncrease: 0, exerciseIncrease: 0 })}
            className="w-full mt-2 px-2 py-1 rounded-lg bg-black/40 text-white/60 text-xs hover:bg-white/10 transition-colors"
          >
            Reset Parameters
          </button>
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
                showLabels ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showLabels ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Show Confidence</span>
            <button
              onClick={() => setShowConfidence(!showConfidence)}
              className={`w-10 h-5 rounded-full transition-all ${
                showConfidence ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showConfidence ? 'translate-x-5' : 'translate-x-0.5'
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
        {/* Scenario Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Scenarios</span>
            <span className="text-lg font-bold text-violet-400">{scenarios.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Best Growth</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.avgGrowthRate.toFixed(1)}x</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Risk Factors</span>
            <span className="text-lg font-bold text-amber-400">{analytics.riskFactors.length}</span>
          </div>
        </motion.div>
        
        {/* Future Insights */}
        {futureInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Future Insights</div>
            <div className="space-y-2">
              {futureInsights.slice(0, 3).map((insight, i) => (
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
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <button
            onClick={exportPrediction}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportPredictionData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Empty State */}
      {scenarios.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🔮
            </motion.div>
            <p className="text-white/40 text-sm mb-2">No data for predictions</p>
            <p className="text-white/30 text-xs">Start tracking to see your future projections</p>
          </div>
        </div>
      )}
    </div>
  )
}
