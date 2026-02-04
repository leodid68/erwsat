'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Library,
  Loader2,
  AlertCircle,
  Shuffle,
  BookOpen,
  Newspaper,
  Globe,
  Check,
} from 'lucide-react';
import {
  TextCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '@/lib/text-library';

interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  category: TextCategory;
  provider: 'gutenberg' | 'wikipedia' | 'guardian';
  providerId: string | number;
  preview: string;
}

interface LibraryImportProps {
  onItemsSelected: (items: LibraryItem[]) => void;
}

const ALL_CATEGORIES: TextCategory[] = [
  'literature',
  'poetry',
  'drama',
  'history',
  'science',
  'politics',
  'culture',
  'opinion',
];

const PROVIDER_ICONS = {
  gutenberg: BookOpen,
  wikipedia: Globe,
  guardian: Newspaper,
};

export function LibraryImport({ onItemsSelected }: LibraryImportProps) {
  const [selectedCategories, setSelectedCategories] = useState<TextCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleCategory = (category: TextCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleFetchRandom = async (mode: 'categories' | 'mix') => {
    setIsLoading(true);
    setError(null);
    setItems([]);
    setSelectedItems(new Set());

    try {
      if (mode === 'mix') {
        // Fetch random mix
        const response = await fetch('/api/library/random?category=mix&count=5');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setItems(data.items);
        // Auto-select all
        setSelectedItems(new Set(data.items.map((i: LibraryItem) => i.id)));
      } else {
        // Fetch from selected categories
        if (selectedCategories.length === 0) {
          setError('Sélectionnez au moins une catégorie');
          setIsLoading(false);
          return;
        }

        const allItems: LibraryItem[] = [];
        for (const category of selectedCategories) {
          const response = await fetch(`/api/library/random?category=${category}&count=2`);
          const data = await response.json();
          if (response.ok && data.items) {
            allItems.push(...data.items);
          }
        }
        setItems(allItems);
        setSelectedItems(new Set(allItems.map((i) => i.id)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    const selected = items.filter((item) => selectedItems.has(item.id));
    onItemsSelected(selected);
  };

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/80 to-purple-50/60 border border-violet-200/50 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0">
            <Library className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-violet-900">Bibliothèque aléatoire</p>
            <p className="text-sm text-violet-700 mt-1">
              Sélectionnez des catégories ou laissez le hasard choisir pour vous
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Catégories</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              disabled={isLoading}
              className={cn(
                'p-3 rounded-xl text-left transition-all duration-200 border',
                selectedCategories.includes(category)
                  ? 'border-violet-400 bg-violet-100/60'
                  : 'border-white/60 bg-white/40 hover:bg-white/60'
              )}
            >
              <span className="text-lg">{CATEGORY_ICONS[category]}</span>
              <p className="text-xs font-medium mt-1 text-gray-700">
                {CATEGORY_LABELS[category]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleFetchRandom('categories')}
          disabled={isLoading || selectedCategories.length === 0}
          className="flex-1 bg-gradient-to-br from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Library className="w-4 h-4 mr-2" />
          )}
          Chercher ({selectedCategories.length})
        </Button>
        <Button
          onClick={() => handleFetchRandom('mix')}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4 mr-2" />
          )}
          Mix aléatoire
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {items.length} textes trouvés
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedItems.size} sélectionné(s)
            </p>
          </div>

          <ScrollArea className="h-[240px]">
            <div className="space-y-2">
              {items.map((item) => {
                const Icon = PROVIDER_ICONS[item.provider];
                const isSelected = selectedItems.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={cn(
                      'w-full p-3 rounded-xl text-left transition-all duration-200 backdrop-blur-sm flex items-start gap-3',
                      isSelected
                        ? 'bg-violet-100/60 border-2 border-violet-400'
                        : 'bg-white/40 border border-white/60 hover:bg-white/60'
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all',
                        isSelected
                          ? 'bg-violet-500 text-white'
                          : 'bg-white/80 border border-gray-300'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[item.category]}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.title}
                      </p>
                      {item.author && (
                        <p className="text-xs text-gray-500">{item.author}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {item.preview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={selectedItems.size === 0}
            className="w-full bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
          >
            Importer {selectedItems.size} texte(s)
          </Button>
        </div>
      )}
    </div>
  );
}
