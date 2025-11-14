'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useAuthHydration } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { AgoraManager } from '@/components/agora-manager';
import { AssessmentTimer } from '@/components/assessment-timer';
import { AgentStatus } from '@/components/agent-status';
import { AssessmentFeedback } from '@/components/assessment-feedback';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { CALL_DURATION_MS } from '@/lib/constants';
import { ThemeToggle } from "@/components/theme-toggle";

type FeedbackState = {
  message: string;
  type: "info" | "success" | "error" | "warning";
  show: boolean;
};

export default function AssessmentPage() {
  return (
    <ProtectedRoute>
      <AssessmentContent />
    </ProtectedRoute>
  );
}

function AssessmentContent() {
  const router = useRouter();
  const { user, isHydrated, setUser } = useAuthHydration();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasStoppedAgent, setHasStoppedAgent] = useState(false);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: "",
    type: "info",
    show: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const hasStoppedAgentRef = useRef(false);

  useEffect(() => {
    return () => {
      const latestAgentId = agentIdRef.current;
      const latestSessionId = sessionIdRef.current;
      const latestHasStopped = hasStoppedAgentRef.current;

      if (latestAgentId && latestSessionId && !latestHasStopped) {
        fetch("/api/agora/stop-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: latestAgentId,
            sessionId: latestSessionId,
          }),
        }).catch((error) => {
          console.error("[v0] Error stopping agent on cleanup:", error);
        });
      }
    };
  }, []);

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const handleAgentReady = (id: string) => {
    setAgentId(id);
    agentIdRef.current = id;
    setHasStoppedAgent(false);
    hasStoppedAgentRef.current = false;
    setIsAgentConnected(true);
    setIsAssessmentActive(true);
    setIsListening(true);
    setFeedback({
      message:
        "Great! Sora is ready. Listen to the greeting and respond naturally.",
      type: "success",
      show: true,
    });

    console.log("[v0] Agent ready, assessment started:", id);

    setTimeout(() => {
      setFeedback({ ...feedback, show: false });
    }, 4000);
  };

  const handleSessionReady = (id: string) => {
    setSessionId(id);
    sessionIdRef.current = id;
  };

  const handleAgentError = (error: string) => {
    setFeedback({
      message: `Connection error: ${error}`,
      type: "error",
      show: true,
    });
    console.error("[v0] Agent error:", error);
  };

  const stopAgentIfNeeded = async () => {
    if (!agentId || !sessionId || hasStoppedAgent) {
      return;
    }

    const response = await fetch("/api/agora/stop-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to stop agent");
    }

    await response.json();
    setHasStoppedAgent(true);
    hasStoppedAgentRef.current = true;
  };

  const handleTimeUp = async () => {
    setIsAssessmentActive(false);
    setIsListening(false);
    setIsSpeaking(false);

    setFeedback({
      message: "Time is up! Processing your assessment...",
      type: "info",
      show: true,
    });

    if (!agentId || !user || !sessionId) {
      setFeedback({
        message: "Unable to finalize assessment. Missing session information.",
        type: "error",
        show: true,
      });
      return;
    }

    // Submit transcript for analysis
    if (agentId && user && sessionId) {
      setIsSubmitting(true);
      try {
        await stopAgentIfNeeded();
        setIsAgentConnected(false);

        const response = await fetch("/api/analyze-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            agentId,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze transcript");
        }

        const data = await response.json();
        console.log("[v0] Analysis complete:", data);
        if (user) {
          setUser({ ...user, hasLearningPlan: true });
        }

        setFeedback({
          message: "Assessment complete! Redirecting to your results...",
          type: "success",
          show: true,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("[v0] Analysis error:", error);
        setFeedback({
          message: "Error processing assessment. Please try again.",
          type: "error",
          show: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEndEarly = async () => {
    if (confirm("Are you sure you want to end the assessment early?")) {
      await handleTimeUp();
    }
  };

  return (
    <AgoraManager
      userId={user.userId}
      appId={process.env.NEXT_PUBLIC_AGORA_APP_ID || ""}
      onSessionReady={handleSessionReady}
      onAgentReady={handleAgentReady}
      onAgentError={handleAgentError}
    >
      <div className="min-h-screen bg-linear-to-br from-background via-background to-background dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4">
        <div className="max-w-md mx-auto py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Language Assessment
              </h1>
              <p className="text-sm text-muted-foreground">
                Speak naturally with Sora, our AI tutor
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Card className="p-8 bg-card/95 shadow-xl backdrop-blur-sm border-border/60">
            {/* Agent Status */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <AgentStatus
                isConnected={isAgentConnected}
                isListening={isListening}
                isSpeaking={isSpeaking}
              />
            </div>

            {/* Timer */}
            {isAssessmentActive && (
              <div className="mb-8">
                <AssessmentTimer
                  durationMs={CALL_DURATION_MS}
                  onTimeUp={handleTimeUp}
                  isRunning={true}
                />
              </div>
            )}

            {/* Feedback */}
            <AssessmentFeedback
              message={feedback.message}
              type={feedback.type}
              show={feedback.show}
            />

            {/* Instructions */}
            {!isAssessmentActive && !agentId && (
              <div className="mt-8 p-4 rounded-lg border border-primary/15 bg-primary/5 dark:bg-primary/10">
                <h3 className="font-semibold text-primary mb-2">
                  How it works:
                </h3>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• Sora will greet you and start a conversation</li>
                  <li>• Respond naturally in {user.targetLanguage}</li>
                  <li>• You have 3 minutes to demonstrate your skills</li>
                  <li>• Focus on grammar, vocabulary, and fluency</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              {!isAssessmentActive && !agentId && (
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              )}

              {isAssessmentActive && (
                <Button
                  onClick={handleEndEarly}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  End Early
                </Button>
              )}

              {isSubmitting && (
                <div className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/5 text-primary">
                  <Spinner className="w-4 h-4" />
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
            </div>
          </Card>

          {/* Tips Section */}
          <div className="mt-8 p-4 bg-card/90 rounded-lg shadow text-sm text-muted-foreground border border-border/60">
            <p className="font-semibold text-foreground mb-2">
              Assessment Tips:
            </p>
            <ul className="space-y-1 text-xs">
              <li>✓ Speak clearly and at a natural pace</li>
              <li>✓ Use complete sentences when possible</li>
              <li>✓ Don&apos;t worry about perfect grammar</li>
              <li>✓ Ask for clarification if needed</li>
              <li>✓ Relax and enjoy the conversation</li>
            </ul>
          </div>
        </div>
      </div>
    </AgoraManager>
  );
}
