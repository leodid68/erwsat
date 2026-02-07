'use client';

import { useState, useMemo } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SRSCard } from '@/components/review/SRSCard';
import { SRSGrade } from '@/types/srs';
import { Question } from '@/types/question';
import {
  Brain,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
  const { progress, quizzes, getSRSDueToday, reviewSRS, removeFromSRS } = useQuizStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // Get items due today
  const dueItems = useMemo(() => {
    return getSRSDueToday().filter((item) => !skippedIds.has(item.questionId));
  }, [getSRSDueToday, skippedIds]);

  // Find the question for the current item
  const currentItem = dueItems[currentIndex];
  const currentQuestion = useMemo(() => {
    if (!currentItem) return null;
    for (const quiz of quizzes) {
      const question = quiz.questions.find((q) => q.id === currentItem.questionId);
      if (question) return question;
    }
    return null;
  }, [currentItem, quizzes]);

  const totalDue = dueItems.length + reviewedToday;
  const progressPercent = totalDue > 0 ? (reviewedToday / totalDue) * 100 : 0;

  const handleGrade = (grade: SRSGrade) => {
    if (!currentItem) return;

    reviewSRS(currentItem.questionId, grade);
    setReviewedToday((prev) => prev + 1);

    // Move to next item
    if (currentIndex >= dueItems.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleSkip = () => {
    if (!currentItem) return;
    setSkippedIds((prev) => new Set([...prev, currentItem.questionId]));
  };

  const handleRemove = () => {
    if (!currentItem) return;
    removeFromSRS(currentItem.questionId);
    if (currentIndex >= dueItems.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  // Stats
  const totalInQueue = progress.srsQueue.length;
  const averageInterval = totalInQueue > 0
    ? Math.round(progress.srsQueue.reduce((sum, i) => sum + i.interval, 0) / totalInQueue)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-800" />
          Révision SRS
        </h1>
        <p className="text-muted-foreground mt-1">
          Répétition espacée pour mémoriser durablement.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{dueItems.length}</p>
              <p className="text-xs text-muted-foreground">À réviser</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalInQueue}</p>
              <p className="text-xs text-muted-foreground">Dans la file</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{averageInterval}j</p>
              <p className="text-xs text-muted-foreground">Intervalle moyen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {totalDue > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progression du jour</span>
              <span className="text-foreground">{reviewedToday}/{totalDue}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {dueItems.length === 0 ? (
        <Card className="glass-cosmic">
          <CardContent className="py-12 text-center">
            {progress.srsQueue.length === 0 ? (
              <>
                <Brain className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <h3 className="font-semibold text-foreground mb-2">File de révision vide</h3>
                <p className="text-muted-foreground mb-6">
                  Les questions ratées seront automatiquement ajoutées ici.
                </p>
                <Button asChild>
                  <Link href="/quiz">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Faire un quiz
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <h3 className="font-semibold text-foreground mb-2">Tout révisé !</h3>
                <p className="text-muted-foreground mb-6">
                  Revenez demain pour continuer votre apprentissage.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Prochaine révision : demain</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <div className="space-y-4">
          {/* Card Counter */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Carte {currentIndex + 1} / {dueItems.length}</span>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              Retirer de la file
            </Button>
          </div>

          {/* SRS Card */}
          <SRSCard
            question={currentQuestion}
            onGrade={handleGrade}
            onSkip={handleSkip}
          />
        </div>
      ) : (
        <Card className="glass-cosmic">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Question introuvable. Elle a peut-être été supprimée.
            </p>
            <Button className="mt-4" onClick={handleRemove}>
              Retirer et continuer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" />
            Comment ça marche ?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Le système de répétition espacée (SRS) optimise votre mémorisation en espaçant
            les révisions selon votre performance.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Note 0-2 : Réinitialise l'intervalle (revoir demain)</li>
            <li>Note 3 : Intervalle inchangé</li>
            <li>Note 4-5 : Intervalle augmenté</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
