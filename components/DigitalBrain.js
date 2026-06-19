'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, Brain, Activity, Zap, Target, Layers, Network, Sparkles, X, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Info, TrendingUp, BarChart3, Eye, EyeOff, Map, Route, Lightbulb, Cpu, Database, BookOpen, GraduationCap, Award, Clock } from 'lucide-react'

export default function DigitalBrain({ studyLogs, knowledge, skills, goals, tasks, journal, habits }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [neurons, setNeurons] = useState([])
  const [pathways, setPathways] = useState([])
  const [brainRegions, setBrainRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedNeuron, setSelectedNeuron] = useState(null)
  const [hoveredNeuron, setHoveredNeuron] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('brain') // brain, network, pathways, regions
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showSignals, setShowSignals] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [learningPathways, setLearningPathways] = useState([])
  const [brainInsights, setBrainInsights] = useState([])
  const [neuralActivity, setNeuralActivity] = useState([])
  
  // Advanced brain processing
  useEffect(() => {
    const processBrain = () => {
      // Create brain regions
      const regions = generateBrainRegions()
      setBrainRegions(regions)
      
      // Create neurons from study subjects, knowledge, and skills
      const newNeurons = []
      const neuronMap = new Map()
      
      // Process study subjects
      const subjects = {}
      studyLogs?.forEach(log => {
        if (!subjects[log.subject]) {
          subjects[log.subject] = {
            id: `subject-${log.subject}`,
            label: log.subject,
            type: 'subject',
            region: assignToRegion(log.subject, regions),
            x: Math.random() * 100,
            y: Math.random() * 100,
            activation: 0,
            strength: 0,
            color: '#22d3ee',
            metadata: {
              studyHours: 0,
              sessions: 0,
              lastStudied: null,
              difficulty: 'medium'
            }
          }
        }
        subjects[log.subject].strength += (log.hours || 0) * 0.1
        subjects[log.subject].activation = Math.min(1, subjects[log.subject].strength)
        subjects[log.subject].metadata.studyHours += (log.hours || 0)
        subjects[log.subject].metadata.sessions += 1
        subjects[log.subject].metadata.lastStudied = log.date
      })
      
      Object.values(subjects).forEach(subject => {
        newNeurons.push(subject)
        neuronMap.set(subject.label, subject)
      })
      
      // Process knowledge entries
      knowledge?.forEach(item => {
        const neuron = {
          id: `knowledge-${item.id}`,
          label: item.title,
          type: 'knowledge',
          region: assignToRegion(item.title, regions),
          x: Math.random() * 100,
          y: Math.random() * 100,
          activation: (item.confidence || 3) / 5,
          strength: (item.confidence || 3) / 5,
          color: getTypeColor(item.type),
          metadata: {
            type: item.type,
            confidence: item.confidence || 3,
            createdAt: item.createdAt,
            relatedSubjects: []
          }
        }
        newNeurons.push(neuron)
        neuronMap.set(item.title, neuron)
      })
      
      // Process skills
      skills?.forEach(skill => {
        const neuron = {
          id: `skill-${skill.id}`,
          label: skill.name,
          type: 'skill',
          region: assignToRegion(skill.name, regions),
          x: Math.random() * 100,
          y: Math.random() * 100,
          activation: (skill.confidence || 3) / 5,
          strength: (skill.confidence || 3) / 5,
          color: '#34d399',
          metadata: {
            category: skill.category,
            confidence: skill.confidence || 3,
            practiceCount: skill.practiceCount || 0,
            lastPracticed: skill.lastPracticed
          }
        }
        newNeurons.push(neuron)
        neuronMap.set(skill.name, neuron)
      })
      
      setNeurons(newNeurons)
      
      // Create pathways between related neurons
      const newPathways = generatePathways(newNeurons, neuronMap)
      setPathways(newPathways)
      
      // Generate learning pathways
      const learningPaths = generateLearningPathways(newNeurons, newPathways, studyLogs, goals)
      setLearningPathways(learningPaths)
      
      // Calculate analytics
      const analyticsData = calculateBrainAnalytics(newNeurons, newPathways, regions)
      setAnalytics(analyticsData)
      
      // Generate neural activity data
      const activity = generateNeuralActivity(newNeurons, newPathways)
      setNeuralActivity(activity)
      
      // Generate brain insights
      const insights = generateBrainInsights(analyticsData, regions, learningPaths)
      setBrainInsights(insights)
    }
    
    processBrain()
  }, [studyLogs, knowledge, skills, goals, tasks, journal, habits])
  
  const generateBrainRegions = () => {
    return [
      { id: 'frontal', name: 'Frontal Lobe', function: 'Executive Functions', color: '#8b5cf6', x: 0.5, y: 0.3, neurons: [] },
      { id: 'temporal', name: 'Temporal Lobe', function: 'Memory & Language', color: '#22d3ee', x: 0.3, y: 0.6, neurons: [] },
      { id: 'parietal', name: 'Parietal Lobe', function: 'Spatial Processing', color: '#34d399', x: 0.7, y: 0.6, neurons: [] },
      { id: 'occipital', name: 'Occipital Lobe', function: 'Visual Processing', color: '#fbbf24', x: 0.5, y: 0.8, neurons: [] },
      { id: 'cerebellum', name: 'Cerebellum', function: 'Motor Control', color: '#f472b6', x: 0.2, y: 0.8, neurons: [] },
      { id: 'brainstem', name: 'Brainstem', function: 'Basic Functions', color: '#a78bfa', x: 0.8, y: 0.8, neurons: [] }
    ]
  }
  
  const assignToRegion = (label, regions) => {
    const keywords = {
      frontal: ['logic', 'reasoning', 'planning', 'decision', 'executive', 'strategy', 'analysis'],
      temporal: ['memory', 'language', 'audio', 'speech', 'comprehension', 'recognition'],
      parietal: ['spatial', 'math', 'calculation', 'geometry', 'navigation', 'coordinate'],
      occipital: ['visual', 'image', 'pattern', 'color', 'shape', 'design', 'art'],
      cerebellum: ['motor', 'movement', 'physical', 'exercise', 'action', 'coordination'],
      brainstem: ['basic', 'survival', 'automatic', 'reflex', 'essential', 'foundation']
    }
    
    const lowerLabel = label.toLowerCase()
    for (const [regionId, regionKeywords] of Object.entries(keywords)) {
      if (regionKeywords.some(keyword => lowerLabel.includes(keyword))) {
        return regionId
      }
    }
    
    return 'frontal' // Default region
  }
  
  const generatePathways = (neurons, neuronMap) => {
    const pathways = []
    
    neurons.forEach((neuron, i) => {
      neurons.forEach((otherNeuron, j) => {
        if (i >= j) return
        
        // Calculate connection strength based on similarity and proximity
        const similarity = calculateSimilarity(neuron, otherNeuron)
        const proximity = Math.sqrt(Math.pow(neuron.x - otherNeuron.x, 2) + Math.pow(neuron.y - otherNeuron.y, 2))
        
        // Create pathway if neurons are sufficiently similar
        if (similarity > 0.3) {
          const strength = similarity * (1 - proximity / 100)
          
          if (strength > 0.2) {
            pathways.push({
              id: `pathway-${i}-${j}`,
              from: neuron.id,
              to: otherNeuron.id,
              strength: Math.min(1, strength),
              activity: strength,
              type: determinePathwayType(neuron, otherNeuron),
              metadata: {
                similarity,
                proximity,
                frequency: Math.random()
              }
            })
          }
        }
      })
    })
    
    return pathways
  }
  
  const calculateSimilarity = (neuron1, neuron2) => {
    let similarity = 0
    
    // Same type increases similarity
    if (neuron1.type === neuron2.type) similarity += 0.4
    
    // Same region increases similarity
    if (neuron1.region === neuron2.region) similarity += 0.3
    
    // Label similarity (simple check for common words)
    const words1 = neuron1.label.toLowerCase().split(' ')
    const words2 = neuron2.label.toLowerCase().split(' ')
    const commonWords = words1.filter(word => words2.includes(word))
    similarity += commonWords.length * 0.1
    
    return Math.min(1, similarity)
  }
  
  const determinePathwayType = (neuron1, neuron2) => {
    if (neuron1.type === 'subject' && neuron2.type === 'knowledge') return 'subject-knowledge'
    if (neuron1.type === 'knowledge' && neuron2.type === 'skill') return 'knowledge-skill'
    if (neuron1.type === 'skill' && neuron2.type === 'skill') return 'skill-skill'
    return 'general'
  }
  
  const generateLearningPathways = (neurons, pathways, studyLogs, goals) => {
    const learningPaths = []
    
    // Create learning pathways based on study sequences
    const studySequence = studyLogs?.map(log => log.subject) || []
    for (let i = 0; i < studySequence.length - 1; i++) {
      const currentSubject = studySequence[i]
      const nextSubject = studySequence[i + 1]
      
      const currentNeuron = neurons.find(n => n.label === currentSubject)
      const nextNeuron = neurons.find(n => n.label === nextSubject)
      
      if (currentNeuron && nextNeuron) {
        learningPaths.push({
          id: `learning-${i}`,
          type: 'sequence',
          neurons: [currentNeuron.id, nextNeuron.id],
          strength: 0.5 + Math.random() * 0.3,
          frequency: 1
        })
      }
    }
    
    // Create goal-based pathways
    goals?.forEach(goal => {
      const relatedNeurons = neurons.filter(n => 
        goal.title.toLowerCase().includes(n.label.toLowerCase()) ||
        n.label.toLowerCase().includes(goal.title.toLowerCase())
      )
      
      if (relatedNeurons.length > 1) {
        learningPaths.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          neurons: relatedNeurons.map(n => n.id),
          strength: goal.progress / 100,
          frequency: 1
        })
      }
    })
    
    return learningPaths
  }
  
  const calculateBrainAnalytics = (neurons, pathways, regions) => {
    const totalNeurons = neurons.length
    const activeNeurons = neurons.filter(n => n.activation > 0.5).length
    const totalPathways = pathways.length
    const strongPathways = pathways.filter(p => p.strength > 0.5).length
    
    // Region analytics
    const regionAnalytics = regions.map(region => {
      const regionNeurons = neurons.filter(n => n.region === region.id)
      const avgActivation = regionNeurons.length > 0 ? regionNeurons.reduce((sum, n) => sum + n.activation, 0) / regionNeurons.length : 0
      const regionPathways = pathways.filter(p => {
        const fromNeuron = neurons.find(n => n.id === p.from)
        const toNeuron = neurons.find(n => n.id === p.to)
        return fromNeuron?.region === region.id || toNeuron?.region === region.id
      })
      
      return {
        ...region,
        neuronCount: regionNeurons.length,
        avgActivation,
        pathwayCount: regionPathways.length,
        dominance: (regionNeurons.length / totalNeurons) * 100
      }
    })
    
    return {
      totalNeurons,
      activeNeurons,
      totalPathways,
      strongPathways,
      neuralActivity: (activeNeurons / Math.max(totalNeurons, 1)) * 100,
      regionAnalytics,
      avgNeuronStrength: neurons.length > 0 ? neurons.reduce((sum, n) => sum + n.strength, 0) / neurons.length : 0,
      avgPathwayStrength: pathways.length > 0 ? pathways.reduce((sum, p) => sum + p.strength, 0) / pathways.length : 0
    }
  }
  
  const generateNeuralActivity = (neurons, pathways) => {
    const activity = []
    
    neurons.forEach(neuron => {
      const connectedPathways = pathways.filter(p => p.from === neuron.id || p.to === neuron.id)
      const avgPathwayActivity = connectedPathways.length > 0 ? connectedPathways.reduce((sum, p) => sum + p.activity, 0) / connectedPathways.length : 0
      
      activity.push({
        neuronId: neuron.id,
        activation: neuron.activation,
        pathwayActivity: avgPathwayActivity,
        totalActivity: (neuron.activation + avgPathwayActivity) / 2,
        timestamp: Date.now()
      })
    })
    
    return activity
  }
  
  const generateBrainInsights = (analytics, regions, learningPaths) => {
    const insights = []
    
    if (analytics.neuralActivity > 80) {
      insights.push({
        type: 'activity',
        icon: Zap,
        title: 'High Neural Activity',
        description: 'Your brain is highly active with strong neural connections.',
        severity: 'success'
      })
    }
    
    const dominantRegion = analytics.regionAnalytics.reduce((max, r) => r.dominance > max.dominance ? r : max, analytics.regionAnalytics[0])
    if (dominantRegion && dominantRegion.dominance > 40) {
      insights.push({
        type: 'region',
        icon: Brain,
        title: `${dominantRegion.name} Dominant`,
        description: `${dominantRegion.name} is your most active brain region.`,
        severity: 'info'
      })
    }
    
    if (learningPaths.length > 5) {
      insights.push({
        type: 'learning',
        icon: Route,
        title: 'Rich Learning Pathways',
        description: `You have ${learningPaths.length} established learning pathways.`,
        severity: 'success'
      })
    }
    
    if (analytics.avgPathwayStrength > 0.7) {
      insights.push({
        type: 'connections',
        icon: Network,
        title: 'Strong Neural Connections',
        description: 'Your neural pathways are exceptionally strong.',
        severity: 'success'
      })
    }
    
    return insights
  }
  
  const getTypeColor = (type) => {
    const colors = {
      book: '#fbbf24',
      course: '#22d3ee',
      paper: '#34d399',
      concept: '#f472b6',
      video: '#a78bfa',
      skill: '#10b981'
    }
    return colors[type] || '#8b5cf6'
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
      
      if (viewMode === 'brain') {
        drawBrainView(ctx, width, height, time)
      } else if (viewMode === 'network') {
        drawNetworkView(ctx, width, height, time)
      } else if (viewMode === 'pathways') {
        drawPathwaysView(ctx, width, height, time)
      } else if (viewMode === 'regions') {
        drawRegionsView(ctx, width, height, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [neurons, pathways, brainRegions, zoom, pan, viewMode, animationSpeed, showLabels, showSignals, selectedRegion, selectedNeuron, hoveredNeuron])
  
  const drawBrainView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    const brainWidth = 300
    const brainHeight = 250
    
    // Draw brain regions
    brainRegions.forEach(region => {
      const regionX = centerX + (region.x - 0.5) * brainWidth
      const regionY = centerY + (region.y - 0.5) * brainHeight
      const regionWidth = 80
      const regionHeight = 60
      
      // Region glow
      const regionGlow = ctx.createRadialGradient(regionX, regionY, 0, regionX, regionY, regionWidth)
      regionGlow.addColorStop(0, `${region.color}40`)
      regionGlow.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.ellipse(regionX, regionY, regionWidth, regionHeight, 0, 0, Math.PI * 2)
      ctx.fillStyle = regionGlow
      ctx.fill()
      
      // Region border
      ctx.beginPath()
      ctx.ellipse(regionX, regionY, regionWidth, regionHeight, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `${region.color}60`
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Region label
      if (showLabels) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(region.name, regionX, regionY + regionHeight + 15)
      }
    })
    
    // Draw brain outline
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, brainWidth / 2, brainHeight / 2, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Brain glow
    const brainGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, brainWidth / 2)
    brainGlow.addColorStop(0, 'rgba(139, 92, 246, 0.1)')
    brainGlow.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, brainWidth / 2, brainHeight / 2, 0, 0, Math.PI * 2)
    ctx.fillStyle = brainGlow
    ctx.fill()
    
    // Draw pathways
    pathways.forEach(pathway => {
      const fromNeuron = neurons.find(n => n.id === pathway.from)
      const toNeuron = neurons.find(n => n.id === pathway.to)
      
      if (fromNeuron && toNeuron) {
        const fromX = centerX + (fromNeuron.x - 50) / 100 * brainWidth * 0.8
        const fromY = centerY + (fromNeuron.y - 50) / 100 * brainHeight * 0.8
        const toX = centerX + (toNeuron.x - 50) / 100 * brainWidth * 0.8
        const toY = centerY + (toNeuron.y - 50) / 100 * brainHeight * 0.8
        
        const thickness = 1 + pathway.strength * 3
        
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 + pathway.strength * 0.3})`
        ctx.lineWidth = thickness
        ctx.stroke()
        
        // Animated signal
        if (showSignals) {
          const signalProgress = (time * 0.02 + pathway.strength) % 1
          const signalX = fromX + (toX - fromX) * signalProgress
          const signalY = fromY + (toY - fromY) * signalProgress
          
          ctx.beginPath()
          ctx.arc(signalX, signalY, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + Math.sin(time * 0.05) * 0.3})`
          ctx.fill()
        }
      }
    })
    
    // Draw neurons
    neurons.forEach(neuron => {
      const x = centerX + (neuron.x - 50) / 100 * brainWidth * 0.8
      const y = centerY + (neuron.y - 50) / 100 * brainHeight * 0.8
      
      const glowSize = 10 + neuron.activation * 20
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
      glowGradient.addColorStop(0, neuron.color)
      glowGradient.addColorStop(0.5, neuron.color + '60')
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(x, y, glowSize, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()
      
      const coreSize = 5 + neuron.strength * 5
      ctx.beginPath()
      ctx.arc(x, y, coreSize, 0, Math.PI * 2)
      ctx.fillStyle = neuron.color
      ctx.fill()
      
      if (neuron.activation > 0.5) {
        const pulse = Math.sin(time * 0.05 + neuron.x) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(x, y, coreSize + pulse * 5, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })
    
    // Synaptic sparks
    if (time % 30 < 5) {
      const randomNeuron = neurons[Math.floor(Math.random() * neurons.length)]
      if (randomNeuron) {
        const x = centerX + (randomNeuron.x - 50) / 100 * brainWidth * 0.8
        const y = centerY + (randomNeuron.y - 50) / 100 * brainHeight * 0.8
        
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * 20
          const sparkX = x + Math.cos(angle) * distance
          const sparkY = y + Math.sin(angle) * distance
          
          ctx.beginPath()
          ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'
          ctx.fill()
        }
      }
    }
  }
  
  const drawNetworkView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw pathways
    pathways.forEach(pathway => {
      const fromNeuron = neurons.find(n => n.id === pathway.from)
      const toNeuron = neurons.find(n => n.id === pathway.to)
      
      if (fromNeuron && toNeuron) {
        const fromX = centerX + (fromNeuron.x - 50) / 100 * width * 0.8
        const fromY = centerY + (fromNeuron.y - 50) / 100 * height * 0.8
        const toX = centerX + (toNeuron.x - 50) / 100 * width * 0.8
        const toY = centerY + (toNeuron.y - 50) / 100 * height * 0.8
        
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 + pathway.strength * 0.3})`
        ctx.lineWidth = 1 + pathway.strength * 2
        ctx.stroke()
        
        if (showSignals) {
          const signalProgress = (time * 0.02 + pathway.strength) % 1
          const signalX = fromX + (toX - fromX) * signalProgress
          const signalY = fromY + (toY - fromY) * signalProgress
          
          ctx.beginPath()
          ctx.arc(signalX, signalY, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + Math.sin(time * 0.05) * 0.3})`
          ctx.fill()
        }
      }
    })
    
    // Draw neurons
    neurons.forEach(neuron => {
      const x = centerX + (neuron.x - 50) / 100 * width * 0.8
      const y = centerY + (neuron.y - 50) / 100 * height * 0.8
      
      const glowSize = 12 + neuron.activation * 18
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
      glowGradient.addColorStop(0, neuron.color)
      glowGradient.addColorStop(0.5, neuron.color + '60')
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(x, y, glowSize, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()
      
      const coreSize = 6 + neuron.strength * 4
      ctx.beginPath()
      ctx.arc(x, y, coreSize, 0, Math.PI * 2)
      ctx.fillStyle = neuron.color
      ctx.fill()
      
      if (showLabels) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '9px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(neuron.label.substring(0, 10), x, y + coreSize + 12)
      }
    })
  }
  
  const drawPathwaysView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw learning pathways
    learningPathways.forEach((path, i) => {
      const pathNeurons = path.neurons.map(id => neurons.find(n => n.id === id)).filter(Boolean)
      
      if (pathNeurons.length > 1) {
        ctx.beginPath()
        pathNeurons.forEach((neuron, j) => {
          const x = centerX + (neuron.x - 50) / 100 * width * 0.8
          const y = centerY + (neuron.y - 50) / 100 * height * 0.8
          
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        
        ctx.strokeStyle = path.type === 'goal' ? '#fbbf24' : '#22d3ee'
        ctx.lineWidth = 2 + path.strength * 2
        ctx.stroke()
        
        // Animate along pathway
        if (showSignals) {
          const progress = (time * 0.01 + i * 0.1) % 1
          const pointIndex = Math.floor(progress * (pathNeurons.length - 1))
          const nextIndex = Math.min(pointIndex + 1, pathNeurons.length - 1)
          const localProgress = (progress * (pathNeurons.length - 1)) % 1
          
          const currentNeuron = pathNeurons[pointIndex]
          const nextNeuron = pathNeurons[nextIndex]
          
          if (currentNeuron && nextNeuron) {
            const x = centerX + ((currentNeuron.x - 50) / 100 * width * 0.8) + ((nextNeuron.x - 50) / 100 * width * 0.8 - (currentNeuron.x - 50) / 100 * width * 0.8) * localProgress
            const y = centerY + ((currentNeuron.y - 50) / 100 * height * 0.8) + ((nextNeuron.y - 50) / 100 * height * 0.8 - (currentNeuron.y - 50) / 100 * height * 0.8) * localProgress
            
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fillStyle = path.type === 'goal' ? '#fbbf24' : '#22d3ee'
            ctx.fill()
          }
        }
      }
    })
    
    // Draw neurons
    neurons.forEach(neuron => {
      const x = centerX + (neuron.x - 50) / 100 * width * 0.8
      const y = centerY + (neuron.y - 50) / 100 * height * 0.8
      
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = neuron.color
      ctx.fill()
    })
  }
  
  const drawRegionsView = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw regions
    brainRegions.forEach(region => {
      const regionX = centerX + (region.x - 0.5) * width * 0.8
      const regionY = centerY + (region.y - 0.5) * height * 0.8
      const regionWidth = 100
      const regionHeight = 80
      
      // Region glow
      const regionGlow = ctx.createRadialGradient(regionX, regionY, 0, regionX, regionY, regionWidth)
      regionGlow.addColorStop(0, `${region.color}40`)
      regionGlow.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.ellipse(regionX, regionY, regionWidth, regionHeight, 0, 0, Math.PI * 2)
      ctx.fillStyle = regionGlow
      ctx.fill()
      
      // Region border
      ctx.beginPath()
      ctx.ellipse(regionX, regionY, regionWidth, regionHeight, 0, 0, Math.PI * 2)
      ctx.strokeStyle = region.color
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Region label
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(region.name, regionX, regionY)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '9px Arial'
      ctx.fillText(region.function, regionX, regionY + 15)
      
      // Neuron count
      const regionNeurons = neurons.filter(n => n.region === region.id)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.font = '10px Arial'
      ctx.fillText(`${regionNeurons.length} neurons`, regionX, regionY + 30)
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
  const exportBrain = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'digital-brain.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportBrainData = () => {
    const data = {
      neurons,
      pathways,
      brainRegions,
      learningPathways,
      analytics,
      brainInsights,
      neuralActivity,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'digital-brain.json'
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
          <p className="text-white/60">Loading digital brain...</p>
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
              {['brain', 'network', 'pathways', 'regions'].map(mode => (
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
                showLabels ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showLabels ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Show Signals</span>
            <button
              onClick={() => setShowSignals(!showSignals)}
              className={`w-10 h-5 rounded-full transition-all ${
                showSignals ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showSignals ? 'translate-x-5' : 'translate-x-0.5'
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
        {/* Neural Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total Neurons</span>
            <span className="text-lg font-bold text-violet-400">{analytics.totalNeurons}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Active Neurons</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.activeNeurons}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Neural Activity</span>
            <span className="text-lg font-bold text-emerald-400">{Math.round(analytics.neuralActivity)}%</span>
          </div>
        </motion.div>
        
        {/* Pathway Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total Pathways</span>
            <span className="text-lg font-bold text-amber-400">{analytics.totalPathways}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Strong Pathways</span>
            <span className="text-lg font-bold text-pink-400">{analytics.strongPathways}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Learning Paths</span>
            <span className="text-lg font-bold text-purple-400">{learningPathways.length}</span>
          </div>
        </motion.div>
        
        {/* Brain Insights */}
        {brainInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Brain Insights</div>
            <div className="space-y-2">
              {brainInsights.slice(0, 3).map((insight, i) => (
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
            onClick={exportBrain}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportBrainData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Empty State */}
      {analytics.totalNeurons === 0 && (
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
              🧠
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your digital brain is empty</p>
            <p className="text-white/30 text-xs">Start learning to build your neural network</p>
          </div>
        </div>
      )}
    </div>
  )
}
