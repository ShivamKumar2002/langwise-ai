import { createSupabaseServerClient } from "./supabase/server";
import type {
  User,
  PersonalizedPlan,
  SkillLevel,
  Transcript,
  AssessmentSession,
} from "./types";

// User operations
export async function createUser(
  user: Omit<User, "id" | "createdAt" | "updatedAt">,
  authUserId?: string
): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const insertData: any = {
    user_id: user.userId,
    name: user.name,
    native_language: user.nativeLanguage,
    target_language: user.targetLanguage,
    goal: user.goal,
    bio: user.bio,
    created_at: now,
    updated_at: now,
  };

  // If authUserId is provided, use it as the id (must match auth.users.id)
  if (authUserId) {
    insertData.id = authUserId;
  }

  const { data, error } = await supabase
    .from("users")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Check if table doesn't exist (migration not run)
    if (
      error.message?.includes("Could not find the table") ||
      error.message?.includes("relation") ||
      error.code === "42P01"
    ) {
      throw new Error(
        `Database table not found. Please run the Supabase migration from supabase/migrations/001_initial_schema.sql in your Supabase dashboard. Error: ${error.message}`
      );
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    nativeLanguage: data.native_language,
    targetLanguage: data.target_language,
    goal: data.goal,
    bio: data.bio,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getUserByUserId(userId: string): Promise<User | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    // Check if table doesn't exist (migration not run)
    if (
      error.message?.includes("Could not find the table") ||
      error.message?.includes("relation") ||
      error.code === "42P01"
    ) {
      throw new Error(
        `Database table not found. Please run the Supabase migration from supabase/migrations/001_initial_schema.sql in your Supabase dashboard. Error: ${error.message}`
      );
    }
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    nativeLanguage: data.native_language,
    targetLanguage: data.target_language,
    goal: data.goal,
    bio: data.bio,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    nativeLanguage: data.native_language,
    targetLanguage: data.target_language,
    goal: data.goal,
    bio: data.bio,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getUserByUserId(userId);
  if (!user) return null;

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.nativeLanguage !== undefined)
    updateData.native_language = updates.nativeLanguage;
  if (updates.targetLanguage !== undefined)
    updateData.target_language = updates.targetLanguage;
  if (updates.goal !== undefined) updateData.goal = updates.goal;
  if (updates.bio !== undefined) updateData.bio = updates.bio;

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    nativeLanguage: data.native_language,
    targetLanguage: data.target_language,
    goal: data.goal,
    bio: data.bio,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Transcript operations
export async function createTranscript(
  userId: string,
  content: string,
  agentId: string
): Promise<Transcript> {
  const supabase = await createSupabaseServerClient();
  const createdAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("transcripts")
    .insert({
      user_id: userId,
      content,
      agent_id: agentId,
      created_at: createdAt,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transcript: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    content: data.content,
    agentId: data.agent_id,
    createdAt: data.created_at,
  };
}

// Personalized plan operations
export async function savePlan(plan: PersonalizedPlan): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("personalized_plans").insert({
    user_id: plan.userId,
    skills: plan.skills,
    current_level: plan.currentLevel,
    next_level: plan.nextLevel,
    learning_units: plan.learningUnits,
    coaching_tips: plan.coachingTips,
    weak_areas: plan.weakAreas,
    strengths: plan.strengths,
    generated_at: plan.generatedAt,
  });

  if (error) {
    throw new Error(`Failed to save plan: ${error.message}`);
  }
}

export async function getPlanByUserId(
  userId: string
): Promise<PersonalizedPlan | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("personalized_plans")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get plan: ${error.message}`);
  }

  return {
    userId: data.user_id,
    skills: data.skills,
    currentLevel: data.current_level,
    nextLevel: data.next_level,
    learningUnits: data.learning_units,
    coachingTips: data.coaching_tips,
    weakAreas: data.weak_areas,
    strengths: data.strengths,
    generatedAt: data.generated_at,
  };
}

// Assessment session operations
export async function createAssessmentSession(
  userId: string,
  agentId: string
): Promise<AssessmentSession> {
  const supabase = await createSupabaseServerClient();
  const startedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("assessment_sessions")
    .insert({
      user_id: userId,
      agent_id: agentId,
      started_at: startedAt,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assessment session: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    agentId: data.agent_id,
    transcript: data.transcript || "",
    startedAt: data.started_at,
    endedAt: data.ended_at || undefined,
    status: data.status as "active" | "completed",
  };
}

export async function getAssessmentSession(
  sessionId: string
): Promise<AssessmentSession | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get assessment session: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    agentId: data.agent_id,
    transcript: data.transcript || "",
    startedAt: data.started_at,
    endedAt: data.ended_at || undefined,
    status: data.status as "active" | "completed",
  };
}

export async function completeAssessmentSession(
  sessionId: string,
  transcript: string
): Promise<AssessmentSession | null> {
  const supabase = await createSupabaseServerClient();
  const session = await getAssessmentSession(sessionId);
  if (!session) return null;

  // Also persist the transcript as a standalone record tied to this session's user and agent
  await createTranscript(session.userId, transcript, session.agentId);

  const endedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("assessment_sessions")
    .update({
      transcript,
      ended_at: endedAt,
      status: "completed",
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to complete assessment session: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    agentId: data.agent_id,
    transcript: data.transcript || "",
    startedAt: data.started_at,
    endedAt: data.ended_at || undefined,
    status: data.status as "active" | "completed",
  };
}
