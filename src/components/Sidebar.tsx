'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ActiveSection } from './Dashboard'
import { 
  Home, 
  MapPin, 
  Users, 
  UserCheck, 
  Target, 
  Shield, 
  BarChart3, 
  Trophy,
  User,
  X
} from 'lucide-react'

interface SidebarProps {
  activeSection: ActiveSection
  setActiveSection: (section: ActiveSection) => void
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'grounds', label: 'Book Ground', icon: MapPin },
  { id: 'coaches', label: 'Book Coach', icon: Users },
  { id: 'umpires', label: 'Book Umpire', icon: UserCheck },
  { id: 'nets', label: 'Practice Nets', icon: Target },
  { id: 'teams', label: 'Team Management', icon: Shield },
  { id: 'scoring', label: 'Live Scoring', icon: BarChart3 },
  { id: 'matches', label: 'Match History', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Sidebar({ activeSection, setActiveSection, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-white/95 via-gray-50/90 to-gray-100/85 backdrop-blur-xl shadow-2xl z-50 lg:translate-x-0 lg:static lg:z-auto border-r border-white/20
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full pt-16 lg:pt-20">
          {/* Close button for mobile */}
          <div className="lg:hidden absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 hover:text-cricket-primary hover:bg-cricket-light"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveSection(item.id as ActiveSection)
                      onClose()
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200
                      ${isActive 
                        ? 'bg-cricket-primary text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-cricket-light hover:text-cricket-primary'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-cricket-primary to-cricket-secondary rounded-lg p-4 text-white">
              <h3 className="font-semibold text-sm mb-1">Pro Features</h3>
              <p className="text-xs opacity-90 mb-3">
                Unlock advanced analytics and team management tools
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white text-cricket-primary text-sm font-semibold py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Upgrade Now
              </motion.button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
