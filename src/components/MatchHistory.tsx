'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Match } from '@/types'
import CricketScoreboard from './CricketScoreboard'
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Eye,
  Filter,
  Search,
  Download
} from 'lucide-react'

interface MatchHistoryProps {
  user: any
}

export default function MatchHistory({ user }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Load matches from localStorage
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]')
    setMatches(savedMatches)
  }, [])

  useEffect(() => {
    let filtered = matches

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.team2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredMatches(filtered)
  }, [matches, searchTerm, statusFilter])

  const getMatchResult = (match: Match): string => {
    if (match.status !== 'completed' || !match.result) return 'In Progress'
    
    if (match.result.type === 'tie') return 'Match Tied'
    
    return `${match.result.winner} won by ${match.result.margin} ${match.result.type}`
  }

  const getResultColor = (match: Match): string => {
    if (match.status !== 'completed') return 'text-yellow-600'
    if (match.result?.type === 'tie') return 'text-gray-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Match History</h1>
          <p className="text-gray-600">View completed and ongoing cricket matches</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <span className="text-sm text-gray-600 mb-4 md:mb-0">
            {filteredMatches.length} matches found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Matches</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMatch(match)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Trophy className="w-5 h-5 text-cricket-primary mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {match.team1.name} vs {match.team2.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{match.venue}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{match.format}</span>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {match.innings.map((innings, inningsIndex) => {
                    const battingTeam = match.team1.id === innings.battingTeam ? 
                      match.team1 : match.team2
                    return (
                      <div key={inningsIndex} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">
                          {battingTeam.name} - Innings {inningsIndex + 1}
                        </p>
                        <p className="text-xl font-bold text-cricket-primary">
                          {innings.runs}/{innings.wickets}
                        </p>
                        <p className="text-sm text-gray-600">
                          ({Math.floor(innings.balls / 6)}.{innings.balls % 6} overs)
                        </p>
                      </div>
                    )
                  })}
                </div>

                <p className={`font-semibold ${getResultColor(match)}`}>
                  {getMatchResult(match)}
                </p>
              </div>

              <div className="mt-4 md:mt-0 md:ml-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Scorecard
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start scoring your first cricket match!'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Match Scorecard Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Match Scorecard</h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <CricketScoreboard match={selectedMatch} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
