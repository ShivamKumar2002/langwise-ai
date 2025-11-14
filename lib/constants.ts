// Test user accounts
export const TEST_ACCOUNTS = [
  { userId: "test_user_1", authCode: "secret123", name: "Alice Chen" },
  { userId: "test_user_2", authCode: "secret456", name: "Bob Martinez" },
  { userId: "test_user_3", authCode: "secret789", name: "Carol Singh" },
];

// Agora configuration
export const AGORA_CONFIG = {
  appId: process.env.AGORA_APP_ID || "",
  customerId: process.env.AGORA_CUSTOMER_ID || "",
  customerSecret: process.env.AGORA_CUSTOMER_SECRET || "",
};

// Gemini configuration
export const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: "gemini-2.5-pro",
};

// OpenAI Realtime for Agora MLLM
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4o-realtime-preview",
};

// Language settings
export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const SKILL_CATEGORIES = [
  "Grammar",
  "Vocabulary",
  "Fluency",
  "Pronunciation",
  "Listening",
  "Confidence",
];

// Call configuration
export const CALL_DURATION_MS = 3 * 60 * 1000; // 3 minutes
export const AGENT_IDLE_TIMEOUT = 120; // 120 seconds

export function validateAgoraConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!AGORA_CONFIG.appId) {
    errors.push('AGORA_APP_ID is not configured');
  }
  if (!AGORA_CONFIG.customerId) {
    errors.push('AGORA_CUSTOMER_ID is not configured');
  }
  if (!AGORA_CONFIG.customerSecret) {
    errors.push('AGORA_CUSTOMER_SECRET is not configured');
  }
  if (!process.env.AGORA_APP_CERTIFICATE) {
    errors.push('AGORA_APP_CERTIFICATE is not configured');
  }
  if (!GEMINI_CONFIG.apiKey) {
    errors.push('GEMINI_API_KEY is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Call this during app initialization
if (typeof window === 'undefined') {
  // Server-side only
  const validation = validateAgoraConfig();
  if (!validation.valid) {
    console.warn('[v0] Configuration warnings:', validation.errors);
  }
}
