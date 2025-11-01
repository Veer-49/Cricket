import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, AlertCircle, CheckCircle, UserPlus } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/library'
import toast from 'react-hot-toast'
import { User } from '../types'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (result: string) => void
  user: User | null
  onJoinTeam?: (teamIdOrCode: string, user: User) => Promise<boolean>
}

export const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  user,
  onJoinTeam
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const initializeScanner = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())

      // Initialize ZXing reader
      readerRef.current = new BrowserMultiFormatReader()
      
      // Start scanning
      if (videoRef.current) {
        await readerRef.current.decodeFromVideoDevice(
          null, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result) {
              const scannedText = result.getText()
              setScanResult(scannedText)
              handleScanResult(scannedText)
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('Scan error:', error)
            }
          }
        )
      }
    } catch (err: any) {
      console.error('Scanner initialization error:', err)
      setHasPermission(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.')
      } else {
        setError('Failed to initialize camera. Please try again.')
      }
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    setIsScanning(false)
    setScanResult(null)
  }

  const handleScanResult = async (result: string) => {
    // Validate if it's a team join URL or team code
    const isValidTeamUrl = result.includes('/join/') || /^[A-Z0-9]{6}$/i.test(result) || /^\d{10}$/.test(result)
    
    if (isValidTeamUrl) {
      setScanResult(result)
      
      // If user and onJoinTeam are available, automatically join the team
      if (user && onJoinTeam) {
        setIsJoining(true)
        
        try {
          let teamCode = result
          
          // Extract team code from URL if needed
          if (result.includes('/join/')) {
            teamCode = result.split('/join/')[1]?.split('?')[0] || result
          }
          
          toast.success('QR Code scanned successfully!')
          const success = await onJoinTeam(teamCode, user)
          
          if (success) {
            // Close scanner after successful join
            setTimeout(() => {
              onClose()
            }, 1500)
          } else {
            setScanResult(null)
            setIsJoining(false)
          }
        } catch (error) {
          console.error('Error joining team:', error)
          toast.error('Failed to join team')
          setScanResult(null)
          setIsJoining(false)
        }
      } else {
        // Fallback to original behavior if no join function provided
        toast.success('QR Code scanned successfully!')
        onScanSuccess(result)
        onClose()
      }
    } else {
      toast.error('Invalid QR code. Please scan a team invitation QR code.')
      setScanResult(null)
    }
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cricket-primary" />
            <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Content - Full Height */}
        <div className="flex-1 flex flex-col">
          {hasPermission === false ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Camera Access Required</h4>
                <p className="text-gray-300 mb-6">{error}</p>
                <button
                  onClick={initializeScanner}
                  className="bg-cricket-primary hover:bg-cricket-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Scanner Error</h4>
                <p className="text-gray-300 mb-6">{error}</p>
                <button
                  onClick={initializeScanner}
                  className="bg-cricket-primary hover:bg-cricket-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Video Preview - Full Screen */}
              <div className="flex-1 relative bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 border-2 border-white/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-cricket-primary rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-cricket-primary rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-cricket-primary rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-cricket-primary rounded-br-2xl"></div>
                  </div>
                </div>

                {/* Scanning Animation */}
                {isScanning && (
                  <motion.div
                    initial={{ y: -150 }}
                    animate={{ y: 150 }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatType: 'reverse',
                      ease: 'linear'
                    }}
                    className="absolute left-1/2 transform -translate-x-1/2 w-72 h-1 bg-cricket-primary shadow-lg rounded-full"
                  />
                )}

                {/* Success/Joining Indicator */}
                {(scanResult || isJoining) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                  >
                    <div className="bg-white rounded-full p-6 flex flex-col items-center">
                      {isJoining ? (
                        <>
                          <UserPlus className="w-12 h-12 text-cricket-primary animate-pulse" />
                          <p className="text-cricket-primary font-medium mt-2">Joining Team...</p>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-12 h-12 text-green-500" />
                          <p className="text-green-500 font-medium mt-2">QR Code Scanned!</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Instructions */}
              <div className="p-6 text-center bg-black/50">
                <p className="text-white text-lg font-medium mb-2">
                  Position QR code within the frame
                </p>
                <p className="text-gray-300 text-sm">
                  {user && onJoinTeam 
                    ? "You'll automatically join the team when scanned" 
                    : "Hold steady for automatic scanning"
                  }
                </p>
                
                {/* Status */}
                {isScanning && !scanResult && (
                  <div className="flex items-center justify-center gap-2 text-cricket-primary mt-4">
                    <div className="w-3 h-3 bg-cricket-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Scanning...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
