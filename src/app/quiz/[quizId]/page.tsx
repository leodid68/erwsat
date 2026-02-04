'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizNavigation } from '@/components/quiz/QuizNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnswerId } from '@/types/question';
import { AlertCircle, ArrowLeft, Keyboard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const {
    getQuiz,
    startQuiz,
    setAnswer,
    toggleFlagged,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
  } = useQuizStore();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const quiz = getQuiz(quizId);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if dialog is open or typing in input
    if (showConfirmSubmit || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const currentQ = quiz?.questions[currentQuestionIndex];
    if (!currentQ) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        previousQuestion();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextQuestion();
        break;
      case '1':
      case 'a':
      case 'A':
        e.preventDefault();
        setAnswer(currentQ.id, 'A');
        break;
      case '2':
      case 'b':
      case 'B':
        e.preventDefault();
        setAnswer(currentQ.id, 'B');
        break;
      case '3':
      case 'c':
      case 'C':
        e.preventDefault();
        setAnswer(currentQ.id, 'C');
        break;
      case '4':
      case 'd':
      case 'D':
        e.preventDefault();
        setAnswer(currentQ.id, 'D');
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFlagged(currentQ.id);
        break;
      case '?':
        e.preventDefault();
        setShowKeyboardHelp(prev => !prev);
        break;
    }
  }, [quiz, currentQuestionIndex, showConfirmSubmit, previousQuestion, nextQuestion, setAnswer, toggleFlagged]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (quiz && !quizStarted) {
      startQuiz(quizId);
      setQuizStarted(true);
    }
  }, [quiz, quizId, startQuiz, quizStarted]);

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Quiz introuvable</h3>
            <p className="text-muted-foreground mb-6">
              Ce quiz n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link href="/quiz">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id] || null;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = quiz.questions.length - answeredCount;

  const handleSelectAnswer = (answer: AnswerId) => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, answer);
    }
  };

  const handleSubmit = () => {
    if (unansweredCount > 0) {
      setShowConfirmSubmit(true);
    } else {
      confirmSubmit();
    }
  };

  const confirmSubmit = () => {
    const attempt = submitQuiz();
    if (attempt) {
      router.push(`/results/${quizId}?attemptId=${attempt.id}`);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboardHelp(prev => !prev)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showKeyboardHelp
                ? "bg-violet-100 text-violet-600"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Raccourcis clavier (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/quiz">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quitter
            </Link>
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {showKeyboardHelp && (
        <Card className="bg-violet-50/80 border-violet-200/50">
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">→</kbd> Navigation</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">A</kbd>-<kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">D</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">1</kbd>-<kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">4</kbd> Répondre</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">F</kbd> Marquer</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border text-[10px] font-mono">?</kbd> Aide</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={handleSelectAnswer}
        isFlagged={flaggedQuestions.includes(currentQuestion.id)}
      />

      {/* Navigation */}
      <QuizNavigation
        currentIndex={currentQuestionIndex}
        totalQuestions={quiz.questions.length}
        answeredCount={answeredCount}
        flaggedQuestions={flaggedQuestions}
        currentQuestionId={currentQuestion.id}
        onPrevious={previousQuestion}
        onNext={nextQuestion}
        onGoTo={goToQuestion}
        onToggleFlag={() => toggleFlagged(currentQuestion.id)}
        onSubmit={handleSubmit}
        canSubmit={answeredCount > 0}
      />

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer le quiz ?</DialogTitle>
            <DialogDescription>
              Vous avez {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} sans réponse. Continuer quand même ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              Continuer le quiz
            </Button>
            <Button onClick={confirmSubmit}>Terminer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
