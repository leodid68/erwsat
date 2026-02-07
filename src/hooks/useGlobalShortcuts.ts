'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Shortcut {
  keys: string;
  label: string;
  action: () => void;
}

export function useGlobalShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);
  const pendingKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Don't activate shortcuts on quiz pages (they have their own)
  const isQuizPage = pathname.startsWith('/quiz/') && pathname.split('/').length > 2;

  const shortcuts: Shortcut[] = [
    { keys: 'g h', label: 'Accueil', action: () => router.push('/') },
    { keys: 'g u', label: 'Importer', action: () => router.push('/upload') },
    { keys: 'g l', label: 'Bibliothèque', action: () => router.push('/library') },
    { keys: 'g g', label: 'Générer', action: () => router.push('/generate') },
    { keys: 'g q', label: 'Quiz', action: () => router.push('/quiz') },
    { keys: 'g s', label: 'Mode SAT', action: () => router.push('/sat-mode') },
    { keys: 'g p', label: 'Progrès', action: () => router.push('/progress') },
    { keys: 'g a', label: 'Analyse', action: () => router.push('/analytics') },
    { keys: 'g r', label: 'Révision', action: () => router.push('/review') },
    { keys: 'g t', label: 'Paramètres', action: () => router.push('/settings') },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isQuizPage) return;

    // Ignore if typing in an input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Toggle help
    if (e.key === '?') {
      e.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    // Escape closes help
    if (e.key === 'Escape' && showHelp) {
      setShowHelp(false);
      return;
    }

    const key = e.key.toLowerCase();

    // Chord system: first key "g" starts the chord
    if (pendingKeyRef.current === null) {
      if (key === 'g') {
        pendingKeyRef.current = 'g';
        // Auto-clear after 800ms
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          pendingKeyRef.current = null;
        }, 800);
        return;
      }
    } else {
      // Second key of the chord
      const chord = `${pendingKeyRef.current} ${key}`;
      pendingKeyRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const shortcut = shortcuts.find(s => s.keys === chord);
      if (shortcut) {
        e.preventDefault();
        setShowHelp(false);
        shortcut.action();
      }
    }
  }, [isQuizPage, showHelp, shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleKeyDown]);

  // Close help on navigation
  useEffect(() => {
    setShowHelp(false);
  }, [pathname]);

  return { showHelp, setShowHelp, shortcuts, isQuizPage };
}
