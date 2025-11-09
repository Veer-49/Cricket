# Android Firebase Notification Setup - Complete Guide

This guide provides detailed steps to integrate Firebase Cloud Messaging (FCM) notifications in your Android Cricket app.

## Prerequisites

- Android Studio installed
- Firebase project already created (`cricket-team-manager-5ef78`)
- Android app created in Firebase Console
- Minimum SDK version 21 or higher

## Step 1: Firebase Console Setup

### 1.1 Add Android App to Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cricket-team-manager-5ef78`
3. Click **"Add app"** → **Android**
4. Enter your Android package name (e.g., `com.cricket.teammanager`)
5. Enter app nickname: `Cricket Team Manager Android`
6. Enter SHA-1 certificate fingerprint (optional for development)

### 1.2 Download Configuration File

1. Download `google-services.json`
2. Place it in `android/app/` directory
3. **Important**: Never commit this file to version control

## Step 2: Project-Level Configuration

### 2.1 Update `android/build.gradle` (Project level)

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.0.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        // Add Google Services plugin
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 2.2 Update `android/app/build.gradle` (App level)

```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
// Add Google Services plugin
apply plugin: 'com.google.gms.google-services'

android {
    namespace "com.cricket.teammanager"
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.cricket.teammanager"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    
    // Firebase dependencies
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'
    
    // For React Native Firebase (if using)
    implementation 'com.google.firebase:firebase-app'
}
```

## Step 3: Android Manifest Configuration

### 3.1 Update `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- For Android 13+ notification permission -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".MainApplication"
        android:allowBackup="false"
        android:theme="@style/AppTheme">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Firebase Messaging Service -->
        <service
            android:name=".MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Default notification icon and color -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_notification" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/colorAccent" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="cricket_notifications" />

    </application>
</manifest>
```

## Step 4: Create Firebase Messaging Service

### 4.1 Create `MyFirebaseMessagingService.java`

Create file: `android/app/src/main/java/com/cricket/teammanager/MyFirebaseMessagingService.java`

```java
package com.cricket.teammanager;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";
    private static final String CHANNEL_ID = "cricket_notifications";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            handleDataMessage(remoteMessage);
        }

        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
            showNotification(
                remoteMessage.getNotification().getTitle(),
                remoteMessage.getNotification().getBody(),
                remoteMessage.getData()
            );
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);
        
        // Send token to your server
        sendTokenToServer(token);
    }

    private void handleDataMessage(RemoteMessage remoteMessage) {
        String type = remoteMessage.getData().get("type");
        String title = "Cricket App";
        String body = "You have a new notification";

        if ("match_start".equals(type)) {
            title = "🏏 Match Started!";
            body = remoteMessage.getData().get("team1Name") + " vs " + 
                   remoteMessage.getData().get("team2Name") + " at " + 
                   remoteMessage.getData().get("venue");
        } else if ("team_join".equals(type)) {
            title = "👥 New Team Member";
            body = remoteMessage.getData().get("newMemberName") + " joined " + 
                   remoteMessage.getData().get("teamName");
        }

        showNotification(title, body, remoteMessage.getData());
    }

    private void showNotification(String title, String messageBody, java.util.Map<String, String> data) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // Add data to intent
        if (data != null) {
            for (java.util.Map.Entry<String, String> entry : data.entrySet()) {
                intent.putExtra(entry.getKey(), entry.getValue());
            }
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent,
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        
        NotificationCompat.Builder notificationBuilder =
            new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(messageBody)
                .setAutoCancel(true)
                .setSound(defaultSoundUri)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setDefaults(NotificationCompat.DEFAULT_ALL);

        NotificationManager notificationManager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        notificationManager.notify(0, notificationBuilder.build());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Cricket Notifications";
            String description = "Notifications for cricket matches and team updates";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.enableVibration(true);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void sendTokenToServer(String token) {
        // TODO: Implement sending token to your server
        // You can use your existing FCMService.saveDeviceToken method
        Log.d(TAG, "Token to send to server: " + token);
    }
}
```

## Step 5: Create Notification Icon

### 5.1 Create notification icon drawable

Create `android/app/src/main/res/drawable/ic_notification.xml`:

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24"
    android:tint="?attr/colorOnPrimary">
  <path
      android:fillColor="@android:color/white"
      android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM13,17h-2v-6h2v6zM13,9h-2L11,7h2v2z"/>
</vector>
```

### 5.2 Update colors.xml

Add to `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#3F51B5</color>
    <color name="colorPrimaryDark">#303F9F</color>
    <color name="colorAccent">#FF4081</color>
    <color name="cricket_primary">#1976D2</color>
</resources>
```

## Step 6: MainActivity Integration

### 6.1 Update `MainActivity.java`

```java
package com.cricket.teammanager;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends ReactActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected String getMainComponentName() {
        return "CricketApp";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Firebase Messaging
        initializeFirebaseMessaging();
        
        // Handle notification click
        handleNotificationClick(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleNotificationClick(intent);
    }

    private void initializeFirebaseMessaging() {
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.w(TAG, "Fetching FCM registration token failed", task.getException());
                    return;
                }

                // Get new FCM registration token
                String token = task.getResult();
                Log.d(TAG, "FCM Registration Token: " + token);
                
                // TODO: Send token to your server
                // You can call your web service here to save the token
            });
    }

    private void handleNotificationClick(Intent intent) {
        if (intent != null && intent.getExtras() != null) {
            String type = intent.getStringExtra("type");
            if (type != null) {
                Log.d(TAG, "Notification clicked with type: " + type);
                
                // TODO: Navigate to specific screen based on notification type
                // You can use React Native Navigation or pass data to JavaScript
            }
        }
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            DefaultNewArchitectureEntryPoint.getFabricEnabled()
        );
    }
}
```

## Step 7: MainApplication Setup

### 7.1 Update `MainApplication.java`

```java
package com.cricket.teammanager;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
        new DefaultReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
                return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
                @SuppressWarnings("UnnecessaryLocalVariable")
                List<ReactPackage> packages = new PackageList(this).getPackages();
                // Add additional packages here if needed
                return packages;
            }

            @Override
            protected String getJSMainModuleName() {
                return "index";
            }

            @Override
            protected boolean isNewArchEnabled() {
                return DefaultNewArchitectureEntryPoint.getFabricEnabled();
            }

            @Override
            protected Boolean isHermesEnabled() {
                return DefaultNewArchitectureEntryPoint.getHermesEnabled();
            }
        };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        
        if (DefaultNewArchitectureEntryPoint.getFabricEnabled()) {
            DefaultNewArchitectureEntryPoint.load();
        }
    }
}
```

## Step 8: Testing Setup

### 8.1 Test FCM Token Generation

Add this to your React Native JavaScript code:

```javascript
// Add to your main App.js or index.js
import messaging from '@react-native-firebase/messaging';

// Request permission (Android 13+)
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFCMToken();
  }
}

// Get FCM token
async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    // Send this token to your server
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
}

// Listen for foreground messages
messaging().onMessage(async remoteMessage => {
  console.log('Foreground message received:', remoteMessage);
});

// Listen for background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);
});
```

## Step 9: Build and Test

### 9.1 Clean and Build

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 9.2 Test Notifications

1. **Check Logcat** for FCM token:
   ```bash
   adb logcat | grep FCM
   ```

2. **Send test notification** from Firebase Console:
   - Go to Firebase Console → Cloud Messaging
   - Click "Send your first message"
   - Enter title and body
   - Select your Android app
   - Send

3. **Verify notification** appears on device

## Step 10: Integration with Your Web Service

### 10.1 Save Token to Firebase Database

Update your Android code to save the token:

```java
// In MainActivity.java, update initializeFirebaseMessaging()
private void initializeFirebaseMessaging() {
    FirebaseMessaging.getInstance().getToken()
        .addOnCompleteListener(task -> {
            if (!task.isSuccessful()) {
                Log.w(TAG, "Fetching FCM registration token failed", task.getException());
                return;
            }

            String token = task.getResult();
            Log.d(TAG, "FCM Registration Token: " + token);
            
            // Save to Firebase Database (same as web app)
            saveTokenToDatabase(token);
        });
}

private void saveTokenToDatabase(String token) {
    // Use Firebase Database to save token
    // This should match your web app's FCMService.saveDeviceToken method
    // You can use Firebase Database SDK or make HTTP request to your server
}
```

## Troubleshooting

### Common Issues:

1. **No FCM Token Generated**:
   - Check `google-services.json` is in correct location
   - Verify package name matches Firebase project
   - Check internet connection

2. **Notifications Not Received**:
   - Verify Firebase Functions are deployed
   - Check device is not in battery optimization
   - Test with Firebase Console first

3. **Build Errors**:
   - Clean project: `./gradlew clean`
   - Check all dependencies are added
   - Verify Google Services plugin is applied

4. **Permission Issues (Android 13+)**:
   - Request POST_NOTIFICATIONS permission
   - Handle permission in runtime

### Debug Commands:

```bash
# Check FCM token
adb logcat | grep "FCM Registration Token"

# Check notification received
adb logcat | grep "FCMService"

# Check Firebase connection
adb logcat | grep "Firebase"
```

## Next Steps

1. **Test thoroughly** on different Android versions
2. **Implement deep linking** for notification clicks
3. **Add notification categories** for different types
4. **Implement notification scheduling**
5. **Add analytics** for notification engagement

Your Android app should now be fully integrated with Firebase Cloud Messaging and receive notifications from your Cricket web app!
