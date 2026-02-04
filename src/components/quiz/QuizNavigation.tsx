'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
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
    <Card>
      <CardContent className="py-4 space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium text-foreground">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Indicators */}
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = index < answeredCount;

            return (
              <button
                key={index}
                onClick={() => onGoTo(index)}
                className={cn(
                  'w-7 h-7 rounded-md text-xs font-medium transition-all duration-150',
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isAnswered
                    ? 'bg-success-soft text-success'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
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
              className={cn(isFlagged && 'border-accent text-accent bg-accent-soft')}
            >
              <Flag className="w-4 h-4 mr-1" />
              {isFlagged ? 'Marqué' : 'Marquer'}
            </Button>

            <Button size="sm" onClick={onSubmit} disabled={!canSubmit} className="btn-glow">
              <Send className="w-4 h-4 mr-1" />
              Terminer
            </Button>
          </div>
        </div>

        {/* Flagged count */}
        {flaggedQuestions.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {flaggedQuestions.length} question{flaggedQuestions.length > 1 ? 's' : ''} marquée{flaggedQuestions.length > 1 ? 's' : ''} à revoir
          </p>
        )}
      </CardContent>
    </Card>
  );
}
