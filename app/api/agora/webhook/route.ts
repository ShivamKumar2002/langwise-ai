import { NextRequest, NextResponse } from 'next/server';
import { processAgoraWebhook, storeTranscriptData } from '@/lib/transcript-handler';
import { completeAssessmentSession } from '@/lib/utils-db';
import crypto from 'crypto';

// Verify Agora webhook signature for security
function verifyWebhookSignature(
  request: NextRequest,
  payload: string
): boolean {
  const signature = request.headers.get('x-agora-signature');
  const timestamp = request.headers.get('x-agora-timestamp');

  if (!signature || !timestamp) {
    console.warn('[v0] Missing webhook signature headers');
    return false;
  }

  // If you have a webhook secret, verify it
  const webhookSecret = process.env.AGORA_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signString = `${payload}${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signString)
      .digest('hex');

    return signature === expectedSignature;
  }

  // For demo, accept all webhooks if no secret is configured
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook authenticity
    const rawBody = await request.text();
    if (!verifyWebhookSignature(request, rawBody)) {
      console.warn('[v0] Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[v0] Received Agora webhook event:', payload.eventType);

    // Handle different webhook event types
    if (payload.eventType === 'agent_text_message') {
      // Process transcript message
      const transcript = processAgoraWebhook(payload);
      console.log('[v0] Extracted transcript from webhook');

      // Extract userId from payload (you may need to adapt this based on Agora's actual format)
      const userId = payload.userId || payload.customPayload?.userId;
      const agentId = payload.agentId;
      const sessionId = payload.sessionId || payload.customPayload?.sessionId;

      if (userId && agentId) {
        // Store transcript for this session
        storeTranscriptData(userId, agentId, transcript);

        // Mark assessment session as complete
        if (sessionId) {
          completeAssessmentSession(sessionId, transcript);
          console.log('[v0] Assessment session completed:', sessionId);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook processed',
      });
    }

    if (payload.eventType === 'agent_disconnect') {
      console.log('[v0] Agent disconnected:', payload.agentId);
      return NextResponse.json({ success: true });
    }

    // Unknown event type
    return NextResponse.json({
      success: true,
      message: 'Event acknowledged',
    });
  } catch (error) {
    console.error('[v0] Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
