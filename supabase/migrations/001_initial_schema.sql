-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users with profile data)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_language TEXT NOT NULL DEFAULT 'English',
  target_language TEXT NOT NULL DEFAULT 'Spanish',
  goal TEXT NOT NULL DEFAULT '',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skill levels table
CREATE TABLE IF NOT EXISTS public.skill_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
  trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personalized plans table
CREATE TABLE IF NOT EXISTS public.personalized_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  skills JSONB NOT NULL,
  current_level TEXT NOT NULL,
  next_level TEXT NOT NULL,
  learning_units JSONB NOT NULL,
  coaching_tips JSONB NOT NULL,
  weak_areas JSONB NOT NULL,
  strengths JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessment sessions table
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  transcript TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for transcripts table
CREATE POLICY "Users can view their own transcripts"
  ON public.transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = transcripts.user_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own transcripts"
  ON public.transcripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = transcripts.user_id
      AND users.id = auth.uid()
    )
  );

-- RLS Policies for skill_levels table
CREATE POLICY "Users can view their own skill levels"
  ON public.skill_levels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = skill_levels.user_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own skill levels"
  ON public.skill_levels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = skill_levels.user_id
      AND users.id = auth.uid()
    )
  );

-- RLS Policies for personalized_plans table
CREATE POLICY "Users can view their own plans"
  ON public.personalized_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = personalized_plans.user_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own plans"
  ON public.personalized_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = personalized_plans.user_id
      AND users.id = auth.uid()
    )
  );

-- RLS Policies for assessment_sessions table
CREATE POLICY "Users can view their own assessment sessions"
  ON public.assessment_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = assessment_sessions.user_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own assessment sessions"
  ON public.assessment_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = assessment_sessions.user_id
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessment sessions"
  ON public.assessment_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = assessment_sessions.user_id
      AND users.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON public.transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_levels_user_id ON public.skill_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_plans_user_id ON public.personalized_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON public.assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_plans_generated_at ON public.personalized_plans(user_id, generated_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

