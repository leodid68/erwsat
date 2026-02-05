'use client';

import { Question, AnswerId, QUESTION_TYPE_LABELS, QuestionType } from '@/types/question';
import { Badge } from '@/components/ui/badge';
import { AnswerChoice } from './AnswerChoice';
import { cn } from '@/lib/utils';
import { BookOpen, CheckCircle2, XCircle, Flag, Sparkles } from 'lucide-react';

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
      <div className="space-y-3">
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
                <span className="italic text-foreground/80">{dialogue}</span>
              </p>
            );
          }

          return (
            <p key={i} className="italic text-foreground/80">{trimmed}</p>
          );
        })}
      </div>
    );
  }

  // Regular prose - show as indented paragraph
  return (
    <p className="indent-6 text-justify italic text-foreground/80 leading-relaxed">{text}</p>
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
    <div className="space-y-6 animate-in">
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

      {/* Passage - Glass Card */}
      <div className="glass-passage p-5 animate-in animate-delay-1">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-4">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="uppercase tracking-wider">Lisez le passage</span>
        </div>
        <div className="text-sm leading-relaxed">
          <FormattedPassage text={question.passage} />
        </div>
      </div>

      {/* Question - Main Glass Card */}
      <div className="glass-cosmic p-6 animate-in animate-delay-2">
        <p className="font-medium text-foreground mb-6 text-lg leading-relaxed">
          {question.questionText}
        </p>

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
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
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
              'mt-6 p-5 rounded-2xl border animate-in animate-delay-5',
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
    </div>
  );
}
