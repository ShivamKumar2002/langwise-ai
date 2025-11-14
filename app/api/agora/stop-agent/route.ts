import { NextRequest, NextResponse } from 'next/server';
import { stopAgoraAgent } from '@/lib/agora-utils';

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400 }
      );
    }

    await stopAgoraAgent(agentId);

    console.log('[v0] Agent stopped:', agentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Stop agent error:', error);
    return NextResponse.json(
      { error: 'Failed to stop agent' },
      { status: 500 }
    );
  }
}
