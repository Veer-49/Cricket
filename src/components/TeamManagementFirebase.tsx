'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Team, TeamPlayer, MatchFormat, PlayerRole } from '../types'
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
  MessageCircle,
  QrCode,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseTeams } from '../hooks/useFirebaseTeams'
import { TeamSharingModal } from './TeamSharingModal'
import TeamCreationWithInvites from './TeamCreationWithInvites'

interface TeamManagementProps {
  user: User | null
}

export default function TeamManagementFirebase({ user }: TeamManagementProps) {
  const { teams, loading, createTeam, joinTeam, updateTeam, deleteTeam } = useFirebaseTeams()
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateWithInvites, setShowCreateWithInvites] = useState(false)
  const [showTeamDetails, setShowTeamDetails] = useState<Team | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<Team | null>(null)
  const [showSharingModal, setShowSharingModal] = useState<Team | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [playerCountFilter, setPlayerCountFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-players' | 'least-players'>('newest')
  const [viewMode, setViewMode] = useState<'my-teams' | 'all-teams'>('my-teams')
  const [joinTeamId, setJoinTeamId] = useState('')

  // Create team form state
  const [teamName, setTeamName] = useState('')
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [isPublic, setIsPublic] = useState(true)
  const [selectedPlayers, setSelectedPlayers] = useState<TeamPlayer[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedUserRole, setSelectedUserRole] = useState<PlayerRole>('All-rounder')

  // Edit team form state
  const [editTeamName, setEditTeamName] = useState('')
  const [editMatchFormat, setEditMatchFormat] = useState<MatchFormat>('T20')
  const [editIsPublic, setEditIsPublic] = useState(true)
  const [editTeamPlayers, setEditTeamPlayers] = useState<TeamPlayer[]>([])
  const [editSelectedUserId, setEditSelectedUserId] = useState('')
  const [editSelectedUserRole, setEditSelectedUserRole] = useState<PlayerRole>('All-rounder')

  // Load registered users from localStorage
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([])

  // Load registered users
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('cricketUsers') || '[]')
    setRegisteredUsers(users)
  }, [])

  // Filter teams based on current filters
  useEffect(() => {
    let filtered = teams

    // Filter by view mode
    if (viewMode === 'my-teams') {
      filtered = filtered.filter(team => 
        team.captainId === user?.id || 
        team.players.some(p => p.userId === user?.id)
      )
    } else {
      filtered = filtered.filter(team => team.isPublic)
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(team => {
        const captainName = registeredUsers.find(u => u.id === team.captainId)?.name || ''
        return team.name.toLowerCase().includes(searchLower) ||
               captainName.toLowerCase().includes(searchLower) ||
               (team.shortCode && team.shortCode.toLowerCase().includes(searchLower))
      })
    }

    // Format filter
    if (formatFilter !== 'all') {
      filtered = filtered.filter(team => team.matchFormat === formatFilter)
    }

    // Player count filter
    if (playerCountFilter !== 'all') {
      switch (playerCountFilter) {
        case 'small':
          filtered = filtered.filter(team => team.players.length <= 5)
          break
        case 'medium':
          filtered = filtered.filter(team => team.players.length >= 6 && team.players.length <= 10)
          break
        case 'large':
          filtered = filtered.filter(team => team.players.length >= 11)
          break
      }
    }

    // Sort teams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'most-players':
          return b.players.length - a.players.length
        case 'least-players':
          return a.players.length - b.players.length
        default:
          return 0
      }
    })

    setFilteredTeams(filtered)
  }, [teams, viewMode, searchTerm, formatFilter, playerCountFilter, sortBy, user, registeredUsers])

  const handleAddUserToTeam = () => {
    if (!selectedUserId) return

    const selectedUser = registeredUsers.find(u => u.id === selectedUserId)
    if (!selectedUser) return

    // Check if user is already selected
    if (selectedPlayers.some(p => p.userId === selectedUserId)) {
      toast.error('User is already added to the team!')
      return
    }

    // Check if it's the current user (captain)
    if (selectedUserId === user?.id) {
      toast.error('You are already the captain of this team!')
      return
    }

    const newPlayer: TeamPlayer = {
      userId: selectedUser.id,
      name: selectedUser.name,
      role: selectedUserRole,
      battingOrder: selectedPlayers.length + 2 // +2 because captain is at position 1
    }

    setSelectedPlayers([...selectedPlayers, newPlayer])
    setSelectedUserId('')
    setSelectedUserRole('All-rounder')
    toast.success(`${selectedUser.name} added to team!`)
  }

  const handleRemoveUserFromTeam = (userId: string) => {
    const updatedPlayers = selectedPlayers.filter(p => p.userId !== userId)
    // Reorder batting positions
    const reorderedPlayers = updatedPlayers.map((player, index) => ({
      ...player,
      battingOrder: index + 2 // +2 because captain is at position 1
    }))
    setSelectedPlayers(reorderedPlayers)
    toast.success('Player removed from team!')
  }

  const handleCreateTeam = async () => {
    if (!teamName || !user) return

    const teamData = {
      name: teamName,
      captainId: user.id,
      players: [
        {
          userId: user.id,
          name: user.name,
          role: 'All-rounder' as PlayerRole,
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

    const newTeam = await createTeam(teamData)
    
    if (newTeam) {
      // Reset form
      setTeamName('')
      setSelectedPlayers([])
      setSelectedUserId('')
      setSelectedUserRole('All-rounder')
      setShowCreateModal(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!joinTeamId || !user) return

    const success = await joinTeam(joinTeamId, user)
    
    if (success) {
      setJoinTeamId('')
      setShowJoinModal(false)
    }
  }

  const handleQuickJoinTeam = async (teamId: string) => {
    if (!user) return
    await joinTeam(teamId, user)
  }

  const handleEditTeam = (team: Team) => {
    setShowEditModal(team)
    setEditTeamName(team.name)
    setEditMatchFormat(team.matchFormat)
    setEditIsPublic(team.isPublic)
    setEditTeamPlayers(team.players.filter(p => p.userId !== team.captainId))
  }

  const handleUpdateTeam = async () => {
    if (!showEditModal || !editTeamName) return

    const updates = {
      name: editTeamName,
      matchFormat: editMatchFormat,
      isPublic: editIsPublic,
      players: [
        {
          userId: showEditModal.captainId,
          name: user?.name || 'Captain',
          role: 'All-rounder' as PlayerRole,
          battingOrder: 1
        },
        ...editTeamPlayers
      ]
    }

    const success = await updateTeam(showEditModal.id, updates)
    
    if (success) {
      setShowEditModal(null)
    }
  }

  const handleDeleteTeam = async (team: Team) => {
    if (window.confirm(`Are you sure you want to delete "${team.name}"?`)) {
      await deleteTeam(team.id, team.shortCode)
    }
  }

  const copyTeamCode = async (team: Team) => {
    const code = team.shortCode || team.id
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Team code copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy team code')
    }
  }

  if (loading && teams.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cricket-primary rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Team Management</h2>
            <p className="text-white">Create, join, and manage your cricket teams</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinModal(true)}
            className="bg-cricket-secondary hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center whitespace-nowrap"
          >
            <UserPlus className="inline w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Join Team</span>
            <span className="xs:hidden">Join</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center whitespace-nowrap"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Quick Create</span>
            <span className="xs:hidden">Create</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateWithInvites(true)}
            className="bg-cricket-primary hover:bg-cricket-secondary text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center whitespace-nowrap"
          >
            <MessageCircle className="inline w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create with Invites</span>
            <span className="sm:hidden">Invites</span>
          </motion.button>
        </div>
      </motion.div>

      {/* View Toggle and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 sm:p-6"
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

          <div className="text-sm text-gray-900">
            <span className="text-gray-900">{filteredTeams.length} teams found</span>
            {viewMode === 'all-teams' && (
              <span className="ml-4 text-green-600">
                • {filteredTeams.filter(t => t.isPublic && !t.players.some(p => p.userId === user?.id)).length} available to join
              </span>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
          >
            <option value="all">All Formats</option>
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="Test">Test</option>
            <option value="Custom">Custom</option>
          </select>

          {/* Player Count Filter */}
          <select
            value={playerCountFilter}
            onChange={(e) => setPlayerCountFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (≤5)</option>
            <option value="medium">Medium (6-10)</option>
            <option value="large">Large (11+)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-players">Most Players</option>
            <option value="least-players">Least Players</option>
          </select>
        </div>
      </motion.div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{team.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>
                      {registeredUsers.find(u => u.id === team.captainId)?.name || 'Unknown Captain'}
                    </span>
                  </div>
                </div>
                
                {team.captainId === user?.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cricket-primary" />
                  <span className="text-sm font-medium text-black">{team.players.length} players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cricket-secondary" />
                  <span className="text-sm font-medium text-black">{team.matchFormat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-black">{team.wins}W</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-black">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Team Code */}
              {team.shortCode && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-600">Team Code</span>
                      <div className="font-mono font-bold text-cricket-primary">
                        {team.shortCode}
                      </div>
                    </div>
                    <button
                      onClick={() => copyTeamCode(team)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTeamDetails(team)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>

                {team.captainId === user?.id ? (
                  <button
                    onClick={() => setShowSharingModal(team)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                ) : (
                  !team.players.some(p => p.userId === user?.id) && (
                    <button
                      onClick={() => handleQuickJoinTeam(team.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cricket-secondary hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Join
                    </button>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {viewMode === 'my-teams' ? 'No teams found' : 'No public teams available'}
          </h3>
          <p className="text-white mb-6">
            {viewMode === 'my-teams' 
              ? 'Create your first team or join an existing one'
              : 'Be the first to create a public team!'
            }
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-cricket-primary hover:bg-cricket-secondary text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Join Team</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team ID or Code
                  </label>
                  <input
                    type="text"
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter either the 6-character team code
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinTeam}
                  disabled={!joinTeamId || loading}
                  className="flex-1 px-4 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Details Modal */}
      <AnimatePresence>
        {showTeamDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Team Details</h3>
                <button
                  onClick={() => setShowTeamDetails(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Team Info */}
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{showTeamDetails.name}</h4>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>Captain: {registeredUsers.find(u => u.id === showTeamDetails.captainId)?.name || 'Unknown'}</span>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-cricket-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{showTeamDetails.players.length}</div>
                    <div className="text-sm text-gray-600">Players</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Target className="w-6 h-6 text-cricket-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{showTeamDetails.matchFormat}</div>
                    <div className="text-sm text-gray-600">Format</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{showTeamDetails.wins}</div>
                    <div className="text-sm text-gray-600">Wins</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(showTeamDetails.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Created</div>
                  </div>
                </div>

                {/* Team Code */}
                {showTeamDetails.shortCode && (
                  <div className="bg-cricket-primary bg-opacity-10 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm text-black font-medium mb-1">Team Code</div>
                      <div className="text-3xl font-mono font-bold text-black">
                        {showTeamDetails.shortCode}
                      </div>
                    </div>
                  </div>
                )}

                {/* Players List */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Team Players</h5>
                  <div className="space-y-2">
                    {showTeamDetails.players.map((player, index) => (
                      <div key={player.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-cricket-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {player.battingOrder || index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {player.name}
                            {player.userId === showTeamDetails.captainId && (
                              <Crown className="w-4 h-4 text-yellow-500 inline ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{player.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t">
                <button
                  onClick={() => setShowTeamDetails(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors text-black"
                >
                  Close
                </button>
                {showTeamDetails.captainId === user?.id && (
                  <button
                    onClick={() => {
                      setShowSharingModal(showTeamDetails)
                      setShowTeamDetails(null)
                    }}
                    className="flex-1 px-4 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2 inline" />
                    Share Team
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Sharing Modal */}
      {showSharingModal && (
        <TeamSharingModal
          team={showSharingModal}
          isOpen={true}
          onClose={() => setShowSharingModal(null)}
        />
      )}

      {/* Edit Team Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Edit Team</h3>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Team Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Match Format */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Match Format
                  </label>
                  <select
                    value={editMatchFormat}
                    onChange={(e) => setEditMatchFormat(e.target.value as MatchFormat)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Public/Private */}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editIsPublic}
                      onChange={(e) => setEditIsPublic(e.target.checked)}
                      className="w-4 h-4 text-cricket-primary border-gray-300 rounded focus:ring-cricket-primary"
                    />
                    <span className="text-sm font-medium text-black">
                      Make team public (visible to all users)
                    </span>
                  </label>
                </div>

                {/* Current Players */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Current Players</h5>
                  <div className="space-y-2 mb-4">
                    {/* Captain (cannot be removed) */}
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {user?.name} (You)
                          <Crown className="w-4 h-4 text-yellow-500 inline ml-2" />
                        </div>
                        <div className="text-sm text-gray-600">Captain - All-rounder</div>
                      </div>
                    </div>

                    {/* Other Players */}
                    {editTeamPlayers.map((player, index) => (
                      <div key={player.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-cricket-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 2}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.role}</div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedPlayers = editTeamPlayers.filter(p => p.userId !== player.userId)
                            const reorderedPlayers = updatedPlayers.map((p, i) => ({
                              ...p,
                              battingOrder: i + 2
                            }))
                            setEditTeamPlayers(reorderedPlayers)
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Player */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={editSelectedUserId}
                      onChange={(e) => setEditSelectedUserId(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
                    >
                      <option value="">Add a player</option>
                      {registeredUsers
                        .filter(u => u.id !== user?.id && !editTeamPlayers.some(p => p.userId === u.id))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))
                      }
                    </select>
                    
                    <select
                      value={editSelectedUserRole}
                      onChange={(e) => setEditSelectedUserRole(e.target.value as PlayerRole)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
                    >
                      <option value="All-rounder">All-rounder</option>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="Wicket-keeper">Wicket-keeper</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        if (!editSelectedUserId) return
                        const selectedUser = registeredUsers.find(u => u.id === editSelectedUserId)
                        if (!selectedUser) return

                        const newPlayer: TeamPlayer = {
                          userId: selectedUser.id,
                          name: selectedUser.name,
                          role: editSelectedUserRole,
                          battingOrder: editTeamPlayers.length + 2
                        }

                        setEditTeamPlayers([...editTeamPlayers, newPlayer])
                        setEditSelectedUserId('')
                        setEditSelectedUserRole('All-rounder')
                        toast.success(`${selectedUser.name} added to team!`)
                      }}
                      disabled={!editSelectedUserId}
                      className="px-4 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Add Player
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t">
                <button
                    onClick={() => setShowEditModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors text-black"
                  >
                    Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={!editTeamName || loading}
                  className="flex-1 px-4 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Team with Invites Modal */}
      {showCreateWithInvites && (
        <TeamCreationWithInvites
          user={user}
          onClose={() => setShowCreateWithInvites(false)}
        />
      )}

      {/* Quick Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Quick Create Team</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Team Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Match Format */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Match Format
                  </label>
                  <select
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value as MatchFormat)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Public/Private */}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 text-cricket-primary border-gray-300 rounded focus:ring-cricket-primary"
                    />
                    <span className="text-sm font-medium text-black">
                      Make team public (visible to all users)
                    </span>
                  </label>
                </div>

                {/* Add Players Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Players</h4>
                  
                  {/* Add Player Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
                    >
                      <option value="">Select a player</option>
                      {registeredUsers
                        .filter(u => u.id !== user?.id && !selectedPlayers.some(p => p.userId === u.id))
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))
                      }
                    </select>
                    
                    <select
                      value={selectedUserRole}
                      onChange={(e) => setSelectedUserRole(e.target.value as PlayerRole)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-primary focus:border-transparent text-gray-900"
                    >
                      <option value="All-rounder">All-rounder</option>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="Wicket-keeper">Wicket-keeper</option>
                    </select>
                    
                    <button
                      onClick={handleAddUserToTeam}
                      disabled={!selectedUserId}
                      className="px-4 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Add Player
                    </button>
                  </div>

                  {/* Selected Players List */}
                  {selectedPlayers.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Selected Players:</h5>
                      {selectedPlayers.map((player, index) => (
                        <div key={player.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-cricket-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 2}
                            </span>
                            <span className="font-medium">{player.name}</span>
                            <span className="text-sm text-gray-600">({player.role})</span>
                          </div>
                          <button
                            onClick={() => handleRemoveUserFromTeam(player.userId)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!teamName || loading}
                  className="flex-1 px-4 py-2 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
