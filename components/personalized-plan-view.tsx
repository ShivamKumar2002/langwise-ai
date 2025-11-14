'use client';

import { PersonalizedPlan } from '@/lib/types';
import { SkillCard } from './skill-card';
import { LearningUnitCard } from './learning-unit-card';
import { Card } from '@/components/ui/card';

interface PersonalizedPlanViewProps {
  plan: PersonalizedPlan;
}

export function PersonalizedPlanView({ plan }: PersonalizedPlanViewProps) {
  return (
    <div className="space-y-8">
      {/* Header with Level Info */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-r from-blue-600 to-indigo-600 text-white p-8 shadow-md">
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
          <div className="absolute -top-20 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Your Assessment Results</h2>
          <p className="text-sm text-blue-100/90">
            A personalized snapshot of where you are today and where you&apos;re
            headed next.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div>
              <p className="text-blue-100 text-xs font-medium mb-1 uppercase tracking-wide">
                Current Level
              </p>
              <p className="text-4xl font-bold">{plan.currentLevel}</p>
            </div>
            <div className="text-2xl opacity-90">→</div>
            <div>
              <p className="text-blue-100 text-xs font-medium mb-1 uppercase tracking-wide">
                Next Level
              </p>
              <p className="text-4xl font-bold">{plan.nextLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Overview */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Skill Assessment
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Each skill below shows how you performed and where to focus next.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plan.skills.map((skill) => (
            <SkillCard key={skill.category} skill={skill} />
          ))}
        </div>
      </Card>

      {/* Strengths */}
      {plan.strengths.length > 0 && (
        <Card className="p-8 border-l-4 border-emerald-500">
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">✓</span> Your Strengths
          </h3>
          <ul className="space-y-2">
            {plan.strengths.map((strength, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  •
                </span>
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Weak Areas */}
      {plan.weakAreas.length > 0 && (
        <Card className="p-8 border-l-4 border-orange-500">
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {plan.weakAreas.map((area, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-orange-600 dark:text-orange-400 font-bold">
                  •
                </span>
                <span className="text-muted-foreground">{area}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Coaching Tips */}
      {plan.coachingTips.length > 0 && (
        <Card className="p-8 bg-linear-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-900 dark:to-slate-900 border-l-4 border-blue-500">
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span> Personalized Coaching Tips
          </h3>
          <div className="space-y-3">
            {plan.coachingTips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 bg-card rounded-lg border border-border/60"
              >
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0">
                  {i + 1}
                </span>
                <p className="text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Learning Units */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Your Learning Plan
        </h3>
        <p className="text-muted-foreground mb-6">
          Complete these units in order to progress from {plan.currentLevel} to{" "}
          {plan.nextLevel}
        </p>
        <div className="space-y-4">
          {plan.learningUnits.map((unit, i) => (
            <LearningUnitCard key={unit.id} unit={unit} index={i} />
          ))}
        </div>
      </Card>

      {/* Progress Tracker */}
      <Card className="p-8 bg-linear-to-br from-green-50/80 to-emerald-50/80 dark:from-slate-900 dark:to-slate-900">
        <h3 className="text-2xl font-bold text-foreground mb-4">Next Steps</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/60">
            <span className="text-lg">1️⃣</span>
            <p className="text-muted-foreground">
              Start with the first learning unit above
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/60">
            <span className="text-lg">2️⃣</span>
            <p className="text-muted-foreground">
              Practice daily for 15-30 minutes
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/60">
            <span className="text-lg">3️⃣</span>
            <p className="text-muted-foreground">
              Take another assessment in 2 weeks
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/60">
            <span className="text-lg">4️⃣</span>
            <p className="text-muted-foreground">
              See your progress and adjust your learning plan
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
