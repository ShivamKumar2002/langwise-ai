import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { getAgoraToken } from "./agora-token-generator";

type AgoraRTCType = typeof import("agora-rtc-sdk-ng") extends {
  default: infer T;
}
  ? T
  : never;

let cachedAgoraRTC: AgoraRTCType | null = null;

async function ensureAgoraRTC(): Promise<AgoraRTCType> {
  if (cachedAgoraRTC) {
    return cachedAgoraRTC;
  }

  if (typeof window === "undefined") {
    throw new Error("AgoraRTC can only be initialized in the browser");
  }

  const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
  cachedAgoraRTC = AgoraRTC;
  return AgoraRTC;
}

export interface AgoraConnection {
  client: IAgoraRTCClient;
  localAudioTrack: ILocalAudioTrack;
  channel: string;
}

export async function createAgoraConnection(
  appId: string,
  channel: string,
  uid?: number
): Promise<AgoraConnection> {
  const AgoraRTC = await ensureAgoraRTC();
  AgoraRTC.setLogLevel(1); // Info level
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // Use a non-zero, unique RTC UID for the local user to avoid collisions with the agent
  // The agent uses UID 0 (configured in the Agora Conversational AI agent setup),
  // so we ensure the frontend client always joins with a different UID.
  const rtcUid =
    typeof uid === "number" && uid > 0
      ? uid
      : Math.floor(Math.random() * 4294967295) + 1;
  const token = await getAgoraToken(channel, rtcUid);

  console.log("[v0] Joining Agora channel:", channel);

  await client.join(appId, channel, token ?? null, rtcUid);

  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: {
      sampleRate: 48000,
      stereo: true,
      bitrate: 128,
    },
  });

  await client.publish([localAudioTrack]);

  console.log("[v0] Successfully joined channel and published audio");

  return { client, localAudioTrack, channel };
}

export async function teardownAgoraConnection(
  connection?: AgoraConnection | null
) {
  if (!connection) return;

  const { client, localAudioTrack, channel } = connection;

  try {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }

    await client.leave();
    console.log("[v0] Left Agora channel:", channel);
  } catch (error) {
    console.error("[v0] Error leaving channel:", error);
    throw error;
  }
}
