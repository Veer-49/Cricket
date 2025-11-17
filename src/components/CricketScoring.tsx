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
import { FirebaseService } from '@/services/firebaseService'
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

  // Team Code State
  const [useTeamCodes, setUseTeamCodes] = useState(false)
  const [team1Code, setTeam1Code] = useState('')
  const [team2Code, setTeam2Code] = useState('')
  const [loadingTeamCodes, setLoadingTeamCodes] = useState(false)

  // Match Setup State
  const [matchSetupComplete, setMatchSetupComplete] = useState(false)
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null)
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null)
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [customOvers, setCustomOvers] = useState(20)
  const [venue, setVenue] = useState('')
  
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
  const [nonStriker, setNonStriker] = useState<string>('')

  // Ball Input State
  const [runs, setRuns] = useState<number>(0)
  const [isWicket, setIsWicket] = useState(false)
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled')
  const [extraType, setExtraType] = useState<ExtraType | null>(null)
  const [extraRuns, setExtraRuns] = useState(0)

  // Wicket Handling State
  const [dismissedBatsman, setDismissedBatsman] = useState<string>('')
  const [fielder, setFielder] = useState<string>('')
  const [showBatsmanSelection, setShowBatsmanSelection] = useState(false)
  const [availableBatsmen, setAvailableBatsmen] = useState<string[]>([])

  const getOversForFormat = (format: MatchFormat): number => {
    switch (format) {
      case 'T20': return 20
      case 'ODI': return 50
      case 'Test': return 999 // Unlimited
      case 'Custom': return customOvers
      default: return 20
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

  const loadTeamFromCode = async (code: string): Promise<Team | null> => {
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

    if (team1Code.length !== 6 || team2Code.length !== 6) {
      toast.error('Team codes must be exactly 6 characters')
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
      toast.error('Failed to load teams. Please check the codes and try again.')
    } finally {
      setLoadingTeamCodes(false)
    }
  }

  const initializeMatch = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !venue || !tossCompleted) {
      toast.error('Please complete team selection, venue, and toss before starting match')
      return
    }

    // Always use team IDs for innings data, regardless of selection method
    const battingFirstTeamId = tossDecision === 'bat' ? 
      (useTeamCodes ? 
        (tossWinner === selectedTeam1.name ? selectedTeam1.id : selectedTeam2.id) : 
        tossWinner
      ) : 
      (useTeamCodes ? 
        (tossWinner === selectedTeam1.name ? selectedTeam2.id : selectedTeam1.id) :
        (tossWinner === selectedTeam1.id ? selectedTeam2.id : selectedTeam1.id)
      )
    
    const bowlingFirstTeamId = battingFirstTeamId === selectedTeam1.id ? selectedTeam2.id : selectedTeam1.id

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
        battingTeam: battingFirstTeamId,
        bowlingTeam: bowlingFirstTeamId,
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

  // Universal Wicket Event Flow
  const handleWicket = (wicketType: DismissalType, dismissedPlayer: string, bowlerGetsWicket: boolean = true) => {
    if (!currentMatch) return

    const updatedMatch = { ...currentMatch }
    const currentInningsData = updatedMatch.innings[currentInnings - 1]
    const battingTeam = currentMatch.team1.id === currentInningsData.battingTeam ? currentMatch.team1 : currentMatch.team2

    // Update batsman stats
    const batsmanIndex = currentInningsData.batsmen.findIndex(b => b.playerId === dismissedPlayer)
    if (batsmanIndex !== -1) {
      currentInningsData.batsmen[batsmanIndex].isOut = true
      currentInningsData.batsmen[batsmanIndex].howOut = wicketType
      currentInningsData.batsmen[batsmanIndex].bowlerOut = bowlerGetsWicket ? currentBowler : undefined
      currentInningsData.batsmen[batsmanIndex].fielderOut = fielder || undefined
      
      // Only increment balls faced if striker was dismissed
      if (dismissedPlayer === striker) {
        currentInningsData.batsmen[batsmanIndex].ballsFaced += 1
      }
    }

    // Update bowler stats (if bowler gets wicket)
    if (bowlerGetsWicket) {
      const bowlerIndex = currentInningsData.bowlers.findIndex(b => b.playerId === currentBowler)
      if (bowlerIndex !== -1) {
        currentInningsData.bowlers[bowlerIndex].wickets += 1
        currentInningsData.bowlers[bowlerIndex].legalBalls += 1
      }
    }

    // Update team wickets
    currentInningsData.wickets += 1

    // Check innings end
    if (currentInningsData.wickets >= 10) {
      if (currentInnings === 1) {
        toast.success('First innings completed - All out!')
        startSecondInnings(updatedMatch)
      } else {
        endMatch(updatedMatch)
      }
      return
    }

    // Show batsman selection modal
    const outBatsmen = currentInningsData.batsmen.filter(b => b.isOut).map(b => b.playerId)
    const available = battingTeam.players
      .filter(p => !outBatsmen.includes(p.userId) && p.userId !== striker && p.userId !== nonStriker)
      .map(p => p.userId)
    
    setAvailableBatsmen(available)
    setShowBatsmanSelection(true)
    setCurrentMatch(updatedMatch)
  }

  const selectNewBatsman = (newBatsmanId: string) => {
    // Update striker/non-striker based on who was dismissed
    if (dismissedBatsman === striker) {
      setStriker(newBatsmanId)
    } else if (dismissedBatsman === nonStriker) {
      setNonStriker(newBatsmanId)
    }

    setShowBatsmanSelection(false)
    setDismissedBatsman('')
    setFielder('')
    
    // Reset ball input after batsman selection
    setRuns(0)
    setIsWicket(false)
    setExtraType(null)
    setExtraRuns(0)
    setDismissalType('bowled')
    
    toast.success('New batsman selected!')
  }

  const addBallWithRuns = (runsScored: number) => {
    if (!currentMatch || !striker || !nonStriker || !currentBowler) {
      toast.error('Please select both batsmen and bowler')
      return
    }

    // Wide and No Ball are illegal balls (don't count), Bye and Leg Bye are legal balls (count)
    const isLegal = !extraType || (extraType === 'bye' || extraType === 'leg-bye')
    const totalRuns = runsScored + extraRuns
    const currentOver = Math.floor(currentMatch.currentBall / 6) + 1
    const ballInOver = (currentMatch.currentBall % 6) + 1

    // Enhanced Ball Structure
    const newBall: Ball = {
      ballNumber: currentMatch.currentBall + 1,
      over: currentOver,
      ball: ballInOver,
      bowler: currentBowler,  // Required by Ball interface
      batsman: striker,       // Required by Ball interface
      isWicket: !!isWicket,   // Required by Ball interface
      striker_id: striker,
      non_striker_id: nonStriker,
      bowler_id: currentBowler,
      dismissalType: isWicket ? dismissalType : undefined,
      dismissed_batsman_id: isWicket ? (dismissalType === 'run-out' ? dismissedBatsman : striker) : undefined,
      fielder_id: isWicket && fielder ? fielder : undefined,
      runs: runsScored,
      extras: extraType || undefined,
      extraRuns,
      isLegal,
      timestamp: new Date()
    }

    const updatedMatch = { ...currentMatch }
    const currentInningsData = updatedMatch.innings[currentInnings - 1]

    // Update runs
    currentInningsData.runs += totalRuns
    
    // Update ball count for legal balls
    if (isLegal) {
      currentInningsData.balls += 1
      updatedMatch.currentBall += 1
    }

    // Update overs
    if (isLegal && currentInningsData.balls % 6 === 0) {
      currentInningsData.overs += 1
      // Swap striker/non-striker at end of over (unless wicket)
      if (!isWicket) {
        const tempStriker = striker
        setStriker(nonStriker)
        setNonStriker(tempStriker)
      }
    }

    // Handle strike rotation for runs
    if (!isWicket && isLegal && runsScored % 2 === 1) {
      const tempStriker = striker
      setStriker(nonStriker)
      setNonStriker(tempStriker)
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

    // Handle wicket
    if (isWicket) {
      const wicketBatsman = dismissalType === 'run-out' ? dismissedBatsman : striker
      const bowlerGetsWicket = !['run-out', 'retired hurt', 'timed out'].includes(dismissalType)
      
      setDismissedBatsman(wicketBatsman)
      handleWicket(dismissalType, wicketBatsman, bowlerGetsWicket)
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

    // Check for innings end (overs completed)
    const maxOvers = updatedMatch.totalOvers || 20
    const oversCompleted = Math.floor(currentInningsData.balls / 6)

    if (oversCompleted >= maxOvers && currentInnings === 1) {
      toast.success('First innings completed!')
      startSecondInnings(updatedMatch)
    } else if ((oversCompleted >= maxOvers || 
               (currentInnings === 2 && currentInningsData.runs > updatedMatch.innings[0].runs)) 
               && currentInnings === 2) {
      endMatch(updatedMatch)
    } else {
      setCurrentMatch(updatedMatch)
    }
    
    // Reset ball input (only if not showing batsman selection)
    if (!isWicket || !showBatsmanSelection) {
      setRuns(0)
      setIsWicket(false)
      setExtraType(null)
      setExtraRuns(0)
      setDismissalType('bowled')
      setFielder('')
    }

    toast.success(`${runsScored} run${runsScored !== 1 ? 's' : ''} added!`)
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
    setNonStriker('')
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

  const generateCommentary = (ball: any): string => {
    const bowlerName = getPlayerName(ball.bowler_id || ball.bowler)
    const strikerName = getPlayerName(ball.striker_id || ball.batsman)
    
    let description = `${bowlerName} to ${strikerName}`
    
    if (ball.dismissal_type || ball.isWicket) {
      const dismissalType = ball.dismissal_type || ball.dismissalType
      description += `, OUT! ${dismissalType}`
      
      if (ball.fielder_id && dismissalType === 'caught') {
        const fielderName = getPlayerName(ball.fielder_id)
        description += ` by ${fielderName}`
      }
    } else if (ball.runs === 0) {
      description += ', dot ball'
    } else if (ball.runs === 4) {
      description += ', FOUR!'
    } else if (ball.runs === 6) {
      description += ', SIX!'
    } else {
      description += `, ${ball.runs} run${ball.runs > 1 ? 's' : ''}`
    }

    if (ball.extras || ball.extraType) {
      const extra = ball.extras || ball.extraType
      description += ` (${extra})`
    }

    return description
  }

  const getPlayerName = (playerId: string): string => {
    if (!currentMatch) return playerId
    
    // Search in both teams
    const allPlayers = [...currentMatch.team1.players, ...currentMatch.team2.players]
    const player = allPlayers.find(p => p.userId === playerId)
    return player?.name || playerId
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
          
          {userTeams.length < 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> You need at least 2 teams to start a match. 
                You currently have {userTeams.length} team{userTeams.length !== 1 ? 's' : ''}.
              </p>
            </div>
          )}
          
          {/* Step 1: Team Selection */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Select Teams</h3>
              
              {/* Toggle between My Teams and Team Codes */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setUseTeamCodes(false)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      !useTeamCodes 
                        ? 'bg-cricket-primary text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    My Teams
                  </button>
                  <button
                    onClick={() => setUseTeamCodes(true)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      useTeamCodes 
                        ? 'bg-cricket-primary text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Team Codes
                  </button>
                </div>
              </div>

              {!useTeamCodes ? (
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
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm mb-2">
                      <strong>How to find team codes:</strong>
                    </p>
                    <ul className="text-red-600 text-sm space-y-1">
                      <li>• Go to Team Management → View team details</li>
                      <li>• Each team has a unique 6-character code</li>
                      <li>• Ask team captains for their team codes</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team A Code</label>
                      <input
                        type="text"
                        value={team1Code}
                        onChange={(e) => setTeam1Code(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code"
                        maxLength={6}
                        className="input-field text-gray-900 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Team B Code</label>
                      <input
                        type="text"
                        value={team2Code}
                        onChange={(e) => setTeam2Code(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code"
                        maxLength={6}
                        className="input-field text-gray-900 uppercase"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleLoadTeamsFromCodes}
                      disabled={!team1Code || !team2Code || team1Code.length !== 6 || team2Code.length !== 6 || loadingTeamCodes}
                      className="bg-cricket-primary text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingTeamCodes ? 'Loading Teams...' : 'Load Teams'}
                    </button>
                  </div>
                  
                  {selectedTeam1 && selectedTeam2 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium mb-2">Teams loaded successfully!</p>
                      <div className="flex justify-center gap-4">
                        <span className="bg-white px-3 py-1 rounded border text-black">{selectedTeam1.name}</span>
                        <span className="text-black">vs</span>
                        <span className="bg-white px-3 py-1 rounded border text-black">{selectedTeam2.name}</span>
                      </div>
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
                            {userTeams.find(t => t.id === tossWinner)?.name}
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
                        onClick={() => setTossWinner(useTeamCodes ? selectedTeam1?.name || '' : selectedTeam1?.id || '')}
                        className={`py-3 px-8 rounded-lg font-bold text-lg border-2 transition-all ${
                          tossWinner === (useTeamCodes ? selectedTeam1?.name : selectedTeam1?.id) 
                            ? 'bg-cricket-primary text-white border-cricket-primary shadow-lg' 
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        }`}
                      >
                        🏏 {selectedTeam1?.name}
                      </button>
                      <button
                        onClick={() => setTossWinner(useTeamCodes ? selectedTeam2?.name || '' : selectedTeam2?.id || '')}
                        className={`py-3 px-8 rounded-lg font-bold text-lg border-2 transition-all ${
                          tossWinner === (useTeamCodes ? selectedTeam2?.name : selectedTeam2?.id) 
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
                        {useTeamCodes ? tossWinner : userTeams.find(t => t.id === tossWinner)?.name} chooses to:
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
                    ✅ Toss Complete! {useTeamCodes ? tossWinner : userTeams.find(t => t.id === tossWinner)?.name} won and chose to {tossDecision === 'bat' ? 'bat' : 'bowl'} first.
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
        <div className="space-y-6">
          {/* Current Score */}
          <div className="grid grid-cols-3 gap-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Score</p>
              <p className="text-3xl font-bold text-cricket-primary">
                {currentInningsData?.runs || 0}<span className="text-lg">/{currentInningsData?.wickets || 0}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Overs</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.floor((currentInningsData?.balls || 0) / 6)}.{(currentInningsData?.balls || 0) % 6}
              </p>
            </div>
            {currentInnings === 2 && currentMatch?.innings[0] && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Target</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentMatch.innings[0].runs + 1}
                </p>
              </div>
            )}
            
            {/* Current Partnership - Full Width */}
            {currentInningsData?.batsmen && striker && nonStriker && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-blue-800">Partnership</h3>
                  <div className="text-3xl font-extrabold text-blue-700">
                    {currentInningsData.batsmen
                      .filter(b => b.playerId === striker || b.playerId === nonStriker)
                      .reduce((total, b) => total + (b.runs || 0), 0)}
                    <span className="ml-2 text-base font-normal">runs</span>
                  </div>
                </div>
                
                {battingTeam && (
                  <div className="grid grid-cols-2 gap-4">
                    {[striker, nonStriker].filter(Boolean).map((playerId) => {
                      const player = battingTeam?.players?.find(p => p.userId === playerId);
                      const stats = currentInningsData?.batsmen?.find(b => b.playerId === playerId) || {} as BatsmanStats;
                      const isStriker = playerId === striker;
                      
                      if (!player || !stats) return null;
                      
                      return (
                        <div 
                          key={playerId} 
                          className={`p-3 rounded-lg ${isStriker ? 'bg-white shadow-sm' : 'bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {player.name?.split(' ')[0]}
                                {isStriker && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">STRIKER</span>}
                              </p>
                              <p className="text-2xl font-bold text-blue-700">
                                {stats.runs || 0}
                                <span className="text-sm font-normal text-gray-500 ml-1">
                                  ({stats.ballsFaced || 0} balls)
                                </span>
                                {!stats.isOut && <span className="text-green-600 ml-1">*</span>}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-2 text-sm">
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                  {stats.fours || 0}×4
                                </span>
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                  {stats.sixes || 0}×6
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                SR: {stats.ballsFaced ? Math.round(((stats.runs || 0) / stats.ballsFaced) * 100) : 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-500">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-medium">Partnership</div>
                      <div className="text-sm font-semibold text-blue-700">
                        {currentInningsData.batsmen
                          ?.filter(b => b.playerId === striker || b.playerId === nonStriker)
                          ?.reduce((total, b) => total + (b.runs || 0), 0) || 0}
                        <span className="ml-1">runs</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Balls</div>
                      <div className="text-sm font-semibold text-blue-700">
                        {currentInningsData.batsmen
                          ?.filter(b => b.playerId === striker || b.playerId === nonStriker)
                          ?.reduce((total, b) => total + (b.ballsFaced || 0), 0) || 0}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Run Rate</div>
                      <div className="text-sm font-semibold text-blue-700">
                        {calculateRunRate(
                          currentInningsData.batsmen
                            .filter(b => b.playerId === striker || b.playerId === nonStriker)
                            .reduce((total, b) => total + (b.runs || 0), 0),
                          Math.floor((currentInningsData.balls || 0) / 6),
                          (currentInningsData.balls || 0) % 6
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Run Rate */}
          <div className="text-center">
            <p className="text-lg font-semibold text-black">Run Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {calculateRunRate(
                currentInningsData?.runs || 0, 
                Math.floor((currentInningsData?.balls || 0) / 6),
                (currentInningsData?.balls || 0) % 6
              ).toFixed(2)}
            </p>
            
            {/* Required Run Rate (2nd Innings) */}
            {currentInnings === 2 && currentMatch?.innings[0] && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-black">Required RR:</p>
                <p className="text-lg font-bold text-red-600">
                  {calculateRequiredRunRate(
                    (currentMatch?.innings[0]?.runs || 0) + 1,
                    currentInningsData?.runs || 0,
                    Math.max(0, (currentMatch?.totalOvers || 20) * 6 - (currentInningsData?.balls || 0)) / 6
                  ).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Runs Needed (2nd Innings) */}
          {currentInnings === 2 && currentMatch?.innings?.[0] && currentInningsData && (
            <div className="text-center">
              <div className="text-center">
                {currentInningsData?.runs > currentMatch.innings[0]?.runs ? (
                  <div className="text-3xl font-bold text-green-600">
                    Winning by {10 - (currentInningsData?.wickets || 0)} wkts
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-extrabold text-red-600">
                      Need {(currentMatch.innings[0]?.runs || 0) - (currentInningsData?.runs || 0) + 1}
                    </div>
                    <div className="text-xl font-semibold text-gray-700 mt-1">
                      in {Math.max(0, (currentMatch.totalOvers || 20) * 6 - (currentInningsData?.balls || 0))} balls
                    </div>
                  </>
                )}
              </div>
              
              {/* Runs needed section removed as per user request */}
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
        <h3 className="text-3xl font-bold text-black mb-6 text-center">🏏 Live Cricket Scoring</h3>
        
        {/* Player Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
          <div>
            <label className="block text-lg font-bold text-black mb-3">🏏 Striker</label>
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
            <label className="block text-lg font-bold text-black mb-3">🏃 Non-Striker</label>
            <select
              value={nonStriker}
              onChange={(e) => setNonStriker(e.target.value)}
              className="input-field"
            >
              <option value="">Select non-striker</option>
              {battingTeam?.players
                .filter(player => player.userId !== striker)
                .map(player => (
                  <option key={player.userId} value={player.userId}>{player.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-3">⚾ Bowler</label>
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
        </div>

        {/* Runs Scoring Row */}
        <div className="mb-8 bg-white p-6 rounded-lg border-2 border-gray-300">
          <label className="block text-2xl font-bold text-black mb-6 text-center">🏏 Score Runs</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 justify-items-center">
            <button
              onClick={() => addBallWithRuns(0)}
              className="w-20 h-20 rounded-full font-bold text-2xl bg-gray-700 text-black border-4 border-gray-600 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              0
            </button>
            <button
              onClick={() => addBallWithRuns(1)}
              className="w-20 h-20 rounded-full font-bold text-2xl bg-blue-600 text-black border-4 border-blue-500 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              1
            </button>
            <button
              onClick={() => addBallWithRuns(2)}
              className="w-20 h-20 rounded-full font-bold text-2xl bg-blue-600 text-black border-4 border-blue-500 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              2
            </button>
            <button
              onClick={() => addBallWithRuns(3)}
              className="w-20 h-20 rounded-full font-bold text-2xl bg-blue-600 text-black border-4 border-blue-500 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              3
            </button>
            <button
              onClick={() => addBallWithRuns(4)}
              className="w-20 h-20 rounded-full font-bold text-2xl bg-green-600 text-black border-4 border-green-500 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              4
            </button>
            <button
              onClick={() => addBallWithRuns(6)}
              className="w-20 h-20 rounded-full font-bold text-2xl bg-red-600 text-black border-4 border-red-500 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              6
            </button>
          </div>
        </div>

        {/* Extras Row */}
        <div className="mb-6 bg-white p-6 rounded-lg border-2 border-gray-300">
          <label className="block text-2xl font-bold text-black mb-6 text-center">⚡ Extras</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mb-4">
            <button
              onClick={() => setExtraType('wide')}
              className={`w-32 h-16 font-bold text-lg rounded-xl border-4 shadow-lg ${
                extraType === 'wide' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-yellow-500 text-black border-yellow-400'
              }`}
            >
              Wide
            </button>
            <button
              onClick={() => setExtraType('no-ball')}
              className={`w-32 h-16 font-bold text-lg rounded-xl border-4 shadow-lg ${
                extraType === 'no-ball' ? 'bg-orange-600 text-black border-orange-500' : 'bg-orange-500 text-black border-orange-400'
              }`}
            >
              No Ball
            </button>
            <button
              onClick={() => setExtraType('bye')}
              className={`w-32 h-16 font-bold text-lg rounded-xl border-4 shadow-lg ${
                extraType === 'bye' ? 'bg-blue-600 text-black border-blue-500' : 'bg-blue-500 text-black border-blue-400'
              }`}
            >
              Bye
            </button>
            <button
              onClick={() => setExtraType('leg-bye')}
              className={`w-32 h-16 font-bold text-lg rounded-xl border-4 shadow-lg ${
                extraType === 'leg-bye' ? 'bg-purple-600 text-black border-purple-500' : 'bg-purple-500 text-black border-purple-400'
              }`}
            >
              Leg Bye
            </button>
          </div>

          {/* Extra Runs Input */}
          {extraType && (
            <div className="text-center">
              <label className="block text-lg font-bold text-black mb-3">
                Additional Runs from {extraType === 'wide' ? 'Wide' : extraType === 'no-ball' ? 'No Ball' : extraType === 'bye' ? 'Bye' : 'Leg Bye'}:
              </label>
              <div className="flex justify-center space-x-2 mb-4">
                {[0, 1, 2, 3, 4].map(run => (
                  <button
                    key={run}
                    onClick={() => setExtraRuns(run)}
                    className={`w-12 h-12 rounded-full font-bold text-lg border-2 ${
                      extraRuns === run ? 'bg-green-600 text-black border-green-500' : 'bg-gray-200 text-black border-gray-300'
                    }`}
                  >
                    {run}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const totalExtraRuns = 1 + extraRuns; // 1 for the extra + additional runs
                  addBallWithRuns(0); // 0 runs off the bat, extras handled separately
                }}
                className="px-8 py-3 bg-green-600 text-black rounded-xl font-bold text-lg border-2 border-green-500 shadow-lg"
              >
                Record {extraType === 'wide' ? 'Wide' : extraType === 'no-ball' ? 'No Ball' : extraType === 'bye' ? 'Bye' : 'Leg Bye'} + {extraRuns} runs
              </button>
            </div>
          )}
        </div>

        {/* Wicket Details (shown when wicket is checked) */}
        {isWicket && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dismissal Type</label>
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
                  <option value="retired hurt">Retired Hurt</option>
                  <option value="timed out">Timed Out</option>
                </select>
              </div>
              
              {(dismissalType === 'run-out') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Who was run out?</label>
                  <select
                    value={dismissedBatsman}
                    onChange={(e) => setDismissedBatsman(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select batsman</option>
                    <option value={striker}>Striker ({getPlayerName(striker)})</option>
                    <option value={nonStriker}>Non-Striker ({getPlayerName(nonStriker)})</option>
                  </select>
                </div>
              )}
              
              {(['caught', 'stumped', 'run-out'].includes(dismissalType)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fielder</label>
                  <select
                    value={fielder}
                    onChange={(e) => setFielder(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Fielder</option>
                    {bowlingTeam?.players.map(player => (
                      <option key={player.userId} value={player.userId}>{player.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wicket Section */}
        <div className="mb-6 bg-white p-6 rounded-lg border-2 border-gray-300">
          <div className="text-center">
            <label className="inline-flex items-center text-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={isWicket}
                onChange={(e) => setIsWicket(e.target.checked)}
                className="mr-4 w-6 h-6 text-red-600 rounded focus:ring-red-500"
              />
              <span className="font-bold text-black">🎯 Wicket</span>
            </label>
          </div>

          {isWicket && (
            <div className="mt-6 text-center">
              <button
                onClick={() => addBallWithRuns(0)}
                className="px-12 py-4 bg-red-600 hover:bg-red-700 text-black rounded-xl font-bold text-xl border-2 border-red-500 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                🎯 Record Wicket
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Batsman Selection Modal */}
      <AnimatePresence>
        {showBatsmanSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-black mb-4">Select New Batsman</h3>
              <p className="text-black mb-4">
                {getPlayerName(dismissedBatsman)} is out. Select the next batsman:
              </p>
              
              <div className="space-y-2 mb-6">
                {availableBatsmen.map(batsmanId => {
                  const battingTeam = currentMatch?.team1.id === currentMatch?.innings[currentInnings - 1]?.battingTeam ? 
                    currentMatch?.team1 : currentMatch?.team2
                  const player = battingTeam?.players.find(p => p.userId === batsmanId)
                  
                  return (
                    <button
                      key={batsmanId}
                      onClick={() => selectNewBatsman(batsmanId)}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-cricket-primary text-black hover:text-black rounded-lg transition-colors"
                    >
                      {player?.name || batsmanId}
                    </button>
                  )
                })}
              </div>
              
              {availableBatsmen.length === 0 && (
                <p className="text-red-600 text-center">
                  No more batsmen available. Innings will end.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
