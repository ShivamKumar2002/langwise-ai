'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import type { IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import {
  AgoraConnection,
  createAgoraConnection,
  teardownAgoraConnection,
} from "./agora-client";

interface AgoraHookOptions {
  appId: string;
  channel: string;
  onAgentJoined?: () => void;
  onAgentLeft?: () => void;
}

export function useAgoraClient(options: AgoraHookOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const connectionRef = useRef<AgoraConnection | null>(null);
  const remoteAudioTracksRef = useRef<Map<string, IRemoteAudioTrack>>(
    new Map()
  );

  useEffect(() => {
    const { appId, channel, onAgentJoined, onAgentLeft } = options;
    let cancelled = false;

    const remoteUserJoinedHandler = (user: any) => {
      if (cancelled) return;
      console.log("[v0] Remote user joined:", user.uid);
      setRemoteUsers((prev) => [...prev, user]);
      onAgentJoined?.();
    };

    const remoteUserLeftHandler = (user: any) => {
      if (cancelled) return;
      console.log("[v0] Remote user left:", user.uid);
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      onAgentLeft?.();
    };

    const setupAgora = async () => {
      try {
        console.log("[v0] Setting up Agora connection for channel:", channel);

        const connection = await createAgoraConnection(appId, channel);
        if (cancelled) {
          await teardownAgoraConnection(connection);
          return;
        }

        const handleUserPublished = async (
          user: any,
          mediaType: "audio" | "video"
        ) => {
          if (cancelled || mediaType !== "audio") return;
          try {
            await connection.client.subscribe(user, mediaType);
            const audioTrack = user.audioTrack as IRemoteAudioTrack | undefined;
            if (audioTrack) {
              audioTrack.play();
              remoteAudioTracksRef.current.set(String(user.uid), audioTrack);
              console.log("[v0] Subscribed to remote audio:", user.uid);
            }
          } catch (subscribeError) {
            console.error(
              "[v0] Failed to subscribe to remote audio:",
              subscribeError
            );
            if (!cancelled) {
              const message =
                subscribeError instanceof Error
                  ? subscribeError.message
                  : "Failed to subscribe to remote audio";
              setError(message);
            }
          }
        };

        const handleUserUnpublished = (
          user: any,
          mediaType: "audio" | "video"
        ) => {
          if (mediaType !== "audio") return;
          const audioTrack = remoteAudioTracksRef.current.get(String(user.uid));
          if (audioTrack) {
            audioTrack.stop();
            remoteAudioTracksRef.current.delete(String(user.uid));
            console.log("[v0] Remote audio stopped for user:", user.uid);
          }
        };

        connection.client.on("user-joined", remoteUserJoinedHandler);
        connection.client.on("user-left", remoteUserLeftHandler);
        connection.client.on("user-published", handleUserPublished);
        connection.client.on("user-unpublished", handleUserUnpublished);

        connectionRef.current = connection;
        setIsConnected(true);

        return () => {
          connection.client.off("user-joined", remoteUserJoinedHandler);
          connection.client.off("user-left", remoteUserLeftHandler);
          connection.client.off("user-published", handleUserPublished);
          connection.client.off("user-unpublished", handleUserUnpublished);
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect to Agora";
        setError(message);
        console.error("[v0] Agora setup error:", message);
      }
    };

    let detachEvents: (() => void) | undefined;

    setupAgora().then((cleanupFn) => {
      detachEvents = cleanupFn;
    });

    return () => {
      cancelled = true;
      detachEvents?.();
      const connection = connectionRef.current;

      if (connection) {
        remoteAudioTracksRef.current.forEach((track) => track.stop());
        remoteAudioTracksRef.current.clear();
        teardownAgoraConnection(connection).catch((err) => {
          console.error("[v0] Error leaving channel on cleanup:", err);
        });
        connectionRef.current = null;
      }

      setIsConnected(false);
      setRemoteUsers([]);
    };
  }, [
    options.appId,
    options.channel,
    options.onAgentJoined,
    options.onAgentLeft,
  ]);

  const disconnect = useCallback(async () => {
    try {
      const connection = connectionRef.current;
      if (connection) {
        connection.client.removeAllListeners();
        remoteAudioTracksRef.current.forEach((track) => track.stop());
        remoteAudioTracksRef.current.clear();
        await teardownAgoraConnection(connection);
        connectionRef.current = null;
      }
      setIsConnected(false);
      setRemoteUsers([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to disconnect";
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
