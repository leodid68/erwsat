'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  anthropicApiKey: string | null;
  guardianApiKey: string | null;
  setAnthropicApiKey: (key: string | null) => void;
  setGuardianApiKey: (key: string | null) => void;
  clearAllKeys: () => void;
  isAnthropicConfigured: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      anthropicApiKey: null,
      guardianApiKey: null,

      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setGuardianApiKey: (key) => set({ guardianApiKey: key }),

      clearAllKeys: () => set({ anthropicApiKey: null, guardianApiKey: null }),

      isAnthropicConfigured: () => {
        const key = get().anthropicApiKey;
        return !!key && key.startsWith('sk-ant-');
      },
    }),
    {
      name: 'sat-erw-settings',
      // Only persist API keys, nothing else
      partialize: (state) => ({
        anthropicApiKey: state.anthropicApiKey,
        guardianApiKey: state.guardianApiKey,
      }),
    }
  )
);

/**
 * Hook to get headers with API key for fetch requests
 */
export function useApiHeaders(): () => HeadersInit {
  const anthropicApiKey = useSettingsStore((state) => state.anthropicApiKey);

  return () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (anthropicApiKey) {
      headers['X-Anthropic-Key'] = anthropicApiKey;
    }

    return headers;
  };
}
