'use client';

import { SkillLevel } from '@/lib/types';

interface SkillCardProps {
  skill: SkillLevel;
  maxLevel?: number;
}

export function SkillCard({ skill, maxLevel = 100 }: SkillCardProps) {
  const percentage = (skill.level / maxLevel) * 100;
  const trendIcon = {
    improving: '↗️',
    stable: '→',
    declining: '↘️',
  }[skill.trend];

  const trendColor = {
    improving: 'text-green-600',
    stable: 'text-slate-600',
    declining: 'text-orange-600',
  }[skill.trend];

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{skill.category}</h3>
        <span className={`text-lg ${trendColor}`}>{trendIcon}</span>
      </div>

      <div className="mb-2">
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-900">{skill.level}</span>
        <span className="text-xs text-slate-500">/ {maxLevel}</span>
      </div>
    </div>
  );
}
