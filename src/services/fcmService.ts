import { messaging } from '@/config/firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { database } from '@/config/firebase'
import { ref, set } from 'firebase/database'

export interface WebNotification {
  title: string
  body: string
  icon?: string
  data?: Record<string, any>
}

export class NotificationService {
  private static readonly VAPID_KEY = 'BKqcBg4a7X_nIe1ymdanx0KtgKMLOFBEERSHdHSmcXjKyBcNMxD-9BWROYSvuN422A-wkhEG_pLq_7Q76JB1atI'

  /**
   * Initialize web push notifications
   */
  static async initializeWebPush(): Promise<string | null> {
    try {
      if (!messaging) {
        console.warn('Web push not supported in this browser')
        return null
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Notification permission denied')
        return null
      }

      // Get registration token
      const token = await getToken(messaging, {
        vapidKey: this.VAPID_KEY
      })

      if (token) {
        console.log('✅ Web push token obtained:', token)
        return token
      } else {
        console.warn('No web push token available')
        return null
      }
    } catch (error) {
      console.error('Error getting web push token:', error)
      return null
    }
  }

  /**
   * Save web push token to Firebase
   */
  static async saveToken(userId: string, token: string): Promise<void> {
    if (!userId || !token) return

    try {
      const tokensRef = ref(database, `webPushTokens/${userId}`)
      await set(tokensRef, {
        token,
        userAgent: navigator.userAgent,
        lastUpdated: new Date().toISOString()
      })
      console.log('✅ Web push token saved')
    } catch (error) {
      console.error('Error saving web push token:', error)
      throw error
    }
  }

  /**
   * Setup foreground message handler
   */
  static setupMessageHandler() {
    if (!messaging) return

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload)
      
      const { notification, data } = payload
      if (notification) {
        this.showNotification({
          title: notification.title || 'New Notification',
          body: notification.body || '',
          icon: notification.icon,
          data: data as Record<string, any>
        })
      }
    })
  }

  /**
   * Show browser notification
   */
  static showNotification(notification: WebNotification) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return
    }

    if (Notification.permission === 'granted') {
      const { title, body, icon, data } = notification
      const options: NotificationOptions = {
        body,
        icon: icon || '/logo192.png',
        data
      }
      
      const notificationInstance = new Notification(title, options)
      
      notificationInstance.onclick = (event) => {
        console.log('Notification clicked', event)
        if (data?.url) {
          window.open(data.url, '_blank')
        }
        notificationInstance.close()
      }
    }
  }

  /**
   * Initialize web push for the current user
   */
  static async initializeForUser(userId: string): Promise<void> {
    try {
      const token = await this.initializeWebPush()
      if (token) {
        await this.saveToken(userId, token)
        this.setupMessageHandler()
      }
    } catch (error) {
      console.error('Error initializing web push:', error)
    }
  }

  // Notification types for the app
  static readonly NOTIFICATION_TYPES = {
    MATCH_START: 'match_start',
    TEAM_JOIN: 'team_join'
  } as const

  /**
   * Create a match start notification
   */
  static createMatchNotification(
    matchId: string,
    team1Name: string,
    team2Name: string,
    venue: string
  ): WebNotification {
    return {
      title: '🏏 Match Started!',
      body: `${team1Name} vs ${team2Name} at ${venue}`,
      data: {
        type: this.NOTIFICATION_TYPES.MATCH_START,
        matchId,
        team1Name,
        team2Name,
        venue,
        timestamp: Date.now()
      }
    }
  }

  /**
   * Create a team join notification
   */
  static createTeamJoinNotification(
    teamName: string,
    newMemberName: string
  ): WebNotification {
    return {
      title: '👋 New Team Member',
      body: `${newMemberName} has joined ${teamName}`,
      data: {
        type: this.NOTIFICATION_TYPES.TEAM_JOIN,
        teamName,
        newMemberName,
        timestamp: Date.now()
      }
    }
  }
}
