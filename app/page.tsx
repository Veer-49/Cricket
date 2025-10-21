'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthModal from '@/components/AuthModal'
import Dashboard from '@/components/Dashboard'
import { User } from '@/types'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('cricketUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setShowAuth(false)
    }
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    setShowAuth(false)
    localStorage.setItem('cricketUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setShowAuth(true)
    localStorage.removeItem('cricketUser')
  }

  if (showAuth) {
    return (
      <div className="min-h-screen royal-gradient royal-pattern flex items-center justify-center">
        <AuthModal onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Dashboard user={user} onLogout={handleLogout} />
    </motion.div>
  )
}
