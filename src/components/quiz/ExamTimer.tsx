'use client';

import { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
  startTime: number;
  timeLimit: number | null; // seconds
  onTimeUp?: () => void;
}

export function ExamTimer({ startTime, timeLimit, onTimeUp }: ExamTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSec = Math.floor((now - startTime) / 1000);
      setElapsed(elapsedSec);

      if (timeLimit && elapsedSec >= timeLimit) {
        onTimeUp?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, timeLimit, onTimeUp]);

  const remaining = timeLimit ? Math.max(0, timeLimit - elapsed) : null;
  const isWarning = remaining !== null && remaining < 300; // 5 min warning
  const isCritical = remaining !== null && remaining < 60; // 1 min critical

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg',
      isCritical && 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse',
      isWarning && !isCritical && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      !isWarning && 'bg-white/5 text-slate-300 border border-white/10'
    )}>
      {isCritical ? <AlertTriangle className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
      {remaining !== null ? (
        <span>{formatTime(remaining)}</span>
      ) : (
        <span>{formatTime(elapsed)}</span>
      )}
    </div>
  );
}
