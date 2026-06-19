'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, Globe, Star, Sparkles, Layers, Eye, EyeOff, RotateCcw, Info, TrendingUp, BarChart3, Zap, Target, BookOpen, Video, FileText, GraduationCap, X, ChevronDown, ChevronUp, Play, Pause, Settings, Grid, List } from 'lucide-react'

export default function KnowledgeGalaxy({ knowledge, studyLogs, skills, goals }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [galaxyData, setGalaxyData] = useState({ stars: [], constellations: [], nebulae: [] })
  const [selectedStar, setSelectedStar] = useState(null)
  const [hoveredStar, setHoveredStar] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingStar, setIsDraggingStar] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [viewMode, setViewMode] = useState('galaxy') // galaxy, constellation, timeline, heat
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [showNebulae, setShowNebulae] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(0.1)
  const [isRotating, setIsRotating] = useState(true)
  const [depthMode, setDepthMode] = useState('3d') // 3d, 2d
  const [brightnessMode, setBrightnessMode] = useState('strength') // strength, activity, age
  const [galaxyInsights, setGalaxyInsights] = useState([])
  const [constellationPatterns, setConstellationPatterns] = useState([])
  const [starClusters, setStarClusters] = useState([])
  
  // Advanced galaxy processing
  useEffect(() => {
    const processGalaxy = () => {
      const stars = []
      const constellations = []
      const nebulae = []
      
      // Process knowledge entries as stars
      knowledge?.forEach((item, i) => {
        const strength = (item.confidence || 3) / 5
        const size = 3 + strength * 8
        const brightness = 0.3 + strength * 0.7
        
        // 3D position calculation
        const theta = (i / (knowledge.length || 1)) * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const radius = 20 + Math.random() * 30
        
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)
        
        stars.push({
          id: `knowledge-${item.id}`,
          label: item.title,
          type: item.type,
          category: item.category,
          strength,
          size,
          brightness,
          color: getTypeColor(item.type),
          revisionCount: item.revisionCount || 0,
          x: 50 + x,
          y: 50 + y,
          z: z,
          vx: 0,
          vy: 0,
          vz: 0,
          connections: [],
          metadata: {
            confidence: item.confidence,
            lastRevised: item.lastRevised,
            difficulty: item.difficulty || 'medium',
            relatedTopics: item.relatedTopics || [],
            notes: item.notes || '',
            source: item.source || 'manual'
          }
        })
      })
      
      // Process study subjects as major stars
      const subjectStars = {}
      studyLogs?.forEach(log => {
        if (!subjectStars[log.subject]) {
          subjectStars[log.subject] = {
            id: `subject-${log.subject}`,
            label: log.subject,
            type: 'subject',
            category: log.category || 'General',
            strength: 0,
            size: 0,
            brightness: 0,
            color: '#22d3ee',
            hours: 0,
            sessions: 0,
            x: 50 + (Math.random() - 0.5) * 40,
            y: 50 + (Math.random() - 0.5) * 40,
            z: (Math.random() - 0.5) * 20,
            vx: 0,
            vy: 0,
            vz: 0,
            connections: [],
            metadata: {
              efficiency: 0,
              avgSessionLength: 0,
              bestPerformance: 0,
              topics: []
            }
          }
        }
        subjectStars[log.subject].hours += (log.hours || 0)
        subjectStars[log.subject].sessions += 1
        subjectStars[log.subject].strength = Math.min(1, subjectStars[log.subject].hours / 20)
        subjectStars[log.subject].size = 5 + subjectStars[log.subject].strength * 10
        subjectStars[log.subject].brightness = 0.3 + subjectStars[log.subject].strength * 0.7
      })
      
      Object.values(subjectStars).forEach(subject => {
        stars.push(subject)
      })
      
      // Process skills as bright stars
      skills?.forEach((skill, i) => {
        const theta = (i / (skills.length || 1)) * Math.PI * 2 + Math.PI
        const radius = 15 + Math.random() * 15
        
        stars.push({
          id: `skill-${skill.id}`,
          label: skill.title,
          type: 'skill',
          category: skill.category,
          strength: (skill.confidence || 0) / 5,
          size: 4 + (skill.confidence || 0) * 1.5,
          brightness: 0.4 + (skill.confidence || 0) * 0.12,
          color: '#34d399',
          x: 50 + radius * Math.cos(theta),
          y: 50 + radius * Math.sin(theta),
          z: (Math.random() - 0.5) * 15,
          vx: 0,
          vy: 0,
          vz: 0,
          connections: [],
          metadata: {
            confidence: skill.confidence,
            practiceCount: skill.practiceCount || 0,
            lastPracticed: skill.lastPracticed,
            category: skill.category,
            relatedSkills: skill.relatedSkills || []
          }
        })
      })
      
      // Generate constellation patterns
      generateConstellations(stars, constellations)
      
      // Detect star clusters
      const clusters = detectStarClusters(stars)
      setStarClusters(clusters)
      
      // Generate nebulae around dense regions
      generateNebulae(stars, nebulae)
      
      // Create connections between related stars
      generateStarConnections(stars)
      
      // Apply gravitational layout
      applyGravitationalLayout(stars)
      
      // Generate galaxy insights
      const insights = generateGalaxyInsights(stars, constellations, clusters)
      setGalaxyInsights(insights)
      
      // Calculate analytics
      const analyticsData = calculateGalaxyAnalytics(stars, constellations, clusters)
      setAnalytics(analyticsData)
      
      setGalaxyData({ stars, constellations, nebulae })
    }
    
    processGalaxy()
  }, [knowledge, studyLogs, skills, goals])
  
  const getTypeColor = (type) => {
    const colors = {
      book: '#fbbf24',
      course: '#22d3ee',
      paper: '#34d399',
      concept: '#f472b6',
      video: '#a78bfa',
      subject: '#22d3ee',
      skill: '#34d399',
      goal: '#f97316'
    }
    return colors[type] || '#8b5cf6'
  }
  
  const generateConstellations = (stars, constellations) => {
    // Group stars by category
    const categoryGroups = {}
    stars.forEach(star => {
      if (star.category) {
        if (!categoryGroups[star.category]) {
          categoryGroups[star.category] = []
        }
        categoryGroups[star.category].push(star)
      }
    })
    
    // Create constellations from category groups
    Object.entries(categoryGroups).forEach(([category, groupStars]) => {
      if (groupStars.length >= 3) {
        const centerX = groupStars.reduce((sum, s) => sum + s.x, 0) / groupStars.length
        const centerY = groupStars.reduce((sum, s) => sum + s.y, 0) / groupStars.length
        
        const constellation = {
          id: `constellation-${category}`,
          name: category,
          stars: groupStars.map(s => s.id),
          center: { x: centerX, y: centerY },
          starCount: groupStars.length,
          avgBrightness: groupStars.reduce((sum, s) => sum + s.brightness, 0) / groupStars.length,
          color: groupStars[0].color,
          pattern: generateConstellationPattern(groupStars)
        }
        
        constellations.push(constellation)
        
        // Link stars in constellation
        groupStars.forEach((star, i) => {
          groupStars.forEach((otherStar, j) => {
            if (i < j) {
              const distance = Math.sqrt(
                Math.pow(star.x - otherStar.x, 2) + 
                Math.pow(star.y - otherStar.y, 2)
              )
              
              if (distance < 30) {
                if (!star.connections.includes(otherStar.id)) {
                  star.connections.push(otherStar.id)
                }
                if (!otherStar.connections.includes(star.id)) {
                  otherStar.connections.push(star.id)
                }
              }
            }
          })
        })
      }
    })
  }
  
  const generateConstellationPattern = (stars) => {
    // Generate a pattern string representing the constellation shape
    const sortedStars = [...stars].sort((a, b) => a.x - b.x)
    return sortedStars.map(s => `${Math.round(s.x)},${Math.round(s.y)}`).join('|')
  }
  
  const detectStarClusters = (stars) => {
    const clusters = []
    const visited = new Set()
    const clusterRadius = 15
    
    stars.forEach(star => {
      if (visited.has(star.id)) return
      
      const cluster = [star]
      const queue = [star]
      visited.add(star.id)
      
      while (queue.length > 0) {
        const current = queue.shift()
        
        stars.forEach(otherStar => {
          if (visited.has(otherStar.id)) return
          
          const distance = Math.sqrt(
            Math.pow(current.x - otherStar.x, 2) + 
            Math.pow(current.y - otherStar.y, 2)
          )
          
          if (distance < clusterRadius) {
            visited.add(otherStar.id)
            cluster.push(otherStar)
            queue.push(otherStar)
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
        
        clusters.push({
          id: `cluster-${clusters.length}`,
          name: `${mainType.charAt(0).toUpperCase() + mainType.slice(1)} Cluster`,
          stars: cluster.map(s => s.id),
          center: { x: centerX, y: centerY },
          starCount: cluster.length,
          mainType,
          color: cluster[0].color,
          avgBrightness: cluster.reduce((sum, s) => sum + s.brightness, 0) / cluster.length,
          density: cluster.length / (Math.PI * clusterRadius * clusterRadius)
        })
      }
    })
    
    return clusters
  }
  
  const generateNebulae = (stars, nebulae) => {
    // Create nebulae around dense star regions
    const gridSize = 20
    const grid = {}
    
    stars.forEach(star => {
      const gridX = Math.floor(star.x / gridSize)
      const gridY = Math.floor(star.y / gridSize)
      const key = `${gridX},${gridY}`
      
      if (!grid[key]) {
        grid[key] = { stars: [], x: gridX * gridSize + gridSize / 2, y: gridY * gridSize + gridSize / 2 }
      }
      grid[key].stars.push(star)
    })
    
    Object.values(grid).forEach(cell => {
      if (cell.stars.length >= 3) {
        const avgColor = cell.stars.reduce((sum, s) => {
          const hex = s.color.replace('#', '')
          const r = parseInt(hex.substr(0, 2), 16)
          const g = parseInt(hex.substr(2, 2), 16)
          const b = parseInt(hex.substr(4, 2), 16)
          return { r: sum.r + r, g: sum.g + g, b: sum.b + b }
        }, { r: 0, g: 0, b: 0 })
        
        const count = cell.stars.length
        const color = `#${Math.round(avgColor.r / count).toString(16).padStart(2, '0')}${Math.round(avgColor.g / count).toString(16).padStart(2, '0')}${Math.round(avgColor.b / count).toString(16).padStart(2, '0')}`
        
        nebulae.push({
          id: `nebula-${nebulae.length}`,
          x: cell.x,
          y: cell.y,
          radius: gridSize * (1 + cell.stars.length * 0.3),
          color,
          opacity: 0.1 + cell.stars.length * 0.05,
          starCount: cell.stars.length
        })
      }
    })
  }
  
  const generateStarConnections = (stars) => {
    stars.forEach((star, i) => {
      stars.forEach((otherStar, j) => {
        if (i >= j) return
        
        // Connect stars of same type
        if (star.type === otherStar.type) {
          const distance = Math.sqrt(
            Math.pow(star.x - otherStar.x, 2) + 
            Math.pow(star.y - otherStar.y, 2)
          )
          
          if (distance < 25) {
            if (!star.connections.includes(otherStar.id)) {
              star.connections.push(otherStar.id)
            }
            if (!otherStar.connections.includes(star.id)) {
              otherStar.connections.push(star.id)
            }
          }
        }
        
        // Connect stars of same category
        if (star.category === otherStar.category && star.category) {
          const distance = Math.sqrt(
            Math.pow(star.x - otherStar.x, 2) + 
            Math.pow(star.y - otherStar.y, 2)
          )
          
          if (distance < 35) {
            if (!star.connections.includes(otherStar.id)) {
              star.connections.push(otherStar.id)
            }
            if (!otherStar.connections.includes(star.id)) {
              otherStar.connections.push(star.id)
            }
          }
        }
      })
    })
  }
  
  const applyGravitationalLayout = (stars) => {
    const iterations = 30
    const G = 0.5 // Gravitational constant
    const repulsion = 50
    const damping = 0.9
    
    for (let iter = 0; iter < iterations; iter++) {
      // Calculate gravitational forces
      stars.forEach(star => {
        star.fx = 0
        star.fy = 0
        star.fz = 0
        
        // Center gravity
        const dx = 50 - star.x
        const dy = 50 - star.y
        const dz = 0 - star.z
        star.fx += dx * 0.02
        star.fy += dy * 0.02
        star.fz += dz * 0.02
        
        // Repulsion from other stars
        stars.forEach(otherStar => {
          if (star === otherStar) return
          
          const dx = star.x - otherStar.x
          const dy = star.y - otherStar.y
          const dz = star.z - otherStar.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
          
          const force = repulsion / (distance * distance)
          star.fx += (dx / distance) * force
          star.fy += (dy / distance) * force
          star.fz += (dz / distance) * force
        })
        
        // Attraction along connections
        star.connections.forEach(connectedId => {
          const otherStar = stars.find(s => s.id === connectedId)
          if (!otherStar) return
          
          const dx = otherStar.x - star.x
          const dy = otherStar.y - star.y
          const dz = otherStar.z - star.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
          
          const force = G * (star.strength + otherStar.strength) / distance
          star.fx += (dx / distance) * force
          star.fy += (dy / distance) * force
          star.fz += (dz / distance) * force
        })
      })
      
      // Apply forces
      stars.forEach(star => {
        star.vx = (star.vx + star.fx) * damping
        star.vy = (star.vy + star.fy) * damping
        star.vz = (star.vz + star.fz) * damping
        star.x += star.vx
        star.y += star.vy
        star.z += star.vz
        
        // Keep within bounds
        star.x = Math.max(5, Math.min(95, star.x))
        star.y = Math.max(5, Math.min(95, star.y))
        star.z = Math.max(-20, Math.min(20, star.z))
      })
    }
  }
  
  const generateGalaxyInsights = (stars, constellations, clusters) => {
    const insights = []
    
    // Galaxy size insight
    if (stars.length > 50) {
      insights.push({
        type: 'size',
        icon: Star,
        title: 'Vast Knowledge Galaxy',
        description: `Your galaxy contains ${stars.length} knowledge stars across ${constellations.length} constellations.`,
        severity: 'success'
      })
    }
    
    // Strong stars insight
    const strongStars = stars.filter(s => s.strength > 0.7)
    if (strongStars.length > 0) {
      insights.push({
        type: 'strength',
        icon: Sparkles,
        title: 'Bright Stars Detected',
        description: `${strongStars.length} stars are shining brightly with high confidence.`,
        severity: 'success'
      })
    }
    
    // Cluster insight
    if (clusters.length > 2) {
      insights.push({
        type: 'cluster',
        icon: Layers,
        title: 'Dense Star Clusters',
        description: `Your galaxy has ${clusters.length} dense clusters of related knowledge.`,
        severity: 'info'
      })
    }
    
    // Weak stars insight
    const weakStars = stars.filter(s => s.strength < 0.3)
    if (weakStars.length > stars.length * 0.3) {
      insights.push({
        type: 'weakness',
        icon: TrendingUp,
        title: 'Dim Stars Need Attention',
        description: `${weakStars.length} stars need strengthening through revision.`,
        severity: 'warning'
      })
    }
    
    // Constellation insight
    if (constellations.length > 0) {
      const largestConstellation = constellations.reduce((max, c) => c.starCount > max.starCount ? c : max, constellations[0])
      insights.push({
        type: 'constellation',
        icon: Globe,
        title: 'Major Constellation',
        description: `${largestConstellation.name} is your largest constellation with ${largestConstellation.starCount} stars.`,
        severity: 'info'
      })
    }
    
    return insights
  }
  
  const calculateGalaxyAnalytics = (stars, constellations, clusters) => {
    const typeStats = {}
    stars.forEach(star => {
      if (!typeStats[star.type]) {
        typeStats[star.type] = { count: 0, totalStrength: 0, totalBrightness: 0 }
      }
      typeStats[star.type].count++
      typeStats[star.type].totalStrength += star.strength
      typeStats[star.type].totalBrightness += star.brightness
    })
    
    Object.keys(typeStats).forEach(type => {
      typeStats[type].avgStrength = typeStats[type].totalStrength / typeStats[type].count
      typeStats[type].avgBrightness = typeStats[type].totalBrightness / typeStats[type].count
    })
    
    const categoryStats = {}
    stars.forEach(star => {
      if (star.category) {
        if (!categoryStats[star.category]) {
          categoryStats[star.category] = { count: 0, totalStrength: 0 }
        }
        categoryStats[star.category].count++
        categoryStats[star.category].totalStrength += star.strength
      }
    })
    
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].avgStrength = categoryStats[category].totalStrength / categoryStats[category].count
    })
    
    return {
      totalStars: stars.length,
      totalConstellations: constellations.length,
      totalClusters: clusters.length,
      avgBrightness: stars.reduce((sum, s) => sum + s.brightness, 0) / stars.length,
      avgStrength: stars.reduce((sum, s) => sum + s.strength, 0) / stars.length,
      typeStats,
      categoryStats,
      mostConnectedStar: stars.reduce((max, s) => s.connections.length > max.connections.length ? s : max, stars[0]),
      brightestStar: stars.reduce((max, s) => s.brightness > max.brightness ? s : max, stars[0]),
      galaxyDensity: stars.length / 10000, // Normalized by canvas area
      connectivity: stars.reduce((sum, s) => sum + s.connections.length, 0) / stars.length
    }
  }
  
  // Advanced canvas rendering with 3D effects
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationFrame
    let time = 0
    let rotation = 0
    
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
      
      // Apply rotation
      if (isRotating) {
        rotation += rotationSpeed * 0.001 * speed
        ctx.translate(width / 2, height / 2)
        ctx.rotate(rotation)
        ctx.translate(-width / 2, -height / 2)
      }
      
      // Draw galaxy background
      drawGalaxyBackground(ctx, width, height, time)
      
      // Draw nebulae
      if (showNebulae) {
        drawNebulae(ctx, width, height, galaxyData.nebulae, time)
      }
      
      // Draw constellations
      if (viewMode === 'constellation') {
        drawConstellations(ctx, width, height, galaxyData.constellations, time)
      }
      
      // Draw star clusters
      if (viewMode === 'galaxy') {
        drawStarClusters(ctx, width, height, starClusters, time)
      }
      
      // Draw connections
      if (showConnections) {
        drawStarConnections(ctx, width, height, galaxyData.stars, time)
      }
      
      // Draw stars with 3D effects
      drawStars(ctx, width, height, galaxyData.stars, time)
      
      // Draw labels if enabled
      if (showLabels) {
        drawStarLabels(ctx, width, height, galaxyData.stars)
      }
      
      // Draw selection highlight
      if (selectedStar) {
        drawStarSelection(ctx, width, height, selectedStar, time)
      }
      
      // Draw hover effect
      if (hoveredStar) {
        drawStarHover(ctx, width, height, hoveredStar, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [galaxyData, zoom, pan, filterType, filterCategory, searchQuery, viewMode, animationSpeed, showLabels, showConnections, showNebulae, isRotating, rotationSpeed, depthMode, brightnessMode, selectedStar, hoveredStar, starClusters])
  
  const drawGalaxyBackground = (ctx, width, height, time) => {
    // Deep space gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
    gradient.addColorStop(0, '#0a0a1a')
    gradient.addColorStop(0.5, '#050510')
    gradient.addColorStop(1, '#000005')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Background stars
    const bgStarCount = 200
    for (let i = 0; i < bgStarCount; i++) {
      const x = (Math.sin(i * 123.456 + time * 0.0001) * 0.5 + 0.5) * width
      const y = (Math.cos(i * 789.012 + time * 0.0001) * 0.5 + 0.5) * height
      const size = Math.random() * 1.5
      const twinkle = Math.sin(time * 0.003 + i) * 0.5 + 0.5
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.3})`
      ctx.fill()
    }
  }
  
  const drawNebulae = (ctx, width, height, nebulae, time) => {
    nebulae.forEach(nebula => {
      const x = nebula.x / 100 * width
      const y = nebula.y / 100 * height
      const radius = nebula.radius / 100 * Math.min(width, height)
      
      // Animated nebula
      const pulse = Math.sin(time * 0.001 + nebula.x) * 0.1 + 0.9
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * pulse)
      gradient.addColorStop(0, `${nebula.color}${Math.floor(nebula.opacity * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(0.5, `${nebula.color}${Math.floor(nebula.opacity * 0.5 * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius * pulse, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  
  const drawConstellations = (ctx, width, height, constellations, time) => {
    const stars = galaxyData.stars
    
    constellations.forEach(constellation => {
      const constellationStars = constellation.stars.map(id => stars.find(s => s.id === id)).filter(Boolean)
      
      if (constellationStars.length < 2) return
      
      ctx.beginPath()
      constellationStars.forEach((star, i) => {
        const x = star.x / 100 * width
        const y = star.y / 100 * height
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      const pulse = Math.sin(time * 0.002 + constellation.starCount) * 0.5 + 0.5
      ctx.strokeStyle = `${constellation.color}${Math.floor(pulse * 80).toString(16).padStart(2, '0')}`
      ctx.lineWidth = 1.5
      ctx.stroke()
    })
  }
  
  const drawStarClusters = (ctx, width, height, clusters, time) => {
    clusters.forEach(cluster => {
      const x = cluster.center.x / 100 * width
      const y = cluster.center.y / 100 * height
      const radius = 30 / 100 * Math.min(width, height)
      
      // Cluster boundary
      const pulse = Math.sin(time * 0.002 + cluster.starCount) * 0.5 + 0.5
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * pulse)
      gradient.addColorStop(0, `${cluster.color}20`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius * pulse, 0, Math.PI * 2)
      ctx.fill()
      
      // Cluster label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(cluster.name, x, y - radius * pulse - 5)
    })
  }
  
  const drawStarConnections = (ctx, width, height, stars, time) => {
    stars.forEach(star => {
      star.connections.forEach(connectedId => {
        const otherStar = stars.find(s => s.id === connectedId)
        if (!otherStar) return
        
        const x1 = star.x / 100 * width
        const y1 = star.y / 100 * height
        const x2 = otherStar.x / 100 * width
        const y2 = otherStar.y / 100 * height
        
        const strength = (star.strength + otherStar.strength) / 2
        const pulse = Math.sin(time * 0.003 + star.x) * 0.5 + 0.5
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(139, 92, 246, ${strength * 0.2 * pulse})`
        ctx.lineWidth = strength * 1.5
        ctx.stroke()
      })
    })
  }
  
  const drawStars = (ctx, width, height, stars, time) => {
    stars.forEach(star => {
      const x = star.x / 100 * width
      const y = star.y / 100 * height
      
      // 3D depth effect
      const depthScale = depthMode === '3d' ? (star.z + 20) / 40 : 1
      const scaledSize = star.size * depthScale
      
      // Brightness based on mode
      let brightness = star.brightness
      if (brightnessMode === 'activity') {
        brightness = Math.min(1, star.strength + 0.3)
      }
      
      // Floating animation
      const floatY = Math.sin(time * 0.002 + star.x) * 2
      const floatX = Math.cos(time * 0.0015 + star.y) * 1
      
      // Multi-layer glow
      const layers = [
        { radius: scaledSize * 4, color: star.color, opacity: 0.05 },
        { radius: scaledSize * 3, color: star.color, opacity: 0.1 },
        { radius: scaledSize * 2, color: star.color, opacity: 0.2 },
        { radius: scaledSize * 1.5, color: star.color, opacity: 0.4 }
      ]
      
      layers.forEach(layer => {
        const gradient = ctx.createRadialGradient(
          x + floatX, y + floatY, 0,
          x + floatX, y + floatY, layer.radius
        )
        gradient.addColorStop(0, `${layer.color}${Math.floor(layer.opacity * brightness * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x + floatX, y + floatY, layer.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      // Twinkling effect
      const twinkle = Math.sin(time * 0.005 + star.x * 10) * 0.3 + 0.7
      
      // Core star
      ctx.beginPath()
      ctx.arc(x + floatX, y + floatY, scaledSize, 0, Math.PI * 2)
      ctx.fillStyle = star.color
      ctx.globalAlpha = brightness * twinkle
      ctx.fill()
      ctx.globalAlpha = 1
      
      // Star points for bright stars
      if (star.strength > 0.6) {
        const pointLength = scaledSize * 2
        const pointWidth = scaledSize * 0.3
        
        ctx.save()
        ctx.translate(x + floatX, y + floatY)
        ctx.rotate(time * 0.001 + star.x)
        
        // Horizontal points
        ctx.beginPath()
        ctx.moveTo(-pointLength, 0)
        ctx.lineTo(-pointWidth, 0)
        ctx.lineTo(-pointWidth, -pointWidth * 0.5)
        ctx.lineTo(0, -pointWidth * 0.3)
        ctx.lineTo(pointWidth, -pointWidth * 0.5)
        ctx.lineTo(pointWidth, 0)
        ctx.lineTo(pointWidth, pointWidth * 0.5)
        ctx.lineTo(0, pointWidth * 0.3)
        ctx.lineTo(-pointWidth, pointWidth * 0.5)
        ctx.lineTo(-pointWidth, 0)
        ctx.closePath()
        
        ctx.fillStyle = star.color
        ctx.globalAlpha = brightness * twinkle * 0.5
        ctx.fill()
        ctx.globalAlpha = 1
        
        ctx.restore()
      }
    })
  }
  
  const drawStarLabels = (ctx, width, height, stars) => {
    const importantStars = stars.filter(s => s.size > 6 || s.strength > 0.7)
    
    importantStars.forEach(star => {
      const x = star.x / 100 * width
      const y = star.y / 100 * height
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '9px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(star.label.substring(0, 12), x, y - star.size * 1.5 - 5)
    })
  }
  
  const drawStarSelection = (ctx, width, height, star, time) => {
    const x = star.x / 100 * width
    const y = star.y / 100 * height
    
    const pulse = Math.sin(time * 0.005) * 0.5 + 0.5
    const radius = star.size * 3 + pulse * 10
    
    // Selection ring
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
  
  const drawStarHover = (ctx, width, height, star, time) => {
    const x = star.x / 100 * width
    const y = star.y / 100 * height
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 5)
    gradient.addColorStop(0, `${star.color}80`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(x, y, star.size * 5, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
  
  // Mouse interaction handlers
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const width = canvas.width
    const height = canvas.height
    
    const transformedX = (x - width / 2 - pan.x) / zoom + width / 2
    const transformedY = (y - height / 2 - pan.y) / zoom + height / 2
    
    let clickedStar = null
    for (const star of galaxyData.stars) {
      const starX = star.x / 100 * width
      const starY = star.y / 100 * height
      const distance = Math.sqrt(Math.pow(transformedX - starX, 2) + Math.pow(transformedY - starY, 2))
      
      if (distance < star.size * 2) {
        clickedStar = star
        break
      }
    }
    
    if (clickedStar) {
      setIsDraggingStar(true)
      setDragStart({ x: e.clientX, y: e.clientY, starX: clickedStar.x, starY: clickedStar.y })
      setSelectedStar(clickedStar)
    } else {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan, zoom, galaxyData.stars])
  
  const handleMouseMove = useCallback((e) => {
    if (isDraggingStar && selectedStar) {
      const dx = (e.clientX - dragStart.x) / zoom
      const dy = (e.clientY - dragStart.y) / zoom
      
      const updatedStars = galaxyData.stars.map(star => 
        star.id === selectedStar.id 
          ? { ...star, x: Math.max(5, Math.min(95, dragStart.starX + dx / 5)), y: Math.max(5, Math.min(95, dragStart.starY + dy / 5)) }
          : star
      )
      
      setGalaxyData(prev => ({ ...prev, stars: updatedStars }))
    } else if (isDragging) {
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
    
    const transformedX = (x - width / 2 - pan.x) / zoom + width / 2
    const transformedY = (y - height / 2 - pan.y) / zoom + height / 2
    
    let found = null
    for (const star of galaxyData.stars) {
      const starX = star.x / 100 * width
      const starY = star.y / 100 * height
      const distance = Math.sqrt(Math.pow(transformedX - starX, 2) + Math.pow(transformedY - starY, 2))
      
      if (distance < star.size * 2) {
        found = star
        break
      }
    }
    
    setHoveredStar(found)
  }, [isDraggingStar, isDragging, dragStart, pan, zoom, galaxyData.stars, selectedStar])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsDraggingStar(false)
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
  const exportGalaxy = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'knowledge-galaxy.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportGalaxyData = () => {
    const data = {
      stars: galaxyData.stars,
      constellations: galaxyData.constellations,
      nebulae: galaxyData.nebulae,
      clusters: starClusters,
      analytics: analytics,
      insights: galaxyInsights,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'knowledge-galaxy.json'
    link.href = URL.createObjectURL(blob)
    link.click()
  }
  
  // Reset view
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    rotation = 0
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
          <p className="text-white/60">Loading knowledge galaxy...</p>
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
              <option value="book">Books</option>
              <option value="course">Courses</option>
              <option value="paper">Papers</option>
              <option value="concept">Concepts</option>
              <option value="video">Videos</option>
              <option value="subject">Subjects</option>
              <option value="skill">Skills</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="all">All Categories</option>
              {analytics?.categoryStats && Object.keys(analytics.categoryStats).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              {['galaxy', 'constellation', 'timeline', 'heat'].map(mode => (
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
            <span className="text-xs text-white/60">Show Links</span>
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
            <span className="text-xs text-white/60">Show Nebulae</span>
            <button
              onClick={() => setShowNebulae(!showNebulae)}
              className={`w-10 h-5 rounded-full transition-all ${
                showNebulae ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showNebulae ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Auto Rotate</span>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`w-10 h-5 rounded-full transition-all ${
                isRotating ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                isRotating ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </motion.div>
        
        {/* Depth and Brightness */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Depth Mode</span>
            <div className="flex gap-1">
              {['3d', '2d'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setDepthMode(mode)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    depthMode === mode 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Brightness</span>
            <div className="flex gap-1">
              {['strength', 'activity', 'age'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setBrightnessMode(mode)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    brightnessMode === mode 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
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
        {/* Galaxy Statistics */}
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
            <span className="text-xs text-white/60 font-medium">Constellations</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.totalConstellations}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Clusters</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.totalClusters}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Avg Brightness</span>
            <span className="text-lg font-bold text-amber-400">{(analytics.avgBrightness * 100).toFixed(0)}%</span>
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
            {analytics?.typeStats && Object.entries(analytics.typeStats).map(([type, stats]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-white/40 capitalize">{type}</span>
                <span className="text-xs text-white font-medium">{stats.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Galaxy Insights */}
        {galaxyInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Galaxy Insights</div>
            <div className="space-y-2">
              {galaxyInsights.slice(0, 3).map((insight, i) => (
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
            onClick={exportGalaxy}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportGalaxyData}
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
              </div>
              <p className="text-xs text-white/60">{selectedStar.label}</p>
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
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Strength:</span>
              <span className="text-white ml-1">{(selectedStar.strength * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Brightness:</span>
              <span className="text-white ml-1">{(selectedStar.brightness * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Connections:</span>
              <span className="text-white ml-1">{selectedStar.connections.length}</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Size:</span>
              <span className="text-white ml-1">{selectedStar.size.toFixed(1)}</span>
            </div>
          </div>
          
          {selectedStar.metadata && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs text-white/40 mb-2">Metadata</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedStar.metadata).map(([key, value]) => (
                  <div key={key} className="bg-black/30 rounded-lg p-2">
                    <span className="text-white/40 capitalize">{key}:</span>
                    <span className="text-white ml-1">{typeof value === 'number' ? value.toFixed(1) : String(value).substring(0, 15)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Empty State */}
      {galaxyData.stars.length === 0 && (
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
              🌌
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your knowledge galaxy is empty</p>
            <p className="text-white/30 text-xs">Add knowledge entries, study logs, and skills to build your galaxy</p>
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
          <p className="text-xs text-white/60 mt-1">{hoveredStar.label}</p>
          <div className="text-[10px] text-white/40 mt-1">
            {(hoveredStar.strength * 100).toFixed(0)}% strength • {hoveredStar.connections.length} connections
          </div>
        </motion.div>
      )}
    </div>
  )
}
