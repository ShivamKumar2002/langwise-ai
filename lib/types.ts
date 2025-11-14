// User and auth types
export interface User {
  id: string;
  userId: string;
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
  goal: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  id: string;
  userId: string;
  content: string;
  agentId: string;
  createdAt: string;
}

export interface SkillLevel {
  category: string;
  level: number; // 0-100
  trend: "improving" | "stable" | "declining";
}

export interface LearningUnit {
  id: string;
  title: string;
  description: string;
  type: "grammar" | "vocabulary" | "conversation" | "pronunciation";
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  estimatedMinutes: number;
}

export interface PersonalizedPlan {
  userId: string;
  skills: SkillLevel[];
  currentLevel: string;
  nextLevel: string;
  learningUnits: LearningUnit[];
  coachingTips: string[];
  weakAreas: string[];
  strengths: string[];
  generatedAt: string;
}

export interface AssessmentSession {
  id: string;
  userId: string;
  agentId: string;
  transcript: string;
  startedAt: string;
  endedAt?: string;
  status: "active" | "completed";
}

// Agora types
export interface AgoraAgentStartRequest {
  name: string;
  properties: {
    channel: string;
    token: string;
    agent_rtc_uid: string;
    remote_rtc_uids: string[];
    enable_string_uid: boolean;
    idle_timeout: number;
    advanced_features: {
      enable_mllm: boolean;
    };
    mllm: {
      url: string;
      api_key: string;
      vendor: "openai";
      style: "openai";
      input_modalities: Array<"audio" | "text">;
      output_modalities: Array<"audio" | "text">;
      max_history: number;
      greeting_message: string;
      params: {
        model: string;
        voice: string;
        instructions: string;
        input_audio_transcription: {
          language?: string;
          model: string;
          prompt?: string;
        };
      };
    };
  };
}

export interface AgoraAgentResponse {
  agent_id: string;
  create_ts: number;
  status: string;
}
