// Agora configuration
export const AGORA_CONFIG = {
  appId: process.env.AGORA_APP_ID || "",
  customerId: process.env.AGORA_CUSTOMER_ID || "",
  customerSecret: process.env.AGORA_CUSTOMER_SECRET || "",
};

export const OPENAI_REALTIME_CONFIG = {
  url: process.env.OPENAI_REALTIME_URL || "wss://api.openai.com/v1/realtime",
  apiKey: process.env.OPENAI_REALTIME_API_KEY || "",
  model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime",
  voice: process.env.OPENAI_REALTIME_VOICE || "coral",
};

export const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL || "openai/gpt-5-mini";

// Language settings
export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const SUPPORTED_LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "Mandarin",
  "French",
  "German",
  "Japanese",
  "Portuguese",
];

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
    errors.push("AGORA_APP_ID is not configured");
  }
  if (!AGORA_CONFIG.customerId) {
    errors.push("AGORA_CUSTOMER_ID is not configured");
  }
  if (!AGORA_CONFIG.customerSecret) {
    errors.push("AGORA_CUSTOMER_SECRET is not configured");
  }
  if (!process.env.AGORA_APP_CERTIFICATE) {
    errors.push("AGORA_APP_CERTIFICATE is not configured");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Call this during app initialization
if (typeof window === "undefined") {
  // Server-side only
  const validation = validateAgoraConfig();
  if (!validation.valid) {
    console.warn("[v0] Configuration warnings:", validation.errors);
  }
}
