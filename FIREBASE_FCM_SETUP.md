# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging for cross-platform push notifications (Android, iOS, Web).

## Prerequisites

1. Firebase project already set up
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Node.js and npm installed

## Step 1: Enable Firebase Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cricket-team-manager-5ef78`
3. Navigate to **Project Settings** > **Cloud Messaging**
4. Generate a **Web Push Certificate** (VAPID key)
5. Copy the VAPID key and update it in `src/services/fcmService.ts`

```typescript
private static readonly VAPID_KEY = 'BKqcBg4a7X_nIe1ymdanx0KtgKMLOFBEERSHdHSmcXjKyBcNMxD-9BWROYSvuN422A-wkhEG_pLq_7Q76JB1atI'
```

✅ **VAPID Key Already Updated!**

## Step 2: Set up Firebase Cloud Functions

1. Initialize Firebase Functions in your project:
```bash
cd /path/to/your/project
firebase init functions
```

2. Choose **JavaScript** or **TypeScript**
3. Install dependencies:
```bash
cd functions
npm install firebase-admin firebase-functions
```

4. Copy the function code from `functions/sendNotification.js` to `functions/index.js`

5. Deploy the functions:
```bash
firebase deploy --only functions
```

## Step 3: Configure Web App

1. **Service Worker**: The `firebase-messaging-sw.js` file is already in the `public` folder
2. **Initialize FCM**: Add this to your main app component:

```typescript
import { FCMService } from '@/services/fcmService'

// Initialize FCM when user logs in
useEffect(() => {
  if (user) {
    FCMService.initializeForUser(user.id)
  }
}, [user])
```

## Step 4: Android Setup

1. **Add Firebase to Android App**:
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/` directory

2. **Update `android/app/build.gradle`**:
```gradle
dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
    implementation 'com.google.firebase:firebase-analytics:21.0.0'
}

apply plugin: 'com.google.gms.google-services'
```

3. **Update `android/build.gradle`**:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.13'
    }
}
```

4. **Add Permissions** in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

5. **Create Firebase Messaging Service**:
Create `android/app/src/main/java/.../FirebaseMessagingService.java`:

```java
package com.yourpackage.cricketapp;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import android.util.Log;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "FCM";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom());
        
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
            showNotification(remoteMessage.getNotification().getTitle(), 
                           remoteMessage.getNotification().getBody());
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);
        // Send token to your server
        sendTokenToServer(token);
    }
}
```

6. **Register Service** in `AndroidManifest.xml`:
```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

## Step 5: iOS Setup

1. **Add Firebase to iOS App**:
   - Download `GoogleService-Info.plist` from Firebase Console
   - Add it to your Xcode project

2. **Install Firebase SDK**:
```bash
cd ios
pod install
```

3. **Update `ios/Podfile`**:
```ruby
pod 'Firebase/Messaging'
pod 'Firebase/Analytics'
```

4. **Configure AppDelegate** (`ios/Runner/AppDelegate.swift`):
```swift
import UIKit
import Flutter
import Firebase
import UserNotifications

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    FirebaseApp.configure()
    
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self
      let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
      UNUserNotificationCenter.current().requestAuthorization(
        options: authOptions,
        completionHandler: {_, _ in })
    } else {
      let settings: UIUserNotificationSettings =
      UIUserNotificationSettings(types: [.alert, .badge, .sound], categories: nil)
      application.registerUserNotificationSettings(settings)
    }

    application.registerForRemoteNotifications()
    
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

5. **Add Capabilities**:
   - Open Xcode project
   - Select your target
   - Go to **Signing & Capabilities**
   - Add **Push Notifications** capability
   - Add **Background Modes** capability and enable **Remote notifications**

## Step 6: Testing

1. **Web Testing**:
   - Open your web app
   - Allow notification permissions
   - Check browser console for FCM token
   - Start a match and verify notifications

2. **Android Testing**:
   - Install app on Android device
   - Check Logcat for FCM token
   - Test notifications

3. **iOS Testing**:
   - Install app on iOS device
   - Check Xcode console for FCM token
   - Test notifications

## Step 7: Environment Variables

Add these to your `.env` file:

```env
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
VITE_FCM_SERVER_KEY=your_server_key_here
```

## Troubleshooting

### Common Issues:

1. **No FCM Token Generated**:
   - Check if notifications are enabled
   - Verify VAPID key is correct
   - Check browser console for errors

2. **Notifications Not Received**:
   - Verify Cloud Functions are deployed
   - Check Firebase Functions logs
   - Ensure device tokens are saved correctly

3. **Service Worker Issues**:
   - Clear browser cache
   - Check if service worker is registered
   - Verify `firebase-messaging-sw.js` is accessible

### Debug Commands:

```bash
# Check Firebase Functions logs
firebase functions:log

# Test Cloud Function locally
firebase functions:shell

# Deploy specific function
firebase deploy --only functions:processNotificationQueue
```

## Security Notes

1. **Never expose server keys** in client-side code
2. **Use Firebase Security Rules** to protect notification data
3. **Validate user permissions** before sending notifications
4. **Implement rate limiting** to prevent spam

## Next Steps

1. **Analytics**: Track notification open rates
2. **Targeting**: Send notifications based on user preferences
3. **Scheduling**: Implement scheduled notifications
4. **Rich Media**: Add images and action buttons to notifications

For more details, refer to the [Firebase Cloud Messaging documentation](https://firebase.google.com/docs/cloud-messaging).
