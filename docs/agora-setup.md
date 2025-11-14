## Agora Setup

This project uses **Agora Conversational AI** plus the browser **Agora RTC SDK** to power the realtime voice assessment.

There are two main pieces:

- **RTC tokens** for joining the voice channel.
- **Conversational AI agent** that connects to OpenAI Realtime and produces the transcript.

### 1. Prerequisites

- Agora account at `https://console.agora.io`
- Access to the **Conversational AI Agent** APIs

From the Agora console you will need:

- **App ID**
- **App Certificate**
- **Customer ID**
- **Customer Secret**

### 2. Environment variables

The app expects the following Agora environment variables:

- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `AGORA_CUSTOMER_ID`
- `AGORA_CUSTOMER_SECRET`
- `NEXT_PUBLIC_AGORA_APP_ID` (used client-side by the assessment page)

Set these in:

- **Vercel → Project Settings → Environment Variables**, and
- Your local `.env.local` for development.

### 3. RTC token generation

RTC tokens are created server‑side in `app/api/agora/generate-token/route.ts` using the `agora-access-token` package:

- The client calls `/api/agora/generate-token` with a channel name and uid.
- The route:
  - Reads `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`.
  - Builds an RTC token with a 24‑hour expiry.
  - Returns the token to the browser.

The assessment UI passes `process.env.NEXT_PUBLIC_AGORA_APP_ID` into the `AgoraManager` component along with this token to connect to the voice channel.

### 4. Conversational AI agent

The server uses the Agora Conversational AI REST API from `lib/agora-utils.ts`:

- `startAgoraAgent`:
  - Called when an assessment begins.
  - Starts an Agora conversational AI agent for the given channel.
  - Connects the agent to **OpenAI Realtime** via `OPENAI_REALTIME_*` env vars.
- `stopAgoraAgent`:
  - Called when the assessment ends or times out.
  - Cleans up the agent.
- `getAgentHistory`:
  - Fetches the conversation history / transcript for the agent.

Authentication to Agora’s REST API uses **Basic auth** constructed from:

- `AGORA_CUSTOMER_ID`
- `AGORA_CUSTOMER_SECRET`

### 5. Transcript and analysis flow

At a high level:

1. User starts an assessment.
2. The app:
   - Requests an RTC token from `/api/agora/generate-token`.
   - Starts an Agora conversational AI agent via `startAgoraAgent`.
3. The user speaks with the agent over voice.
4. When the call ends, the app fetches the final transcript and stores it in Supabase (`assessment_sessions` and `transcripts` tables).
5. The `/api/analyze-transcript` route:
   - Loads the transcript and user profile from Supabase.
   - Calls the analysis model (`ANALYSIS_MODEL`) via the Vercel AI SDK.
   - Saves a personalized learning plan back into Supabase.

There is **no webhook endpoint** in this codebase for Agora transcripts; everything is handled via REST polling and Supabase persistence.

### 6. Checklist

- [ ] `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET` are set.
- [ ] `NEXT_PUBLIC_AGORA_APP_ID` matches `AGORA_APP_ID`.
- [ ] OpenAI Realtime environment variables (`OPENAI_REALTIME_*`) are set so the agent can use the model and voice you want.
- [ ] You can start an assessment and see console logs like “Generated real Agora RTC token” and “Agora agent started”.
