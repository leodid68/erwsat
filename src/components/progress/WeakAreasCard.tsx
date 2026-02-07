'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { QuestionType, QUESTION_TYPE_LABELS } from '@/types/question';
import { AlertTriangle, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface WeakAreasCardProps {
  accuracyByType: Record<QuestionType, { correct: number; total: number }>;
  className?: string;
}

interface CategoryAnalysis {
  type: QuestionType;
  label: string;
  accuracy: number;
  total: number;
  status: 'weak' | 'improving' | 'strong';
  recommendation: string;
}

const RECOMMENDATIONS: Record<QuestionType, { weak: string; improving: string }> = {
  // Information and Ideas
  'central-ideas': {
    weak: 'Practice identifying main ideas. Summarize each paragraph in one sentence.',
    improving: 'Great progress! Focus on supporting details that reinforce main ideas.',
  },
  'inferences': {
    weak: 'Work on drawing logical conclusions. Look for implicit clues in the text.',
    improving: 'Good progress! Practice multi-step inferences.',
  },
  'command-of-evidence': {
    weak: 'Learn to identify quotes that support specific claims.',
    improving: 'Keep going! Refine your ability to distinguish direct and indirect evidence.',
  },
  // Craft and Structure
  'words-in-context': {
    weak: 'Work on vocabulary in context. Read varied texts and note unfamiliar words.',
    improving: 'Keep enriching your vocabulary. Try more challenging texts.',
  },
  'text-structure-purpose': {
    weak: 'Analyze text structure. Identify transitions and organization of ideas.',
    improving: 'Good progress! Focus on nuances of tone and intent.',
  },
  'cross-text-connections': {
    weak: 'Practice comparing texts. Identify points of agreement and disagreement.',
    improving: 'Good progress! Work on nuances between similar perspectives.',
  },
  // Expression of Ideas
  'rhetorical-synthesis': {
    weak: 'Practice synthesizing information. Combine notes into coherent sentences.',
    improving: 'Keep going! Work on achieving specific rhetorical goals.',
  },
  'transitions': {
    weak: 'Learn transition words (however, therefore, furthermore) and their uses.',
    improving: 'Good progress! Refine your transition choices based on context.',
  },
  // Standard English Conventions
  'boundaries': {
    weak: 'Review punctuation rules: commas, semicolons, colons.',
    improving: 'Good progress! Focus on subtle punctuation cases.',
  },
  'form-structure-sense': {
    weak: 'Review grammar rules: subject-verb agreement, verb tense, pronouns.',
    improving: 'Good progress! Refine your knowledge of parallel structures.',
  },
};

export function WeakAreasCard({ accuracyByType, className }: WeakAreasCardProps) {
  const analysis = useMemo((): CategoryAnalysis[] => {
    return Object.entries(accuracyByType)
      .filter(([type, stats]) =>
        stats.total >= 3 && // Need at least 3 questions for analysis
        QUESTION_TYPE_LABELS[type as QuestionType] && // Must be a valid type
        RECOMMENDATIONS[type as QuestionType] // Must have recommendations
      )
      .map(([type, stats]) => {
        const accuracy = (stats.correct / stats.total) * 100;
        let status: 'weak' | 'improving' | 'strong';

        if (accuracy < 50) {
          status = 'weak';
        } else if (accuracy < 75) {
          status = 'improving';
        } else {
          status = 'strong';
        }

        return {
          type: type as QuestionType,
          label: QUESTION_TYPE_LABELS[type as QuestionType],
          accuracy: Math.round(accuracy),
          total: stats.total,
          status,
          recommendation:
            status === 'strong'
              ? ''
              : RECOMMENDATIONS[type as QuestionType][status],
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy); // Weakest first
  }, [accuracyByType]);

  const weakAreas = analysis.filter((a) => a.status === 'weak');
  const improvingAreas = analysis.filter((a) => a.status === 'improving');

  if (analysis.length === 0) {
    return null; // Not enough data
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">À améliorer</span>
          </div>
          {weakAreas.map((area) => (
            <div
              key={area.type}
              className="p-3 rounded-xl bg-yellow-50/80 border border-yellow-200/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-yellow-900">
                  {area.label}
                </span>
                <span className="text-sm font-bold text-yellow-700">
                  {area.accuracy}%
                </span>
              </div>
              <p className="text-xs text-yellow-700/80">
                <Lightbulb className="w-3 h-3 inline mr-1" />
                {area.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Improving Areas */}
      {improvingAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">En progression</span>
          </div>
          {improvingAreas.map((area) => (
            <div
              key={area.type}
              className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-blue-900">
                  {area.label}
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {area.accuracy}%
                </span>
              </div>
              <p className="text-xs text-blue-700/80">
                <Lightbulb className="w-3 h-3 inline mr-1" />
                {area.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Strong Areas */}
      {weakAreas.length === 0 && improvingAreas.length === 0 && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/50">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Target className="w-4 h-4" />
            <span className="font-medium">Excellent niveau !</span>
          </div>
          <p className="text-sm text-emerald-700/80">
            Vous maîtrisez bien toutes les catégories. Continuez à pratiquer pour maintenir ce niveau.
          </p>
        </div>
      )}
    </div>
  );
}
