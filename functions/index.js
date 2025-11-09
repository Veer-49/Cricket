const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
admin.initializeApp()

const db = admin.database()

// Process notification queue
exports.processNotificationQueue = functions.database
  .ref('/notificationQueue/{pushId}')
  .onCreate(async (snapshot, context) => {
    try {
      const notificationData = snapshot.val()
      const { tokens, notification } = notificationData
      
      console.log('Processing notification:', notification.title)
      
      if (!tokens || tokens.length === 0) {
        console.log('No tokens provided')
        return null
      }
      
      // Prepare FCM message
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/logo.png'
        },
        data: notification.data || {},
        tokens: tokens
      }
      
      // Send multicast message
      const response = await admin.messaging().sendMulticast(message)
      
      console.log('Successfully sent message')
      console.log('Success count:', response.successCount)
      console.log('Failure count:', response.failureCount)
      
      // Update notification status
      await snapshot.ref.update({
        status: 'sent',
        response: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          sentAt: admin.database.ServerValue.TIMESTAMP
        }
      })
      
      return response
      
    } catch (error) {
      console.error('Error sending notification:', error)
      
      // Update notification status with error
      await snapshot.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.database.ServerValue.TIMESTAMP
      })
      
      throw error
    }
  })
