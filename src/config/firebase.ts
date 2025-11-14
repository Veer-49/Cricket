import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getFunctions } from 'firebase/functions'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBr3kBbnZ35l7Tp7eoyzhHFJiaIab2Zopg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cricket-team-manager-5ef78.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://cricket-team-manager-5ef78-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cricket-team-manager-5ef78",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cricket-team-manager-5ef78.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "590004782129",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:590004782129:web:3f984d423998a1532b4110"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const database = getDatabase(app)
export const auth = getAuth(app)
export const functions = getFunctions(app)

// Initialize Firebase Cloud Messaging (only if supported)
let messaging: any = null
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app)
    }
  })
}

export { messaging }
export default app
