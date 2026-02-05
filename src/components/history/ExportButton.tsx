'use client';

import { QuizAttempt, Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  history: QuizAttempt[];
  quizzes: Quiz[];
}

export function ExportButton({ history, quizzes }: ExportButtonProps) {
  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz?.title || 'Quiz supprimé';
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleExport = () => {
    // CSV header
    const headers = ['date', 'quiz_title', 'score', 'total', 'percentage', 'time_spent_seconds'];

    // CSV rows
    const rows = history.map((attempt) => {
      const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);
      const quizTitle = getQuizTitle(attempt.quizId).replace(/"/g, '""'); // Escape quotes

      return [
        formatDate(attempt.completedAt),
        `"${quizTitle}"`,
        attempt.score,
        attempt.totalQuestions,
        scorePercent,
        attempt.timeSpent,
      ].join(',');
    });

    // Combine header and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `sat-erw-history-${formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="w-4 h-4 mr-2" />
      Exporter CSV
    </Button>
  );
}
