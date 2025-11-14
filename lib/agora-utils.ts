import { AGORA_CONFIG, OPENAI_CONFIG, AGENT_IDLE_TIMEOUT } from './constants';
import { AgoraAgentStartRequest, AgoraAgentResponse } from './types';
import crypto from 'crypto';

// Generate Base64 encoded auth header for Agora REST API
export function generateAgoraAuthHeader(): string {
  const credentials = `${AGORA_CONFIG.customerId}:${AGORA_CONFIG.customerSecret}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

// Start a conversational AI agent
export async function startAgoraAgent(
  channelName: string,
  token: string,
  systemPrompt: string,
  nativeLanguage: string,
  targetLanguage: string
): Promise<string> {
  const agentName = `lang-tutor-${Date.now()}`;
  
  const requestBody: AgoraAgentStartRequest = {
    name: agentName,
    properties: {
      channel: channelName,
      token: token,
      agent_rtc_uid: "0",
      remote_rtc_uids: ["*"],
      enable_string_uid: false,
      idle_timeout: AGENT_IDLE_TIMEOUT,
      mllm: {
        model: "openai-realtime",
        model_version: "2024-12-17",
        enable_turn_detection: true,
        voice: "alloy",
        system_message: systemPrompt,
      },
    },
  };

  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${AGORA_CONFIG.appId}/join`;
  const authHeader = generateAgoraAuthHeader();

  console.log('[v0] Starting Agora agent with payload:', requestBody);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[v0] Agora API error:', error);
    throw new Error(`Failed to start Agora agent: ${error}`);
  }

  const data: AgoraAgentResponse = await response.json();
  console.log('[v0] Agora agent started:', data.agent_id);
  
  return data.agent_id;
}

// Stop a conversational AI agent
export async function stopAgoraAgent(agentId: string): Promise<void> {
  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${AGORA_CONFIG.appId}/agents/${agentId}/leave`;
  const authHeader = generateAgoraAuthHeader();

  console.log('[v0] Stopping Agora agent:', agentId);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[v0] Agora stop error:', error);
    throw new Error(`Failed to stop Agora agent: ${error}`);
  }

  console.log('[v0] Agora agent stopped:', agentId);
}

// Generate system prompt for the language tutor agent
export function generateTutorSystemPrompt(
  nativeLanguage: string,
  targetLanguage: string,
  goal: string,
  userBio: string
): string {
  return `You are an expert language tutor specializing in ${targetLanguage}. 
Your student is a native ${nativeLanguage} speaker with the following goal: "${goal}". 
User background: ${userBio}

Your role is to:
1. Conduct a natural 3-minute assessment conversation in ${targetLanguage}
2. Evaluate the student's grammar, vocabulary, fluency, pronunciation, and listening skills
3. Engage in natural dialogue covering various topics related to their learning goal
4. Provide gentle corrections and encouragement
5. Use clear, appropriate language for their level

Assessment focus areas:
- Grammar accuracy and complexity
- Vocabulary range and appropriateness
- Fluency and spontaneity
- Pronunciation clarity
- Listening comprehension
- Confidence and communication strategies

Keep the conversation natural and engaging. Start with an introduction and gradually increase complexity. End by summarizing key observations.`;
}

// Configure webhook for agent
export async function configureAgentWebhook(
  agentId: string,
  webhookUrl: string
): Promise<void> {
  console.warn('[v0] configureAgentWebhook is deprecated - using History API instead');
  // No-op function for backwards compatibility
}

export async function getAgentHistory(agentId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${AGORA_CONFIG.appId}/agents/${agentId}/history`;
  const authHeader = generateAgoraAuthHeader();

  console.log('[v0] Fetching agent history for agent:', agentId);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[v0] Failed to retrieve history:', error);
    throw new Error(`Failed to retrieve agent history: ${error}`);
  }

  const data = await response.json();
  console.log('[v0] Retrieved history with', data.contents?.length || 0, 'messages');
  
  return data.contents || [];
}
