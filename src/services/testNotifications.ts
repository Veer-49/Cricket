import { NotificationService } from './fcmService'

export class TestNotifications {
  /**
   * Test basic notification functionality
   */
  static async testBasicNotification(userId: string): Promise<void> {
    console.log('🧪 Testing notifications for user:', userId)
    
    try {
      // 1. Test notification initialization
      console.log('1️⃣ Testing notification initialization...')
      await NotificationService.initializeForUser(userId)
      
      // 2. Test browser notification permission
      console.log('2️⃣ Checking notification permission...')
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        console.log('Permission status:', permission)
        
        if (permission === 'granted') {
          // 3. Test simple browser notification
          console.log('3️⃣ Showing test browser notification...')
          new Notification('🏏 Test Cricket Notification', {
            body: 'This is a test notification from your cricket app!',
            icon: '/logo.png',
            tag: 'test-notification'
          })
        }
      }
      
      // 4. Test local notification storage
      console.log('4️⃣ Testing local notification storage...')
      const notification = NotificationService.createMatchNotification(
        'test-match-123',
        'Test Team A',
        'Test Team B', 
        'Test Stadium'
      )
      NotificationService.showNotification(notification)
      
      console.log('✅ Test completed! Check browser notifications and console.')
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
  
  /**
   * Check notification setup status
   */
  static checkSetupStatus(): void {
    console.log('🔍 Checking notification setup status...')
    
    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Service Workers:', registrations.length > 0 ? '✅ Registered' : '❌ Not registered')
        registrations.forEach(reg => {
          console.log('- SW Scope:', reg.scope)
        })
      })
    } else {
      console.log('Service Workers: ❌ Not supported')
    }
    
    // Check notification permission
    if ('Notification' in window) {
      console.log('Notification Permission:', Notification.permission)
    } else {
      console.log('Notifications: ❌ Not supported')
    }
    
    // Check Firebase messaging
    import('../config/firebase').then(({ messaging }) => {
      console.log('Firebase Messaging:', messaging ? '✅ Available' : '❌ Not available')
    })
    
    // Check stored tokens
    const tokens = localStorage.getItem('deviceTokens')
    console.log('Stored Device Tokens:', tokens ? '✅ Found' : '❌ None')
    
    // Check stored notifications
    const notifications = localStorage.getItem('userNotifications')
    console.log('Stored Notifications:', notifications ? '✅ Found' : '❌ None')
  }
  
  /**
   * Clear all notification data (for testing)
   */
  static clearNotificationData(): void {
    localStorage.removeItem('userNotifications')
    localStorage.removeItem('deviceTokens')
    console.log('🧹 Cleared all notification data')
  }
}
