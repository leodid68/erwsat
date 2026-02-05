'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BadgeDisplay } from '@/components/gamification/BadgeDisplay';
import { WeeklyChallenge } from '@/components/gamification/WeeklyChallenge';
import { GoalTracker } from '@/components/gamification/GoalTracker';
import { AVAILABLE_BADGES } from '@/types/gamification';
import {
  Trophy,
  Medal,
  Target,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AchievementsPage() {
  const { progress, addGoal, removeGoal } = useQuizStore();
  const { unlockedBadges, weeklyChallenge, goals } = progress;

  const unlockedCount = unlockedBadges.length;
  const totalBadges = AVAILABLE_BADGES.length;
  const completionPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Succès
        </h1>
        <p className="text-muted-foreground mt-1">
          Badges, défis et objectifs personnels.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-amber flex items-center justify-center">
                <Medal className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {unlockedCount}/{totalBadges}
                </p>
                <p className="text-xs text-muted-foreground">Badges</p>
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
                  {goals.filter((g) => g.completed).length}
                </p>
                <p className="text-xs text-muted-foreground">Objectifs atteints</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl icon-violet flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completionPercent}%</p>
                <p className="text-xs text-muted-foreground">Complétion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Challenge */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Défi hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyChallenge challenge={weeklyChallenge} />
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" />
            Objectifs personnels
          </CardTitle>
          <CardDescription>
            Définissez vos propres objectifs d'apprentissage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalTracker
            goals={goals}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
          />
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-500" />
            Badges
          </CardTitle>
          <CardDescription>
            {unlockedCount} sur {totalBadges} débloqués
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeDisplay unlockedBadges={unlockedBadges} showLocked={true} />
        </CardContent>
      </Card>

      {/* CTA if no badges */}
      {unlockedCount === 0 && (
        <Card className="glass-cosmic border-purple-500/20">
          <CardContent className="py-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="font-semibold text-foreground mb-2">
              Commencez votre collection
            </h3>
            <p className="text-muted-foreground mb-4">
              Complétez des quiz pour débloquer vos premiers badges !
            </p>
            <Button asChild>
              <Link href="/quiz">
                <Sparkles className="w-4 h-4 mr-2" />
                Faire un quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
