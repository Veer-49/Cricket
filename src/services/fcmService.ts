import { messaging } from '@/config/firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { database } from '@/config/firebase'
import { ref, set, get, push } from 'firebase/database'

interface FCMNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
}

interface DeviceToken {
  userId: string
  token: string
  platform: 'web' | 'android' | 'ios'
  deviceInfo: string
  lastUpdated: Date
}

export class FCMService {
  private static readonly VAPID_KEY = 'BKqcBg4a7X_nIe1ymdanx0KtgKMLOFBEERSHdHSmcXjKyBcNMxD-9BWROYSvuN422A-wkhEG_pLq_7Q76JB1atI'

  /**
   * Initialize FCM for web app
   */
  static async initializeWebPush(): Promise<string | null> {
    try {
      if (!messaging) {
        console.warn('Firebase Messaging not supported in this browser')
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
        console.log('✅ FCM Registration token obtained:', token)
        return token
      } else {
        console.warn('❌ No registration token available')
        return null
      }
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  /**
   * Save device token to Firebase
   */
  static async saveDeviceToken(
    userId: string, 
    token: string, 
    platform: 'web' | 'android' | 'ios' = 'web'
  ): Promise<void> {
    try {
      const deviceToken: DeviceToken = {
        userId,
        token,
        platform,
        deviceInfo: navigator.userAgent || 'Unknown',
        lastUpdated: new Date()
      }

      const tokenRef = ref(database, `deviceTokens/${userId}/${platform}`)
      await set(tokenRef, deviceToken)
      
      console.log('Device token saved successfully')
    } catch (error) {
      console.error('Error saving device token:', error)
    }
  }

  /**
   * Get all device tokens for a user
   */
  static async getUserTokens(userId: string): Promise<DeviceToken[]> {
    try {
      const tokensRef = ref(database, `deviceTokens/${userId}`)
      const snapshot = await get(tokensRef)
      
      if (snapshot.exists()) {
        const tokens: DeviceToken[] = []
        snapshot.forEach((childSnapshot) => {
          tokens.push(childSnapshot.val())
        })
        return tokens
      }
      
      return []
    } catch (error) {
      console.error('Error getting user tokens:', error)
      return []
    }
  }

  /**
   * Send notification to specific users
   */
  static async sendNotificationToUsers(
    userIds: string[],
    notification: FCMNotification
  ): Promise<void> {
    try {
      // Get all device tokens for the users
      const allTokens: string[] = []
      
      for (const userId of userIds) {
        const userTokens = await this.getUserTokens(userId)
        allTokens.push(...userTokens.map(t => t.token))
      }

      if (allTokens.length === 0) {
        console.warn('No device tokens found for users')
        return
      }

      // Send to Firebase Functions endpoint for server-side sending
      await this.sendToFirebaseFunction(allTokens, notification)
      
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  /**
   * Send notification via Firebase Functions (server-side)
   */
  private static async sendToFirebaseFunction(
    tokens: string[],
    notification: FCMNotification
  ): Promise<void> {
    try {
      // Store notification request in Firebase for Cloud Function to process
      const notificationRef = ref(database, 'notificationQueue')
      const newNotificationRef = push(notificationRef)
      
      await set(newNotificationRef, {
        tokens,
        notification,
        timestamp: Date.now(),
        status: 'pending'
      })
      
      console.log('Notification queued for processing')
    } catch (error) {
      console.error('Error queuing notification:', error)
    }
  }

  /**
   * Listen for foreground messages
   */
  static setupForegroundMessageListener(
    onMessageReceived: (payload: any) => void
  ): void {
    if (!messaging) return

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      
      // Show custom notification or update UI
      if (payload.notification) {
        this.showCustomNotification(payload.notification)
      }
      
      onMessageReceived(payload)
    })
  }

  /**
   * Show custom notification
   */
  private static showCustomNotification(notification: any): void {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/logo.png',
          badge: notification.badge || '/logo.png',
          tag: 'cricket-notification',
          requireInteraction: true,
          data: notification.data || {}
        } as NotificationOptions)
      })
    }
  }

  /**
   * Initialize FCM for the current user
   */
  static async initializeForUser(userId: string): Promise<void> {
    try {
      // Initialize web push
      const token = await this.initializeWebPush()
      
      if (token) {
        // Save token to Firebase
        await this.saveDeviceToken(userId, token, 'web')
        
        // Setup message listener
        this.setupForegroundMessageListener((payload) => {
          // Handle received message
          console.log('Message received:', payload)
          
          // You can dispatch custom events or update global state here
          window.dispatchEvent(new CustomEvent('fcm-message', { 
            detail: payload 
          }))
        })
      }
    } catch (error) {
      console.error('Error initializing FCM for user:', error)
    }
  }

  /**
   * Send match start notification
   */
  static async sendMatchStartNotification(
    userIds: string[],
    team1Name: string,
    team2Name: string,
    venue: string,
    matchId: string
  ): Promise<void> {
    const notification: FCMNotification = {
      title: '🏏 Match Started!',
      body: `${team1Name} vs ${team2Name} at ${venue}`,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        type: 'match_start',
        matchId,
        team1Name,
        team2Name,
        venue,
        url: `/scoring?match=${matchId}`
      }
    }

    await this.sendNotificationToUsers(userIds, notification)
  }

  /**
   * Send team join notification
   */
  static async sendTeamJoinNotification(
    captainId: string,
    teamName: string,
    newMemberName: string,
    teamId: string
  ): Promise<void> {
    const notification: FCMNotification = {
      title: '👥 New Team Member',
      body: `${newMemberName} joined ${teamName}`,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        type: 'team_join',
        teamId,
        teamName,
        newMemberName,
        url: `/teams?team=${teamId}`
      }
    }

    await this.sendNotificationToUsers([captainId], notification)
  }
}
