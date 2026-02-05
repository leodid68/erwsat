'use client';

import { useState } from 'react';
import { Question, QUESTION_TYPE_LABELS } from '@/types/question';
import { SRSGrade, SRS_GRADE_LABELS, SRS_GRADE_COLORS } from '@/types/srs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SRSCardProps {
  question: Question;
  onGrade: (grade: SRSGrade) => void;
  onSkip: () => void;
}

export function SRSCard({ question, onGrade, onSkip }: SRSCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGrade = (grade: SRSGrade) => {
    setShowAnswer(false);
    onGrade(grade);
  };

  return (
    <Card className="glass-cosmic">
      <CardContent className="p-6 space-y-6">
        {/* Question Type Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {QUESTION_TYPE_LABELS[question.type]}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              question.difficulty === 'easy' && 'border-emerald-500/30 text-emerald-400',
              question.difficulty === 'medium' && 'border-amber-500/30 text-amber-400',
              question.difficulty === 'hard' && 'border-red-500/30 text-red-400'
            )}
          >
            {question.difficulty === 'easy' ? 'Facile' : question.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
          </Badge>
        </div>

        {/* Passage */}
        <div className="bg-muted rounded-xl p-4 border border-border">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {question.passage}
          </p>
          {question.passageSource && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              — {question.passageSource}
            </p>
          )}
        </div>

        {/* Question */}
        <div>
          <p className="text-foreground font-medium">{question.questionText}</p>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {question.choices.map((choice) => {
            const isCorrect = choice.id === question.correctAnswer;
            return (
              <div
                key={choice.id}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  showAnswer
                    ? isCorrect
                      ? 'bg-success/10 border-success/30'
                      : 'bg-muted border-border opacity-60'
                    : 'bg-muted border-border'
                )}
              >
                <span className="text-sm">
                  <span className="font-medium text-muted-foreground mr-2">{choice.id}.</span>
                  <span className={cn(
                    showAnswer && isCorrect ? 'text-success' : 'text-foreground'
                  )}>
                    {choice.text}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Show/Hide Answer */}
        {!showAnswer ? (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowAnswer(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir la réponse
            </Button>
          </div>
        ) : (
          <>
            {/* Explanation */}
            <div className="bg-success/10 rounded-xl p-4 border border-success/20">
              <p className="text-sm text-success font-medium mb-2">Explication:</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>

            {/* Grade Buttons */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Comment avez-vous répondu ?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([0, 1, 2, 3, 4, 5] as SRSGrade[]).map((grade) => (
                  <Button
                    key={grade}
                    variant="outline"
                    size="sm"
                    onClick={() => handleGrade(grade)}
                    className={cn(
                      'flex flex-col items-center py-3 h-auto',
                      SRS_GRADE_COLORS[grade]
                    )}
                  >
                    <span className="text-lg font-bold">{grade}</span>
                    <span className="text-xs opacity-80">{SRS_GRADE_LABELS[grade]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Skip Button */}
            <div className="flex justify-center pt-2">
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Passer pour aujourd'hui
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
