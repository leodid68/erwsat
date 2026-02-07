'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { SATScoreDisplay } from '@/components/quiz/SATScoreDisplay';
import { QUESTION_TYPE_LABELS } from '@/types/question';
import {
  Trophy,
  Target,
  Clock,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const attemptId = searchParams.get('attemptId');

  const { getQuiz, progress, resetQuizSession } = useQuizStore();
  const quiz = getQuiz(quizId);

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Find the attempt in progress history
  const quizHistory = progress?.quizHistory || [];
  const attempt = quizHistory.find((a) => a.id === attemptId);

  // Calculate scores (with safe defaults for when attempt is null)
  const scorePercent = attempt ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
  const timeMinutes = attempt ? Math.floor(attempt.timeSpent / 60) : 0;
  const timeSeconds = attempt ? attempt.timeSpent % 60 : 0;

  // Performance analysis - must be called before any early returns (Rules of Hooks)
  const performanceAnalysis = useMemo(() => {
    const previousAttempts = quizHistory.filter((a) => a.id !== attemptId);
    const previousScores = previousAttempts.map((a) => (a.score / a.totalQuestions) * 100);
    const avgPreviousScore = previousScores.length > 0
      ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
      : null;
    const bestPreviousScore = previousScores.length > 0 ? Math.max(...previousScores) : null;
    const isPersonalBest = bestPreviousScore === null || scorePercent > bestPreviousScore;
    const isAboveAverage = avgPreviousScore === null || scorePercent > avgPreviousScore;

    let feedback: { message: string; type: 'excellent' | 'good' | 'average' | 'needsWork' };
    if (scorePercent >= 90) {
      feedback = { message: 'Excellent ! Vous maîtrisez parfaitement ce contenu.', type: 'excellent' };
    } else if (scorePercent >= 75) {
      feedback = { message: 'Très bien ! Continuez sur cette lancée.', type: 'good' };
    } else if (scorePercent >= 60) {
      feedback = { message: 'Correct. Revoyez les questions manquées pour progresser.', type: 'average' };
    } else {
      feedback = { message: 'Continuez à pratiquer. Chaque erreur est une opportunité d\'apprendre.', type: 'needsWork' };
    }

    return { isPersonalBest, isAboveAverage, avgPreviousScore, feedback };
  }, [quizHistory, attemptId, scorePercent]);

  // Early return AFTER all hooks have been called
  if (!quiz || !attempt) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Résultats introuvables</h3>
              <p className="text-muted-foreground mb-4">
                Ce résultat de quiz n'existe pas.
              </p>
              <Button asChild>
                <Link href="/quiz">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux quiz
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group results by question type
  const resultsByType: Record<string, { correct: number; total: number }> = {};
  quiz.questions.forEach((q) => {
    const result = attempt.questionResults.find((r) => r.questionId === q.id);
    if (!resultsByType[q.type]) {
      resultsByType[q.type] = { correct: 0, total: 0 };
    }
    resultsByType[q.type].total += 1;
    if (result?.isCorrect) {
      resultsByType[q.type].correct += 1;
    }
  });

  // Calculate difficulty breakdown for SAT score adjustment
  const difficultyBreakdown = useMemo(() => {
    const breakdown = { easy: 0, medium: 0, hard: 0 };
    quiz.questions.forEach((q) => {
      const result = attempt.questionResults.find((r) => r.questionId === q.id);
      if (result?.isCorrect) {
        breakdown[q.difficulty]++;
      }
    });
    return breakdown;
  }, [quiz.questions, attempt.questionResults]);

  const handleRetake = () => {
    resetQuizSession();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Résultats</h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/quiz">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tous les quiz
            </Link>
          </Button>
          <Button asChild onClick={handleRetake}>
            <Link href={`/quiz/${quizId}`}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Refaire
            </Link>
          </Button>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{scorePercent}%</p>
                <p className="text-sm text-muted-foreground">
                  {attempt.score} sur {attempt.totalQuestions} correctes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{attempt.score}</p>
                <p className="text-sm text-muted-foreground">Réponses correctes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-muted-foreground">Temps passé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SAT Score Estimate */}
      <SATScoreDisplay
        correctAnswers={attempt.score}
        totalQuestions={attempt.totalQuestions}
        difficultyBreakdown={difficultyBreakdown}
      />

      {/* Performance Feedback */}
      <Card className={cn(
        'border-2',
        performanceAnalysis.feedback.type === 'excellent' && 'border-emerald-300 bg-emerald-50/50',
        performanceAnalysis.feedback.type === 'good' && 'border-blue-300 bg-blue-50/50',
        performanceAnalysis.feedback.type === 'average' && 'border-amber-300 bg-amber-50/50',
        performanceAnalysis.feedback.type === 'needsWork' && 'border-rose-300 bg-rose-50/50',
      )}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              performanceAnalysis.feedback.type === 'excellent' && 'bg-emerald-100',
              performanceAnalysis.feedback.type === 'good' && 'bg-blue-100',
              performanceAnalysis.feedback.type === 'average' && 'bg-amber-100',
              performanceAnalysis.feedback.type === 'needsWork' && 'bg-rose-100',
            )}>
              {performanceAnalysis.feedback.type === 'excellent' ? (
                <Award className="h-6 w-6 text-emerald-600" />
              ) : performanceAnalysis.feedback.type === 'good' ? (
                <TrendingUp className="h-6 w-6 text-blue-600" />
              ) : (
                <Sparkles className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">
                {performanceAnalysis.feedback.message}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {performanceAnalysis.isPersonalBest && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    Record personnel !
                  </Badge>
                )}
                {performanceAnalysis.isAboveAverage && performanceAnalysis.avgPreviousScore && (
                  <Badge variant="secondary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Au-dessus de votre moyenne ({Math.round(performanceAnalysis.avgPreviousScore)}%)
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/progress">
                <BarChart3 className="w-4 h-4 mr-1" />
                Voir progrès
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par catégorie</CardTitle>
          <CardDescription>
            Résultats par type de question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(resultsByType).map(([type, stats]) => {
              const percent = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS]}
                    </span>
                    <span className="text-muted-foreground">
                      {stats.correct}/{stats.total} ({percent}%)
                    </span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Révision des questions</CardTitle>
          <CardDescription>
            Revoyez chaque question avec les explications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const result = attempt.questionResults.find(
                  (r) => r.questionId === question.id
                );
                const isExpanded = expandedQuestion === question.id;

                return (
                  <div key={question.id} className="border rounded-lg">
                    <button
                      onClick={() =>
                        setExpandedQuestion(isExpanded ? null : question.id)
                      }
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {result?.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <Badge variant="outline">
                          {QUESTION_TYPE_LABELS[question.type]}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <>
                        <Separator />
                        <div className="p-4">
                          <QuestionCard
                            question={question}
                            questionNumber={index + 1}
                            totalQuestions={quiz.questions.length}
                            selectedAnswer={result?.selectedAnswer || null}
                            onSelectAnswer={() => {}}
                            showResult={true}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
