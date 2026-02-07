'use client';

import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Keyboard, X } from 'lucide-react';

export function KeyboardShortcuts() {
  const { showHelp, setShowHelp, shortcuts, isQuizPage } = useGlobalShortcuts();

  if (isQuizPage || !showHelp) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-[#1a1625]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Raccourcis clavier</h2>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">Navigation (G + ...)</p>
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/3"
            >
              <span className="text-sm text-white/70">{shortcut.label}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.split(' ').map((key, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-white/20 text-xs mx-0.5">then</span>}
                    <kbd className="px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-xs font-mono text-white/80 uppercase">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center justify-between py-1.5 px-2">
            <span className="text-sm text-white/70">Afficher/masquer l&apos;aide</span>
            <kbd className="px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-xs font-mono text-white/80">
              ?
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
