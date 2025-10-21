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

interface CricketScoringProps {
  teams: Team[]
  user: any
}

export default function CricketScoring({ teams, user }: CricketScoringProps) {
  // Match Setup State
  const [matchSetupComplete, setMatchSetupComplete] = useState(false)
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null)
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null)
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [customOvers, setCustomOvers] = useState(20)
  const [venue, setVenue] = useState('')
  const [tossWinner, setTossWinner] = useState<string>('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat')

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

  const initializeMatch = () => {
    if (!selectedTeam1 || !selectedTeam2 || !venue || !tossWinner) {
      toast.error('Please complete all match setup fields')
      return
    }

    const battingFirst = tossDecision === 'bat' ? tossWinner : 
      (tossWinner === selectedTeam1.id ? selectedTeam2.id : selectedTeam1.id)
    
    const bowlingFirst = battingFirst === selectedTeam1.id ? selectedTeam2.id : selectedTeam1.id

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
    toast.success('Match initialized successfully!')
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
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cricket Match Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team A</label>
              <select
                value={selectedTeam1?.id || ''}
                onChange={(e) => setSelectedTeam1(teams.find(t => t.id === e.target.value) || null)}
                className="input-field"
              >
                <option value="">Select Team A</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team B</label>
              <select
                value={selectedTeam2?.id || ''}
                onChange={(e) => setSelectedTeam2(teams.find(t => t.id === e.target.value) || null)}
                className="input-field"
              >
                <option value="">Select Team B</option>
                {teams.filter(t => t.id !== selectedTeam1?.id).map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Match Format</label>
              <select
                value={matchFormat}
                onChange={(e) => setMatchFormat(e.target.value as MatchFormat)}
                className="input-field"
              >
                <option value="T20">T20 (20 overs)</option>
                <option value="ODI">ODI (50 overs)</option>
                <option value="Test">Test (Unlimited)</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {matchFormat === 'Custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Overs</label>
                <input
                  type="number"
                  value={customOvers}
                  onChange={(e) => setCustomOvers(Number(e.target.value))}
                  min="1"
                  max="100"
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue name"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Toss Winner</label>
              <select
                value={tossWinner}
                onChange={(e) => setTossWinner(e.target.value)}
                className="input-field"
              >
                <option value="">Select toss winner</option>
                {selectedTeam1 && <option value={selectedTeam1.id}>{selectedTeam1.name}</option>}
                {selectedTeam2 && <option value={selectedTeam2.id}>{selectedTeam2.name}</option>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Toss Decision</label>
              <select
                value={tossDecision}
                onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
                className="input-field"
              >
                <option value="bat">Bat First</option>
                <option value="bowl">Bowl First</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={initializeMatch}
            className="btn-primary mt-6"
          >
            <Play className="inline w-4 h-4 mr-2" />
            Start Match
          </motion.button>
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
