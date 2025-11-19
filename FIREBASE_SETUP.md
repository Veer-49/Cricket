# Firebase Setup Guide for Cricket App Authentication

This guide will help you set up Firebase Authentication and Firestore for user signup/login in your Cricket App.

## 🚨 Current Issues & Solutions

If you're seeing these errors:
- `auth/email-already-in-use` - User exists in Auth but not in Firestore
- `Failed to get document because the client is offline` - Firestore connectivity issue
- `User data not found` - Auth user created but Firestore document failed

Follow the steps below to fix these issues.

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **cricket-team-manager-5ef78**
3. If project doesn't exist, create it with this ID

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Click **Save**

## 3. Set up Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database** (if not exists)
3. Choose location: **asia-southeast1** (recommended)
4. Start in **Test mode** (we'll update rules below)
5. Click **Create**

## 4. Update Firestore Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace existing rules with the content from `firestore.rules` file
3. Click **Publish**

Or copy these rules directly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write teams
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write, create, update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Authenticated users can read/write matches
    match /matches/{matchId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Authenticated users can read/write player stats
    match /playerStats/{playerId} {
      allow read, write: if request.auth != null && request.auth.uid == playerId;
      allow create: if request.auth != null && request.auth.uid == playerId;
    }
    
    // Device tokens for notifications
    match /deviceTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Environment Configuration

Your Firebase config is already in the code, but verify it's correct:

```env
# Firebase Configuration (already in code as fallback)
VITE_FIREBASE_API_KEY=AIzaSyBr3kBbnZ35l7Tp7eoyzhHFJiaIab2Zopg
VITE_FIREBASE_AUTH_DOMAIN=cricket-team-manager-5ef78.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://cricket-team-manager-5ef78-default-rtdb.asia-southeast1.firebasedatabase.app/
VITE_FIREBASE_PROJECT_ID=cricket-team-manager-5ef78
VITE_FIREBASE_STORAGE_BUCKET=cricket-team-manager-5ef78.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=590004782129
VITE_FIREBASE_APP_ID=1:590004782129:web:3f984d423998a1532b4110
```

## 6. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open browser console - you should see:
   ```
   🔍 Testing Firebase setup...
   ✅ Firebase services initialized
   ✅ Firestore write test passed
   ✅ Authentication test passed
   🎉 Firebase setup test completed
   ```

3. Try creating a new account:
   - Go to Auth modal
   - Click "Sign Up"
   - Fill in details
   - Check if user is created in Authentication tab
   - Check if user document appears in Firestore

## 7. Troubleshooting Common Issues

### "Email already in use" but login fails
**Problem**: User exists in Auth but not in Firestore
**Solution**: 
1. Delete the user from Firebase Console → Authentication
2. Try signing up again (now it will create both Auth and Firestore document)

### "Client is offline" error
**Problem**: Firestore connectivity issue
**Solution**:
1. Check if Firestore is enabled in Firebase Console
2. Verify Firestore location matches your code (asia-southeast1)
3. Check network connection
4. Clear browser cache and try again

### "Permission denied" error
**Problem**: Firestore security rules blocking access
**Solution**:
1. Update Firestore rules (see step 4)
2. Make sure rules are published
3. Try creating a test document in Firebase Console

### "User data not found" after signup
**Problem**: Auth user created but Firestore save failed
**Solution**:
1. Check browser console for detailed error
2. Verify Firestore rules allow writes
3. Check Firebase quota limits

## 8. Advanced Configuration

### Enable Offline Persistence
The app already has offline persistence enabled. This allows the app to work even with intermittent connectivity.

### Firebase Functions Region
The app is configured to use `asia-southeast1` region for Firebase Functions. Make sure your functions are deployed to the same region.

## 9. Production Checklist

Before deploying to production:

1. ✅ Enable Authentication with proper providers
2. ✅ Set up Firestore with production rules
3. ✅ Configure Firebase Functions in correct region
4. ✅ Test all authentication flows
5. ✅ Verify data persistence in Firestore
6. ✅ Test offline functionality
7. ✅ Set up monitoring and error tracking

## 10. Support

If you still have issues:

1. Check the browser console for detailed error messages
2. Verify all steps above are completed correctly
3. Check Firebase Console for any configuration warnings
4. Try with a fresh browser session
5. Check if there are any Firebase service outages

## Quick Fix Script

If you need to quickly reset and test:

```javascript
// In browser console
localStorage.clear()
location.reload()
```

This will clear any cached data and reload the page with fresh authentication state.
