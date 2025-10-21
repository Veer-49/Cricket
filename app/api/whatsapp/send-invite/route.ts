import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppInvite, validateWhatsAppConfig } from '@/utils/whatsappService'
import { WhatsAppInvite } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invite }: { invite: WhatsAppInvite } = body

    // Validate required fields
    if (!invite || !invite.playerName || !invite.playerPhone || !invite.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate WhatsApp configuration
    const configValidation = validateWhatsAppConfig()
    if (!configValidation.valid) {
      console.warn('WhatsApp configuration issues:', configValidation.errors)
      // In development, we'll simulate the send
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'WhatsApp service not configured', details: configValidation.errors },
          { status: 500 }
        )
      }
    }

    // Send WhatsApp invite
    const result = await sendWhatsAppInvite(invite)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp invite sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending WhatsApp invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle WhatsApp webhook (for delivery status updates)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verify webhook (WhatsApp Business API requirement)
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Handle webhook events (delivery status, message responses)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process WhatsApp webhook events
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      const changes = body.entry[0].changes[0]
      
      if (changes.field === 'messages') {
        const messages = changes.value.messages || []
        const statuses = changes.value.statuses || []
        
        // Handle message status updates
        for (const status of statuses) {
          console.log('Message status update:', {
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp
          })
          
          // Update invite status in database
          // This would typically update your database with the delivery status
        }
        
        // Handle incoming messages (user responses)
        for (const message of messages) {
          console.log('Incoming message:', {
            from: message.from,
            text: message.text?.body,
            timestamp: message.timestamp
          })
          
          // Process user responses to invites
          // Could trigger automatic team joining if user confirms
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
