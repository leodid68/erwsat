'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Loader2, AlertCircle, Search, User } from 'lucide-react';
import { GutenbergBook, TextChunk } from '@/lib/text-sources';

interface GutenbergImportProps {
  onBookFetched: (data: {
    book: GutenbergBook;
    chunks: TextChunk[];
  }) => void;
}

export function GutenbergImport({ onBookFetched }: GutenbergImportProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchResults, setSearchResults] = useState<GutenbergBook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setError('Entrez au moins 2 caractères');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/gutenberg/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.results);
      if (data.results.length === 0) {
        setError('Aucun livre trouvé. Essayez une autre recherche.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchBook = async (book: GutenbergBook) => {
    setSelectedBookId(book.id);
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch('/api/gutenberg/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch book');
      }

      onBookFetched({
        book: data.book,
        chunks: data.chunks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch book');
    } finally {
      setIsFetching(false);
      setSelectedBookId(null);
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
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200/50 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-emerald-900">Project Gutenberg</p>
            <p className="text-sm text-emerald-700 mt-1">
              Cherchez des romans classiques : Austen, Dickens, Brontë et plus encore.
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
          placeholder="Rechercher par titre ou auteur..."
          disabled={isSearching || isFetching}
          className="h-11 bg-white/60 border-white/60"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || isFetching || query.trim().length < 2}
          className="h-11 px-5 bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
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
            {searchResults.map((book) => (
              <button
                key={book.id}
                onClick={() => handleFetchBook(book)}
                disabled={isFetching}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all duration-200 backdrop-blur-sm',
                  'bg-white/40 border border-white/60 hover:bg-white/60 hover:border-emerald-300',
                  isFetching && selectedBookId === book.id && 'border-emerald-400 bg-emerald-50/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    {isFetching && selectedBookId === book.id ? (
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{book.title}</p>
                    {book.authors.length > 0 && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" />
                        {book.authors.join(', ')}
                      </p>
                    )}
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
