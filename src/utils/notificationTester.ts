import { NotificationService } from '@/services/fcmService'
import toast from 'react-hot-toast'

export class NotificationTester {
  /**
   * Test web notification permissions and token generation
   */
  static async testWebNotifications(): Promise<boolean> {
    try {
      console.log('🧪 Testing Web Notifications...')
      
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.error('❌ This browser does not support notifications')
        toast.error('Browser does not support notifications')
        return false
      }

      // Check current permission
      console.log('📋 Current permission:', Notification.permission)
      
      // Request permission if not already granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('Notification permission not granted')
          toast.error('Please allow notifications to test them')
          return false
        }
      }
      
      // Test web push initialization
      const token = await NotificationService.initializeWebPush()
      
      if (token) {
        console.log('✅ Web push notifications working! Token:', token.substring(0, 20) + '...')
        toast.success('Web push notifications are working!')
        
        // Test a sample notification
        await this.showTestNotification()
        return true
      } else {
        console.error('❌ Failed to get web push token')
        toast.error('Failed to initialize web push notifications')
        return false
      }
    } catch (error) {
      console.error('❌ Web notification test failed:', error)
      toast.error('Web notification test failed')
      return false
    }
  }

  /**
   * Show a test notification
   */
  static async showTestNotification(): Promise<void> {
    try {
      if (Notification.permission === 'granted') {
        NotificationService.showNotification({
          title: '🏏 Cricket App Test',
          body: 'Web notifications are working perfectly!',
          icon: '/logo.png'
        })
      }
    } catch (error) {
      console.error('Error showing test notification:', error)
      toast.error('Failed to show test notification')
    }
  }

  /**
   * Test match notification
   */
  static async testMatchNotification(): Promise<void> {
    try {
      const notification = NotificationService.createMatchNotification(
        'test-match-123',
        'Team A',
        'Team B',
        'Cricket Ground'
      )
      
      NotificationService.showNotification(notification)
      toast.success('Test match notification shown!')
    } catch (error) {
      console.error('Failed to show match notification:', error)
      toast.error('Failed to show match notification')
    }
  }

  /**
   * Test team join notification
   */
  static async testTeamJoinNotification(): Promise<void> {
    try {
      const notification = NotificationService.createTeamJoinNotification(
        'Team A',
        'John Doe'
      )
      
      NotificationService.showNotification(notification)
      toast.success('Test team join notification shown!')
    } catch (error) {
      console.error('Failed to show team join notification:', error)
      toast.error('Failed to show team join notification')
    }
  }

  /**
   * Run all web notification tests
   */
  static async runAllTests(): Promise<{ web: boolean }> {
    console.log('🚀 Starting web notification tests...')
    
    const web = await this.testWebNotifications()
    
    // Summary
    console.log('📊 Test Results Summary:')
    console.log(`Web Notifications: ${web ? '✅' : '❌'}`)

    return { web }
  }
}
