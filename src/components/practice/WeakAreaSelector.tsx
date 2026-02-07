'use client';

import { QuestionType, QUESTION_TYPE_LABELS, QUESTION_TYPE_DESCRIPTIONS } from '@/types/question';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeakAreaSelectorProps {
  accuracyByType: Record<QuestionType, { correct: number; total: number }>;
  selectedTypes: QuestionType[];
  onToggleType: (type: QuestionType) => void;
  threshold?: number; // Default 70%
}

export function WeakAreaSelector({
  accuracyByType,
  selectedTypes,
  onToggleType,
  threshold = 70,
}: WeakAreaSelectorProps) {
  // Sort types by accuracy (weakest first)
  const sortedTypes = Object.entries(accuracyByType)
    .filter(([type]) => QUESTION_TYPE_LABELS[type as QuestionType])
    .map(([type, stats]) => ({
      type: type as QuestionType,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null,
      total: stats.total,
      correct: stats.correct,
    }))
    .sort((a, b) => {
      // Untried types go to the end
      if (a.accuracy === null && b.accuracy === null) return 0;
      if (a.accuracy === null) return 1;
      if (b.accuracy === null) return -1;
      return a.accuracy - b.accuracy;
    });

  const weakTypes = sortedTypes.filter(
    (t) => t.accuracy !== null && t.accuracy < threshold
  );

  const getStatusColor = (accuracy: number | null) => {
    if (accuracy === null) return 'text-muted-foreground';
    if (accuracy >= 80) return 'text-emerald-400';
    if (accuracy >= threshold) return 'text-amber-400';
    return 'text-red-400';
  };

  const getProgressColor = (accuracy: number | null) => {
    if (accuracy === null) return 'bg-slate-600';
    if (accuracy >= 80) return 'bg-emerald-500';
    if (accuracy >= threshold) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      {weakTypes.length > 0 ? (
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>
            {weakTypes.length} catégorie{weakTypes.length !== 1 ? 's' : ''} sous {threshold}%
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Toutes les catégories sont au-dessus de {threshold}%</span>
        </div>
      )}

      {/* Type List */}
      <div className="space-y-2">
        {sortedTypes.map(({ type, accuracy, total, correct }) => {
          const isWeak = accuracy !== null && accuracy < threshold;
          const isSelected = selectedTypes.includes(type);
          const label = QUESTION_TYPE_LABELS[type];
          const description = QUESTION_TYPE_DESCRIPTIONS[type];

          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              disabled={total === 0}
              className={cn(
                'w-full p-4 rounded-xl text-left transition-all duration-200',
                total === 0
                  ? 'bg-white/50 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-white/60 border-2 border-blue-800/50'
                  : isWeak
                  ? 'bg-red-500/10 border-2 border-red-500/20 hover:border-red-500/40'
                  : 'bg-white/50 border-2 border-transparent hover:bg-white/60'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{label}</p>
                    {isWeak && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <div className="text-right">
                  <p className={cn('font-mono text-lg', getStatusColor(accuracy))}>
                    {accuracy !== null ? `${accuracy}%` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {total > 0 ? `${correct}/${total}` : 'Non essayé'}
                  </p>
                </div>
              </div>
              {total > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getProgressColor(accuracy))}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
