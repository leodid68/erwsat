'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Library,
  Loader2,
  AlertCircle,
  Shuffle,
  BookOpen,
  Newspaper,
  Globe,
  Check,
  Save,
  Sparkles,
  Info,
  Database,
} from 'lucide-react';
import {
  TextCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '@/lib/text-library';
import { useQuizStore } from '@/stores/quiz-store';

interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  category: TextCategory;
  provider: 'gutenberg' | 'wikipedia' | 'guardian';
  providerId: string | number;
  preview: string;
  saveToLibrary?: boolean;
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

// SAT-recommended categories with their approximate weights
const SAT_RECOMMENDED_CATEGORIES: { category: TextCategory; weight: number }[] = [
  { category: 'literature', weight: 25 },
  { category: 'science', weight: 25 },
  { category: 'history', weight: 20 },
  { category: 'politics', weight: 15 }, // Social science
  { category: 'culture', weight: 10 },  // Humanities
  { category: 'poetry', weight: 3 },
  { category: 'opinion', weight: 2 },
];

const PROVIDER_ICONS = {
  gutenberg: BookOpen,
  wikipedia: Globe,
  guardian: Newspaper,
};

export function LibraryImport({ onItemsSelected }: LibraryImportProps) {
  const [selectedCategories, setSelectedCategories] = useState<TextCategory[]>([]);
  const [textCount, setTextCount] = useState(10);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { passageLibrary } = useQuizStore();

  const toggleCategory = (category: TextCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Distribute count across categories based on SAT weights
  const distributeCountByCategory = (
    categories: TextCategory[],
    totalCount: number
  ): Map<TextCategory, number> => {
    const distribution = new Map<TextCategory, number>();

    if (categories.length === 0) return distribution;

    // Get weights for selected categories
    const selectedWeights = SAT_RECOMMENDED_CATEGORIES.filter((c) =>
      categories.includes(c.category)
    );

    const totalWeight = selectedWeights.reduce((sum, c) => sum + c.weight, 0);

    // Distribute based on weights
    let remaining = totalCount;
    selectedWeights.forEach((c, index) => {
      if (index === selectedWeights.length - 1) {
        // Last category gets remainder
        distribution.set(c.category, remaining);
      } else {
        const count = Math.max(1, Math.round((c.weight / totalWeight) * totalCount));
        distribution.set(c.category, count);
        remaining -= count;
      }
    });

    return distribution;
  };

  const handleFetchRandom = async (mode: 'categories' | 'mix' | 'sat') => {
    setIsLoading(true);
    setError(null);
    setItems([]);
    setSelectedItems(new Set());

    try {
      if (mode === 'mix') {
        // Fetch random mix
        const response = await fetch(`/api/library/random?category=mix&count=${textCount}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setItems(data.items);
        setSelectedItems(new Set(data.items.map((i: LibraryItem) => i.id)));
      } else if (mode === 'sat') {
        // Fetch with SAT distribution
        const satCategories = SAT_RECOMMENDED_CATEGORIES.map((c) => c.category);
        const distribution = distributeCountByCategory(satCategories, textCount);

        const allItems: LibraryItem[] = [];
        for (const [category, count] of distribution.entries()) {
          if (count === 0) continue;
          const response = await fetch(
            `/api/library/random?category=${category}&count=${count}`
          );
          const data = await response.json();
          if (response.ok && data.items) {
            allItems.push(...data.items);
          }
        }
        setItems(allItems);
        setSelectedItems(new Set(allItems.map((i) => i.id)));
      } else {
        // Fetch from selected categories with weighted distribution
        if (selectedCategories.length === 0) {
          setError('Sélectionnez au moins une catégorie');
          setIsLoading(false);
          return;
        }

        const distribution = distributeCountByCategory(selectedCategories, textCount);
        const allItems: LibraryItem[] = [];

        for (const [category, count] of distribution.entries()) {
          if (count === 0) continue;
          const response = await fetch(
            `/api/library/random?category=${category}&count=${count}`
          );
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
    // Pass saveToLibrary flag with the items so the parent can save with full text
    const itemsWithSaveFlag: LibraryItem[] = selected.map(item => ({
      ...item,
      saveToLibrary,
    }));
    onItemsSelected(itemsWithSaveFlag);
  };

  const estimatedQuestions = Math.floor(selectedItems.size * 3);

  return (
    <div className="space-y-5">
      {/* Library Stats */}
      {passageLibrary.length > 0 && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-300">
                Bibliothèque: {passageLibrary.length} passages
              </p>
              <p className="text-xs text-emerald-400/70">
                ~{Math.floor(passageLibrary.length * 3)} questions potentielles
              </p>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              {passageLibrary.filter((p) => p.timesUsed === 0).length} non utilisés
            </Badge>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0">
            <Library className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-violet-300">Importation SAT</p>
            <p className="text-sm text-violet-400/70 mt-1">
              Importez des textes variés correspondant aux standards SAT officiels.
              Chaque texte peut générer ~3 questions différentes.
            </p>
          </div>
        </div>
      </div>

      {/* Text Count Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Nombre de textes</p>
          <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
            {textCount} textes → ~{textCount * 3} questions
          </Badge>
        </div>
        <Slider
          value={[textCount]}
          onValueChange={([value]) => setTextCount(value)}
          min={5}
          max={50}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>5 textes</span>
          <span>25</span>
          <span>50 textes</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300">Catégories</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_CATEGORIES.map((category) => {
            const satWeight = SAT_RECOMMENDED_CATEGORIES.find(
              (c) => c.category === category
            )?.weight;
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                disabled={isLoading}
                className={cn(
                  'p-3 rounded-xl text-left transition-all duration-200 border relative',
                  selectedCategories.includes(category)
                    ? 'border-violet-400 bg-violet-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                )}
              >
                <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                <p className="text-xs font-medium mt-1 text-slate-300">
                  {CATEGORY_LABELS[category]}
                </p>
                {satWeight && satWeight >= 15 && (
                  <div className="absolute top-1 right-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      SAT {satWeight}%
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save to Library Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              saveToLibrary
                ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white'
                : 'bg-white/5 border border-white/10 text-slate-500'
            )}
          >
            <Save className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              Sauvegarder dans la bibliothèque
            </p>
            <p className="text-xs text-slate-500">
              Réutilisez les textes pour générer plus de questions
            </p>
          </div>
        </div>
        <button
          onClick={() => setSaveToLibrary(!saveToLibrary)}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            saveToLibrary ? 'bg-emerald-500' : 'bg-white/10'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              saveToLibrary ? 'translate-x-6' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => handleFetchRandom('sat')}
          disabled={isLoading}
          className="bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Mix SAT
        </Button>
        <Button
          onClick={() => handleFetchRandom('categories')}
          disabled={isLoading || selectedCategories.length === 0}
          className="bg-gradient-to-br from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Library className="w-4 h-4 mr-2" />
          )}
          Catégories
        </Button>
        <Button
          onClick={() => handleFetchRandom('mix')}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4 mr-2" />
          )}
          Aléatoire
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">
              {items.length} textes trouvés
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-violet-400 border-violet-500/30">
                {selectedItems.size} sélectionné(s)
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                ~{estimatedQuestions} questions
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {items.map((item) => {
                const Icon = PROVIDER_ICONS[item.provider];
                const isSelected = selectedItems.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={cn(
                      'w-full p-3 rounded-xl text-left transition-all duration-200 flex items-start gap-3',
                      isSelected
                        ? 'bg-violet-500/20 border-2 border-violet-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all',
                        isSelected
                          ? 'bg-violet-500 text-white'
                          : 'bg-white/10 border border-white/20'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <Badge
                          variant="outline"
                          className="text-xs border-white/20 text-slate-400"
                        >
                          {CATEGORY_LABELS[item.category]}
                        </Badge>
                      </div>
                      <p className="font-medium text-slate-200 text-sm line-clamp-1">
                        {item.title}
                      </p>
                      {item.author && (
                        <p className="text-xs text-slate-500">{item.author}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
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
            <Check className="w-4 h-4 mr-2" />
            Importer {selectedItems.size} texte(s)
            {saveToLibrary && ' et sauvegarder'}
          </Button>
        </div>
      )}
    </div>
  );
}
