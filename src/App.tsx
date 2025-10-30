import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import AuthModal from '@/components/AuthModal'
import Dashboard from '@/components/Dashboard'
import RomanticLoader from '@/components/RomanticLoader'
import { User } from '@/types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('cricketUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setShowAuth(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  const handleLogin = (userData: User) => {
    setUser(userData)
    setShowAuth(false)
    localStorage.setItem('cricketUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setShowAuth(true)
    setIsLoading(true) // Show romantic loader again when logging out
    localStorage.removeItem('cricketUser')
  }

  // Show romantic loading screen first
  if (isLoading) {
    return (
      <>
        <RomanticLoader onLoadingComplete={handleLoadingComplete} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </>
    )
  }

  if (showAuth) {
    return (
      <div className="min-h-screen royal-gradient royal-pattern flex items-center justify-center">
        <AuthModal onLogin={handleLogin} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </motion.div>
  )
}

export default App
