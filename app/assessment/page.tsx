'use client';

import { useState, useEffect } from 'react';
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

export default function AssessmentPage() {
  return (
    <ProtectedRoute>
      <AssessmentContent />
    </ProtectedRoute>
  );
}

function AssessmentContent() {
  const router = useRouter();
  const { user, isHydrated } = useAuthHydration();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: 'info' as const, show: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const handleAgentReady = (id: string) => {
    setAgentId(id);
    setIsAgentConnected(true);
    setIsAssessmentActive(true);
    setIsListening(true);
    setFeedback({
      message: "Great! Sora is ready. Listen to the greeting and respond naturally.",
      type: 'success',
      show: true,
    });

    console.log('[v0] Agent ready, assessment started:', id);

    setTimeout(() => {
      setFeedback({ ...feedback, show: false });
    }, 4000);
  };

  const handleAgentError = (error: string) => {
    setFeedback({
      message: `Connection error: ${error}`,
      type: 'error',
      show: true,
    });
    console.error('[v0] Agent error:', error);
  };

  const handleTimeUp = async () => {
    setIsAssessmentActive(false);
    setIsListening(false);
    setIsSpeaking(false);

    setFeedback({
      message: 'Time is up! Processing your assessment...',
      type: 'info',
      show: true,
    });

    // In a real implementation, get the transcript from Agora
    const mockTranscript = `User: Hello, I am learning Spanish and I enjoy traveling.
Agent: Excellent! Tell me about your favorite destination.
User: I love Barcelona. The architecture is beautiful and the food is delicious.
Agent: That sounds wonderful! What languages do you speak?
User: I speak English and some Spanish. I want to improve my fluency.`;

    // Submit transcript for analysis
    if (agentId && user) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/analyze-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.userId,
            transcript: mockTranscript,
            agentId,
            sessionId: sessionId || 'temp-session',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze transcript');
        }

        const data = await response.json();
        console.log('[v0] Analysis complete:', data);

        setFeedback({
          message: 'Assessment complete! Redirecting to your results...',
          type: 'success',
          show: true,
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('[v0] Analysis error:', error);
        setFeedback({
          message: 'Error processing assessment. Please try again.',
          type: 'error',
          show: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEndEarly = async () => {
    if (confirm('Are you sure you want to end the assessment early?')) {
      await handleTimeUp();
    }
  };

  return (
    <AgoraManager
      userId={user.userId}
      appId={process.env.NEXT_PUBLIC_AGORA_APP_ID || ''}
      onAgentReady={handleAgentReady}
      onAgentError={handleAgentError}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Language Assessment</h1>
            <p className="text-slate-600">Speak naturally with Sora, our AI tutor</p>
          </div>

          <Card className="p-8 bg-white shadow-xl">
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
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
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
                  onClick={() => router.push('/dashboard')}
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
                <div className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Spinner className="w-4 h-4" />
                  <span className="text-sm font-medium text-blue-700">Processing...</span>
                </div>
              )}
            </div>
          </Card>

          {/* Tips Section */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow text-sm text-slate-600">
            <p className="font-semibold text-slate-900 mb-2">Assessment Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Speak clearly and at a natural pace</li>
              <li>✓ Use complete sentences when possible</li>
              <li>✓ Don't worry about perfect grammar</li>
              <li>✓ Ask for clarification if needed</li>
              <li>✓ Relax and enjoy the conversation</li>
            </ul>
          </div>
        </div>
      </div>
    </AgoraManager>
  );
}
