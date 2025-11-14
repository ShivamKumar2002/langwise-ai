'use client';

import { SkillLevel } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface ProgressSummaryProps {
  skills: SkillLevel[];
  currentLevel: string;
  nextLevel: string;
}

export function ProgressSummary({ skills, currentLevel, nextLevel }: ProgressSummaryProps) {
  const averageSkill = Math.round(
    skills.reduce((acc, s) => acc + s.level, 0) / skills.length
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-sm text-blue-600 font-medium mb-1">Average Skill Level</p>
        <p className="text-4xl font-bold text-blue-900">{averageSkill}</p>
        <p className="text-xs text-blue-600 mt-2">Out of 100</p>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-sm text-slate-600 font-medium mb-1">Current Level</p>
        <p className="text-4xl font-bold text-slate-900">{currentLevel}</p>
        <p className="text-xs text-slate-600 mt-2">CEFR Framework</p>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
        <p className="text-sm text-green-600 font-medium mb-1">Next Target</p>
        <p className="text-4xl font-bold text-green-900">{nextLevel}</p>
        <p className="text-xs text-green-600 mt-2">Your next milestone</p>
      </Card>
    </div>
  );
}
