'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QUESTION_TYPE_LABELS, QuestionType } from '@/types/question';
import { StudyCalendar } from '@/components/progress/StudyCalendar';
import { WeakAreasCard } from '@/components/progress/WeakAreasCard';
import { PerformanceTrend } from '@/components/progress/PerformanceTrend';
import { estimateSATScore, getScoreColor, getPerformanceLevelLabel } from '@/lib/sat-scoring';
import {
  BarChart3,
  Target,
  Flame,
  BookOpen,
  Sparkles,
  Calendar,
  Trophy,
  GraduationCap,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function ProgressPage() {
  const { progress, quizzes, resetProgress } = useQuizStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  const recentScoresData = progress.recentScores
    .slice()
    .reverse()
    .map((score, index) => ({
      quiz: `#${index + 1}`,
      score: Math.round(score),
    }));

  const categoryData = Object.entries(progress.accuracyByType)
    .filter(([type, stats]) => stats.total > 0 && QUESTION_TYPE_LABELS[type as QuestionType])
    .map(([type, stats]) => ({
      type: QUESTION_TYPE_LABELS[type as QuestionType],
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total,
    }));

  // Calculate estimated SAT score
  const totalCorrect = Object.values(progress.accuracyByType).reduce((sum, cat) => sum + cat.correct, 0);
  const totalAnswered = Object.values(progress.accuracyByType).reduce((sum, cat) => sum + cat.total, 0);
  const satEstimate = totalAnswered > 0 ? estimateSATScore(totalCorrect, totalAnswered) : null;

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  if (progress.totalQuizzesTaken === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progrès</h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos performances d'entraînement SAT.
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Pas encore de progrès</h3>
            <p className="text-muted-foreground mb-6">
              Complétez votre premier quiz pour commencer le suivi.
            </p>
            <Button asChild>
              <Link href="/generate">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer un quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Progrès</h1>
        <p className="text-muted-foreground mt-1">
          Suivez vos performances d'entraînement SAT au fil du temps.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-indigo flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{progress.totalQuizzesTaken}</p>
                <p className="text-xs text-muted-foreground">Quiz</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(progress.overallAccuracy)}%
                </p>
                <p className="text-xs text-muted-foreground">Précision</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-violet flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {progress.totalQuestionsAnswered}
                </p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                progress.studyStreak > 0 ? 'icon-amber' : 'bg-muted text-muted-foreground'
              }`}>
                <Flame className={`w-5 h-5 ${
                  progress.studyStreak > 0 ? 'streak-pulse' : ''
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{progress.studyStreak}</p>
                <p className="text-xs text-muted-foreground">Jours d'affilée</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SAT Score Estimate */}
      {satEstimate && (
        <Card className="glass-cosmic border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score SAT Estimé</p>
                  <p className={`text-4xl font-bold ${getScoreColor(satEstimate.scaledScore)}`}>
                    {satEstimate.scaledScore}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Percentile</p>
                <p className="text-2xl font-bold text-foreground">{satEstimate.percentile}%</p>
                <p className={`text-xs ${getScoreColor(satEstimate.scaledScore)}`}>
                  {getPerformanceLevelLabel(satEstimate.performanceLevel)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                  style={{ width: `${((satEstimate.scaledScore - 200) / 600) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>200</span>
                <span>500</span>
                <span>800</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Calendar & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Activité d'étude
            </CardTitle>
            <CardDescription>12 dernières semaines</CardDescription>
          </CardHeader>
          <CardContent>
            <StudyCalendar quizHistory={progress.quizHistory} />
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Performance
            </CardTitle>
            <CardDescription>Tendances et statistiques</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceTrend quizHistory={progress.quizHistory} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        {recentScoresData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Évolution des scores</CardTitle>
              <CardDescription>{recentScoresData.length} derniers quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentScoresData}>
                    <XAxis
                      dataKey="quiz"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Score']}
                      labelFormatter={(label) => `Quiz ${label}`}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: 'var(--primary)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance by Category */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Par catégorie</CardTitle>
              <CardDescription>Précision par type de question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      width={100}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value, _name, props) => {
                        const total = (props as { payload?: { total?: number } })?.payload?.total ?? 0;
                        return [`${value}% (${total} Q)`, 'Précision'];
                      }}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weak Areas & Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recommandations</CardTitle>
          <CardDescription>Basées sur vos résultats</CardDescription>
        </CardHeader>
        <CardContent>
          <WeakAreasCard accuracyByType={progress.accuracyByType} />
        </CardContent>
      </Card>

      {/* Category Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Détail par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progress.accuracyByType)
              .filter(([type]) => QUESTION_TYPE_LABELS[type as QuestionType])
              .map(([type, stats]) => {
                const percent = stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : 0;
                const label = QUESTION_TYPE_LABELS[type as QuestionType];

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="text-muted-foreground">
                        {stats.total > 0 ? `${stats.correct}/${stats.total} (${percent}%)` : 'Non tenté'}
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {progress.quizHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.quizHistory.slice(0, 5).map((attempt) => {
                const quiz = quizzes.find((q) => q.id === attempt.quizId);
                const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const date = new Date(attempt.completedAt);

                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {quiz?.title || 'Quiz'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{scorePercent}%</p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Progress Section */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Réinitialiser les statistiques
          </CardTitle>
          <CardDescription>
            Effacer tout l'historique et recommencer à zéro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showResetConfirm ? (
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setShowResetConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Réinitialiser tout
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Êtes-vous sûr ?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cette action effacera définitivement :
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>{progress.totalQuizzesTaken} quiz complétés</li>
                    <li>{progress.totalQuestionsAnswered} questions répondues</li>
                    <li>Votre série de {progress.studyStreak} jour(s)</li>
                    <li>Tous les badges débloqués</li>
                    <li>La file de révision SRS</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmer la réinitialisation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
