# WhatsApp Integration Setup Guide

This guide explains how to set up WhatsApp invites for cricket team creation.

## Overview

The WhatsApp integration allows team captains to:
1. Create teams with player details (name + phone number)
2. Automatically check if players are already registered
3. Send WhatsApp invites to unregistered players
4. Include team ID and signup link in messages

## Setup Options

### Option 1: WhatsApp Business API (Recommended)

#### Prerequisites
- WhatsApp Business Account
- Facebook Developer Account
- Verified Business Phone Number

#### Steps
1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app with WhatsApp Business API
   - Add WhatsApp product to your app

2. **Get Credentials**
   - Phone Number ID: From WhatsApp > API Setup
   - Access Token: From App Settings > Basic
   - Webhook Verify Token: Create your own secure token

3. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN=your_access_token
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
   ```

4. **Set up Webhook**
   - Webhook URL: `https://your-domain.com/api/whatsapp/send-invite`
   - Verify Token: Use the same token from step 2
   - Subscribe to: `messages` field

### Option 2: Twilio WhatsApp API

#### Prerequisites
- Twilio Account
- Twilio WhatsApp Sandbox (for testing) or Approved WhatsApp Business Account

#### Steps
1. **Get Twilio Credentials**
   - Account SID: From Twilio Console
   - Auth Token: From Twilio Console
   - WhatsApp Number: From WhatsApp Sandbox or your approved number

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_account_sid
   NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_auth_token
   NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

## Message Template

The system sends the following message format:

```
Hi [Player Name],

🏏 You have been selected to play for *[Team Name]*!

To join your team officially:
1️⃣ Sign up using this link: [Signup Link]
2️⃣ Or use Team ID: *[Team ID]*

Welcome to the team! 🎉

Best regards,
Cricket Team Management
```

## Development Mode

In development mode (`NODE_ENV=development`), the system will:
- Simulate WhatsApp API calls
- Log messages to console
- Return success responses without actually sending messages

## Database Schema

The integration uses the following data structures:

### Players Table
```typescript
interface Player {
  id: string
  name: string
  phone: string
  userId?: string // Links to User when they register
  createdAt: Date
  inviteStatus: 'pending' | 'registered' | 'declined'
}
```

### WhatsApp Invites Table
```typescript
interface WhatsAppInvite {
  id: string
  teamId: string
  playerId: string
  playerName: string
  playerPhone: string
  message: string
  sentAt: Date
  status: 'sent' | 'delivered' | 'failed' | 'responded'
  signupLink: string
}
```

### Team Player Mapping
```typescript
interface TeamPlayerMap {
  teamId: string
  playerId: string
  role: PlayerRole
  battingOrder?: number
  bowlingType?: BowlingType
  joinedAt: Date
}
```

## API Endpoints

### Send Invite
- **POST** `/api/whatsapp/send-invite`
- Sends WhatsApp invite to a player
- Body: `{ invite: WhatsAppInvite }`

### Webhook Handler
- **GET** `/api/whatsapp/send-invite` - Webhook verification
- **PATCH** `/api/whatsapp/send-invite` - Webhook events

## Phone Number Formatting

The system automatically formats phone numbers:
- Removes spaces and special characters
- Adds country code (+91 for India) if missing
- Validates format before sending

## Error Handling

The system handles various error scenarios:
- Invalid phone numbers
- WhatsApp API failures
- Network timeouts
- Configuration issues

## Security Considerations

1. **Environment Variables**: Store all credentials in environment variables
2. **Webhook Verification**: Verify webhook tokens to prevent unauthorized access
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Phone Validation**: Validate phone numbers before sending
5. **User Consent**: Ensure users consent to receiving WhatsApp messages

## Testing

### Test with WhatsApp Business API Sandbox
1. Use test phone numbers provided by Facebook
2. Send test messages to verify integration
3. Check webhook delivery status

### Test with Twilio Sandbox
1. Join Twilio WhatsApp Sandbox with your phone
2. Send test messages using sandbox number
3. Verify message delivery and formatting

## Production Deployment

### WhatsApp Business API
1. Complete business verification with Facebook
2. Get production access token
3. Set up production webhook URL
4. Configure proper rate limits

### Twilio Production
1. Apply for WhatsApp Business Account approval
2. Get your business phone number approved
3. Update environment variables with production credentials

## Monitoring and Analytics

Track the following metrics:
- Invite send success rate
- Message delivery rate
- User signup conversion rate
- Team join completion rate

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check access token and permissions
2. **Invalid Phone Number**: Verify phone number format
3. **Webhook Not Receiving**: Check URL and verify token
4. **Rate Limit Exceeded**: Implement proper rate limiting

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=whatsapp:*
```

## Support

For issues with:
- WhatsApp Business API: [Facebook Developer Support](https://developers.facebook.com/support/)
- Twilio: [Twilio Support](https://support.twilio.com/)
- Integration: Check console logs and API responses
