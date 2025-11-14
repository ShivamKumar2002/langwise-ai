import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(request: NextRequest) {
  try {
    const { channel, uid } = await request.json();

    if (!channel) {
      return NextResponse.json(
        { error: 'Missing channel' },
        { status: 400 }
      );
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const uidValue = uid || 0;
    const expirationTimeInSeconds = 24 * 60 * 60; // 24 hours

    if (!appId || !appCertificate) {
      console.error('[v0] Missing Agora credentials for token generation');
      return NextResponse.json(
        { error: 'Agora credentials not configured' },
        { status: 500 }
      );
    }

    // Generate RTC token for the user
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uidValue,
      RtcRole.PUBLISHER,
      expirationTimeInSeconds
    );

    console.log('[v0] Generated real Agora RTC token for channel:', channel, 'uid:', uidValue);

    return NextResponse.json({
      success: true,
      token,
      channel,
      uid: uidValue,
    });
  } catch (error) {
    console.error('[v0] Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
