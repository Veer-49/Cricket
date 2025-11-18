'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Match, BatsmanStats, BowlerStats, Team } from '@/types'
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  User, 
  Award,
  Download,
  Share2,
  BarChart3
} from 'lucide-react'

interface CricketScoreboardProps {
  match: Match
}

export default function CricketScoreboard({ match }: CricketScoreboardProps) {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'summary'>('batting')
  const [activeInnings, setActiveInnings] = useState(0)

  const calculateStrikeRate = (runs: number, balls: number): number => {
    return balls > 0 ? (runs / balls) * 100 : 0
  }

  const calculateEconomyRate = (runs: number, overs: number): number => {
    return overs > 0 ? runs / overs : 0
  }

  const getBattingStats = (innings: any): BatsmanStats[] => {
    const stats: BatsmanStats[] = []
    const battingTeam = match.team1.id === innings.battingTeam ? match.team1 : match.team2
    
    // Mock batting stats - in real implementation, this would be calculated from ball-by-ball data
    battingTeam.players.forEach((player, index) => {
      if (index < 6) { // Show only players who batted
        const runs = Math.floor(Math.random() * 50)
        const balls = Math.floor(Math.random() * 40) + 10
        stats.push({
          playerId: player.userId,
          name: player.name,
          runs,
          balls,
          ballsFaced: balls, // Adding required ballsFaced property
          fours: Math.floor(runs / 8),
          sixes: Math.floor(runs / 15),
          strikeRate: calculateStrikeRate(runs, balls),
          isOut: index < 4,
          dismissalType: index < 4 ? (['bowled', 'caught', 'lbw', 'run-out'] as const)[index % 4] : undefined,
          howOut: index < 4 ? (['bowled', 'caught', 'lbw', 'run-out'] as const)[index % 4] : undefined
        })
      }
    })
    
    return stats
  }

  const getBowlingStats = (innings: any): BowlerStats[] => {
    const stats: BowlerStats[] = []
    const bowlingTeam = match.team1.id === innings.bowlingTeam ? match.team1 : match.team2
    
    // Mock bowling stats - in real implementation, this would be calculated from ball-by-ball data
    bowlingTeam.players.forEach((player, index) => {
      if (index < 5) { // Show only bowlers who bowled
        const overs = Math.floor(Math.random() * 4) + 1
        const runs = Math.floor(Math.random() * 30) + 10
        const wickets = Math.floor(Math.random() * 3)
        stats.push({
          playerId: player.userId,
          name: player.name,
          overs,
          runs,
          wickets,
          maidens: Math.floor(Math.random() * 2),
          economyRate: calculateEconomyRate(runs, overs),
          legalBalls: overs * 6 // Adding required legalBalls property (assuming all balls are legal in mock data)
        })
      }
    })
    
    return stats
  }

  const getMatchResult = (): string => {
    if (match.status !== 'completed') return 'Match in progress'
    
    if (match.result) {
      if (match.result.type === 'runs') {
        return `${match.result.winner} won by ${match.result.margin} runs`
      } else if (match.result.type === 'wickets') {
        return `${match.result.winner} won by ${match.result.margin} wickets`
      } else if (match.result.type === 'tie') {
        return 'Match tied'
      }
    }
    
    return 'Result pending'
  }

  const exportScorecard = () => {
    // In a real implementation, this would generate and download a PDF/CSV
    const scoreData = {
      match: {
        teams: `${match.team1.name} vs ${match.team2.name}`,
        format: match.format,
        venue: match.venue,
        date: match.date
      },
      innings: match.innings.map((innings, index) => ({
        inningsNumber: index + 1,
        battingTeam: match.team1.id === innings.battingTeam ? match.team1.name : match.team2.name,
        score: `${innings.runs}/${innings.wickets}`,
        overs: `${Math.floor(innings.balls / 6)}.${innings.balls % 6}`,
        batting: getBattingStats(innings),
        bowling: getBowlingStats(innings)
      })),
      result: getMatchResult()
    }
    
    console.log('Exporting scorecard:', scoreData)
    alert('Scorecard exported! (Check console for data)')
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {match.team1.name} vs {match.team2.name}
            </h2>
            <p className="text-black">{match.format} • {match.venue}</p>
            <p className="text-sm text-black">
              {new Date(match.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportScorecard}
              className="btn-secondary text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-sm"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </motion.button>
          </div>
        </div>

        {/* Match Result */}
        <div className="bg-gradient-to-r from-cricket-primary to-cricket-secondary text-white rounded-lg p-4">
          <div className="flex items-center">
            <Trophy className="w-6 h-6 mr-3" />
            <p className="text-lg font-semibold">{getMatchResult()}</p>
          </div>
        </div>
      </motion.div>

      {/* Innings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-black mb-4">Innings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {match.innings.map((innings, index) => {
            const battingTeam = match.team1.id === innings.battingTeam ? match.team1 : match.team2
            const runRate = innings.balls > 0 ? (innings.runs / (innings.balls / 6)) : 0
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-black">{battingTeam.name}</h4>
                  <span className="text-sm text-black">Innings {index + 1}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-3xl font-bold text-black">
                    {innings.runs}/{innings.wickets}
                  </span>
                  <span className="text-black">
                    ({Math.floor(innings.balls / 6)}.{innings.balls % 6} overs)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-black">Run Rate:</span>
                    <span className="font-semibold">{runRate.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black">Extras:</span>
                    <span className="font-semibold">
                      {(innings.extras?.wides || 0) + 
                       (innings.extras?.noBalls || 0) + 
                       (innings.extras?.byes || 0) + 
                       (innings.extras?.legByes || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Detailed Scorecard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {['batting', 'bowling', 'summary'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-black shadow-md'
                  : 'text-black hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Innings Selector */}
        <div className="flex space-x-2 mb-6">
          {match.innings.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveInnings(index)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeInnings === index
                  ? 'bg-cricket-primary text-black'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Innings {index + 1}
            </button>
          ))}
        </div>

        {/* Batting Card */}
        {activeTab === 'batting' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-black mb-3">Batting Performance</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-black">Batsman</th>
                    <th className="text-center p-3 text-black">Runs</th>
                    <th className="text-center p-3 text-black">Balls</th>
                    <th className="text-center p-3 text-black">4s</th>
                    <th className="text-center p-3 text-black">6s</th>
                    <th className="text-center p-3 text-black">SR</th>
                    <th className="text-left p-3 text-black">Dismissal</th>
                  </tr>
                </thead>
                <tbody>
                  {getBattingStats(match.innings[activeInnings]).map((batsman, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-3 font-medium text-black">{batsman.name}</td>
                      <td className="text-center p-3 font-semibold text-black">{batsman.runs}</td>
                      <td className="text-center p-3 text-black">{batsman.balls}</td>
                      <td className="text-center p-3 text-black">{batsman.fours}</td>
                      <td className="text-center p-3 text-black">{batsman.sixes}</td>
                      <td className="text-center p-3 text-black">{batsman.strikeRate.toFixed(1)}</td>
                      <td className="p-3 text-sm text-black">
                        {batsman.isOut ? batsman.dismissalType : 'Not Out'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bowling Card */}
        {activeTab === 'bowling' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-black mb-3">Bowling Performance</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-black">Bowler</th>
                    <th className="text-center p-3 text-black">Overs</th>
                    <th className="text-center p-3 text-black">Maidens</th>
                    <th className="text-center p-3 text-black">Runs</th>
                    <th className="text-center p-3 text-black">Wickets</th>
                    <th className="text-center p-3 text-black">Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {getBowlingStats(match.innings[activeInnings]).map((bowler, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-3 font-medium text-black">{bowler.name}</td>
                      <td className="text-center p-3 text-black">{Math.floor(bowler.overs / 6)}.{bowler.overs % 6}</td>
                      <td className="text-center p-3 text-black">{bowler.maidens}</td>
                      <td className="text-center p-3 font-medium text-black">{bowler.runs}</td>
                      <td className="text-center p-3 font-semibold text-black">{bowler.wickets}</td>
                      <td className="text-center p-3 text-black">{bowler.economyRate.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Match Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-black mb-4">Match Summary</h4>
            
            {/* Toss Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-black mb-2">Toss</h5>
              <p className="text-black">
                {match.team1.id === match.tossWinner ? match.team1.name : match.team2.name} won the toss and chose to {match.tossDecision} first
              </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">
                  {Math.max(...match.innings.map(i => i.runs))}
                </p>
                <p className="text-sm text-black">Highest Score</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">
                  {Math.max(...match.innings.map(i => i.wickets))}
                </p>
                <p className="text-sm text-black">Most Wickets</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">
                  {Math.max(...match.innings.map(i => Math.floor(i.balls / 6)))}
                </p>
                <p className="text-sm text-black">Most Overs</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">
                  {Math.max(...match.innings.map(i => 
                    i.balls > 0 ? (i.runs / (i.balls / 6)) : 0
                  )).toFixed(1)}
                </p>
                <p className="text-sm text-black">Best Run Rate</p>
              </div>
            </div>

            {/* Extras Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-black mb-3">Extras Breakdown</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                {match.innings.map((innings, index) => {
                  const battingTeam = match.team1.id === innings.battingTeam ? match.team1 : match.team2
                  const extras = innings.extras || {
                    wides: 0,
                    noBalls: 0,
                    byes: 0,
                    legByes: 0,
                    penalties: 0
                  }
                  return (
                    <div key={index}>
                      <p className="font-medium text-black mb-2">{battingTeam.name}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-black">
                          <span>Wides:</span>
                          <span>{extras.wides}</span>
                        </div>
                        <div className="flex justify-between text-black">
                          <span>No-balls:</span>
                          <span>{extras.noBalls}</span>
                        </div>
                        <div className="flex justify-between text-black">
                          <span>Byes:</span>
                          <span>{extras.byes}</span>
                        </div>
                        <div className="flex justify-between text-black">
                          <span>Leg-byes:</span>
                          <span>{extras.legByes}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1 text-black">
                          <span>Total:</span>
                          <span>
                            {extras.wides + extras.noBalls + 
                             extras.byes + extras.legByes}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
