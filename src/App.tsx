import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import AuthModal from '@/components/AuthModal'
import Dashboard from '@/components/Dashboard'
import { User } from '@/types'
import { NotificationService } from '@/services/fcmService'

function App() {
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

  // Initialize FCM when user logs in
  useEffect(() => {
    if (user) {
      NotificationService.initializeForUser(user.id)
    }
  }, [user])

  // Register service worker for notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
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
