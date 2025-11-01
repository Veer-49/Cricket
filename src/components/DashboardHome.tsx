'use client'

import { motion } from 'framer-motion'
import { User } from '@/types'
import { ActiveSection } from './Dashboard'
import { 
  MapPin, 
  Users, 
  UserCheck, 
  Target, 
  Shield, 
  BarChart3,
  Calendar,
  Trophy,
  TrendingUp,
  Activity,
  Bell
} from 'lucide-react'
import { TestNotifications } from '../services/testNotifications'
import toast from 'react-hot-toast'

interface DashboardHomeProps {
  user: User | null
  setActiveSection: (section: ActiveSection) => void
}

export default function DashboardHome({ user, setActiveSection }: DashboardHomeProps) {
  const quickActions = [
    { 
      id: 'ground', 
      title: 'Book Ground', 
      description: 'Find and book cricket grounds near you',
      icon: MapPin, 
      color: 'from-blue-500 to-blue-600',
      count: '12 Available',
      section: 'grounds' as ActiveSection
    },
    { 
      id: 'coach', 
      title: 'Book Coach', 
      description: 'Get professional coaching sessions',
      icon: Users, 
      color: 'from-green-500 to-green-600',
      count: '8 Coaches',
      section: 'coaches' as ActiveSection
    },
    { 
      id: 'umpire', 
      title: 'Book Umpire', 
      description: 'Professional umpires for your matches',
      icon: UserCheck, 
      color: 'from-purple-500 to-purple-600',
      count: '5 Available',
      section: 'umpires' as ActiveSection
    },
    { 
      id: 'nets', 
      title: 'Practice Nets', 
      description: 'Book practice nets for training',
      icon: Target, 
      color: 'from-orange-500 to-orange-600',
      count: '15 Nets',
      section: 'nets' as ActiveSection
    },
    { 
      id: 'team', 
      title: 'Create Team', 
      description: 'Build and manage your cricket team',
      icon: Shield, 
      color: 'from-red-500 to-red-600',
      count: 'Unlimited',
      section: 'teams' as ActiveSection
    },
    { 
      id: 'scoring', 
      title: 'Live Scoring', 
      description: 'Score matches in real-time',
      icon: BarChart3, 
      color: 'from-indigo-500 to-indigo-600',
      count: 'Pro Feature',
      section: 'scoring' as ActiveSection
    }
  ]

  const stats = [
    { label: 'Total Runs', value: user?.stats.totalRuns || 0, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Matches Played', value: user?.stats.matchesPlayed || 0, icon: Activity, color: 'text-blue-600' },
    { label: 'Strike Rate', value: user?.stats.overallStrikeRate.toFixed(1) || '0.0', icon: BarChart3, color: 'text-purple-600' },
    { label: 'Centuries', value: user?.stats.centuries || 0, icon: Trophy, color: 'text-yellow-600' }
  ]

  const recentMatches = [
    { id: 1, team1: 'Mumbai Warriors', team2: 'Delhi Capitals', result: 'Won by 6 wickets', date: '2024-01-15' },
    { id: 2, team1: 'Chennai Super', team2: 'Kolkata Knights', result: 'Lost by 12 runs', date: '2024-01-12' },
    { id: 3, team1: 'Bangalore Royal', team2: 'Hyderabad Sunrisers', result: 'Won by 4 runs', date: '2024-01-10' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="royal-gradient rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-white/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name}! 🏏</h1>
            <p className="text-blue-100 text-base sm:text-lg">Ready to play some cricket today?</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (user) {
                    TestNotifications.testBasicNotification(user.id)
                    toast.success('Testing notifications - check console!')
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Test Notifications
              </button>
              <button
                onClick={() => {
                  TestNotifications.checkSetupStatus()
                  toast.success('Check console for setup status')
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Debug Setup
              </button>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
          >
            <img 
              src="/logo.png" 
              alt="Pitch Pioneers Logo" 
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="royal-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setActiveSection(action.section)}
                className="royal-card p-4 sm:p-6 cursor-pointer group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{action.count}</span>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => setActiveSection(action.section)}
                    className="text-cricket-primary text-sm font-medium hover:underline cursor-pointer"
                  >
                    Get Started →
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Matches</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{match.team1} vs {match.team2}</p>
                  <p className="text-sm text-gray-600">{match.result}</p>
                </div>
                <span className="text-xs text-gray-500">{match.date}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-cricket-primary text-sm font-medium hover:underline">
            View All Matches
          </button>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Upcoming Bookings</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div>
                <p className="font-medium text-gray-800">Ground Booking</p>
                <p className="text-sm text-gray-600">Central Cricket Ground</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Today 6:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div>
                <p className="font-medium text-gray-800">Coaching Session</p>
                <p className="text-sm text-gray-600">Batting Technique</p>
              </div>
              <span className="text-xs text-blue-600 font-medium">Tomorrow 4:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <div>
                <p className="font-medium text-gray-800">Practice Nets</p>
                <p className="text-sm text-gray-600">Net 3 - Fast Bowling</p>
              </div>
              <span className="text-xs text-purple-600 font-medium">Jan 20, 5:00 PM</span>
            </div>
          </div>
          <button className="w-full mt-4 text-cricket-primary text-sm font-medium hover:underline">
            View All Bookings
          </button>
        </motion.div>
      </div>
    </div>
  )
}
