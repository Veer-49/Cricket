'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, PlayerStats } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import { UserPlus, LogIn, Mail, Phone, Lock, User as UserIcon } from 'lucide-react'

interface AuthModalProps {
  onLogin: (user: User) => void
}

interface LoginForm {
  email: string
  password: string
}

interface SignupForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Clear localStorage for testing
  const clearStorage = () => {
    localStorage.removeItem('cricketUsers')
    localStorage.removeItem('cricketUser')
    toast.success('Storage cleared! You can now create new accounts.')
  }

  // Create demo user for testing
  const createDemoUser = () => {
    const demoUser = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@cricket.com',
      phone: '+1234567890',
      password: 'demo123',
      stats: {
        totalRuns: 150,
        totalBalls: 120,
        fours: 12,
        sixes: 3,
        wickets: 5,
        overallStrikeRate: 125.0,
        centuries: 0,
        halfCenturies: 1,
        hatTricks: 0,
        matchesPlayed: 3,
        totalOvers: 8,
        runsGiven: 45,
        economyRate: 5.6
      },
      createdAt: new Date()
    }
    
    const users = JSON.parse(localStorage.getItem('cricketUsers') || '[]')
    const existingDemo = users.find((u: any) => u.email === 'demo@cricket.com')
    if (!existingDemo) {
      users.push(demoUser)
      localStorage.setItem('cricketUsers', JSON.stringify(users))
      toast.success('Demo user created! Email: demo@cricket.com, Password: demo123')
    } else {
      toast.success('Demo user already exists! Email: demo@cricket.com, Password: demo123')
    }
  }

  const loginForm = useForm<LoginForm>()
  const signupForm = useForm<SignupForm>()

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('cricketUsers') || '[]')
      const user = users.find((u: any) => u.email === data.email && u.password === data.password)
      
      if (user) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = user
        toast.success('Welcome back!')
        onLogin(userWithoutPassword)
      } else {
        toast.error('Invalid email or password')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('cricketUsers') || '[]')
      const existingUser = users.find((u: User) => u.email === data.email)
      
      if (existingUser) {
        toast.error('User already exists')
        setIsLoading(false)
        return
      }

      const newUser: any = {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password, // Store password for authentication
        stats: {
          totalRuns: 0,
          totalBalls: 0,
          fours: 0,
          sixes: 0,
          wickets: 0,
          overallStrikeRate: 0,
          centuries: 0,
          halfCenturies: 0,
          hatTricks: 0,
          matchesPlayed: 0,
          totalOvers: 0,
          runsGiven: 0,
          economyRate: 0
        },
        createdAt: new Date()
      }

      users.push(newUser)
      localStorage.setItem('cricketUsers', JSON.stringify(users))
      
      // Remove password from user object before login
      const { password, ...userWithoutPassword } = newUser
      toast.success('Account created successfully!')
      onLogin(userWithoutPassword)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="royal-card p-8 w-full max-w-md mx-4"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="w-28 h-28 mx-auto mb-4"
        >
          <img 
            src="/logo.png" 
            alt="Pitch Pioneers Logo" 
            className="w-full h-full object-contain"
          />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Pitch Pioneers</h2>
        <p className="text-gray-600">Your complete cricket management solution</p>
      </div>

      <div className="flex mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 px-4 rounded-l-lg font-semibold transition-all duration-300 ${
            isLogin 
              ? 'bg-cricket-primary text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LogIn className="inline w-4 h-4 mr-2" />
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 px-4 rounded-r-lg font-semibold transition-all duration-300 ${
            !isLogin 
              ? 'bg-cricket-primary text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <UserPlus className="inline w-4 h-4 mr-2" />
          Sign Up
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.form
            key="login"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...loginForm.register('email', { required: true })}
                type="email"
                placeholder="Email"
                className="input-field pl-12"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...loginForm.register('password', { required: true })}
                type="password"
                placeholder="Password"
                className="input-field pl-12"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={signupForm.handleSubmit(handleSignup)}
            className="space-y-4"
          >
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...signupForm.register('name', { required: true })}
                type="text"
                placeholder="Full Name"
                className="input-field pl-12"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...signupForm.register('email', { required: true })}
                type="email"
                placeholder="Email"
                className="input-field pl-12"
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...signupForm.register('phone', { required: true })}
                type="tel"
                placeholder="Phone Number"
                className="input-field pl-12"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...signupForm.register('password', { required: true })}
                type="password"
                placeholder="Password"
                className="input-field pl-12"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...signupForm.register('confirmPassword', { required: true })}
                type="password"
                placeholder="Confirm Password"
                className="input-field pl-12"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cricket-primary font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
        
        <div className="border-t pt-3 space-y-2">
          <button
            onClick={createDemoUser}
            className="text-xs text-gray-500 hover:text-gray-700 underline block mx-auto"
          >
            Create Demo User for Testing
          </button>
          <button
            onClick={clearStorage}
            className="text-xs text-red-500 hover:text-red-700 underline block mx-auto"
          >
            Clear Storage (Reset)
          </button>
          <p className="text-xs text-gray-400 mt-1">
            Demo Credentials: demo@cricket.com / demo123
          </p>
        </div>
      </div>
    </motion.div>
  )
}
