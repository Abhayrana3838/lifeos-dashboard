'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.token)
        router.push('/')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900/20 via-cyan-900/20 to-emerald-900/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-violet-500/30 bg-violet-950/20">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-black text-white tracking-tight">Create Account</CardTitle>
              <CardDescription className="text-white/60 mt-2">Start your personal growth journey today</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-violet-500 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-violet-500 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-violet-500 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-violet-500 pl-10"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-bold text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
