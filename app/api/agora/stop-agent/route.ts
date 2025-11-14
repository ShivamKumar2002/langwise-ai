import { NextRequest, NextResponse } from 'next/server';
import { stopAgoraAgent, getAgentHistory } from '@/lib/agora-utils';
import { completeAssessmentSession } from '@/lib/utils-db';

export async function POST(request: NextRequest) {
  try {
    const { agentId, sessionId } = await request.json();

    if (!agentId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing agentId or sessionId' },
        { status: 400 }
      );
    }

    console.log('[v0] Stopping agent:', agentId);

    // Step 1: Retrieve conversation history before stopping
    let transcript = '';
    try {
      const contents = await getAgentHistory(agentId);
      
      // Format transcript from history
      transcript = contents
        .map((msg) => {
          const speaker = msg.role === 'assistant' ? 'Agent' : 'User';
          return `${speaker}: ${msg.content}`;
        })
        .join('\n');

      console.log('[v0] Formatted transcript with', contents.length, 'messages');
    } catch (historyError) {
      console.error('[v0] Failed to get history, but continuing with agent stop:', historyError);
      // Continue even if history retrieval fails - we'll stop the agent anyway
    }

    // Step 2: Stop the agent
    await stopAgoraAgent(agentId);

    // Step 3: Complete assessment session with transcript
    completeAssessmentSession(sessionId, transcript);

    console.log('[v0] Agent stopped and session completed:', sessionId);

    return NextResponse.json({ 
      success: true,
      agentId,
      sessionId,
      transcriptLength: transcript.length,
    });
  } catch (error) {
    console.error('[v0] Stop agent error:', error);
    return NextResponse.json(
      { error: 'Failed to stop agent' },
      { status: 500 }
    );
  }
}
