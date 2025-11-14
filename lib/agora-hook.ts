'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { joinAgoraChannel, leaveAgoraChannel, onRemoteUserJoined, onRemoteUserLeft } from './agora-client';

interface AgoraHookOptions {
  appId: string;
  channel: string;
  token: string;
  onAgentJoined?: () => void;
  onAgentLeft?: () => void;
}

export function useAgoraClient(options: AgoraHookOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const connectionRef = useRef<boolean>(false);

  useEffect(() => {
    const setupAgora = async () => {
      try {
        console.log('[v0] Setting up Agora connection for channel:', options.channel);
        
        await joinAgoraChannel(
          options.appId,
          options.channel,
          options.token
        );

        // Set up event listeners
        onRemoteUserJoined((user) => {
          console.log('[v0] Remote user joined:', user.uid);
          setRemoteUsers((prev) => [...prev, user]);
          options.onAgentJoined?.();
        });

        onRemoteUserLeft((user) => {
          console.log('[v0] Remote user left:', user.uid);
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          options.onAgentLeft?.();
        });

        setIsConnected(true);
        connectionRef.current = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect to Agora';
        setError(message);
        console.error('[v0] Agora setup error:', message);
      }
    };

    setupAgora();

    return () => {
      if (connectionRef.current) {
        leaveAgoraChannel().catch((err) => {
          console.error('[v0] Error leaving channel on cleanup:', err);
        });
        connectionRef.current = false;
      }
    };
  }, [options]);

  const disconnect = useCallback(async () => {
    try {
      await leaveAgoraChannel();
      setIsConnected(false);
      setRemoteUsers([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(message);
    }
  }, []);

  return {
    isConnected,
    error,
    remoteUsers,
    disconnect,
  };
}
