'use client';

import { BookOpen } from 'lucide-react';

/**
 * Format passage text for better readability
 * - Detects dialogue (Character: or CHARACTER.) and adds line breaks
 * - Formats character names in bold
 */
function FormattedPassage({ text }: { text: string }) {
  const dialoguePattern = /(?:^|\s)([A-Z][a-z]{0,15}(?:\.|:))\s/g;

  const matches = text.match(dialoguePattern);
  const isDialogue = matches && matches.length >= 2;

  if (isDialogue) {
    const parts = text.split(/(?=(?:^|\s)[A-Z][a-z]{0,15}(?:\.|:)\s)/);

    return (
      <div className="space-y-3">
        {parts.map((part, i) => {
          const trimmed = part.trim();
          if (!trimmed) return null;

          const charMatch = trimmed.match(/^([A-Z][a-z]{0,15}(?:\.|:))\s*(.*)$/s);

          if (charMatch) {
            const [, charName, dialogue] = charMatch;
            return (
              <p key={i} className="pl-4">
                <span className="font-semibold text-primary">{charName}</span>{' '}
                <span className="italic text-foreground/80">{dialogue}</span>
              </p>
            );
          }

          return (
            <p key={i} className="italic text-foreground/80">{trimmed}</p>
          );
        })}
      </div>
    );
  }

  return (
    <p className="indent-6 text-justify italic text-foreground/80 leading-relaxed">{text}</p>
  );
}

interface PassagePanelProps {
  passage: string;
  className?: string;
}

export function PassagePanel({ passage, className }: PassagePanelProps) {
  return (
    <div className={className}>
      <div className="glass-passage p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-4">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="uppercase tracking-wider">Lisez le passage</span>
        </div>
        <div className="text-sm leading-relaxed">
          <FormattedPassage text={passage} />
        </div>
      </div>
    </div>
  );
}
