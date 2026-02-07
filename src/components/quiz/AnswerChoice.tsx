'use client';

import { AnswerId } from '@/types/question';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface AnswerChoiceProps {
  id: AnswerId;
  text: string;
  status: 'default' | 'selected' | 'correct' | 'incorrect';
  onClick: () => void;
  disabled?: boolean;
}

export function AnswerChoice({
  id,
  text,
  status,
  onClick,
  disabled = false,
}: AnswerChoiceProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base glass styling
        'w-full flex items-start gap-4 p-4 rounded-2xl text-left',
        'transition-all duration-300 ease-out',
        'relative overflow-hidden group',
        disabled && 'cursor-default',

        // Default state - Dark glass
        status === 'default' && [
          'glass-choice',
          !disabled && 'hover:scale-[1.01] active:scale-[0.99]',
        ],

        // Selected state - Purple neon glow
        status === 'selected' && 'glass-choice-selected',

        // Correct state - Emerald glow
        status === 'correct' && 'glass-choice-correct',

        // Incorrect state - Red glow
        status === 'incorrect' && 'glass-choice-incorrect'
      )}
    >
      {/* Hover glow effect for default state */}
      {status === 'default' && !disabled && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        </div>
      )}

      {/* Answer Bubble */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
          'transition-all duration-300 ease-out',
          'border',

          // Default - Subtle
          status === 'default' && [
            'bg-muted border-border text-muted-foreground',
            'group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary',
          ],

          // Selected - Primary gradient
          status === 'selected' && [
            'bg-gradient-to-br from-violet-500 to-violet-700 border-violet-500/50 text-white',
            'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
          ],

          // Correct - Success gradient
          status === 'correct' && [
            'bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-400/50 text-white',
            'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
          ],

          // Incorrect - Destructive gradient
          status === 'incorrect' && [
            'bg-gradient-to-br from-red-500 to-rose-500 border-red-400/50 text-white',
            'shadow-[0_0_20px_rgba(220,38,38,0.4)]',
          ]
        )}
      >
        {status === 'correct' ? (
          <Check className="w-5 h-5" strokeWidth={3} />
        ) : status === 'incorrect' ? (
          <X className="w-5 h-5" strokeWidth={3} />
        ) : (
          id
        )}
      </div>

      {/* Answer Text */}
      <p
        className={cn(
          'flex-1 text-sm leading-relaxed pt-2',
          'transition-colors duration-300',

          status === 'default' && 'text-muted-foreground group-hover:text-foreground',
          status === 'selected' && 'text-foreground font-medium',
          status === 'correct' && 'text-success font-medium',
          status === 'incorrect' && 'text-destructive'
        )}
      >
        {text}
      </p>

      {/* Selected indicator line */}
      {status === 'selected' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-violet-600 to-violet-500 animate-pulse" />
      )}
    </button>
  );
}
