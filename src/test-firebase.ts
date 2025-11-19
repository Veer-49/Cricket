import { auth, firestore } from './config/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...')
    
    // Test auth
    console.log('Auth initialized:', auth)
    
    // Test firestore
    console.log('Firestore initialized:', firestore)
    
    // Try to read a test document
    const testDoc = await getDoc(doc(firestore, 'test', 'connection'))
    console.log('Test document read:', testDoc.exists())
    
    console.log('Firebase connection test completed successfully!')
    return true
  } catch (error) {
    console.error('Firebase connection test failed:', error)
    return false
  }
}

// Run test if in development
if (import.meta.env.DEV) {
  testFirebaseConnection()
}
