# Firebase Setup Guide

This guide will help you set up Firebase for real-time team management in your Cricket App.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "cricket-team-manager")
4. Enable Google Analytics (optional)
5. Create project

## 2. Set up Realtime Database

1. In Firebase Console, go to **Realtime Database**
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **test mode** for now
5. Note the database URL (you'll need this)

## 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (`</>`)
4. Register app with nickname
5. Copy the configuration object

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 5. Install Dependencies

Run the following command to install Firebase and QR code dependencies:

```bash
npm install firebase qrcode
npm install -D @types/qrcode
```

## 6. Database Security Rules

Update your Firebase Realtime Database rules for basic security:

```json
{
  "rules": {
    "teams": {
      ".read": true,
      ".write": true,
      "$teamId": {
        ".validate": "newData.hasChildren(['id', 'name', 'captainId', 'players', 'matchFormat', 'createdAt', 'isPublic'])"
      }
    },
    "teamsByShortCode": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 7. Update Your App

Replace the existing `TeamManagement` component with `TeamManagementFirebase`:

```tsx
// In your main component (App.tsx or Dashboard.tsx)
import TeamManagementFirebase from './components/TeamManagementFirebase'

// Replace:
// <TeamManagement user={user} />
// With:
<TeamManagementFirebase user={user} />
```

## 8. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create a new team
3. Check Firebase Console to see if data appears
4. Try joining with the 6-character code
5. Test QR code generation and sharing

## Features Enabled

✅ **Real-time team synchronization** - Teams appear instantly across all devices
✅ **6-character short codes** - Easy to remember and share (e.g., "ABC123")
✅ **10-digit IDs still supported** - Backward compatibility
✅ **QR code generation** - Instant team joining via QR scan
✅ **Enhanced sharing** - WhatsApp, native sharing, clipboard
✅ **Automatic migration** - Existing localStorage teams migrate to Firebase

## Troubleshooting

### "Team not found" error
- Check if Firebase is properly configured
- Verify database rules allow read/write
- Ensure environment variables are correct

### QR codes not generating
- Check if `qrcode` package is installed
- Verify network connection
- Check browser console for errors

### Teams not syncing
- Check Firebase Console for data
- Verify database URL in environment variables
- Check network connectivity

## Production Deployment

Before deploying to production:

1. **Update database rules** for better security
2. **Enable authentication** (optional but recommended)
3. **Set up proper indexes** for better performance
4. **Configure CORS** if needed
5. **Test with multiple users** across different devices

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Test with a fresh Firebase project
4. Check network connectivity
