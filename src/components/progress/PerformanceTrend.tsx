'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { QuizAttempt } from '@/types/quiz';
import { TrendingUp, TrendingDown, Minus, Clock, Zap } from 'lucide-react';

interface PerformanceTrendProps {
  quizHistory: QuizAttempt[];
  className?: string;
}

interface TrendData {
  recentAvg: number;
  previousAvg: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  avgTimePerQuestion: number;
  totalStudyTime: number;
}

export function PerformanceTrend({ quizHistory, className }: PerformanceTrendProps) {
  const trendData = useMemo((): TrendData | null => {
    if (quizHistory.length < 2) return null;

    // Split into recent (last 5) and previous (5 before that)
    const recent = quizHistory.slice(0, 5);
    const previous = quizHistory.slice(5, 10);

    if (previous.length === 0) {
      // Not enough history for comparison
      const recentAvg = recent.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / recent.length;
      const totalTime = quizHistory.reduce((sum, a) => sum + a.timeSpent, 0);
      const totalQuestions = quizHistory.reduce((sum, a) => sum + a.totalQuestions, 0);

      return {
        recentAvg: Math.round(recentAvg),
        previousAvg: recentAvg,
        trend: 'stable',
        change: 0,
        avgTimePerQuestion: totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0,
        totalStudyTime: totalTime,
      };
    }

    const recentAvg = recent.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / recent.length;
    const previousAvg = previous.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / previous.length;
    const change = recentAvg - previousAvg;

    const totalTime = quizHistory.reduce((sum, a) => sum + a.timeSpent, 0);
    const totalQuestions = quizHistory.reduce((sum, a) => sum + a.totalQuestions, 0);

    let trend: 'up' | 'down' | 'stable';
    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';
    else trend = 'stable';

    return {
      recentAvg: Math.round(recentAvg),
      previousAvg: Math.round(previousAvg),
      trend,
      change: Math.round(Math.abs(change)),
      avgTimePerQuestion: totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0,
      totalStudyTime: totalTime,
    };
  }, [quizHistory]);

  if (!trendData) return null;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  };

  const TrendIcon = trendData.trend === 'up' ? TrendingUp : trendData.trend === 'down' ? TrendingDown : Minus;
  const trendColor = trendData.trend === 'up' ? 'text-emerald-600' : trendData.trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {/* Trend indicator */}
      <div className="p-3 rounded-xl bg-white/40 border border-white/60">
        <div className="flex items-center gap-2 mb-1">
          <TrendIcon className={cn('w-4 h-4', trendColor)} />
          <span className="text-xs text-muted-foreground">Tendance</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold">{trendData.recentAvg}%</span>
          {trendData.change > 0 && (
            <span className={cn('text-xs font-medium', trendColor)}>
              {trendData.trend === 'up' ? '+' : trendData.trend === 'down' ? '-' : ''}
              {trendData.change}%
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {trendData.trend === 'up' ? 'En amélioration' : trendData.trend === 'down' ? 'En baisse' : 'Stable'}
        </p>
      </div>

      {/* Avg time per question */}
      <div className="p-3 rounded-xl bg-white/40 border border-white/60">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Temps/question</span>
        </div>
        <div className="text-lg font-bold">{trendData.avgTimePerQuestion}s</div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {trendData.avgTimePerQuestion < 45 ? 'Rapide' : trendData.avgTimePerQuestion < 75 ? 'Normal' : 'Prendre son temps'}
        </p>
      </div>

      {/* Total study time */}
      <div className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-sky-50/60 border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Temps total d'étude</p>
              <p className="font-bold text-primary">
                {formatTime(trendData.totalStudyTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
