import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Crown, Target, Calendar, UserPlus, ArrowLeft } from 'lucide-react'
import { FirebaseService } from '../services/firebaseService'
import { Team, User } from '../types'
import toast from 'react-hot-toast'

interface TeamJoinPageProps {
  user: User | null
}

export const TeamJoinPage: React.FC<TeamJoinPageProps> = ({ user }) => {
  const { shortCode } = useParams<{ shortCode: string }>()
  const navigate = useNavigate()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (shortCode) {
      loadTeam(shortCode)
    }
  }, [shortCode])

  const loadTeam = async (code: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const teamData = await FirebaseService.getTeamByShortCode(code.toUpperCase())
      
      if (!teamData) {
        setError('Team not found. Please check the code and try again.')
        return
      }
      
      setTeam(teamData)
    } catch (err) {
      console.error('Error loading team:', err)
      setError('Failed to load team information.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!team || !user) return

    try {
      setJoining(true)
      await FirebaseService.joinTeam(team.id, user)
      toast.success(`Successfully joined "${team.name}"!`)
      navigate('/teams') // Redirect to teams page
    } catch (err: any) {
      console.error('Error joining team:', err)
      toast.error(err.message || 'Failed to join team')
    } finally {
      setJoining(false)
    }
  }

  const isAlreadyMember = team && user && team.players.some(p => p.userId === user.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team information...</p>
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The team you\'re looking for doesn\'t exist or the link has expired.'}
          </p>
          <button
            onClick={() => navigate('/teams')}
            className="btn-primary w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Cricket Team</h1>
          <p className="text-gray-600">You've been invited to join a cricket team!</p>
        </motion.div>

        {/* Team Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Team Header */}
          <div className="bg-gradient-to-r from-cricket-primary to-cricket-secondary p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{team.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Crown className="w-4 h-4" />
                  <span>Captain: {team.players.find(p => p.userId === team.captainId)?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Details */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-cricket-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{team.players.length}</div>
                <div className="text-sm text-gray-600">Players</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="w-6 h-6 text-cricket-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{team.matchFormat}</div>
                <div className="text-sm text-gray-600">Format</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{team.wins}</div>
                <div className="text-sm text-gray-600">Wins</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {new Date(team.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
            </div>

            {/* Team Code */}
            <div className="bg-cricket-primary bg-opacity-10 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-cricket-primary font-medium mb-1">Team Code</div>
                <div className="text-3xl font-mono font-bold text-cricket-primary">
                  {team.shortCode || shortCode}
                </div>
              </div>
            </div>

            {/* Current Players */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Players</h3>
              <div className="space-y-2">
                {team.players.map((player, index) => (
                  <div key={player.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-cricket-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {player.name}
                        {player.userId === team.captainId && (
                          <Crown className="w-4 h-4 text-yellow-500 inline ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{player.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/teams')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                Back to Teams
              </button>

              {!user ? (
                <button
                  onClick={() => navigate('/auth')}
                  className="flex-1 px-4 py-3 bg-cricket-primary hover:bg-cricket-secondary text-white rounded-lg transition-colors font-medium"
                >
                  Sign In to Join
                </button>
              ) : isAlreadyMember ? (
                <button
                  disabled
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                >
                  Already a Member
                </button>
              ) : (
                <button
                  onClick={handleJoinTeam}
                  disabled={joining}
                  className="flex-1 px-4 py-3 bg-cricket-secondary hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {joining ? (
                    'Joining...'
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2 inline" />
                      Join Team
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-lg p-4 mt-6"
        >
          <h4 className="font-semibold text-blue-900 mb-2">What happens when you join?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll be added to the team roster</li>
            <li>• You can participate in team matches</li>
            <li>• Access team statistics and history</li>
            <li>• Receive match notifications and updates</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
