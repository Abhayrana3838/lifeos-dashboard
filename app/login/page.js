'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'

/* Load the WebGL domain without SSR */
const DomainExpansion = dynamic(() => import('@/components/DomainExpansion'), { ssr: false })

/* ── Domain Activation Text ──────────────────────────────────────── */
const ACTIVATION_LINES = [
  { text: '呪術廻戦', sub: 'JUJUTSU KAISEN' },
  { text: '領域展開', sub: 'DOMAIN EXPANSION' },
  { text: '伏魔御廚子', sub: 'MALEVOLENT SHRINE' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activated, setActivated] = useState(false)
  const [activationStep, setActivationStep] = useState(0)
  const [showForm, setShowForm] = useState(false)

  /* Play the domain expansion cinematic on mount */
  useEffect(() => {
    const t1 = setTimeout(() => setActivated(true),  400)
    const t2 = setTimeout(() => setActivationStep(1), 1200)
    const t3 = setTimeout(() => setActivationStep(2), 2000)
    const t4 = setTimeout(() => setShowForm(true),    2900)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        router.push('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('An error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}>
      {/* ── Sukuna's Malevolent Shrine ── */}
      <DomainExpansion domain="sukuna" />

      {/* ── Domain activation cinematic overlay ── */}
      <AnimatePresence>
        {activated && activationStep < 3 && (
          <motion.div
            className="fixed inset-0 z-20 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            {ACTIVATION_LINES.slice(0, activationStep + 1).map((line, i) => (
              <motion.div
                key={i}
                className="text-center mb-4"
                initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="font-black tracking-tight"
                  style={{
                    fontSize: i === 0 ? '1.4rem' : i === 1 ? '2.8rem' : '3.6rem',
                    color: i === 2 ? '#dc2626' : i === 1 ? '#ef4444' : '#991b1b',
                    textShadow: `0 0 40px ${i === 2 ? '#dc2626' : '#991b1b'}, 0 0 80px rgba(220,38,38,0.4)`,
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: i === 0 ? '0.3em' : '0.15em',
                  }}
                >
                  {line.text}
                </div>
                <div
                  style={{
                    color: 'rgba(239,68,68,0.6)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.4em',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: '2px',
                  }}
                >
                  {line.sub}
                </div>
              </motion.div>
            ))}

            {/* Slash lines across the screen during activation */}
            {activationStep >= 1 && (
              <>
                {[15, 35, 55, 70, 85].map((top, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-0 right-0"
                    style={{
                      top: `${top}%`,
                      height: '1px',
                      background: `linear-gradient(90deg, transparent, rgba(220,38,38,${0.3 + i * 0.1}), transparent)`,
                      transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (2 + i)}deg)`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Login form (appears after domain activates) ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Card — shrine-style border */}
              <div
                style={{
                  background: 'rgba(4, 1, 1, 0.85)',
                  border: '1px solid rgba(185, 28, 28, 0.4)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 0 60px rgba(185,28,28,0.2), inset 0 1px 0 rgba(239,68,68,0.1)',
                  padding: '2.5rem',
                }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  {/* Sukuna's mark / cursed symbol */}
                  <motion.div
                    className="w-16 h-16 mx-auto mb-5 relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Outer ring */}
                      <circle cx="32" cy="32" r="30" stroke="rgba(220,38,38,0.6)" strokeWidth="1.5" />
                      {/* Inner ring */}
                      <circle cx="32" cy="32" r="20" stroke="rgba(220,38,38,0.4)" strokeWidth="1" />
                      {/* 4 blades (Sukuna's cursed marks) */}
                      {[0, 90, 180, 270].map((angle, i) => (
                        <line
                          key={i}
                          x1="32" y1="32"
                          x2={32 + 28 * Math.cos((angle * Math.PI) / 180)}
                          y2={32 + 28 * Math.sin((angle * Math.PI) / 180)}
                          stroke="rgba(239,68,68,0.8)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      ))}
                      {/* 4 diagonal marks */}
                      {[45, 135, 225, 315].map((angle, i) => (
                        <line
                          key={i}
                          x1={32 + 8 * Math.cos((angle * Math.PI) / 180)}
                          y1={32 + 8 * Math.sin((angle * Math.PI) / 180)}
                          x2={32 + 20 * Math.cos((angle * Math.PI) / 180)}
                          y2={32 + 20 * Math.sin((angle * Math.PI) / 180)}
                          stroke="rgba(239,68,68,0.5)"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Center eye */}
                      <circle cx="32" cy="32" r="4" fill="rgba(220,38,38,0.9)" />
                      <circle cx="32" cy="32" r="2" fill="#7f1d1d" />
                    </svg>
                  </motion.div>

                  <h1
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    Enter the Domain
                  </h1>
                  <p style={{ color: 'rgba(239,68,68,0.6)', fontSize: '0.75rem', marginTop: '6px', letterSpacing: '0.15em', fontFamily: "'JetBrains Mono', monospace" }}>
                    MALEVOLENT SHRINE · CURSED AUTHENTICATION
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" style={{ color: 'rgba(239,68,68,0.8)', fontSize: '0.78rem', letterSpacing: '0.08em' }}>
                      SORCERER ID (EMAIL)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sorcerer@jujutsu.tech"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        marginTop: '6px',
                        background: 'rgba(127,29,29,0.15)',
                        border: '1px solid rgba(185,28,28,0.35)',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" style={{ color: 'rgba(239,68,68,0.8)', fontSize: '0.78rem', letterSpacing: '0.08em' }}>
                      CURSED TECHNIQUE (PASSWORD)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        marginTop: '6px',
                        background: 'rgba(127,29,29,0.15)',
                        border: '1px solid rgba(185,28,28,0.35)',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(220,38,38,0.1)',
                        border: '1px solid rgba(220,38,38,0.3)',
                        color: '#f87171',
                        fontSize: '0.85rem',
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: loading
                        ? 'rgba(127,29,29,0.4)'
                        : 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%)',
                      border: '1px solid rgba(220,38,38,0.5)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      letterSpacing: '0.08em',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: '0 0 30px rgba(220,38,38,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Entering Domain...</>
                    ) : (
                      <>'領域展開' · ENTER <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </form>

                {/* Sign up link */}
                <p style={{ color: 'rgba(239,68,68,0.45)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                  New sorcerer?{' '}
                  <a
                    href="/signup"
                    style={{ color: 'rgba(239,68,68,0.8)', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Awaken your cursed energy →
                  </a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
