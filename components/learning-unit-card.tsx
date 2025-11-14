'use client';

import { LearningUnit } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface LearningUnitCardProps {
  unit: LearningUnit;
  index: number;
}

export function LearningUnitCard({ unit, index }: LearningUnitCardProps) {
  const typeColors = {
    grammar:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100 border border-blue-200/60 dark:border-blue-700/60",
    vocabulary:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100 border border-purple-200/60 dark:border-purple-700/60",
    conversation:
      "bg-green-100 text-green-800 dark:bg-emerald-900/40 dark:text-emerald-100 border border-emerald-200/60 dark:border-emerald-700/60",
    pronunciation:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-100 border border-orange-200/60 dark:border-orange-700/60",
  };

  const difficultyColors = {
    A1: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60",
    A2: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60",
    B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100 border border-blue-200/60 dark:border-blue-700/60",
    B2: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100 border border-blue-200/60 dark:border-blue-700/60",
    C1: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-100 border border-purple-200/60 dark:border-purple-700/60",
    C2: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-100 border border-purple-200/60 dark:border-purple-700/60",
  };

  return (
    <div className="p-4 border-l-4 border-primary/80 bg-card/95 rounded-lg hover:shadow-lg transition shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Unit {index + 1}
            </span>
            <Badge className={typeColors[unit.type]}>{unit.type}</Badge>
          </div>
          <h3 className="font-semibold text-foreground">{unit.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{unit.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors[unit.difficulty]}>
            {unit.difficulty}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {unit.estimatedMinutes} min
        </span>
      </div>
    </div>
  );
}
