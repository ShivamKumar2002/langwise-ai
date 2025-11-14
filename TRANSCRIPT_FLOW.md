# Agora Transcript Flow Implementation

## Overview

The LangWiseAI app uses the **Agora History API** to capture conversation transcripts. This approach:
- ✅ Retrieves complete conversation before session ends
- ✅ No real-time transcript display (keeps focus on agent)
- ✅ Backend-controlled termination ensures no data loss
- ✅ Works with OpenAI Realtime MLLM

## Flow

\`\`\`
1. User starts assessment
   └─> Frontend calls /api/agora/start-agent
       └─> Backend creates session, starts Agora agent
           └─> Returns agentId, sessionId, tokens to frontend

2. User converses with agent for 3 minutes
   └─> Real-time conversation happens via WebRTC

3. Timer expires (3 minutes)
   └─> Frontend calls /api/agora/stop-agent with agentId + sessionId

4. Backend stops agent and retrieves history
   └─> GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/history
       └─> Basic Auth with App ID:Certificate
           └─> Returns { contents: [{ role, content }, ...] }

5. Transcript stored in database
   └─> Assessment session marked "completed"
       └─> Async analysis triggered

6. Gemini analyzes transcript + user profile
   └─> Generates personalized learning plan
       └─> Stored in database

7. Frontend fetches plan and displays dashboard
\`\`\`

## API Endpoints

### Start Agent
**POST** `/api/agora/start-agent`

Request:
\`\`\`json
{
  "userId": "user_123",
  "nativeLanguage": "English",
  "targetLanguage": "Spanish",
  "learningGoal": "Business conversation"
}
\`\`\`

Response:
\`\`\`json
{
  "sessionId": "session_123456",
  "agentId": "agent_uuid",
  "channelName": "assessment_user_123_1699123456",
  "userToken": "token_...",
  "userUid": 12345,
  "agentUid": 999
}
\`\`\`

### Stop Agent (Retrieves History + Stores Transcript)
**POST** `/api/agora/stop-agent`

Request:
\`\`\`json
{
  "sessionId": "session_123456",
  "agentId": "agent_uuid"
}
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "sessionId": "session_123456",
  "agentId": "agent_uuid",
  "messagesCount": 12
}
\`\`\`

Internally:
1. Fetches history via Agora History API
2. Formats transcript from contents array
3. Stores in database
4. Stops agent via Agora leave endpoint
5. Triggers analysis

### Analyze Transcript
**POST** `/api/analyze-transcript`

Request:
\`\`\`json
{
  "sessionId": "session_123456"
}
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "sessionId": "session_123456",
  "plan": {
    "currentLevel": "B1",
    "targetLevel": "B2",
    "skills": [...],
    "learningUnits": [...]
  }
}
\`\`\`

## Environment Variables Required

\`\`\`
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_app_certificate
NEXT_PUBLIC_AGORA_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key
\`\`\`

## Error Handling

- If History API fails: Return error, don't stop agent yet (retry logic)
- If agent stop fails: Log error, continue (history was captured)
- If analysis fails: Session marked completed but plan empty (user can retry)

## Database Schema

\`\`\`sql
CREATE TABLE assessment_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  channel_name TEXT,
  status TEXT, -- 'started', 'completed', 'analyzed'
  transcript TEXT, -- Retrieved via History API
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE personalized_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  plan_data JSON, -- Gemini response
  created_at TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES assessment_sessions(id)
);
