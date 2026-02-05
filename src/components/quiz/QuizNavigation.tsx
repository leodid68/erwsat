'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface QuizNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedQuestions: string[];
  currentQuestionId: string;
  onPrevious: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onToggleFlag: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function QuizNavigation({
  currentIndex,
  totalQuestions,
  answeredCount,
  flaggedQuestions,
  currentQuestionId,
  onPrevious,
  onNext,
  onGoTo,
  onToggleFlag,
  onSubmit,
  canSubmit,
}: QuizNavigationProps) {
  const progressPercent = (answeredCount / totalQuestions) * 100;
  const isFlagged = flaggedQuestions.includes(currentQuestionId);

  return (
    <div className="glass-cosmic p-5 space-y-4 animate-in animate-delay-3">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium text-foreground">
            <span className="text-primary">{answeredCount}</span>/{totalQuestions}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Indicators */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = index < answeredCount;
          const isQuestionFlagged = flaggedQuestions.includes(`q-${index}`);

          return (
            <button
              key={index}
              onClick={() => onGoTo(index)}
              className={cn(
                'w-8 h-8 rounded-xl text-xs font-semibold transition-all duration-200 relative',
                'border flex items-center justify-center',
                isCurrent
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-400/50 shadow-md'
                  : isAnswered
                  ? 'bg-success/10 text-success border-success/30 hover:border-success/50'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted hover:border-primary/20 hover:text-foreground'
              )}
            >
              {isAnswered && !isCurrent ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFlag}
            className={cn(
              isFlagged && 'border-amber-500/50 text-amber-400 bg-amber-500/10'
            )}
          >
            <Flag className="w-4 h-4 mr-1" />
            {isFlagged ? 'Marqué' : 'Marquer'}
          </Button>

          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="btn-cosmic text-white"
          >
            <Send className="w-4 h-4 mr-1" />
            Terminer
          </Button>
        </div>
      </div>

      {/* Flagged count */}
      {flaggedQuestions.length > 0 && (
        <p className="text-xs text-warning text-center">
          <Flag className="w-3 h-3 inline mr-1" />
          {flaggedQuestions.length} question{flaggedQuestions.length > 1 ? 's' : ''} marquée{flaggedQuestions.length > 1 ? 's' : ''} à revoir
        </p>
      )}
    </div>
  );
}
