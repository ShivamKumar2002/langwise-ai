import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { channel, uid } = await request.json();

    if (!channel) {
      return NextResponse.json(
        { error: 'Missing channel' },
        { status: 400 }
      );
    }

    // Mock token generation for demo
    // In production, use agora-access-token to generate real tokens
    const mockToken = `demo_token_${channel}_${uid}_${Date.now()}`;

    console.log('[v0] Generated Agora token for channel:', channel);

    return NextResponse.json({
      success: true,
      token: mockToken,
      channel,
      uid: uid || 0,
    });
  } catch (error) {
    console.error('[v0] Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
