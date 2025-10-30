'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from '@/types'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import DashboardHome from './DashboardHome'
import GroundBooking from './GroundBooking'
import CoachBooking from './CoachBooking'
import UmpireBooking from './UmpireBooking'
import NetBooking from './NetBooking'
import TeamManagement from './TeamManagement'
import CricketScoring from './CricketScoring'
import MatchHistory from './MatchHistory'
import UserProfile from './UserProfile'

interface DashboardProps {
  user: User | null
  onLogout: () => void
}

export type ActiveSection = 'home' | 'grounds' | 'coaches' | 'umpires' | 'nets' | 'teams' | 'scoring' | 'matches' | 'profile'

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderActiveSection = () => {
    // Get teams from localStorage for cricket scoring
    const teams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
    
    switch (activeSection) {
      case 'home':
        return <DashboardHome user={user} setActiveSection={setActiveSection} />
      case 'grounds':
        return <GroundBooking user={user} />
      case 'coaches':
        return <CoachBooking user={user} />
      case 'umpires':
        return <UmpireBooking user={user} />
      case 'nets':
        return <NetBooking user={user} />
      case 'teams':
        return <TeamManagement user={user} />
      case 'scoring':
        return <CricketScoring teams={teams} user={user} />
      case 'matches':
        return <MatchHistory user={user} />
      case 'profile':
        return <UserProfile user={user} />
      default:
        return <DashboardHome user={user} setActiveSection={setActiveSection} />
    }
  }

  return (
    <div className="min-h-screen royal-gradient royal-pattern">
      <Navbar 
        user={user} 
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-64 pt-16">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-6 xl:p-8"
          >
            {renderActiveSection()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
