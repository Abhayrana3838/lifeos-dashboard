import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import pathModule from 'path'

let client = null
let _db = null

const LOCAL_DB_FILE = pathModule.join(process.cwd(), 'data', 'local_db.json')

function initLocalDB() {
  const dir = pathModule.dirname(LOCAL_DB_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify({
      users: [],
      study_logs: [],
      habits: [],
      habit_logs: [],
      tasks: [],
      goals: [],
      meditations: [],
      exercises: [],
      knowledge: [],
      daily_plans: [],
      guild_chat: [],
      journal: [],
      health: [],
      subscriptions: []
    }, null, 2))
  }
}

function readLocalDB() {
  initLocalDB()
  try {
    const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    console.error('Error reading local DB:', e)
    return {}
  }
}

function writeLocalDB(dbData) {
  initLocalDB()
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(dbData, null, 2))
  } catch (e) {
    console.error('Error writing local DB:', e)
  }
}

function matchFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true
  for (const [key, val] of Object.entries(filter)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$in && !val.$in.includes(item[key])) return false
      if (val.$gte && item[key] < val.$gte) return false
      if (val.$lte && item[key] > val.$lte) return false
      if (val.$gt && item[key] <= val.$gt) return false
      if (val.$lt && item[key] >= val.$lt) return false
      if (val.$ne && item[key] === val.$ne) return false
    } else if (item[key] !== val) {
      return false
    }
  }
  return true
}

class MockCollection {
  constructor(collName) {
    this.collName = collName
  }

  async find(filter = {}, options = {}) {
    const dbData = readLocalDB()
    let items = dbData[this.collName] || []
    items = items.filter(item => matchFilter(item, filter))

    let result = [...items]

    const chain = {
      sort: (sortObj) => {
        const sortKey = Object.keys(sortObj)[0]
        const sortDir = sortObj[sortKey]
        result.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return sortDir === 1 ? -1 : 1
          if (a[sortKey] > b[sortKey]) return sortDir === 1 ? 1 : -1
          return 0
        })
        return chain
      },
      limit: (num) => {
        result = result.slice(0, num)
        return chain
      },
      toArray: async () => {
        return result
      }
    }
    return chain
  }

  async findOne(filter = {}, options = {}) {
    const dbData = readLocalDB()
    const items = dbData[this.collName] || []
    const item = items.find(item => matchFilter(item, filter))
    return item || null
  }

  async insertOne(item) {
    const dbData = readLocalDB()
    if (!dbData[this.collName]) dbData[this.collName] = []
    if (!item.id) item.id = uuid()
    dbData[this.collName].push(item)
    writeLocalDB(dbData)
    return { insertedId: item.id }
  }

  async insertMany(items) {
    const dbData = readLocalDB()
    if (!dbData[this.collName]) dbData[this.collName] = []
    items.forEach(item => {
      if (!item.id) item.id = uuid()
      dbData[this.collName].push(item)
    })
    writeLocalDB(dbData)
    return { insertedCount: items.length }
  }

  async updateOne(filter, update, options = {}) {
    const dbData = readLocalDB()
    const items = dbData[this.collName] || []
    const item = items.find(item => matchFilter(item, filter))
    if (item) {
      if (update.$set) {
        Object.assign(item, update.$set)
      } else {
        Object.assign(item, update)
      }
      writeLocalDB(dbData)
      return { matchedCount: 1, modifiedCount: 1 }
    }
    if (options.upsert) {
      const newItem = { ...filter, ...(update.$set || update) }
      if (!newItem.id) newItem.id = uuid()
      items.push(newItem)
      dbData[this.collName] = items
      writeLocalDB(dbData)
      return { matchedCount: 0, modifiedCount: 1, upsertedId: newItem.id }
    }
    return { matchedCount: 0, modifiedCount: 0 }
  }

  async updateMany(filter, update, options = {}) {
    const dbData = readLocalDB()
    const items = dbData[this.collName] || []
    let modified = 0
    items.forEach(item => {
      if (matchFilter(item, filter)) {
        if (update.$set) {
          Object.assign(item, update.$set)
        } else {
          Object.assign(item, update)
        }
        modified++
      }
    })
    if (modified > 0) {
      writeLocalDB(dbData)
    }
    return { matchedCount: modified, modifiedCount: modified }
  }

  async deleteOne(filter) {
    const dbData = readLocalDB()
    const items = dbData[this.collName] || []
    const index = items.findIndex(item => matchFilter(item, filter))
    if (index !== -1) {
      items.splice(index, 1)
      writeLocalDB(dbData)
      return { deletedCount: 1 }
    }
    return { deletedCount: 0 }
  }

  async deleteMany(filter) {
    const dbData = readLocalDB()
    const items = dbData[this.collName] || []
    const beforeCount = items.length
    const filtered = items.filter(item => !matchFilter(item, filter))
    dbData[this.collName] = filtered
    writeLocalDB(dbData)
    return { deletedCount: beforeCount - filtered.length }
  }
}

class MockDb {
  collection(name) {
    return new MockCollection(name)
  }
}

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
      serverSelectionTimeoutMS: 5000, // Increased timeout to 5s to prevent transient connection timeouts
      socketTimeoutMS: 15000,
    })
  }
  return client
}

async function db() {
  const mongoUrl = process.env.MONGO_URL
  if (!mongoUrl) {
    console.warn('MONGO_URL not configured. Using local JSON database.')
    return new MockDb()
  }
  if (_db) {
    try {
      return _db
    } catch (e) {
      console.error('Cached DB connection error, resetting:', e)
      _db = null
    }
  }
  try {
    const mongoClient = await getClient()
    await mongoClient.connect()
    _db = mongoClient.db(process.env.DB_NAME || 'lifeos')
    await _db.command({ ping: 1 })
    console.log('MongoDB connection successful')
    return _db
  } catch (error) {
    console.error('MongoDB connection failed. Falling back to local JSON database:', error)
    _db = null
    return new MockDb()
  }
}

const ok  = (data, status = 200) => NextResponse.json(data, { status })
const err = (message, status = 400) => NextResponse.json({ error: message }, { status })

const today = () => {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const localDate = new Date(d.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 10)
}

const dateKey = (d) => {
  const dateObj = new Date(d)
  const offset = dateObj.getTimezoneOffset()
  const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 10)
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function maskName(name, userId) {
  if (!name) return 'H-XX_0000'
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
  const shortId = (userId || 'xxxx').slice(0, 4)
  return `H-${initials}_${shortId}`
}

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
  return await d.collection(coll).find(filter, { projection: { _id: 0 } }).sort(sort).limit(1000).toArray()
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
  return await d.collection(coll).findOne({ id, userId }, { projection: { _id: 0 } })
}
async function remove(coll, id, userId) {
  const d = await db()
  await d.collection(coll).deleteOne({ id, userId })
  return { ok: true }
}

// ── Stats Aggregator ──────────────────────────────────────
async function getStats(userId) {
  const d = await db()
  const uDoc = await d.collection('users').findOne({ id: userId }) || {}
  const t = today()
  const last7 = [...Array(7)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (6 - i)); return dt.toISOString().slice(0,10)
  })
  const last30 = [...Array(30)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (29 - i)); return dt.toISOString().slice(0,10)
  })

  const [studyLogs, habits, habitLogs, tasks, goals, journals, health, meditations, exercises, knowledge, dailyPlans, userChats] = await Promise.all([
    d.collection('study_logs').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('habits').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('habit_logs').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('tasks').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('goals').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('journal').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('health').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('meditations').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('exercises').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('knowledge').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('daily_plans').find({ userId }, { projection: { _id: 0 } }).toArray(),
    d.collection('guild_chat').find({ userId }, { projection: { _id: 0 } }).toArray(),
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

  // Logged Exercises/Workouts points
  exercises.forEach(e => {
    rawXp += (Number(e.sets || 0) * Number(e.reps || 0) * 3) + (Number(e.duration || 0) * 6)
  })

  // Logged Library items/Books points
  rawXp += knowledge.length * 150

  // Journal entries points
  rawXp += journals.length * 200

  // Health log entries points
  rawXp += health.length * 75

  // Daily plans completed checkpoints
  dailyPlans.forEach(p => {
    const doneCount = Object.values(p.completedItems || {}).filter(Boolean).length
    rawXp += doneCount * 100
  })

  // Goals created and progress points
  rawXp += goals.length * 100
  goals.forEach(g => {
    rawXp += (g.progress || 0) * 2
  })

  // Guild chat messages points
  rawXp += (userChats?.length || 0) * 25

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
    ...studyLogs.slice(-10).map(s => ({ type: 'study', label: `Logged Training Session: ${s.subject} • ${s.topic || ''}`.trim(), time: s.createdAt || s.date, meta: `+${s.hours}h` })),
    ...tasks.filter(t => t.status === 'done').slice(-10).map(x => ({ type: 'task', label: `Quest Completed: ${x.title}`, time: x.completedAt || x.createdAt })),
    ...habitLogs.slice(-10).map(h => {
      const habit = habits.find(x => x.id === h.habitId)
      return { type: 'habit', label: `Daily Action: ${habit?.name || 'Routine'}`, time: h.createdAt }
    }),
    ...meditations.slice(-10).map(m => ({ type: 'meditate', label: `Mana Alignment Meditation`, time: m.createdAt, meta: `${m.duration}m` })),
    ...exercises.slice(-10).map(e => ({ type: 'exercise', label: `Physical Training: ${e.name}`, time: e.createdAt || e.date, meta: `${e.sets || 0}x${e.reps || 0}` })),
    ...knowledge.slice(-10).map(k => ({ type: 'knowledge', label: `Archived Knowledge: ${k.title}`, time: k.createdAt })),
    ...journals.slice(-10).map(j => ({ type: 'journal', label: `Reflected in Hunter Journal`, time: j.createdAt || j.date })),
    ...health.slice(-10).map(h => ({ type: 'health', label: `Registered Hunter Vitals`, time: h.createdAt || h.date })),
    ...goals.slice(-10).map(g => ({ type: 'goal', label: `Set Milestone Quest: ${g.title}`, time: g.createdAt || g.deadline, meta: `${g.progress || 0}%` })),
  ]
  // Dynamic Muscle Fatigue Audit (CNS Overload forecasting)
  const muscleFatigue = { chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0 }
  const nowMs = Date.now()
  exercises.forEach(ex => {
    const exDate = new Date(ex.date || ex.createdAt)
    const daysAgo = (nowMs - exDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysAgo <= 5) {
      const name = (ex.name || '').toLowerCase()
      let group = 'core'
      if (name.includes('press') || name.includes('chest') || name.includes('bench') || name.includes('fly') || name.includes('dip')) group = 'chest'
      else if (name.includes('row') || name.includes('pull') || name.includes('lats') || name.includes('deadlift') || name.includes('back')) group = 'back'
      else if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('hamstring') || name.includes('quad')) group = 'legs'
      else if (name.includes('shoulder') || name.includes('overhead') || name.includes('lateral') || name.includes('military')) group = 'shoulders'
      else if (name.includes('curl') || name.includes('tricep') || name.includes('bicep') || name.includes('arm')) group = 'arms'
      else if (name.includes('crunch') || name.includes('plank') || name.includes('abs') || name.includes('situp')) group = 'core'
      
      const volume = (Number(ex.sets) || 3) * (Number(ex.reps) || 10)
      const decay = Math.max(0, 1 - (daysAgo * 0.2)) // 20% decay per day
      muscleFatigue[group] = Math.min(100, muscleFatigue[group] + volume * 0.8 * decay)
    }
  })
  Object.keys(muscleFatigue).forEach(k => {
    muscleFatigue[k] = Math.round(muscleFatigue[k])
  })

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
      muscleFatigue,
      // RPG Attributes
      attributes: {
        strength: 10 + Math.round((exercises.length * 2.5) + (tasksDone * 0.8)) + (uDoc.allocatedStats?.strength || 0),
        agility: 10 + Math.round((habitLogs.length * 0.6) + (streak * 1.5)) + (uDoc.allocatedStats?.agility || 0),
        intelligence: 10 + Math.round((totalHours * 1.5) + (knowledge.length * 4)) + (uDoc.allocatedStats?.intelligence || 0),
        vitality: 10 + Math.round((health.length * 2.5) + (sleepAvg * 1.5)) + (uDoc.allocatedStats?.vitality || 0),
        sense: 10 + Math.round((totalMeditationMinutes / 5) + (journals.length * 3)) + (uDoc.allocatedStats?.sense || 0)
      },
      allocatedStats: uDoc.allocatedStats || { strength: 0, agility: 0, intelligence: 0, vitality: 0, sense: 0 },
      unspentPoints: (() => {
        const spent = Object.values(uDoc.allocatedStats || {}).reduce((sum, val) => sum + val, 0)
        return Math.max(0, (level - 1) * 5 - spent)
      })(),
      activeRaid: uDoc.activeRaid || null,
      streakCrucible: uDoc.streakCrucible || null,
      hunterClass: (() => {
        const sVal = 10 + Math.round((exercises.length * 2.5) + (tasksDone * 0.8)) + (uDoc.allocatedStats?.strength || 0)
        const aVal = 10 + Math.round((habitLogs.length * 0.6) + (streak * 1.5)) + (uDoc.allocatedStats?.agility || 0)
        const iVal = 10 + Math.round((totalHours * 1.5) + (knowledge.length * 4)) + (uDoc.allocatedStats?.intelligence || 0)
        const vVal = 10 + Math.round((health.length * 2.5) + (sleepAvg * 1.5)) + (uDoc.allocatedStats?.vitality || 0)
        const snVal = 10 + Math.round((totalMeditationMinutes / 5) + (journals.length * 3)) + (uDoc.allocatedStats?.sense || 0)
        const maxVal = Math.max(sVal, aVal, iVal, vVal, snVal)
        if (maxVal === 10) return 'Shadow Monarch'
        if (maxVal === iVal) return 'Shadow Mage'
        if (maxVal === sVal) return 'Vanguard Fighter'
        if (maxVal === aVal) return 'Phantom Assassin'
        if (maxVal === vVal) return 'Adamant Defender'
        return 'Astral Seer'
      })(),
      combatPower,
      mindSharpness,
      totalHours,
      totalMeditationMinutes,
      recoveryScore: (() => {
        const latestHealth = health[health.length - 1] || {}
        const sleepHrs = Number(latestHealth.sleep !== undefined ? latestHealth.sleep : 8)
        const waterLtrs = Number(latestHealth.water !== undefined ? latestHealth.water : 3)
        const energyRating = Number(latestHealth.energy !== undefined ? latestHealth.energy : 5)
        const sleepScore = Math.min(100, (sleepHrs / 8) * 100)
        const waterScore = Math.min(100, (waterLtrs / 3) * 100)
        const energyScore = Math.min(100, (energyRating / 5) * 100)
        return Math.round((sleepScore + waterScore + energyScore) / 3)
      })(),
      fatigueActive: (() => {
        const latestHealth = health[health.length - 1] || {}
        const sleepHrs = Number(latestHealth.sleep !== undefined ? latestHealth.sleep : 8)
        const waterLtrs = Number(latestHealth.water !== undefined ? latestHealth.water : 3)
        const energyRating = Number(latestHealth.energy !== undefined ? latestHealth.energy : 5)
        const sleepScore = Math.min(100, (sleepHrs / 8) * 100)
        const waterScore = Math.min(100, (waterLtrs / 3) * 100)
        const energyScore = Math.min(100, (energyRating / 5) * 100)
        const score = Math.round((sleepScore + waterScore + energyScore) / 3)
        return score < 70
      })(),
      difficultyModifier: (() => {
        const latestHealth = health[health.length - 1] || {}
        const sleepHrs = Number(latestHealth.sleep !== undefined ? latestHealth.sleep : 8)
        const waterLtrs = Number(latestHealth.water !== undefined ? latestHealth.water : 3)
        const energyRating = Number(latestHealth.energy !== undefined ? latestHealth.energy : 5)
        const sleepScore = Math.min(100, (sleepHrs / 8) * 100)
        const waterScore = Math.min(100, (waterLtrs / 3) * 100)
        const energyScore = Math.min(100, (energyRating / 5) * 100)
        const score = Math.round((sleepScore + waterScore + energyScore) / 3)
        return score < 70 ? 0.7 : 1.0
      })()
    }
  }
}

async function handleAISuggest(body) {
  try {
    const { type, context = {} } = body
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return err('OPENAI_API_KEY not configured')

    const { OpenAI } = await import('openai')
    const openai     = new OpenAI({ apiKey })

    let systemPrompt = "You are a helpful AI coding assistant in a gamified life-management system styled as a Solo Leveling Hunter RPG."
    let userPrompt = ""

    if (type === 'habit') {
      systemPrompt = "You are a legendary Hunter Trainer. Suggest exactly 3 unique, daily habits tailored to the user's RPG class."
      userPrompt = `Suggest 3 habits. Respond ONLY with a valid JSON array of strings. Format: ["Habit 1", "Habit 2", "Habit 3"]. Class: ${context.hunterClass || 'Shadow Monarch'}.`
    } else if (type === 'quest') {
      systemPrompt = "You are the System Quest Generator. Generate a single daily quest aligned with a Hunter's level and class."
      userPrompt = `Respond ONLY with a valid JSON object: { "title": "Quest Title", "description": "Quest task description", "priority": "low|medium|high" }. Hunter Class: ${context.hunterClass || 'Shadow Monarch'}, Level: ${context.level || 1}.`
    } else if (type === 'exercise') {
      systemPrompt = "You are the Physical Training System. Recommend a workout exercise aligned with the user's primary level/class."
      userPrompt = `Respond ONLY with a valid JSON object: { "name": "Exercise Name (e.g. Push Ups)", "sets": number, "reps": number, "weight": number (in kg), "duration": number (in minutes) }. Hunter Class: ${context.hunterClass || 'Shadow Monarch'}, Muscle Fatigue: ${JSON.stringify(context.fatigue || {})}.`
    } else if (type === 'journal') {
      systemPrompt = "You are the Archivist Soul Bind. Refine the user's raw daily reflection into a clean, epic journal entry."
      userPrompt = `Refine this raw entry into a detailed, structured epic journal text: "${context.rawReflection}". Respond ONLY with a JSON object: { "reflection": "refined reflection text", "wins": "suggested wins", "mood": "good|neutral|bad" }.`
    } else {
      return err('Invalid suggestion type')
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    })

    const raw = completion.choices[0].message.content
    const data = JSON.parse(raw)
    return ok({ success: true, data })
  } catch (e) {
    console.error('AI Suggestion error:', e)
    return err(e.message || 'Failed to generate suggestions', 500)
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

// AI Workout Generator
async function handleAIChatWorkout(body) {
  try {
    const { 
      goal = 'Hypertrophy', 
      split = 'Full Body', 
      level = 'intermediate',
      includeExercises = '',
      excludeExercises = '',
      duration = '60',
      intensity = 'Medium'
    } = body
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return err('OPENAI_API_KEY not configured')

    const { OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey })

    const systemPrompt = `You are a world-class biomechanical athletic trainer. 
Design an optimized workout routine based on the user's goals and splits.
Always respond with VALID JSON only — no markdown formatting, no explanations outside the JSON.`

    const userPrompt = `Design a workout routine for a ${level} level athlete targeting "${goal}" using a "${split}" split.
Ensure it satisfies the following constraints:
- Target Session Duration: ${duration} minutes
- Intensity Level: ${intensity} (Adjust the reps, sets, and tempo accordingly)
${includeExercises ? `- Force-include these exercises: ${includeExercises}` : ''}
${excludeExercises ? `- Exclude/Avoid these exercises: ${excludeExercises}` : ''}

Return a JSON object with this exact structure:
{
  "routineName": "Routine Title",
  "focus": "Brief focus description",
  "exercises": [
    {
      "name": "Exercise Name",
      "muscleGroup": "Chest|Back|Shoulders|Legs|Arms|Core",
      "sets": number,
      "reps": number,
      "weightSuggestion": "suggested weight e.g. 70% 1RM",
      "notes": "Form tip"
    }
  ]
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
    const data = JSON.parse(raw)
    return ok({ success: true, workout: data })
  } catch (e) {
    console.error('Workout Generator error:', e)
    return err(e.message || 'Failed to generate workout', 500)
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
    if (path === 'ai/generate-workout' && method === 'POST') return handleAIChatWorkout(body)
    if (path === 'ai/suggest'    && method === 'POST') return handleAISuggest(body)

    // GUILDS ROUTES
    if (path === 'guilds/chat' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      const d = await db()
      let chatLogs = await d.collection('guild_chat').find({}).sort({ createdAt: 1 }).toArray()

      // Chat Simulator: If empty or last message is older than 25s, simulate a new hunter message
      const lastMsg = chatLogs[chatLogs.length - 1]
      const now = new Date()
      if (!lastMsg || (now - new Date(lastMsg.createdAt)) > 25000) {
        // Fetch user stats to target weak points
        const stats = await getStats(currentUser.id)
        const attrs = stats?.gameStats?.attributes || { strength: 10, agility: 10, intelligence: 10, vitality: 10, sense: 10 }
        
        // Find weakest attribute
        const minAttr = Math.min(attrs.strength, attrs.agility, attrs.intelligence, attrs.vitality, attrs.sense)
        
        let customBotMsg = null
        let customBotId = 'bot_kahn'
        const cleanUserName = currentUser.name.split(' ')[0]
        
        if (minAttr === attrs.intelligence) {
          customBotId = 'bot_monarch'
          customBotMsg = `@${cleanUserName}, your INT (Intelligence) node is fading in the Cognitive Matrix. Log some study hours or clear the Revision Gate!`
        } else if (minAttr === attrs.strength) {
          customBotId = 'bot_kahn'
          customBotMsg = `@${cleanUserName}, your STR (Strength) attribute is low. Log a physical training workout to reinforce your Vanguard stats!`
        } else if (minAttr === attrs.agility) {
          customBotId = 'bot_lina'
          customBotMsg = `@${cleanUserName}, your AGI (Agility) is lacking. Build your routine chains in the Habits Chamber!`
        } else if (minAttr === attrs.vitality) {
          customBotId = 'bot_iron'
          customBotMsg = `@${cleanUserName}, vital signs indicate fatigue. Log your sleep and recovery in the Vitals log, or rest!`
        } else {
          customBotId = 'bot_shadow'
          customBotMsg = `@${cleanUserName}, your SEN (Sense) focus is decaying. Calming breathing in the Meditation Chamber will restore focus.`
        }

        // 35% chance to post a targeted mentor tip, otherwise standard guild LFG message
        const isTargeted = Math.random() < 0.4
        
        const botTemplates = [
          { userId: 'bot_kahn', msg: 'Need a tank for the D-Rank Goblin gate! Immediate entry.', name: 'IronFist Kahn' },
          { userId: 'bot_lina', msg: 'Ready to support. Clean records, B-rank healing certificate.', name: 'Healer Lina' },
          { userId: 'bot_flam', msg: 'White Tiger Guild is recruiting active C-rank hunters. Drop your CP below.', name: 'Flame Wielder' },
          { userId: 'bot_choi', msg: 'Hunters Guild S-rank raid starts in 30 minutes. Buffs active.', name: 'Guildmaster Choi' },
          { userId: 'bot_shadow', msg: 'Boss room is locked. We need a magic division supporter.', name: 'X Shadow' },
          { userId: 'bot_iron', msg: 'Help! Orc Lord is crushing our tank! Need immediate healer backing!', name: 'Iron Shield' },
          { userId: 'bot_monarch', msg: 'Has anyone seen the boss room in the Jeju dungeon? It looks insane.', name: 'Shadow Monarch' }
        ]
        
        const pick = isTargeted && customBotMsg 
          ? { userId: customBotId, msg: customBotMsg } 
          : botTemplates[Math.floor(Math.random() * botTemplates.length)]

        await d.collection('guild_chat').insertOne({
          id: uuid(),
          userId: pick.userId,
          msg: pick.msg,
          time: 'Just now',
          createdAt: now.toISOString()
        })
        chatLogs = await d.collection('guild_chat').find({}).sort({ createdAt: 1 }).toArray()
      }

      // Keep only last 40 logs
      if (chatLogs.length > 40) {
        const idsToRemove = chatLogs.slice(0, chatLogs.length - 40).map(c => c.id)
        await d.collection('guild_chat').deleteMany({ id: { $in: idsToRemove } })
        chatLogs = chatLogs.slice(-40)
      }

      // Map users
      const userIds = [...new Set(chatLogs.map(l => l.userId))].filter(id => !id.startsWith('bot_'))
      const users = await d.collection('users').find({ id: { $in: userIds } }, { projection: { id: 1, name: 1 } }).toArray()
      const userMap = {}
      users.forEach(u => {
        userMap[u.id] = u.id === currentUser.id ? `${u.name} (You)` : maskName(u.name, u.id)
      })

      // Map bots
      const botNames = {
        'bot_kahn': 'H-IK_kahn',
        'bot_lina': 'H-HL_lina',
        'bot_flam': 'H-FW_flam',
        'bot_choi': 'H-GC_choi',
        'bot_shadow': 'H-XS_shad',
        'bot_iron': 'H-IS_iron',
        'bot_monarch': 'H-SM_9999'
      }

      const enriched = chatLogs.map(l => ({
        user: l.userId.startsWith('bot_') ? botNames[l.userId] : (userMap[l.userId] || 'H-UN_xxxx'),
        msg: l.msg,
        time: 'Just now',
        userId: l.userId
      }))

      return ok(enriched)
    }

    if (path === 'guilds/chat' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const { msg } = body
      if (!msg) return err('Message is required')
      const d = await db()
      await d.collection('guild_chat').insertOne({
        id: uuid(),
        userId: currentUser.id,
        msg,
        time: 'Just now',
        createdAt: new Date().toISOString()
      })
      return ok({ success: true })
    }

    if (path === 'guilds/leaderboard' && method === 'GET') {
      if (!currentUser) return err('Unauthorized', 401)
      const d = await db()
      
      // Check cache
      const cached = await d.collection('leaderboard_cache').findOne({ id: 'cache' })
      let cachedData = cached?.data
      const cacheTime = cached?.updatedAt ? new Date(cached.updatedAt) : null
      const now = new Date()
      
      // If cache does not exist or is older than 24 hours (1 day), recalculate
      if (!cachedData || !cacheTime || (now - cacheTime) > 24 * 60 * 60 * 1000) {
        const allUsers = await d.collection('users').find({}, { projection: { id: 1, name: 1 } }).toArray()
        const leaderboard = []
        for (const u of allUsers) {
          const stats = await getStats(u.id)
          const cp = stats?.gameStats?.combatPower || 150
          const rnk = stats?.gameStats?.rank || 'E'
          const color = stats?.gameStats?.rankColor || '#94a3b8'
          leaderboard.push({
            id: u.id,
            userName: u.name,
            cp,
            rank: rnk,
            color
          })
        }
        
        leaderboard.sort((a, b) => b.cp - a.cp)
        
        cachedData = leaderboard.map((item, idx) => ({
          rank: idx + 1,
          id: item.id,
          userName: item.userName,
          cp: item.cp,
          hunterRank: `${item.rank}-Rank Hunter`,
          color: item.color
        }))
        
        await d.collection('leaderboard_cache').updateOne(
          { id: 'cache' },
          { $set: { data: cachedData, updatedAt: now.toISOString() } },
          { upsert: true }
        )
      }

      // Resolve personalized client names dynamically
      const resolved = cachedData.map(item => ({
        rank: item.rank,
        name: item.id === currentUser.id ? `${currentUser.name} (You)` : maskName(item.userName, item.id),
        cp: item.cp,
        hunterRank: item.hunterRank,
        color: item.color,
        isYou: item.id === currentUser.id
      }))

      return ok(resolved)
    }

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
      console.log(`[DIAGNOSTIC] GET /api/habits called by user ${currentUser.email} (${currentUser.id}). Found habits: ${habits.length}, returning enriched count: ${enriched.length}`)
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

    // GAME SYSTEMS
    if (path === 'game/allocate-stats' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const { strength = 0, agility = 0, intelligence = 0, vitality = 0, sense = 0 } = body
      const d = await db()
      const stats = await getStats(currentUser.id)
      const level = stats.gameStats.level
      const totalAvailable = Math.max(0, (level - 1) * 5)
      const requestedTotal = strength + agility + intelligence + vitality + sense
      if (requestedTotal > totalAvailable) {
        return err('Insufficient stat points available')
      }
      await d.collection('users').updateOne(
        { id: currentUser.id },
        { $set: { allocatedStats: { strength, agility, intelligence, vitality, sense } } }
      )
      return ok({ success: true, allocatedStats: { strength, agility, intelligence, vitality, sense } })
    }

    if (path === 'game/boss-raid' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const { goalId, action } = body
      const d = await db()
      if (action === 'start') {
        const goal = await d.collection('goals').findOne({ id: goalId, userId: currentUser.id })
        if (!goal) return err('Goal not found', 404)
        const activeRaid = {
          goalId,
          title: goal.title,
          health: 100,
          maxHealth: 100,
          combatLogs: [{ text: `A wild dungeon boss guarding milestone [${goal.title}] has appeared!`, time: new Date().toISOString() }],
          startedAt: new Date().toISOString()
        }
        await d.collection('users').updateOne({ id: currentUser.id }, { $set: { activeRaid } })
        return ok({ success: true, activeRaid })
      } else if (action === 'strike') {
        const userDoc = await d.collection('users').findOne({ id: currentUser.id })
        const activeRaid = userDoc.activeRaid
        if (!activeRaid) return err('No active boss raid found')
        const damage = Math.floor(Math.random() * 20) + 15
        const newHealth = Math.max(0, activeRaid.health - damage)
        const logText = `You performed a critical slash dealing ${damage} damage to the boss! (${newHealth}/100 HP remaining)`
        activeRaid.health = newHealth
        activeRaid.combatLogs.push({ text: logText, time: new Date().toISOString() })
        if (newHealth === 0) {
          activeRaid.combatLogs.push({ text: `VICTORY! The dungeon boss guarding [${activeRaid.title}] was defeated! You earned a massive XP bonus.`, time: new Date().toISOString() })
          await d.collection('study_logs').insertOne({
            id: uuid(),
            userId: currentUser.id,
            subject: 'Raid Victory',
            topic: activeRaid.title,
            date: today(),
            hours: 4,
            difficulty: 'hard',
            understanding: 5,
            notes: `Defeated the boss of milestone: ${activeRaid.title}`,
            createdAt: new Date().toISOString()
          })
        }
        await d.collection('users').updateOne({ id: currentUser.id }, { $set: { activeRaid } })
        return ok({ success: true, activeRaid })
      } else if (action === 'flee') {
        await d.collection('users').updateOne({ id: currentUser.id }, { $set: { activeRaid: null } })
        return ok({ success: true, activeRaid: null })
      }
    }

    if (path === 'game/streak-crucible' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const { action } = body
      const d = await db()
      if (action === 'start') {
        const streakCrucible = {
          active: true,
          taskType: 'Hard Study Session',
          desc: 'Study a subject of your choice for 3+ hours today to protect your streak from resetting.',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        await d.collection('users').updateOne({ id: currentUser.id }, { $set: { streakCrucible } })
        return ok({ success: true, streakCrucible })
      } else if (action === 'claim') {
        const stats = await getStats(currentUser.id)
        const todayHours = stats.todayStudy || 0
        if (todayHours >= 3) {
          await d.collection('users').updateOne({ id: currentUser.id }, { $set: { streakCrucible: null } })
          return ok({ success: true, message: 'Crucible completed! Your streak has been fully protected.', restored: true })
        } else {
          return err('Crucible conditions not met: You must log 3+ study hours today.')
        }
      }
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

    if (path === 'goku/speak') {
      try {
        const body = method === 'POST' ? await req.json() : {}
        const { text, voice = 'onyx' } = body
        if (!text) return err('Text required', 400)

        const openAiRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: voice,
            input: text
          })
        })

        if (!openAiRes.ok) {
          const errText = await openAiRes.text()
          return err(`OpenAI TTS Error: ${errText}`, 500)
        }

        const buffer = await openAiRes.arrayBuffer()
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
          },
        })
      } catch (error) {
        return err(error.message, 500)
      }
    }

    if (path === 'user/profile' && method === 'PATCH') {
      if (!currentUser) return err('Unauthorized', 401)
      const d = await db()
      const profileUpdate = {
        name: body.name,
        age: Number(body.age) || 0,
        weight: Number(body.weight) || 0,
        height: Number(body.height) || 0,
        waterNotifications: body.waterNotifications === true,
        waterInterval: Number(body.waterInterval) || 30,
        updatedAt: new Date().toISOString()
      }
      await d.collection('users').updateOne({ id: currentUser.id }, { $set: profileUpdate })
      const updatedUser = await d.collection('users').findOne({ id: currentUser.id }, { projection: { _id: 0, password: 0 } })
      return ok({ user: updatedUser })
    }

    if (path === 'user/send-report' && method === 'POST') {
      if (!currentUser) return err('Unauthorized', 401)
      const stats = await getStats(currentUser.id)
      const reportDate = today()
      const userName = currentUser.name || 'System User'
      const email = currentUser.email
      
      const reportContent = `
=========================================
SYSTEM DAILY PROGRESS REPORT
=========================================
Date: ${reportDate}
User: ${userName} (${email})

Daily Quest Summary:
- Study/Training Hours: ${stats?.todayStudy || 0} hrs
- Quests Completed: ${stats?.todayTasks || 0} / ${stats?.totalTasksToday || 0}
- Habits Aligned: ${stats?.todayHabits || 0} / ${stats?.totalHabits || 0}
- Continuous Login Streak: ${stats?.streak || 0} days

System Combat Attributes:
- Level: ${stats?.gameStats?.level || 1}
- Combat Power (CP): ${stats?.gameStats?.combatPower || 150}
- Mind Sharpness: ${stats?.gameStats?.mindSharpness || 100}%
- Strength: ${stats?.gameStats?.attributes?.strength || 10}
- Agility: ${stats?.gameStats?.attributes?.agility || 10}
- Intelligence: ${stats?.gameStats?.attributes?.intelligence || 10}
- Vitality: ${stats?.gameStats?.attributes?.vitality || 10}
- Sense: ${stats?.gameStats?.attributes?.sense || 10}

Plan Adherence: AI/Custom guidelines successfully followed.
=========================================
`
      console.log(`[EMAIL SEND SIMULATION] To: ${email}\nSubject: Daily Progress Report\nBody:\n${reportContent}`)
      return ok({ success: true, email, report: reportContent })
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
