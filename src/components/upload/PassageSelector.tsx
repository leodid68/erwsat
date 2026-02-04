'use client';

import { useState } from 'react';
import { Passage } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PassageSelectorProps {
  passages: Passage[];
  onPassagesChange: (passages: Passage[]) => void;
  onContinue: () => void;
}

export function PassageSelector({
  passages,
  onPassagesChange,
  onContinue,
}: PassageSelectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedCount = passages.filter((p) => p.selected).length;
  const totalWords = passages
    .filter((p) => p.selected)
    .reduce((sum, p) => sum + p.wordCount, 0);

  const togglePassage = (id: string) => {
    onPassagesChange(
      passages.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = () => {
    onPassagesChange(passages.map((p) => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    onPassagesChange(passages.map((p) => ({ ...p, selected: false })));
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Stats and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} sur {passages.length} passages sélectionnés
          </Badge>
          <Badge variant="outline" className="text-sm">
            ~{totalWords} mots
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            <CheckSquare className="h-4 w-4 mr-1" />
            Tout sélectionner
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            <Square className="h-4 w-4 mr-1" />
            Tout désélectionner
          </Button>
        </div>
      </div>

      {/* Passage List */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <div className="p-4 space-y-3">
          {passages.map((passage, index) => (
            <Card
              key={passage.id}
              className={cn(
                'cursor-pointer transition-colors',
                passage.selected
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/50'
              )}
            >
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePassage(passage.id)}
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                        passage.selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {passage.selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Passage {index + 1}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {passage.wordCount} mots
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(passage.id)}
                  >
                    {expandedId === passage.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedId === passage.id && (
                <>
                  <Separator />
                  <CardContent className="py-3 px-4">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {passage.text}
                    </p>
                  </CardContent>
                </>
              )}

              {expandedId !== passage.id && (
                <CardContent className="py-0 px-4 pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {passage.text}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={selectedCount === 0}
          size="lg"
        >
          Continuer avec {selectedCount} passage{selectedCount !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
