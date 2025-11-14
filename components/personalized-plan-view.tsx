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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Your Assessment Results</h2>
        <div className="flex items-center gap-6 mt-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Current Level</p>
            <p className="text-4xl font-bold">{plan.currentLevel}</p>
          </div>
          <div className="text-2xl">→</div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Next Level</p>
            <p className="text-4xl font-bold">{plan.nextLevel}</p>
          </div>
        </div>
      </div>

      {/* Skills Overview */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Skill Assessment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plan.skills.map((skill) => (
            <SkillCard key={skill.category} skill={skill} />
          ))}
        </div>
      </Card>

      {/* Strengths */}
      {plan.strengths.length > 0 && (
        <Card className="p-8 border-l-4 border-green-500">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">✓</span> Your Strengths
          </h3>
          <ul className="space-y-2">
            {plan.strengths.map((strength, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span className="text-slate-700">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Weak Areas */}
      {plan.weakAreas.length > 0 && (
        <Card className="p-8 border-l-4 border-orange-500">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {plan.weakAreas.map((area, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-orange-600 font-bold">•</span>
                <span className="text-slate-700">{area}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Coaching Tips */}
      {plan.coachingTips.length > 0 && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span> Personalized Coaching Tips
          </h3>
          <div className="space-y-3">
            {plan.coachingTips.map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-lg">
                <span className="text-blue-600 font-bold text-lg flex-shrink-0">{i + 1}</span>
                <p className="text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Learning Units */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Your Learning Plan</h3>
        <p className="text-slate-600 mb-6">
          Complete these units in order to progress from {plan.currentLevel} to{' '}
          {plan.nextLevel}
        </p>
        <div className="space-y-4">
          {plan.learningUnits.map((unit, i) => (
            <LearningUnitCard key={unit.id} unit={unit} index={i} />
          ))}
        </div>
      </Card>

      {/* Progress Tracker */}
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Next Steps</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-lg">1️⃣</span>
            <p className="text-slate-700">Start with the first learning unit above</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-lg">2️⃣</span>
            <p className="text-slate-700">Practice daily for 15-30 minutes</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-lg">3️⃣</span>
            <p className="text-slate-700">Take another assessment in 2 weeks</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="text-lg">4️⃣</span>
            <p className="text-slate-700">
              See your progress and adjust your learning plan
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
