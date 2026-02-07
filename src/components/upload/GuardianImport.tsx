'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, Loader2, AlertCircle, Search, Calendar, Tag } from 'lucide-react';
import { GuardianArticle, TextChunk } from '@/lib/text-sources';

interface GuardianImportProps {
  onArticleFetched: (data: {
    article: GuardianArticle;
    chunks: TextChunk[];
  }) => void;
}

export function GuardianImport({ onArticleFetched }: GuardianImportProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchResults, setSearchResults] = useState<GuardianArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setError('Entrez au moins 2 caractères');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/guardian/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.results);
      if (data.results.length === 0) {
        setError('Aucun article trouvé. Essayez une autre recherche.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchArticle = async (article: GuardianArticle) => {
    setSelectedId(article.id);
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch('/api/guardian/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch article');
      }

      onArticleFetched({
        article: data.article,
        chunks: data.chunks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article');
    } finally {
      setIsFetching(false);
      setSelectedId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200/50 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-orange-400">The Guardian</p>
            <p className="text-sm text-orange-400 mt-1">
              Cherchez des actualités : politique, culture, science, opinion...
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher des articles..."
          disabled={isSearching || isFetching}
          className="h-11 bg-white/4 border-white/4"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || isFetching || query.trim().length < 2}
          className="h-11 px-5 bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
      {searchResults.length > 0 && (
        <ScrollArea className="h-[280px]">
          <div className="space-y-2">
            {searchResults.map((article) => (
              <button
                key={article.id}
                onClick={() => handleFetchArticle(article)}
                disabled={isFetching}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all duration-200 backdrop-blur-sm',
                  'bg-white/4 border border-white/4 hover:bg-white/4 hover:border-orange-300',
                  isFetching && selectedId === article.id && 'border-orange-400 bg-orange-500/10'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    {isFetching && selectedId === article.id ? (
                      <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                    ) : (
                      <Newspaper className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/90 line-clamp-2">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {article.section}
                      </span>
                      {article.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {article.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
