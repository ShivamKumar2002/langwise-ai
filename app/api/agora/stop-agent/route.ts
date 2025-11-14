import { NextRequest, NextResponse } from 'next/server';
import { stopAgoraAgent, getAgentHistory } from '@/lib/agora-utils';
import {
  completeAssessmentSession,
  getAssessmentSession,
} from "@/lib/utils-db";

const sessionStopLocks = new Map<string, "stopping" | "stopped">();

export async function POST(request: NextRequest) {
  try {
    const { agentId, sessionId } = await request.json();

    if (!agentId || !sessionId) {
      return NextResponse.json(
        { error: "Missing agentId or sessionId" },
        { status: 400 }
      );
    }

    console.log("[v0] Stopping agent:", agentId);

    const session = getAssessmentSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "completed") {
      const transcript = session.transcript || "";
      console.log(
        "[v0] Session already completed, skipping duplicate stop for:",
        sessionId
      );
      return NextResponse.json({
        success: true,
        agentId,
        sessionId,
        transcript,
        transcriptLength: transcript.length,
        alreadyCompleted: true,
      });
    }

    const existingLock = sessionStopLocks.get(sessionId);
    if (existingLock === "stopping") {
      console.log(
        "[v0] Stop already in progress for session, returning early:",
        sessionId
      );
      return NextResponse.json({
        success: true,
        agentId,
        sessionId,
        transcript: session.transcript || "",
        transcriptLength: (session.transcript || "").length,
        alreadyInProgress: true,
      });
    }

    sessionStopLocks.set(sessionId, "stopping");

    // Step 1: Retrieve conversation history before stopping
    let transcript = "";
    try {
      const contents = await getAgentHistory(agentId);

      // Format transcript from history
      transcript = contents
        .map((msg) => {
          const speaker = msg.role === "assistant" ? "Agent" : "User";
          return `${speaker}: ${msg.content}`;
        })
        .join("\n");

      console.log(
        "[v0] Formatted transcript with",
        contents.length,
        "messages"
      );
    } catch (historyError) {
      console.error(
        "[v0] Failed to get history, but continuing with agent stop:",
        historyError
      );
      // Continue even if history retrieval fails - we'll stop the agent anyway
    }

    // Step 2: Stop the agent
    await stopAgoraAgent(agentId);

    // Step 3: Complete assessment session with transcript
    completeAssessmentSession(sessionId, transcript);

    sessionStopLocks.set(sessionId, "stopped");

    console.log("[v0] Agent stopped and session completed:", sessionId);

    return NextResponse.json({
      success: true,
      agentId,
      sessionId,
      transcript,
      transcriptLength: transcript.length,
    });
  } catch (error) {
    console.error("[v0] Stop agent error:", error);
    return NextResponse.json(
      { error: "Failed to stop agent" },
      { status: 500 }
    );
  }
}

