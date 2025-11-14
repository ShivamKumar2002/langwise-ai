import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscriptWithAI } from "@/lib/analysis-utils";
import {
  getUserByUserId,
  getPlanByUserId,
  savePlan,
  getAssessmentSession,
} from "@/lib/utils-db";

export async function POST(request: NextRequest) {
  try {
    const { userId, agentId, sessionId } = await request.json();

    if (!userId || !agentId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const session = getAssessmentSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== userId) {
      return NextResponse.json(
        { error: "Session does not belong to user" },
        { status: 403 }
      );
    }

    if (!session.transcript) {
      return NextResponse.json(
        { error: "Transcript not available yet. Please try again." },
        { status: 409 }
      );
    }

    const transcript = session.transcript;

    const user = await getUserByUserId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[v0] Analyzing transcript for user:", userId);

    // Get previous plan for context
    const previousPlan = await getPlanByUserId(userId);

    // Analyze
    const plan = await analyzeTranscriptWithAI(
      transcript,
      user.nativeLanguage,
      user.targetLanguage,
      user.goal,
      previousPlan || undefined
    );

    // Set userId and save plan
    plan.userId = userId;
    await savePlan(plan);

    console.log("[v0] Transcript analysis complete for user:", userId);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("[v0] Transcript analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze transcript" },
      { status: 500 }
    );
  }
}

