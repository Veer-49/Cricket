import { useState, useEffect } from 'react'
import { FirebaseService } from '../services/firebaseService'
import { Team, User } from '../types'
import toast from 'react-hot-toast'

export const useFirebaseTeams = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load teams on mount and set up real-time listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initializeTeams = async () => {
      try {
        setLoading(true)
        
        // Set up real-time listener first for faster loading
        unsubscribe = FirebaseService.onTeamsChange((updatedTeams) => {
          setTeams(updatedTeams)
          setLoading(false)
          setError(null)
        })
        
        // Run migration in background (non-blocking)
        FirebaseService.migrateLocalStorageToFirebase().catch(err => {
          console.warn('Migration failed (non-critical):', err)
        })
        
      } catch (err) {
        console.error('Error initializing teams:', err)
        setError('Failed to load teams')
        setLoading(false)
        
        // Fallback to localStorage if Firebase fails
        const localTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
        setTeams(localTeams)
      }
    }

    initializeTeams()

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Create team
  const createTeam = async (teamData: Omit<Team, 'id' | 'shortCode' | 'joinUrl'>): Promise<Team | null> => {
    try {
      setLoading(true)
      const newTeam = await FirebaseService.createTeam(teamData)
      toast.success(`Team "${newTeam.name}" created successfully!`)
      toast.success(`Team Code: ${newTeam.shortCode} (copied to clipboard)`)
      
      // Copy short code to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(newTeam.shortCode || '')
      }
      
      return newTeam
    } catch (err) {
      console.error('Error creating team:', err)
      toast.error('Failed to create team')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Join team by ID or short code
  const joinTeam = async (teamIdOrCode: string, user: User): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Try to find team by ID first, then by short code
      let team = await FirebaseService.getTeamById(teamIdOrCode)
      if (!team && teamIdOrCode.length === 6) {
        team = await FirebaseService.getTeamByShortCode(teamIdOrCode.toUpperCase())
      }
      
      if (!team) {
        toast.error('Team not found!')
        return false
      }

      await FirebaseService.joinTeam(team.id, user)
      toast.success(`Successfully joined "${team.name}"!`)
      return true
    } catch (err: any) {
      console.error('Error joining team:', err)
      toast.error(err.message || 'Failed to join team')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update team
  const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<boolean> => {
    try {
      setLoading(true)
      const success = await FirebaseService.updateTeam(teamId, updates)
      if (success) {
        toast.success('Team updated successfully!')
      } else {
        toast.error('Failed to update team')
      }
      return success
    } catch (err) {
      console.error('Error updating team:', err)
      toast.error('Failed to update team')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete team
  const deleteTeam = async (teamId: string, shortCode?: string): Promise<boolean> => {
    try {
      setLoading(true)
      const success = await FirebaseService.deleteTeam(teamId, shortCode)
      if (success) {
        toast.success('Team deleted successfully!')
      } else {
        toast.error('Failed to delete team')
      }
      return success
    } catch (err) {
      console.error('Error deleting team:', err)
      toast.error('Failed to delete team')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Generate QR code for team
  const generateTeamQR = async (team: Team): Promise<string | null> => {
    try {
      const joinUrl = team.joinUrl || `${window.location.origin}/join/${team.shortCode}`
      return await FirebaseService.generateQRCode(joinUrl)
    } catch (err) {
      console.error('Error generating QR code:', err)
      toast.error('Failed to generate QR code')
      return null
    }
  }

  return {
    teams,
    loading,
    error,
    createTeam,
    joinTeam,
    updateTeam,
    deleteTeam,
    generateTeamQR
  }
}
