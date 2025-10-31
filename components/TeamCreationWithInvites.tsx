'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Team, 
  Player, 
  TeamPlayerMap, 
  WhatsAppInvite, 
  MatchFormat, 
  PlayerRole 
} from '@/types'
import { 
  Shield, 
  Plus, 
  Users, 
  Crown, 
  Phone,
  UserPlus,
  MessageCircle,
  Check,
  X,
  Loader2,
  AlertCircle,
  Copy,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TeamCreationWithInvitesProps {
  user: User | null
  onClose: () => void
}

interface PlayerInput {
  name: string
  phone: string
  role: PlayerRole
  tempId: string
}

export default function TeamCreationWithInvites({ user, onClose }: TeamCreationWithInvitesProps) {
  const [step, setStep] = useState(1) // 1: Team Details, 2: Add Players, 3: Review & Send Invites
  const [loading, setLoading] = useState(false)
  
  // Team Details
  const [teamName, setTeamName] = useState('')
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [isPublic, setIsPublic] = useState(true)
  
  // Players
  const [playerInputs, setPlayerInputs] = useState<PlayerInput[]>([
    { name: '', phone: '', role: 'Batsman', tempId: '1' }
  ])
  
  // Player verification results
  const [playerVerification, setPlayerVerification] = useState<{
    [key: string]: {
      exists: boolean
      userId?: string
      needsInvite: boolean
    }
  }>({})
  
  // WhatsApp invites
  const [invitesSent, setInvitesSent] = useState<WhatsAppInvite[]>([])
  const [teamCreated, setTeamCreated] = useState<Team | null>(null)

  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9)
  const generateTeamId = (): string => {
    return Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString()
  }

  // Add new player input
  const addPlayerInput = () => {
    setPlayerInputs([
      ...playerInputs,
      { name: '', phone: '', role: 'Batsman', tempId: generateId() }
    ])
  }

  // Remove player input
  const removePlayerInput = (tempId: string) => {
    setPlayerInputs(playerInputs.filter(p => p.tempId !== tempId))
  }

  // Update player input
  const updatePlayerInput = (tempId: string, field: keyof PlayerInput, value: string) => {
    setPlayerInputs(playerInputs.map(p => 
      p.tempId === tempId ? { ...p, [field]: value } : p
    ))
  }

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // Check if players exist in database
  const checkPlayersExist = async () => {
    setLoading(true)
    
    try {
      // Simulate API call to check existing users
      const existingUsers = JSON.parse(localStorage.getItem('cricketUsers') || '[]')
      const verification: typeof playerVerification = {}
      
      for (const player of playerInputs) {
        if (player.name && player.phone) {
          const normalizedPhone = player.phone.replace(/\s/g, '')
          const existingUser = existingUsers.find((u: User) => 
            u.phone.replace(/\s/g, '') === normalizedPhone
          )
          
          verification[player.tempId] = {
            exists: !!existingUser,
            userId: existingUser?.id,
            needsInvite: !existingUser
          }
        }
      }
      
      setPlayerVerification(verification)
      setStep(3)
    } catch (error) {
      toast.error('Failed to verify players')
    } finally {
      setLoading(false)
    }
  }

  // Create team and send invites
  const createTeamAndSendInvites = async () => {
    if (!user || !teamName) return
    
    setLoading(true)
    
    try {
      // Create team
      const newTeam: Team = {
        id: generateTeamId(),
        name: teamName,
        captainId: user.id,
        players: [{
          userId: user.id,
          name: user.name,
          role: 'All-rounder',
          battingOrder: 1
        }],
        matchFormat,
        createdAt: new Date(),
        isPublic,
        wins: 0,
        losses: 0,
        draws: 0
      }

      // Create player records and team mappings
      const players: Player[] = []
      const teamPlayerMaps: TeamPlayerMap[] = []
      const invites: WhatsAppInvite[] = []

      for (const playerInput of playerInputs) {
        if (playerInput.name && playerInput.phone) {
          const verification = playerVerification[playerInput.tempId]
          
          // Create player record
          const player: Player = {
            id: generateId(),
            name: playerInput.name,
            phone: playerInput.phone,
            userId: verification?.userId,
            createdAt: new Date(),
            inviteStatus: verification?.exists ? 'registered' : 'pending'
          }
          
          players.push(player)
          
          // Create team-player mapping
          const teamPlayerMap: TeamPlayerMap = {
            teamId: newTeam.id,
            playerId: player.id,
            role: playerInput.role,
            battingOrder: newTeam.players.length + teamPlayerMaps.length + 1,
            joinedAt: new Date()
          }
          
          teamPlayerMaps.push(teamPlayerMap)
          
          // Add to team players if already registered
          if (verification?.exists && verification.userId) {
            newTeam.players.push({
              userId: verification.userId,
              name: playerInput.name,
              role: playerInput.role,
              battingOrder: teamPlayerMap.battingOrder
            })
          }
          
          // Create WhatsApp invite for unregistered players
          if (verification?.needsInvite) {
            const signupLink = `${window.location.origin}/signup?teamId=${newTeam.id}&playerId=${player.id}`
            
            const invite: WhatsAppInvite = {
              id: generateId(),
              teamId: newTeam.id,
              playerId: player.id,
              playerName: player.name,
              playerPhone: player.phone,
              message: `Hi ${player.name},\n\nYou have been selected in ${teamName}.\n\nPlease sign up in the app to join your team officially.\n\nTeam ID: ${newTeam.id}\nSignup Link: ${signupLink}`,
              sentAt: new Date(),
              status: 'sent',
              signupLink
            }
            
            invites.push(invite)
            
            // Send WhatsApp message (simulate API call)
            await sendWhatsAppMessage(invite)
          }
        }
      }

      // Save to localStorage (simulate database)
      const existingTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
      const existingPlayers = JSON.parse(localStorage.getItem('cricketPlayers') || '[]')
      const existingMappings = JSON.parse(localStorage.getItem('cricketTeamPlayerMaps') || '[]')
      const existingInvites = JSON.parse(localStorage.getItem('cricketWhatsAppInvites') || '[]')
      
      localStorage.setItem('cricketTeams', JSON.stringify([...existingTeams, newTeam]))
      localStorage.setItem('cricketPlayers', JSON.stringify([...existingPlayers, ...players]))
      localStorage.setItem('cricketTeamPlayerMaps', JSON.stringify([...existingMappings, ...teamPlayerMaps]))
      localStorage.setItem('cricketWhatsAppInvites', JSON.stringify([...existingInvites, ...invites]))
      
      setTeamCreated(newTeam)
      setInvitesSent(invites)
      
      toast.success(`Team "${teamName}" created successfully!`)
      if (invites.length > 0) {
        toast.success(`${invites.length} WhatsApp invites sent!`)
      }
      
    } catch (error) {
      toast.error('Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  // Simulate WhatsApp API call
  const sendWhatsAppMessage = async (invite: WhatsAppInvite): Promise<void> => {
    // In a real implementation, this would call WhatsApp Business API or Twilio
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('WhatsApp message sent:', {
          to: invite.playerPhone,
          message: invite.message
        })
        resolve()
      }, 1000)
    })
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return teamName.trim().length > 0
      case 2:
        return playerInputs.every(p => 
          p.name.trim().length > 0 && 
          p.phone.trim().length > 0 && 
          validatePhone(p.phone)
        )
      case 3:
        return true
      default:
        return false
    }
  }

  if (teamCreated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Team Created Successfully!</h3>
            <p className="text-gray-600">Your team "{teamCreated.name}" has been created</p>
          </div>

          {/* Team Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Team ID:</span>
              <div className="flex items-center">
                <span className="font-mono text-lg">{teamCreated.id}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(teamCreated.id)
                    toast.success('Team ID copied!')
                  }}
                  className="ml-2 p-1 hover:bg-gray-200 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Total Players:</span>
              <span>{teamCreated.players.length}</span>
            </div>
          </div>

          {/* Invites Summary */}
          {invitesSent.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">WhatsApp Invites Sent ({invitesSent.length})</h4>
              <div className="space-y-2">
                {invitesSent.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{invite.playerName}</p>
                        <p className="text-sm text-gray-600">{invite.playerPhone}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 btn-primary"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Create Team with Invites</h3>
            <p className="text-gray-600">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-cricket-primary text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-cricket-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Team Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
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
                As captain, you can manage team members and organize matches.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Add Players */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Add Team Players</h4>
              <button
                onClick={addPlayerInput}
                className="bg-cricket-secondary hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="inline w-4 h-4 mr-2" />
                Add Player
              </button>
            </div>

            <div className="space-y-4">
              {playerInputs.map((player, index) => (
                <motion.div
                  key={player.tempId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerInput(player.tempId, 'name', e.target.value)}
                      placeholder="Player name"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={player.phone}
                      onChange={(e) => updatePlayerInput(player.tempId, 'phone', e.target.value)}
                      placeholder="+91 9876543210"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={player.role}
                      onChange={(e) => updatePlayerInput(player.tempId, 'role', e.target.value)}
                      className="input-field"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicket-keeper">Wicket-keeper</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    {playerInputs.length > 1 && (
                      <button
                        onClick={() => removePlayerInput(player.tempId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-gray-800">How it works</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We'll check if players are already registered</li>
                <li>• Registered players will be added directly to your team</li>
                <li>• Unregistered players will receive WhatsApp invites</li>
                <li>• They can join your team after signing up</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Send Invites */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-gray-800">Review & Send Invites</h4>
            
            <div className="space-y-4">
              {playerInputs.map((player) => {
                const verification = playerVerification[player.tempId]
                return (
                  <div key={player.tempId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-cricket-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{player.name}</p>
                        <p className="text-sm text-gray-600">{player.phone} • {player.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {verification?.exists ? (
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Registered
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center">
                          <Send className="w-4 h-4 mr-1" />
                          Will send invite
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">What happens next?</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your team will be created with ID: <span className="font-mono">{generateTeamId()}</span></li>
                <li>• Registered players will be added immediately</li>
                <li>• WhatsApp invites will be sent to unregistered players</li>
                <li>• Players can join using the team ID or signup link</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium bg-white"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={() => {
              if (step === 1) {
                setStep(2)
              } else if (step === 2) {
                checkPlayersExist()
              } else {
                createTeamAndSendInvites()
              }
            }}
            disabled={!isStepValid() || loading}
            className="px-6 py-2 btn-primary disabled:opacity-50 flex items-center"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {step === 1 ? 'Next' : step === 2 ? 'Check Players' : 'Create Team & Send Invites'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
