'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateAdaptiveDifficulty } from '@/lib/sat-scoring';
import {
  selectQuestionsWithDiversity,
  getSelectionStats,
  SAT_SELECTION_CONFIG,
  SelectionConfig,
} from '@/lib/question-selection';
import { Question, TEXT_GENRE_LABELS, TextGenre } from '@/types/question';
import {
  GraduationCap,
  Timer,
  Brain,
  Zap,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Target,
  TrendingUp,
  Info,
  BookOpen,
  Feather,
  Landmark,
  FlaskConical,
  Users,
  Newspaper,
  Palette,
  PenTool,
  FileText,
  Shuffle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// SAT timing: 64 minutes for 54 questions
const SAT_TIME_LIMIT = 64 * 60; // seconds

interface SATModeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  recommended?: boolean;
}

const satModes: SATModeOption[] = [
  {
    id: 'practice',
    name: 'Entraînement Libre',
    description: 'Sans limite de temps, difficulté variée',
    icon: Brain,
    features: ['Pas de chrono', 'Toutes difficultés', 'Score SAT estimé'],
  },
  {
    id: 'adaptive',
    name: 'Mode Adaptatif',
    description: 'Difficulté ajustée selon votre niveau',
    icon: TrendingUp,
    features: ['Questions adaptées', 'Basé sur vos stats', 'Progression optimale'],
    recommended: true,
  },
  {
    id: 'exam',
    name: 'Simulation SAT',
    description: 'Conditions réelles d\'examen',
    icon: GraduationCap,
    features: ['64 minutes', '54 questions', 'Score SAT précis'],
  },
];

export default function SATModePage() {
  const router = useRouter();
  const { quizzes, progress, addQuiz, startQuizWithTimer } = useQuizStore();
  const [selectedMode, setSelectedMode] = useState<string>('adaptive');
  const [questionCount, setQuestionCount] = useState(20);

  // Collect all questions
  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        if (!questions.find((existing) => existing.id === q.id)) {
          questions.push(q);
        }
      });
    });
    return questions;
  }, [quizzes]);

  // Group by difficulty
  const questionsByDifficulty = useMemo(() => {
    return {
      easy: allQuestions.filter((q) => q.difficulty === 'easy'),
      medium: allQuestions.filter((q) => q.difficulty === 'medium'),
      hard: allQuestions.filter((q) => q.difficulty === 'hard'),
    };
  }, [allQuestions]);

  // Calculate adaptive distribution based on user performance
  const adaptiveDistribution = useMemo(() => {
    return calculateAdaptiveDifficulty(progress.overallAccuracy);
  }, [progress.overallAccuracy]);

  // Build selection config based on mode
  const getSelectionConfig = (mode: string, count: number): SelectionConfig => {
    const baseConfig: SelectionConfig = {
      targetCount: count,
      maxQuestionsPerPassage: 2,
      minUniquePassagePercent: 80,
      ensureGenreDiversity: true,
      difficultyDistribution: { easy: 20, medium: 50, hard: 30 },
    };

    if (mode === 'practice') {
      return {
        ...baseConfig,
        minUniquePassagePercent: 60, // Less strict for practice
        ensureGenreDiversity: false,
      };
    }

    if (mode === 'adaptive') {
      return {
        ...baseConfig,
        difficultyDistribution: adaptiveDistribution,
      };
    }

    if (mode === 'exam') {
      return {
        ...baseConfig,
        minUniquePassagePercent: 85, // Strict for exam simulation
      };
    }

    return baseConfig;
  };

  // Select questions based on mode with diversity
  const selectQuestions = (mode: string, count: number): Question[] => {
    const config = getSelectionConfig(mode, count);
    return selectQuestionsWithDiversity(allQuestions, config);
  };

  // Preview selection stats
  const previewStats = useMemo(() => {
    const count = selectedMode === 'exam' ? Math.min(54, allQuestions.length) : questionCount;
    const config = getSelectionConfig(selectedMode, count);
    const preview = selectQuestionsWithDiversity(allQuestions, config);
    return getSelectionStats(preview);
  }, [selectedMode, questionCount, allQuestions, adaptiveDistribution]);

  const handleStart = () => {
    const count = selectedMode === 'exam' ? Math.min(54, allQuestions.length) : questionCount;
    const questions = selectQuestions(selectedMode, count);

    if (questions.length === 0) return;

    const satQuiz = {
      id: `sat-${selectedMode}-${Date.now()}`,
      title: `SAT ${satModes.find((m) => m.id === selectedMode)?.name || 'Quiz'}`,
      description: `${questions.length} questions - Mode ${selectedMode}`,
      questions,
      createdAt: new Date(),
    };

    addQuiz(satQuiz);

    // Set timer for exam mode
    const timeLimit = selectedMode === 'exam' ? SAT_TIME_LIMIT : null;
    startQuizWithTimer(satQuiz.id, timeLimit);

    router.push(`/quiz/${satQuiz.id}`);
  };

  const hasEnoughQuestions = allQuestions.length >= 10;
  const maxQuestions = Math.min(allQuestions.length, 54);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-800" />
          Mode SAT
        </h1>
        <p className="text-muted-foreground mt-1">
          Entraînez-vous dans des conditions proches du vrai SAT.
        </p>
      </div>

      {/* Performance Summary */}
      <Card className="glass-cosmic border-blue-800/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-800/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-800" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Votre niveau actuel</p>
                <p className="text-xs text-muted-foreground">
                  {progress.totalQuestionsAnswered} questions répondues
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-800">
                {Math.round(progress.overallAccuracy)}%
              </p>
              <p className="text-xs text-muted-foreground">Précision globale</p>
            </div>
          </div>

          {/* Adaptive Distribution Preview */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Distribution recommandée (mode adaptatif)</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                {adaptiveDistribution.easy}% Facile
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600/30">
                {adaptiveDistribution.medium}% Moyen
              </Badge>
              <Badge variant="outline" className="text-red-400 border-red-500/30">
                {adaptiveDistribution.hard}% Difficile
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasEnoughQuestions ? (
        <Card className="glass-cosmic">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground mb-2">Pas assez de questions</h3>
            <p className="text-muted-foreground mb-6">
              Générez au moins 10 questions pour utiliser le mode SAT.
            </p>
            <Button asChild>
              <Link href="/generate">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer des questions
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mode Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Choisir le mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {satModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all duration-200',
                      isSelected
                        ? 'bg-blue-800/20 border-2 border-blue-800/50'
                        : 'bg-white/50 border-2 border-transparent hover:bg-white/60'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          isSelected
                            ? 'bg-gradient-to-br from-blue-800 to-blue-900'
                            : 'bg-white/60'
                        )}
                      >
                        <Icon className={cn('w-6 h-6', isSelected ? 'text-white' : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{mode.name}</p>
                          {mode.recommended && (
                            <Badge className="bg-blue-800/20 text-blue-800 border-blue-800/30 text-xs">
                              Recommandé
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{mode.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mode.features.map((feature) => (
                            <span
                              key={feature}
                              className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-blue-800" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Question Count (not for exam mode) */}
          {selectedMode !== 'exam' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nombre de questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40].filter((n) => n <= maxQuestions).map((count) => (
                    <Button
                      key={count}
                      variant={questionCount === count ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuestionCount(count)}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {allQuestions.length} questions disponibles
                </p>
              </CardContent>
            </Card>
          )}

          {/* Diversity Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-emerald-500" />
                Aperçu de la diversité
              </CardTitle>
              <CardDescription>
                {previewStats.uniquePassages} textes uniques sur {previewStats.totalQuestions} questions
                ({previewStats.passageDiversityPercent}% de diversité)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Genre Distribution */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Répartition par genre</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(previewStats.genreDistribution)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([genre, count]) => {
                      const Icon = {
                        literature: BookOpen,
                        poetry: Feather,
                        history: Landmark,
                        science: FlaskConical,
                        'social-science': Users,
                        journalism: Newspaper,
                        humanities: Palette,
                        memoir: PenTool,
                        other: FileText,
                      }[genre as TextGenre] || FileText;

                      return (
                        <div
                          key={genre}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/50 border border-border"
                        >
                          <Icon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-foreground">
                            {TEXT_GENRE_LABELS[genre as TextGenre] || genre}
                          </span>
                          <span className="text-xs text-muted-foreground">({count})</span>
                        </div>
                      );
                    })}
                </div>

                {/* Diversity indicator */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Diversité des passages</span>
                    <span className={cn(
                      previewStats.passageDiversityPercent >= 80 ? 'text-emerald-400' :
                      previewStats.passageDiversityPercent >= 60 ? 'text-yellow-600' : 'text-red-400'
                    )}>
                      {previewStats.passageDiversityPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        previewStats.passageDiversityPercent >= 80 ? 'bg-emerald-500' :
                        previewStats.passageDiversityPercent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${previewStats.passageDiversityPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {previewStats.passageDiversityPercent >= 80
                      ? '✓ Excellent : chaque texte utilisé 1-2 fois max'
                      : previewStats.passageDiversityPercent >= 60
                      ? '⚠ Correct : certains textes sont répétés'
                      : '✗ Faible : générez plus de textes variés'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Mode Info */}
          {selectedMode === 'exam' && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-600">Mode Simulation SAT</p>
                    <p className="text-muted-foreground mt-1">
                      Ce mode simule les conditions réelles du SAT ERW : 64 minutes pour
                      {Math.min(54, allQuestions.length)} questions. Le quiz sera soumis
                      automatiquement à la fin du temps.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/quiz">Retour</Link>
            </Button>
            <Button
              onClick={handleStart}
              className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950"
            >
              Commencer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
