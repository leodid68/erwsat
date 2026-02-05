'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizHistoryTable } from '@/components/history/QuizHistoryTable';
import { ExportButton } from '@/components/history/ExportButton';
import {
  History,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function HistoryPage() {
  const { progress, quizzes } = useQuizStore();
  const { quizHistory } = progress;

  // Calculate global stats
  const totalQuizzes = quizHistory.length;
  const totalQuestions = quizHistory.reduce((sum, a) => sum + a.totalQuestions, 0);
  const totalCorrect = quizHistory.reduce((sum, a) => sum + a.score, 0);
  const averageScore = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;
  const totalTimeSeconds = quizHistory.reduce((sum, a) => sum + a.timeSpent, 0);
  const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

  // Best score
  const bestScore = quizHistory.length > 0
    ? Math.max(...quizHistory.map((a) => Math.round((a.score / a.totalQuestions) * 100)))
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Historique
          </h1>
          <p className="text-muted-foreground mt-1">
            Consultez et exportez vos résultats passés.
          </p>
        </div>
        <ExportButton history={quizHistory} quizzes={quizzes} />
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-indigo flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Quiz complétés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-emerald flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-amber flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{bestScore}%</p>
                <p className="text-xs text-muted-foreground">Meilleur score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-violet flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalTimeMinutes}</p>
                <p className="text-xs text-muted-foreground">Minutes d'étude</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tous les quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizHistoryTable history={quizHistory} quizzes={quizzes} />
        </CardContent>
      </Card>
    </div>
  );
}
