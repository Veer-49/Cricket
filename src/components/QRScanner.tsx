import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/library'
import toast from 'react-hot-toast'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (result: string) => void
}

export const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
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

  const handleScanResult = (result: string) => {
    // Validate if it's a team join URL or team code
    const isValidTeamUrl = result.includes('/join/') || /^[A-Z0-9]{6}$/i.test(result)
    
    if (isValidTeamUrl) {
      toast.success('QR Code scanned successfully!')
      onScanSuccess(result)
      onClose()
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
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-2 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto relative max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-cricket-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner Content */}
          <div className="p-4">
            {hasPermission === false ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Required</h4>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={initializeScanner}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Scanner Error</h4>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={initializeScanner}
                  className="btn-primary"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative bg-black rounded-lg overflow-hidden h-[400px]">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Close Button Overlay */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center transition-all z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cricket-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cricket-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cricket-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cricket-primary rounded-br-lg"></div>
                    </div>
                  </div>

                  {/* Scanning Animation */}
                  {isScanning && (
                    <motion.div
                      initial={{ y: -120 }}
                      animate={{ y: 120 }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: 'reverse',
                        ease: 'linear'
                      }}
                      className="absolute left-1/2 transform -translate-x-1/2 w-64 h-0.5 bg-cricket-primary shadow-lg"
                    />
                  )}

                  {/* Success Indicator */}
                  {scanResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20"
                    >
                      <div className="bg-white rounded-full p-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Instructions */}
                <div className="text-center px-4">
                  <p className="text-gray-700 text-sm font-medium">
                    Center the QR code in the frame
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Hold steady for automatic scanning
                  </p>
                </div>

                {/* Status */}
                {isScanning && (
                  <div className="flex items-center justify-center gap-2 text-cricket-primary">
                    <div className="w-2 h-2 bg-cricket-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Scanning...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
