'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Filter, Download, ZoomIn, ZoomOut, Maximize2, Network, Brain, Zap, Activity, Target, Heart, X, ChevronDown, ChevronUp, Info, GitBranch, AlertTriangle, TrendingUp, BarChart3, Settings, Play, Pause, RotateCcw } from 'lucide-react'

export default function NeuralNetworkDashboard({ subjects, skills, goals, habits, studyLogs, tasks }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [networkData, setNetworkData] = useState({ nodes: [], connections: [], clusters: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingNode, setIsDraggingNode] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [networkHealth, setNetworkHealth] = useState(null)
  const [viewMode, setViewMode] = useState('standard') // standard, cluster, hierarchy, activity
  const [connectionMode, setConnectionMode] = useState('all') // all, strong, weak
  const [animationSpeed, setAnimationSpeed] = useState('normal')
  const [showLabels, setShowLabels] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [autoLayout, setAutoLayout] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const [aiInsights, setAiInsights] = useState([])
  const [networkTopology, setNetworkTopology] = useState(null)
  const [pathResults, setPathResults] = useState([])
  const [showPathFinding, setShowPathFinding] = useState(false)
  const [sourceNode, setSourceNode] = useState(null)
  const [targetNode, setTargetNode] = useState(null)
  
  // Advanced network processing with force-directed layout
  useEffect(() => {
    const processNetwork = () => {
      const nodes = []
      const connections = []
      
      // Process subjects with detailed metrics
      subjects?.forEach((subject, i) => {
        const relatedSkills = skills?.filter(s => 
          s.title?.toLowerCase().includes(subject.name.toLowerCase()) ||
          subject.name.toLowerCase().includes(s.title?.toLowerCase())
        ) || []
        
        nodes.push({
          id: `subject-${subject.name}`,
          label: subject.name,
          type: 'subject',
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          vx: 0,
          vy: 0,
          size: 6 + (subject.hours || 0) * 0.3,
          activity: subject.hours || 0,
          color: '#22d3ee',
          connections: [],
          metadata: {
            hours: subject.hours,
            efficiency: calculateSubjectEfficiency(subject),
            relatedSkills: relatedSkills.length,
            lastActive: subject.lastActive,
            difficulty: subject.difficulty || 'medium'
          }
        })
      })
      
      // Process skills with confidence levels
      skills?.forEach((skill, i) => {
        const relatedSubjects = subjects?.filter(s => 
          s.name.toLowerCase().includes(skill.title?.toLowerCase()) ||
          skill.title?.toLowerCase().includes(s.name.toLowerCase())
        ) || []
        
        nodes.push({
          id: `skill-${skill.id}`,
          label: skill.title,
          type: 'skill',
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          vx: 0,
          vy: 0,
          size: 5 + (skill.confidence || 0) * 0.4,
          activity: skill.confidence || 0,
          color: '#34d399',
          connections: [],
          metadata: {
            confidence: skill.confidence,
            category: skill.category,
            relatedSubjects: relatedSubjects.length,
            practiceCount: skill.practiceCount || 0,
            lastPracticed: skill.lastPracticed
          }
        })
      })
      
      // Process goals with progress tracking
      goals?.forEach((goal, i) => {
        const relatedHabits = habits?.filter(h => 
          h.category === goal.category ||
          h.name.toLowerCase().includes(goal.title.toLowerCase())
        ) || []
        
        nodes.push({
          id: `goal-${goal.id}`,
          label: goal.title,
          type: 'goal',
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          vx: 0,
          vy: 0,
          size: 5 + (goal.progress || 0) * 0.05,
          activity: goal.progress || 0,
          color: '#fbbf24',
          connections: [],
          metadata: {
            progress: goal.progress,
            category: goal.category,
            difficulty: goal.difficulty,
            relatedHabits: relatedHabits.length,
            deadline: goal.deadline,
            milestones: goal.milestones || []
          }
        })
      })
      
      // Process habits with streak data
      habits?.forEach((habit, i) => {
        const relatedGoals = goals?.filter(g => 
          g.category === habit.category ||
          habit.name.toLowerCase().includes(g.title.toLowerCase())
        ) || []
        
        nodes.push({
          id: `habit-${habit.id}`,
          label: habit.name,
          type: 'habit',
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          vx: 0,
          vy: 0,
          size: 4 + (habit.streak || 0) * 0.3,
          activity: habit.streak || 0,
          color: '#f472b6',
          connections: [],
          metadata: {
            streak: habit.streak,
            consistency: calculateHabitConsistency(habit),
            frequency: habit.frequency,
            category: habit.category,
            relatedGoals: relatedGoals.length,
            bestStreak: habit.bestStreak || habit.streak
          }
        })
      })
      
      // Generate intelligent connections based on relationships
      generateSmartConnections(nodes, connections)
      
      // Apply force-directed layout
      applyForceLayout(nodes, connections)
      
      // Detect network clusters
      const clusters = detectNetworkClusters(nodes, connections)
      
      // Calculate network topology
      const topology = calculateNetworkTopology(nodes, connections)
      
      // Generate AI insights
      const insights = generateAIInsights(nodes, connections, clusters, topology)
      
      // Calculate network health
      const health = calculateNetworkHealth(nodes, connections, topology)
      
      setNetworkData({ nodes, connections, clusters })
      setNetworkTopology(topology)
      setAiInsights(insights)
      setNetworkHealth(health)
      
      // Calculate advanced analytics
      const analyticsData = calculateAdvancedAnalytics(nodes, connections, clusters, topology)
      setAnalytics(analyticsData)
    }
    
    processNetwork()
  }, [subjects, skills, goals, habits, studyLogs, tasks])
  
  // Helper functions for advanced calculations
  const calculateSubjectEfficiency = (subject) => {
    if (!subject.hours) return 0.5
    const efficiency = Math.min(1, (subject.completedTasks || 0) / (subject.hours * 2))
    return efficiency
  }
  
  const calculateHabitConsistency = (habit) => {
    if (!habit.streak) return 0
    const consistency = Math.min(1, habit.streak / 30)
    return consistency
  }
  
  const generateSmartConnections = (nodes, connections) => {
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i >= j) return
        
        let connectionStrength = 0
        let connectionType = 'weak'
        
        // Strong connections for same type
        if (node.type === otherNode.type) {
          const activityFactor = (node.activity + otherNode.activity) / 20
          connectionStrength = Math.min(1, activityFactor)
          connectionType = 'strong'
        }
        
        // Medium connections for related types
        else if (
          (node.type === 'subject' && otherNode.type === 'skill') ||
          (node.type === 'goal' && otherNode.type === 'habit') ||
          (node.type === 'skill' && otherNode.type === 'goal')
        ) {
          const metadataRelation = (
            (node.metadata.relatedSubjects || 0) + 
            (otherNode.metadata.relatedSkills || 0)
          ) / 10
          connectionStrength = Math.min(0.7, metadataRelation)
          connectionType = 'medium'
        }
        
        // Weak connections for cross-type relationships
        else if (node.metadata.category === otherNode.metadata.category) {
          connectionStrength = 0.3
          connectionType = 'weak'
        }
        
        if (connectionStrength > 0.1) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + 
            Math.pow(node.y - otherNode.y, 2)
          )
          
          if (distance < 50) {
            connections.push({
              from: node.id,
              to: otherNode.id,
              strength: connectionStrength,
              type: connectionType,
              distance,
              metadata: {
                nodeTypes: [node.type, otherNode.type],
                activitySum: node.activity + otherNode.activity
              }
            })
            
            node.connections.push(otherNode.id)
            otherNode.connections.push(node.id)
          }
        }
      })
    })
  }
  
  const applyForceLayout = (nodes, connections) => {
    // Simple force-directed layout algorithm
    const iterations = 50
    const k = 0.1 // spring constant
    const repulsion = 100
    const damping = 0.9
    
    for (let iter = 0; iter < iterations; iter++) {
      // Calculate repulsion forces
      nodes.forEach(node => {
        node.fx = 0
        node.fy = 0
        
        nodes.forEach(otherNode => {
          if (node === otherNode) return
          
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          const force = repulsion / (distance * distance)
          node.fx += (dx / distance) * force
          node.fy += (dy / distance) * force
        })
      })
      
      // Calculate attraction forces along connections
      connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from)
        const toNode = nodes.find(n => n.id === conn.to)
        
        if (fromNode && toNode) {
          const dx = toNode.x - fromNode.x
          const dy = toNode.y - fromNode.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          const force = k * (distance - 30) * conn.strength
          
          fromNode.fx += (dx / distance) * force
          fromNode.fy += (dy / distance) * force
          toNode.fx -= (dx / distance) * force
          toNode.fy -= (dy / distance) * force
        }
      })
      
      // Center gravity
      nodes.forEach(node => {
        const dx = 50 - node.x
        const dy = 50 - node.y
        node.fx += dx * 0.01
        node.fy += dy * 0.01
      })
      
      // Apply forces
      nodes.forEach(node => {
        node.vx = (node.vx + node.fx) * damping
        node.vy = (node.vy + node.fy) * damping
        node.x += node.vx
        node.y += node.vy
        
        // Keep within bounds
        node.x = Math.max(10, Math.min(90, node.x))
        node.y = Math.max(10, Math.min(90, node.y))
      })
    }
  }
  
  const detectNetworkClusters = (nodes, connections) => {
    const clusters = []
    const visited = new Set()
    
    nodes.forEach(node => {
      if (visited.has(node.id)) return
      
      const cluster = [node]
      const queue = [node]
      visited.add(node.id)
      
      while (queue.length > 0) {
        const current = queue.shift()
        current.connections.forEach(connId => {
          const connectedNode = nodes.find(n => n.id === connId)
          if (connectedNode && !visited.has(connectedNode.id)) {
            visited.add(connectedNode.id)
            cluster.push(connectedNode)
            queue.push(connectedNode)
          }
        })
      }
      
      if (cluster.length >= 2) {
        const centerX = cluster.reduce((sum, n) => sum + n.x, 0) / cluster.length
        const centerY = cluster.reduce((sum, n) => sum + n.y, 0) / cluster.length
        const dominantType = cluster.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1
          return acc
        }, {})
        const mainType = Object.entries(dominantType).sort((a, b) => b[1] - a[1])[0][0]
        
        clusters.push({
          id: `cluster-${clusters.length}`,
          name: `${mainType.charAt(0).toUpperCase() + mainType.slice(1)} Cluster`,
          nodes: cluster.map(n => n.id),
          center: { x: centerX, y: centerY },
          nodeCount: cluster.length,
          mainType,
          color: cluster[0].color,
          avgActivity: cluster.reduce((sum, n) => sum + n.activity, 0) / cluster.length
        })
      }
    })
    
    return clusters
  }
  
  const calculateNetworkTopology = (nodes, connections) => {
    const adjacencyList = new Map()
    nodes.forEach(node => {
      adjacencyList.set(node.id, node.connections)
    })
    
    // Calculate degree distribution
    const degrees = nodes.map(n => n.connections.length)
    const avgDegree = degrees.reduce((sum, d) => sum + d, 0) / degrees.length
    const maxDegree = Math.max(...degrees)
    const minDegree = Math.min(...degrees)
    
    // Calculate network density
    const maxPossibleConnections = (nodes.length * (nodes.length - 1)) / 2
    const density = connections.length / maxPossibleConnections
    
    // Calculate clustering coefficient
    let totalClustering = 0
    nodes.forEach(node => {
      const neighbors = node.connections
      if (neighbors.length < 2) return
      
      let possibleTriangles = neighbors.length * (neighbors.length - 1) / 2
      let actualTriangles = 0
      
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          const neighbor1 = nodes.find(n => n.id === neighbors[i])
          const neighbor2 = nodes.find(n => n.id === neighbors[j])
          
          if (neighbor1 && neighbor2 && neighbor1.connections.includes(neighbors[j])) {
            actualTriangles++
          }
        }
      }
      
      totalClustering += possibleTriangles > 0 ? actualTriangles / possibleTriangles : 0
    })
    
    const clusteringCoefficient = nodes.length > 0 ? totalClustering / nodes.length : 0
    
    // Calculate path lengths (simplified)
    const avgPathLength = calculateAveragePathLength(nodes, connections)
    
    // Calculate centrality measures
    const centrality = calculateCentrality(nodes, connections)
    
    return {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      avgDegree,
      maxDegree,
      minDegree,
      density,
      clusteringCoefficient,
      avgPathLength,
      centrality,
      isScaleFree: maxDegree > avgDegree * 2,
      isSmallWorld: clusteringCoefficient > 0.3 && avgPathLength < Math.log(nodes.length)
    }
  }
  
  const calculateAveragePathLength = (nodes, connections) => {
    if (nodes.length < 2) return 0
    
    let totalPathLength = 0
    let pathCount = 0
    
    // Sample some node pairs for efficiency
    const sampleSize = Math.min(10, nodes.length)
    for (let i = 0; i < sampleSize; i++) {
      for (let j = i + 1; j < sampleSize; j++) {
        const pathLength = findShortestPath(nodes[i], nodes[j], nodes, connections)
        if (pathLength > 0) {
          totalPathLength += pathLength
          pathCount++
        }
      }
    }
    
    return pathCount > 0 ? totalPathLength / pathCount : 0
  }
  
  const findShortestPath = (startNode, endNode, nodes, connections) => {
    if (startNode.id === endNode.id) return 0
    
    const queue = [{ node: startNode, path: [startNode.id] }]
    const visited = new Set([startNode.id])
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()
      
      if (node.id === endNode.id) {
        return path.length - 1
      }
      
      node.connections.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          const neighborNode = nodes.find(n => n.id === neighborId)
          if (neighborNode) {
            queue.push({ node: neighborNode, path: [...path, neighborId] })
          }
        }
      })
    }
    
    return -1 // No path found
  }
  
  const calculateCentrality = (nodes, connections) => {
    const degreeCentrality = {}
    const betweennessCentrality = {}
    
    nodes.forEach(node => {
      degreeCentrality[node.id] = node.connections.length
      betweennessCentrality[node.id] = 0
    })
    
    // Calculate betweenness centrality
    nodes.forEach(source => {
      nodes.forEach(target => {
        if (source.id === target.id) return
        
        const path = findPathNodes(source, target, nodes)
        if (path) {
          path.forEach(node => {
            if (node.id !== source.id && node.id !== target.id) {
              betweennessCentrality[node.id] = (betweennessCentrality[node.id] || 0) + 1
            }
          })
        }
      })
    })
    
    // Normalize betweenness
    const maxBetweenness = Math.max(...Object.values(betweennessCentrality), 1)
    Object.keys(betweennessCentrality).forEach(id => {
      betweennessCentrality[id] /= maxBetweenness
    })
    
    return { degreeCentrality, betweennessCentrality }
  }
  
  const findPathNodes = (source, target, nodes) => {
    const queue = [{ node: source, path: [source] }]
    const visited = new Set([source.id])
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()
      
      if (node.id === target.id) {
        return path
      }
      
      node.connections.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          const neighborNode = nodes.find(n => n.id === neighborId)
          if (neighborNode) {
            queue.push({ node: neighborNode, path: [...path, neighborNode] })
          }
        }
      })
    }
    
    return null
  }
  
  const generateAIInsights = (nodes, connections, clusters, topology) => {
    const insights = []
    
    // Network structure insights
    if (topology.isScaleFree) {
      insights.push({
        type: 'structure',
        icon: Network,
        title: 'Scale-Free Network Detected',
        description: 'Your neural network follows a power-law distribution, indicating a few highly connected hub nodes.',
        severity: 'info'
      })
    }
    
    if (topology.isSmallWorld) {
      insights.push({
        type: 'structure',
        icon: Zap,
        title: 'Small-World Network',
        description: 'High clustering with short path lengths - optimal for information flow and learning efficiency.',
        severity: 'success'
      })
    }
    
    // Activity insights
    const lowActivityNodes = nodes.filter(n => n.activity < 0.3)
    if (lowActivityNodes.length > 0) {
      insights.push({
        type: 'activity',
        icon: AlertTriangle,
        title: 'Underutilized Nodes',
        description: `${lowActivityNodes.length} nodes have low activity. Consider strengthening these connections.`,
        severity: 'warning'
      })
    }
    
    // Cluster insights
    if (clusters.length > 1) {
      insights.push({
        type: 'cluster',
        icon: GitBranch,
        title: 'Network Clusters',
        description: `Your network has ${clusters.length} distinct clusters. Consider bridging them for better integration.`,
        severity: 'info'
      })
    }
    
    // Connection insights
    const weakConnections = connections.filter(c => c.strength < 0.3)
    if (weakConnections.length > connections.length * 0.5) {
      insights.push({
        type: 'connection',
        icon: TrendingUp,
        title: 'Weak Connections',
        description: 'Many connections are weak. Focus on strengthening key relationships.',
        severity: 'warning'
      })
    }
    
    // Health insights
    if (topology.density < 0.1) {
      insights.push({
        type: 'health',
        icon: Activity,
        title: 'Low Network Density',
        description: 'Consider adding more connections between related concepts.',
        severity: 'warning'
      })
    }
    
    return insights
  }
  
  const calculateNetworkHealth = (nodes, connections, topology) => {
    const activityScore = nodes.reduce((sum, n) => sum + n.activity, 0) / nodes.length
    const connectionScore = topology.density
    const clusterScore = topology.clusteringCoefficient
    const diversityScore = new Set(nodes.map(n => n.type)).size / 4
    
    const overallHealth = (activityScore * 0.3 + connectionScore * 0.3 + clusterScore * 0.2 + diversityScore * 0.2) * 100
    
    return {
      overall: Math.round(overallHealth),
      activity: Math.round(activityScore * 100),
      connectivity: Math.round(connectionScore * 100),
      clustering: Math.round(clusterScore * 100),
      diversity: Math.round(diversityScore * 100),
      status: overallHealth > 70 ? 'healthy' : overallHealth > 40 ? 'moderate' : 'needs-attention'
    }
  }
  
  const calculateAdvancedAnalytics = (nodes, connections, clusters, topology) => {
    const typeStats = {}
    nodes.forEach(node => {
      if (!typeStats[node.type]) {
        typeStats[node.type] = { count: 0, totalActivity: 0, avgSize: 0 }
      }
      typeStats[node.type].count++
      typeStats[node.type].totalActivity += node.activity
    })
    
    Object.keys(typeStats).forEach(type => {
      typeStats[type].avgActivity = typeStats[type].totalActivity / typeStats[type].count
    })
    
    const connectionStats = {
      total: connections.length,
      strong: connections.filter(c => c.type === 'strong').length,
      medium: connections.filter(c => c.type === 'medium').length,
      weak: connections.filter(c => c.type === 'weak').length,
      avgStrength: connections.reduce((sum, c) => sum + c.strength, 0) / connections.length
    }
    
    return {
      typeStats,
      connectionStats,
      topology,
      clusterCount: clusters.length,
      mostConnectedNode: nodes.reduce((max, n) => n.connections.length > max.connections.length ? n : max, nodes[0]),
      mostActiveNode: nodes.reduce((max, n) => n.activity > max.activity ? n : max, nodes[0])
    }
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
      
      // Draw neural network background
      drawNeuralBackground(ctx, width, height, time)
      
      // Draw network clusters
      if (viewMode === 'cluster') {
        drawNetworkClusters(ctx, width, height, networkData.clusters, time)
      }
      
      // Filter connections based on mode
      const filteredConnections = filterConnections(networkData.connections)
      
      // Draw connections with advanced effects
      if (showConnections) {
        drawAdvancedConnections(ctx, width, height, filteredConnections, time)
      }
      
      // Draw path finding results
      if (showPathFinding && pathResults.length > 0) {
        drawPathResults(ctx, width, height, pathResults, time)
      }
      
      // Draw nodes with advanced rendering
      drawAdvancedNodes(ctx, width, height, networkData.nodes, time)
      
      // Draw labels if enabled
      if (showLabels) {
        drawNodeLabels(ctx, width, height, networkData.nodes)
      }
      
      // Draw selection highlights
      if (selectedNode) {
        drawNodeSelection(ctx, width, height, selectedNode, time)
      }
      
      // Draw hover effect
      if (hoveredNode) {
        drawNodeHover(ctx, width, height, hoveredNode, time)
      }
      
      ctx.restore()
      
      time += 0.016 * speed
      animationFrame = requestAnimationFrame(render)
    }
    
    render()
    
    return () => cancelAnimationFrame(animationFrame)
  }, [networkData, zoom, pan, filterType, searchQuery, viewMode, connectionMode, animationSpeed, showLabels, showConnections, selectedNode, hoveredNode, pathResults, showPathFinding])
  
  const drawNeuralBackground = (ctx, width, height, time) => {
    // Neural network grid pattern
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)'
    ctx.lineWidth = 1
    
    const gridSize = 40
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Animated neural pulses
    const pulseCount = 5
    for (let i = 0; i < pulseCount; i++) {
      const x = (time * 0.05 + i * 200) % width
      const y = (time * 0.03 + i * 150) % height
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30)
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.1)')
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 30, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const drawNetworkClusters = (ctx, width, height, clusters, time) => {
    clusters.forEach(cluster => {
      const centerX = cluster.center.x / 100 * width
      const centerY = cluster.center.y / 100 * height
      
      // Cluster boundary
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60)
      gradient.addColorStop(0, `${cluster.color}15`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
      ctx.fill()
      
      // Cluster label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(cluster.name, centerX, centerY - 70)
    })
  }
  
  const drawAdvancedConnections = (ctx, width, height, connections, time) => {
    connections.forEach(conn => {
      const fromNode = networkData.nodes.find(n => n.id === conn.from)
      const toNode = networkData.nodes.find(n => n.id === conn.to)
      
      if (!fromNode || !toNode) return
      
      const fromX = fromNode.x / 100 * width
      const fromY = fromNode.y / 100 * height
      const toX = toNode.x / 100 * width
      const toY = toNode.y / 100 * height
      
      // Connection style based on type
      const isSelected = selectedConnection && 
        ((selectedConnection.from === conn.from && selectedConnection.to === conn.to) ||
         (selectedConnection.from === conn.to && selectedConnection.to === conn.from))
      
      const baseOpacity = conn.strength * 0.4
      const pulse = Math.sin(time * 0.003 + conn.strength * 10) * 0.5 + 0.5
      const opacity = isSelected ? 0.8 : baseOpacity * pulse
      
      // Draw connection line
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      
      if (conn.type === 'strong') {
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`
        ctx.lineWidth = 3
      } else if (conn.type === 'medium') {
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
        ctx.lineWidth = 2
      } else {
        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`
        ctx.lineWidth = 1
      }
      
      ctx.stroke()
      
      // Draw moving particle along connection
      const particleProgress = (time * 0.001 + conn.strength) % 1
      const particleX = fromX + (toX - fromX) * particleProgress
      const particleY = fromY + (toY - fromY) * particleProgress
      
      ctx.beginPath()
      ctx.arc(particleX, particleY, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + pulse * 0.2})`
      ctx.fill()
      
      // Connection glow for strong connections
      if (conn.type === 'strong') {
        const midX = (fromX + toX) / 2
        const midY = (fromY + toY) / 2
        
        const glowGradient = ctx.createRadialGradient(midX, midY, 0, midX, midY, 15)
        glowGradient.addColorStop(0, 'rgba(34, 211, 238, 0.2)')
        glowGradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(midX, midY, 15, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }
  
  const drawPathResults = (ctx, width, height, pathResults, time) => {
    pathResults.forEach((path, index) => {
      ctx.beginPath()
      path.forEach((nodeId, i) => {
        const node = networkData.nodes.find(n => n.id === nodeId)
        if (!node) return
        
        const x = node.x / 100 * width
        const y = node.y / 100 * height
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 - index * 0.1})`
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw path nodes
      path.forEach(nodeId => {
        const node = networkData.nodes.find(n => n.id === nodeId)
        if (!node) return
        
        const x = node.x / 100 * width
        const y = node.y / 100 * height
        
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#fbbf24'
        ctx.fill()
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    })
  }
  
  const drawAdvancedNodes = (ctx, width, height, nodes, time) => {
    nodes.forEach(node => {
      const x = node.x / 100 * width
      const y = node.y / 100 * height
      
      // Floating animation
      const floatY = Math.sin(time * 0.02 + node.x) * 2
      const floatX = Math.cos(time * 0.015 + node.y) * 2
      
      // Multi-layer glow effect
      const layers = [
        { radius: node.size * 5, color: node.color, opacity: 0.05 },
        { radius: node.size * 4, color: node.color, opacity: 0.1 },
        { radius: node.size * 3, color: node.color, opacity: 0.2 },
        { radius: node.size * 2, color: node.color, opacity: 0.4 }
      ]
      
      layers.forEach(layer => {
        const gradient = ctx.createRadialGradient(
          x + floatX, y + floatY, 0,
          x + floatX, y + floatY, layer.radius
        )
        gradient.addColorStop(0, `${layer.color}${Math.floor(layer.opacity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x + floatX, y + floatY, layer.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      // Activity pulse ring
      const pulseRadius = node.size + node.activity * 2
      const pulse = Math.sin(time * 0.003 + node.x) * 0.5 + 0.5
      
      const activityGradient = ctx.createRadialGradient(
        x + floatX, y + floatY, node.size,
        x + floatX, y + floatY, pulseRadius * pulse
      )
      activityGradient.addColorStop(0, `${node.color}60`)
      activityGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(x + floatX, y + floatY, pulseRadius * pulse, 0, Math.PI * 2)
      ctx.fillStyle = activityGradient
      ctx.fill()
      
      // Core node
      ctx.beginPath()
      ctx.arc(x + floatX, y + floatY, node.size, 0, Math.PI * 2)
      ctx.fillStyle = node.color
      ctx.fill()
      
      // Node icon based on type
      drawNodeIcon(ctx, x + floatX, y + floatY, node.type, node.size)
      
      // Connection count indicator
      if (node.connections.length > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.font = '8px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(node.connections.length, x + floatX, y + floatY + node.size + 5)
      }
    })
  }
  
  const drawNodeIcon = (ctx, x, y, type, size) => {
    ctx.fillStyle = 'white'
    ctx.font = `${size}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const icons = {
      subject: '📚',
      skill: '🎯',
      goal: '🏆',
      habit: '🔄'
    }
    
    ctx.fillText(icons[type] || '•', x, y)
  }
  
  const drawNodeLabels = (ctx, width, height, nodes) => {
    const importantNodes = nodes.filter(n => n.size > 5 || n.activity > 0.5)
    
    importantNodes.forEach(node => {
      const x = node.x / 100 * width
      const y = node.y / 100 * height
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(node.label.substring(0, 15), x, y - node.size - 8)
    })
  }
  
  const drawNodeSelection = (ctx, width, height, node, time) => {
    const x = node.x / 100 * width
    const y = node.y / 100 * height
    
    // Pulsing selection ring
    const pulse = Math.sin(time * 0.005) * 0.5 + 0.5
    const radius = node.size * 4 + pulse * 10
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.3})`
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Selection glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5)
    gradient.addColorStop(0, `${node.color}60`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
  
  const drawNodeHover = (ctx, width, height, node, time) => {
    const x = node.x / 100 * width
    const y = node.y / 100 * height
    
    // Hover glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, node.size * 6)
    gradient.addColorStop(0, `${node.color}80`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(x, y, node.size * 6, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
  
  const filterConnections = (connections) => {
    if (connectionMode === 'all') return connections
    if (connectionMode === 'strong') return connections.filter(c => c.type === 'strong')
    if (connectionMode === 'weak') return connections.filter(c => c.type === 'weak')
    return connections
  }
  
  // Mouse interaction handlers
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Check if clicking on a node
    const width = canvas.width
    const height = canvas.height
    
    const transformedX = (x - width / 2 - pan.x) / zoom + width / 2
    const transformedY = (y - height / 2 - pan.y) / zoom + height / 2
    
    let clickedNode = null
    for (const node of networkData.nodes) {
      const nodeX = node.x / 100 * width
      const nodeY = node.y / 100 * height
      const distance = Math.sqrt(Math.pow(transformedX - nodeX, 2) + Math.pow(transformedY - nodeY, 2))
      
      if (distance < node.size * 2) {
        clickedNode = node
        break
      }
    }
    
    if (clickedNode) {
      setIsDraggingNode(true)
      setDragStart({ x: e.clientX, y: e.clientY, nodeX: clickedNode.x, nodeY: clickedNode.y })
      setSelectedNode(clickedNode)
    } else {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan, zoom, networkData.nodes])
  
  const handleMouseMove = useCallback((e) => {
    if (isDraggingNode && selectedNode) {
      const dx = (e.clientX - dragStart.x) / zoom
      const dy = (e.clientY - dragStart.y) / zoom
      
      const updatedNodes = networkData.nodes.map(node => 
        node.id === selectedNode.id 
          ? { ...node, x: Math.max(5, Math.min(95, dragStart.nodeX + dx / 5)), y: Math.max(5, Math.min(95, dragStart.nodeY + dy / 5)) }
          : node
      )
      
      setNetworkData(prev => ({ ...prev, nodes: updatedNodes }))
    } else if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
    
    // Check for node hover
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
    for (const node of networkData.nodes) {
      const nodeX = node.x / 100 * width
      const nodeY = node.y / 100 * height
      const distance = Math.sqrt(Math.pow(transformedX - nodeX, 2) + Math.pow(transformedY - nodeY, 2))
      
      if (distance < node.size * 2) {
        found = node
        break
      }
    }
    
    setHoveredNode(found)
  }, [isDraggingNode, isDragging, dragStart, pan, zoom, networkData.nodes, selectedNode])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsDraggingNode(false)
  }, [])
  
  const handleClick = useCallback((e) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode)
      setShowDetails(true)
    } else {
      setSelectedNode(null)
      setShowDetails(false)
    }
  }, [hoveredNode])
  
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }, [])
  
  // Path finding functionality
  const findPath = () => {
    if (!sourceNode || !targetNode) return
    
    const path = findPathNodes(sourceNode, targetNode, networkData.nodes)
    if (path) {
      setPathResults([path.map(n => n.id)])
    } else {
      setPathResults([])
    }
  }
  
  // Auto layout functionality
  const applyAutoLayout = () => {
    const updatedNodes = [...networkData.nodes]
    applyForceLayout(updatedNodes, networkData.connections)
    setNetworkData(prev => ({ ...prev, nodes: updatedNodes }))
  }
  
  // Export functionality
  const exportNetwork = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'neural-network.png'
    link.href = canvas.toDataURL()
    link.click()
  }
  
  const exportNetworkData = () => {
    const data = {
      nodes: networkData.nodes,
      connections: networkData.connections,
      clusters: networkData.clusters,
      topology: networkTopology,
      analytics: analytics,
      health: networkHealth,
      insights: aiInsights,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'neural-network.json'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading neural network...</p>
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
              placeholder="Search nodes..."
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
              <option value="subject">Subjects</option>
              <option value="skill">Skills</option>
              <option value="goal">Goals</option>
              <option value="habit">Habits</option>
            </select>
            
            <select
              value={connectionMode}
              onChange={(e) => setConnectionMode(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="all">All Links</option>
              <option value="strong">Strong</option>
              <option value="weak">Weak</option>
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
              {['standard', 'cluster', 'hierarchy', 'activity'].map(mode => (
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
            <span className="text-xs text-white/60">Auto Layout</span>
            <button
              onClick={applyAutoLayout}
              className="w-10 h-5 rounded-full transition-all bg-white/10 hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 text-white/60 mx-auto" />
            </button>
          </div>
        </motion.div>
        
        {/* Path Finding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Path Finding</span>
            <button
              onClick={() => setShowPathFinding(!showPathFinding)}
              className={`w-10 h-5 rounded-full transition-all ${
                showPathFinding ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                showPathFinding ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          {showPathFinding && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setSourceNode(selectedNode)}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs transition-all ${
                    sourceNode ? 'bg-violet-500/20 text-violet-400' : 'bg-black/40 text-white/60'
                  }`}
                >
                  {sourceNode ? 'Source ✓' : 'Set Source'}
                </button>
                <button
                  onClick={() => setTargetNode(selectedNode)}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs transition-all ${
                    targetNode ? 'bg-violet-500/20 text-violet-400' : 'bg-black/40 text-white/60'
                  }`}
                >
                  {targetNode ? 'Target ✓' : 'Set Target'}
                </button>
              </div>
              
              <button
                onClick={findPath}
                disabled={!sourceNode || !targetNode}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Find Path
              </button>
            </div>
          )}
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
        {/* Network Health */}
        {networkHealth && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">Network Health</div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Overall</span>
              <span className={`text-sm font-bold ${
                networkHealth.status === 'healthy' ? 'text-emerald-400' : 
                networkHealth.status === 'moderate' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {networkHealth.overall}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${networkHealth.overall}%` }}
                className={`h-full rounded-full ${
                  networkHealth.status === 'healthy' ? 'bg-emerald-500' : 
                  networkHealth.status === 'moderate' ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </motion.div>
        )}
        
        {/* Node Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Total Nodes</span>
            <span className="text-lg font-bold text-violet-400">{networkData.nodes.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Connections</span>
            <span className="text-lg font-bold text-cyan-400">{networkData.connections.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Clusters</span>
            <span className="text-lg font-bold text-emerald-400">{networkData.clusters.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 font-medium">Density</span>
            <span className="text-lg font-bold text-amber-400">{(networkTopology?.density * 100).toFixed(0)}%</span>
          </div>
        </motion.div>
        
        {/* Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-3"
        >
          <div className="text-xs text-white/60 font-medium mb-2">Type Distribution</div>
          <div className="space-y-1">
            {Object.entries(analytics.typeStats).map(([type, stats]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-white/40 capitalize">{type}</span>
                <span className="text-xs text-white font-medium">{stats.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-3"
          >
            <div className="text-xs text-white/60 font-medium mb-2">AI Insights</div>
            <div className="space-y-2">
              {aiInsights.slice(0, 3).map((insight, i) => (
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
            onClick={exportNetwork}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Image</span>
          </button>
          
          <button
            onClick={exportNetworkData}
            className="flex-1 glass-card p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60">Data</span>
          </button>
        </motion.div>
      </div>
      
      {/* Node Details Panel */}
      {selectedNode && showDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-xl p-4 max-w-md w-full mx-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: selectedNode.color }} />
                <span className="text-sm font-bold text-white capitalize">{selectedNode.type}</span>
              </div>
              <p className="text-xs text-white/60">{selectedNode.label}</p>
            </div>
            <button
              onClick={() => {
                setSelectedNode(null)
                setShowDetails(false)
              }}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Activity:</span>
              <span className="text-white ml-1">{selectedNode.activity.toFixed(1)}</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Connections:</span>
              <span className="text-white ml-1">{selectedNode.connections.length}</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Size:</span>
              <span className="text-white ml-1">{selectedNode.size.toFixed(1)}</span>
            </div>
            <div className="bg-black/40 rounded-lg p-2">
              <span className="text-white/40">Centrality:</span>
              <span className="text-white ml-1">{(networkTopology?.centrality?.degreeCentrality?.[selectedNode.id] * 100 || 0).toFixed(0)}%</span>
            </div>
          </div>
          
          {selectedNode.metadata && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs text-white/40 mb-2">Metadata</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedNode.metadata).map(([key, value]) => (
                  <div key={key} className="bg-black/30 rounded-lg p-2">
                    <span className="text-white/40 capitalize">{key}:</span>
                    <span className="text-white ml-1">{typeof value === 'number' ? value.toFixed(1) : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Empty State */}
      {networkData.nodes.length === 0 && (
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
              🧠
            </motion.div>
            <p className="text-white/40 text-sm mb-2">Your neural network is empty</p>
            <p className="text-white/30 text-xs">Add subjects, skills, goals, and habits to build your network</p>
          </div>
        </div>
      )}
      
      {/* Hover Tooltip */}
      {hoveredNode && !selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-none glass-card rounded-lg px-3 py-2 z-50"
          style={{
            left: hoveredNode.x / 100 * containerRef.current?.clientWidth || 0 + 20,
            top: hoveredNode.y / 100 * containerRef.current?.clientHeight || 0 - 20
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: hoveredNode.color }} />
            <span className="text-xs text-white capitalize">{hoveredNode.type}</span>
          </div>
          <p className="text-xs text-white/60 mt-1">{hoveredNode.label}</p>
          <div className="text-[10px] text-white/40 mt-1">
            {hoveredNode.connections.length} connections • {hoveredNode.activity.toFixed(1)} activity
          </div>
        </motion.div>
      )}
    </div>
  )
}
