import { NotificationService as FCMService } from './fcmService'
import { functions } from '@/config/firebase'
import { httpsCallable } from 'firebase/functions'

interface LocalNotification {
  id: string
  type: 'match_start' | 'team_join' | 'match_invite'
  title: string
  message: string
  teamId?: string
  matchId?: string
  userId?: string
  createdAt: Date
  read: boolean
}

export class NotificationService {
  private static getStoredNotifications(): LocalNotification[] {
    try {
      return JSON.parse(localStorage.getItem('userNotifications') || '[]')
    } catch {
      return []
    }
  }

  private static saveNotifications(notifications: LocalNotification[]): void {
    localStorage.setItem('userNotifications', JSON.stringify(notifications))
  }

  static async createMatchStartNotification(
    matchId: string,
    team1Name: string,
    team2Name: string,
    venue: string,
    teamMembers: Array<{ userId: string; teamId: string }>
  ): Promise<void> {
    const notifications = this.getStoredNotifications()
    
    // Create local notifications
    teamMembers.forEach(member => {
      const notification: LocalNotification = {
        id: `match_${matchId}_${member.userId}_${Date.now()}`,
        type: 'match_start',
        title: '🏏 Match Started!',
        message: `${team1Name} vs ${team2Name} at ${venue}`,
        teamId: member.teamId,
        matchId: matchId,
        userId: member.userId,
        createdAt: new Date(),
        read: false
      }
      
      notifications.push(notification)
    })
    
    this.saveNotifications(notifications)
    
<<<<<<< HEAD
    // Send FCM push notifications
    try {
      const userIds = teamMembers.map(member => member.userId)
      await FCMService.sendMatchStartNotification(
        userIds,
        team1Name,
        team2Name,
        venue,
        matchId
      )
    } catch (error) {
      console.error('Error sending FCM notification:', error)
=======
    // Send notifications to all team members via Firebase function
    try {
      const sendNotification = httpsCallable(functions, 'sendNotification')
      const userIds = teamMembers.map(member => member.userId)
      
      await sendNotification({
        userIds: userIds,
        notification: {
          title: '🏏 Match Started!',
          body: `${team1Name} vs ${team2Name} at ${venue}`,
          data: {
            type: 'match_start',
            matchId: matchId,
            team1Name: team1Name,
            team2Name: team2Name,
            venue: venue,
            timestamp: Date.now()
          }
        }
      })
      
      console.log(`✅ Match start notifications sent to ${userIds.length} team members`)
    } catch (error) {
      console.error('❌ Failed to send Firebase notifications:', error)
      
      // Fallback: Show local notification to current user only
      const matchNotification = FCMService.createMatchNotification(
        matchId,
        team1Name,
        team2Name,
        venue
      )
      FCMService.showNotification(matchNotification)
>>>>>>> fix/ui-updates
    }
  }

  static async createTeamJoinNotification(
    teamId: string,
    teamName: string,
    newMemberName: string,
    captainId: string
  ): Promise<void> {
    const notifications = this.getStoredNotifications()
    
    const notification: LocalNotification = {
      id: `team_join_${teamId}_${Date.now()}`,
      type: 'team_join',
      title: '👥 New Team Member',
      message: `${newMemberName} joined ${teamName}`,
      teamId: teamId,
      userId: captainId,
      createdAt: new Date(),
      read: false
    }
    
    notifications.push(notification)
    this.saveNotifications(notifications)
    
<<<<<<< HEAD
    // Send FCM push notification
    try {
      await FCMService.sendTeamJoinNotification(
        captainId,
        teamName,
        newMemberName,
        teamId
      )
    } catch (error) {
      console.error('Error sending FCM notification:', error)
    }
=======
    // Send notification to the captain via Firebase function
    try {
      const sendNotification = httpsCallable(functions, 'sendNotification')
      
      await sendNotification({
        userIds: [captainId],
        notification: {
          title: '👥 New Team Member',
          body: `${newMemberName} joined ${teamName}`,
          data: {
            type: 'team_join',
            teamName: teamName,
            newMemberName: newMemberName,
            timestamp: Date.now()
          }
        }
      })
      
      console.log(`✅ Team join notification sent to captain: ${captainId}`)
    } catch (error) {
      console.error('❌ Failed to send Firebase notification:', error)
      
      // Fallback: Show local notification
      const teamJoinNotification = FCMService.createTeamJoinNotification(
        teamName,
        newMemberName
      )
      FCMService.showNotification(teamJoinNotification)
    }
    
    // Ensure push is initialized for the captain
    FCMService.initializeForUser(captainId).catch(console.error)
>>>>>>> fix/ui-updates
  }

  static getUserNotifications(userId: string): LocalNotification[] {
    const notifications = this.getStoredNotifications()
    return notifications.filter(notif => 
      notif.userId === userId || 
      (notif.teamId && this.isUserInTeam(userId, notif.teamId))
    )
  }

  private static isUserInTeam(userId: string, teamId: string): boolean {
    try {
      // Check Firebase teams first
      const firebaseTeams = JSON.parse(localStorage.getItem('firebaseTeams') || '[]')
      const team = firebaseTeams.find((t: any) => t.id === teamId)
      
      if (team) {
        return team.captainId === userId || 
               team.players.some((p: any) => p.userId === userId)
      }
      
      // Fallback to localStorage teams
      const localTeams = JSON.parse(localStorage.getItem('cricketTeams') || '[]')
      const localTeam = localTeams.find((t: any) => t.id === teamId)
      
      if (localTeam) {
        return localTeam.captainId === userId || 
               localTeam.players.some((p: any) => p.userId === userId)
      }
      
      return false
    } catch {
      return false
    }
  }

  static markAsRead(notificationId: string): void {
    const notifications = this.getStoredNotifications()
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    )
    this.saveNotifications(updatedNotifications)
  }

  static markAllAsRead(userId: string): void {
    const notifications = this.getStoredNotifications()
    const updatedNotifications = notifications.map(notif =>
      (notif.userId === userId || this.isUserInTeam(userId, notif.teamId || ''))
        ? { ...notif, read: true }
        : notif
    )
    this.saveNotifications(updatedNotifications)
  }
}
