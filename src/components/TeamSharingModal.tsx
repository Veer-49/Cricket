import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Share2, QrCode, MessageCircle, Download } from 'lucide-react'
import { Team } from '../types'
import { FirebaseService } from '../services/firebaseService'
import toast from 'react-hot-toast'

interface TeamSharingModalProps {
  team: Team
  isOpen: boolean
  onClose: () => void
}

export const TeamSharingModal: React.FC<TeamSharingModalProps> = ({
  team,
  isOpen,
  onClose
}) => {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const joinUrl = team.joinUrl || `${window.location.origin}/join/${team.shortCode}`
  const shortCode = team.shortCode || team.id

  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode()
    }
  }, [isOpen])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      const qrDataUrl = await FirebaseService.generateQRCode(joinUrl)
      setQrCode(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareViaWhatsApp = () => {
    const message = `🏏 Join my cricket team "${team.name}"!\n\nTeam Code: ${shortCode}\nJoin Link: ${joinUrl}\n\nUse the code or click the link to join our team!`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Cricket Team: ${team.name}`,
          text: `Join my cricket team "${team.name}" using code: ${shortCode}`,
          url: joinUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copying link
      copyToClipboard(joinUrl, 'Join link')
    }
  }

  const downloadQRCode = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.download = `${team.name}-qr-code.png`
    link.href = qrCode
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">Share Team</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Team Info */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {team.players.length} player{team.players.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Short Code */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Team Code</label>
                  <div className="text-2xl font-mono font-bold text-cricket-primary mt-1">
                    {shortCode}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(shortCode, 'Team code')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Join Link */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <label className="text-sm font-medium text-gray-700">Join Link</label>
                  <div className="text-sm text-gray-600 mt-1 truncate">
                    {joinUrl}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(joinUrl, 'Join link')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-2"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <label className="text-sm font-medium text-gray-700 block mb-3">
                QR Code
              </label>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 inline-block">
                {loading ? (
                  <div className="w-52 h-52 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cricket-primary"></div>
                  </div>
                ) : qrCode ? (
                  <img 
                    src={qrCode} 
                    alt="Team QR Code" 
                    className="w-52 h-52 object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-gray-400">
                    <QrCode className="w-12 h-12" />
                  </div>
                )}
              </div>
              {qrCode && (
                <button
                  onClick={downloadQRCode}
                  className="mt-3 text-sm text-cricket-primary hover:text-cricket-secondary flex items-center justify-center gap-1 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              )}
            </div>

            {/* Sharing Options */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700">Share via</h5>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                
                <button
                  onClick={shareViaWebAPI}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">
                How to join:
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share the 6-character team code: <strong>{shortCode}</strong></li>
                <li>• Send the join link to teammates</li>
                <li>• Let them scan the QR code</li>
                <li>• Players can join instantly!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
