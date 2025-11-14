import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscriptWithGemini } from '@/lib/gemini-utils';
import { getUserByUserId, createTranscript, getPlanByUserId, savePlan, completeAssessmentSession } from '@/lib/utils-db';

export async function POST(request: NextRequest) {
  try {
    const { userId, transcript, agentId, sessionId } = await request.json();

    if (!userId || !transcript || !agentId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const user = await getUserByUserId(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Analyzing transcript for user:', userId);

    // Save transcript
    await createTranscript(userId, transcript, agentId);

    // Get previous plan for context
    const previousPlan = await getPlanByUserId(userId);

    // Analyze with Gemini
    const plan = await analyzeTranscriptWithGemini(
      transcript,
      user.nativeLanguage,
      user.targetLanguage,
      user.goal,
      previousPlan || undefined
    );

    // Set userId and save plan
    plan.userId = userId;
    await savePlan(plan);

    // Complete session
    await completeAssessmentSession(sessionId, transcript);

    console.log('[v0] Transcript analysis complete for user:', userId);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('[v0] Transcript analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript' },
      { status: 500 }
    );
  }
}
