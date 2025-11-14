'use client';

import { useEffect, useState } from 'react';

interface AgentStatusProps {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

export function AgentStatus({ isConnected, isListening, isSpeaking }: AgentStatusProps) {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (!isListening && !isSpeaking) return;

    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
          }`}
        />
        <span className="text-sm font-medium text-muted-foreground">
          {isConnected ? "Connected to Sora" : "Connecting..."}
        </span>
      </div>

      {isListening && (
        <div className="flex items-center gap-2">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Sora is listening
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 rounded-sm bg-blue-500 dark:bg-blue-400 transition-all ${
                  i <= animationFrame ? "opacity-100" : "opacity-30"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {isSpeaking && (
        <div className="flex items-center gap-2">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            Sora is speaking
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 rounded-sm bg-emerald-500 dark:bg-emerald-400 transition-all ${
                  i <= animationFrame ? "opacity-100" : "opacity-30"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
