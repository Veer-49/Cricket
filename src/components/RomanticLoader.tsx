'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'

interface RomanticLoaderProps {
  onLoadingComplete: () => void
}

export default function RomanticLoader({ onLoadingComplete }: RomanticLoaderProps) {
  const [showHearts, setShowHearts] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onLoadingComplete(), 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Hearts animation
    setTimeout(() => setShowHearts(true), 1000)

    // Pulse animation for the main text
    const pulseInterval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.05 : 1)
    }, 1500)

    return () => {
      clearInterval(progressInterval)
      clearInterval(pulseInterval)
    }
  }, [onLoadingComplete])

  const heartPositions = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100"
    >
      {/* Floating Hearts Background */}
      <AnimatePresence>
        {showHearts && heartPositions.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: '100vh', opacity: 0, scale: 0 }}
            animate={{ 
              y: '-100vh', 
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute text-pink-300"
            style={{ left: `${heart.left}%` }}
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 3,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10">
        {/* Romantic Message */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-red-500 fill-current" />
            </motion.div>
            
            <motion.div className="text-center">
              {/* Main 'I Love You' text - big and consistent */}
              <motion.h1 
                className="text-8xl md:text-9xl font-bold text-red-500 mb-4 leading-tight"
                animate={{ 
                  scale: pulseScale,
                  textShadow: [
                    '0 0 20px rgba(239, 68, 68, 0.5)',
                    '0 0 40px rgba(239, 68, 68, 0.8)',
                    '0 0 20px rgba(239, 68, 68, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  fontFamily: 'serif',
                  textShadow: '0 0 30px rgba(239, 68, 68, 0.6)'
                }}
              >
                I LOVE YOU
              </motion.h1>
              
              {/* Litisha name - special highlight */}
              <motion.h2
                className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-rose-500 bg-clip-text text-transparent mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontFamily: 'serif',
                  backgroundSize: '200% 200%'
                }}
              >
                LITISHA
              </motion.h2>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >
              <Heart className="w-8 h-8 text-red-500 fill-current" />
            </motion.div>
          </div>

          {/* Romantic Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-gray-600 font-medium italic"
          >
            Loading something special for you... 💕
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="bg-white/50 rounded-full h-3 overflow-hidden shadow-lg">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 via-red-400 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <motion.p
            className="text-sm text-gray-500 mt-2 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {progress}% • Preparing your cricket experience with love
          </motion.p>
        </div>

        {/* Pulsing Hearts */}
        <div className="flex justify-center space-x-4 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity
              }}
            >
              <Heart className="w-6 h-6 text-pink-400 fill-current" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Romantic Border Effect */}
      <div className="absolute inset-0 border-4 border-gradient-to-r from-pink-300 via-red-300 to-purple-300 rounded-lg opacity-20" />
    </motion.div>
  )
}
