'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Volume2, Loader2, BookOpen, Languages, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DictionaryResult {
  word: string;
  definition: string | null;
  phonetic: string | null;
  audioUrl: string | null;
  partOfSpeech: string | null;
  example: string | null;
  synonyms: string[];
  translation: string | null;
  found: boolean;
}

interface Position {
  x: number;
  y: number;
}

export function DictionaryPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lookupWord = useCallback(async (word: string) => {
    if (!word || word.length < 2) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/dictionary?word=${encodeURIComponent(word)}&translate=true`
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Dictionary lookup failed:', error);
      setResult({ word, found: false } as DictionaryResult);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();

    // Only handle single words (no spaces) or short phrases
    if (!text || text.length < 2 || text.length > 50) return;

    // Check if it's mostly a single word (allow hyphenated words)
    const wordPattern = /^[a-zA-Z'-]+$/;
    if (!wordPattern.test(text)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position popup above the selection
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;

    setPosition({ x, y });
    setSelectedWord(text);
    setIsOpen(true);
    lookupWord(text);
  }, [lookupWord]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSelection, handleClickOutside, handleKeyDown]);

  const playAudio = () => {
    if (result?.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(result.audioUrl);
      audioRef.current.play().catch(() => {});
    }
  };

  if (!isOpen) return null;

  // Calculate popup position (ensure it stays on screen)
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.max(16, Math.min(position.x - 160, window.innerWidth - 336)),
    top: Math.max(16, position.y - 200),
    zIndex: 9999,
  };

  return (
    <div
      ref={popupRef}
      style={popupStyle}
      className="w-80 glass-cosmic rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 capitalize">{selectedWord}</h3>
            {result?.phonetic && (
              <p className="text-xs text-slate-500">{result.phonetic}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {result?.audioUrl && (
            <button
              onClick={playAudio}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-purple-400 transition-colors"
              title="Prononcer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : result?.found ? (
          <>
            {/* Part of Speech */}
            {result.partOfSpeech && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {result.partOfSpeech}
              </span>
            )}

            {/* Definition */}
            {result.definition && (
              <div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.definition}
                </p>
              </div>
            )}

            {/* Example */}
            {result.example && (
              <div className="pl-3 border-l-2 border-purple-500/30">
                <p className="text-xs text-slate-500 italic">
                  "{result.example}"
                </p>
              </div>
            )}

            {/* Translation */}
            {result.translation && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Languages className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-xs text-cyan-400/70">Traduction FR</p>
                  <p className="text-sm text-cyan-300 font-medium">{result.translation}</p>
                </div>
              </div>
            )}

            {/* Synonyms */}
            {result.synonyms && result.synonyms.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Synonymes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.synonyms.map((syn, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-slate-400 border border-white/10"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">
              Aucune definition trouvee pour "{selectedWord}"
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-[10px] text-slate-600 text-center">
          Selectionnez un mot pour voir sa definition
        </p>
      </div>
    </div>
  );
}
