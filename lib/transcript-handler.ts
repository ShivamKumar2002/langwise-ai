import { createTranscript } from './utils-db';

export interface AgoraTranscriptMessage {
  type: 'text' | 'audio';
  content: string;
  speaker: 'agent' | 'user'; // From the audio source
  timestamp: number;
}

export interface AgoraWebhookPayload {
  eventType: string;
  agentId: string;
  channelName: string;
  uid: number;
  messages?: AgoraTranscriptMessage[];
  transcript?: string;
  timestamp: number;
}

// Process incoming webhook from Agora with transcript data
export function processAgoraWebhook(payload: AgoraWebhookPayload): string {
  console.log('[v0] Processing Agora webhook:', payload.eventType);

  // Extract transcript from webhook payload
  if (payload.transcript) {
    return payload.transcript;
  }

  // Alternative: Build transcript from message events
  if (payload.messages && Array.isArray(payload.messages)) {
    return payload.messages
      .map((msg) => {
        const speaker = msg.speaker === 'agent' ? 'Agent' : 'User';
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');
  }

  // Fallback: Empty transcript if no data available
  return '';
}

// Store raw transcript data for analysis
export function storeTranscriptData(
  userId: string,
  agentId: string,
  transcript: string
): string {
  // Create transcript record in database
  const transcriptId = createTranscript(userId, transcript, agentId);
  console.log('[v0] Stored transcript:', transcriptId);
  return transcriptId;
}

// Retrieve transcript by session for analysis
export function getSessionTranscript(sessionId: string): string | null {
  // This would query the database for transcript associated with session
  // For now, we'll store it during the webhook processing
  return null;
}
