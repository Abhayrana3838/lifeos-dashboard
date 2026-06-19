import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

let client = null
let _db = null

async function getClient() {
  if (!client) {
    const mongoUrl = process.env.MONGO_URL
    if (!mongoUrl) {
      throw new Error('MONGO_URL environment variable is not set')
    }
    client = new MongoClient(mongoUrl, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }
  return client
}

async function db() {
  if (_db) return _db
  try {
    const mongoClient = await getClient()
    await mongoClient.connect()
    _db = mongoClient.db(process.env.DB_NAME || 'lifeos')
    return _db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

const ok  = (data, status = 200) => NextResponse.json(data, { status })
const err = (message, status = 400) => NextResponse.json({ error: message }, { status })

const today   = () => new Date().toISOString().slice(0, 10)
const dateKey = (d) => new Date(d).toISOString().slice(0, 10)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ── Authentication Helpers ───────────────────────────────────
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

async function getUserFromToken(token) {
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded) return null
  const d = await db()
  const user = await d.collection('users').findOne({ id: decoded.userId }, { projection: { _id: 0, password: 0 } })
  return user
}

// ── Collection Helpers ────────────────────────────────────
async function list(coll, filter = {}, sort = { createdAt: -1 }) {
  const d = await db()
  return d.collection(coll).find(filter, { projection: { _id: 0 } }).sort(sort).limit(1000).toArray()
}
async function insert(coll, doc, userId) {
  const d = await db()
  const item = { id: uuid(), userId, createdAt: new Date().toISOString(), ...doc }
  await d.collection(coll).insertOne(item)
  const { _id, ...rest } = item
  return rest
}
async function update(coll, id, patch, userId) {
  const d = await db()
  await d.collection(coll).updateOne({ id, userId }, { $set: patch })
  return d.collection(coll).findOne({ id, userId }, { projection: { _id: 0 } })
}
async function remove(coll, id, userId) {
  const d = await db()
  await d.collection(coll).deleteOne({ id, userId })
  return { ok: true }
}

// ── Stats Aggregator ──────────────────────────────────────
async function getStats(userId) {
  const d = await db()
  const t = today()
  const last7 = [...Array(7)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (6 - i)); return dt.toISOString().slice(0,10)
  })
  const last30 = [...Array(30)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (29 - i)); return dt.toISOString().slice(0,10)
  })

  const [studyLogs, habits, habitLogs, tasks, goals, journals, health, meditations] = await Promise.all([
    d.collection('study_logs').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('habits').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('habit_logs').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('tasks').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('goals').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('journal').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('health').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('meditations').find({ userId }, { projection: { _id: 0 } }).toArray(),
  ])

  const todayStudy     = studyLogs.filter(s => s.date === t).reduce((a,b) => a + Number(b.hours||0), 0)
  const todayTasks     = tasks.filter(x => x.status === 'done' && dateKey(x.completedAt || x.createdAt) === t).length
  const totalTasksToday = tasks.filter(x => dateKey(x.dueDate || x.createdAt) === t).length
  const todayHabits    = habitLogs.filter(h => h.date === t).length
  const totalHabits    = habits.length

  const weeklyStudy = last7.map(date => ({
    date,
    label: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
    hours: +(studyLogs.filter(s => s.date === date).reduce((a,b) => a + Number(b.hours||0), 0)).toFixed(2),
    tasks: tasks.filter(x => x.status === 'done' && dateKey(x.completedAt || x.createdAt) === date).length,
    habits: habitLogs.filter(h => h.date === date).length,
  }))
  const monthlyStudy = last30.map(date => ({
    date, label: new Date(date).getDate().toString(),
    hours: +(studyLogs.filter(s => s.date === date).reduce((a,b) => a + Number(b.hours||0), 0)).toFixed(2),
  }))

  let streak = 0
  for (let i = 0; i < 365; i++) {
    const dt = new Date(); dt.setDate(dt.getDate() - i)
    const k = dt.toISOString().slice(0,10)
    const has = studyLogs.some(s => s.date === k) || habitLogs.some(h => h.date === k) || tasks.some(x => x.status === 'done' && dateKey(x.completedAt || x.createdAt) === k)
    if (has) streak++
    else if (i > 0) break
    else break
  }
  if (streak === 0) {
    for (let i = 1; i < 365; i++) {
      const dt = new Date(); dt.setDate(dt.getDate() - i)
      const k = dt.toISOString().slice(0,10)
      const has = studyLogs.some(s => s.date === k) || habitLogs.some(h => h.date === k) || tasks.some(x => x.status === 'done' && dateKey(x.completedAt || x.createdAt) === k)
      if (has) streak++
      else break
    }
  }

  const bySubject = {}
  studyLogs.forEach(s => { bySubject[s.subject] = (bySubject[s.subject] || 0) + Number(s.hours||0) })
  const subjectData = Object.entries(bySubject).map(([name, hours]) => ({ name, hours: +hours.toFixed(2) })).sort((a,b) => b.hours - a.hours)

  const subjectStrength = {}
  studyLogs.forEach(s => {
    if (!subjectStrength[s.subject]) subjectStrength[s.subject] = { total: 0, count: 0 }
    subjectStrength[s.subject].total += Number(s.understanding || 3)
    subjectStrength[s.subject].count += 1
  })
  const strengths = Object.entries(subjectStrength).map(([name, v]) => ({ name, score: +(v.total / v.count).toFixed(2) }))

  const goalProgress = goals.length ? Math.round(goals.reduce((a,b) => a + (b.progress||0), 0) / goals.length) : 0

  const habit7 = last7.map(date => {
    const completed = habitLogs.filter(h => h.date === date).length
    return { label: new Date(date).toLocaleDateString('en', { weekday: 'short' }), date, completed, total: totalHabits, percent: totalHabits ? Math.round(completed * 100 / totalHabits) : 0 }
  })

  // ── Solo Leveling Hunter XP & Rank Calculation Engine ──
  // Base daily target is 3 hours study.
  // Standard gold target: cumulative effort of ~1 year of standard days.
  // Super multiplier: working 16 hours a day gets a massive boost (16h a day allows you to do 1 year's worth in 1 month).
  // Total target hours for 1 year @ 3h/day = 1095 hours.
  // If working 16h/day, to hit 1095 equivalent in 30 days, we need 36.5x XP multiplier for that work!
  // Let's build a clean progression formula.
  let rawXp = 0
  let totalHours = 0
  
  studyLogs.forEach(s => {
    const hrs = Number(s.hours || 0)
    totalHours += hrs
    if (hrs >= 16) {
      // 16h extreme speed multiplier
      rawXp += hrs * 100 * 36.5
    } else if (hrs >= 8) {
      rawXp += hrs * 100 * 5 // High-tier multiplier
    } else {
      rawXp += hrs * 100 // Standard
    }
  })

  // Add tasks, habits, and meditations to XP
  const tasksDone = tasks.filter(x => x.status === 'done').length
  rawXp += tasksDone * 150
  rawXp += habitLogs.length * 50
  
  const totalMeditationMinutes = meditations.reduce((a, b) => a + Number(b.duration || 0), 0)
  rawXp += totalMeditationMinutes * 10 // 10 XP per minute of meditation

  // Mind Sharpness Calculation with Decay (decrement if discontinuous)
  // Base mind sharpness = 100. For each day of absence in last 14 days, subtract 10.
  let mindSharpness = 100
  const checkDays = [...Array(14)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - i); return dt.toISOString().slice(0,10)
  })
  let missingDays = 0
  checkDays.forEach(day => {
    const activeOnDay = studyLogs.some(s => s.date === day) || 
                        habitLogs.some(h => h.date === day) || 
                        tasks.some(x => x.status === 'done' && dateKey(x.completedAt || x.createdAt) === day) ||
                        meditations.some(m => m.date === day)
    if (!activeOnDay) {
      missingDays++
    }
  })
  mindSharpness = Math.max(10, 100 - (missingDays * 8))

  // Experience level boundary mapping
  // Let's make ranks up to 15 level tiers
  // E-Rank: Tier 1-3 (0 - 10k XP)
  // D-Rank: Tier 4-6 (10k - 30k XP)
  // C-Rank: Tier 7-9 (30k - 75k XP)
  // B-Rank: Tier 10-12 (75k - 150k XP)
  // A-Rank: Tier 13-14 (150k - 350k XP) [Gold Tier achieved here]
  // S-Rank: Tier 15 (350k+ XP)
  // National Level Hunter: 1M+ XP
  let level = 1
  let xpNeeded = 500
  let tempXp = rawXp
  while (tempXp >= xpNeeded && level < 100) {
    tempXp -= xpNeeded
    level++
    xpNeeded = Math.round(500 * Math.pow(1.15, level))
  }

  let rank = 'E'
  let rankColor = '#94a3b8'
  if (level >= 30) { rank = 'National'; rankColor = '#f59e0b' }
  else if (level >= 20) { rank = 'S'; rankColor = '#ef4444' }
  else if (level >= 15) { rank = 'A'; rankColor = '#fbbf24' } // Gold
  else if (level >= 10) { rank = 'B'; rankColor = '#a78bfa' }
  else if (level >= 7) { rank = 'C'; rankColor = '#38bdf8' }
  else if (level >= 4) { rank = 'D'; rankColor = '#34d399' }

  // Combat Power = (Level * 120) + (totalHours * 10) + (streak * 15) + (mindSharpness * 5)
  const combatPower = Math.round((level * 150) + (totalHours * 8) + (streak * 20) + (mindSharpness * 6))

  const weeklyHours     = weeklyStudy.reduce((a,b) => a + b.hours, 0)
  const studyScore      = Math.min(100, Math.round(weeklyHours * 100 / 35))
  const habitAvg        = habit7.reduce((a,b) => a + b.percent, 0) / 7
  const consistencyScore = Math.round(habitAvg)
  const learningScore   = Math.min(100, Math.round((studyLogs.length * 2) + (strengths.reduce((a,b) => a + b.score, 0) * 4)))
  const totalTasks      = tasks.length
  const doneTasks       = tasks.filter(x => x.status === 'done').length
  const productivityScore = totalTasks ? Math.round(doneTasks * 100 / totalTasks) : 0
  const recentHealth    = health.slice(-7)
  const sleepAvg        = recentHealth.length ? recentHealth.reduce((a,b) => a + Number(b.sleep||0), 0) / recentHealth.length : 0
  const waterAvg        = recentHealth.length ? recentHealth.reduce((a,b) => a + Number(b.water||0), 0) / recentHealth.length : 0
  const healthScore     = Math.min(100, Math.round((sleepAvg / 8 * 50) + (waterAvg / 3 * 50)))
  const overallScore    = Math.round((studyScore + consistencyScore + learningScore + productivityScore + healthScore) / 5)

  const heatmap = [...Array(90)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (89 - i))
    const k = dt.toISOString().slice(0,10)
    const hours = studyLogs.filter(s => s.date === k).reduce((a,b) => a + Number(b.hours||0), 0)
    return { date: k, value: +hours.toFixed(2) }
  })

  const activities = [
    ...studyLogs.slice(-10).map(s => ({ type: 'study', label: `Logged Training Session: ${s.subject} • ${s.topic || ''}`.trim(), time: s.createdAt, meta: `+${s.hours}h` })),
    ...tasks.filter(t => t.status === 'done').slice(-10).map(x => ({ type: 'task', label: `Quest Completed: ${x.title}`, time: x.completedAt || x.createdAt })),
    ...habitLogs.slice(-10).map(h => {
      const habit = habits.find(x => x.id === h.habitId)
      return { type: 'habit', label: `Daily Action: ${habit?.name || 'Routine'}`, time: h.createdAt }
    }),
    ...meditations.slice(-10).map(m => ({ type: 'meditate', label: `Mana Alignment Meditation`, time: m.createdAt, meta: `${m.duration}m` })),
  ].filter(x => x.time).sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 8)

  return {
    today: t, todayStudy: +todayStudy.toFixed(2),
    todayTasks, totalTasksToday, todayHabits, totalHabits, streak,
    weeklyStudy, monthlyStudy, subjectData, strengths, goalProgress, habit7, heatmap, activities,
    scores: { studyScore, consistencyScore, learningScore, productivityScore, healthScore, overallScore },
    counts: { studyLogs: studyLogs.length, habits: habits.length, tasks: tasks.length, goals: goals.length, journal: journals.length },
    // Game stats
    gameStats: {
      xp: rawXp,
      currentXp: tempXp,
      xpNeeded,
      level,
      rank,
      rankColor,
      combatPower,
      mindSharpness,
      totalHours,
      totalMeditationMinutes
    }
  }
}

// ── AI Study Plan Endpoint ────────────────────────────────
async function handleAIStudyPlan(request) {
  try {
    const formData = await request.formData()
    const file     = formData.get('file')
    const apiKey   = process.env.OPENAI_API_KEY

    if (!file) return err('No file provided')
    if (!apiKey) return err('OPENAI_API_KEY not configured in .env.local')

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const name   = file.name?.toLowerCase() || ''

    let extractedText = ''

    if (name.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      extractedText = data.text
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      const mammoth  = await import('mammoth')
      const result   = await mammoth.extractRawText({ buffer })
      extractedText  = result.value
    } else if (name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8')
    } else {
      extractedText = buffer.toString('utf-8')
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return err('Could not extract enough text from the file. Please ensure it has readable content.')
    }

    const truncated = extractedText.slice(0, 12000)

    const { OpenAI } = await import('openai')
    const openai     = new OpenAI({ apiKey })

    const systemPrompt = `You are an elite academic study planner and learning strategist. 
Analyze the provided document content and produce a comprehensive, actionable study plan.
Always respond with VALID JSON only — no markdown, no explanation outside the JSON.`

    const userPrompt = `Analyze this document and return a detailed JSON study plan with this exact structure:
{
  "title": "Document or subject title",
  "summary": "2-3 sentence overview of what this document covers",
  "totalEstimatedHours": number,
  "difficulty": "beginner|intermediate|advanced",
  "topics": [
    {
      "id": "t1",
      "name": "Topic name",
      "description": "Brief description",
      "estimatedHours": number,
      "difficulty": "easy|medium|hard",
      "prerequisites": ["t0"],
      "keyPoints": ["point1", "point2", "point3"],
      "resources": ["Suggested resource or method"]
    }
  ],
  "weeklySchedule": [
    {
      "week": 1,
      "focus": "What to cover this week",
      "topics": ["t1", "t2"],
      "dailyHours": number,
      "milestone": "What you should be able to do by end of week"
    }
  ],
  "radarData": [
    { "subject": "Conceptual Understanding", "value": 70 },
    { "subject": "Practical Application", "value": 60 },
    { "subject": "Problem Solving", "value": 65 },
    { "subject": "Memorization", "value": 50 },
    { "subject": "Analysis", "value": 75 }
  ],
  "timeAllocation": [
    { "name": "Topic name", "hours": number, "color": "#8b5cf6" }
  ],
  "studyTips": ["tip1", "tip2", "tip3"],
  "assessmentMilestones": ["milestone1", "milestone2"]
}

Document content:
${truncated}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 3500,
    })

    const raw       = completion.choices[0].message.content
    const planData  = JSON.parse(raw)

    const palette = ['#8b5cf6','#22d3ee','#34d399','#f472b6','#fbbf24','#f87171','#a78bfa','#38bdf8']
    if (planData.timeAllocation) {
      planData.timeAllocation = planData.timeAllocation.map((t, i) => ({
        ...t,
        color: t.color || palette[i % palette.length]
      }))
    }

    return ok({ success: true, plan: planData })
  } catch (e) {
    console.error('AI Study Plan error:', e)
    return err(e.message || 'Failed to generate study plan', 500)
  }
}

// ── AI Quiz Generator ─────────────────────────────────────
async function handleAIGenerateQuiz(body) {
  try {
    const { topic } = body
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return err('OPENAI_API_KEY not configured')
    if (!topic) return err('Topic required')

    const { OpenAI } = await import('openai')
    const openai     = new OpenAI({ apiKey })

    const systemPrompt = `You are a legendary Hunter Academy Quiz Instructor. 
Create exactly 5 high-fidelity Multiple Choice Questions (MCQs) for the topic to evaluate the user's mind sharpness and knowledge level.
Each question should be challenging and highly relevant. Include comprehensive explanations.
Always respond with VALID JSON only — no markdown formatting, no explanations outside the JSON.`

    const userPrompt = `Generate a JSON object with a "questions" array containing exactly 5 questions for: "${topic}".
Each question object MUST match this structure:
{
  "id": "q1",
  "question": "Question text here?",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": 0, // index of option (0-3)
  "explanation": "Why this answer is correct and what the topic covers."
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2500,
    })

    const raw = completion.choices[0].message.content
    const quizData = JSON.parse(raw)
    return ok({ success: true, quiz: quizData })
  } catch (e) {
    console.error('Quiz Generation error:', e)
    return err(e.message || 'Failed to generate quiz', 500)
  }
}

// ── AI Chat ───────────────────────────────────────────────
async function handleAIChat(body) {
  try {
    const { message, context } = body
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return err('OPENAI_API_KEY not configured')
    if (!message) return err('Message required')

    const { OpenAI } = await import('openai')
    const openai     = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert study coach and learning strategist. Answer questions concisely and actionably about the study plan context provided. Use markdown for formatting.' },
        ...(context ? [{ role: 'user', content: `Study plan context: ${JSON.stringify(context)}` }] : []),
        { role: 'user', content: message }
      ],
      temperature: 0.6,
      max_tokens: 800,
    })

    return ok({ reply: completion.choices[0].message.content })
  } catch (e) {
    console.error('AI Chat error:', e)
    return err(e.message || 'Chat failed', 500)
  }
}

// ── AI Daily Plan Generator ────────────────────────────────
async function handleAIGenerateDailyPlan(body) {
  try {
    const { studyTopics, studyHours, exerciseType, exerciseMinutes, meditationMinutes, tasks, goals, habits, priority, userData } = body
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return err('OPENAI_API_KEY not configured')

    const { OpenAI } = await import('openai')
    const openai     = new OpenAI({ apiKey })

    const systemPrompt = `You are an elite personal growth strategist and daily planning AI. 
Generate personalized daily plans that optimize for productivity, health, and personal development.
Always respond with VALID JSON only — no markdown, no explanation outside the JSON.`

    const userPrompt = `Generate a comprehensive daily plan JSON with this exact structure:
{
  "title": "Optimized Daily Plan",
  "description": "Brief description of the day's focus",
  "items": [
    {
      "id": "unique-id",
      "type": "study|exercise|meditation|task|goal|habit",
      "category": "study|exercise|meditation|tasks|goals|habits",
      "title": "Item title",
      "description": "Detailed description",
      "duration": number in minutes,
      "priority": "high|medium|low",
      "timeSlot": "morning|afternoon|evening|flexible|daily",
      "estimatedImpact": "high|medium|low"
    }
  ]
}

User preferences:
- Study topics: ${studyTopics || 'None specified'}
- Study hours target: ${studyHours || 2} hours
- Exercise type: ${exerciseType || 'None specified'}
- Exercise minutes: ${exerciseMinutes || 30} minutes
- Meditation minutes: ${meditationMinutes || 15} minutes
- Tasks: ${tasks || 'None specified'}
- Goals: ${goals || 'None specified'}
- Habits: ${habits || 'None specified'}
- Priority level: ${priority || 'medium'}

${userData ? `User context: ${JSON.stringify(userData)}` : ''}

Generate 6-10 actionable items for the day. Optimize the schedule for maximum productivity and well-being.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const raw = completion.choices[0].message.content
    const planData = JSON.parse(raw)

    return ok({ success: true, plan: planData })
  } catch (e) {
    console.error('AI Daily Plan error:', e)
    return err(e.message || 'Failed to generate daily plan', 500)
  }
}

// ── Router ────────────────────────────────────────────────
async function handler(request, { params }) {
  try {
    const path   = (params?.path || []).join('/')
    const method = request.method
    const body   = ['POST','PUT','PATCH'].includes(method) && request.headers.get('content-type')?.includes('application/json')
      ? await request.json().catch(() => ({}))
      : {}

    // Get authenticated user for protected routes
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const currentUser = await getUserFromToken(token)

    // STATS
    if (path === 'stats' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await getStats(currentUser.id))
    }

    // AUTHENTICATION
    if (path === 'auth/register' && method === 'POST') {
      const { email, password, name } = body
      if (!email || !password || !name) return err('Email, password, and name are required')

      const d = await db()
      const existingUser = await d.collection('users').findOne({ email })
      if (existingUser) return err('User already exists', 409)

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await insert('users', {
        email,
        password: hashedPassword,
        name,
        createdAt: new Date().toISOString(),
      })

      const token = generateToken(user.id)
      const { password: _, ...userWithoutPassword } = user
      return ok({ user: userWithoutPassword, token })
    }

    if (path === 'auth/login' && method === 'POST') {
      const { email, password } = body
      if (!email || !password) return err('Email and password are required')

      const d = await db()
      const user = await d.collection('users').findOne({ email })
      if (!user) return err('Invalid credentials', 401)

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) return err('Invalid credentials', 401)

      const token = generateToken(user.id)
      const { password: _, ...userWithoutPassword } = user
      return ok({ user: userWithoutPassword, token })
    }

    if (path === 'auth/me' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      const user = await getUserFromToken(token)
      if (!user) return err('Unauthorized', 401)
      return ok({ user })
    }

    if (path === 'auth/logout' && method === 'POST') {
      return ok({ message: 'Logged out successfully' })
    }

    // AI ROUTES
    if (path === 'ai/study-plan' && method === 'POST') return handleAIStudyPlan(request)
    if (path === 'ai/chat'       && method === 'POST') return handleAIChat(body)
    if (path === 'ai/generate-quiz' && method === 'POST') return handleAIGenerateQuiz(body)
    if (path === 'ai/generate-daily-plan' && method === 'POST') return handleAIGenerateDailyPlan(body)

    // STUDY LOGS
    if (path === 'study-logs' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('study_logs', { userId: currentUser.id }))
    }
    if (path === 'study-logs' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const item = await insert('study_logs', {
        subject: body.subject, topic: body.topic || '', subtopic: body.subtopic || '',
        date: body.date || today(), hours: Number(body.hours) || 0,
        difficulty: body.difficulty || 'medium', understanding: Number(body.understanding) || 3,
        notes: body.notes || '', resources: body.resources || '', revision: !!body.revision,
        revisionDate: body.revisionDate || null,
      }, currentUser.id)
      return ok(item)
    }
    if (path.startsWith('study-logs/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('study_logs', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('study-logs/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('study_logs', path.split('/')[1], currentUser.id))
    }

    // HABITS
    if (path === 'habits' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      const habits = await list('habits', { userId: currentUser.id }, { createdAt: 1 })
      const logs   = await list('habit_logs', { userId: currentUser.id }, { date: -1 })
      const t      = today()
      const enriched = habits.map(h => {
        const hLogs = logs.filter(l => l.habitId === h.id).map(l => l.date).sort()
        const completedToday = hLogs.includes(t)
        let streak = 0
        for (let i = 0; i < 365; i++) {
          const dt = new Date(); dt.setDate(dt.getDate() - i)
          const k = dt.toISOString().slice(0,10)
          if (hLogs.includes(k)) streak++
          else if (i === 0) continue
          else break
        }
        const last30 = [...Array(30)].map((_, i) => {
          const dt = new Date(); dt.setDate(dt.getDate() - (29 - i)); return dt.toISOString().slice(0,10)
        })
        const completionPct = Math.round(last30.filter(d => hLogs.includes(d)).length * 100 / 30)
        return { ...h, completedToday, streak, completionPct, totalCompletions: hLogs.length }
      })
      return ok(enriched)
    }
    if (path === 'habits' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('habits', { name: body.name, icon: body.icon || 'Activity', color: body.color || 'violet', target: body.target || 'daily' }, currentUser.id))
    }
    if (path.startsWith('habits/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('habits', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('habits/') && path.endsWith('/toggle') && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const id   = path.split('/')[1]
      const date = body.date || today()
      const d    = await db()
      const existing = await d.collection('habit_logs').findOne({ habitId: id, date, userId: currentUser.id })
      if (existing) {
        await d.collection('habit_logs').deleteOne({ habitId: id, date, userId: currentUser.id })
        return ok({ toggled: false })
      }
      await d.collection('habit_logs').insertOne({ id: uuid(), habitId: id, date, userId: currentUser.id, createdAt: new Date().toISOString() })
      return ok({ toggled: true })
    }
    if (path.startsWith('habits/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      const id = path.split('/')[1]
      const d  = await db()
      await d.collection('habits').deleteOne({ id, userId: currentUser.id })
      await d.collection('habit_logs').deleteMany({ habitId: id, userId: currentUser.id })
      return ok({ ok: true })
    }

    // TASKS
    if (path === 'tasks' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('tasks', { userId: currentUser.id }))
    }
    if (path === 'tasks' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('tasks', {
        title: body.title, description: body.description || '', priority: body.priority || 'medium',
        category: body.category || 'general', dueDate: body.dueDate || today(), status: body.status || 'todo',
        type: body.type || 'daily',
      }, currentUser.id))
    }
    if (path.startsWith('tasks/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      const id = path.split('/')[1]
      const patch = { ...body }
      if (body.status === 'done') patch.completedAt = new Date().toISOString()
      return ok(await update('tasks', id, patch, currentUser.id))
    }
    if (path.startsWith('tasks/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('tasks', path.split('/')[1], currentUser.id))
    }

    // GOALS
    if (path === 'goals' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('goals', { userId: currentUser.id }))
    }
    if (path === 'goals' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('goals', {
        title: body.title, description: body.description || '', category: body.category || 'personal',
        term: body.term || 'short', deadline: body.deadline || null, progress: Number(body.progress) || 0,
        milestones: body.milestones || [],
      }, currentUser.id))
    }
    if (path.startsWith('goals/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('goals', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('goals/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('goals', path.split('/')[1], currentUser.id))
    }

    // JOURNAL
    if (path === 'journal' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('journal', { userId: currentUser.id }))
    }
    if (path === 'journal' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('journal', {
        date: body.date || today(), reflection: body.reflection || '', wins: body.wins || '',
        mistakes: body.mistakes || '', lessons: body.lessons || '', mood: body.mood || 'good',
        energy: Number(body.energy) || 5, tomorrowPlan: body.tomorrowPlan || '',
      }, currentUser.id))
    }
    if (path.startsWith('journal/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('journal', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('journal/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('journal', path.split('/')[1], currentUser.id))
    }

    // HEALTH
    if (path === 'health' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('health', { userId: currentUser.id }, { date: 1 }))
    }
    if (path === 'health' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('health', {
        date: body.date || today(), weight: Number(body.weight) || 0, sleep: Number(body.sleep) || 0,
        water: Number(body.water) || 0, calories: Number(body.calories) || 0,
        protein: Number(body.protein) || 0, carbs: Number(body.carbs) || 0, fat: Number(body.fat) || 0,
        energy: Number(body.energy) || 5,
      }, currentUser.id))
    }
    if (path.startsWith('health/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('health', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('health/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('health', path.split('/')[1], currentUser.id))
    }

    // KNOWLEDGE
    if (path === 'knowledge' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('knowledge', { userId: currentUser.id }))
    }
    if (path === 'knowledge' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('knowledge', {
        title: body.title, type: body.type || 'book', category: body.category || 'general',
        author: body.author || '', notes: body.notes || '', confidence: Number(body.confidence) || 3,
        status: body.status || 'reading', revisionCount: Number(body.revisionCount) || 0,
      }, currentUser.id))
    }
    if (path.startsWith('knowledge/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('knowledge', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('knowledge/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('knowledge', path.split('/')[1], currentUser.id))
    }

    // EXERCISE
    if (path === 'exercises' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('exercises', { userId: currentUser.id }))
    }
    if (path === 'exercises' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('exercises', {
        name: body.name, sets: Number(body.sets) || 0, reps: Number(body.reps) || 0,
        weight: Number(body.weight) || 0, duration: Number(body.duration) || 0,
        calories: Number(body.calories) || 0, notes: body.notes || '',
        date: body.date || today(),
      }, currentUser.id))
    }
    if (path.startsWith('exercises/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await update('exercises', path.split('/')[1], body, currentUser.id))
    }
    if (path.startsWith('exercises/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('exercises', path.split('/')[1], currentUser.id))
    }

    // MEDITATION
    if (path === 'meditations' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await list('meditations', { userId: currentUser.id }))
    }
    if (path === 'meditations' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await insert('meditations', {
        duration: Number(body.duration) || 0,
        date: body.date || today(),
      }, currentUser.id))
    }

    // DAILY PLANS
    if (path === 'daily-plans' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      const d = await db()
      const t = today()
      const plans = await list('daily_plans', { userId: currentUser.id }, { createdAt: -1 })
      const todayPlan = plans.find(p => p.date === t)
      return ok({ plans, todayPlan })
    }
    if (path === 'daily-plans' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const item = await insert('daily_plans', {
        date: body.date || today(),
        title: body.title || 'Daily Plan',
        description: body.description || '',
        items: body.items || [],
        metadata: body.metadata || {}
      }, currentUser.id)
      return ok(item)
    }
    if (path.startsWith('daily-plans/') && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      const id = path.split('/')[1]
      const patch = { ...body }
      if (body.completedItems !== undefined) {
        patch.completedItems = body.completedItems
      }
      if (body.progress !== undefined) {
        patch.progress = body.progress
      }
      return ok(await update('daily_plans', id, patch, currentUser.id))
    }
    if (path.startsWith('daily-plans/') && method === 'DELETE') {
      if (!currentUser) return err('Unauthorized', 401)
      return ok(await remove('daily_plans', path.split('/')[1], currentUser.id))
    }

    // PLAN COMPLETION TRACKING
    if (path.startsWith('daily-plans/') && path.endsWith('/complete') && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const id = path.split('/')[1]
      const { itemId, completed } = body
      const d = await db()
      const plan = await d.collection('daily_plans').findOne({ id, userId: currentUser.id }, { projection: { _id: 0 } })

      if (!plan) return err('Plan not found', 404)
      
      const completedItems = plan.completedItems || {}
      completedItems[itemId] = completed
      
      const totalItems = plan.items?.length || 0
      const completedCount = Object.values(completedItems).filter(Boolean).length
      const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0
      
      await d.collection('daily_plans').updateOne(
        { id },
        { $set: { completedItems, progress, updatedAt: new Date().toISOString() } }
      )
      
      // Find the item to determine if we should create related logs
      const item = plan.items?.find(i => i.id === itemId)
      if (item && completed) {
        // Create related tracking entries based on item category
        if (item.category === 'study') {
          await d.collection('study_logs').insertOne({
            id: uuid(),
            subject: item.title.replace('Study: ', ''),
            topic: '',
            date: today(),
            hours: (item.duration || 30) / 60,
            difficulty: 'medium',
            understanding: 3,
            notes: `Completed from daily plan: ${item.title}`,
            createdAt: new Date().toISOString()
          })
        } else if (item.category === 'exercise') {
          await d.collection('exercises').insertOne({
            id: uuid(),
            name: item.title.replace('Exercise: ', ''),
            duration: item.duration || 30,
            date: today(),
            calories: Math.round((item.duration || 30) * 5),
            notes: `Completed from daily plan: ${item.title}`,
            createdAt: new Date().toISOString()
          })
        } else if (item.category === 'meditation') {
          await d.collection('meditations').insertOne({
            id: uuid(),
            duration: item.duration || 15,
            date: today(),
            createdAt: new Date().toISOString()
          })
        } else if (item.category === 'tasks') {
          await d.collection('tasks').insertOne({
            id: uuid(),
            title: item.title,
            description: item.description || '',
            priority: item.priority || 'medium',
            category: 'daily',
            dueDate: today(),
            status: 'done',
            completedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        }
      }
      
      const updatedPlan = await d.collection('daily_plans').findOne({ id }, { projection: { _id: 0 } })
      return ok(updatedPlan)
    }

    // ── Payment & Subscription ─────────────────────────────────
    if (path === 'payment/create-order') {
      if (!currentUser) return err('Unauthorized', 401)
      const Razorpay = require('razorpay')
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })

      const { planId, amount, currency = 'INR' } = body
      if (!planId || !amount) return err('planId and amount are required')

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: uuid().slice(0, 40),
        notes: { planId, userId: currentUser.id },
      }

      try {
        const order = await razorpay.orders.create(options)
        return ok({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID })
      } catch (e) {
        console.error('Razorpay order creation error:', e)
        return err('Failed to create payment order', 500)
      }
    }

    if (path === 'payment/verify') {
      if (!currentUser) return err('Unauthorized', 401)
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId } = body
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return err('Payment verification details are required')
      }

      const crypto = require('crypto')
      const key_secret = process.env.RAZORPAY_KEY_SECRET
      const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      if (generated_signature !== razorpay_signature) {
        return err('Invalid payment signature', 400)
      }

      // Calculate subscription end date based on plan
      const planDurations = {
        'monthly': 30,
        'six-month': 180,
        'yearly': 365,
      }
      const duration = planDurations[planId] || 30
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + duration)

      // Save subscription
      const subscription = await insert('subscriptions', {
        userId: currentUser.id,
        planId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
      })

      return ok({ subscription, message: 'Payment verified successfully' })
    }

    if (path === 'subscription/status') {
      if (!currentUser) return err('Unauthorized', 401)
      const d = await db()
      const subscription = await d.collection('subscriptions').findOne(
        { userId: currentUser.id, status: 'active', endDate: { $gte: new Date().toISOString() } },
        { projection: { _id: 0 }, sort: { createdAt: -1 } }
      )

      if (!subscription) {
        return ok({ isActive: false, plan: null })
      }

      return ok({
        isActive: true,
        plan: subscription.planId,
        endDate: subscription.endDate,
        startDate: subscription.startDate,
      })
    }

    if (path === 'subscription/cancel') {
      if (!currentUser) return err('Unauthorized', 401)
      const d = await db()
      await d.collection('subscriptions').updateOne(
        { userId: currentUser.id, status: 'active' },
        { $set: { status: 'cancelled', cancelledAt: new Date().toISOString() } }
      )
      return ok({ message: 'Subscription cancelled successfully' })
    }

    return err(`Not found: ${method} /api/${path}`, 404)
  } catch (e) {
    console.error('API error:', e)
    return err(e.message || 'Server error', 500)
  }
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler
