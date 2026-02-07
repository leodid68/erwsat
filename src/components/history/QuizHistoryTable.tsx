'use client';

import { useState, useMemo } from 'react';
import { QuizAttempt } from '@/types/quiz';
import { Quiz } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
  Target,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuizHistoryTableProps {
  history: QuizAttempt[];
  quizzes: Quiz[];
}

type SortField = 'date' | 'score' | 'time';
type SortOrder = 'asc' | 'desc';

export function QuizHistoryTable({ history, quizzes }: QuizHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterMinScore, setFilterMinScore] = useState<number | null>(null);

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz?.title || 'Quiz supprimé';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const sortedHistory = useMemo(() => {
    let filtered = [...history];

    // Apply score filter
    if (filterMinScore !== null) {
      filtered = filtered.filter((attempt) => {
        const scorePercent = (attempt.score / attempt.totalQuestions) * 100;
        return scorePercent >= filterMinScore;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison =
            new Date(a.completedAt).getTime() -
            new Date(b.completedAt).getTime();
          break;
        case 'score':
          const scoreA = a.score / a.totalQuestions;
          const scoreB = b.score / b.totalQuestions;
          comparison = scoreA - scoreB;
          break;
        case 'time':
          comparison = a.timeSpent - b.timeSpent;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [history, sortField, sortOrder, filterMinScore]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium transition-colors',
        sortField === field
          ? 'text-blue-800'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {sortField === field &&
        (sortOrder === 'desc' ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        ))}
    </button>
  );

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-400';
    if (percent >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (percent: number) => {
    if (percent >= 80) return 'default';
    if (percent >= 60) return 'secondary';
    return 'destructive';
  };

  if (history.length === 0) {
    return (
      <Card className="glass-cosmic">
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun quiz complété</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterMinScore === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMinScore(null)}
        >
          Tous
        </Button>
        <Button
          variant={filterMinScore === 80 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMinScore(80)}
        >
          80%+
        </Button>
        <Button
          variant={filterMinScore === 60 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMinScore(60)}
        >
          60%+
        </Button>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-2 text-muted-foreground">
        <SortButton field="date">
          <Calendar className="w-3 h-3" />
          Date
        </SortButton>
        <span className="text-xs font-medium">Quiz</span>
        <SortButton field="score">
          <Target className="w-3 h-3" />
          Score
        </SortButton>
        <SortButton field="time">
          <Clock className="w-3 h-3" />
          Temps
        </SortButton>
        <span className="text-xs font-medium text-right">Actions</span>
      </div>

      {/* Table Body */}
      <div className="space-y-2">
        {sortedHistory.map((attempt) => {
          const scorePercent = Math.round(
            (attempt.score / attempt.totalQuestions) * 100
          );

          return (
            <Card key={attempt.id} className="glass-cosmic hover:bg-muted transition-colors">
              <CardContent className="p-4">
                {/* Desktop layout */}
                <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
                  <span className="text-sm text-foreground">
                    {formatDate(attempt.completedAt)}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {getQuizTitle(attempt.quizId)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getScoreBadgeVariant(scorePercent)}>
                      {scorePercent}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">
                    {formatTime(attempt.timeSpent)}
                  </span>
                  <div className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/results/${attempt.quizId}?attemptId=${attempt.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {getQuizTitle(attempt.quizId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attempt.completedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={getScoreBadgeVariant(scorePercent)}
                      className={getScoreColor(scorePercent)}
                    >
                      {scorePercent}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {attempt.score}/{attempt.totalQuestions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(attempt.timeSpent)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/results/${attempt.quizId}?attemptId=${attempt.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground text-center">
        {sortedHistory.length} quiz{sortedHistory.length !== 1 ? 's' : ''} affichés
        {filterMinScore !== null && ` (filtrés: ${filterMinScore}%+)`}
      </p>
    </div>
  );
}
