'use client';

export function PlanLoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-200 rounded-lg p-8 h-32" />

      {/* Skills Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-lg p-4 h-24" />
          ))}
        </div>
      </div>

      {/* Sections Skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div
                key={j}
                className="h-4 bg-slate-100 rounded"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
