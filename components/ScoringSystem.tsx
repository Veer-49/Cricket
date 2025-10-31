'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Match, Team, Innings, BatsmanStats, BowlerStats, MatchFormat, DismissalType } from '../types'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus,
  Minus,
  Target,
  Clock,
  Trophy,
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface ScoringSystemProps {
  user: User | null
}

export default function ScoringSystem({ user }: ScoringSystemProps) {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [currentBall, setCurrentBall] = useState(0)
  const [currentOver, setCurrentOver] = useState(0)
  const [runs, setRuns] = useState(0)
  const [wickets, setWickets] = useState(0)
  const [extras, setExtras] = useState({ wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0 })
  const [commentary, setCommentary] = useState<string[]>([])

  // Match creation form
  const [team1Name, setTeam1Name] = useState('')
  const [team2Name, setTeam2Name] = useState('')
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('T20')
  const [venue, setVenue] = useState('')
  const [tossWinner, setTossWinner] = useState('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat')
  const [customOvers, setCustomOvers] = useState(20)

  // Current match state
  const [currentBatsman1, setCurrentBatsman1] = useState('')
  const [currentBatsman2, setCurrentBatsman2] = useState('')
  const [currentBowler, setCurrentBowler] = useState('')
  const [striker, setStriker] = useState(1) // 1 or 2

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
    setTeams(savedTeams)

    // Load active match if exists
    const savedMatch = localStorage.getItem('activeMatch')
    if (savedMatch) {
      setActiveMatch(JSON.parse(savedMatch))
    }
  }, [])

  const getMaxOvers = (format: MatchFormat) => {
    switch (format) {
      case 'T20': return 20
      case 'ODI': return 50
      case 'Test': return 999 // Unlimited for test
      case 'Custom': return customOvers
      default: return 20
    }
  }

  const handleCreateMatch = () => {
    if (!team1Name || !team2Name || !venue || !tossWinner) {
      toast.error('Please fill all required fields')
      return
    }

    const team1: Team = {
      id: uuidv4(),
      name: team1Name,
      captainId: user?.id || '',
      players: [],
      matchFormat,
      createdAt: new Date(),
      isPublic: false,
      wins: 0,
      losses: 0,
      draws: 0
    }

    const team2: Team = {
      id: uuidv4(),
      name: team2Name,
      captainId: user?.id || '',
      players: [],
      matchFormat,
      createdAt: new Date(),
      isPublic: false,
      wins: 0,
      losses: 0,
      draws: 0
    }

    const newMatch: Match = {
      id: uuidv4(),
      team1,
      team2,
      format: matchFormat,
      venue,
      date: new Date(),
      tossWinner,
      tossDecision,
      status: 'live',
      currentInnings: 1,
      currentBall: 0,
      commentary: [],
      innings: [
        {
          battingTeam: tossDecision === 'bat' ? tossWinner : (tossWinner === team1Name ? team2Name : team1Name),
          bowlingTeam: tossDecision === 'bowl' ? tossWinner : (tossWinner === team1Name ? team2Name : team1Name),
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
      ]
    }

    setActiveMatch(newMatch)
    localStorage.setItem('activeMatch', JSON.stringify(newMatch))
    setShowCreateMatch(false)
    toast.success('Match created successfully!')
    
    // Reset form
    setTeam1Name('')
    setTeam2Name('')
    setVenue('')
    setTossWinner('')
  }

  const addRuns = (runsScored: number, isExtra: boolean = false, extraType?: string) => {
    if (!activeMatch) return

    const newRuns = runs + runsScored
    setRuns(newRuns)

    let newBalls = currentBall
    if (!isExtra) {
      newBalls = currentBall + 1
      setCurrentBall(newBalls)
    }

    // Handle extras
    if (isExtra && extraType) {
      const newExtras = { ...extras }
      if (extraType === 'wide') newExtras.wides += runsScored
      if (extraType === 'noball') newExtras.noBalls += runsScored
      if (extraType === 'bye') newExtras.byes += runsScored
      if (extraType === 'legbye') newExtras.legByes += runsScored
      setExtras(newExtras)
    }

    // Check for over completion
    if (newBalls >= 6) {
      setCurrentOver(currentOver + 1)
      setCurrentBall(0)
      // Switch striker
      setStriker(striker === 1 ? 2 : 1)
      toast('Over completed!', { icon: '🏏' })
    }

    // Add commentary
    const newCommentary = generateCommentary(runsScored, isExtra, extraType)
    setCommentary(prev => [newCommentary, ...prev.slice(0, 9)]) // Keep last 10 entries

    // Update match data
    updateMatchData(newRuns, wickets, newBalls, currentOver)
  }

  const addWicket = (dismissalType: DismissalType) => {
    if (!activeMatch) return

    const newWickets = wickets + 1
    setWickets(newWickets)
    
    // Add ball (wicket counts as a ball unless it's a run-out off a no-ball)
    const newBalls = currentBall + 1
    setCurrentBall(newBalls)

    // Add commentary
    const newCommentary = `WICKET! ${dismissalType.toUpperCase()}! ${activeMatch.innings[0].battingTeam} ${runs}/${newWickets}`
    setCommentary(prev => [newCommentary, ...prev.slice(0, 9)])

    // Check for over completion
    if (newBalls >= 6) {
      setCurrentOver(currentOver + 1)
      setCurrentBall(0)
      setStriker(striker === 1 ? 2 : 1)
    }

    updateMatchData(runs, newWickets, newBalls, currentOver)
    toast.success(`Wicket! ${dismissalType}`)
  }

  const generateCommentary = (runsScored: number, isExtra: boolean, extraType?: string): string => {
    const currentScore = `${runs + runsScored}/${wickets}`
    const overProgress = `${currentOver}.${currentBall + (isExtra ? 0 : 1)}`

    if (isExtra) {
      if (extraType === 'wide') return `Wide ball! ${runsScored} extra runs. ${currentScore} (${overProgress})`
      if (extraType === 'noball') return `No ball! ${runsScored} runs. ${currentScore} (${overProgress})`
      if (extraType === 'bye') return `Bye! ${runsScored} runs. ${currentScore} (${overProgress})`
      if (extraType === 'legbye') return `Leg bye! ${runsScored} runs. ${currentScore} (${overProgress})`
    }

    const commentaries = [
      `${runsScored} runs! ${currentScore} (${overProgress})`,
      ...(runsScored === 4 ? [`FOUR! Beautiful shot! ${currentScore} (${overProgress})`] : []),
      ...(runsScored === 6 ? [`SIX! What a shot! ${currentScore} (${overProgress})`] : []),
      ...(runsScored === 0 ? [`Dot ball. ${currentScore} (${overProgress})`] : [])
    ]

    return commentaries[Math.floor(Math.random() * commentaries.length)]
  }

  const updateMatchData = (runs: number, wickets: number, balls: number, overs: number) => {
    if (!activeMatch) return

    const updatedMatch = {
      ...activeMatch,
      innings: activeMatch.innings.map((innings: Innings, index: number) => 
        index === 0 ? {
          ...innings,
          runs,
          wickets,
          balls,
          overs,
          extras
        } : innings
      )
    }

    setActiveMatch(updatedMatch)
    localStorage.setItem('activeMatch', JSON.stringify(updatedMatch))
  }

  const calculateRunRate = () => {
    if (currentOver === 0 && currentBall === 0) return 0
    const totalBalls = (currentOver * 6) + currentBall
    return totalBalls > 0 ? ((runs / totalBalls) * 6).toFixed(2) : '0.00'
  }

  const calculateRequiredRunRate = () => {
    if (!activeMatch || activeMatch.currentInnings === 1) return null
    
    const target = activeMatch.innings[0].runs + 1
    const maxOvers = getMaxOvers(activeMatch.format)
    const remainingBalls = (maxOvers * 6) - ((currentOver * 6) + currentBall)
    
    if (remainingBalls <= 0) return null
    return ((target - runs) / remainingBalls * 6).toFixed(2)
  }

  const endMatch = () => {
    if (!activeMatch) return

    const finalMatch = {
      ...activeMatch,
      status: 'completed' as const,
      result: {
        winner: runs > (activeMatch.innings[0]?.runs || 0) ? activeMatch.team2.name : activeMatch.team1.name,
        margin: `${Math.abs(runs - (activeMatch.innings[0]?.runs || 0))} runs`,
        type: 'runs' as const
      }
    }

    // Save completed match
    const completedMatches = JSON.parse(localStorage.getItem('completedMatches') || '[]')
    completedMatches.push(finalMatch)
    localStorage.setItem('completedMatches', JSON.stringify(completedMatches))

    // Update user stats
    if (user) {
      const updatedStats = {
        ...user.stats,
        matchesPlayed: user.stats.matchesPlayed + 1,
        totalRuns: user.stats.totalRuns + runs
      }
      
      const users = JSON.parse(localStorage.getItem('cricketUsers') || '[]')
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? { ...u, stats: updatedStats } : u
      )
      localStorage.setItem('cricketUsers', JSON.stringify(updatedUsers))
    }

    // Clear active match
    localStorage.removeItem('activeMatch')
    setActiveMatch(null)
    toast.success('Match completed!')
  }

  if (!activeMatch) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Cricket Scoring</h1>
          <p className="text-gray-600">Create and manage live cricket matches with real-time scoring</p>
        </motion.div>

        {/* Create Match Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-cricket-primary to-cricket-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Start New Match</h2>
          <p className="text-gray-600 mb-6">Create a new cricket match and start live scoring</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateMatch(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            <Plus className="inline w-5 h-5 mr-2" />
            Create Match
          </motion.button>
        </motion.div>

        {/* Recent Matches */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Matches</h3>
          <div className="text-center text-gray-500 py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent matches found</p>
            <p className="text-sm">Start scoring your first match!</p>
          </div>
        </div>

        {/* Create Match Modal */}
        <AnimatePresence>
          {showCreateMatch && (
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
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Match</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team 1 Name</label>
                    <input
                      type="text"
                      value={team1Name}
                      onChange={(e) => setTeam1Name(e.target.value)}
                      placeholder="Enter team 1 name"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team 2 Name</label>
                    <input
                      type="text"
                      value={team2Name}
                      onChange={(e) => setTeam2Name(e.target.value)}
                      placeholder="Enter team 2 name"
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
                      <option value="T20">T20 (20 overs)</option>
                      <option value="ODI">ODI (50 overs)</option>
                      <option value="Test">Test Match</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {matchFormat === 'Custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overs per innings</label>
                      <input
                        type="number"
                        value={customOvers}
                        onChange={(e) => setCustomOvers(parseInt(e.target.value))}
                        min="1"
                        max="50"
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
                      placeholder="Enter match venue"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Toss Winner</label>
                    <select
                      value={tossWinner}
                      onChange={(e) => setTossWinner(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select toss winner</option>
                      <option value={team1Name}>{team1Name || 'Team 1'}</option>
                      <option value={team2Name}>{team2Name || 'Team 2'}</option>
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

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setShowCreateMatch(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMatch}
                    disabled={!team1Name || !team2Name || !venue || !tossWinner}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    Start Match
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Active Match UI
  return (
    <div className="space-y-6">
      {/* Match Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeMatch.team1.name} vs {activeMatch.team2.name}
            </h1>
            <p className="text-gray-600">{activeMatch.venue} • {activeMatch.format}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Activity className="inline w-4 h-4 mr-1" />
              LIVE
            </span>
          </div>
        </div>

        {/* Current Score */}
        <div className="bg-gradient-to-r from-cricket-primary to-cricket-secondary rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold">{runs}/{wickets}</h2>
              <p className="text-blue-100">
                {activeMatch.innings[0].battingTeam} • {currentOver}.{currentBall} overs
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Run Rate</p>
              <p className="text-2xl font-bold">{calculateRunRate()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scoring Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Runs</h3>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3, 4, 6].map((run) => (
              <motion.button
                key={run}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addRuns(run)}
                className={`p-4 rounded-lg font-bold text-xl transition-all ${
                  run === 4 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : run === 6 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {run}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Extras */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Extras</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addRuns(1, true, 'wide')}
              className="p-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors"
            >
              Wide
            </button>
            <button
              onClick={() => addRuns(1, true, 'noball')}
              className="p-3 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors"
            >
              No Ball
            </button>
            <button
              onClick={() => addRuns(1, true, 'bye')}
              className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors"
            >
              Bye
            </button>
            <button
              onClick={() => addRuns(1, true, 'legbye')}
              className="p-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors"
            >
              Leg Bye
            </button>
          </div>
        </motion.div>
      </div>

      {/* Wickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Wickets</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {['bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket'].map((dismissal) => (
            <motion.button
              key={dismissal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addWicket(dismissal as DismissalType)}
              className="p-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors capitalize"
            >
              {dismissal}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Commentary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Commentary</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {commentary.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Commentary will appear here...</p>
          ) : (
            commentary.map((comment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-gray-50 rounded-lg text-sm"
              >
                {comment}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Match Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentBall(Math.max(0, currentBall - 1))
              toast('Undo last ball', { icon: '↶' })
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="inline w-4 h-4 mr-2" />
            Undo
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={endMatch}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <CheckCircle className="inline w-4 h-4 mr-2" />
            End Match
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cricket-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="inline w-4 h-4 mr-2" />
            Export Scorecard
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
