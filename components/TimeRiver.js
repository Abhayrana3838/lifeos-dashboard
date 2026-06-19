'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, Clock, Calendar, TrendingUp, BarChart3, Activity, Target, Award, BookOpen, CheckCircle2, Circle, X, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Info, Layers, Grid, List, Eye, EyeOff, MapPin, Flag, Star, Flame, Zap } from 'lucide-react'

export default function TimeRiver({ studyLogs, goals, tasks, journal, habits, exercise, health }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [timeEvents, setTimeEvents] = useState([])
  const [milestones, setMilestones] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('timeline') // timeline, calendar, statistics
  const [timeRange, setTimeRange] = useState('month') // day, week, month, year, all
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [timeInsights, setTimeInsights] = useState([])
  const [eventFilter, setEventFilter] = useState('all') // all, study, goals, tasks, journal, habits, exercise, health
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Advanced time processing
  useEffect(() => {
    const processTimeData = () => {
      const events = []
      
      // Process study logs
      studyLogs?.forEach(log => {
        events.push({
          id: `study-${log.id}`,
          type: 'study',
          date: new Date(log.date),
          title: log.subject,
          description: `Studied for ${log.hours} hours`,
          duration: log.hours,
          color: '#22d3ee',
          icon: BookOpen,
          metadata: {
            subject: log.subject,
            hours: log.hours,
            notes: log.notes
          }
        })
      })
      
      // Process goals
      goals?.forEach(goal => {
        events.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          date: new Date(goal.createdAt || Date.now()),
          title: goal.title,
          description: `Goal: ${goal.progress}% complete`,
          progress: goal.progress,
          color: goal.progress >= 100 ? '#34d399' : '#fbbf24',
          icon: Target,
          metadata: {
            progress: goal.progress,
            completed: goal.progress >= 100,
            category: goal.category
          }
        })
      })
      
      // Process tasks
      tasks?.forEach(task => {
        events.push({
          id: `task-${task.id}`,
          type: 'task',
          date: new Date(task.createdAt || Date.now()),
          title: task.title,
          description: task.status === 'completed' ? 'Completed' : 'In progress',
          status: task.status,
          color: task.status === 'completed' ? '#f472b6' : '#8b5cf6',
          icon: CheckCircle2,
          metadata: {
            status: task.status,
            priority: task.priority,
            completed: task.status === 'completed'
          }
        })
      })
      
      // Process journal entries
      journal?.forEach(entry => {
        events.push({
          id: `journal-${entry.id}`,
          type: 'journal',
          date: new Date(entry.date),
          title: entry.title || 'Journal Entry',
          description: entry.content?.substring(0, 50) + '...',
          color: '#a78bfa',
          icon: BookOpen,
          metadata: {
            mood: entry.mood,
            content: entry.content
          }
        })
      })
      
      // Process habits
      habits?.forEach(habit => {
        events.push({
          id: `habit-${habit.id}`,
          type: 'habit',
          date: new Date(habit.createdAt || Date.now()),
          title: habit.name,
          description: `Habit: ${habit.streak || 0} day streak`,
          streak: habit.streak,
          color: '#10b981',
          icon: Flame,
          metadata: {
            streak: habit.streak,
            category: habit.category,
            completed: habit.completed
          }
        })
      })
      
      // Process exercise
      exercise?.forEach(ex => {
        events.push({
          id: `exercise-${ex.id}`,
          type: 'exercise',
          date: new Date(ex.date),
          title: ex.type || 'Exercise',
          description: `${ex.duration} minutes`,
          duration: ex.duration,
          color: '#f97316',
          icon: Activity,
          metadata: {
            type: ex.type,
            duration: ex.duration,
            intensity: ex.intensity
          }
        })
      })
      
      // Process health
      health?.forEach(h => {
        events.push({
          id: `health-${h.id}`,
          type: 'health',
          date: new Date(h.date),
          title: 'Health Check',
          description: `Score: ${h.score || 50}`,
          score: h.score,
          color: h.score >= 70 ? '#34d399' : h.score >= 50 ? '#fbbf24' : '#ef4444',
          icon: Activity,
          metadata: {
            score: h.score,
            metrics: h.metrics
          }
        })
      })
      
      // Sort events by date
      events.sort((a, b) => a.date - b.date)
      
      setTimeEvents(events)
      
      // Generate milestones
      const generatedMilestones = generateMilestones(events)
      setMilestones(generatedMilestones)
      
      // Calculate analytics
      const analyticsData = calculateTimeAnalytics(events, generatedMilestones)
      setAnalytics(analyticsData)
      
      // Generate time insights
      const insights = generateTimeInsights(analyticsData, events)
      setTimeInsights(insights)
    }
    
    processTimeData()
  }, [studyLogs, goals, tasks, journal, habits, exercise, health])
  
  const generateMilestones = (events) => {
    const milestones = []
    
    // Study milestones
    const studyEvents = events.filter(e => e.type === 'study')
    const totalStudyHours = studyEvents.reduce((sum, e) => sum + (e.duration || 0), 0)
    
    if (totalStudyHours >= 10) milestones.push({ id: 'study-10', type: 'study', title: '10 Hours Studied', date: studyEvents[0]?.date, icon: Award, color: '#22d3ee' })
    if (totalStudyHours >= 50) milestones.push({ id: 'study-50', type: 'study', title: '50 Hours Studied', date: studyEvents[0]?.date, icon: Award, color: '#22d3ee' })
    if (totalStudyHours >= 100) milestones.push({ id: 'study-100', type: 'study', title: '100 Hours Studied', date: studyEvents[0]?.date, icon: Award, color: '#22d3ee' })
    
    // Goal milestones
    const completedGoals = events.filter(e => e.type === 'goal' && e.metadata?.completed)
    if (completedGoals.length >= 5) milestones.push({ id: 'goals-5', type: 'goal', title: '5 Goals Completed', date: completedGoals[0]?.date, icon: Target, color: '#34d399' })
    if (completedGoals.length >= 20) milestones.push({ id: 'goals-20', type: 'goal', title: '20 Goals Completed', date: completedGoals[0]?.date, icon: Target, color: '#34d399' })
    
    // Task milestones
    const completedTasks = events.filter(e => e.type === 'task' && e.metadata?.completed)
    if (completedTasks.length >= 10) milestones.push({ id: 'tasks-10', type: 'task', title: '10 Tasks Completed', date: completedTasks[0]?.date, icon: CheckCircle2, color: '#f472b6' })
    
    // Streak milestones
    const habitEvents = events.filter(e => e.type === 'habit')
    const maxStreak = Math.max(...habitEvents.map(e => e.metadata?.streak || 0))
    if (maxStreak >= 7) milestones.push({ id: 'streak-7', type: 'habit', title: '7 Day Streak', date: habitEvents[0]?.date, icon: Flame, color: '#f97316' })
    if (maxStreak >= 30) milestones.push({ id: 'streak-30', type: 'habit', title: '30 Day Streak', date: habitEvents[0]?.date, icon: Flame, color: '#f97316' })
    
    return milestones
  }
  
  const calculateTimeAnalytics = (events, milestones) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentEvents = events.filter(e => e.date >= oneWeekAgo)
    const monthlyEvents = events.filter(e => e.date >= oneMonthAgo)
    
    const eventsByType = {
      study: events.filter(e => e.type === 'study').length,
      goals: events.filter(e => e.type === 'goal').length,
      tasks: events.filter(e => e.type === 'task').length,
      journal: events.filter(e => e.type === 'journal').length,
      habits: events.filter(e => e.type === 'habit').length,
      exercise: events.filter(e => e.type === 'exercise').length,
      health: events.filter(e => e.type === 'health').length
    }
    
    const completedByType = {
      goals: events.filter(e => e.type === 'goal' && e.metadata?.completed).length,
      tasks: events.filter(e => e.type === 'task' && e.metadata?.completed).length
    }
    
    return {
      totalEvents: events.length,
      recentEvents: recentEvents.length,
      monthlyEvents: monthlyEvents.length,
      eventsByType,
      completedByType,
      milestones: milestones.length,
      totalStudyHours: events.filter(e => e.type === 'study').reduce((sum, e) => sum + (e.duration || 0), 0),
      avgDailyEvents: events.length > 0 ? events.length / 30 : 0,
      mostActiveDay: getMostActiveDay(events),
      activityTrend: getActivityTrend(events)
    }
  }
  
  const getMostActiveDay = (events) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCounts = days.map(() => 0)
    
    events.forEach(event => {
      const dayIndex = event.date.getDay()
      dayCounts[dayIndex]++
    })
    
    const maxCount = Math.max(...dayCounts)
    const mostActiveIndex = dayCounts.indexOf(maxCount)
    
    return days[mostActiveIndex]
  }
  
  const getActivityTrend = (events) => {
    const now = new Date()
    const lastWeek = events.filter(e => e.date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    const previousWeek = events.filter(e => {
      const weekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return e.date >= weekStart && e.date < weekEnd
    })
    
    if (previousWeek.length === 0) return 'stable'
    
    const ratio = lastWeek.length / previousWeek.length
    if (ratio > 1.2) return 'increasing'
    if (ratio < 0.8) return 'decreasing'
    return 'stable'
  }
  
  const generateTimeInsights = (analytics, events) => {
    const insights = []
    
    if (analytics.activityTrend === 'increasing') {
      insights.push({
        type: 'trend',
        icon: TrendingUp,
        title: 'Activity Increasing',
        description: 'Your activity has been increasing over the past week.',
        severity: 'success'
      })
    }
    
    if (analytics.mostActiveDay) {
      insights.push({
        type: 'pattern',
        icon: Calendar,
        title: `${analytics.mostActiveDay} is Most Active`,
        description: `You're most productive on ${analytics.mostActiveDay}.`,
        severity: 'info'
      })
    }
    
    if (analytics.totalStudyHours >= 50) {
      insights.push({
        type: 'achievement',
        icon: Award,
        title: 'Dedicated Learner',
        description: `You've studied ${analytics.totalStudyHours.toFixed(1)} hours total.`,
        severity: 'success'
      })
    }
    
    if (analytics.completedByType.goals >= 5) {
      insights.push({
        type: 'goals',
        icon: Target,
        title: 'Goal Achiever',
        description: `You've completed ${analytics.completedByType.goals} goals.`,
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
      } else if (viewMode === 'calendar') {
        drawCalendarView(ctx, width, height, time)
      } else if (viewMode === 'statistics') {
        drawStatisticsView(ctx, width, height, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [timeEvents, milestones, zoom, pan, viewMode, animationSpeed, showLabels, showConnections, eventFilter, selectedEvent, hoveredEvent])
  
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
    
    // Draw flowing river
    const riverPath = new Path2D()
    riverPath.moveTo(0, height * 0.5)
    
    for (let x = 0; x <= width; x += 10) {
      const wave = Math.sin((x + time * 2) * 0.02) * 20
      const y = height * 0.5 + wave
      riverPath.lineTo(x, y)
    }
    
    riverPath.lineTo(width, height)
    riverPath.lineTo(0, height)
    riverPath.closePath()
    
    const riverGradient = ctx.createLinearGradient(0, height * 0.3, 0, height)
    riverGradient.addColorStop(0, 'rgba(34, 211, 238, 0.1)')
    riverGradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.2)')
    riverGradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)')
    
    ctx.fillStyle = riverGradient
    ctx.fill(riverPath)
    
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke(riverPath)
    
    // Draw filtered events
    const filteredEvents = eventFilter === 'all' ? timeEvents : timeEvents.filter(e => e.type === eventFilter)
    
    filteredEvents.forEach((event, i) => {
      const x = (i / Math.max(filteredEvents.length - 1, 1)) * (width - 100) + 50
      const y = height * 0.5 + Math.sin((x + time * 2) * 0.02) * 20 + (event.type === 'goal' ? -40 : event.type === 'task' ? 40 : 0)
      
      const floatY = Math.sin(time * 0.02 + i) * 5
      const size = 8 + (event.duration || event.progress || 1) * 2
      
      // Event glow
      const gradient = ctx.createRadialGradient(x, y + floatY, 0, x, y + floatY, size * 2)
      gradient.addColorStop(0, event.color)
      gradient.addColorStop(0.5, event.color + '80')
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(x, y + floatY, size * 2, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Event core
      ctx.beginPath()
      ctx.arc(x, y + floatY, size, 0, Math.PI * 2)
      ctx.fillStyle = event.color
      ctx.fill()
      
      // Event label
      if (showLabels) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '9px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(event.title.substring(0, 12), x, y + floatY + size + 15)
      }
    })
    
    // Draw milestones
    milestones.forEach((milestone, i) => {
      const x = width * 0.1 + (i / Math.max(milestones.length - 1, 1)) * width * 0.8
      const y = height * 0.3
      
      // Milestone marker
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 10, y - 20)
      ctx.lineTo(x + 10, y - 20)
      ctx.closePath()
      ctx.fillStyle = milestone.color
      ctx.fill()
      
      // Milestone glow
      const glowGradient = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 30)
      glowGradient.addColorStop(0, milestone.color + '60')
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(x, y - 10, 30, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()
      
      // Milestone label
      if (showLabels) {
        ctx.fillStyle = 'white'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(milestone.title, x, y - 30)
      }
    })
    
    // Draw flowing particles
    for (let i = 0; i < 30; i++) {
      const particleX = ((time * 0.5 + i * 50) % (width + 100)) - 50
      const particleY = height * 0.5 + Math.sin((particleX + time * 2) * 0.02) * 20 + Math.sin(time * 0.03 + i) * 10
      
      ctx.beginPath()
      ctx.arc(particleX, particleY, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(time * 0.02 + i) * 0.2})`
      ctx.fill()
    }
    
    // Draw time markers
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    months.forEach((month, i) => {
      const x = (i / months.length) * width
      const y = height * 0.5 + Math.sin((x + time * 2) * 0.02) * 20 + 40
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(month, x, y)
    })
  }
  
  const drawCalendarView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw calendar grid
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const cellWidth = (width - 100) / 7
    const cellHeight = (height - 150) / 5
    
    // Day headers
    days.forEach((day, i) => {
      const x = 50 + i * cellWidth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(day, x + cellWidth / 2, 30)
    })
    
    // Calendar cells
    for (let week = 0; week < 5; week++) {
      for (let day = 0; day < 7; day++) {
        const x = 50 + day * cellWidth
        const y = 50 + week * cellHeight
        
        // Cell background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, cellWidth, cellHeight)
        
        // Find events for this day
        const dayEvents = timeEvents.filter(e => {
          const eventDay = e.date.getDay()
          return eventDay === day
        })
        
        // Draw event indicators
        dayEvents.slice(0, 3).forEach((event, i) => {
          const eventX = x + 5 + i * 8
          const eventY = y + 5
          
          ctx.beginPath()
          ctx.arc(eventX, eventY, 4, 0, Math.PI * 2)
          ctx.fillStyle = event.color
          ctx.fill()
        })
        
        // Event count
        if (dayEvents.length > 3) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`+${dayEvents.length - 3}`, x + cellWidth - 15, y + 15)
        }
      }
    }
  }
  
  const drawStatisticsView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    if (!analytics) return
    
    // Draw event type distribution
    const types = Object.keys(analytics.eventsByType)
    const maxCount = Math.max(...Object.values(analytics.eventsByType))
    const barWidth = (width - 100) / types.length
    const colors = {
      study: '#22d3ee',
      goals: '#fbbf24',
      tasks: '#8b5cf6',
      journal: '#a78bfa',
      habits: '#10b981',
      exercise: '#f97316',
      health: '#34d399'
    }
    
    types.forEach((type, i) => {
      const x = 50 + i * barWidth
      const barHeight = (analytics.eventsByType[type] / maxCount) * (height - 200)
      const y = height - 100 - barHeight
      
      // Bar
      ctx.fillStyle = colors[type] || '#8b5cf6'
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight)
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(type, x + barWidth / 2, y + barHeight + 15)
      
      // Count
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.fillText(analytics.eventsByType[type], x + barWidth / 2, y - 10)
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
  const exportTimeRiver = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'time-river.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportTimeData = () => {
    const data = {
      timeEvents,
      milestones,
      analytics,
      timeInsights,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'time-river.json'
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
          <p className="text-white/60">Loading time river...</p>
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
              {['timeline', 'calendar', 'statistics'].map(mode => (
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
            <span className="text-xs text-white/60 font-medium">Animation</span>
            <div className="flex gap-1">
              {['slow', 'normal', 'fast'].map(speed => (
                <button
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    animationSpeed === speed 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Event Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Filter Events</span>
            <div className="flex gap-1 flex-wrap">
              {['all', 'study', 'goals', 'tasks', 'journal', 'habits'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setEventFilter(filter)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    eventFilter === filter 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
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
                showLabels ? 'bg-cyan-500' : 'bg-white/10'
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
                showConnections ? 'bg-cyan-500' : 'bg-white/10'
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
        {/* Time Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total Events</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.totalEvents}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Recent (7d)</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.recentEvents}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Monthly</span>
            <span className="text-lg font-bold text-violet-400">{analytics.monthlyEvents}</span>
          </div>
        </motion.div>
        
        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Milestones</span>
            <span className="text-lg font-bold text-amber-400">{analytics.milestones}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Study Hours</span>
            <span className="text-lg font-bold text-pink-400">{analytics.totalStudyHours.toFixed(1)}h</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Most Active Day</span>
            <span className="text-lg font-bold text-purple-400">{analytics.mostActiveDay?.substring(0, 3)}</span>
          </div>
        </motion.div>
        
        {/* Time Insights */}
        {timeInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Time Insights</div>
            <div className="space-y-2">
              {timeInsights.slice(0, 3).map((insight, i) => (
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
          transition={{ delay: 0.3 }}
          className="flex gap-2"
        >
          <button
            onClick={exportTimeRiver}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportTimeData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Empty State */}
      {analytics.totalEvents === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                rotate: [0, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🌊
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your time river is empty</p>
            <p className="text-white/30 text-xs">Start logging activities to see your journey</p>
          </div>
        </div>
      )}
    </div>
  )
}
