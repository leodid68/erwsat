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
        'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150',
        disabled && 'cursor-default',
        status === 'default' && 'border-white/60 bg-white/40 backdrop-blur-sm hover:border-white/80 hover:bg-white/60',
        status === 'selected' && 'border-indigo-400 bg-indigo-100/50 backdrop-blur-sm',
        status === 'correct' && 'border-emerald-400 bg-emerald-100/50 backdrop-blur-sm',
        status === 'incorrect' && 'border-red-400 bg-red-100/50 backdrop-blur-sm'
      )}
    >
      {/* Answer Bubble */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-150',
          status === 'default' && 'bg-black/5 text-gray-500',
          status === 'selected' && 'bg-indigo-500 text-white',
          status === 'correct' && 'bg-emerald-500 text-white',
          status === 'incorrect' && 'bg-red-500 text-white'
        )}
      >
        {status === 'correct' ? (
          <Check className="w-4 h-4" />
        ) : status === 'incorrect' ? (
          <X className="w-4 h-4" />
        ) : (
          id
        )}
      </div>

      {/* Answer Text */}
      <p
        className={cn(
          'flex-1 text-sm leading-relaxed pt-1',
          status === 'default' && 'text-gray-700',
          status === 'selected' && 'text-gray-900 font-medium',
          status === 'correct' && 'text-emerald-600 font-medium',
          status === 'incorrect' && 'text-red-600'
        )}
      >
        {text}
      </p>
    </button>
  );
}
