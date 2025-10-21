import { WhatsAppInvite } from '@/types'

// WhatsApp Business API configuration
const WHATSAPP_CONFIG = {
  // Replace with your actual WhatsApp Business API credentials
  phoneNumberId: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id',
  accessToken: process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || 'your_access_token',
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com'
}

// Twilio configuration (alternative)
const TWILIO_CONFIG = {
  accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || 'your_account_sid',
  authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || 'your_auth_token',
  whatsappNumber: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
}

export interface WhatsAppMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Format phone number for WhatsApp (remove spaces, add country code if needed)
export const formatPhoneNumber = (phone: string): string => {
  let formatted = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '')
  
  // Add +91 if no country code (assuming India)
  if (!formatted.startsWith('+')) {
    if (formatted.startsWith('91')) {
      formatted = '+' + formatted
    } else if (formatted.length === 10) {
      formatted = '+91' + formatted
    }
  }
  
  return formatted
}

// Send WhatsApp message using WhatsApp Business API
export const sendWhatsAppMessageViaBusinessAPI = async (
  invite: WhatsAppInvite
): Promise<WhatsAppMessageResponse> => {
  try {
    const formattedPhone = formatPhoneNumber(invite.playerPhone)
    
    const messageData = {
      messaging_product: 'whatsapp',
      to: formattedPhone.replace('+', ''),
      type: 'text',
      text: {
        body: invite.message
      }
    }

    const response = await fetch(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      }
    )

    const result = await response.json()

    if (response.ok && result.messages?.[0]?.id) {
      return {
        success: true,
        messageId: result.messages[0].id
      }
    } else {
      return {
        success: false,
        error: result.error?.message || 'Failed to send message'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Send WhatsApp message using Twilio
export const sendWhatsAppMessageViaTwilio = async (
  invite: WhatsAppInvite
): Promise<WhatsAppMessageResponse> => {
  try {
    const formattedPhone = formatPhoneNumber(invite.playerPhone)
    
    const messageData = {
      From: TWILIO_CONFIG.whatsappNumber,
      To: `whatsapp:${formattedPhone}`,
      Body: invite.message
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(messageData)
      }
    )

    const result = await response.json()

    if (response.ok && result.sid) {
      return {
        success: true,
        messageId: result.sid
      }
    } else {
      return {
        success: false,
        error: result.message || 'Failed to send message'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Main function to send WhatsApp invite
export const sendWhatsAppInvite = async (
  invite: WhatsAppInvite,
  provider: 'whatsapp-business' | 'twilio' = 'whatsapp-business'
): Promise<WhatsAppMessageResponse> => {
  console.log(`Sending WhatsApp invite to ${invite.playerName} (${invite.playerPhone})`)
  
  // In development, simulate the API call
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Simulated WhatsApp message:', {
          to: invite.playerPhone,
          message: invite.message
        })
        resolve({
          success: true,
          messageId: `sim_${Date.now()}`
        })
      }, 1000)
    })
  }

  // Choose provider
  if (provider === 'twilio') {
    return sendWhatsAppMessageViaTwilio(invite)
  } else {
    return sendWhatsAppMessageViaBusinessAPI(invite)
  }
}

// Generate signup link with team and player context
export const generateSignupLink = (teamId: string, playerId: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'
  return `${baseUrl}/signup?teamId=${teamId}&playerId=${playerId}&source=whatsapp`
}

// Create WhatsApp message template
export const createInviteMessage = (
  playerName: string,
  teamName: string,
  teamId: string,
  signupLink: string
): string => {
  return `Hi ${playerName},

🏏 You have been selected to play for *${teamName}*!

To join your team officially:
1️⃣ Sign up using this link: ${signupLink}
2️⃣ Or use Team ID: *${teamId}*

Welcome to the team! 🎉

Best regards,
Cricket Team Management`
}

// Validate WhatsApp configuration
export const validateWhatsAppConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!WHATSAPP_CONFIG.phoneNumberId || WHATSAPP_CONFIG.phoneNumberId === 'your_phone_number_id') {
    errors.push('WhatsApp Phone Number ID not configured')
  }
  
  if (!WHATSAPP_CONFIG.accessToken || WHATSAPP_CONFIG.accessToken === 'your_access_token') {
    errors.push('WhatsApp Access Token not configured')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Get delivery status (webhook handler would update this)
export const getMessageDeliveryStatus = async (messageId: string): Promise<{
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: Date
}> => {
  // This would typically query your database or WhatsApp API
  // For now, return a mock status
  return {
    status: 'delivered',
    timestamp: new Date()
  }
}
