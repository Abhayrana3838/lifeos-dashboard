# 🔮 LifeOS — Production Architecture & Integration Handbook

> *"Within my domain, all attacks are guaranteed to hit. But more importantly — you will experience everything."*

Welcome to the comprehensive technical documentation for **LifeOS**, a gamified personal growth and productivity system inspired by *Solo Leveling* and *Jujutsu Kaisen*. This document serves as a full systems architecture guide, detailing everything from API routing and database synchronization to WebGL shader programming, serverless deployment pipelines, and scaling mechanics.

---

## 📋 1. Multi-Language & Technological Stack

The application employs a hybrid frontend/backend architecture leveraging modern web technologies and hardware-accelerated GPU pipelines:

| Language / Tech | Layer | Purpose | Key Implementations |
| :--- | :--- | :--- | :--- |
| **JavaScript (ES6+)** | Frontend & Backend | Application core logic, routing, UI rendering, authentication flow, and API controllers. | Next.js 14, React hooks, custom state providers. |
| **GLSL (OpenGL Shading Language)** | GPU / Canvas | Custom vertex and fragment shaders written to render real-time cinematic background domains. | Sukuna's *Malevolent Shrine* and Gojo's *Infinite Void* WebGL shaders in `DomainExpansion.js`. |
| **CSS3 (Vanilla + Tailwind)** | Frontend Layout | Interface styling, typography, variables, responsive design, and neon glow animations. | HSL theme tokens, animation keyframes for pulsing elements in `globals.css`. |
| **HTML5 & SVG** | Frontend Markup | Structural semantic DOM tags and interactive Vector graphics for graphs and stats. | D3-based network graphs, circular progress gauges, and SVG assets. |
| **Three.js / WebGL** | Frontend 3D | 3D coordinate space mapping and interactive particles visualization. | Starfield constellations and node mapping in `DataConstellation.js`. |
| **MongoDB Query Language** | Database | Database operations, projection parameters, queries, and atomic collection modifications. | Route handling controllers mapping transactions to database collections. |

---

## 🏗️ 2. System Architecture & Component Interconnections

Below is the detailed flow of a user interaction transaction, showing how data travels through the stack:

```mermaid
graph TD
    %% Frontend Layer
    subgraph Client [Client-Side Layer (React & WebGL)]
        UI[User Interface Components]
        GLSL[WebGL Shaders: DomainExpansion.js]
        Three[Three.js: DataConstellation.js]
        AuthCtx[AuthProvider: JWT Token Caching]
    end

    %% Routing & Authentication Layer
    subgraph API [Server-Side API Layer (Next.js Serverless)]
        Router[Next.js Dynamic Route: app/api/path/route.js]
        JWTV[JWT Authentication Filter]
        StatsEng[Solo Leveling stats Aggregator Engine]
    end

    %% Storage Layer
    subgraph Storage [Persistent Storage & External Integrations]
        Mongo[(Remote MongoDB Atlas Cluster)]
        LocalDB[(Local JSON DB: data/local_db.json)]
        OpenAI[OpenAI API: GPT-4o Suggestions]
        Razorpay[Razorpay Subscription Portal]
    end

    %% Connections
    UI -->|1. HTTP Action| Router
    AuthCtx -->|Appends Bearer Token| UI
    Router -->|2. Verify Token| JWTV
    JWTV -->|Token Valid| StatsEng
    StatsEng -->|3. Query Connection| Mongo
    
    %% Failover Mechanism
    Mongo -.->|4a. Connection Timeout / Failure| LocalDB
    Mongo -->|4b. Connected| Mongo
    
    StatsEng -->|Call OpenAI| OpenAI
    StatsEng -->|Verify Subscription| Razorpay
```

### Flow Lifecycle of a Request:
1. **Initiation**: The client React components (`page.js`) perform an HTTP request using the `api` client module, attaching the authentication token from `localStorage` under the `Authorization: Bearer <token>` header.
2. **Dynamic Routing**: Next.js catches all calls at `app/api/[...path]/route.js`. The path segments (e.g. `/api/habits/toggle`) are parsed from `params.path` to route to the correct controller block.
3. **Decryption & User Context**: The route handler decodes the JWT using `jsonwebtoken` and the `JWT_SECRET`. It queries the database to ensure the user exists, isolating all subsequent queries by `userId`.
4. **Data Squeeze / Aggregation**: If the client requests stats, the `getStats()` aggregator gathers data from 12 separate collections concurrently via `Promise.all` to calculate RPG attributes and Combat Power.
5. **Database Transaction**: The driver writes or updates MongoDB documents. If MongoDB Atlas has high latency or goes offline, it seamlessly fails over to `data/local_db.json` for that request.

---

## 📡 3. API Directory & Endpoint Map

The entire backend API is orchestrated dynamically within a single catch-all route handler at [route.js](file:///Users/abhaysinghrana/Desktop/self%20imorvemnet/app/api/%5B...path%5D/route.js). Below is the routing mapping table:

| HTTP Method | Route Path | Purpose | Database Collection | Auth Required | Input Payload / Query Parameters |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `auth/register` | Creates a new user profile, hashes password using `bcryptjs`. | `users` | No | `{ email, password, name }` |
| **POST** | `auth/login` | Validates credentials, signs JWT token valid for 7 days. | `users` | No | `{ email, password }` |
| **GET** | `auth/me` | Fetches active authenticated user details. | `users` | Yes | Bearer Token in Header |
| **GET** | `stats` | Aggregates all user logs, habits, and stats to compile RPG Combat Power. | *Multiple* | Yes | Bearer Token in Header |
| **POST** | `ai/suggest` | Generates suggestions for habits, quests, exercises, or reflections. | None (OpenAI) | Yes | `{ type: 'habit' \| 'quest' \| 'exercise' \| 'journal', context }` |
| **POST** | `ai/generate-daily-plan` | Generates a structured daily plan optimized by GPT-4o. | None (OpenAI) | Yes | User preferences, goals, and tasks |
| **GET** | `habits` | Retrieves habits list enriched with streak and today's completion status. | `habits`, `habit_logs` | Yes | Bearer Token in Header |
| **POST** | `habits` | Creates a new habit configuration. | `habits` | Yes | `{ name, icon, color, target }` |
| **POST** | `habits/:id/toggle` | Toggles habit completion status for the current day. | `habit_logs` | Yes | Path parameters |
| **DELETE**| `habits/:id` | Deletes a habit and all associated execution history logs. | `habits`, `habit_logs` | Yes | Path parameters |
| **GET** | `tasks` | Retrieves user's pending and completed tasks. | `tasks` | Yes | Bearer Token in Header |
| **POST** | `tasks` | Creates a new task / quest. | `tasks` | Yes | `{ title, description, priority, category, dueDate, status, type }` |
| **PATCH** | `tasks/:id` | Updates task parameters or marks status as complete. | `tasks` | Yes | `{ status: 'done', ... }` |
| **GET** | `guilds/chat` | Fetches active raid/guild lobby chat (simulating mentor bots). | `guild_chat` | Yes | Bearer Token in Header |
| **GET** | `guilds/leaderboard` | Returns ranks leaderboard ordered by Combat Power. | `leaderboard_cache`, `users` | Yes | Bearer Token in Header |

---

## 🗄️ 4. Database Schema & Fallover Sync Engine

When active, data is saved directly to **MongoDB Atlas**. If the remote cluster fails or times out, write and read operations are redirected transiently to `data/local_db.json`.

### Principal Document Schemas:

#### 1. User Document (`users` collection)
```json
{
  "id": "uuid-v4-string",
  "email": "user@gmail.com",
  "password": "bcrypt-hashed-string",
  "name": "Hunter Name",
  "createdAt": "ISO-8601-DateString",
  "allocatedStats": {
    "strength": 5,
    "agility": 3,
    "intelligence": 12,
    "vitality": 8,
    "sense": 4
  },
  "waterNotifications": true,
  "waterInterval": 30
}
```

#### 2. Habit Document (`habits` collection)
```json
{
  "id": "uuid-v4-string",
  "userId": "uuid-v4-user-id",
  "name": "Drink Water",
  "icon": "Activity",
  "color": "violet",
  "target": "daily",
  "createdAt": "ISO-8601-DateString"
}
```

#### 3. Habit Log Document (`habit_logs` collection)
```json
{
  "id": "uuid-v4-string",
  "habitId": "uuid-v4-habit-id",
  "userId": "uuid-v4-user-id",
  "date": "YYYY-MM-DD",
  "createdAt": "ISO-8601-DateString"
}
```

---

## 🚢 5. Deployment Pipeline & CI/CD workflow

Deployments are orchestrated via Vercel synced with GitHub:

```
[GitHub Repo Commit] ──> [Vercel Deployment Hook Triggered]
                                  │
                                  ▼
                        [Install Dependencies] (npm install)
                                  │
                                  ▼
                        [Next.js Production Build] (next build)
                                  │
                                  ▼
                        [Serverless Functions Bundling]
                                  │
                                  ▼
                        [Global Edge Deployment & CDN Cache Routing]
```

### Pipeline Integration Details:
1. **Webhook Hooks**: A commit pushed to the `main` branch triggers an automated build webhook in Vercel.
2. **Production Compilation**: Vercel runs `npm run build` (triggering Next.js compiler), compiling JSX into static pages and wrapping dynamic route modules (like `/api/[...path]`) into standalone, auto-scaling serverless Node.js functions.
3. **Variable Injection**: Production secrets (such as `MONGO_URL` and `OPENAI_API_KEY`) are dynamically injected by Vercel into the runtime environment container at boot.

---

## 📈 6. Scalability, Connection Pooling & Edge Optimization

To sustain hundreds of concurrent users without database locks or server exhaustion:

### 1. MongoDB Connection Pooling
In serverless environments, dynamic function invocations boot up and scale down constantly. If every function call opened a new database connection, MongoDB would run out of available sockets.
*   **Persistent Reuse**: The `MongoClient` connection is declared outside the serverless function handler (`let client = null`). In Node.js, the environment remains warm between short invocations, allowing subsequent requests to reuse the connected socket pool:
```javascript
client = new MongoClient(mongoUrl, {
  maxPoolSize: 10,              // Up to 10 concurrent requests handled per container instance
  minPoolSize: 2,               // Keeps 2 sockets warm to avoid connection handshake cold-starts
  maxIdleTimeMS: 30000,         // Clears idle connections after 30s
  serverSelectionTimeoutMS: 5000 // Fails over to local fallback quickly if Atlas fails to respond in 5s
})
```

### 2. Horizontal Serverless Scaling
Next.js API routes scale horizontally automatically on Vercel's infrastructure. 
*   **Stateless Execution**: The API layer stores no sessions or states in memory. If 1,000 users call `/api/stats` simultaneously, Vercel spins up separate isolated function containers instantly, distributing the traffic.
*   **Leaderboard Caching**: The Leaderboard recalculates CP averages across all users. Executing this on every hit is extremely expensive ($12N$ MongoDB queries). We use a cache collection (`leaderboard_cache`) that holds calculated rankings. The server queries the database users only once every **24 hours**, dramatically reducing load and database stress under scale.

### 3. GPU Rendering & WebGL Optimization
*   **Offloading Layout Calculations**: Animations (like JJK domain expansions) run on HTML5 Canvas using WebGL shaders. This offloads visual math directly to the client's GPU, meaning the local client CPU and our server CPU usage remain at 0% regardless of how many users are browsing the site.
*   **Component Mounting**: The 3D constellations (`DataConstellation.js`) are dynamically imported with `ssr: false` to keep initial server loads lightweight.

---

## 📁 7. Project File Structure & Component Hierarchy

```
lifeos-dashboard/
├── app/
│   ├── api/
│   │   └── [...path]/
│   │       └── route.js              # Single catch-all API handler (all routes)
│   ├── page.js                       # Main application component (all UI logic)
│   ├── layout.js                     # Root layout with providers
│   └── globals.css                   # Global styles and animations
├── components/
│   ├── PricingPlans.js               # Subscription pricing UI
│   ├── GuildChamber.js               # Guild/raid system
│   ├── DataConstellation.js         # 3D knowledge visualization
│   └── InteractionFX.js             # Particle effects system
├── lib/
│   ├── subscription.js              # Subscription access control
│   └── utils.js                     # Utility functions
├── data/
│   └── local_db.json                 # Fallback local database
├── .env.local                       # Local environment variables
├── package.json                     # Dependencies and scripts
└── README.md                        # This documentation
```

### Component Data Flow Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     app/page.js (Main App)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management:                                    │   │
│  │  - active (current section)                          │   │
│  │  - stats (aggregated user data)                      │   │
│  │  - user (authenticated user object)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  renderSection() - Conditional Component Renderer    │   │
│  │  Switch statement returns appropriate component     │   │
│  │  based on 'active' state                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐                │
│         ▼                 ▼                 ▼                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Habits   │    │ Tasks    │    │ Study    │             │
│  │ Component│    │ Component│    │ Tracker  │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           ▼                                  │
│              ┌──────────────────────┐                       │
│              │  api.get/post/patch  │                       │
│              │  (HTTP Client Layer)  │                       │
│              └──────────────────────┘                       │
│                           │                                  │
│                           ▼                                  │
│              ┌──────────────────────┐                       │
│              │  app/api/[...path]   │                       │
│              │  /route.js           │                       │
│              │  (API Handler)        │                       │
│              └──────────────────────┘                       │
│                           │                                  │
│                           ▼                                  │
│              ┌──────────────────────┐                       │
│              │  MongoDB / Local DB  │                       │
│              └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 8. Authentication & Security Architecture

### JWT Authentication Flow:

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       ▼
┌─────────────────────────┐
│  API Route Handler      │
│  app/api/[...path]/     │
│  route.js               │
└──────────┬──────────────┘
           │
           │ 2. Find user in MongoDB
           ▼
┌─────────────────────────┐
│  bcrypt.compare()       │
│  Verify password hash   │
└──────────┬──────────────┘
           │
           │ 3. Generate JWT Token
           ▼
┌─────────────────────────┐
│  jwt.sign()             │
│  { userId, email }      │
│  expiresIn: '7d'        │
└──────────┬──────────────┘
           │
           │ 4. Return token
           ▼
┌─────────────┐
│   User      │
│  Browser    │
│  localStorage.setItem(  │
│    'token',  │
│    jwt_token │
│  )           │
└─────────────┘
```

### Token Validation Middleware:

Every API request goes through this validation process:

```javascript
// In app/api/[...path]/route.js
const token = req.headers.get('authorization')?.replace('Bearer ', '')
if (!token) return err('Unauthorized', 401)

const decoded = verifyToken(token) // jwt.verify()
if (!decoded) return err('Invalid token', 401)

const currentUser = await db().collection('users')
  .findOne({ id: decoded.userId })
if (!currentUser) return err('User not found', 401)
```

### Security Features:

1. **Password Hashing**: All passwords are hashed using `bcryptjs` with salt rounds of 10
2. **Token Expiration**: JWT tokens expire after 7 days
3. **User Isolation**: All database queries are filtered by `userId` to prevent data access between users
4. **Environment Variables**: Sensitive data (API keys, database URLs) are never committed to code
5. **CORS Protection**: Only specified origins can access the API

---

## 🔄 9. Data Flow & State Management

### Frontend State Architecture:

The application uses a hybrid state management approach:

```javascript
// Global State (in app/page.js)
const [user, setUser] = useState(null)           // Auth state
const [stats, setStats] = useState(null)         // Aggregated stats
const [active, setActive] = useState('dashboard') // Navigation state

// Component-Level State (in individual components)
const [habits, setHabits] = useState([])         // Habits component
const [tasks, setTasks] = useState([])           // Tasks component
```

### Data Synchronization Flow:

```
User Action (e.g., toggle habit)
        │
        ▼
Component State Update (optimistic)
        │
        ▼
API Call (api.post('habits/:id/toggle'))
        │
        ▼
Database Update (MongoDB)
        │
        ▼
API Response (success/error)
        │
        ▼
Component State Refresh (loadHabits())
        │
        ▼
Parent State Refresh (refresh())
        │
        ▼
UI Re-render with new data
```

### API Client Implementation:

```javascript
// In app/page.js
const api = {
  get: (p, _t) => {
    const token = _t || getToken()
    return fetch(`/api/${p}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  },
  post: (p, body, _t) => {
    const token = _t || getToken()
    return fetch(`/api/${p}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
  },
  // ... patch, del methods
}
```

---

## 🚀 10. Detailed Deployment Architecture

### Vercel Serverless Function Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                      │
│  (Global CDN with 35+ data centers worldwide)               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel Serverless Functions                  │
│  (Auto-scaling Node.js containers)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Function 1: /api/auth/*                           │   │
│  │  Function 2: /api/habits/*                         │   │
│  │  Function 3: /api/tasks/*                          │   │
│  │  Function 4: /api/stats/*                          │   │
│  │  ... (each route is a separate function)           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Cluster                     │
│  (Multi-region replica set with automatic failover)          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Primary    │  │  Secondary  │  │  Secondary  │         │
│  │  (Mumbai)   │  │  (Singapore)│  │  (Virginia) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Build Process:

```bash
# 1. Dependency Installation
npm install
# Downloads all packages from package.json
# - next@14.2.3
# - react@18.3.1
# - framer-motion@11.0.0
# - mongodb@6.3.0
# - ... (150+ dependencies)

# 2. Production Build
npm run build
# Next.js compiler processes:
# - Compiles JSX to JavaScript
# - Optimizes images and assets
# - Generates static pages
# - Bundles serverless functions
# - Creates .next/ directory with build artifacts

# 3. Deployment
vercel deploy
# Uploads build artifacts to Vercel
# - Static assets → CDN
# - Serverless functions → Edge network
# - Environment variables → Runtime config
```

### Environment Variable Injection:

Vercel injects environment variables at runtime:

```javascript
// In app/api/[...path]/route.js
const mongoUrl = process.env.MONGO_URL
const jwtSecret = process.env.JWT_SECRET
const openaiKey = process.env.OPENAI_API_KEY

// These are set in Vercel dashboard:
// Settings → Environment Variables
```

---

## 📊 11. Performance Monitoring & Optimization

### Database Query Optimization:

1. **Indexing Strategy**:
   - `users` collection: Index on `email` (unique)
   - `habits` collection: Index on `userId` + `createdAt`
   - `habit_logs` collection: Index on `habitId` + `date`
   - `tasks` collection: Index on `userId` + `status`

2. **Projection Optimization**:
   ```javascript
   // Only return needed fields
   .find(filter, { projection: { _id: 0 } })
   ```

3. **Limit Results**:
   ```javascript
   // Prevent large result sets
   .limit(1000)
   ```

### Frontend Performance:

1. **Code Splitting**:
   ```javascript
   // Dynamic imports for heavy components
   const DataConstellation = dynamic(() => import('@/components/DataConstellation'), {
     ssr: false,
     loading: () => <div>Loading...</div>
   })
   ```

2. **Image Optimization**:
   - Next.js Image component for automatic optimization
   - WebP format conversion
   - Lazy loading

3. **Memoization**:
   ```javascript
   // Prevent unnecessary re-renders
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
   ```

---

## 🔧 12. Error Handling & Logging

### API Error Handling:

```javascript
// Standardized error responses
const err = (message, status = 400) => 
  NextResponse.json({ error: message }, { status })

const ok = (data, status = 200) => 
  NextResponse.json(data, { status })
```

### Database Error Handling:

```javascript
try {
  const result = await db().collection('habits').insertOne(doc)
  return ok(result)
} catch (error) {
  console.error('Database error:', error)
  // Fallback to local DB
  const localDb = new MockDb()
  return ok(await localDb.collection('habits').insertOne(doc))
}
```

### Frontend Error Handling:

```javascript
// API call error handling
api.get('habits')
  .then(setHabits)
  .catch(e => {
    console.error('Habits load error:', e)
    toast.error(`Failed to load habits: ${e.message}`)
  })
```

---

## 🌐 13. CORS & Cross-Origin Configuration

### CORS Setup:

```javascript
// In app/api/[...path]/route.js
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']

// Response headers
headers: {
  'Access-Control-Allow-Origin': corsOrigins.includes(origin) ? origin : corsOrigins[0],
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
}
```

### Pre-flight Handling:

```javascript
if (method === 'OPTIONS') {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigins[0],
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
```

---

## 📱 14. Mobile Responsiveness & Adaptive Design

### Breakpoint Strategy:

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Responsive Components:

```javascript
// Conditional rendering based on screen size
<div className="hidden lg:flex"> {/* Desktop only */}
  <Sidebar />
</div>

<div className="lg:hidden"> {/* Mobile only */}
  <MobileHeader />
</div>
```

---

## 🧪 15. Testing Strategy

### Manual Testing Checklist:

- [ ] User registration and login
- [ ] Habit creation, toggle, deletion
- [ ] Task creation and completion
- [ ] Study log tracking
- [ ] Stats aggregation
- [ ] AI suggestions
- [ ] Payment flow
- [ ] Mobile responsiveness
- [ ] Database failover
- [ ] Token expiration

### API Testing:

```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:3000/api/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚨 16. Troubleshooting Guide

### Common Issues:

1. **MongoDB Connection Timeout**:
   - Check network access whitelist (0.0.0.0/0)
   - Verify connection string format
   - Check cluster status in MongoDB Atlas

2. **JWT Token Invalid**:
   - Verify JWT_SECRET matches between environments
   - Check token expiration (7 days)
   - Clear localStorage and re-login

3. **Build Failures**:
   - Ensure Node.js version 18+
   - Delete node_modules and reinstall
   - Check for syntax errors

4. **Payment Failures**:
   - Verify Razorpay credentials
   - Check test mode vs production
   - Ensure webhook URL is correct

---

## 📞 17. Support & Maintenance

### Monitoring:

- **Vercel Analytics**: Page views, performance metrics
- **MongoDB Atlas**: Database performance, slow queries
- **OpenAI Usage**: API call counts, costs

### Backup Strategy:

- **MongoDB Atlas**: Automated daily backups
- **Local JSON DB**: Manual backup of data/local_db.json
- **GitHub**: Code version control

### Update Frequency:

- **Dependencies**: Monthly security updates
- **Features**: Based on user feedback
- **Documentation**: Continuous improvement

---

## 🎯 18. Future Enhancements

### Planned Features:

- [ ] Real-time collaboration (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline mode (Service Workers)
- [ ] AI-powered habit recommendations
- [ ] Social features (friend challenges)
- [ ] Integration with fitness trackers
- [ ] Voice commands

### Technical Improvements:

- [ ] GraphQL API
- [ ] Redis caching layer
- [ ] Microservices architecture
- [ ] Automated testing suite
- [ ] CI/CD pipeline enhancements

---

## 📜 19. License & Attribution

**License**: MIT License

**Attribution**:
- Inspired by *Solo Leveling* and *Jujutsu Kaisen*
- Built with Next.js, MongoDB, OpenAI
- Deployed on Vercel

---

## 🙏 20. Acknowledgments

Special thanks to:
- The open-source community
- Next.js team for the amazing framework
- MongoDB for the reliable database
- OpenAI for the powerful AI capabilities
- Vercel for seamless deployment

---

*Last Updated: June 2026*
*Version: 2.0.0*
*Architecture Document*
