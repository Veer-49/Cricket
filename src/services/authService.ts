import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, firestore } from '../config/firebase'
import { User } from '../types'

export class AuthService {
  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid)
        callback(userData)
      } else {
        callback(null)
      }
    })
  }

  // Helper method to get user-friendly error messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, name: string, phone: string): Promise<User> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update profile with display name
      await updateProfile(firebaseUser, { displayName: name })

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        phone: phone,
        profilePicture: firebaseUser.photoURL || '',
        stats: {
          totalRuns: 0,
          totalBalls: 0,
          fours: 0,
          sixes: 0,
          wickets: 0,
          overallStrikeRate: 0,
          centuries: 0,
          halfCenturies: 0,
          hatTricks: 0,
          matchesPlayed: 0,
          totalOvers: 0,
          runsGiven: 0,
          economyRate: 0
        },
        createdAt: new Date()
      }

      // Save user data to Firestore with retry logic
      try {
        await setDoc(doc(firestore, 'users', firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp()
        })
      } catch (firestoreError: any) {
        console.error('Firestore save error:', firestoreError)
        // If Firestore fails, delete the auth user to maintain consistency
        await firebaseUser.delete()
        throw new Error('Failed to save user data. Please try again.')
      }

      return userData
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      const userData = await this.getUserData(firebaseUser.uid)
      if (!userData) {
        throw new Error('User data not found')
      }

      return userData
    } catch (error: any) {
      console.error('Signin error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Signout error:', error)
      throw new Error('Failed to sign out')
    }
  }

  // Get user data from Firestore
  static async getUserData(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        return {
          ...userData,
          createdAt: userData.createdAt?.toDate() || new Date()
        } as User
      }
      return null
    } catch (error: any) {
      console.error('Error getting user data:', error)
      // If offline, return basic user data from auth
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        const currentUser = auth.currentUser
        if (currentUser && currentUser.uid === userId) {
          return {
            id: currentUser.uid,
            name: currentUser.displayName || 'Unknown',
            email: currentUser.email || '',
            phone: '',
            stats: {
              totalRuns: 0,
              totalBalls: 0,
              fours: 0,
              sixes: 0,
              wickets: 0,
              overallStrikeRate: 0,
              centuries: 0,
              halfCenturies: 0,
              hatTricks: 0,
              matchesPlayed: 0,
              totalOvers: 0,
              runsGiven: 0,
              economyRate: 0
            },
            createdAt: new Date()
          }
        }
      }
      return null
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId)
      await setDoc(userRef, updates, { merge: true })
      
      // Update Firebase auth profile if name is provided
      if (updates.name) {
        const currentUser = auth.currentUser
        if (currentUser && currentUser.uid === userId) {
          await updateProfile(currentUser, { displayName: updates.name })
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw new Error('Failed to update profile')
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }
}
