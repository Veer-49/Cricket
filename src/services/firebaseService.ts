import { database } from '../config/firebase'
import { ref, push, set, get, onValue, off, query, orderByChild, equalTo, update, remove } from 'firebase/database'
import { Team, User, TeamPlayer } from '../types'
import QRCode from 'qrcode'

export class FirebaseService {
  // Generate unique IDs
  static generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static generateTeamId(): string {
    return Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString()
  }

  // Check if short code exists
  static async isShortCodeUnique(shortCode: string): Promise<boolean> {
    try {
      const teamsRef = ref(database, 'teams')
      const shortCodeQuery = query(teamsRef, orderByChild('shortCode'), equalTo(shortCode))
      const snapshot = await get(shortCodeQuery)
      return !snapshot.exists()
    } catch (error) {
      console.error('Error checking short code uniqueness:', error)
      return false
    }
  }

  // Generate unique short code
  static async generateUniqueShortCode(): Promise<string> {
    let shortCode: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortCode = this.generateShortCode()
      attempts++
    } while (!(await this.isShortCodeUnique(shortCode)) && attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      // Fallback with timestamp
      shortCode = this.generateShortCode() + Date.now().toString().slice(-2)
    }

    return shortCode
  }

  // Create team in Firebase
  static async createTeam(teamData: Omit<Team, 'id' | 'shortCode' | 'joinUrl'>): Promise<Team> {
    try {
      const teamId = this.generateTeamId()
      const shortCode = await this.generateUniqueShortCode()
      const joinUrl = `${window.location.origin}/join/${shortCode}`

      const team: Team & { shortCode: string; joinUrl: string } = {
        ...teamData,
        id: teamId,
        shortCode,
        joinUrl
      }

      const teamRef = ref(database, `teams/${teamId}`)
      await set(teamRef, team)

      // Also store by short code for quick lookup
      const shortCodeRef = ref(database, `teamsByShortCode/${shortCode}`)
      await set(shortCodeRef, teamId)

      return team
    } catch (error) {
      console.error('Error creating team:', error)
      throw new Error('Failed to create team')
    }
  }

  // Get team by ID
  static async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const teamRef = ref(database, `teams/${teamId}`)
      const snapshot = await get(teamRef)
      return snapshot.exists() ? snapshot.val() : null
    } catch (error) {
      console.error('Error getting team:', error)
      return null
    }
  }

  // Get team by short code
  static async getTeamByShortCode(shortCode: string): Promise<Team | null> {
    try {
      // First get team ID from short code mapping
      const shortCodeRef = ref(database, `teamsByShortCode/${shortCode}`)
      const shortCodeSnapshot = await get(shortCodeRef)
      
      if (!shortCodeSnapshot.exists()) {
        return null
      }

      const teamId = shortCodeSnapshot.val()
      return await this.getTeamById(teamId)
    } catch (error) {
      console.error('Error getting team by short code:', error)
      return null
    }
  }

  // Get all teams
  static async getAllTeams(): Promise<Team[]> {
    try {
      const teamsRef = ref(database, 'teams')
      const snapshot = await get(teamsRef)
      
      if (!snapshot.exists()) {
        return []
      }

      const teamsData = snapshot.val()
      return Object.values(teamsData) as Team[]
    } catch (error) {
      console.error('Error getting all teams:', error)
      return []
    }
  }

  // Listen to teams changes (real-time)
  static onTeamsChange(callback: (teams: Team[]) => void): () => void {
    const teamsRef = ref(database, 'teams')
    
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const teamsData = snapshot.val()
        const teams = Object.values(teamsData) as Team[]
        callback(teams)
      } else {
        callback([])
      }
    })

    return () => off(teamsRef, 'value', unsubscribe)
  }

  // Join team
  static async joinTeam(teamId: string, user: User): Promise<boolean> {
    try {
      const team = await this.getTeamById(teamId)
      if (!team) {
        throw new Error('Team not found')
      }

      // Check if user is already in team
      if (team.players.some(p => p.userId === user.id)) {
        throw new Error('User already in team')
      }

      const newPlayer: TeamPlayer = {
        userId: user.id,
        name: user.name,
        role: 'All-rounder',
        battingOrder: team.players.length + 1
      }

      const updatedPlayers = [...team.players, newPlayer]
      const teamRef = ref(database, `teams/${teamId}/players`)
      await set(teamRef, updatedPlayers)

      return true
    } catch (error) {
      console.error('Error joining team:', error)
      throw error
    }
  }

  // Update team
  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<boolean> {
    try {
      const teamRef = ref(database, `teams/${teamId}`)
      await update(teamRef, updates)
      return true
    } catch (error) {
      console.error('Error updating team:', error)
      return false
    }
  }

  // Delete team
  static async deleteTeam(teamId: string, shortCode?: string): Promise<boolean> {
    try {
      // Delete team
      const teamRef = ref(database, `teams/${teamId}`)
      await remove(teamRef)

      // Delete short code mapping if provided
      if (shortCode) {
        const shortCodeRef = ref(database, `teamsByShortCode/${shortCode}`)
        await remove(shortCodeRef)
      }

      return true
    } catch (error) {
      console.error('Error deleting team:', error)
      return false
    }
  }

  // Generate QR Code
  static async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  // Migrate localStorage data to Firebase (one-time migration)
  static async migrateLocalStorageToFirebase(): Promise<void> {
    try {
      const localTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]') as Team[]
      
      if (localTeams.length === 0) {
        return
      }

      console.log(`Migrating ${localTeams.length} teams from localStorage to Firebase...`)

      for (const team of localTeams) {
        // Add missing fields for Firebase
        const shortCode = await this.generateUniqueShortCode()
        const joinUrl = `${window.location.origin}/join/${shortCode}`
        
        const firebaseTeam = {
          ...team,
          shortCode,
          joinUrl
        }

        // Save to Firebase
        const teamRef = ref(database, `teams/${team.id}`)
        await set(teamRef, firebaseTeam)

        // Save short code mapping
        const shortCodeRef = ref(database, `teamsByShortCode/${shortCode}`)
        await set(shortCodeRef, team.id)
      }

      console.log('Migration completed successfully')
      
      // Optionally clear localStorage after successful migration
      // localStorage.removeItem('cricketTeams')
    } catch (error) {
      console.error('Error migrating data:', error)
      throw new Error('Failed to migrate data to Firebase')
    }
  }
}
