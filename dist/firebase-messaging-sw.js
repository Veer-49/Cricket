// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBr3kBbnZ35l7Tp7eoyzhHFJiaIab2Zopg",
  authDomain: "cricket-team-manager-5ef78.firebaseapp.com",
  databaseURL: "https://cricket-team-manager-5ef78-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cricket-team-manager-5ef78",
  storageBucket: "cricket-team-manager-5ef78.firebasestorage.app",
  messagingSenderId: "590004782129",
  appId: "1:590004782129:web:3f984d423998a1532b4110"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
  
  const notificationTitle = payload.notification?.title || 'Cricket App'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/logo.png',
    tag: 'cricket-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data
  
  if (action === 'dismiss') {
    return
  }
  
  // Handle notification click
  let urlToOpen = '/'
  
  if (data?.url) {
    urlToOpen = data.url
  } else if (data?.type === 'match_start') {
    urlToOpen = `/scoring?match=${data.matchId}`
  } else if (data?.type === 'team_join') {
    urlToOpen = `/teams?team=${data.teamId}`
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(urlToOpen)
          return
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // Track notification dismissal if needed
  const data = event.notification.data
  if (data?.trackDismissal) {
    // Send analytics or tracking data
  }
})
