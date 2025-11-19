'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User } from '@/types'
import { AuthService } from '@/services/authService'
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
  const [showPasswordReset, setShowPasswordReset] = useState(false)


  const handlePasswordReset = async (email: string) => {
    try {
      await AuthService.resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
      setShowPasswordReset(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    }
  }

  const loginForm = useForm<LoginForm>()
  const signupForm = useForm<SignupForm>()
  const resetForm = useForm<{ email: string }>()

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      const user = await AuthService.signIn(data.email, data.password)
      toast.success('Welcome back!')
      onLogin(user)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    
    try {
      const user = await AuthService.signUp(data.email, data.password, data.name, data.phone)
      toast.success('Account created successfully!')
      onLogin(user)
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
        {showPasswordReset ? (
          <motion.div
            key="reset"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-4">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={resetForm.handleSubmit((data) => handlePasswordReset(data.email))} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...resetForm.register('email', { required: true })}
                  type="email"
                  placeholder="Email"
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
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </motion.button>
            </form>
            <button
              onClick={() => setShowPasswordReset(false)}
              className="text-cricket-primary font-semibold hover:underline mt-4"
            >
              Back to Login
            </button>
          </motion.div>
        ) : isLogin ? (
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
        
        {isLogin && (
          <button
            onClick={() => setShowPasswordReset(true)}
            className="text-sm text-cricket-primary font-semibold hover:underline"
          >
            Forgot your password?
          </button>
        )}
      </div>
    </motion.div>
  )
}
