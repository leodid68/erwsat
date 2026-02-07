'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Timer,
  Clock,
  Zap,
  Infinity,
  ArrowRight,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// SAT ERW timing: 64 minutes for 54 questions
const SAT_EXAM_TIME = 64 * 60; // 64 minutes in seconds

interface TimerMode {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  timeLimit: number | null;
  gradient: string;
}

const timerModes: TimerMode[] = [
  {
    id: 'free',
    name: 'Mode Libre',
    description: 'Pas de limite de temps. Prenez le temps nécessaire.',
    icon: Infinity,
    timeLimit: null,
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'sat',
    name: 'Mode SAT',
    description: '64 minutes pour 54 questions (conditions réelles).',
    icon: Timer,
    timeLimit: SAT_EXAM_TIME,
    gradient: 'from-blue-800 to-blue-900',
  },
  {
    id: 'quick',
    name: 'Mode Rapide',
    description: '1 minute 30 par question. Entraînez votre rapidité.',
    icon: Zap,
    timeLimit: 90, // Per question, will be multiplied
    gradient: 'from-yellow-500 to-amber-500',
  },
];

export default function ExamModePage() {
  const router = useRouter();
  const { quizzes, startQuizWithTimer } = useQuizStore();
  const [selectedMode, setSelectedMode] = useState<string>('sat');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const availableQuizzes = quizzes.filter((q) => q.questions.length > 0);

  const handleStartQuiz = () => {
    if (!selectedQuizId) return;

    const quiz = quizzes.find((q) => q.id === selectedQuizId);
    if (!quiz) return;

    const mode = timerModes.find((m) => m.id === selectedMode);
    if (!mode) return;

    let timeLimit = mode.timeLimit;

    // For quick mode, multiply per-question time by question count
    if (mode.id === 'quick' && timeLimit) {
      timeLimit = timeLimit * quiz.questions.length;
    }

    startQuizWithTimer(selectedQuizId, timeLimit);
    router.push(`/quiz/${selectedQuizId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins} min`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Timer className="w-6 h-6 text-blue-800" />
          Mode Examen
        </h1>
        <p className="text-muted-foreground mt-1">
          Choisissez un mode chronométré et un quiz pour commencer.
        </p>
      </div>

      {/* Timer Mode Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Choisir le mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timerModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200',
                  isSelected
                    ? 'bg-white/60 border-2 border-blue-800/50'
                    : 'bg-white/50 border-2 border-transparent hover:bg-muted'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                    mode.gradient
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{mode.name}</p>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                {isSelected && (
                  <div className="w-3 h-3 rounded-full bg-blue-800" />
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Quiz Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-500" />
            Choisir un quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <p className="text-muted-foreground mb-4">Aucun quiz disponible</p>
              <Button asChild>
                <Link href="/generate">Générer un quiz</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {availableQuizzes.map((quiz) => {
                const isSelected = selectedQuizId === quiz.id;
                const mode = timerModes.find((m) => m.id === selectedMode);
                let estimatedTime = '∞';

                if (mode?.timeLimit) {
                  if (selectedMode === 'quick') {
                    estimatedTime = formatTime(mode.timeLimit * quiz.questions.length);
                  } else {
                    estimatedTime = formatTime(mode.timeLimit);
                  }
                }

                return (
                  <button
                    key={quiz.id}
                    onClick={() => setSelectedQuizId(quiz.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200',
                      isSelected
                        ? 'bg-white/60 border-2 border-blue-800/50'
                        : 'bg-white/50 border-2 border-transparent hover:bg-muted'
                    )}
                  >
                    <div>
                      <p className="font-medium text-foreground">{quiz.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {quiz.questions.length} questions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-foreground">{estimatedTime}</p>
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-blue-800 ml-auto mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/quiz">Retour</Link>
        </Button>
        <Button
          onClick={handleStartQuiz}
          disabled={!selectedQuizId}
          className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950"
        >
          Commencer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
