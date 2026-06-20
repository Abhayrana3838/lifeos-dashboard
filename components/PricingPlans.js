'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, Lock, Zap, Brain, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 10,
    duration: '1 month',
    features: [
      'AI Planner Access',
      'Advanced Analytics',
      'Neural Network Visualization',
      'Knowledge Galaxy',
      'All Advanced Visualizations',
      'Predictive Future',
      'Evolution Chamber',
      'Digital Brain',
      'Goku Power Companion',
      'RPG Stat Allocation',
      'Boss Raid System',
      'Streak Crucible',
      'AI Workout Generator',
      'Muscle Fatigue Tracking',
      'Memory Decay Metrics',
      'Growth Tree Storm Effects',
      'Synaptic Congestion Warnings',
      'Data Constellation Clustering',
      'Anatomical Body Map',
      'Dungeon Session Tracking',
      'Priority Support',
    ],
    popular: false,
  },
  {
    id: 'six-month',
    name: '6 Months',
    price: 51,
    duration: '6 months',
    features: [
      'AI Planner Access',
      'Advanced Analytics',
      'Neural Network Visualization',
      'Knowledge Galaxy',
      'All Advanced Visualizations',
      'Predictive Future',
      'Evolution Chamber',
      'Digital Brain',
      'Goku Power Companion',
      'RPG Stat Allocation',
      'Boss Raid System',
      'Streak Crucible',
      'AI Workout Generator',
      'Muscle Fatigue Tracking',
      'Memory Decay Metrics',
      'Growth Tree Storm Effects',
      'Synaptic Congestion Warnings',
      'Data Constellation Clustering',
      'Anatomical Body Map',
      'Dungeon Session Tracking',
      'Priority Support',
      '50% Savings',
    ],
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 101,
    duration: '1 year',
    features: [
      'AI Planner Access',
      'Advanced Analytics',
      'Neural Network Visualization',
      'Knowledge Galaxy',
      'All Advanced Visualizations',
      'Predictive Future',
      'Evolution Chamber',
      'Digital Brain',
      'Goku Power Companion',
      'RPG Stat Allocation',
      'Boss Raid System',
      'Streak Crucible',
      'AI Workout Generator',
      'Muscle Fatigue Tracking',
      'Memory Decay Metrics',
      'Growth Tree Storm Effects',
      'Synaptic Congestion Warnings',
      'Data Constellation Clustering',
      'Anatomical Body Map',
      'Dungeon Session Tracking',
      'Premium Support',
      '58% Savings',
    ],
    popular: false,
  },
]

export default function PricingPlans({ onSubscribe, loading }) {
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan.id)
    await onSubscribe(plan)
    setSelectedPlan(null)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30"
        >
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Unlock Premium Features</span>
        </motion.div>
        <h2 className="text-4xl font-black text-white tracking-tight">Choose Your Plan</h2>
        <p className="text-white/50 max-w-2xl mx-auto">
          Unlock AI-powered planning, advanced visualizations, and premium analytics to accelerate your personal growth journey.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-3xl p-6 border transition-all duration-300 ${
              plan.popular
                ? 'bg-gradient-to-b from-violet-500/10 to-cyan-500/10 border-violet-500/50 scale-105 shadow-2xl shadow-violet-500/20'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-xs font-bold text-white shadow-lg">
                  MOST POPULAR
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹{plan.price}</span>
                  <span className="text-white/50">/{plan.duration}</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={loading || selectedPlan === plan.id}
                className={`w-full py-6 text-base font-bold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {loading && selectedPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {plan.popular && <Sparkles className="w-4 h-4" />}
                    Subscribe Now
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-400" />
            Premium Features Include:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Brain, label: 'AI Planner', desc: 'Smart daily plan generation' },
              { icon: Zap, label: 'Advanced Analytics', desc: 'Deep insights & trends' },
              { icon: BarChart3, label: 'Neural Network Viz', desc: 'Interactive knowledge graphs' },
              { icon: Sparkles, label: 'Predictive Future', desc: 'Future projection models' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <item.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.label}</p>
                  <p className="text-xs text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-white/30">
        <p>Secure payments powered by Razorpay. Cancel anytime from your account settings.</p>
      </div>
    </div>
  )
}
