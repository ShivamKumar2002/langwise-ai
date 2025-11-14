'use server';

import { createSupabaseServerClient } from "./supabase/server";
import {
  getUserByUserId,
  getUserById,
  updateUser,
  createUser,
} from "./utils-db";
import { createSupabaseClient } from "./supabase/client";

export async function signUp(email: string, password: string, name: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Create user profile in public.users table
    // Use email as userId for lookups, but use auth user's UUID as id
    const userId = authData.user.email || authData.user.id;

    try {
      await createUser(
        {
          userId,
          name,
          nativeLanguage: "English",
          targetLanguage: "Spanish",
          goal: "",
          bio: "",
        },
        authData.user.id // Pass auth user's UUID as the id
      );
    } catch (profileError: any) {
      // If profile creation fails, we still have the auth user
      console.error("[v0] Failed to create user profile:", profileError);
      // Continue anyway - profile can be created later
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error("[v0] Sign up error:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error("Failed to sign in");
    }

    // Get user profile
    const userId = data.user.email || data.user.id;
    let userProfile = await getUserByUserId(userId);

    // If profile doesn't exist, create it
    if (!userProfile) {
      const name =
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "User";
      userProfile = await createUser(
        {
          userId,
          name,
          nativeLanguage: "English",
          targetLanguage: "Spanish",
          goal: "",
          bio: "",
        },
        data.user.id // Pass auth user's UUID as the id
      );
    }

    // Get learning plan status
    const { getPlanByUserId } = await import("./utils-db");
    const plan = await getPlanByUserId(userId);
    const hasLearningPlan = !!plan;

    return {
      success: true,
      user: {
        id: userProfile.id,
        userId: userProfile.userId,
        name: userProfile.name,
        nativeLanguage: userProfile.nativeLanguage,
        targetLanguage: userProfile.targetLanguage,
        hasLearningPlan,
      },
      session: data.session,
    };
  } catch (error) {
    console.error("[v0] Sign in error:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error("[v0] Sign out error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const userId = user.email || user.id;
    const userProfile = await getUserByUserId(userId);

    if (!userProfile) {
      return null;
    }

    const { getPlanByUserId } = await import("./utils-db");
    const plan = await getPlanByUserId(userId);
    const hasLearningPlan = !!plan;

    return {
      id: userProfile.id,
      userId: userProfile.userId,
      name: userProfile.name,
      nativeLanguage: userProfile.nativeLanguage,
      targetLanguage: userProfile.targetLanguage,
      hasLearningPlan,
    };
  } catch (error) {
    console.error("[v0] Get current user error:", error);
    return null;
  }
}

export async function saveOnboarding(
  userId: string,
  updates: {
    nativeLanguage: string;
    targetLanguage: string;
    goal: string;
    bio: string;
  }
) {
  try {
    const user = await getUserByUserId(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updated = await updateUser(userId, {
      ...user,
      ...updates,
    });

    if (!updated) {
      throw new Error("Failed to update user");
    }

    console.log("[v0] Onboarding saved for user:", userId);
    return updated;
  } catch (error) {
    console.error("[v0] Onboarding error:", error);
    throw error;
  }
}

export async function getUserInfo(userId: string) {
  try {
    const user = await getUserByUserId(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("[v0] Get user error:", error);
    throw error;
  }
}
