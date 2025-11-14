import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack } from 'agora-rtc-sdk-ng';

let agoraClient: IAgoraRTCClient | null = null;
let localAudioTrack: ILocalAudioTrack | null = null;

export async function initializeAgoraClient(appId: string) {
  if (agoraClient) return agoraClient;

  AgoraRTC.setLogLevel(1); // Info level
  agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'opus' });

  console.log('[v0] Agora client initialized');
  return agoraClient;
}

export async function joinAgoraChannel(
  appId: string,
  channel: string,
  token: string,
  uid?: number
) {
  try {
    const client = await initializeAgoraClient(appId);

    console.log('[v0] Joining Agora channel:', channel);

    await client.join(appId, channel, token, uid || 0);

    // Get local audio track
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: {
        sampleRate: 48000,
        stereo: true,
        bitrate: 128,
      },
    });

    await client.publish([localAudioTrack]);

    console.log('[v0] Successfully joined channel and published audio');

    return { client, localAudioTrack };
  } catch (error) {
    console.error('[v0] Failed to join Agora channel:', error);
    throw error;
  }
}

export async function leaveAgoraChannel() {
  try {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      localAudioTrack = null;
    }

    if (agoraClient) {
      await agoraClient.leave();
      agoraClient = null;
    }

    console.log('[v0] Left Agora channel');
  } catch (error) {
    console.error('[v0] Error leaving channel:', error);
    throw error;
  }
}

export function getAgoraClient() {
  return agoraClient;
}

export function getLocalAudioTrack() {
  return localAudioTrack;
}

// Event listeners
export function onRemoteUserJoined(
  callback: (user: any) => void
) {
  if (agoraClient) {
    agoraClient.on('user-joined', callback);
  }
}

export function onRemoteUserLeft(
  callback: (user: any) => void
) {
  if (agoraClient) {
    agoraClient.on('user-left', callback);
  }
}
