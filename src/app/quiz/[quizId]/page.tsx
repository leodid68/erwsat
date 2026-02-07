'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { PassagePanel } from '@/components/quiz/PassagePanel';
import { QuestionPanel } from '@/components/quiz/QuestionPanel';
import { QuizBottomNav } from '@/components/quiz/QuizBottomNav';
import { ExamTimer } from '@/components/quiz/ExamTimer';
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
import { AlertCircle, ArrowLeft, Keyboard, X } from 'lucide-react';
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
    startTime,
    examMode,
    timeLimit,
  } = useQuizStore();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const prevIndexRef = useRef(currentQuestionIndex);

  const quiz = getQuiz(quizId);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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

  // Detect slide direction on question change
  useEffect(() => {
    if (prevIndexRef.current !== currentQuestionIndex) {
      setSlideDirection(currentQuestionIndex > prevIndexRef.current ? 'left' : 'right');
      prevIndexRef.current = currentQuestionIndex;
      const timer = setTimeout(() => setSlideDirection(null), 250);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex]);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quiz introuvable</h3>
              <p className="text-muted-foreground mb-6">
                Ce quiz n&apos;existe pas ou a été supprimé.
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

  const handleTimeUp = useCallback(() => {
    if (!timeExpired) {
      setTimeExpired(true);
      const attempt = submitQuiz();
      if (attempt) {
        router.push(`/results/${quizId}?attemptId=${attempt.id}&timeUp=true`);
      }
    }
  }, [timeExpired, submitQuiz, router, quizId]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      {/* Top bar: title, timer, keyboard help, exit */}
      <div className="h-12 glass-navbar border-b border-white/6 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{quiz.title}</h1>
          {quiz.description && (
            <span className="text-xs text-muted-foreground hidden lg:inline truncate">
              {quiz.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {startTime && (
            <ExamTimer
              startTime={startTime}
              timeLimit={timeLimit}
              onTimeUp={handleTimeUp}
            />
          )}
          <button
            onClick={() => setShowKeyboardHelp(prev => !prev)}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-200',
              showKeyboardHelp
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
            )}
            title="Raccourcis clavier (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href="/quiz">
              <X className="w-3.5 h-3.5 mr-1" />
              Quitter
            </Link>
          </Button>
        </div>
      </div>

      {/* Keyboard help banner */}
      {showKeyboardHelp && (
        <div className="px-4 py-2 border-b border-white/6 bg-white/3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span><kbd className="kbd-cosmic">←</kbd> <kbd className="kbd-cosmic">→</kbd> Navigation</span>
            <span><kbd className="kbd-cosmic">A</kbd>-<kbd className="kbd-cosmic">D</kbd> ou <kbd className="kbd-cosmic">1</kbd>-<kbd className="kbd-cosmic">4</kbd> Répondre</span>
            <span><kbd className="kbd-cosmic">F</kbd> Marquer</span>
            <span><kbd className="kbd-cosmic">?</kbd> Aide</span>
          </div>
        </div>
      )}

      {/* Split view: passage left / question right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Passage (55% on desktop) */}
        <div className="md:w-[55%] overflow-y-auto p-6 border-b md:border-b-0 md:border-r border-white/6 scrollbar-thin">
          <div
            key={`passage-${currentQuestionIndex}`}
            className={cn(
              'transition-all duration-200 ease-out',
              slideDirection === 'left' && 'animate-slide-in-right',
              slideDirection === 'right' && 'animate-slide-in-left',
            )}
          >
            <PassagePanel passage={currentQuestion.passage} />
          </div>
        </div>

        {/* Right: Question (45% on desktop) */}
        <div className="md:w-[45%] overflow-y-auto p-6 scrollbar-thin">
          <div
            key={`question-${currentQuestionIndex}`}
            className={cn(
              'transition-all duration-200 ease-out',
              slideDirection === 'left' && 'animate-slide-in-right',
              slideDirection === 'right' && 'animate-slide-in-left',
            )}
          >
            <QuestionPanel
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              isFlagged={flaggedQuestions.includes(currentQuestion.id)}
            />
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="h-14 glass-navbar border-t border-white/6 shrink-0">
        <QuizBottomNav
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
      </div>

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
