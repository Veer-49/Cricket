'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Team, TeamPlayer, MatchFormat, PlayerRole, BowlingType } from '../types'
import { 
  Shield, 
  Plus, 
  Users, 
  Crown, 
  Search,
  Filter,
  Trophy,
  Target,
  Clock,
  Star,
  Copy,
  Share2,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  MessageCircle
} from 'lucide-react'
// Removed uuid import - using custom 10-digit ID generator
import toast from 'react-hot-toast'
import TeamCreationWithInvites from './TeamCreationWithInvites'

interface TeamManagementProps {
  user: User | null
}

export default function TeamManagement({ user }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateWithInvites, setShowCreateWithInvites] = useState(false)
  const [showTeamDetails, setShowTeamDetails] = useState<Team | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'my-teams' | 'all-teams'>('my-teams')
  const [joinTeamId, setJoinTeamId] = useState('')

  // Create team form state
  const [teamName, setTeamName] = useState('')
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [isPublic, setIsPublic] = useState(true)
  const [selectedPlayers, setSelectedPlayers] = useState<TeamPlayer[]>([])

  // Mock data for available players
  const availablePlayers = [
    { id: '1', name: 'Virat Kohli', role: 'Batsman' as PlayerRole },
    { id: '2', name: 'Rohit Sharma', role: 'Batsman' as PlayerRole },
    { id: '3', name: 'Jasprit Bumrah', role: 'Bowler' as PlayerRole },
    { id: '4', name: 'MS Dhoni', role: 'Wicket-keeper' as PlayerRole },
    { id: '5', name: 'Hardik Pandya', role: 'All-rounder' as PlayerRole },
  ]

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
    setTeams(savedTeams)
  }, [])

  useEffect(() => {
    let filtered = teams

    // Filter by view mode
    if (viewMode === 'my-teams') {
      filtered = filtered.filter(team => team.captainId === user?.id)
    } else {
      filtered = filtered.filter(team => team.isPublic)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Format filter
    if (formatFilter !== 'all') {
      filtered = filtered.filter(team => team.matchFormat === formatFilter)
    }

    setFilteredTeams(filtered)
  }, [teams, viewMode, searchTerm, formatFilter, user])

  // Generate unique 10-digit random team ID
  const generateTeamId = (): string => {
    let newId: string
    let attempts = 0
    const maxAttempts = 100 // Prevent infinite loop
    
    do {
      // Generate a random number between 1000000000 and 9999999999 (10 digits)
      const min = 1000000000
      const max = 9999999999
      newId = Math.floor(Math.random() * (max - min + 1) + min).toString()
      attempts++
    } while (teams.some(team => team.id === newId) && attempts < maxAttempts)
    
    if (attempts >= maxAttempts) {
      // Fallback: add timestamp to ensure uniqueness
      newId = Date.now().toString().slice(-10).padStart(10, '0')
    }
    
    return newId
  }

  const handleCreateTeam = () => {
    if (!teamName || !user) return

    const newTeam: Team = {
      id: generateTeamId(),
      name: teamName,
      captainId: user.id,
      players: [
        {
          userId: user.id,
          name: user.name,
          role: 'All-rounder',
          battingOrder: 1
        },
        ...selectedPlayers
      ],
      matchFormat,
      createdAt: new Date(),
      isPublic,
      wins: 0,
      losses: 0,
      draws: 0
    }

    const updatedTeams = [...teams, newTeam]
    setTeams(updatedTeams)
    localStorage.setItem('cricketTeams', JSON.stringify(updatedTeams))

    toast.success(`Team "${teamName}" created successfully!`)
    toast.success(`Team ID: ${newTeam.id} (copied to clipboard)`)
    navigator.clipboard.writeText(newTeam.id)

    // Reset form
    setTeamName('')
    setSelectedPlayers([])
    setShowCreateModal(false)
  }

  const handleJoinTeam = () => {
    if (!joinTeamId || !user) return

    const team = teams.find(t => t.id === joinTeamId)
    if (!team) {
      toast.error('Team not found!')
      return
    }

    if (team.players.some((p: TeamPlayer) => p.userId === user.id)) {
      toast.error('You are already a member of this team!')
      return
    }

    const newPlayer: TeamPlayer = {
      userId: user.id,
      name: user.name,
      role: 'All-rounder',
      battingOrder: team.players.length + 1
    }

    const updatedTeam = {
      ...team,
      players: [...team.players, newPlayer]
    }

    const updatedTeams = teams.map(t => t.id === team.id ? updatedTeam : t)
    setTeams(updatedTeams)
    localStorage.setItem('cricketTeams', JSON.stringify(updatedTeams))

    toast.success(`Successfully joined "${team.name}"!`)
    setJoinTeamId('')
    setShowJoinModal(false)
  }

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId)
    toast.success('Team ID copied to clipboard!')
  }

  const getFormatIcon = (format: MatchFormat) => {
    switch (format) {
      case 'T20': return <Clock className="w-4 h-4" />
      case 'ODI': return <Target className="w-4 h-4" />
      case 'Test': return <Trophy className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const getFormatColor = (format: MatchFormat) => {
    switch (format) {
      case 'T20': return 'bg-red-100 text-red-800'
      case 'ODI': return 'bg-blue-100 text-blue-800'
      case 'Test': return 'bg-green-100 text-green-800'
      default: return 'bg-purple-100 text-purple-800'
    }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Team Management</h1>
          <p className="text-gray-600">Create, manage, and join cricket teams</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinModal(true)}
            className="bg-cricket-secondary hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            <UserPlus className="inline w-4 h-4 mr-2" />
            Join Team
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            Quick Create
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateWithInvites(true)}
            className="btn-primary"
          >
            <MessageCircle className="inline w-4 h-4 mr-2" />
            Create with Invites
          </motion.button>
        </div>
      </motion.div>

      {/* View Toggle and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4 md:mb-0">
            <button
              onClick={() => setViewMode('my-teams')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                viewMode === 'my-teams' 
                  ? 'bg-white text-cricket-primary shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Teams
            </button>
            <button
              onClick={() => setViewMode('all-teams')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                viewMode === 'all-teams' 
                  ? 'bg-white text-cricket-primary shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Teams
            </button>
          </div>

          <span className="text-sm text-gray-600">
            {filteredTeams.length} teams found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Format Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Formats</option>
              <option value="T20">T20</option>
              <option value="ODI">ODI</option>
              <option value="Test">Test</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 group"
          >
            {/* Team Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-cricket-primary mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{team.name}</h3>
                  <p className="text-sm text-gray-600">
                    {team.captainId === user?.id ? 'Captain' : 'Member'}
                  </p>
                </div>
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getFormatColor(team.matchFormat)}`}>
                {getFormatIcon(team.matchFormat)}
                <span className="ml-1">{team.matchFormat}</span>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{team.wins}</p>
                <p className="text-xs text-gray-600">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{team.losses}</p>
                <p className="text-xs text-gray-600">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{team.draws}</p>
                <p className="text-xs text-gray-600">Draws</p>
              </div>
            </div>

            {/* Players Count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">{team.players.length} players</span>
              </div>
              {team.isPublic && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Public
                </span>
              )}
            </div>

            {/* Team ID */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
              <div>
                <p className="text-xs text-gray-600">Team ID</p>
                <p className="text-sm font-mono">{team.id}</p>
              </div>
              <button
                onClick={() => copyTeamId(team.id)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTeamDetails(team)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                <Eye className="inline w-4 h-4 mr-1" />
                View
              </motion.button>
              {team.captainId === user?.id && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-cricket-primary hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <Edit className="inline w-4 h-4 mr-1" />
                  Edit
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your team will get a unique 10-digit ID for easy sharing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Format</label>
                  <select
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value as MatchFormat)}
                    className="input-field"
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    Make team public (others can find and join)
                  </label>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-gray-800">You will be the captain</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    As captain, you can manage team members, edit team details, and organize matches.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!teamName}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Create Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinModal && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Join Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team ID</label>
                  <input
                    type="text"
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value)}
                    placeholder="Enter 10-digit team ID"
                    className="input-field"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Ask the team captain for the 10-digit team ID
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <UserPlus className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-800">Join as Player</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You'll be added as a team member and can participate in matches.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinTeam}
                  disabled={!joinTeamId}
                  className="flex-1 btn-secondary disabled:opacity-50"
                >
                  Join Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Details Modal */}
      <AnimatePresence>
        {showTeamDetails && (
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
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-cricket-primary mr-3" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{showTeamDetails.name}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFormatColor(showTeamDetails.matchFormat)} mt-1`}>
                      {getFormatIcon(showTeamDetails.matchFormat)}
                      <span className="ml-1">{showTeamDetails.matchFormat}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeamDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-green-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-600">{showTeamDetails.wins}</p>
                  <p className="text-sm text-gray-600">Wins</p>
                </div>
                <div className="text-center bg-red-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-red-600">{showTeamDetails.losses}</p>
                  <p className="text-sm text-gray-600">Losses</p>
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-gray-600">{showTeamDetails.draws}</p>
                  <p className="text-sm text-gray-600">Draws</p>
                </div>
              </div>

              {/* Players List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Team Players ({showTeamDetails.players.length})</h4>
                <div className="space-y-3">
                  {showTeamDetails.players.map((player: TeamPlayer, index: number) => (
                    <div key={player.userId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-cricket-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 flex items-center">
                            {player.name}
                            {player.userId === showTeamDetails.captainId && (
                              <Crown className="w-4 h-4 text-yellow-600 ml-2" />
                            )}
                          </p>
                          <p className="text-sm text-gray-600">{player.role}</p>
                        </div>
                      </div>
                      {player.battingOrder && (
                        <span className="bg-white text-gray-700 px-2 py-1 rounded text-sm">
                          #{player.battingOrder}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Team ID */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Team ID</p>
                    <p className="text-lg font-mono text-gray-800">{showTeamDetails.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyTeamId(showTeamDetails.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Creation with Invites Modal */}
      {showCreateWithInvites && (
        <TeamCreationWithInvites
          user={user}
          onClose={() => {
            setShowCreateWithInvites(false)
            // Refresh teams list
            const savedTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
            setTeams(savedTeams)
          }}
        />
      )}
    </div>
  )
}
