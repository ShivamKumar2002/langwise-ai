'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { loginUser } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [userId, setUserId] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginUser(userId, authCode);

      setAuth(result.user, result.token);
      const nextRoute = result.user.hasLearningPlan
        ? "/dashboard"
        : "/onboarding";
      console.log("[v0] Login successful, redirecting to", nextRoute);

      router.push(nextRoute);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      console.error("[v0] Login error:", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUserId: string) => {
    setUserId(demoUserId);

    // Map demo user to correct auth code
    const demoCodes: Record<string, string> = {
      test_user_1: "secret123",
      test_user_2: "secret456",
      test_user_3: "secret789",
    };

    setAuthCode(demoCodes[demoUserId] || "");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">LangWiseAI</h1>
          <p className="text-slate-600">Voice-Powered Language Assessment</p>
        </div>

        <Card className="p-8 bg-white shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                User ID
              </label>
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., test_user_1"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Auth Code
              </label>
              <Input
                type="password"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Enter your auth code"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !userId || !authCode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {["test_user_1", "test_user_2", "test_user_3"].map((demoId) => (
                <button
                  key={demoId}
                  type="button"
                  onClick={() => handleDemoLogin(demoId)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                >
                  Login as {demoId}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          Demo credentials provided for testing the MVP
        </p>
      </div>
    </div>
  );
}
