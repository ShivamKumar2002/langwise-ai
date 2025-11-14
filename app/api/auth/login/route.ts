import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserByUserId, getPlanByUserId } from "@/lib/utils-db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("[v0] Login failed:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Get user profile
    const userId = data.user.email || data.user.id;
    const user = await getUserByUserId(userId);

    if (!user) {
      console.log("[v0] User profile not found for:", userId);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const hasLearningPlan = !!await getPlanByUserId(userId);

    console.log(
      "[v0] Successful login for user:",
      userId,
      "hasLearningPlan:",
      hasLearningPlan
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        nativeLanguage: user.nativeLanguage,
        targetLanguage: user.targetLanguage,
        hasLearningPlan,
      },
      session: data.session,
    });
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
