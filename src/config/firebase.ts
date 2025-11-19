import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
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
export const firestore = getFirestore(app)
export const functions = getFunctions(app, 'asia-southeast1') // Specify region

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(firestore).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.')
    }
  })
}

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
