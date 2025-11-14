import { FCMService } from './fcmService'

interface Notification {
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
  private static getStoredNotifications(): Notification[] {
    try {
      return JSON.parse(localStorage.getItem('userNotifications') || '[]')
    } catch {
      return []
    }
  }

  private static saveNotifications(notifications: Notification[]): void {
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
      const notification: Notification = {
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
    }
  }

  static async createTeamJoinNotification(
    teamId: string,
    teamName: string,
    newMemberName: string,
    captainId: string
  ): Promise<void> {
    const notifications = this.getStoredNotifications()
    
    const notification: Notification = {
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
  }

  static getUserNotifications(userId: string): Notification[] {
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
