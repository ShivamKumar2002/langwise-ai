'use client';

import { useEffect, useState } from 'react';

interface AssessmentTimerProps {
  durationMs: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export function AssessmentTimer({ durationMs, onTimeUp, isRunning }: AssessmentTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 100;
        setProgress((next / durationMs) * 100);

        if (next <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, durationMs, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isLowTime = timeLeft < 30000;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
          />
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${progress * 3.45} 345`}
            strokeLinecap="round"
            className={`transition-all ${
              isLowTime
                ? "text-red-500 dark:text-red-400"
                : "text-primary dark:text-blue-400"
            }`}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "60px 60px",
            }}
          />
        </svg>
        <div className="text-center z-10">
          <div
            className={`text-4xl font-bold ${
              isLowTime ? "text-red-600 dark:text-red-400" : "text-foreground"
            }`}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="text-sm text-muted-foreground">remaining</div>
        </div>
      </div>

      {isLowTime && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg animate-pulse">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">
            Time running out!
          </p>
        </div>
      )}
    </div>
  );
}
