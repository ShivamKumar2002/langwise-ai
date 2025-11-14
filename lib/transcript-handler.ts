import { createTranscript } from './utils-db';

/**
 * DEPRECATED: This module is no longer actively used.
 * Transcript collection now uses the Agora History API (see app/api/agora/stop-agent/route.ts)
 * 
 * The History API is more reliable because:
 * - Webhooks are not officially supported for Conversational AI Engine
 * - History API captures complete conversations while agent is still running
 * - Backend controls the process end-to-end
 */

export interface AgoraTranscriptMessage {
  type: 'text' | 'audio';
  content: string;
  speaker: 'agent' | 'user';
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
  console.log('[v0] Processing Agora webhook (DEPRECATED):', payload.eventType);

  if (payload.transcript) {
    return payload.transcript;
  }

  if (payload.messages && Array.isArray(payload.messages)) {
    return payload.messages
      .map((msg) => {
        const speaker = msg.speaker === 'agent' ? 'Agent' : 'User';
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');
  }

  return '';
}

// Store raw transcript data for analysis
export function storeTranscriptData(
  userId: string,
  agentId: string,
  transcript: string
): string {
  const transcriptId = createTranscript(userId, transcript, agentId);
  console.log('[v0] Stored transcript:', transcriptId);
  return transcriptId;
}

// Retrieve transcript by session for analysis
export function getSessionTranscript(sessionId: string): string | null {
  return null;
}
