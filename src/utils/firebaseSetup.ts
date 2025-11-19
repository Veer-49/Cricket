import { auth, firestore } from '../config/firebase'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

// Test Firebase setup and provide helpful error messages
export const testFirebaseSetup = async () => {
  console.log('🔍 Testing Firebase setup...')
  
  // Test 1: Check if Firebase is initialized
  if (!auth) {
    console.error('❌ Firebase Auth not initialized')
    return false
  }
  
  if (!firestore) {
    console.error('❌ Firebase Firestore not initialized')
    return false
  }
  
  console.log('✅ Firebase services initialized')
  
  // Test 2: Check if we can write to Firestore
  try {
    // Try to write to a test document in users collection (with a test ID)
    const testUserId = `test_${Date.now()}`
    const testDoc = doc(firestore, 'users', testUserId)
    await setDoc(testDoc, {
      test: true,
      timestamp: serverTimestamp()
    })
    // Clean up the test document
    await deleteDoc(testDoc)
    console.log('✅ Firestore write test passed')
  } catch (error: any) {
    console.error('❌ Firestore write test failed:', error)
    
    if (error.code === 'permission-denied') {
      console.error('💡 Solution: Update Firestore security rules in Firebase Console')
      console.error('   Go to: Firestore Database -> Rules')
      console.error('   Add rules to allow read/write for authenticated users')
    } else if (error.code === 'unavailable') {
      console.error('💡 Solution: Check if Firestore is enabled in Firebase Console')
      console.error('   Go to: Firestore Database -> Create database')
    }
    return false
  }
  
  // Test 3: Check authentication
  try {
    // Try to create a test user (this will fail if auth is not configured)
    const testEmail = `test-${Date.now()}@example.com`
    await createUserWithEmailAndPassword(auth, testEmail, 'test123456')
    console.log('✅ Authentication test passed')
  } catch (error: any) {
    console.error('❌ Authentication test failed:', error)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Authentication is working (user already exists)')
    } else if (error.code === 'auth/configuration-not-found') {
      console.error('💡 Solution: Enable Email/Password authentication in Firebase Console')
      console.error('   Go to: Authentication -> Sign-in method -> Email/Password -> Enable')
    } else if (error.code === 'auth/quota-exceeded') {
      console.error('💡 Solution: Check Firebase project quota and billing')
    }
  }
  
  console.log('🎉 Firebase setup test completed')
  return true
}

// Export Firebase setup instructions
export const FIREBASE_SETUP_INSTRUCTIONS = `
🔥 FIREBASE SETUP CHECKLIST:

1. ✅ Firebase Project Created
   Project ID: cricket-team-manager-5ef78
   
2. 🔧 Authentication Setup
   - Go to Firebase Console: https://console.firebase.google.com/
   - Select project: cricket-team-manager-5ef78
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
   
3. 📊 Firestore Database Setup
   - Go to Firestore Database
   - Create database if not exists
   - Choose location: asia-southeast1 (or multi-region)
   - Start in test mode (then update rules below)
   
4. 🛡️ Firestore Security Rules
   Go to Firestore Database → Rules and paste:
   
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own documents
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Authenticated users can read/write teams
       match /teams/{teamId} {
         allow read, write: if request.auth != null;
       }
       
       // Authenticated users can read/write matches
       match /matches/{matchId} {
         allow read, write: if request.auth != null;
       }
       
       // Authenticated users can read/write player stats
       match /playerStats/{playerId} {
         allow read, write: if request.auth != null && request.auth.uid == playerId;
       }
       
       // Device tokens for notifications
       match /deviceTokens/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   
5. 🌐 Environment Variables
   Copy .env.example to .env and update if needed
   
6. 🧪 Test the setup
   Run: npm run dev
   Check browser console for test results
`

// Run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testFirebaseSetup()
  }, 2000)
}
