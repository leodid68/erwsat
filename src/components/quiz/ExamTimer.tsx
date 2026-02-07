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
  const percentRemaining = remaining !== null && timeLimit ? (remaining / timeLimit) * 100 : 100;
  const isCritical = remaining !== null && remaining < 60; // 1 min
  const isWarning = remaining !== null && remaining < 300; // 5 min

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayTime = remaining !== null ? formatTime(remaining) : formatTime(elapsed);
  const ariaLabel = remaining !== null
    ? `Temps restant : ${displayTime}${isCritical ? ' — temps presque écoulé !' : ''}`
    : `Temps écoulé : ${displayTime}`;

  return (
    <div
      role="timer"
      aria-label={ariaLabel}
      aria-live={isCritical ? 'assertive' : 'polite'}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg transition-colors duration-500',
        isCritical && 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse',
        isWarning && !isCritical && 'bg-amber-400/20 text-amber-500 border border-amber-400/30',
        !isWarning && 'bg-white/4 text-foreground border border-border'
      )}
    >
      {isCritical ? (
        <AlertTriangle className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Timer className="w-5 h-5" aria-hidden="true" />
      )}
      <span>{displayTime}</span>
      {remaining !== null && timeLimit && (
        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden ml-1">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              isCritical && 'bg-red-400',
              isWarning && !isCritical && 'bg-amber-400',
              !isWarning && 'bg-violet-400'
            )}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      )}
    </div>
  );
}
