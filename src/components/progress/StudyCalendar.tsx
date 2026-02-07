'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { QuizAttempt } from '@/types/quiz';

interface StudyCalendarProps {
  quizHistory: QuizAttempt[];
  className?: string;
}

export function StudyCalendar({ quizHistory, className }: StudyCalendarProps) {
  const calendarData = useMemo(() => {
    // Get last 12 weeks (84 days)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83);

    // Group attempts by date
    const attemptsByDate = new Map<string, { count: number; totalScore: number }>();
    quizHistory.forEach((attempt) => {
      const date = new Date(attempt.completedAt).toISOString().split('T')[0];
      const existing = attemptsByDate.get(date) || { count: 0, totalScore: 0 };
      attemptsByDate.set(date, {
        count: existing.count + 1,
        totalScore: existing.totalScore + (attempt.score / attempt.totalQuestions) * 100,
      });
    });

    // Generate calendar grid (12 weeks x 7 days)
    const weeks: Array<Array<{ date: string; count: number; avgScore: number | null }>> = [];
    let currentDate = new Date(startDate);

    // Align to start of week (Sunday)
    const dayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - dayOfWeek);

    for (let week = 0; week < 12; week++) {
      const weekDays: Array<{ date: string; count: number; avgScore: number | null }> = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = attemptsByDate.get(dateStr);
        weekDays.push({
          date: dateStr,
          count: dayData?.count || 0,
          avgScore: dayData ? dayData.totalScore / dayData.count : null,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return weeks;
  }, [quizHistory]);

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-white/5 dark:bg-white/10';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900';
    if (count === 2) return 'bg-emerald-300 dark:bg-emerald-700';
    if (count <= 4) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-3 h-3 text-[8px] text-muted-foreground flex items-center justify-center">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {calendarData.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={cn(
                  'w-3 h-3 rounded-sm transition-all',
                  getIntensity(day.count),
                  day.date === todayStr && 'ring-1 ring-primary ring-offset-1',
                  day.date > todayStr && 'opacity-30'
                )}
                title={`${day.date}: ${day.count} quiz${day.count !== 1 ? 'zes' : ''}${
                  day.avgScore !== null ? ` (${Math.round(day.avgScore)}% avg)` : ''
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Moins</span>
        <div className="w-3 h-3 rounded-sm bg-white/5 dark:bg-white/10" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
        <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <span>Plus</span>
      </div>
    </div>
  );
}
