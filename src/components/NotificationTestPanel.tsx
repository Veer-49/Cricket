import React, { useState } from 'react'
import { NotificationTester } from '@/utils/notificationTester'
import { Bell, Smartphone, Monitor, Cloud, Play, Users } from 'lucide-react'

export const NotificationTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runAllTests = async () => {
    setIsLoading(true)
    try {
      const results = await NotificationTester.runAllTests()
      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testWebOnly = async () => {
    setIsLoading(true)
    try {
      const webResult = await NotificationTester.testWebNotifications()
      setTestResults({ web: webResult })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-black">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-black">Notification Test Panel</h2>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 border border-blue-700 shadow-md"
        >
          <Bell className="w-5 h-5 text-black" />
          <span className="text-black font-medium">Run All Tests</span>
        </button>

        <button
          onClick={testWebOnly}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 border border-green-700 shadow-md"
        >
          <Monitor className="w-5 h-5 text-black" />
          <span className="text-black font-medium">Test Web Only</span>
        </button>

<button
          onClick={() => NotificationTester.testMatchNotification()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg disabled:opacity-50 border border-orange-700 shadow-md"
        >
          <Play className="w-5 h-5 text-black" />
          <span className="text-black font-medium">Test Match Alert</span>
        </button>

        <button
          onClick={() => NotificationTester.testTeamJoinNotification()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg disabled:opacity-50 border border-teal-700 shadow-md"
        >
          <Users className="w-5 h-5 text-black" />
          <span className="text-black font-medium">Test Team Join</span>
        </button>

        <button
          onClick={() => NotificationTester.showTestNotification()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 border border-indigo-700 shadow-md"
        >
          <Bell className="w-5 h-5 text-black" />
          <span className="text-black font-medium">Show Test Alert</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Running notification tests...</p>
        </div>
      )}

      {/* Test Results */}
      {testResults && !isLoading && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-black">Test Results</h3>
          
          {/* Web Results */}
          {testResults.web !== undefined && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Monitor className="w-6 h-6 text-black" />
              <span className="font-medium text-black">Web Notifications:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                testResults.web 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.web ? '✅ Working' : '❌ Failed'}
              </span>
            </div>
          )}

          {/* Additional test results can be added here in the future */}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-black mb-2">Testing Instructions:</h4>
        <ul className="text-sm text-black space-y-1">
          <li>• <strong>Web Notifications:</strong> Click "Test Web Only" to check browser notifications</li>
          <li>• <strong>Match Notifications:</strong> Click "Test Match Alert" to test match start notifications</li>
          <li>• <strong>Team Notifications:</strong> Click "Test Team Join" to test team join notifications</li>
          <li>• Make sure to allow notifications in your browser when prompted</li>
        </ul>
      </div>

      {/* Current Status */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold text-black mb-2">Current Status:</h4>
        <div className="text-sm text-black space-y-1">
          <div>✅ Web notifications configured and ready</div>
          <div>✅ Firebase Functions deployed and ready</div>
          <div>✅ Service Worker handling background messages</div>
          <div>❓ Android setup requires manual verification</div>
          <div>❓ iOS setup requires manual verification</div>
        </div>
      </div>
    </div>
  )
}
