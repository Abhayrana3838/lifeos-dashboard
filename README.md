# LifeOS - Personal Growth Dashboard

A comprehensive personal growth tracking system with AI-powered planning, advanced visualizations, and premium features.

## Features

- **AI-Powered Daily Planning**: Generate personalized daily plans using OpenAI GPT-4
- **Advanced Visualizations**: Neural networks, knowledge galaxies, growth trees, and more
- **Comprehensive Tracking**: Study logs, habits, tasks, goals, journal, health, exercise, meditation
- **Premium Features**: Advanced analytics, predictive future modeling, evolution chamber
- **User Authentication**: Secure JWT-based authentication with user data isolation
- **Payment Integration**: Razorpay integration for subscription management

## Tech Stack

- **Frontend**: Next.js 14, React, Framer Motion, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT tokens with bcryptjs
- **AI**: OpenAI GPT-4 API
- **Payments**: Razorpay
- **Visualization**: D3.js, Three.js, Recharts

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free)
- OpenAI API key
- Razorpay account (for payments)

---

# 🚀 DEPLOYMENT GUIDE (Vercel)

## Step 1: Set Up MongoDB Atlas (Free)

### 1.1 Create Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Click "Try Free" → Create account
- Verify your email

### 1.2 Create Cluster
1. Click "Build a Database"
2. Select "M0" (Free tier)
3. Choose cloud provider: AWS
4. Choose region: Select closest to you (e.g., Mumbai, Singapore)
5. Cluster name: `lifeos-cluster` (or any name)
6. Click "Create"
7. Wait 2-3 minutes for cluster to be created

### 1.3 Create Database User
1. In MongoDB Atlas, click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Fill in:
   - **Username**: `lifeos`
   - **Password**: Create a strong password (save this!)
   - **Database User Privileges**: "Read and write to any database"
4. Click "Create User"

### 1.4 Get Connection String
1. In MongoDB Atlas, click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Select "Drivers" → "Connect your application"
4. Copy the connection string (it looks like this):
   ```
   mongodb+srv://lifeos:<password>@lifeos-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 1.5 Complete Your Connection String
Replace `<password>` with your actual password and add `/lifeos` at the end:

**Example:**
```
mongodb+srv://lifeos:MyStrongPassword123@lifeos-cluster.xxxxx.mongodb.net/lifeos?retryWrites=true&w=majority
```

**This is your MONGO_URL value.**

### 1.6 Allow Vercel Access
1. In MongoDB Atlas, click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (this adds 0.0.0.0/0)
4. Click "Confirm"

---

## Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Import to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `lifeos-dashboard`
4. Click "Import"

### 2.3 Configure Environment Variables
In Vercel project settings, add these environment variables:

```
MONGO_URL=mongodb+srv://lifeos:YOUR_PASSWORD@lifeos-cluster.xxxxx.mongodb.net/lifeos?retryWrites=true&w=majority
DB_NAME=lifeos
JWT_SECRET=generate-a-random-32-char-string-here-like-abc123xyz789
OPENAI_API_KEY=sk-proj-your-openai-key-here
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
CORS_ORIGINS=https://your-app-name.vercel.app
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your MongoDB password
- Replace `lifeos-cluster.xxxxx.mongodb.net` with your actual cluster URL
- Replace `your-app-name.vercel.app` with your actual Vercel URL after deployment
- Generate a random JWT_SECRET (use: https://randomkeygen.com/)

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete (2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

---

## Step 3: Test Your Deployment

### 3.1 Test Authentication
1. Visit your Vercel URL
2. Click "Create Account"
3. Fill in name, email, password
4. Click "Create Account"
5. You should be redirected to the dashboard

### 3.2 Test Database Connection
1. Create a task or study log
2. Refresh the page
3. Your data should persist

### 3.3 Test API Endpoints
- Signup: `/api/auth/register`
- Login: `/api/auth/login`
- Stats: `/api/stats`
- All endpoints require authentication

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://lifeos:pass@cluster.mongodb.net/lifeos` |
| `DB_NAME` | Database name | `lifeos` |
| `JWT_SECRET` | Secret for JWT tokens | `abc123xyz789def456ghi789jkl012mno345pqr678` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `your-secret` |
| `NEXT_PUBLIC_BASE_URL` | App base URL | `https://lifeos-dashboard.vercel.app` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://lifeos-dashboard.vercel.app` |

---

## Troubleshooting

### "Failed to connect to database"
- Check MONGO_URL is correct
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions
- Check MongoDB cluster is running

### "Unauthorized" errors
- Verify JWT_SECRET is set in Vercel
- Check user is logged in
- Verify token is stored in localStorage

### "Build failed"
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check for syntax errors in code

### Payment not working
- Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct
- Check Razorpay account is active
- Test with test mode first

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Local Environment
Create `.env.local` file:
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=lifeos
JWT_SECRET=local-dev-secret
OPENAI_API_KEY=your-openai-key
RAZORPAY_KEY_ID=rzp_test_your-key
RAZORPAY_KEY_SECRET=your-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Authentication System

- **Signup**: `/signup` - Create new account
- **Login**: `/login` - Sign in to existing account
- **JWT Tokens**: Stored in localStorage, expire after 7 days
- **User Isolation**: Each user has completely isolated data
- **Protected Routes**: All API endpoints require authentication

---

## Payment System

- **Pricing**: ₹10 (monthly), ₹51 (6 months), ₹101 (yearly)
- **Provider**: Razorpay
- **Flow**: Create order → Razorpay checkout → Verify payment
- **Subscription**: Stored in MongoDB with user ID

---

## Support

For issues or questions:
- Check MongoDB Atlas status
- Check Vercel deployment logs
- Verify all environment variables are set
- Check browser console for errors

---

## License

MIT
