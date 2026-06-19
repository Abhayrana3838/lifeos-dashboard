'use client'
import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        // Token invalid, clear it
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (e) {
      console.error('Failed to fetch user:', e)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const register = async (email, password, name) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
