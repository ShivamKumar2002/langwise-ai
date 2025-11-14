import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { startAgoraAgent, generateTutorSystemPrompt } from "@/lib/agora-utils";
import { getUserByUserId, createAssessmentSession } from "@/lib/utils-db";

function buildRtcToken(channel: string, uid: number = 0) {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTimeInSeconds = 24 * 60 * 60;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  if (!appId || !appCertificate) {
    throw new Error("[v0] Agora credentials not configured");
  }

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId, channelName } = await request.json();

    if (!userId || !channelName) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const user = await getUserByUserId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const agoraToken = buildRtcToken(channelName);

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

    console.log("[v0] Agent started for user:", userId, "Agent ID:", agentId);

    return NextResponse.json({
      success: true,
      agentId,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[v0] Start agent error:", error);
    return NextResponse.json(
      { error: "Failed to start agent" },
      { status: 500 }
    );
  }
}
