'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuizStore } from '@/stores/quiz-store';
import {
  Upload,
  Sparkles,
  ClipboardList,
  Target,
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  Play,
  Zap,
  Library,
  BarChart3,
} from 'lucide-react';

export default function Home() {
  const { progress, quizzes } = useQuizStore();
  const hasProgress = progress.totalQuizzesTaken > 0;

  return (
    <div className="space-y-10 relative">
      {/* Background orbs for glass effect */}
      <div className="fixed -left-32 top-20 w-96 h-96 orb orb-blue opacity-70 -z-10" />
      <div className="fixed right-0 top-40 w-80 h-80 orb orb-violet opacity-60 -z-10" />
      <div className="fixed left-1/3 bottom-20 w-72 h-72 orb orb-amber opacity-50 -z-10" />
      <div className="fixed right-1/4 bottom-40 w-64 h-64 orb orb-cyan opacity-40 -z-10" />

      {/* Welcome Header */}
      <div className="relative">
        {/* Local decorative orbs */}
        <div className="absolute -left-20 -top-10 w-40 h-40 orb orb-blue opacity-60" />
        <div className="absolute right-0 top-0 w-32 h-32 orb orb-amber opacity-50" />

        <div className="relative">
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">
              {hasProgress ? 'Bon retour !' : 'Préparation SAT ERW'}
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-xl">
            {hasProgress
              ? 'Continuez sur votre lancée. Chaque question vous rapproche de votre objectif.'
              : 'Importez des documents, générez des questions et entraînez-vous pour le SAT.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-700/20">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {progress.totalQuizzesTaken}
                </p>
                <p className="text-sm text-muted-foreground">Quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-700/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {Math.round(progress.overallAccuracy)}%
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-700/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {progress.totalQuestionsAnswered}
                </p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                progress.studyStreak > 0
                  ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-white/8 text-white/40'
              }`}>
                <Flame className={`w-6 h-6 ${progress.studyStreak > 0 ? 'text-white streak-pulse' : ''}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {progress.studyStreak}
                </p>
                <p className="text-sm text-muted-foreground">Jours consécutifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/upload" className="block">
            <div className="liquid-glass-blue h-full cursor-pointer p-5">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mb-3 shadow-lg shadow-violet-700/25">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Importer</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  PDF, texte ou sources en ligne
                </p>
              </div>
            </div>
          </Link>

          <Link href="/upload?tab=library" className="block">
            <div className="liquid-glass h-full cursor-pointer p-5" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))' }}>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mb-3 shadow-lg shadow-violet-700/25">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Bibliothèque</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Textes aléatoires avec sélection IA
                </p>
              </div>
            </div>
          </Link>

          <Link href="/generate" className="block">
            <div className="liquid-glass-amber h-full cursor-pointer p-5">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/25">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Générer</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Créer des questions SAT avec l'IA
                </p>
              </div>
            </div>
          </Link>

          <Link href="/quiz" className="block">
            <div className="liquid-glass-emerald h-full cursor-pointer p-5">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-3 shadow-lg shadow-emerald-700/25">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">S'entraîner</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {quizzes.length > 0
                    ? `${quizzes.length} quiz disponible${quizzes.length > 1 ? 's' : ''}`
                    : 'Commencer votre premier quiz'}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Progress Link */}
      {hasProgress && (
        <Link href="/progress" className="block">
          <div className="liquid-glass cursor-pointer p-5 flex items-center justify-between">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-700/25">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Voir ma progression</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress.overallAccuracy)}% de précision • {progress.totalQuestionsAnswered} questions
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground relative z-10" />
          </div>
        </Link>
      )}

      {/* Recent Quizzes */}
      {quizzes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-foreground">Quiz récents</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
              <Link href="/quiz">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {quizzes.slice(0, 3).map((quiz) => (
              <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="block">
                <div className="liquid-glass cursor-pointer p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-700/25">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{quiz.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {quiz.questions.length} questions
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="btn-glow relative z-10">
                    Commencer
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {!hasProgress && quizzes.length === 0 && (
        <Card className="relative overflow-hidden border-dashed border-primary/30">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-emerald-600/5" />

          {/* Decorative orbs */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-blue opacity-50" />
          <div className="absolute -left-10 -top-10 w-32 h-32 orb orb-amber opacity-30" />

          <CardContent className="py-16 text-center relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-violet-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 animate-float">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-bold text-2xl text-foreground mb-3">Prêt à réussir le SAT ?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Importez vos documents ou utilisez la bibliothèque pour générer des questions d'entraînement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="btn-glow" size="lg">
                <Link href="/upload">
                  <Upload className="w-5 h-5 mr-2" />
                  Importer un document
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/upload?tab=library">
                  <Library className="w-5 h-5 mr-2" />
                  Bibliothèque aléatoire
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
