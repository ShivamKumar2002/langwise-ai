# Agora Conversational AI Setup Guide

## Prerequisites

This project uses Agora's Conversational AI Engine with OpenAI Realtime MLLM for voice-based language assessment.

## Getting Agora Credentials

1. **Create Agora Account**
   - Go to https://console.agora.io
   - Sign up or log in
   - Create a new project

2. **Get App ID & Certificate**
   - Navigate to "Projects" → Your Project
   - Copy the **App ID**
   - Enable "App Certificate" and copy it

3. **Get Customer ID & Secret**
   - Go to "Account" → "Security"
   - Under "API Authorization", find your credentials
   - Copy **Customer ID** and **Customer Secret**

## Configuration

1. **Copy environment template:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Fill in your credentials:**
   \`\`\`
   AGORA_APP_ID=your_actual_app_id
   AGORA_APP_CERTIFICATE=your_actual_certificate
   AGORA_CUSTOMER_ID=your_actual_customer_id
   AGORA_CUSTOMER_SECRET=your_actual_secret
   \`\`\`

3. **Verify configuration:**
   - The app will validate all required environment variables on startup
   - Check console for any missing credentials warnings

## Token Generation

- **RTC Tokens**: Generated server-side using `agora-access-token` package
- **Expiration**: 24 hours (configurable)
- **Security**: Tokens are generated per-channel and per-user

## Transcript Delivery

There are two ways to receive transcripts:

### Option 1: Webhook (Recommended)
- Configure webhook URL in Agora Console: `https://yourdomain.com/api/agora/webhook`
- Transcripts are delivered in real-time as JSON events
- Set up webhook signing for security with `AGORA_WEBHOOK_SECRET`

### Option 2: Polling
- Query Agora API for transcript storage
- Requires additional implementation
- Less real-time but no webhook infrastructure needed

## Testing

1. **Create a test account:**
   - Sign up with email and password on the login page
   - Complete the onboarding flow
   - Start an assessment to test the flow

2. **Verify token generation:**
   - Tokens should be valid RTC tokens (not mock)
   - Check server logs: `Generated real Agora RTC token`

3. **Monitor webhook (if configured):**
   - Server logs will show: `Received Agora webhook event`
   - Transcripts should be stored automatically

## Production Deployment

1. Add environment variables to your Vercel project
2. Configure webhook URL to your production domain
3. Enable webhook signature verification with `AGORA_WEBHOOK_SECRET`
4. Monitor API usage in Agora Console
5. Set up error handling and retry logic for failed requests
