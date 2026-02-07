'use client';

import { Question, AnswerId, QUESTION_TYPE_LABELS, QuestionType } from '@/types/question';
import { Badge } from '@/components/ui/badge';
import { AnswerChoice } from './AnswerChoice';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Flag } from 'lucide-react';

const TYPE_BADGE_CLASS: Record<QuestionType, string> = {
  'central-ideas': 'badge-info',
  'inferences': 'badge-info',
  'command-of-evidence': 'badge-info',
  'words-in-context': 'badge-craft',
  'text-structure-purpose': 'badge-craft',
  'cross-text-connections': 'badge-craft',
  'rhetorical-synthesis': 'badge-expression',
  'transitions': 'badge-expression',
  'boundaries': 'badge-conventions',
  'form-structure-sense': 'badge-conventions',
};

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: AnswerId | null;
  onSelectAnswer: (answer: AnswerId) => void;
  showResult?: boolean;
  isFlagged?: boolean;
  className?: string;
}

export function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  isFlagged = false,
  className,
}: QuestionPanelProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{questionNumber}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              sur {totalQuestions}
            </span>
          </div>
          <Badge className={cn('text-xs font-medium px-3 py-1 rounded-full', TYPE_BADGE_CLASS[question.type])}>
            {QUESTION_TYPE_LABELS[question.type]}
          </Badge>
        </div>
        {isFlagged && (
          <Badge variant="warning" className="text-xs rounded-full">
            <Flag className="w-3 h-3 mr-1.5" />
            Marqué
          </Badge>
        )}
      </div>

      {/* Question Text */}
      <div className="glass-cosmic p-5">
        <p className="font-medium text-foreground text-base leading-relaxed">
          {question.questionText}
        </p>
      </div>

      {/* Answer Choices */}
      <div className="space-y-3">
        {question.choices.map((choice, index) => {
          const isSelected = selectedAnswer === choice.id;
          const isCorrect = choice.id === question.correctAnswer;

          let status: 'default' | 'selected' | 'correct' | 'incorrect' = 'default';
          if (showResult) {
            if (isCorrect) {
              status = 'correct';
            } else if (isSelected && !isCorrect) {
              status = 'incorrect';
            }
          } else if (isSelected) {
            status = 'selected';
          }

          return (
            <div
              key={choice.id}
              className="animate-in"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <AnswerChoice
                id={choice.id}
                text={choice.text}
                status={status}
                onClick={() => !showResult && onSelectAnswer(choice.id)}
                disabled={showResult}
              />
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div
          className={cn(
            'p-5 rounded-2xl border animate-in',
            selectedAnswer === question.correctAnswer
              ? 'bg-success/10 border-success/30'
              : 'bg-destructive/10 border-destructive/30'
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            {selectedAnswer === question.correctAnswer ? (
              <>
                <div className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-success">Correct !</p>
                  <p className="text-xs text-success/70">Excellente réponse</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-xl bg-destructive/15 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-destructive">Incorrect</p>
                  <p className="text-xs text-destructive/70">La réponse correcte est {question.correctAnswer}</p>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
