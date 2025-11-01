'use client'

import { motion } from 'framer-motion'
import { User } from '@/types'
import { Menu, Bell, Search, LogOut, User as UserIcon, QrCode } from 'lucide-react'
import { useState } from 'react'
import { QRScanner } from './QRScanner'
import toast from 'react-hot-toast'

interface NavbarProps {
  user: User | null
  onLogout: () => void
  onMenuClick: () => void
}

export default function Navbar({ user, onLogout, onMenuClick }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  const handleQRScanSuccess = (result: string) => {
    try {
      // Check if it's a join URL or team code
      if (result.includes('/join/')) {
        // Extract short code from URL
        const shortCode = result.split('/join/')[1]?.split('?')[0] // Remove query params if any
        if (shortCode) {
          toast.success(`Team code found: ${shortCode}`)
          // Since this is a SPA, we'll need to trigger navigation differently
          // For now, we'll copy the team code and show instructions
          navigator.clipboard.writeText(shortCode)
          toast.success(`Team code "${shortCode}" copied! Go to Teams → Join Team to paste it.`)
        }
      } else if (/^[A-Z0-9]{6}$/i.test(result)) {
        // Direct team code (6 characters)
        navigator.clipboard.writeText(result.toUpperCase())
        toast.success(`Team code "${result.toUpperCase()}" copied! Go to Teams → Join Team to paste it.`)
      } else if (/^\d{10}$/.test(result)) {
        // 10-digit team ID
        navigator.clipboard.writeText(result)
        toast.success(`Team ID "${result}" copied! Go to Teams → Join Team to paste it.`)
      } else {
        // Try to extract team ID or code from the text
        const teamIdMatch = result.match(/\b\d{10}\b/)
        const teamCodeMatch = result.match(/\b[A-Z0-9]{6}\b/i)
        
        if (teamIdMatch) {
          navigator.clipboard.writeText(teamIdMatch[0])
          toast.success(`Team ID "${teamIdMatch[0]}" copied! Go to Teams → Join Team to paste it.`)
        } else if (teamCodeMatch) {
          navigator.clipboard.writeText(teamCodeMatch[0].toUpperCase())
          toast.success(`Team code "${teamCodeMatch[0].toUpperCase()}" copied! Go to Teams → Join Team to paste it.`)
        } else {
          toast.error('No valid team code or ID found in QR code')
        }
      }
    } catch (error) {
      console.error('Error processing QR scan result:', error)
      toast.error('Failed to process QR code')
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-royal-primary/95 via-royal-secondary/90 to-royal-purple/95 backdrop-blur-xl shadow-2xl z-50 border-b border-white/20"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-white hover:text-royal-gold hover:bg-white/20 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
              >
                <img 
                  src="/logo.png" 
                  alt="Pitch Pioneers Logo" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden sm:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button */}
            <button className="sm:hidden p-2 text-white hover:text-royal-gold hover:bg-white/20 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {/* QR Scanner Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQRScanner(true)}
              className="p-2 text-white hover:text-royal-gold hover:bg-white/20 rounded-full transition-colors mt-2"
              title="Scan QR Code to Join Team"
            >
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 text-white hover:text-royal-gold hover:bg-white/20 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-cricket-primary text-white text-xs rounded-full flex items-center justify-center">
                <span className="hidden sm:inline">3</span>
                <span className="sm:hidden w-2 h-2 bg-white rounded-full"></span>
              </span>
            </motion.button>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cricket-primary rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-300">Player</p>
                </div>
              </motion.button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <UserIcon className="inline w-4 h-4 mr-2" />
                    View Profile
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Settings
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="inline w-4 h-4 mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </motion.nav>
  )
}
