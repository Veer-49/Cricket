export interface User {
  id: string
  name: string
  email: string
  phone: string
  profilePicture?: string
  stats: PlayerStats
  createdAt: Date
}

export interface PlayerStats {
  totalRuns: number
  totalBalls: number
  fours: number
  sixes: number
  wickets: number
  overallStrikeRate: number
  centuries: number
  halfCenturies: number
  hatTricks: number
  matchesPlayed: number
  totalOvers: number
  runsGiven: number
  economyRate: number
}

export interface Ground {
  id: string
  name: string
  location: string
  description: string
  images: string[]
  pricePerHour: number
  facilities: string[]
  availability: TimeSlot[]
  rating: number
}

export interface Coach {
  id: string
  name: string
  specialization: string[]
  experience: number
  description: string
  image: string
  pricePerHour: number
  rating: number
  availability: TimeSlot[]
}

export interface Umpire {
  id: string
  name: string
  experience: number
  description: string
  image: string
  pricePerMatch: number
  rating: number
  availability: TimeSlot[]
  certifications: string[]
}

export interface PracticeNet {
  id: string
  name: string
  location: string
  description: string
  images: string[]
  pricePerHour: number
  pitchType: string
  facilities: string[]
  availability: TimeSlot[]
}

export interface TimeSlot {
  date: string
  startTime: string
  endTime: string
  available: boolean
}

export interface Team {
  id: string
  name: string
  captainId: string
  players: TeamPlayer[]
  matchFormat: MatchFormat
  createdAt: Date
  isPublic: boolean
  wins: number
  losses: number
  draws: number
}

export interface TeamPlayer {
  userId: string
  name: string
  role: PlayerRole
  battingOrder?: number
  bowlingType?: BowlingType
}

// New interfaces for enhanced team creation with WhatsApp invites
export interface Player {
  id: string
  name: string
  phone: string
  userId?: string // nullable - links to User if registered
  createdAt: Date
  inviteStatus: 'pending' | 'registered' | 'declined'
}

export interface TeamPlayerMap {
  teamId: string
  playerId: string
  role: PlayerRole
  battingOrder?: number
  bowlingType?: BowlingType
  joinedAt: Date
}

export interface WhatsAppInvite {
  id: string
  teamId: string
  playerId: string
  playerName: string
  playerPhone: string
  message: string
  sentAt: Date
  status: 'sent' | 'delivered' | 'failed' | 'responded'
  signupLink: string
}

export interface Match {
  id: string
  team1: Team
  team2: Team
  format: MatchFormat
  venue: string
  date: Date
  tossWinner: string
  tossDecision: 'bat' | 'bowl'
  status: MatchStatus
  currentInnings: number
  innings: Innings[]
  result?: MatchResult
  totalOvers?: number
  currentBall: number
  commentary: Commentary[]
}

export interface Innings {
  battingTeam: string
  bowlingTeam: string
  runs: number
  wickets: number
  overs: number
  balls: number
  extras: Extras
  batsmen: BatsmanStats[]
  bowlers: BowlerStats[]
  currentBatsmen: string[]
  currentBowler: string
}

export interface BatsmanStats {
  playerId: string
  name: string
  runs: number
  balls: number
  fours: number
  sixes: number
  strikeRate: number
  isOut: boolean
  dismissalType?: DismissalType
  dismissedBy?: string
}

export interface BowlerStats {
  playerId: string
  name: string
  overs: number
  runs: number
  wickets: number
  maidens: number
  economyRate: number
}

export interface Extras {
  wides: number
  noBalls: number
  byes: number
  legByes: number
  penalties: number
}

export interface MatchResult {
  winner: string
  margin: string
  type: 'runs' | 'wickets' | 'tie' | 'draw'
}

export interface Commentary {
  ball: number
  over: number
  bowler: string
  batsman: string
  runs: number
  wicket?: boolean
  dismissalType?: DismissalType
  extras?: ExtraType
  description: string
}

export interface Ball {
  ballNumber: number
  over: number
  bowler: string
  batsman: string
  runs: number
  isWicket: boolean
  dismissalType?: DismissalType
  dismissedPlayer?: string
  extraType?: ExtraType
  extraRuns: number
  isLegal: boolean
}

export interface OverSummary {
  overNumber: number
  bowler: string
  runs: number
  wickets: number
  balls: Ball[]
}

export interface Booking {
  id: string
  userId: string
  type: 'ground' | 'coach' | 'umpire' | 'net'
  resourceId: string
  date: string
  startTime: string
  endTime: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
}

export type MatchFormat = 'T20' | 'ODI' | 'Test' | 'Custom'
export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
export type BowlingType = 'Fast' | 'Medium' | 'Spin' | 'Off-spin' | 'Leg-spin'
export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'abandoned'
export type DismissalType = 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wicket' | 'retired'
export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty'
