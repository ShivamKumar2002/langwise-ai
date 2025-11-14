import { NextRequest, NextResponse } from 'next/server';
import { startAgoraAgent, generateTutorSystemPrompt } from '@/lib/agora-utils';
import { getUserByUserId } from '@/lib/utils-db';
import { createAssessmentSession } from '@/lib/utils-db';

export async function POST(request: NextRequest) {
  try {
    const { userId, channelName, agoraToken } = await request.json();

    if (!userId || !channelName || !agoraToken) {
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

    // Generate system prompt
    const systemPrompt = generateTutorSystemPrompt(
      user.nativeLanguage,
      user.targetLanguage,
      user.goal,
      user.bio
    );

    // Start Agora agent
    const agentId = await startAgoraAgent(
      channelName,
      agoraToken,
      systemPrompt,
      user.nativeLanguage,
      user.targetLanguage
    );

    // Create assessment session
    const session = await createAssessmentSession(userId, agentId);

    console.log('[v0] Agent started for user:', userId, 'Agent ID:', agentId);

    return NextResponse.json({
      success: true,
      agentId,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[v0] Start agent error:', error);
    return NextResponse.json(
      { error: 'Failed to start agent' },
      { status: 500 }
    );
  }
}
