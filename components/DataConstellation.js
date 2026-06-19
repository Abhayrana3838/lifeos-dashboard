'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, Calendar, TrendingUp, Star, Award, BookOpen, Target, X, ChevronDown, ChevronUp, Info } from 'lucide-react'

export default function DataConstellation({ tasks, studyLogs, goals, journal, habits }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [constellationData, setConstellationData] = useState({ stars: [], connections: [], clusters: [] })
  const [selectedStar, setSelectedStar] = useState(null)
  const [hoveredStar, setHoveredStar] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState('all')
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [constellationPatterns, setConstellationPatterns] = useState([])
  const [viewMode, setViewMode] = useState('standard') // standard, cluster, timeline, heat
  const [starDensity, setStarDensity] = useState('medium')
  const [connectionStrength, setConnectionStrength] = useState('medium')
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(0)
  
  // Advanced data processing with clustering algorithms
  useEffect(() => {
    const processData = () => {
      const stars = []
      const connections = []
      const clusters = []
      
      // Process tasks with detailed metadata
      tasks?.filter(t => t.status === 'completed').forEach((task, i) => {
        const taskDate = new Date(task.completedAt || task.createdAt)
        const daysSinceCompletion = Math.floor((new Date() - taskDate) / (1000 * 60 * 60 * 24))
        
        stars.push({
          id: `task-${task.id}`,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          size: 3 + (task.priority === 'high' ? 2 : 0) + Math.random() * 2,
          brightness: Math.max(0.3, 1 - daysSinceCompletion / 365),
          type: 'task',
          subtype: task.priority,
          data: task,
          color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#fbbf24',
          clusterId: null,
          connections: [],
          metadata: {
            completedAt: task.completedAt,
            priority: task.priority,
            category: task.category,
            daysSinceCompletion,
            impact: calculateTaskImpact(task)
          }
        })
      })
      
      // Process study logs with subject clustering
      const subjectGroups = {}
      studyLogs?.forEach((log, i) => {
        if (!subjectGroups[log.subject]) {
          subjectGroups[log.subject] = []
        }
        subjectGroups[log.subject].push(log)
      })
      
      Object.entries(subjectGroups).forEach(([subject, logs], groupIndex) => {
        const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0)
        const avgHours = totalHours / logs.length
        const clusterCenter = {
          x: 15 + (groupIndex * 20) % 70,
          y: 15 + Math.floor(groupIndex / 4) * 20
        }
        
        logs.forEach((log, i) => {
          const logDate = new Date(log.date)
          const daysSince = Math.floor((new Date() - logDate) / (1000 * 60 * 60 * 24))
          
          stars.push({
            id: `study-${log.id}`,
            x: clusterCenter.x + (Math.random() - 0.5) * 15,
            y: clusterCenter.y + (Math.random() - 0.5) * 15,
            size: 4 + (log.hours || 1) * 0.5 + Math.random() * 2,
            brightness: Math.max(0.4, 1 - daysSince / 180),
            type: 'study',
            subtype: subject,
            data: log,
            color: '#22d3ee',
            clusterId: `study-${subject}`,
            connections: [],
            metadata: {
              subject,
              hours: log.hours,
              date: log.date,
              daysSince,
              notes: log.notes,
              efficiency: calculateStudyEfficiency(log)
            }
          })
        })
        
        clusters.push({
          id: `study-${subject}`,
          name: subject,
          type: 'study',
          center: clusterCenter,
          starCount: logs.length,
          totalHours,
          color: '#22d3ee'
        })
      })
      
      // Process goals with milestone tracking
      goals?.filter(g => g.progress >= 100).forEach((goal, i) => {
        const goalDate = new Date(goal.completedAt || goal.createdAt)
        const daysSince = Math.floor((new Date() - goalDate) / (1000 * 60 * 60 * 24))
        
        stars.push({
          id: `goal-${goal.id}`,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: 6 + (goal.difficulty === 'hard' ? 3 : 0) + Math.random() * 3,
          brightness: Math.max(0.5, 1 - daysSince / 730),
          type: 'goal',
          subtype: goal.category,
          data: goal,
          color: goal.difficulty === 'hard' ? '#10b981' : '#34d399',
          clusterId: null,
          connections: [],
          metadata: {
            title: goal.title,
            category: goal.category,
            difficulty: goal.difficulty,
            progress: goal.progress,
            completedAt: goal.completedAt,
            daysSince,
            impact: calculateGoalImpact(goal)
          }
        })
      })
      
      // Process journal entries as wisdom stars
      journal?.forEach((entry, i) => {
        const entryDate = new Date(entry.date)
        const daysSince = Math.floor((new Date() - entryDate) / (1000 * 60 * 60 * 24))
        const moodScore = getMoodScore(entry.mood)
        
        stars.push({
          id: `journal-${entry.id}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 2 + moodScore * 2,
          brightness: Math.max(0.2, 1 - daysSince / 90),
          type: 'journal',
          subtype: entry.mood,
          data: entry,
          color: getMoodColor(entry.mood),
          clusterId: null,
          connections: [],
          metadata: {
            mood: entry.mood,
            moodScore,
            date: entry.date,
            daysSince,
            wordCount: entry.content?.split(' ').length || 0,
            tags: entry.tags || []
          }
        })
      })
      
      // Process habit completions as consistency stars
      habits?.forEach((habit, i) => {
        const streak = habit.streak || 0
        const consistency = Math.min(1, streak / 30)
        
        for (let j = 0; j < Math.min(streak, 10); j++) {
          stars.push({
            id: `habit-${habit.id}-${j}`,
            x: 5 + Math.random() * 90,
            y: 5 + Math.random() * 90,
            size: 2 + consistency * 3,
            brightness: 0.4 + consistency * 0.4,
            type: 'habit',
            subtype: habit.category,
            data: habit,
            color: '#f472b6',
            clusterId: `habit-${habit.id}`,
            connections: [],
            metadata: {
              habitName: habit.name,
              streak,
              consistency,
              category: habit.category,
              frequency: habit.frequency
            }
          })
        }
      })
      
      // Generate intelligent connections based on relationships
      generateConnections(stars, connections)
      
      // Detect constellation patterns
      const patterns = detectConstellationPatterns(stars, connections)
      
      // Calculate advanced analytics
      const analyticsData = calculateAdvancedAnalytics(stars, connections, clusters)
      
      setConstellationData({ stars, connections, clusters })
      setConstellationPatterns(patterns)
      setAnalytics(analyticsData)
    }
    
    processData()
  }, [tasks, studyLogs, goals, journal, habits])
  
  // Helper functions for advanced calculations
  const calculateTaskImpact = (task) => {
    const baseImpact = task.priority === 'high' ? 10 : task.priority === 'medium' ? 5 : 2
    const timeBonus = task.estimatedTime ? Math.min(5, task.estimatedTime / 60) : 0
    return baseImpact + timeBonus
  }
  
  const calculateStudyEfficiency = (log) => {
    if (!log.hours || !log.notes) return 0.5
    const noteLength = log.notes.length
    const efficiency = Math.min(1, noteLength / (log.hours * 100))
    return efficiency
  }
  
  const calculateGoalImpact = (goal) => {
    const baseImpact = goal.difficulty === 'hard' ? 20 : goal.difficulty === 'medium' ? 10 : 5
    const progressBonus = goal.progress / 100 * 5
    return baseImpact + progressBonus
  }
  
  const getMoodScore = (mood) => {
    const moodScores = { 'excellent': 1, 'good': 0.8, 'neutral': 0.5, 'bad': 0.3, 'terrible': 0.1 }
    return moodScores[mood] || 0.5
  }
  
  const getMoodColor = (mood) => {
    const moodColors = { 'excellent': '#10b981', 'good': '#34d399', 'neutral': '#fbbf24', 'bad': '#f97316', 'terrible': '#ef4444' }
    return moodColors[mood] || '#fbbf24'
  }
  
  const generateConnections = (stars, connections) => {
    stars.forEach((star, i) => {
      stars.forEach((otherStar, j) => {
        if (i >= j) return
        
        // Connect stars of same type or related types
        const shouldConnect = 
          star.type === otherStar.type ||
          (star.type === 'task' && otherStar.type === 'goal') ||
          (star.type === 'study' && otherStar.subtype === otherStar.subtype) ||
          (star.type === 'habit' && otherStar.clusterId === otherStar.clusterId)
        
        if (shouldConnect) {
          const dx = star.x - otherStar.x
          const dy = star.y - otherStar.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 25) {
            const strength = (1 - distance / 25) * (star.brightness + otherStar.brightness) / 2
            connections.push({
              from: star.id,
              to: otherStar.id,
              strength,
              type: star.type === otherStar.type ? 'same' : 'related',
              metadata: {
                distance,
                starTypes: [star.type, otherStar.type]
              }
            })
            
            star.connections.push(otherStar.id)
            otherStar.connections.push(star.id)
          }
        }
      })
    })
  }
  
  const detectConstellationPatterns = (stars, connections) => {
    const patterns = []
    const visited = new Set()
    
    // Detect star clusters (groups of closely connected stars)
    stars.forEach(star => {
      if (visited.has(star.id)) return
      
      const cluster = [star]
      const queue = [star]
      visited.add(star.id)
      
      while (queue.length > 0) {
        const current = queue.shift()
        current.connections.forEach(connId => {
          const connectedStar = stars.find(s => s.id === connId)
          if (connectedStar && !visited.has(connectedStar.id)) {
            visited.add(connectedStar.id)
            cluster.push(connectedStar)
            queue.push(connectedStar)
          }
        })
      }
      
      if (cluster.length >= 3) {
        const centerX = cluster.reduce((sum, s) => sum + s.x, 0) / cluster.length
        const centerY = cluster.reduce((sum, s) => sum + s.y, 0) / cluster.length
        const dominantType = cluster.reduce((acc, s) => {
          acc[s.type] = (acc[s.type] || 0) + 1
          return acc
        }, {})
        const mainType = Object.entries(dominantType).sort((a, b) => b[1] - a[1])[0][0]
        
        patterns.push({
          id: `pattern-${patterns.length}`,
          type: 'cluster',
          name: `${mainType.charAt(0).toUpperCase() + mainType.slice(1)} Cluster`,
          stars: cluster.map(s => s.id),
          center: { x: centerX, y: centerY },
          starCount: cluster.length,
          mainType,
          color: cluster[0].color
        })
      }
    })
    
    // Detect linear patterns (constellation lines)
    const linearPatterns = []
    stars.forEach(star => {
      star.connections.forEach(connId => {
        const connectedStar = stars.find(s => s.id === connId)
        if (!connectedStar) return
        
        // Check for third star that forms a line
        const dx = connectedStar.x - star.x
        const dy = connectedStar.y - star.y
        const angle = Math.atan2(dy, dx)
        
        const potentialThirdStars = stars.filter(s => 
          s.id !== star.id && 
          s.id !== connectedStar.id &&
          star.connections.includes(s.id)
        )
        
        potentialThirdStars.forEach(thirdStar => {
          const dx2 = thirdStar.x - connectedStar.x
          const dy2 = thirdStar.y - connectedStar.y
          const angle2 = Math.atan2(dy2, dx2)
          
          const angleDiff = Math.abs(angle - angle2)
          if (angleDiff < 0.2 || angleDiff > Math.PI - 0.2) {
            linearPatterns.push({
              id: `line-${linearPatterns.length}`,
              type: 'line',
              stars: [star.id, connectedStar.id, thirdStar.id],
              angle: angle
            })
          }
        })
      })
    })
    
    patterns.push(...linearPatterns)
    
    return patterns
  }
  
  const calculateAdvancedAnalytics = (stars, connections, clusters) => {
    const totalStars = stars.length
    const totalConnections = connections.length
    const avgBrightness = stars.reduce((sum, s) => sum + s.brightness, 0) / totalStars
    const avgConnections = stars.reduce((sum, s) => sum + s.connections.length, 0) / totalStars
    
    const typeDistribution = stars.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    }, {})
    
    const brightestStars = [...stars].sort((a, b) => b.brightness - a.brightness).slice(0, 10)
    const mostConnectedStars = [...stars].sort((a, b) => b.connections.length - a.connections.length).slice(0, 10)
    
    const temporalDistribution = stars.reduce((acc, s) => {
      if (s.metadata.daysSince !== undefined) {
        const period = s.metadata.daysSince < 7 ? 'week' : 
                      s.metadata.daysSince < 30 ? 'month' : 
                      s.metadata.daysSince < 90 ? 'quarter' : 'year'
        acc[period] = (acc[period] || 0) + 1
      }
      return acc
    }, {})
    
    const clusterAnalysis = clusters.map(cluster => ({
      ...cluster,
      density: cluster.starCount / (cluster.totalHours || 1),
      efficiency: cluster.totalHours / cluster.starCount
    }))
    
    return {
      totalStars,
      totalConnections,
      avgBrightness,
      avgConnections,
      typeDistribution,
      brightestStars,
      mostConnectedStars,
      temporalDistribution,
      clusterAnalysis,
      constellationCount: constellationPatterns.length,
      skyCoverage: calculateSkyCoverage(stars)
    }
  }
  
  const calculateSkyCoverage = (stars) => {
    if (stars.length === 0) return 0
    
    const minX = Math.min(...stars.map(s => s.x))
    const maxX = Math.max(...stars.map(s => s.x))
    const minY = Math.min(...stars.map(s => s.y))
    const maxY = Math.max(...stars.map(s => s.y))
    
    const coverageArea = (maxX - minX) * (maxY - minY)
    const totalArea = 100 * 100
    
    return Math.min(1, coverageArea / totalArea)
  }
  
  // Advanced canvas rendering with multiple effects
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
      if (autoRotate) {
        ctx.rotate(rotationAngle)
        setRotationAngle(prev => prev + 0.001 * speed)
      }
      ctx.translate(-width / 2, -height / 2)
      
      // Draw background gradient based on view mode
      drawBackground(ctx, width, height, time)
      
      // Filter stars based on current settings
      const filteredStars = filterStars(constellationData.stars)
      
      // Draw constellation patterns
      if (viewMode === 'cluster' || viewMode === 'standard') {
        drawConstellationPatterns(ctx, width, height, filteredStars, time)
      }
      
      // Draw connections with advanced effects
      if (showConnections) {
        drawAdvancedConnections(ctx, width, height, filteredStars, time)
      }
      
      // Draw stars with advanced rendering
      drawAdvancedStars(ctx, width, height, filteredStars, time)
      
      // Draw labels if enabled
      if (showLabels) {
        drawStarLabels(ctx, width, height, filteredStars)
      }
      
      // Draw selection highlight
      if (selectedStar) {
        drawSelectionHighlight(ctx, width, height, selectedStar, time)
      }
      
      // Draw hover effect
      if (hoveredStar) {
        drawHoverEffect(ctx, width, height, hoveredStar, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [constellationData, zoom, pan, filterType, searchQuery, timeRange, viewMode, starDensity, connectionStrength, animationSpeed, showLabels, showConnections, autoRotate, selectedStar, hoveredStar, constellationPatterns])
  
  const drawBackground = (ctx, width, height, time) => {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
    
    if (viewMode === 'heat') {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)')
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)')
    } else if (viewMode === 'timeline') {
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.1)')
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)')
      gradient.addColorStop(1, 'rgba(52, 211, 153, 0.02)')
    } else {
      gradient.addColorStop(0, 'rgba(15, 12, 25, 0.8)')
      gradient.addColorStop(0.5, 'rgba(10, 8, 20, 0.6)')
      gradient.addColorStop(1, 'rgba(5, 4, 15, 0.4)')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw nebula effects
    drawNebula(ctx, width, height, time)
  }
  
  const drawNebula = (ctx, width, height, time) => {
    const nebulaCount = 5
    for (let i = 0; i < nebulaCount; i++) {
      const x = (Math.sin(time * 0.0001 + i) * 0.5 + 0.5) * width
      const y = (Math.cos(time * 0.00015 + i * 0.5) * 0.5 + 0.5) * height
      const radius = 100 + Math.sin(time * 0.0002 + i) * 50
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      const colors = [
        ['rgba(139, 92, 246, 0.05)', 'rgba(139, 92, 246, 0)'],
        ['rgba(34, 211, 238, 0.05)', 'rgba(34, 211, 238, 0)'],
        ['rgba(52, 211, 153, 0.05)', 'rgba(52, 211, 153, 0)'],
        ['rgba(251, 191, 36, 0.05)', 'rgba(251, 191, 36, 0)'],
        ['rgba(244, 114, 182, 0.05)', 'rgba(244, 114, 182, 0)']
      ]
      
      gradient.addColorStop(0, colors[i % colors.length][0])
      gradient.addColorStop(1, colors[i % colors.length][1])
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const drawConstellationPatterns = (ctx, width, height, stars, time) => {
    constellationPatterns.forEach(pattern => {
      if (pattern.type === 'cluster') {
        const centerX = pattern.center.x / 100 * width
        const centerY = pattern.center.y / 100 * height
        
        // Draw cluster boundary
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80)
        gradient.addColorStop(0, `${pattern.color}20`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw cluster label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(pattern.name, centerX, centerY - 90)
      }
    })
  }
  
  const drawAdvancedConnections = (ctx, width, height, stars, time) => {
    const strengthMultiplier = connectionStrength === 'weak' ? 0.5 : connectionStrength === 'strong' ? 2 : 1
    
    constellationData.connections.forEach(conn => {
      const fromStar = stars.find(s => s.id === conn.from)
      const toStar = stars.find(s => s.id === conn.to)
      
      if (!fromStar || !toStar) return
      
      const fromX = fromStar.x / 100 * width
      const fromY = fromStar.y / 100 * height
      const toX = toStar.x / 100 * width
      const toY = toStar.y / 100 * height
      
      // Animated connection
      const pulse = Math.sin(time * 0.003 + conn.strength * 10) * 0.5 + 0.5
      const opacity = conn.strength * 0.4 * strengthMultiplier * pulse
      
      // Draw connection line
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
      ctx.lineWidth = conn.strength * 2 * strengthMultiplier
      ctx.stroke()
      
      // Draw moving particle along connection
      const particleProgress = (time * 0.001 + conn.strength) % 1
      const particleX = fromX + (toX - fromX) * particleProgress
      const particleY = fromY + (toY - fromY) * particleProgress
      
      ctx.beginPath()
      ctx.arc(particleX, particleY, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + pulse * 0.3})`
      ctx.fill()
    })
  }
  
  const drawAdvancedStars = (ctx, width, height, stars, time) => {
    const densityMultiplier = starDensity === 'sparse' ? 0.5 : starDensity === 'dense' ? 2 : 1
    
    stars.forEach(star => {
      const x = star.x / 100 * width
      const y = star.y / 100 * height
      const size = star.size * densityMultiplier
      
      // Multi-layer glow effect
      const layers = [
        { radius: size * 4, color: star.color, opacity: 0.1 },
        { radius: size * 3, color: star.color, opacity: 0.2 },
        { radius: size * 2, color: star.color, opacity: 0.4 },
        { radius: size * 1.5, color: star.color, opacity: 0.6 }
      ]
      
      layers.forEach(layer => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, layer.radius)
        gradient.addColorStop(0, `${layer.color}${Math.floor(layer.opacity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, layer.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      // Core star with pulsing brightness
      const pulse = Math.sin(time * 0.005 + star.x) * 0.3 + 0.7
      const coreBrightness = star.brightness * pulse
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = star.color
      ctx.globalAlpha = coreBrightness
      ctx.fill()
      ctx.globalAlpha = 1
      
      // Star points for larger stars
      if (size > 4) {
        drawStarPoints(ctx, x, y, size, star.color, time)
      }
      
      // Twinkling effect
      if (Math.random() < 0.01) {
        ctx.beginPath()
        ctx.arc(x + (Math.random() - 0.5) * size * 2, y + (Math.random() - 0.5) * size * 2, size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()
      }
    })
  }
  
  const drawStarPoints = (ctx, x, y, size, color, time) => {
    const points = 4
    const innerRadius = size * 0.4
    const outerRadius = size * 1.5
    const rotation = time * 0.001
    
    ctx.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI / points) + rotation
      const px = x + Math.cos(angle) * radius
      const py = y + Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }
  
  const drawStarLabels = (ctx, width, height, stars) => {
    const importantStars = stars.filter(s => s.size > 5 || s.type === 'goal')
    
    importantStars.forEach(star => {
      const x = star.x / 100 * width
      const y = star.y / 100 * height
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      
      let label = ''
      if (star.type === 'task') label = star.data.title?.substring(0, 15) || 'Task'
      else if (star.type === 'study') label = star.subtype?.substring(0, 15) || 'Study'
      else if (star.type === 'goal') label = star.data.title?.substring(0, 15) || 'Goal'
      else if (star.type === 'journal') label = star.data.mood || 'Journal'
      else if (star.type === 'habit') label = star.data.name?.substring(0, 15) || 'Habit'
      
      ctx.fillText(label, x, y - star.size - 5)
    })
  }
  
  const drawSelectionHighlight = (ctx, width, height, star, time) => {
    const x = star.x / 100 * width
    const y = star.y / 100 * height
    
    // Pulsing selection ring
    const pulse = Math.sin(time * 0.005) * 0.5 + 0.5
    const radius = star.size * 3 + pulse * 10
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.3})`
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Selection glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5)
    gradient.addColorStop(0, `${star.color}60`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
  
  const drawHoverEffect = (ctx, width, height, star, time) => {
    const x = star.x / 100 * width
    const y = star.y / 100 * height
    
    // Hover glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 5)
    gradient.addColorStop(0, `${star.color}80`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(x, y, star.size * 5, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
  
  const filterStars = (stars) => {
    let filtered = [...stars]
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => {
        const title = s.data?.title?.toLowerCase() || ''
        const subject = s.subtype?.toLowerCase() || ''
        const notes = s.data?.notes?.toLowerCase() || ''
        return title.includes(query) || subject.includes(query) || notes.includes(query)
      })
    }
    
    // Time range filter
    if (timeRange !== 'all') {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365
      filtered = filtered.filter(s => {
        if (s.metadata.daysSince === undefined) return true
        return s.metadata.daysSince <= days
      })
    }
    
    return filtered
  }
  
  // Mouse interaction handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
    
    // Check for star hover
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const width = canvas.width
    const height = canvas.height
    
    // Transform coordinates
    const transformedX = (x - width / 2 - pan.x) / zoom + width / 2
    const transformedY = (y - height / 2 - pan.y) / zoom + height / 2
    
    const filteredStars = filterStars(constellationData.stars)
    let found = null
    
    for (const star of filteredStars) {
      const starX = star.x / 100 * width
      const starY = star.y / 100 * height
      const distance = Math.sqrt(Math.pow(transformedX - starX, 2) + Math.pow(transformedY - starY, 2))
      
      if (distance < star.size * 3) {
        found = star
        break
      }
    }
    
    setHoveredStar(found)
  }, [isDragging, dragStart, pan, zoom, constellationData.stars, filterType, searchQuery, timeRange])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleClick = useCallback((e) => {
    if (hoveredStar) {
      setSelectedStar(hoveredStar)
      setShowDetails(true)
    } else {
      setSelectedStar(null)
      setShowDetails(false)
    }
  }, [hoveredStar])
  
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }, [])
  
  // Export functionality
  const exportConstellation = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'data-constellation.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportData = () => {
    const data = {
      stars: constellationData.stars,
      connections: constellationData.connections,
      clusters: constellationData.clusters,
      patterns: constellationPatterns,
      analytics: analytics,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'data-constellation.json'
    link.href = URL.createObjectURL(blob)
    link.click()
  }
  
  // Reset view
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setRotationAngle(0)
    setAutoRotate(false)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading constellation data...</p>
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
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search stars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="all">All Types</option>
              <option value="task">Tasks</option>
              <option value="study">Study</option>
              <option value="goal">Goals</option>
              <option value="journal">Journal</option>
              <option value="habit">Habits</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
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
              {['standard', 'cluster', 'timeline', 'heat'].map(mode => (
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
            <span className="text-xs text-white/60 font-medium">Density</span>
            <div className="flex gap-1">
              {['sparse', 'medium', 'dense'].map(density => (
                <button
                  key={density}
                  onClick={() => setStarDensity(density)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    starDensity === density 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
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
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Auto Rotate</span>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-10 h-5 rounded-full transition-all ${
                autoRotate ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                autoRotate ? 'translate-x-5' : 'translate-x-0.5'
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total Stars</span>
            <span className="text-lg font-bold text-violet-400">{analytics.totalStars}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Connections</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.totalConnections}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Brightness</span>
            <span className="text-lg font-bold text-amber-400">{(analytics.avgBrightness * 100).toFixed(0)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Sky Coverage</span>
            <span className="text-lg font-bold text-emerald-400">{(analytics.skyCoverage * 100).toFixed(0)}%</span>
          </div>
        </motion.div>
        
        {/* Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3"
        >
          <div className="text-xs text-white/60 font-medium mb-2">Type Distribution</div>
          <div className="space-y-1">
            {Object.entries(analytics.typeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-white/40 capitalize">{type}</span>
                <span className="text-xs text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Export Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <button
            onClick={exportConstellation}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Star Details Panel */}
      {selectedStar && showDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-xl p-4 max-w-md w-full mx-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: selectedStar.color }} />
                <span className="text-sm font-bold text-white capitalize">{selectedStar.type}</span>
                {selectedStar.subtype && (
                  <span className="text-xs text-white/40">• {selectedStar.subtype}</span>
                )}
              </div>
              {selectedStar.data?.title && (
                <p className="text-xs text-white/60">{selectedStar.data.title}</p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedStar(null)
                setShowDetails(false)
              }}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {selectedStar.metadata && Object.entries(selectedStar.metadata).map(([key, value]) => (
              <div key={key} className="bg-black/40 rounded-lg p-2">
                <span className="text-white/40 capitalize">{key}:</span>
                <span className="text-white ml-1">{typeof value === 'number' ? value.toFixed(1) : String(value)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Connections:</span>
              <span className="text-white">{selectedStar.connections.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-white/40">Brightness:</span>
              <span className="text-white">{(selectedStar.brightness * 100).toFixed(0)}%</span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Empty State */}
      {analytics.totalStars === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your sky is empty</p>
            <p className="text-white/30 text-xs">Complete tasks, study sessions, and goals to fill your constellation</p>
          </div>
        </div>
      )}
      
      {/* Hover Tooltip */}
      {hoveredStar && !selectedStar && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-none glass-card rounded-lg px-3 py-2 z-50"
          style={{
            left: hoveredStar.x / 100 * containerRef.current?.clientWidth || 0 + 20,
            top: hoveredStar.y / 100 * containerRef.current?.clientHeight || 0 - 20
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: hoveredStar.color }} />
            <span className="text-xs text-white capitalize">{hoveredStar.type}</span>
          </div>
          {hoveredStar.data?.title && (
            <p className="text-xs text-white/60 mt-1">{hoveredStar.data.title.substring(0, 30)}</p>
          )}
        </motion.div>
      )}
    </div>
  )
}
