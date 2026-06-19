'use client'
import { motion } from 'framer-motion'
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LockedFeature({ featureName, onUpgrade }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center">
          <Lock className="w-10 h-10 text-violet-400" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-24 h-24 rounded-full border-2 border-dashed border-violet-500/20"
        />
      </motion.div>

      <div className="space-y-3 max-w-md">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Premium Feature
        </h2>
        <p className="text-white/60">
          <span className="font-semibold text-white">{featureName}</span> is available exclusively for premium subscribers.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        {[
          { icon: Sparkles, label: 'AI-Powered Planning', desc: 'Smart daily plans' },
          { icon: Crown, label: 'Advanced Analytics', desc: 'Deep insights' },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <item.icon className="w-5 h-5 text-violet-400 mb-2" />
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="text-xs text-white/40">{item.desc}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={onUpgrade}
        className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-bold text-base"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Upgrade to Unlock
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <p className="text-xs text-white/30">
        Starting at ₹100/month • Cancel anytime
      </p>
    </div>
  )
}
