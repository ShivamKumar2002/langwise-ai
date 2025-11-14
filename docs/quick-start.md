## Quick Start

This app is a voice-based language assessment MVP built with **Next.js**, **Supabase**, **Agora Conversational AI**, and **OpenAI Realtime**.  
It is designed to run on **Vercel**, with the **Vercel × Supabase integration** providing the managed Postgres database and core environment variables.

### 1. Prerequisites

- **Node.js** and **pnpm** installed locally
- **Vercel account**
- **Supabase integration** added to your Vercel project (creates the Supabase project and sets env vars)
- **Agora account** with access to Conversational AI
- **OpenAI key** with access to the realtime and analysis models you want to use

If you are starting from scratch, the easiest path is to deploy this repo on Vercel first and attach the Supabase integration there, then bring the environment variables back to your local `.env.local` for development.

### 2. One‑time setup on Vercel (recommended)

1. **Create / import the project on Vercel**

   - Import this Git repository into Vercel.
   - Leave the default build and output settings for a Next.js app.

2. **Add the Supabase integration**

   - In your Vercel project dashboard, go to **Integrations → Supabase**.
   - Install / connect Supabase to this project.
   - This will create a Supabase project (if you don’t have one) and automatically inject:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Add Agora and OpenAI environment variables**

   - In Vercel project settings → **Environment Variables**, add:
     - `AGORA_APP_ID`
     - `AGORA_APP_CERTIFICATE`
     - `AGORA_CUSTOMER_ID`
     - `AGORA_CUSTOMER_SECRET`
     - `NEXT_PUBLIC_AGORA_APP_ID` (for the client-side SDK)
     - `OPENAI_REALTIME_URL` (e.g. `wss://api.openai.com/v1/realtime`)
     - `OPENAI_REALTIME_API_KEY`
     - `OPENAI_REALTIME_MODEL` (e.g. `gpt-realtime`)
     - `OPENAI_REALTIME_VOICE` (e.g. `coral`)
     - `ANALYSIS_MODEL` (e.g. `openai/gpt-5-mini` via Vercel AI Gateway)

4. **Deploy once**
   - Trigger a deployment from the Vercel UI or by pushing to your main branch.

### 3. Run the Supabase migration

The database schema lives in `supabase/migrations/001_initial_schema.sql`.

1. Open your Supabase project created by the Vercel integration.
2. Go to **SQL Editor**.
3. Create a **New Query**.
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from this repo.
5. Paste it into the SQL editor and click **Run**.
6. You should see a success message and the tables such as `users`, `transcripts`, `personalized_plans`, and `assessment_sessions` appear in the Table Editor.

If you skip this step, you will see runtime errors like “Could not find the table `public.users`” from the API routes that touch the database.

### 4. Local development

1. **Create `.env.local` in the repo root**

   - Copy the Supabase variables from Vercel or Supabase:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Copy your Agora and OpenAI variables from Vercel as well:
     - `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET`
     - `NEXT_PUBLIC_AGORA_APP_ID`
     - `OPENAI_REALTIME_URL`, `OPENAI_REALTIME_API_KEY`, `OPENAI_REALTIME_MODEL`, `OPENAI_REALTIME_VOICE`
     - `ANALYSIS_MODEL`

2. **Install dependencies**

```bash
pnpm install
```

3. **Run the dev server**

```bash
pnpm dev
```

4. **Open the app**
   - Visit `http://localhost:3000` in your browser.

### 5. First‑time user flow

1. Sign up with email and password (Supabase email auth).
2. Complete the onboarding flow (select native/target language, goal, etc.).
3. Start an assessment:
   - The app uses Agora to start a realtime voice session with the AI tutor.
   - The conversation transcript is stored in Supabase.
4. When the assessment finishes, the transcript is analyzed via the `ANALYSIS_MODEL` (through the Vercel AI SDK), and a personalized learning plan is saved in Supabase.
5. View your plan and progress on the dashboard.

### 6. Troubleshooting

- **“Could not find the table `public.users`”**
  - The Supabase migration has not been run. Re-run the SQL from `supabase/migrations/001_initial_schema.sql`.
- **“Missing Supabase environment variables”**
  - Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set in both Vercel and `.env.local`.
- **Agora connection / token errors**
  - Check that all `AGORA_*` env vars and `NEXT_PUBLIC_AGORA_APP_ID` are set.
- **OpenAI realtime errors**
  - Verify `OPENAI_REALTIME_URL`, `OPENAI_REALTIME_API_KEY`, `OPENAI_REALTIME_MODEL`, and `OPENAI_REALTIME_VOICE`.

### 7. Where to go next

- See `supabase-setup.md` for more detail on the database and auth model.
- See `agora-setup.md` for Agora configuration specifics.
