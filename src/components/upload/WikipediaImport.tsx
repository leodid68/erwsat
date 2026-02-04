'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Loader2, AlertCircle, Search } from 'lucide-react';
import { TextChunk } from '@/lib/text-sources';

interface WikipediaResult {
  title: string;
  snippet: string;
}

interface WikipediaImportProps {
  onArticleFetched: (data: {
    title: string;
    chunks: TextChunk[];
  }) => void;
}

export function WikipediaImport({ onArticleFetched }: WikipediaImportProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchResults, setSearchResults] = useState<WikipediaResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setError('Entrez au moins 2 caractères');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/wikipedia/search?q=${encodeURIComponent(query.trim())}`);
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

  const handleFetchArticle = async (result: WikipediaResult) => {
    setSelectedTitle(result.title);
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch('/api/wikipedia/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: result.title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch article');
      }

      onArticleFetched({
        title: data.title,
        chunks: data.chunks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article');
    } finally {
      setIsFetching(false);
      setSelectedTitle(null);
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
      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/50 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-blue-900">Wikipedia</p>
            <p className="text-sm text-blue-700 mt-1">
              Cherchez des articles historiques, scientifiques, des biographies et plus encore.
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
          placeholder="Rechercher un sujet..."
          disabled={isSearching || isFetching}
          className="h-11 bg-white/60 border-white/60"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || isFetching || query.trim().length < 2}
          className="h-11 px-5 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
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
            {searchResults.map((result) => (
              <button
                key={result.title}
                onClick={() => handleFetchArticle(result)}
                disabled={isFetching}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all duration-200 backdrop-blur-sm',
                  'bg-white/40 border border-white/60 hover:bg-white/60 hover:border-blue-300',
                  isFetching && selectedTitle === result.title && 'border-blue-400 bg-blue-50/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    {isFetching && selectedTitle === result.title ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <Globe className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{result.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                      {result.snippet}
                    </p>
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
