'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeakAreaSelector } from '@/components/practice/WeakAreaSelector';
import { QuestionType, QUESTION_TYPE_LABELS } from '@/types/question';
import { Question } from '@/types/question';
import {
  Target,
  Dumbbell,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function PracticePage() {
  const router = useRouter();
  const { progress, quizzes, addQuiz, startQuiz } = useQuizStore();
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [questionCount, setQuestionCount] = useState(10);

  // Collect all questions from all quizzes
  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        // Avoid duplicates by checking IDs
        if (!questions.find((existing) => existing.id === q.id)) {
          questions.push(q);
        }
      });
    });
    return questions;
  }, [quizzes]);

  // Filter questions by selected types
  const filteredQuestions = useMemo(() => {
    if (selectedTypes.length === 0) return [];
    return allQuestions.filter((q) => selectedTypes.includes(q.type));
  }, [allQuestions, selectedTypes]);

  // Auto-select weak areas on mount
  const weakTypes = useMemo(() => {
    return Object.entries(progress.accuracyByType)
      .filter(([type, stats]) => {
        if (stats.total === 0) return false;
        const accuracy = (stats.correct / stats.total) * 100;
        return accuracy < 70 && QUESTION_TYPE_LABELS[type as QuestionType];
      })
      .map(([type]) => type as QuestionType);
  }, [progress.accuracyByType]);

  // Initialize selection with weak types if nothing selected yet
  useState(() => {
    if (weakTypes.length > 0 && selectedTypes.length === 0) {
      setSelectedTypes(weakTypes);
    }
  });

  const handleToggleType = (type: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleStartPractice = () => {
    if (filteredQuestions.length === 0) return;

    // Shuffle and pick questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // Create a temporary practice quiz
    const practiceQuiz = {
      id: `practice-${Date.now()}`,
      title: `Entraînement: ${selectedTypes.map((t) => QUESTION_TYPE_LABELS[t]).join(', ')}`,
      description: `${selected.length} questions ciblées`,
      questions: selected,
      createdAt: new Date(),
    };

    addQuiz(practiceQuiz);
    startQuiz(practiceQuiz.id);
    router.push(`/quiz/${practiceQuiz.id}`);
  };

  const hasQuestions = allQuestions.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-purple-400" />
          Entraînement Ciblé
        </h1>
        <p className="text-muted-foreground mt-1">
          Travaillez vos points faibles avec des questions ciblées.
        </p>
      </div>

      {!hasQuestions ? (
        <Card className="glass-cosmic">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="font-semibold text-foreground mb-2">Aucune question disponible</h3>
            <p className="text-muted-foreground mb-6">
              Générez d'abord un quiz pour accéder à l'entraînement ciblé.
            </p>
            <Button asChild>
              <Link href="/generate">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer un quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Category Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                Sélectionner les catégories
              </CardTitle>
              <CardDescription>
                Choisissez les types de questions à pratiquer. Les catégories faibles sont mises en évidence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeakAreaSelector
                accuracyByType={progress.accuracyByType}
                selectedTypes={selectedTypes}
                onToggleType={handleToggleType}
              />
            </CardContent>
          </Card>

          {/* Question Count */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                Nombre de questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((count) => (
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
              {filteredQuestions.length > 0 && (
                <p className="text-sm text-slate-400 mt-3">
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} disponibles
                  {filteredQuestions.length < questionCount && (
                    <span className="text-amber-400">
                      {' '}(moins que {questionCount} demandées)
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/progress">Voir les progrès</Link>
            </Button>
            <Button
              onClick={handleStartPractice}
              disabled={selectedTypes.length === 0 || filteredQuestions.length === 0}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Commencer ({Math.min(questionCount, filteredQuestions.length)} questions)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
