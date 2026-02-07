'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface QuizBottomNavProps {
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

export function QuizBottomNav({
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
}: QuizBottomNavProps) {
  const progressPercent = (answeredCount / totalQuestions) * 100;
  const isFlagged = flaggedQuestions.includes(currentQuestionId);

  return (
    <div className="h-full flex flex-col">
      {/* Progress bar at top of bottom nav */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-between px-4 gap-3">
        {/* Left: Previous / Next */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="h-9"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className="h-9"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Center: Compact question dots */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-[50%] scrollbar-thin py-1">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = index < answeredCount;

            return (
              <button
                key={index}
                onClick={() => onGoTo(index)}
                className={cn(
                  'shrink-0 rounded-full transition-all duration-200',
                  isCurrent
                    ? 'w-7 h-7 bg-gradient-to-br from-violet-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-violet-700/30'
                    : isAnswered
                    ? 'w-3 h-3 bg-emerald-500/60 hover:bg-emerald-500/80'
                    : 'w-3 h-3 bg-white/15 hover:bg-white/25'
                )}
                title={`Question ${index + 1}`}
              >
                {isCurrent && (index + 1)}
              </button>
            );
          })}
        </div>

        {/* Mobile: text indicator */}
        <div className="md:hidden text-sm text-muted-foreground font-medium">
          <span className="text-primary">{currentIndex + 1}</span>/{totalQuestions}
        </div>

        {/* Right: Flag + Submit */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFlag}
            className={cn(
              'h-9',
              isFlagged && 'border-amber-500/50 text-amber-400 bg-amber-500/10'
            )}
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">{isFlagged ? 'Marqué' : 'Marquer'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="btn-cosmic text-white h-9"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Terminer</span>
          </Button>

          {flaggedQuestions.length > 0 && (
            <span className="text-xs text-warning hidden lg:inline">
              <Flag className="w-3 h-3 inline mr-0.5" />
              {flaggedQuestions.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
