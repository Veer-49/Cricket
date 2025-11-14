'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Team, 
  Match, 
  Innings, 
  BatsmanStats, 
  BowlerStats, 
  Ball, 
  Commentary, 
  MatchFormat, 
  DismissalType, 
  ExtraType,
  MatchResult,
  Extras
} from '@/types'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  Clock, 
  TrendingUp, 
  Users, 
  Trophy,
  Plus,
  Minus,
  Save,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { NotificationService } from '@/services/notificationService'
import { FirebaseService } from '@/services/firebaseService'

interface CricketScoringProps {
  teams: Team[]
  user: any
}

export default function CricketScoring({ teams, user }: CricketScoringProps) {
  // Filter teams to show only ones the user is part of
  const userTeams = teams.filter(team => 
    team.captainId === user?.id || 
    team.players.some(player => player.userId === user?.id)
  )

  // Match Setup State
  const [matchSetupComplete, setMatchSetupComplete] = useState(false)
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null)
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null)
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [customOvers, setCustomOvers] = useState(20)
  const [venue, setVenue] = useState('')
  
  // Team Code Setup State
  const [useTeamCodes, setUseTeamCodes] = useState(false)
  const [team1Code, setTeam1Code] = useState('')
  const [team2Code, setTeam2Code] = useState('')
  const [loadingTeamCodes, setLoadingTeamCodes] = useState(false)
  
  // Toss State
  const [tossCompleted, setTossCompleted] = useState(false)
  const [tossWinner, setTossWinner] = useState<string>('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat')
  const [isFlipping, setIsFlipping] = useState(false)
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
  const [selectedCall, setSelectedCall] = useState<'heads' | 'tails' | null>(null)
  const [callingTeam, setCallingTeam] = useState<string>('')

  // Match State
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [currentInnings, setCurrentInnings] = useState(1)
  const [currentBatsmen, setCurrentBatsmen] = useState<string[]>([])
  const [currentBowler, setCurrentBowler] = useState<string>('')
  const [striker, setStriker] = useState<string>('')

  // Ball Input State
  const [runs, setRuns] = useState<number>(0)
  const [isWicket, setIsWicket] = useState(false)
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled')
  const [extraType, setExtraType] = useState<ExtraType | null>(null)
  const [extraRuns, setExtraRuns] = useState(0)

  const getOversForFormat = (format: MatchFormat): number => {
    switch (format) {
      case 'T20': return 20
      case 'ODI': return 50
      case 'Test': return 999 // Unlimited
      case 'Custom': return customOvers
      default: return 20
    }
  }

  const loadTeamFromCode = async (code: string): Promise<Team | null> => {
    if (!code || code.length !== 6) return null
    
    try {
      const team = await FirebaseService.getTeamByShortCode(code)
      return team
    } catch (error) {
      console.error('Error loading team:', error)
      return null
    }
  }

  const handleLoadTeamsFromCodes = async () => {
    if (!team1Code || !team2Code) {
      toast.error('Please enter both team codes')
      return
    }

    if (team1Code === team2Code) {
      toast.error('Team codes must be different')
      return
    }

    setLoadingTeamCodes(true)
    
    try {
      const [team1, team2] = await Promise.all([
        loadTeamFromCode(team1Code),
        loadTeamFromCode(team2Code)
      ])

      if (!team1) {
        toast.error(`Team with code "${team1Code}" not found`)
        setLoadingTeamCodes(false)
        return
      }

      if (!team2) {
        toast.error(`Team with code "${team2Code}" not found`)
        setLoadingTeamCodes(false)
        return
      }

      setSelectedTeam1(team1)
      setSelectedTeam2(team2)
      toast.success('Teams loaded successfully!')
    } catch (error) {
      toast.error('Failed to load teams')
    } finally {
      setLoadingTeamCodes(false)
    }
  }

  const flipCoin = () => {
    if (!selectedTeam1 || !selectedTeam2) {
      toast.error('Please select both teams first')
      return
    }

    setIsFlipping(true)
    
    // Reset toss state
    setTossWinner('')
    setTossCompleted(false)
    
    // Simulate coin flip with delay
    setTimeout(() => {
      const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'
      setCoinResult(result)
      setIsFlipping(false)
      
      toast.success(`Coin shows: ${result.toUpperCase()}!`)
    }, 2000) // 2 second flip animation
  }

  const completeToss = () => {
    if (!tossWinner || !tossDecision) {
      toast.error('Please select batting or bowling')
      return
    }
    setTossCompleted(true)
    toast.success('Toss completed! Ready to start match.')
  }

  const initializeMatch = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !venue || !tossCompleted) {
      toast.error('Please complete team selection, venue, and toss before starting match')
      return
    }

    // Determine which team bats first based on toss decision
    const tossWinnerTeam = tossWinner === selectedTeam1.name ? selectedTeam1 : selectedTeam2
    const tossLoserTeam = tossWinner === selectedTeam1.name ? selectedTeam2 : selectedTeam1
    
    const battingFirst = tossDecision === 'bat' ? tossWinnerTeam.id : tossLoserTeam.id
    const bowlingFirst = tossDecision === 'bat' ? tossLoserTeam.id : tossWinnerTeam.id

    const newMatch: Match = {
      id: Date.now().toString(),
      team1: selectedTeam1,
      team2: selectedTeam2,
      format: matchFormat,
      venue,
      date: new Date(),
      tossWinner,
      tossDecision,
      status: 'live',
      currentInnings: 1,
      totalOvers: getOversForFormat(matchFormat),
      currentBall: 0,
      innings: [{
        battingTeam: battingFirst,
        bowlingTeam: bowlingFirst,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0 },
        batsmen: [],
        bowlers: [],
        currentBatsmen: [],
        currentBowler: ''
      }],
      commentary: []
    }

    setCurrentMatch(newMatch)
    setMatchSetupComplete(true)
    
    // Send notifications to all team members
    const allTeamMembers: Array<{ userId: string; teamId: string }> = []
    
    // Add Team 1 members
    if (selectedTeam1) {
      allTeamMembers.push({ userId: selectedTeam1.captainId, teamId: selectedTeam1.id })
      selectedTeam1.players.forEach(player => {
        if (player.userId && player.userId !== selectedTeam1.captainId) {
          allTeamMembers.push({ userId: player.userId, teamId: selectedTeam1.id })
        }
      })
    }
    
    // Add Team 2 members
    if (selectedTeam2) {
      allTeamMembers.push({ userId: selectedTeam2.captainId, teamId: selectedTeam2.id })
      selectedTeam2.players.forEach(player => {
        if (player.userId && player.userId !== selectedTeam2.captainId) {
          allTeamMembers.push({ userId: player.userId, teamId: selectedTeam2.id })
        }
      })
    }
    
    // Send match start notification
    await NotificationService.createMatchStartNotification(
      newMatch.id,
      selectedTeam1.name,
      selectedTeam2.name,
      venue,
      allTeamMembers
    )
    
    toast.success('Match initialized successfully!')
    toast.success('🔔 Notifications sent to all team members!')
  }

  const addBall = () => {
    if (!currentMatch || !striker || !currentBowler) {
      toast.error('Please select batsman and bowler')
      return
    }

    const isLegal = !extraType || (extraType !== 'wide' && extraType !== 'no-ball')
    const totalRuns = runs + extraRuns

    const newBall: Ball = {
      ballNumber: currentMatch.currentBall + 1,
      over: Math.floor(currentMatch.currentBall / 6) + 1,
      bowler: currentBowler,
      batsman: striker,
      runs,
      isWicket,
      dismissalType: isWicket ? dismissalType : undefined,
      dismissedPlayer: isWicket ? striker : undefined,
      extraType: extraType || undefined,
      extraRuns,
      isLegal
    }

    // Update match state
    const updatedMatch = { ...currentMatch }
    const currentInningsData = updatedMatch.innings[currentInnings - 1]

    // Update runs
    currentInningsData.runs += totalRuns
    if (isLegal) {
      currentInningsData.balls += 1
      updatedMatch.currentBall += 1
    }

    // Update overs
    if (isLegal && currentInningsData.balls % 6 === 0) {
      currentInningsData.overs += 1
    }

    // Update wickets
    if (isWicket) {
      currentInningsData.wickets += 1
    }

    // Update extras
    if (extraType) {
      switch (extraType) {
        case 'wide': currentInningsData.extras.wides += 1; break
        case 'no-ball': currentInningsData.extras.noBalls += 1; break
        case 'bye': currentInningsData.extras.byes += extraRuns; break
        case 'leg-bye': currentInningsData.extras.legByes += extraRuns; break
        case 'penalty': currentInningsData.extras.penalties += extraRuns; break
      }
    }

    // Add commentary
    const commentary: Commentary = {
      ball: newBall.ballNumber,
      over: newBall.over,
      bowler: currentBowler,
      batsman: striker,
      runs: totalRuns,
      wicket: isWicket,
      dismissalType: isWicket ? dismissalType : undefined,
      extras: extraType || undefined,
      description: generateCommentary(newBall)
    }
    updatedMatch.commentary.push(commentary)

    // Check for innings end
    const maxOvers = updatedMatch.totalOvers || 20
    const oversCompleted = Math.floor(currentInningsData.balls / 6)
    const allOut = currentInningsData.wickets >= 10

    if ((oversCompleted >= maxOvers || allOut) && currentInnings === 1) {
      // End of first innings
      toast.success('First innings completed!')
      startSecondInnings(updatedMatch)
    } else if ((oversCompleted >= maxOvers || allOut || 
               (currentInnings === 2 && currentInningsData.runs > updatedMatch.innings[0].runs)) 
               && currentInnings === 2) {
      // End of match
      endMatch(updatedMatch)
    } else {
      setCurrentMatch(updatedMatch)
    }
    
    // Reset ball input
    setRuns(0)
    setIsWicket(false)
    setExtraType(null)
    setExtraRuns(0)

    toast.success('Ball added successfully!')
  }

  const startSecondInnings = (match: Match) => {
    const firstInnings = match.innings[0]
    const battingSecond = firstInnings.bowlingTeam
    const bowlingSecond = firstInnings.battingTeam

    const secondInnings: Innings = {
      battingTeam: battingSecond,
      bowlingTeam: bowlingSecond,
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0 },
      batsmen: [],
      bowlers: [],
      currentBatsmen: [],
      currentBowler: ''
    }

    const updatedMatch = {
      ...match,
      innings: [...match.innings, secondInnings],
      currentInnings: 2,
      currentBall: 0
    }

    setCurrentMatch(updatedMatch)
    setCurrentInnings(2)
    setStriker('')
    setCurrentBowler('')
    toast.success('Second innings started!')
  }

  const endMatch = (match: Match) => {
    const firstInnings = match.innings[0]
    const secondInnings = match.innings[1]
    
    let result: MatchResult
    
    if (secondInnings.runs > firstInnings.runs) {
      // Second batting team wins
      const wicketsRemaining = 10 - secondInnings.wickets
      result = {
        winner: match.team1.id === secondInnings.battingTeam ? match.team1.name : match.team2.name,
        margin: `${wicketsRemaining}`,
        type: 'wickets'
      }
    } else if (firstInnings.runs > secondInnings.runs) {
      // First batting team wins
      const runsMargin = firstInnings.runs - secondInnings.runs
      result = {
        winner: match.team1.id === firstInnings.battingTeam ? match.team1.name : match.team2.name,
        margin: `${runsMargin}`,
        type: 'runs'
      }
    } else {
      // Tie
      result = {
        winner: 'Tie',
        margin: '',
        type: 'tie'
      }
    }

    const completedMatch = {
      ...match,
      status: 'completed' as const,
      result
    }

    setCurrentMatch(completedMatch)
    
    // Save match to localStorage
    const savedMatches = JSON.parse(localStorage.getItem('cricketMatches') || '[]')
    savedMatches.push(completedMatch)
    localStorage.setItem('cricketMatches', JSON.stringify(savedMatches))
    
    toast.success(`Match completed! ${result.winner} ${result.type === 'tie' ? '' : 'won'}`)
  }

  const generateCommentary = (ball: Ball): string => {
    let description = `${ball.bowler} to ${ball.batsman}`
    
    if (ball.isWicket) {
      description += `, OUT! ${ball.dismissalType}`
    } else if (ball.runs === 0) {
      description += ', dot ball'
    } else if (ball.runs === 4) {
      description += ', FOUR!'
    } else if (ball.runs === 6) {
      description += ', SIX!'
    } else {
      description += `, ${ball.runs} run${ball.runs > 1 ? 's' : ''}`
    }

    if (ball.extraType) {
      description += ` (${ball.extraType})`
    }

    return description
  }

  const calculateRunRate = (runs: number, overs: number, balls: number): number => {
    const totalOvers = overs + (balls / 6)
    return totalOvers > 0 ? runs / totalOvers : 0
  }

  const calculateRequiredRunRate = (target: number, currentRuns: number, remainingOvers: number): number => {
    const runsNeeded = target - currentRuns
    return remainingOvers > 0 ? runsNeeded / remainingOvers : 0
  }

  if (!matchSetupComplete) {
    // Show message if user has no teams and not using team codes
    if (userTeams.length === 0 && !useTeamCodes) {
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Teams Available</h2>
            <p className="text-gray-600 mb-6">
              You're not part of any teams yet. You can either create/join teams or use team codes to start scoring for any teams.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setUseTeamCodes(true)}
                className="bg-cricket-primary hover:bg-cricket-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
              >
                Use Team Codes
              </button>
              <button
                onClick={() => window.location.hash = '#teams'}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Team Management
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cricket Match Setup</h2>
          
          {userTeams.length < 2 && !useTeamCodes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> You need at least 2 teams to start a match. 
                You currently have {userTeams.length} team{userTeams.length !== 1 ? 's' : ''}.
                <br />
                <strong>Tip:</strong> You can also use team codes to start scoring for any teams!
              </p>
            </div>
          )}
          
          {/* Step 1: Team Selection */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Select Teams</h3>
              
              {/* Team Selection Mode Toggle */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => {
                      setUseTeamCodes(false)
                      setSelectedTeam1(null)
                      setSelectedTeam2(null)
                      setTeam1Code('')
                      setTeam2Code('')
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !useTeamCodes 
                        ? 'bg-cricket-primary text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    My Teams
                  </button>
                  <button
                    onClick={() => {
                      setUseTeamCodes(true)
                      setSelectedTeam1(null)
                      setSelectedTeam2(null)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      useTeamCodes 
                        ? 'bg-cricket-primary text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Team Codes
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {useTeamCodes 
                    ? 'Enter 6-character team codes to start scoring for any teams'
                    : 'Select from teams you are a member of'
                  }
                </p>
              </div>

              {!useTeamCodes ? (
                /* My Teams Selection */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team A</label>
                    <select
                      value={selectedTeam1?.id || ''}
                      onChange={(e) => setSelectedTeam1(userTeams.find(t => t.id === e.target.value) || null)}
                      className="input-field text-gray-900"
                    >
                      <option value="">Select Team A</option>
                      {userTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team B</label>
                    <select
                      value={selectedTeam2?.id || ''}
                      onChange={(e) => setSelectedTeam2(userTeams.find(t => t.id === e.target.value) || null)}
                      className="input-field text-gray-900"
                    >
                      <option value="">Select Team B</option>
                      {userTeams.filter(t => t.id !== selectedTeam1?.id).map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* Team Codes Input */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team A Code</label>
                      <input
                        type="text"
                        value={team1Code}
                        onChange={(e) => setTeam1Code(e.target.value.toUpperCase().slice(0, 6))}
                        placeholder="Enter 6-character code"
                        className="input-field text-gray-900"
                        maxLength={6}
                      />
                      {selectedTeam1 && (
                        <p className="text-sm text-green-600 mt-1">✓ {selectedTeam1.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team B Code</label>
                      <input
                        type="text"
                        value={team2Code}
                        onChange={(e) => setTeam2Code(e.target.value.toUpperCase().slice(0, 6))}
                        placeholder="Enter 6-character code"
                        className="input-field text-gray-900"
                        maxLength={6}
                      />
                      {selectedTeam2 && (
                        <p className="text-sm text-green-600 mt-1">✓ {selectedTeam2.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleLoadTeamsFromCodes}
                      disabled={!team1Code || !team2Code || team1Code.length !== 6 || team2Code.length !== 6 || loadingTeamCodes}
                      className="bg-cricket-primary hover:bg-cricket-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingTeamCodes ? 'Loading Teams...' : 'Load Teams'}
                    </button>
                  </div>
                  
                  {useTeamCodes && (!selectedTeam1 || !selectedTeam2) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>How to find team codes:</strong>
                        <br />• Ask team captains for their 6-character team codes
                        <br />• Team codes are displayed in the Team Management section
                        <br />• Each team has a unique code like "ABC123"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Match Format & Venue */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Format</label>
                  <select
                    value={matchFormat}
                    onChange={(e) => setMatchFormat(e.target.value as MatchFormat)}
                    className="input-field text-gray-900"
                  >
                    <option value="T20">T20 (20 overs)</option>
                    <option value="ODI">ODI (50 overs)</option>
                    <option value="Test">Test Match</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {(matchFormat === 'Custom' || matchFormat === 'Test') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {matchFormat === 'Test' ? 'Overs per Innings' : 'Custom Overs'}
                    </label>
                    <input
                      type="number"
                      value={customOvers}
                      onChange={(e) => setCustomOvers(Number(e.target.value))}
                      min="1"
                      max={matchFormat === 'Test' ? "200" : "100"}
                      className="input-field text-gray-900"
                      placeholder={matchFormat === 'Test' ? "e.g., 90" : "Enter overs"}
                    />
                  </div>
                )}

                <div className={matchFormat === 'Custom' || matchFormat === 'Test' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Enter venue name (e.g., Lord's Cricket Ground)"
                    className="input-field text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Toss */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 3: Toss</h3>
              
              {!coinResult ? (
                <div className="text-center space-y-6">
                  <div className="flex flex-col items-center space-y-6">
                    <motion.div
                      animate={isFlipping ? { rotateY: 1800 } : { rotateY: 0 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="w-40 h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-yellow-300"
                    >
                      🪙
                    </motion.div>
                    
                    <button
                      onClick={flipCoin}
                      disabled={!selectedTeam1 || !selectedTeam2 || isFlipping}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white py-4 px-10 rounded-lg font-bold text-xl shadow-lg border-2 border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
                      style={{ color: 'white' }}
                    >
                      <span className="text-black font-bold">
                        {isFlipping ? '⏳ Flipping...' : '🪙 Flip Coin'}
                      </span>
                    </button>
                    
                    {(!selectedTeam1 || !selectedTeam2) && (
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Please select both teams first to flip the coin
                      </p>
                    )}
                  </div>
                </div>
              ) : !tossCompleted ? (
                <div className="text-center space-y-6">
                  {/* Big Coin with Result */}
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-40 h-40 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-4 border-green-300"
                    >
                      <div className="text-xl font-bold mb-1">{coinResult.toUpperCase()}</div>
                        {tossWinner && (
                          <div className="text-center px-1">
                            <div className="text-xs font-medium">WINNER</div>
                            <div className="text-sm font-bold leading-tight">
                              {useTeamCodes ? tossWinner : userTeams.find(t => t.id === tossWinner)?.name}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-lg font-semibold text-green-800">
                      Coin shows: {coinResult.toUpperCase()}!
                    </p>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-4">
                      👆 Click the team that won the toss:
                    </label>
                    <div className="flex justify-center gap-6 mb-6">
                      <button
                        onClick={() => setTossWinner(selectedTeam1?.name || '')}
                        className={`py-3 px-8 rounded-lg font-bold text-lg border-2 transition-all ${
                          tossWinner === selectedTeam1?.name 
                            ? 'bg-cricket-primary text-white border-cricket-primary shadow-lg' 
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        }`}
                      >
                        🏏 {selectedTeam1?.name}
                      </button>
                      <button
                        onClick={() => setTossWinner(selectedTeam2?.name || '')}
                        className={`py-3 px-8 rounded-lg font-bold text-lg border-2 transition-all ${
                          tossWinner === selectedTeam2?.name 
                            ? 'bg-cricket-primary text-white border-cricket-primary shadow-lg' 
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        }`}
                      >
                        🏏 {selectedTeam2?.name}
                      </button>
                    </div>
                  </div>

                  {tossWinner && (
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-4">
                        {tossWinner} chooses to:
                      </label>
                      <div className="flex justify-center gap-6">
                        <button
                          onClick={() => setTossDecision('bat')}
                          className={`py-3 px-8 rounded-lg font-bold text-lg ${
                            tossDecision === 'bat' 
                              ? 'bg-cricket-primary text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          🏏 Bat First
                        </button>
                        <button
                          onClick={() => setTossDecision('bowl')}
                          className={`py-3 px-8 rounded-lg font-bold text-lg ${
                            tossDecision === 'bowl' 
                              ? 'bg-cricket-primary text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          ⚾ Bowl First
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={completeToss}
                    disabled={!tossWinner || !tossDecision}
                    className="bg-green-600 text-black py-3 px-8 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✅ Confirm Toss Decision
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-blue-800 font-medium">
                    ✅ Toss Complete! {tossWinner} won and chose to {tossDecision === 'bat' ? 'bat' : 'bowl'} first.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={initializeMatch}
            disabled={!selectedTeam1 || !selectedTeam2 || !venue || !tossCompleted}
            className="w-full mt-8 bg-cricket-primary text-white py-4 px-6 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏏 Start Match
          </button>
        </motion.div>
      </div>
    )
  }

  const currentInningsData = currentMatch?.innings[currentInnings - 1]
  const battingTeam = currentMatch?.team1.id === currentInningsData?.battingTeam ? 
    currentMatch?.team1 : currentMatch?.team2
  const bowlingTeam = currentMatch?.team1.id === currentInningsData?.bowlingTeam ? 
    currentMatch?.team1 : currentMatch?.team2

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentMatch?.team1.name} vs {currentMatch?.team2.name}
            </h2>
            <p className="text-gray-600">{currentMatch?.format} • {currentMatch?.venue}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Innings {currentInnings}</p>
            <p className="text-sm text-gray-600">
              {battingTeam?.name} batting
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-cricket-primary">
              {currentInningsData?.runs}/{currentInningsData?.wickets}
            </p>
            <p className="text-gray-600">
              {Math.floor((currentInningsData?.balls || 0) / 6)}.{(currentInningsData?.balls || 0) % 6} overs
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">Run Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {calculateRunRate(
                currentInningsData?.runs || 0, 
                Math.floor((currentInningsData?.balls || 0) / 6),
                (currentInningsData?.balls || 0) % 6
              ).toFixed(2)}
            </p>
          </div>

          {currentInnings === 2 && (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">Required RR</p>
              <p className="text-2xl font-bold text-red-600">
                {calculateRequiredRunRate(
                  (currentMatch?.innings[0]?.runs || 0) + 1,
                  currentInningsData?.runs || 0,
                  (currentMatch?.totalOvers || 20) - Math.floor((currentInningsData?.balls || 0) / 6)
                ).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Ball Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Ball Input</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Striker</label>
            <select
              value={striker}
              onChange={(e) => setStriker(e.target.value)}
              className="input-field"
            >
              <option value="">Select striker</option>
              {battingTeam?.players.map(player => (
                <option key={player.userId} value={player.userId}>{player.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bowler</label>
            <select
              value={currentBowler}
              onChange={(e) => setCurrentBowler(e.target.value)}
              className="input-field"
            >
              <option value="">Select bowler</option>
              {bowlingTeam?.players.map(player => (
                <option key={player.userId} value={player.userId}>{player.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 6].map(run => (
                <button
                  key={run}
                  onClick={() => setRuns(run)}
                  className={`px-3 py-2 rounded-lg font-medium ${
                    runs === run ? 'bg-cricket-primary text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {run}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extras</label>
            <select
              value={extraType || ''}
              onChange={(e) => setExtraType(e.target.value as ExtraType || null)}
              className="input-field"
            >
              <option value="">No Extra</option>
              <option value="wide">Wide</option>
              <option value="no-ball">No Ball</option>
              <option value="bye">Bye</option>
              <option value="leg-bye">Leg Bye</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isWicket}
              onChange={(e) => setIsWicket(e.target.checked)}
              className="mr-2"
            />
            Wicket
          </label>

          {isWicket && (
            <select
              value={dismissalType}
              onChange={(e) => setDismissalType(e.target.value as DismissalType)}
              className="input-field"
            >
              <option value="bowled">Bowled</option>
              <option value="caught">Caught</option>
              <option value="lbw">LBW</option>
              <option value="run-out">Run Out</option>
              <option value="stumped">Stumped</option>
              <option value="hit-wicket">Hit Wicket</option>
            </select>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addBall}
          className="btn-primary"
        >
          <Plus className="inline w-4 h-4 mr-2" />
          Add Ball
        </motion.button>
      </motion.div>

      {/* Commentary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Live Commentary</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {currentMatch?.commentary.slice(-10).reverse().map((comment, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Over {comment.over}.{comment.ball % 6 || 6}
              </p>
              <p className="text-gray-800">{comment.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
