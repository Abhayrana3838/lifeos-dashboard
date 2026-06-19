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
- MongoDB Atlas account (for production)
- OpenAI API key
- Razorpay account (for payments)

## Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd self-imorvemnet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `MONGO_URL`: MongoDB connection string
   - `DB_NAME`: Database name
   - `JWT_SECRET`: Secret key for JWT tokens
   - `OPENAI_API_KEY`: OpenAI API key
   - `RAZORPAY_KEY_ID`: Razorpay key ID
   - `RAZORPAY_KEY_SECRET`: Razorpay key secret

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment

1. **Push your code to GitHub**

2. **Create a MongoDB Atlas cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user with read/write permissions
   - Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

3. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel project settings:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/lifeos
     DB_NAME=lifeos
     JWT_SECRET=your-secure-random-secret
     OPENAI_API_KEY=your-openai-api-key
     RAZORPAY_KEY_ID=your-razorpay-key-id
     RAZORPAY_KEY_SECRET=your-razorpay-key-secret
     NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
     CORS_ORIGINS=https://your-app.vercel.app
     ```
   - Deploy

4. **Verify deployment**
   - Test authentication flow (signup/login)
   - Test API endpoints
   - Test payment integration (if using Razorpay)

### Render Deployment

1. **Create a MongoDB Atlas cluster** (same as above)

2. **Deploy to Render**
   - Go to [Render](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Configure:
     - Build Command: `npm run build`
     - Start Command: `npm start`
   - Add environment variables (same as Vercel)
   - Deploy

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/lifeos` |
| `DB_NAME` | Database name | `lifeos` |
| `JWT_SECRET` | Secret for JWT tokens | Generate a secure random string |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `your-secret` |
| `NEXT_PUBLIC_BASE_URL` | App base URL | `https://your-app.vercel.app` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://your-app.vercel.app` |

## MongoDB Setup

### Local Development
```bash
# Using local MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=lifeos
```

### Production (MongoDB Atlas)
```bash
# Using MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/lifeos?retryWrites=true&w=majority
DB_NAME=lifeos
```

## Authentication

The app uses JWT-based authentication:
- Users can sign up and log in via `/signup` and `/login`
- JWT tokens are stored in localStorage
- Tokens expire after 7 days
- All API endpoints require authentication (except auth endpoints)
- User data is isolated by `userId`

## Payment Integration

The app uses Razorpay for payments:
- Pricing: ₹10 (monthly), ₹51 (6 months), ₹101 (yearly)
- Payment flow: Create order → Razorpay checkout → Verify payment
- Subscription status stored in MongoDB

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (18+ required)
- Verify environment variables are set

### Database Connection Issues
- Verify MongoDB connection string is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Render/Vercel)
- Ensure database user has correct permissions

### Authentication Issues
- Verify JWT_SECRET is set and consistent
- Check token storage in localStorage
- Verify API endpoints are receiving the Authorization header

## License

MIT
