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
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nativeLanguage: user?.nativeLanguage || "English",
    targetLanguage: user?.targetLanguage || "Spanish",
    goal: "",
    bio: "",
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

  useEffect(() => {
    if (isHydrated && user?.hasLearningPlan) {
      console.log(
        "[v0] User already has a learning plan, redirecting to dashboard"
      );
      router.replace("/dashboard");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user || user.hasLearningPlan) {
    return null;
  }

  const handleNext = () => {
    if (step === 1 && !formData.nativeLanguage) {
      setError("Please select your native language");
      return;
    }
    if (step === 2 && !formData.targetLanguage) {
      setError("Please select your target language");
      return;
    }
    if (step === 3 && !formData.goal) {
      setError("Please describe your learning goal");
      return;
    }

    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.bio) {
      setError("Please tell us about yourself");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await saveOnboarding(user.userId, {
        nativeLanguage: formData.nativeLanguage,
        targetLanguage: formData.targetLanguage,
        goal: formData.goal,
        bio: formData.bio,
      });

      console.log("[v0] Onboarding complete, redirecting to dashboard");
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save onboarding";
      setError(message);
      console.error("[v0] Onboarding error:", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-2xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Welcome, {user.name}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Let&apos;s set up your learning profile
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Card className="p-8 shadow-xl bg-card/95 backdrop-blur-sm border-border/60">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      s === step
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : s < step
                        ? "bg-emerald-500 text-emerald-50"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`h-1 w-12 mx-1 rounded-full ${
                        s < step ? "bg-emerald-500" : "bg-muted"
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
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  What's your native language?
                </h2>
                <div className="space-y-3">
                  {[
                    "English",
                    "Spanish",
                    "Mandarin",
                    "French",
                    "German",
                    "Japanese",
                  ].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setFormData({ ...formData, nativeLanguage: lang });
                        setError("");
                      }}
                      className={`w-full p-4 text-left border-2 rounded-lg font-medium transition ${
                        formData.nativeLanguage === lang
                          ? "border-primary bg-primary/5 text-primary-foreground/90 dark:bg-primary/15"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Language */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  What language do you want to learn?
                </h2>
                <div className="space-y-3">
                  {[
                    "Spanish",
                    "French",
                    "German",
                    "Mandarin",
                    "Japanese",
                    "Portuguese",
                  ].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setFormData({ ...formData, targetLanguage: lang });
                        setError("");
                      }}
                      className={`w-full p-4 text-left border-2 rounded-lg font-medium transition ${
                        formData.targetLanguage === lang
                          ? "border-primary bg-primary/5 text-primary-foreground/90 dark:bg-primary/15"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Learning Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  What's your learning goal?
                </h2>
                <textarea
                  value={formData.goal}
                  onChange={(e) => {
                    setFormData({ ...formData, goal: e.target.value });
                    setError("");
                  }}
                  placeholder="e.g., Achieve conversational fluency for travel and business"
                  className="w-full p-4 border-2 border-border rounded-lg bg-background/60 focus:border-primary focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Tell us about yourself
                </h2>
                <textarea
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData({ ...formData, bio: e.target.value });
                    setError("");
                  }}
                  placeholder="Share your background, profession, or interests..."
                  className="w-full p-4 border-2 border-border rounded-lg bg-background/60 focus:border-primary focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
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
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Completing...
                  </div>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
