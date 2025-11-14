'use client';

import { LearningUnit } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface LearningUnitCardProps {
  unit: LearningUnit;
  index: number;
}

export function LearningUnitCard({ unit, index }: LearningUnitCardProps) {
  const typeColors = {
    grammar: 'bg-blue-100 text-blue-800',
    vocabulary: 'bg-purple-100 text-purple-800',
    conversation: 'bg-green-100 text-green-800',
    pronunciation: 'bg-orange-100 text-orange-800',
  };

  const difficultyColors = {
    A1: 'bg-slate-100 text-slate-700',
    A2: 'bg-slate-100 text-slate-700',
    B1: 'bg-blue-100 text-blue-700',
    B2: 'bg-blue-100 text-blue-700',
    C1: 'bg-purple-100 text-purple-700',
    C2: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="p-4 border-l-4 border-blue-500 bg-white rounded-lg hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-blue-600">Unit {index + 1}</span>
            <Badge className={typeColors[unit.type]}>{unit.type}</Badge>
          </div>
          <h3 className="font-semibold text-slate-900">{unit.title}</h3>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-3">{unit.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors[unit.difficulty]}>
            {unit.difficulty}
          </Badge>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {unit.estimatedMinutes} min
        </span>
      </div>
    </div>
  );
}
