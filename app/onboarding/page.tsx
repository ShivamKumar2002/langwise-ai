'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHydration } from '@/hooks/use-auth';
import { saveOnboarding } from '@/lib/auth-actions';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { user, isHydrated } = useAuthHydration();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nativeLanguage: user?.nativeLanguage || 'English',
    targetLanguage: user?.targetLanguage || 'Spanish',
    goal: '',
    bio: '',
  });

  useEffect(() => {
    if (isHydrated && user) {
      setFormData((prev) => ({
        ...prev,
        nativeLanguage: user.nativeLanguage,
        targetLanguage: user.targetLanguage,
      }));
    }
  }, [isHydrated, user]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleNext = () => {
    if (step === 1 && !formData.nativeLanguage) {
      setError('Please select your native language');
      return;
    }
    if (step === 2 && !formData.targetLanguage) {
      setError('Please select your target language');
      return;
    }
    if (step === 3 && !formData.goal) {
      setError('Please describe your learning goal');
      return;
    }
    
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.bio) {
      setError('Please tell us about yourself');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await saveOnboarding(user.userId, {
        nativeLanguage: formData.nativeLanguage,
        targetLanguage: formData.targetLanguage,
        goal: formData.goal,
        bio: formData.bio,
      });

      console.log('[v0] Onboarding complete, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save onboarding';
      setError(message);
      console.error('[v0] Onboarding error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user.name}!</h1>
          <p className="text-slate-600">Let's set up your learning profile</p>
        </div>

        <Card className="p-8 bg-white shadow-lg">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      s === step
                        ? 'bg-blue-600 text-white'
                        : s < step
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`h-1 w-12 mx-1 ${
                        s < step ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Native Language */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  What's your native language?
                </h2>
                <div className="space-y-3">
                  {['English', 'Spanish', 'Mandarin', 'French', 'German', 'Japanese'].map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setFormData({ ...formData, nativeLanguage: lang });
                          setError('');
                        }}
                        className={`w-full p-4 text-left border-2 rounded-lg font-medium transition ${
                          formData.nativeLanguage === lang
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {lang}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Language */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  What language do you want to learn?
                </h2>
                <div className="space-y-3">
                  {['Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese'].map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setFormData({ ...formData, targetLanguage: lang });
                          setError('');
                        }}
                        className={`w-full p-4 text-left border-2 rounded-lg font-medium transition ${
                          formData.targetLanguage === lang
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {lang}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Learning Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  What's your learning goal?
                </h2>
                <textarea
                  value={formData.goal}
                  onChange={(e) => {
                    setFormData({ ...formData, goal: e.target.value });
                    setError('');
                  }}
                  placeholder="e.g., Achieve conversational fluency for travel and business"
                  className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Tell us about yourself
                </h2>
                <textarea
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData({ ...formData, bio: e.target.value });
                    setError('');
                  }}
                  placeholder="Share your background, profession, or interests..."
                  className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4 justify-between">
            <Button
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            {step < 4 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Completing...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
