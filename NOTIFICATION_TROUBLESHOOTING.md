# 🔧 Notification Troubleshooting Guide

## Quick Fix Steps

### 1. **Test Notifications Immediately**
1. Open your cricket app
2. Click **"Test Notifications"** button on the home page
3. Click **"Debug Setup"** to check status
4. Open browser **Developer Tools** (F12) and check console

### 2. **Check Browser Console**
Look for these messages:
- ✅ `Service Worker registered`
- ✅ `FCM Registration token obtained`
- ✅ `Permission status: granted`

### 3. **Common Issues & Fixes**

#### **Issue: "No registration token available"**
**Fix:**
```bash
# Check if service worker file exists
# File should be at: /public/firebase-messaging-sw.js
```

#### **Issue: "Notification permission denied"**
**Fix:**
1. Click the 🔒 lock icon in browser address bar
2. Change notifications to "Allow"
3. Refresh the page

#### **Issue: "Firebase Messaging not supported"**
**Fix:**
- Use Chrome, Firefox, or Edge (not Safari)
- Ensure you're on HTTPS (not HTTP)

#### **Issue: "Service Worker registration failed"**
**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check if `/firebase-messaging-sw.js` is accessible

### 4. **Manual Test Steps**

#### **Test 1: Browser Notification**
```javascript
// Paste in browser console
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('Test', { body: 'This works!' })
    }
  })
}
```

#### **Test 2: Service Worker**
```javascript
// Paste in browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length)
})
```

#### **Test 3: FCM Token**
```javascript
// Paste in browser console
import { getToken } from 'firebase/messaging'
// Check if token is generated
```

### 5. **Firebase Setup Checklist**

- [ ] Firebase project created
- [ ] Web app added to Firebase project
- [ ] VAPID key generated and added to code
- [ ] `firebase-messaging-sw.js` in `/public` folder
- [ ] Service worker registered in main app
- [ ] Firebase Functions deployed (for server-side sending)

### 6. **Deployment Requirements**

#### **For Web Notifications to Work:**
1. **HTTPS Required**: Notifications only work on HTTPS sites
2. **Service Worker**: Must be accessible at `/firebase-messaging-sw.js`
3. **Firebase Functions**: Deploy with `firebase deploy --only functions`

#### **Deploy Commands:**
```bash
# Deploy Firebase Functions
firebase deploy --only functions

# Deploy to Vercel/Netlify with HTTPS
npm run build
# Upload dist folder to hosting provider
```

### 7. **Debug Console Commands**

Open browser console and run:

```javascript
// Check notification setup
TestNotifications.checkSetupStatus()

// Test basic notification
TestNotifications.testBasicNotification('your-user-id')

// Clear notification data
TestNotifications.clearNotificationData()
```

### 8. **Expected Behavior**

#### **When Working Correctly:**
1. **Page Load**: Service worker registers automatically
2. **Login**: FCM token generated and saved
3. **Permission**: Browser asks for notification permission
4. **Test Button**: Shows browser notification immediately
5. **Match Start**: All team members get notifications

#### **Console Output Should Show:**
```
✅ Service Worker registered
✅ FCM Registration token obtained: eR7890qwerty...
✅ Permission status: granted
✅ Device token saved successfully
```

### 9. **Still Not Working?**

#### **Check These:**
1. **Browser**: Use Chrome/Firefox (not Safari)
2. **HTTPS**: Ensure site is on HTTPS
3. **Permissions**: Allow notifications in browser settings
4. **Cache**: Clear browser cache completely
5. **Firewall**: Check if Firebase domains are blocked

#### **Firebase Domains to Whitelist:**
- `*.googleapis.com`
- `*.firebase.com`
- `*.firebaseapp.com`
- `fcm.googleapis.com`

### 10. **Contact Support**

If still having issues, provide:
1. Browser console errors
2. Network tab showing failed requests
3. Browser and OS version
4. Steps you've already tried

The notification system should work once these setup steps are completed! 🔔✨
