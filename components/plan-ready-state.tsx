'use client';

import { Confetti } from './confetti';
import { Card } from '@/components/ui/card';

interface PlanReadyStateProps {
  userName: string;
}

export function PlanReadyState({ userName }: PlanReadyStateProps) {
  return (
    <div className="text-center py-12">
      <Confetti />
      
      <div className="relative z-10">
        <div className="mb-6 text-6xl animate-bounce">✨</div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Congratulations, {userName}!
        </h2>
        
        <p className="text-lg text-slate-600 mb-6">
          Your personalized learning plan is ready
        </p>

        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 inline-block">
          <p className="text-sm text-green-600 font-semibold mb-1">Assessment Complete</p>
          <p className="text-2xl font-bold text-green-900">
            Scroll down to view your results and learning plan
          </p>
        </Card>
      </div>
    </div>
  );
}
