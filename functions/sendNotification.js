// Firebase Cloud Function for sending FCM notifications
// This file should be deployed to Firebase Functions

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.database()

exports.processNotificationQueue = functions.database
  .ref('/notificationQueue/{pushId}')
  .onCreate(async (snapshot, context) => {
    try {
      const notificationData = snapshot.val()
      const { tokens, notification, timestamp } = notificationData
      
      console.log('Processing notification:', notification)
      
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
      
      console.log('Successfully sent message:', response)
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
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = []
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push({
              token: tokens[idx],
              error: resp.error?.code
            })
          }
        })
        
        console.log('Failed tokens:', failedTokens)
        
        // Store failed tokens for cleanup
        await db.ref('failedTokens').push({
          tokens: failedTokens,
          timestamp: admin.database.ServerValue.TIMESTAMP
        })
      }
      
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

// Clean up old notifications and failed tokens
exports.cleanupNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = Date.now()
    const oneDayAgo = now - (24 * 60 * 60 * 1000)
    
    try {
      // Clean up old notification queue items
      const queueRef = db.ref('notificationQueue')
      const oldNotifications = await queueRef
        .orderByChild('timestamp')
        .endAt(oneDayAgo)
        .once('value')
      
      if (oldNotifications.exists()) {
        await queueRef.update(
          Object.keys(oldNotifications.val()).reduce((updates, key) => {
            updates[key] = null
            return updates
          }, {})
        )
        console.log('Cleaned up old notifications')
      }
      
      // Clean up old failed tokens
      const failedTokensRef = db.ref('failedTokens')
      const oldFailedTokens = await failedTokensRef
        .orderByChild('timestamp')
        .endAt(oneDayAgo)
        .once('value')
      
      if (oldFailedTokens.exists()) {
        await failedTokensRef.update(
          Object.keys(oldFailedTokens.val()).reduce((updates, key) => {
            updates[key] = null
            return updates
          }, {})
        )
        console.log('Cleaned up old failed tokens')
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

const cors = require('cors')({ origin: true });

// Manual notification sending endpoint
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  // For regular requests
  cors(req, res, async () => {
    try {
      const { userIds, notification } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid argument',
          message: 'userIds must be a non-empty array'
        });
      }
      
      if (!notification || !notification.title || !notification.body) {
        return res.status(400).json({
          success: false,
          error: 'Invalid argument',
          message: 'Notification must have title and body'
        });
      }
      
      // Get device tokens for users
      const tokens = [];
      for (const userId of userIds) {
        const userTokensSnapshot = await db.ref(`deviceTokens/${userId}`).once('value');
        if (userTokensSnapshot.exists()) {
          const userTokens = userTokensSnapshot.val();
          if (userTokens) {
            Object.values(userTokens).forEach(tokenData => {
              if (tokenData && tokenData.token) {
                tokens.push(tokenData.token);
              }
            });
          }
        }
      }
      
      if (tokens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No device tokens found for users'
        });
      }
      
      // Queue notification for processing
      const notificationRef = db.ref('notificationQueue').push();
      await notificationRef.set({
        tokens,
        notification,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        status: 'pending',
        requestedBy: req.user ? req.user.uid : 'system'
      });
      
      res.status(200).json({ 
        success: true, 
        message: 'Notification queued successfully',
        notificationId: notificationRef.key
      });
    } catch (error) {
      console.error('Error in sendNotification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification',
        details: error.message
      });
    }
  });
});
