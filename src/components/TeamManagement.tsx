'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Team, TeamPlayer, MatchFormat, PlayerRole, BowlingType } from '@/types'
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
  const [showEditModal, setShowEditModal] = useState<Team | null>(null)
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

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
    setTeams(savedTeams)

    // Add event listener for storage changes (when other tabs modify localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cricketTeams') {
        const updatedTeams = JSON.parse(e.newValue || '[]')
        setTeams(updatedTeams)
      }
    }

    // Add event listener for window focus (refresh when user comes back to tab)
    const handleWindowFocus = () => {
      refreshTeams()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

  // Add a function to refresh teams from localStorage
  const refreshTeams = () => {
    const savedTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
    setTeams(savedTeams)
  }

  useEffect(() => {
    let filtered = teams

    // Debug logging
    console.log('Teams filtering:', {
      totalTeams: teams.length,
      viewMode,
      userId: user?.id,
      searchTerm,
      formatFilter
    })

    // Filter by view mode
    if (viewMode === 'my-teams') {
      filtered = filtered.filter(team => team.captainId === user?.id)
      console.log('My teams filtered:', filtered.length)
    } else {
      filtered = filtered.filter(team => team.isPublic)
      console.log('Public teams filtered:', filtered.length)
    }

    // Search filter - search in team name and captain name
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(team => {
        const captainName = registeredUsers.find(u => u.id === team.captainId)?.name || ''
        return team.name.toLowerCase().includes(searchLower) ||
               captainName.toLowerCase().includes(searchLower)
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

    console.log('Final filtered teams:', filtered.length)
    setFilteredTeams(filtered)
  }, [teams, viewMode, searchTerm, formatFilter, playerCountFilter, sortBy, user, registeredUsers])

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
    setSelectedUserId('')
    setSelectedUserRole('All-rounder')
    setShowCreateModal(false)
  }

  const handleJoinTeam = () => {
    if (!joinTeamId || !user) return

    const team = teams.find(t => t.id === joinTeamId)
    if (!team) {
      toast.error('Team not found!')
      return
    }

    if (team.players.some(p => p.userId === user.id)) {
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
    
    // Create a notification for the team captain
    const notifications = JSON.parse(localStorage.getItem('teamNotifications') || '[]')
    const newNotification = {
      id: Date.now().toString(),
      teamId: team.id,
      teamName: team.name,
      captainId: team.captainId,
      message: `${user.name} has joined your team "${team.name}"`,
      type: 'player_joined',
      createdAt: new Date(),
      read: false
    }
    notifications.push(newNotification)
    localStorage.setItem('teamNotifications', JSON.stringify(notifications))
  }

  const handleQuickJoinTeam = (teamId: string) => {
    if (!user) return

    const team = teams.find(t => t.id === teamId)
    if (!team) {
      toast.error('Team not found!')
      return
    }

    if (team.players.some(p => p.userId === user.id)) {
      toast.error('You are already a member of this team!')
      return
    }

    if (!team.isPublic) {
      toast.error('This team is private. Use the team ID to join.')
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
    toast.success('You can now participate in matches with this team!')
    
    // Create a notification for the team captain
    const notifications = JSON.parse(localStorage.getItem('teamNotifications') || '[]')
    const newNotification = {
      id: Date.now().toString(),
      teamId: team.id,
      teamName: team.name,
      captainId: team.captainId,
      message: `${user.name} has joined your team "${team.name}"`,
      type: 'player_joined',
      createdAt: new Date(),
      read: false
    }
    notifications.push(newNotification)
    localStorage.setItem('teamNotifications', JSON.stringify(notifications))
  }

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId)
    toast.success('Team ID copied to clipboard!')
  }

  const handleEditTeam = (team: Team) => {
    setEditTeamName(team.name)
    setEditMatchFormat(team.matchFormat)
    setEditIsPublic(team.isPublic)
    setEditTeamPlayers([...team.players])
    setEditSelectedUserId('')
    setEditSelectedUserRole('All-rounder')
    setShowEditModal(team)
  }

  const handleUpdateTeam = () => {
    if (!editTeamName || !showEditModal) return

    const updatedTeam = {
      ...showEditModal,
      name: editTeamName,
      matchFormat: editMatchFormat,
      isPublic: editIsPublic,
      players: editTeamPlayers
    }

    const updatedTeams = teams.map(t => t.id === showEditModal.id ? updatedTeam : t)
    setTeams(updatedTeams)
    localStorage.setItem('cricketTeams', JSON.stringify(updatedTeams))

    toast.success(`Team "${editTeamName}" updated successfully!`)
    setShowEditModal(null)
  }

  const handleAddPlayerToEditTeam = () => {
    if (!editSelectedUserId) return

    const selectedUser = registeredUsers.find(u => u.id === editSelectedUserId)
    if (!selectedUser) return

    // Check if user is already in the team
    if (editTeamPlayers.some(p => p.userId === editSelectedUserId)) {
      toast.error('User is already in the team!')
      return
    }

    const newPlayer: TeamPlayer = {
      userId: selectedUser.id,
      name: selectedUser.name,
      role: editSelectedUserRole,
      battingOrder: editTeamPlayers.length + 1
    }

    setEditTeamPlayers([...editTeamPlayers, newPlayer])
    setEditSelectedUserId('')
    setEditSelectedUserRole('All-rounder')
    toast.success(`${selectedUser.name} added to team!`)
  }

  const handleRemovePlayer = (playerId: string) => {
    if (playerId === user?.id) {
      toast.error('Cannot remove yourself as captain!')
      return
    }

    const updatedPlayers = editTeamPlayers.filter(p => p.userId !== playerId)
    // Reorder batting positions
    const reorderedPlayers = updatedPlayers.map((player, index) => ({
      ...player,
      battingOrder: index + 1
    }))
    
    setEditTeamPlayers(reorderedPlayers)
    toast.success('Player removed from team!')
  }

  const handlePlayerRoleChange = (playerId: string, newRole: PlayerRole) => {
    const updatedPlayers = editTeamPlayers.map(player =>
      player.userId === playerId ? { ...player, role: newRole } : player
    )
    setEditTeamPlayers(updatedPlayers)
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
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-white">Create, manage, and join cricket teams</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinModal(true)}
            className="bg-cricket-secondary hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
          >
            <UserPlus className="inline w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Join Team</span>
            <span className="xs:hidden">Join</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Quick Create</span>
            <span className="xs:hidden">Create</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateWithInvites(true)}
            className="btn-primary"
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

          <div className="text-sm text-gray-600">
            <span>{filteredTeams.length} teams found</span>
            {viewMode === 'all-teams' && (
              <span className="ml-4 text-green-600">
                • {filteredTeams.filter(t => t.isPublic && !t.players.some(p => p.userId === user?.id)).length} available to join
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teams or captains..."
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

          {/* Player Count Filter */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={playerCountFilter}
              onChange={(e) => setPlayerCountFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Sizes</option>
              <option value="small">Small (≤5 players)</option>
              <option value="medium">Medium (6-10 players)</option>
              <option value="large">Large (11+ players)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'most-players' | 'least-players')}
              className="input-field pl-10 appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-players">Most Players</option>
              <option value="least-players">Least Players</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {viewMode === 'my-teams' ? 'No teams created yet' : 'No public teams found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {viewMode === 'my-teams' 
              ? 'Create your first team to start playing cricket matches!' 
              : 'Try adjusting your search filters or create a new team.'}
          </p>
          {viewMode === 'my-teams' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="inline w-4 h-4 mr-2" />
              Create Your First Team
            </motion.button>
          )}
        </motion.div>
      ) : (
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
                    Captain: {registeredUsers.find(u => u.id === team.captainId)?.name || 'Unknown'}
                    {team.captainId === user?.id && ' (You)'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(team.createdAt).toLocaleDateString()}
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

            {/* Players Count and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">{team.players.length} players</span>
              </div>
              <div className="flex items-center space-x-2">
                {team.players.some(p => p.userId === user?.id) && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Member
                  </span>
                )}
                {team.isPublic && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Public
                  </span>
                )}
                {!team.isPublic && (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    Private
                  </span>
                )}
              </div>
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
              {team.captainId === user?.id ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEditTeam(team)}
                  className="bg-cricket-primary hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <Edit className="inline w-4 h-4 mr-1" />
                  Edit
                </motion.button>
              ) : (
                // Show join button for public teams that user is not a member of
                viewMode === 'all-teams' && team.isPublic && !team.players.some(p => p.userId === user?.id) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickJoinTeam(team.id)}
                    className="bg-cricket-secondary hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    <UserPlus className="inline w-4 h-4 mr-1" />
                    Join
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
          ))}
        </div>
      )}

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

                {/* Add Team Members */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Add Team Members</label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Select a registered user</option>
                        {registeredUsers
                          .filter(regUser => regUser.id !== user?.id) // Exclude current user
                          .filter(regUser => !selectedPlayers.some(p => p.userId === regUser.id)) // Exclude already selected
                          .map(regUser => (
                            <option key={regUser.id} value={regUser.id}>
                              {regUser.name} ({regUser.email})
                            </option>
                          ))
                        }
                      </select>
                      <select
                        value={selectedUserRole}
                        onChange={(e) => setSelectedUserRole(e.target.value as PlayerRole)}
                        className="input-field text-sm"
                      >
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Wicket-keeper">Wicket-keeper</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddUserToTeam}
                      disabled={!selectedUserId}
                      className="w-full bg-cricket-secondary hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <UserPlus className="inline w-4 h-4 mr-1" />
                      Add User to Team
                    </button>
                  </div>

                  {/* Selected Players List */}
                  {selectedPlayers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Selected Players ({selectedPlayers.length + 1}):</p>
                      
                      {/* Captain (You) */}
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-cricket-primary rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                            {user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm flex items-center">
                              {user?.name} (You)
                              <Crown className="w-3 h-3 text-yellow-600 ml-1" />
                            </p>
                            <p className="text-xs text-gray-600">All-rounder</p>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">#1</span>
                      </div>

                      {/* Selected Players */}
                      {selectedPlayers.map((player) => (
                        <div key={player.userId} className="flex items-center justify-between bg-white border rounded-lg p-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-cricket-primary rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                              {player.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{player.name}</p>
                              <p className="text-xs text-gray-600">{player.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              #{player.battingOrder}
                            </span>
                            <button
                              onClick={() => handleRemoveUserFromTeam(player.userId)}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-gray-800">You will be the captain</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    As captain, you can manage team members, edit team details, and organize matches. Only registered users can be added to teams.
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
                  {showTeamDetails.players.map((player, index) => (
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

      {/* Edit Team Modal */}
      <AnimatePresence>
        {showEditModal && (
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
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Team</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Details Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Team Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Match Format</label>
                    <select
                      value={editMatchFormat}
                      onChange={(e) => setEditMatchFormat(e.target.value as MatchFormat)}
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
                      id="editIsPublic"
                      checked={editIsPublic}
                      onChange={(e) => setEditIsPublic(e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="editIsPublic" className="text-sm text-gray-700">
                      Make team public (others can find and join)
                    </label>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-gray-800">Team ID: {showEditModal.id}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Team ID cannot be changed. Share this with players to join your team.
                    </p>
                  </div>
                </div>

                {/* Team Members Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Team Members ({editTeamPlayers.length})</h4>
                  
                  {/* Add Registered User */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-gray-800">Add Registered User</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={editSelectedUserId}
                        onChange={(e) => setEditSelectedUserId(e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Select a registered user</option>
                        {registeredUsers
                          .filter(regUser => !editTeamPlayers.some(p => p.userId === regUser.id)) // Exclude already in team
                          .map(regUser => (
                            <option key={regUser.id} value={regUser.id}>
                              {regUser.name} ({regUser.email})
                            </option>
                          ))
                        }
                      </select>
                      <select
                        value={editSelectedUserRole}
                        onChange={(e) => setEditSelectedUserRole(e.target.value as PlayerRole)}
                        className="input-field text-sm"
                      >
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Wicket-keeper">Wicket-keeper</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddPlayerToEditTeam}
                      disabled={!editSelectedUserId}
                      className="w-full bg-cricket-primary hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <UserPlus className="inline w-4 h-4 mr-1" />
                      Add User to Team
                    </button>
                  </div>

                  {/* Current Players List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {editTeamPlayers.map((player, index) => (
                      <div key={player.userId} className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-cricket-primary rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm flex items-center">
                              {player.name}
                              {player.userId === showEditModal.captainId && (
                                <Crown className="w-3 h-3 text-yellow-600 ml-1" />
                              )}
                            </p>
                            <select
                              value={player.role}
                              onChange={(e) => handlePlayerRoleChange(player.userId, e.target.value as PlayerRole)}
                              className="text-xs text-gray-600 bg-transparent border-none p-0 focus:ring-0"
                              disabled={player.userId === user?.id}
                            >
                              <option value="Batsman">Batsman</option>
                              <option value="Bowler">Bowler</option>
                              <option value="All-rounder">All-rounder</option>
                              <option value="Wicket-keeper">Wicket-keeper</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            #{player.battingOrder}
                          </span>
                          {player.userId !== user?.id && (
                            <button
                              onClick={() => handleRemovePlayer(player.userId)}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={!editTeamName}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Update Team
                </button>
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
            refreshTeams()
          }}
        />
      )}
    </div>
  )
}
