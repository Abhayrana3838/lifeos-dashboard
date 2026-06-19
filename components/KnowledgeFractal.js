'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, Layers, TreeDeciduous, Spiral, Hexagon, Grid, Network, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Info, Eye, EyeOff, BookOpen, Target, Award, Sparkles, GitBranch, Folder, FolderOpen, FileText, Hash, ArrowRight, ArrowDown, ArrowUp, ArrowLeft } from 'lucide-react'

export default function KnowledgeFractal({ knowledge, studyLogs, skills }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [fractalNodes, setFractalNodes] = useState([])
  const [fractalConnections, setFractalConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('tree') // tree, spiral, radial, grid
  const [fractalPattern, setFractalPattern] = useState('recursive') // recursive, mandelbrot, julia, sierpinski
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [maxDepth, setMaxDepth] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [fractalInsights, setFractalInsights] = useState([])
  const [hierarchy, setHierarchy] = useState(null)
  
  // Advanced fractal processing
  useEffect(() => {
    const processFractal = () => {
      // Build hierarchical knowledge structure
      const builtHierarchy = buildKnowledgeHierarchy()
      setHierarchy(builtHierarchy)
      
      // Generate fractal nodes based on hierarchy
      const nodes = generateFractalNodes(builtHierarchy)
      setFractalNodes(nodes)
      
      // Generate fractal connections
      const connections = generateFractalConnections(nodes)
      setFractalConnections(connections)
      
      // Calculate analytics
      const analyticsData = calculateFractalAnalytics(nodes, connections, builtHierarchy)
      setAnalytics(analyticsData)
      
      // Generate fractal insights
      const insights = generateFractalInsights(analyticsData, nodes)
      setFractalInsights(insights)
    }
    
    processFractal()
  }, [knowledge, studyLogs, skills, maxDepth, fractalPattern])
  
  const buildKnowledgeHierarchy = () => {
    const hierarchy = {
      id: 'root',
      name: 'Knowledge',
      children: {},
      level: 0,
      data: null,
      expanded: true
    }
    
    // Process knowledge entries
    knowledge?.forEach(item => {
      const parts = item.title.split('→').map(p => p.trim())
      let current = hierarchy.children
      
      parts.forEach((part, i) => {
        if (!current[part]) {
          current[part] = {
            id: `${hierarchy.id}-${part}`,
            name: part,
            children: {},
            level: i + 1,
            data: i === parts.length - 1 ? item : null,
            expanded: i < 2,
            type: item.type || 'concept',
            confidence: item.confidence || 3
          }
        }
        current = current[part].children
      })
    })
    
    // Process study subjects
    const subjects = {}
    studyLogs?.forEach(log => {
      if (!subjects[log.subject]) {
        subjects[log.subject] = {
          id: `study-${log.subject}`,
          name: log.subject,
          children: {},
          level: 1,
          data: null,
          expanded: true,
          type: 'subject',
          studyHours: 0
        }
      }
      subjects[log.subject].studyHours += (log.hours || 0)
    })
    
    Object.values(subjects).forEach(subject => {
      hierarchy.children[subject.name] = subject
    })
    
    // Process skills
    skills?.forEach(skill => {
      const categoryName = skill.category || 'Skills'
      if (!hierarchy.children[categoryName]) {
        hierarchy.children[categoryName] = {
          id: `skill-${categoryName}`,
          name: categoryName,
          children: {},
          level: 1,
          data: null,
          expanded: true,
          type: 'category'
        }
      }
      
      hierarchy.children[categoryName].children[skill.name] = {
        id: `skill-${skill.name}`,
        name: skill.name,
        children: {},
        level: 2,
        data: skill,
        expanded: false,
        type: 'skill',
        confidence: skill.confidence || 3
      }
    })
    
    return hierarchy
  }
  
  const generateFractalNodes = (hierarchy) => {
    const nodes = []
    let nodeIdCounter = 0
    
    const traverse = (node, parentX, parentY, angle, depth, branchAngle) => {
      if (depth > maxDepth) return
      
      const keys = Object.keys(node)
      const childCount = keys.length
      
      if (childCount === 0) return
      
      const radius = 80 / (depth + 1)
      const angleStep = (Math.PI * 2) / childCount
      
      keys.forEach((key, i) => {
        const child = node[key]
        const currentAngle = angle + (i - childCount / 2) * branchAngle
        
        let x, y
        
        if (viewMode === 'tree') {
          x = parentX + Math.cos(currentAngle) * radius
          y = parentY + Math.sin(currentAngle) * radius
        } else if (viewMode === 'spiral') {
          const spiralRadius = radius * (depth + 1)
          const spiralAngle = currentAngle + depth * 0.5
          x = parentX + Math.cos(spiralAngle) * spiralRadius
          y = parentY + Math.sin(spiralAngle) * spiralRadius
        } else if (viewMode === 'radial') {
          const radialRadius = 100 * depth
          const radialAngle = (i / childCount) * Math.PI * 2 + depth * 0.3
          x = parentX + Math.cos(radialAngle) * radialRadius
          y = parentY + Math.sin(radialAngle) * radialRadius
        } else if (viewMode === 'grid') {
          const gridSize = 150
          x = parentX + (i - childCount / 2) * gridSize
          y = parentY + depth * gridSize
        }
        
        const nodeData = {
          id: `node-${nodeIdCounter++}`,
          label: child.name,
          x,
          y,
          level: child.level,
          data: child.data,
          expanded: child.expanded,
          hasChildren: Object.keys(child.children).length > 0,
          type: child.type,
          confidence: child.confidence,
          parentX,
          parentY,
          angle: currentAngle
        }
        
        nodes.push(nodeData)
        
        // Recursively traverse children
        if (child.expanded && Object.keys(child.children).length > 0) {
          traverse(child.children, x, y, currentAngle, depth + 1, branchAngle * 0.7)
        }
      })
    }
    
    // Start traversal from root
    const centerX = 400
    const centerY = 300
    traverse(hierarchy.children, centerX, centerY, -Math.PI / 2, 0, Math.PI / 3)
    
    return nodes
  }
  
  const generateFractalConnections = (nodes) => {
    const connections = []
    
    nodes.forEach(node => {
      // Find parent node
      const parent = nodes.find(n => 
        Math.abs(n.x - node.parentX) < 1 && Math.abs(n.y - node.parentY) < 1 && n.level === node.level - 1
      )
      
      if (parent) {
        connections.push({
          id: `conn-${parent.id}-${node.id}`,
          from: parent.id,
          to: node.id,
          strength: 1 - node.level * 0.15,
          type: 'hierarchy'
        })
      }
    })
    
    // Add cross-connections based on similarity
    nodes.forEach((node1, i) => {
      nodes.forEach((node2, j) => {
        if (i >= j) return
        
        const similarity = calculateNodeSimilarity(node1, node2)
        if (similarity > 0.6 && node1.level === node2.level) {
          connections.push({
            id: `cross-${node1.id}-${node2.id}`,
            from: node1.id,
            to: node2.id,
            strength: similarity * 0.5,
            type: 'cross'
          })
        }
      })
    })
    
    return connections
  }
  
  const calculateNodeSimilarity = (node1, node2) => {
    let similarity = 0
    
    // Same type increases similarity
    if (node1.type === node2.type) similarity += 0.4
    
    // Same level increases similarity
    if (node1.level === node2.level) similarity += 0.3
    
    // Label similarity
    const words1 = node1.label.toLowerCase().split(' ')
    const words2 = node2.label.toLowerCase().split(' ')
    const commonWords = words1.filter(word => words2.includes(word))
    similarity += commonWords.length * 0.1
    
    return Math.min(1, similarity)
  }
  
  const calculateFractalAnalytics = (nodes, connections, hierarchy) => {
    const totalNodes = nodes.length
    const totalConnections = connections.length
    const maxDepthLevel = Math.max(...nodes.map(n => n.level))
    const leafNodes = nodes.filter(n => !n.hasChildren).length
    const branchNodes = nodes.filter(n => n.hasChildren).length
    
    const nodesByType = {
      concept: nodes.filter(n => n.type === 'concept').length,
      subject: nodes.filter(n => n.type === 'subject').length,
      skill: nodes.filter(n => n.type === 'skill').length,
      category: nodes.filter(n => n.type === 'category').length
    }
    
    const avgConfidence = nodes.length > 0 ? nodes.reduce((sum, n) => sum + (n.confidence || 0), 0) / nodes.length : 0
    
    const hierarchyDepth = calculateHierarchyDepth(hierarchy)
    const branchingFactor = calculateBranchingFactor(hierarchy)
    
    return {
      totalNodes,
      totalConnections,
      maxDepth: maxDepthLevel,
      leafNodes,
      branchNodes,
      nodesByType,
      avgConfidence,
      hierarchyDepth,
      branchingFactor,
      fractalComplexity: totalNodes * (1 + totalConnections / totalNodes)
    }
  }
  
  const calculateHierarchyDepth = (hierarchy) => {
    let maxDepth = 0
    
    const traverse = (node, depth) => {
      maxDepth = Math.max(maxDepth, depth)
      Object.values(node.children).forEach(child => {
        traverse(child, depth + 1)
      })
    }
    
    traverse(hierarchy, 0)
    return maxDepth
  }
  
  const calculateBranchingFactor = (hierarchy) => {
    let totalChildren = 0
    let totalParents = 0
    
    const traverse = (node) => {
      const childCount = Object.keys(node.children).length
      if (childCount > 0) {
        totalChildren += childCount
        totalParents++
      }
      
      Object.values(node.children).forEach(child => {
        traverse(child)
      })
    }
    
    traverse(hierarchy)
    return totalParents > 0 ? totalChildren / totalParents : 0
  }
  
  const generateFractalInsights = (analytics, nodes) => {
    const insights = []
    
    if (analytics.branchingFactor > 3) {
      insights.push({
        type: 'complexity',
        icon: GitBranch,
        title: 'High Branching Factor',
        description: `Average branching factor is ${analytics.branchingFactor.toFixed(1)}.`,
        severity: 'info'
      })
    }
    
    if (analytics.avgConfidence > 3.5) {
      insights.push({
        type: 'confidence',
        icon: Award,
        title: 'High Knowledge Confidence',
        description: `Average confidence is ${analytics.avgConfidence.toFixed(1)}/5.`,
        severity: 'success'
      })
    }
    
    if (analytics.hierarchyDepth > 5) {
      insights.push({
        type: 'depth',
        icon: Layers,
        title: 'Deep Knowledge Structure',
        description: `Hierarchy depth is ${analytics.hierarchyDepth} levels.`,
        severity: 'info'
      })
    }
    
    const dominantType = Object.entries(analytics.nodesByType).sort((a, b) => b[1] - a[1])[0]
    if (dominantType) {
      insights.push({
        type: 'dominance',
        icon: Target,
        title: `${dominantType[0].charAt(0).toUpperCase() + dominantType[0].slice(1)} Dominant`,
        description: `${dominantType[0]} makes up ${dominantType[1]} nodes.`,
        severity: 'info'
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
      
      // Draw fractal based on pattern
      if (fractalPattern === 'recursive') {
        drawRecursiveFractal(ctx, width, height, time)
      } else if (fractalPattern === 'mandelbrot') {
        drawMandelbrotFractal(ctx, width, height, time)
      } else if (fractalPattern === 'julia') {
        drawJuliaFractal(ctx, width, height, time)
      } else if (fractalPattern === 'sierpinski') {
        drawSierpinskiFractal(ctx, width, height, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [fractalNodes, fractalConnections, zoom, pan, viewMode, fractalPattern, animationSpeed, showLabels, showConnections, selectedNode, hoveredNode, searchQuery])
  
  const drawRecursiveFractal = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height))
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#0f0f1a')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw connections
    if (showConnections) {
      fractalConnections.forEach(conn => {
        const fromNode = fractalNodes.find(n => n.id === conn.from)
        const toNode = fractalNodes.find(n => n.id === conn.to)
        
        if (fromNode && toNode) {
          const fromX = (fromNode.x - 400) + centerX
          const fromY = (fromNode.y - 300) + centerY
          const toX = (toNode.x - 400) + centerX
          const toY = (toNode.y - 300) + centerY
          
          const pulse = Math.sin(time * 0.02 + conn.strength * 10) * 0.5 + 0.5
          
          ctx.beginPath()
          ctx.moveTo(fromX, fromY)
          ctx.lineTo(toX, toY)
          ctx.strokeStyle = conn.type === 'cross' 
            ? `rgba(251, 191, 36, ${conn.strength * 0.3 * pulse})`
            : `rgba(139, 92, 246, ${conn.strength * 0.3 * pulse})`
          ctx.lineWidth = 1 + conn.strength * 2
          ctx.stroke()
          
          // Animated particle
          const particleProgress = (time * 0.01 + conn.strength) % 1
          const particleX = fromX + (toX - fromX) * particleProgress
          const particleY = fromY + (toY - fromY) * particleProgress
          
          ctx.beginPath()
          ctx.arc(particleX, particleY, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + pulse * 0.3})`
          ctx.fill()
        }
      })
    }
    
    // Draw nodes
    fractalNodes.forEach(node => {
      const x = (node.x - 400) + centerX
      const y = (node.y - 300) + centerY
      const size = Math.max(4, 12 - node.level * 1.5)
      
      // Filter by search
      if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return
      }
      
      // Node glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
      const nodeColor = getNodeColor(node.type)
      glowGradient.addColorStop(0, nodeColor)
      glowGradient.addColorStop(0.5, nodeColor + '80')
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(x, y, size * 3, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()
      
      // Node core
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = node.data ? '#fbbf24' : nodeColor
      ctx.fill()
      
      // Expand/collapse indicator
      if (node.hasChildren) {
        ctx.beginPath()
        ctx.arc(x + size + 5, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = node.expanded ? '#34d399' : '#f472b6'
        ctx.fill()
        
        ctx.fillStyle = 'white'
        ctx.font = '8px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.expanded ? '-' : '+', x + size + 5, y)
      }
      
      // Node label
      if (showLabels) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = `${Math.max(8, 12 - node.level)}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(node.label.substring(0, 12), x, y - size - 5)
      }
    })
  }
  
  const drawMandelbrotFractal = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, width, height)
    
    // Draw simplified Mandelbrot-inspired pattern with knowledge nodes
    const scale = 200 / zoom
    const maxIterations = 50
    
    for (let px = 0; px < width; px += 4) {
      for (let py = 0; py < height; py += 4) {
        const x0 = (px - centerX) / scale
        const y0 = (py - centerY) / scale
        
        let x = 0
        let y = 0
        let iteration = 0
        
        while (x * x + y * y <= 4 && iteration < maxIterations) {
          const xtemp = x * x - y * y + x0
          y = 2 * x * y + y0
          x = xtemp
          iteration++
        }
        
        if (iteration < maxIterations) {
          const hue = (iteration / maxIterations) * 360 + time * 10
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`
          ctx.fillRect(px, py, 4, 4)
        }
      }
    }
    
    // Overlay knowledge nodes
    fractalNodes.forEach(node => {
      const x = (node.x - 400) + centerX
      const y = (node.y - 300) + centerY
      const size = 6
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = getNodeColor(node.type)
      ctx.fill()
    })
  }
  
  const drawJuliaFractal = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, width, height)
    
    // Julia set parameters
    const cRe = -0.7 + Math.sin(time * 0.01) * 0.1
    const cIm = 0.27015 + Math.cos(time * 0.01) * 0.1
    const scale = 200 / zoom
    const maxIterations = 50
    
    for (let px = 0; px < width; px += 4) {
      for (let py = 0; py < height; py += 4) {
        let x = (px - centerX) / scale
        let y = (py - centerY) / scale
        let iteration = 0
        
        while (x * x + y * y <= 4 && iteration < maxIterations) {
          const xtemp = x * x - y * y + cRe
          y = 2 * x * y + cIm
          x = xtemp
          iteration++
        }
        
        if (iteration < maxIterations) {
          const hue = (iteration / maxIterations) * 360 + time * 10
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`
          ctx.fillRect(px, py, 4, 4)
        }
      }
    }
    
    // Overlay knowledge nodes
    fractalNodes.forEach(node => {
      const x = (node.x - 400) + centerX
      const y = (node.y - 300) + centerY
      const size = 6
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = getNodeColor(node.type)
      ctx.fill()
    })
  }
  
  const drawSierpinskiFractal = (ctx, width, height, time) => {
    const centerX = width / 2
    const centerY = height / 2
    
    // Background
    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, width, height)
    
    // Draw Sierpinski triangle pattern
    const drawSierpinski = (x, y, size, depth) => {
      if (depth === 0) {
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size, y + size)
        ctx.lineTo(x + size, y + size)
        ctx.closePath()
        ctx.fillStyle = `rgba(139, 92, 246, ${0.2 + depth * 0.1})`
        ctx.fill()
        return
      }
      
      const newSize = size / 2
      drawSierpinski(x, y - newSize, newSize, depth - 1)
      drawSierpinski(x - newSize, y + newSize, newSize, depth - 1)
      drawSierpinski(x + newSize, y + newSize, newSize, depth - 1)
    }
    
    drawSierpinski(centerX, centerY, 200, 4)
    
    // Overlay knowledge nodes
    fractalNodes.forEach(node => {
      const x = (node.x - 400) + centerX
      const y = (node.y - 300) + centerY
      const size = 6
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = getNodeColor(node.type)
      ctx.fill()
    })
  }
  
  const getNodeColor = (type) => {
    const colors = {
      concept: '#8b5cf6',
      subject: '#22d3ee',
      skill: '#34d399',
      category: '#fbbf24'
    }
    return colors[type] || '#a78bfa'
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
  const exportFractal = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'knowledge-fractal.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportFractalData = () => {
    const data = {
      fractalNodes,
      fractalConnections,
      hierarchy,
      analytics,
      fractalInsights,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'knowledge-fractal.json'
    link.href = URL.createObjectURL(blob)
    link.click()
  }
  
  // Reset view
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  
  // Toggle node expansion
  const toggleNodeExpansion = (nodeId) => {
    const newNodes = fractalNodes.map(n => 
      n.id === nodeId ? { ...n, expanded: !n.expanded } : n
    )
    setFractalNodes(newNodes)
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
          <p className="text-white/60">Loading knowledge fractal...</p>
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
              {['tree', 'spiral', 'radial', 'grid'].map(mode => (
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
            <span className="text-xs text-white/60 font-medium">Fractal Pattern</span>
            <div className="flex gap-1">
              {['recursive', 'mandelbrot', 'julia', 'sierpinski'].map(pattern => (
                <button
                  key={pattern}
                  onClick={() => setFractalPattern(pattern)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    fractalPattern === pattern 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs outline-none flex-1 placeholder-white/40"
            />
          </div>
        </motion.div>
        
        {/* Depth Control */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Max Depth</span>
            <div className="flex gap-1">
              {[3, 4, 5, 6, 7].map(depth => (
                <button
                  key={depth}
                  onClick={() => setMaxDepth(depth)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    maxDepth === depth 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Toggle Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
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
        {/* Fractal Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total Nodes</span>
            <span className="text-lg font-bold text-violet-400">{analytics.totalNodes}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Connections</span>
            <span className="text-lg font-bold text-cyan-400">{analytics.totalConnections}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Max Depth</span>
            <span className="text-lg font-bold text-emerald-400">{analytics.maxDepth}</span>
          </div>
        </motion.div>
        
        {/* Hierarchy Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Branch Factor</span>
            <span className="text-lg font-bold text-amber-400">{analytics.branchingFactor.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Leaf Nodes</span>
            <span className="text-lg font-bold text-pink-400">{analytics.leafNodes}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Avg Confidence</span>
            <span className="text-lg font-bold text-purple-400">{analytics.avgConfidence.toFixed(1)}</span>
          </div>
        </motion.div>
        
        {/* Fractal Insights */}
        {fractalInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Fractal Insights</div>
            <div className="space-y-2">
              {fractalInsights.slice(0, 3).map((insight, i) => (
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
            onClick={exportFractal}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportFractalData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Empty State */}
      {analytics.totalNodes === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ 
                rotate: [0, 360]
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🔮
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your knowledge fractal is empty</p>
            <p className="text-white/30 text-xs">Add knowledge entries to build your fractal structure</p>
          </div>
        </div>
      )}
    </div>
  )
}
