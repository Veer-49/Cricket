'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from '@/types'
import { 
  User as UserIcon, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  BarChart3,
  Calendar,
  Star,
  Edit,
  Camera,
  Mail,
  Phone
} from 'lucide-react'

interface UserProfileProps {
  user: User | null
}

export default function UserProfile({ user }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements'>('overview')

  if (!user) return null

  const stats = [
    { label: 'Total Runs', value: user.stats.totalRuns, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Matches Played', value: user.stats.matchesPlayed, icon: Calendar, color: 'text-blue-600' },
    { label: 'Strike Rate', value: user.stats.overallStrikeRate.toFixed(1), icon: Target, color: 'text-purple-600' },
    { label: 'Centuries', value: user.stats.centuries, icon: Trophy, color: 'text-yellow-600' },
    { label: 'Half Centuries', value: user.stats.halfCenturies, icon: Award, color: 'text-orange-600' },
    { label: 'Wickets', value: user.stats.wickets, icon: Target, color: 'text-red-600' },
    { label: 'Fours', value: user.stats.fours, icon: Star, color: 'text-green-500' },
    { label: 'Sixes', value: user.stats.sixes, icon: Star, color: 'text-red-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-cricket-primary to-cricket-secondary rounded-full flex items-center justify-center">
              <UserIcon className="w-16 h-16 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-600">
              <div className="flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 mr-2" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="w-4 h-4 mr-2" />
                <span>{user.phone}</span>
              </div>
            </div>
            <div className="mt-4">
              <button className="btn-primary">
                <Edit className="inline w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="card p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'stats', label: 'Statistics' },
            { id: 'achievements', label: 'Achievements' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-cricket-primary shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.slice(0, 4).map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                >
                  <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Achievements Yet</h3>
            <p className="text-gray-600">Play more matches to unlock achievements!</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
