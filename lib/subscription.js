'use client'
import { useState, useEffect, createContext, useContext } from 'react'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState({ isActive: false, plan: null, endDate: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/subscription/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setSubscription(data)
    } catch (e) {
      console.error('Failed to check subscription:', e)
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = () => checkSubscription()

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}

// Premium feature check - returns true if user has access
export function hasPremiumAccess(subscription, feature = 'basic') {
  if (!subscription.isActive) return false

  // All features are now available for all subscription plans
  const premiumFeatures = {
    'ai-planner': ['monthly', 'six-month', 'yearly'],
    'advanced-analytics': ['monthly', 'six-month', 'yearly'],
    'neural-network': ['monthly', 'six-month', 'yearly'],
    'knowledge-galaxy': ['monthly', 'six-month', 'yearly'],
    'growth-tree': ['monthly', 'six-month', 'yearly'],
    'evolution': ['monthly', 'six-month', 'yearly'],
    'digital-brain': ['monthly', 'six-month', 'yearly'],
    'time-river': ['monthly', 'six-month', 'yearly'],
    'knowledge-fractal': ['monthly', 'six-month', 'yearly'],
    'predictive-future': ['monthly', 'six-month', 'yearly'],
    'data-constellation': ['monthly', 'six-month', 'yearly'],
    'basic': ['monthly', 'six-month', 'yearly'],
  }

  const allowedPlans = premiumFeatures[feature] || premiumFeatures['basic']
  return allowedPlans.includes(subscription.plan)
}
