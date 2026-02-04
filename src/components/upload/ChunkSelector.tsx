'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextChunk } from '@/lib/text-sources';
import { FileText, Check, ArrowRight } from 'lucide-react';

interface ChunkSelectorProps {
  title: string;
  subtitle?: string;
  chunks: TextChunk[];
  onContinue: (selectedChunks: TextChunk[]) => void;
  onBack: () => void;
}

export function ChunkSelector({
  title,
  subtitle,
  chunks,
  onContinue,
  onBack,
}: ChunkSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(chunks.map((c) => c.id))
  );

  const toggleChunk = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(chunks.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleContinue = () => {
    const selected = chunks.filter((c) => selectedIds.has(c.id));
    onContinue(selected);
  };

  const totalWords = chunks
    .filter((c) => selectedIds.has(c.id))
    .reduce((sum, c) => sum + c.wordCount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/80 to-purple-50/60 border border-violet-200/50 backdrop-blur-sm">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedIds.size} sur {chunks.length} parties sélectionnées ({totalWords.toLocaleString()} mots)
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">
            Tout sélectionner
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs">
            Tout désélectionner
          </Button>
        </div>
      </div>

      {/* Chunks List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {chunks.map((chunk) => {
            const isSelected = selectedIds.has(chunk.id);
            return (
              <button
                key={chunk.id}
                type="button"
                onClick={() => toggleChunk(chunk.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 backdrop-blur-sm',
                  isSelected
                    ? 'bg-indigo-100/60 border-2 border-indigo-400'
                    : 'bg-white/40 border border-white/60 hover:bg-white/60 hover:border-white/80'
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5',
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/80 border border-gray-300'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">{chunk.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {chunk.wordCount} mots
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {chunk.text.slice(0, 150)}...
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          Retour
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedIds.size === 0}
          className="bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25"
        >
          Continuer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
