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

  const premiumFeatures = {
    'ai-planner': ['monthly', 'six-month', 'yearly'],
    'advanced-analytics': ['six-month', 'yearly'],
    'neural-network': ['six-month', 'yearly'],
    'knowledge-galaxy': ['six-month', 'yearly'],
    'growth-tree': ['six-month', 'yearly'],
    'evolution': ['yearly'],
    'digital-brain': ['yearly'],
    'time-river': ['yearly'],
    'knowledge-fractal': ['yearly'],
    'predictive-future': ['yearly'],
    'data-constellation': ['six-month', 'yearly'],
    'basic': ['monthly', 'six-month', 'yearly'],
  }

  const allowedPlans = premiumFeatures[feature] || premiumFeatures['basic']
  return allowedPlans.includes(subscription.plan)
}
