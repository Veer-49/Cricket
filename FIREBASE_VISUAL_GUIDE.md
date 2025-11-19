# Firebase Console Visual Guide

## 🔍 Where to Find Firestore Database

### Method 1: In Firebase Console

1. **Firebase Console**: https://console.firebase.google.com/
2. **Select project**: cricket-team-manager-5ef78
3. **Left sidebar navigation**:
   ```
   📊 Overview
   🚀 Build
      ├── Authentication ✅ (you should have this)
      ├── Firestore Database ← LOOK HERE
      ├── Realtime Database (different from Firestore)
      ├── Storage
      └── Hosting
   📈 Analytics
   ⚙️ Project settings
   ```

### Method 2: If You Only See Realtime Database

If your sidebar shows "Realtime Database" but not "Firestore Database":

1. **Click "Build"** to expand it
2. **Look for "Firestore Database"** below Realtime Database
3. **If not there**, we need to create it

### Method 3: Creating Firestore Database

1. **Click "Firestore Database"** in the sidebar
2. **You should see**: 
   - "Create database" button OR
   - "Get started" button OR
   - Database interface (if it exists)

3. **If you see "Create database":**
   - Click it
   - Choose location: asia-southeast1
   - Start in test mode
   - Click Create

### Method 4: Check Project Settings

1. **Go to Project Settings** (gear icon ⚙️)
2. **Check "Services" tab**
3. **Look for "Firestore API"**
4. **If not enabled**, enable it

## 🆘 Troubleshooting

### Issue: "I don't see Firestore anywhere"
**Solution**: The Firestore API might not be enabled
1. Go to: https://console.cloud.google.com/
2. Select: cricket-team-manager-5ef78
3. Search: "Firestore API"
4. Click: "Enable"

### Issue: "I only see Realtime Database"
**Solution**: Realtime Database is different from Firestore
1. Realtime Database = Old Firebase database (JSON structure)
2. Firestore = New Firebase database (document structure)
3. You need Firestore for this app

### Issue: "I'm in the wrong project"
**Solution**: Switch projects
1. Click project name top-left
2. Select: cricket-team-manager-5ef78
3. If it doesn't exist, create it

## 📱 What You Should See

### Correct Setup:
```
Firebase Console
├── Project: cricket-team-manager-5ef78
├── Build
│   ├── Authentication (Email/Password enabled)
│   ├── Firestore Database (created in asia-southeast1)
│   └── Realtime Database (optional, ignore)
└── Project Settings
```

### After Creating Firestore:
- You'll see a "Data" tab
- You'll see a "Rules" tab
- You'll see collections like "users", "teams", etc.

## 🔧 Quick Actions

### Enable Firestore API (if missing):
1. https://console.cloud.google.com/
2. Select project
3. Search "Firestore API"
4. Click "Enable"

### Create Firestore Database:
1. In Firebase Console → Build → Firestore Database
2. Click "Create database"
3. Location: asia-southeast1
4. Start in test mode
5. Click "Create"

### Verify Setup:
1. Firestore appears in sidebar
2. Can see "Data" and "Rules" tabs
3. No error messages

## 📞 Need More Help?

If you're still stuck:
1. Take a screenshot of your Firebase Console
2. Tell me exactly what you see in the left sidebar
3. I'll guide you step by step based on what's visible
