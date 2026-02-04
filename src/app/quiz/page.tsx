'use client';

import Link from 'next/link';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Sparkles,
  Play,
  Trash2,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function QuizListPage() {
  const { quizzes, removeQuiz } = useQuizStore();

  if (quizzes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="relative">
          <div className="absolute -left-20 -top-10 w-32 h-32 orb orb-violet opacity-40" />
          <div className="relative">
            <h1 className="text-3xl font-bold">
              <span className="text-gradient">Quiz</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Vos quiz sauvegardés prêts pour l'entraînement.
            </p>
          </div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-blue opacity-30" />

          <CardContent className="py-16 text-center relative">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-3">Aucun quiz</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Générez votre premier quiz pour commencer.
            </p>
            <Button asChild className="btn-glow">
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="absolute -left-20 -top-10 w-32 h-32 orb orb-violet opacity-40" />
          <div className="relative">
            <h1 className="text-3xl font-bold">
              <span className="text-gradient">Quiz</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {quizzes.length} quiz disponible{quizzes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button asChild className="btn-glow">
          <Link href="/generate">
            <Sparkles className="w-4 h-4 mr-2" />
            Nouveau quiz
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const estimatedTime = Math.ceil(quiz.questions.length * 1.5);

          return (
            <Card key={quiz.id} className="glass-hover group">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl icon-glow-violet flex items-center justify-center transition-transform group-hover:scale-105">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{quiz.title}</h3>
                      <div className="flex items-center gap-4 mt-1.5">
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {quiz.questions.length} questions
                        </Badge>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          ~{estimatedTime} min
                        </span>
                      </div>
                      {quiz.sourceDocument && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {quiz.sourceDocument}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        removeQuiz(quiz.id);
                      }}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button asChild className="btn-glow">
                      <Link href={`/quiz/${quiz.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Commencer
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
