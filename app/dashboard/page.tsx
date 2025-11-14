'use client';

import { useState, useEffect } from 'react';
import { useAuthHydration } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PlanReadyState } from '@/components/plan-ready-state';
import { ProgressSummary } from '@/components/progress-summary';
import { PersonalizedPlanView } from '@/components/personalized-plan-view';
import { AssessmentCTA } from '@/components/assessment-cta';
import { PlanLoadingState } from '@/components/plan-loading-state';
import { PersonalizedPlan } from '@/lib/types';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, isHydrated } = useAuthHydration();
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    if (!isHydrated || !user) return;

    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/get-plan?userId=${user.userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            console.log('[v0] No plan found, user may need to take assessment');
            setError('No assessment found. Please take an assessment first.');
            return;
          }
          throw new Error('Failed to fetch plan');
        }

        const data = await response.json();
        setPlan(data.plan);
        console.log('[v0] Plan loaded:', data.plan);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load plan';
        setError(message);
        console.error('[v0] Plan loading error:', message);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate plan generation delay for demo
    const timeout = setTimeout(fetchPlan, 1000);
    return () => clearTimeout(timeout);
  }, [user, isHydrated]);

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">LangWiseAI</h1>
            <p className="text-slate-600">Welcome back, {user.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div>
            <p className="text-slate-600 mb-6">Loading your assessment results...</p>
            <PlanLoadingState />
          </div>
        ) : error ? (
          <Card className="p-8 bg-amber-50 border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Assessment Not Found</h3>
            <p className="text-amber-800 mb-6">{error}</p>
            <Button
              onClick={() => (window.location.href = '/assessment')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Take Your First Assessment
            </Button>
          </Card>
        ) : plan ? (
          <div className="space-y-12">
            {/* Celebration State */}
            {showCelebration && (
              <div className="mb-8">
                <PlanReadyState userName={user.name} />
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowCelebration(false)}
                    className="text-sm text-slate-500 hover:text-slate-700 underline"
                  >
                    Skip celebration
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Progress at a Glance</h2>
              <ProgressSummary
                skills={plan.skills}
                currentLevel={plan.currentLevel}
                nextLevel={plan.nextLevel}
              />
            </section>

            {/* Full Plan */}
            <section>
              <PersonalizedPlanView plan={plan} />
            </section>

            {/* CTA for Next Assessment */}
            <section>
              <AssessmentCTA />
            </section>

            {/* Navigation */}
            <section className="pt-8 border-t border-slate-200 flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                Back to Home
              </Button>
              <Button
                onClick={() => (window.location.href = '/assessment')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Take Another Assessment
              </Button>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
