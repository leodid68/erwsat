'use client';

import { Question, AnswerId, QUESTION_TYPE_LABELS, QuestionType } from '@/types/question';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnswerChoice } from './AnswerChoice';
import { cn } from '@/lib/utils';
import { BookOpen, CheckCircle2, XCircle, Flag } from 'lucide-react';

const TYPE_BADGE_CLASS: Record<QuestionType, string> = {
  // Information and Ideas
  'central-ideas': 'badge-info',
  'inferences': 'badge-info',
  'command-of-evidence': 'badge-info',
  // Craft and Structure
  'words-in-context': 'badge-craft',
  'text-structure-purpose': 'badge-craft',
  'cross-text-connections': 'badge-craft',
  // Expression of Ideas
  'rhetorical-synthesis': 'badge-expression',
  'transitions': 'badge-expression',
  // Standard English Conventions
  'boundaries': 'badge-conventions',
  'form-structure-sense': 'badge-conventions',
};

/**
 * Format passage text for better readability
 * - Detects dialogue (Character: or CHARACTER.) and adds line breaks
 * - Formats character names in bold
 */
function FormattedPassage({ text }: { text: string }) {
  // Pattern for dialogue: "Name:" or "Name." at start or after space
  // Matches: Rom. Ben. Mer. Romeo: Juliet: etc.
  const dialoguePattern = /(?:^|\s)([A-Z][a-z]{0,15}(?:\.|:))\s/g;

  // Check if this looks like dialogue (has multiple character markers)
  const matches = text.match(dialoguePattern);
  const isDialogue = matches && matches.length >= 2;

  if (isDialogue) {
    // Split on character names and format
    const parts = text.split(/(?=(?:^|\s)[A-Z][a-z]{0,15}(?:\.|:)\s)/);

    return (
      <div className="space-y-2">
        {parts.map((part, i) => {
          const trimmed = part.trim();
          if (!trimmed) return null;

          // Extract character name if present
          const charMatch = trimmed.match(/^([A-Z][a-z]{0,15}(?:\.|:))\s*(.*)$/s);

          if (charMatch) {
            const [, charName, dialogue] = charMatch;
            return (
              <p key={i} className="pl-4">
                <span className="font-semibold text-primary">{charName}</span>{' '}
                <span className="italic">{dialogue}</span>
              </p>
            );
          }

          return (
            <p key={i} className="italic">{trimmed}</p>
          );
        })}
      </div>
    );
  }

  // Regular prose - show as indented paragraph
  return (
    <p className="indent-6 text-justify italic">{text}</p>
  );
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: AnswerId | null;
  onSelectAnswer: (answer: AnswerId) => void;
  showResult?: boolean;
  isFlagged?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  isFlagged = false,
}: QuestionCardProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Question {questionNumber} sur {totalQuestions}
          </span>
          <Badge className={cn('text-xs font-medium', TYPE_BADGE_CLASS[question.type])}>
            {QUESTION_TYPE_LABELS[question.type]}
          </Badge>
        </div>
        {isFlagged && (
          <Badge variant="outline" className="text-xs border-accent text-accent">
            <Flag className="w-3 h-3 mr-1" />
            Marqué
          </Badge>
        )}
      </div>

      {/* Passage */}
      <Card className="border-l-4 border-l-primary bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
            <BookOpen className="w-4 h-4" />
            Lisez le passage
          </div>
          <div className="text-sm leading-relaxed text-foreground">
            <FormattedPassage text={question.passage} />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="py-5">
          <p className="font-medium text-foreground mb-5">{question.questionText}</p>

          {/* Answer Choices */}
          <div className="space-y-2">
            {question.choices.map((choice) => {
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
                <AnswerChoice
                  key={choice.id}
                  id={choice.id}
                  text={choice.text}
                  status={status}
                  onClick={() => !showResult && onSelectAnswer(choice.id)}
                  disabled={showResult}
                />
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div
              className={cn(
                'mt-5 p-4 rounded-lg border',
                selectedAnswer === question.correctAnswer
                  ? 'bg-success-soft border-success/30'
                  : 'bg-destructive-soft border-destructive/30'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === question.correctAnswer ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <p className={cn(
                  'font-semibold text-sm',
                  selectedAnswer === question.correctAnswer ? 'text-success' : 'text-destructive'
                )}>
                  {selectedAnswer === question.correctAnswer
                    ? 'Correct !'
                    : `Incorrect. La réponse est ${question.correctAnswer}.`}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
