'use client';

import { useEffect, useRef, useState } from 'react';
import { startAgoraAgent, stopAgoraAgent } from '@/lib/agora-utils';
import { getAgoraToken } from '@/lib/agora-token-generator';
import { useAgoraClient } from '@/lib/agora-hook';

interface AgoraManagerProps {
  userId: string;
  appId: string;
  onAgentReady?: (agentId: string) => void;
  onAgentError?: (error: string) => void;
  onTranscript?: (transcript: string) => void;
  children: React.ReactNode;
}

export function AgoraManager({
  userId,
  appId,
  onAgentReady,
  onAgentError,
  onTranscript,
  children,
}: AgoraManagerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [channelName] = useState(() => `lang-assess-${userId}-${Date.now()}`);
  const agentIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<string>('');

  const { isConnected, error, remoteUsers } = useAgoraClient({
    appId,
    channel: channelName,
    token: '', // Will be fetched
    onAgentJoined: () => {
      console.log('[v0] Agent (Sora) joined the channel');
    },
    onAgentLeft: () => {
      console.log('[v0] Agent (Sora) left the channel');
    },
  });

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        setIsInitializing(true);

        // Get Agora token
        const token = await getAgoraToken(channelName);

        // Start the AI agent
        const response = await fetch('/api/agora/start-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            channelName,
            agoraToken: token,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start agent');
        }

        const data = await response.json();
        agentIdRef.current = data.agentId;

        console.log('[v0] Agent initialized:', data.agentId);
        onAgentReady?.(data.agentId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize agent';
        console.error('[v0] Agent initialization error:', message);
        onAgentError?.(message);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAgent();
  }, [userId, appId, channelName, onAgentReady, onAgentError]);

  const stopAgent = async () => {
    if (agentIdRef.current) {
      try {
        await fetch('/api/agora/stop-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: agentIdRef.current }),
        });

        console.log('[v0] Agent stopped:', agentIdRef.current);
        agentIdRef.current = null;
      } catch (err) {
        console.error('[v0] Error stopping agent:', err);
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Connection Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-agora-manager data-initialized={!isInitializing} data-connected={isConnected}>
      {children}
    </div>
  );
}
