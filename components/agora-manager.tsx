'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useAgoraClient } from "@/lib/agora-hook";

interface AgoraManagerProps {
  userId: string;
  appId: string;
  onAgentReady?: (agentId: string) => void;
  onSessionReady?: (sessionId: string) => void;
  onAgentError?: (error: string) => void;
  onTranscript?: (transcript: string) => void;
  children: React.ReactNode;
}

export function AgoraManager({
  userId,
  appId,
  onAgentReady,
  onSessionReady,
  onAgentError,
  onTranscript,
  children,
}: AgoraManagerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [channelName] = useState(() => `lang-assess-${userId}-${Date.now()}`);
  const agentIdRef = useRef<string | null>(null);
  const initAttemptedRef = useRef(false);
  const latestCallbacksRef = useRef({
    onAgentReady,
    onSessionReady,
    onAgentError,
    onTranscript,
  });

  useEffect(() => {
    latestCallbacksRef.current = {
      onAgentReady,
      onSessionReady,
      onAgentError,
      onTranscript,
    };
  }, [onAgentReady, onSessionReady, onAgentError, onTranscript]);

  const handleAgentJoined = useCallback(() => {
    console.log("[v0] Agent (Sora) joined the channel");
  }, []);

  const handleAgentLeft = useCallback(() => {
    console.log("[v0] Agent (Sora) left the channel");
  }, []);

  const { isConnected, error, remoteUsers } = useAgoraClient({
    appId,
    channel: channelName,
    onAgentJoined: handleAgentJoined,
    onAgentLeft: handleAgentLeft,
  });

  useEffect(() => {
    if (initAttemptedRef.current) {
      return;
    }
    initAttemptedRef.current = true;

    let isMounted = true;

    const initializeAgent = async () => {
      try {
        if (isMounted) {
          setIsInitializing(true);
        }

        // Start the AI agent
        const response = await fetch("/api/agora/start-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            channelName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to start agent");
        }

        const data = await response.json();
        agentIdRef.current = data.agentId;

        console.log("[v0] Agent initialized:", data.agentId);
        latestCallbacksRef.current.onAgentReady?.(data.agentId);
        if (data.sessionId) {
          latestCallbacksRef.current.onSessionReady?.(data.sessionId);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to initialize agent";
        console.error("[v0] Agent initialization error:", message);
        latestCallbacksRef.current.onAgentError?.(message);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAgent();
    return () => {
      isMounted = false;
    };
  }, [userId, channelName]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Connection Error
          </h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-agora-manager
      data-initialized={!isInitializing}
      data-connected={isConnected}
    >
      {children}
    </div>
  );
}
