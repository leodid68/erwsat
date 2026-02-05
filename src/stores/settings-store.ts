'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Supported AI providers
export type AIProvider = 'anthropic' | 'openai' | 'mistral' | 'grok' | 'deepseek' | 'qwen' | 'groq';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  keyPrefix: string;
  keyPlaceholder: string;
  consoleUrl: string;
  models: { id: string; name: string; description: string }[];
  inputPrice: string; // per M tokens
  outputPrice: string; // per M tokens
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Claude Sonnet 4 - Meilleure qualité pour SAT',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-api03-...',
    consoleUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Recommandé - Excellent pour SAT' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Plus rapide, moins cher' },
    ],
    inputPrice: '$3',
    outputPrice: '$15',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    description: 'GPT-4o et GPT-4o-mini',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    consoleUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Modèle phare OpenAI' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Plus rapide, moins cher' },
    ],
    inputPrice: '$2.50',
    outputPrice: '$10',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large et Medium - IA française',
    keyPrefix: '',
    keyPlaceholder: 'votre-clé-mistral...',
    consoleUrl: 'https://console.mistral.ai/api-keys',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Plus puissant' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Bon équilibre' },
    ],
    inputPrice: '$2',
    outputPrice: '$6',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek V3 - Très économique',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    consoleUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', description: 'Excellent rapport qualité/prix' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: 'Raisonnement avancé' },
    ],
    inputPrice: '$0.14',
    outputPrice: '$0.28',
  },
  {
    id: 'groq',
    name: 'Groq (Meta Llama)',
    description: 'Llama 3.3 70B de Meta - Ultra rapide',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    consoleUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Meta - Rapide et performant' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Meta - Très rapide' },
    ],
    inputPrice: '$0.59',
    outputPrice: '$0.79',
  },
  {
    id: 'grok',
    name: 'xAI (Grok)',
    description: 'Grok 2 - IA de X/Twitter',
    keyPrefix: 'xai-',
    keyPlaceholder: 'xai-...',
    consoleUrl: 'https://console.x.ai/',
    models: [
      { id: 'grok-2-latest', name: 'Grok 2', description: 'Dernier modèle xAI' },
    ],
    inputPrice: '$2',
    outputPrice: '$10',
  },
  {
    id: 'qwen',
    name: 'Alibaba (Qwen)',
    description: 'Qwen 2.5 - Via Dashscope',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    consoleUrl: 'https://dashscope.console.aliyun.com/apiKey',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', description: 'Plus puissant' },
      { id: 'qwen-plus', name: 'Qwen Plus', description: 'Bon équilibre' },
    ],
    inputPrice: '$0.40',
    outputPrice: '$1.20',
  },
];

interface SettingsState {
  // API Keys for each provider
  apiKeys: Record<AIProvider, string | null>;

  // Selected provider for generation
  selectedProvider: AIProvider;
  selectedModel: string;

  // Guardian API key (separate, for text sources)
  guardianApiKey: string | null;

  // Actions
  setApiKey: (provider: AIProvider, key: string | null) => void;
  setSelectedProvider: (provider: AIProvider) => void;
  setSelectedModel: (model: string) => void;
  setGuardianApiKey: (key: string | null) => void;
  clearAllKeys: () => void;

  // Helpers
  isProviderConfigured: (provider: AIProvider) => boolean;
  getActiveApiKey: () => string | null;
  getActiveProvider: () => AIProviderConfig;

  // Legacy compatibility
  anthropicApiKey: string | null;
  setAnthropicApiKey: (key: string | null) => void;
  isAnthropicConfigured: () => boolean;
}

const initialApiKeys: Record<AIProvider, string | null> = {
  anthropic: null,
  openai: null,
  mistral: null,
  grok: null,
  deepseek: null,
  qwen: null,
  groq: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKeys: { ...initialApiKeys },
      selectedProvider: 'anthropic',
      selectedModel: 'claude-sonnet-4-20250514',
      guardianApiKey: null,

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      setSelectedProvider: (provider) => {
        const providerConfig = AI_PROVIDERS.find((p) => p.id === provider);
        const defaultModel = providerConfig?.models[0]?.id || '';
        set({ selectedProvider: provider, selectedModel: defaultModel });
      },

      setSelectedModel: (model) => set({ selectedModel: model }),

      setGuardianApiKey: (key) => set({ guardianApiKey: key }),

      clearAllKeys: () =>
        set({
          apiKeys: { ...initialApiKeys },
          guardianApiKey: null,
        }),

      isProviderConfigured: (provider) => {
        const key = get().apiKeys[provider];
        if (!key) return false;
        const config = AI_PROVIDERS.find((p) => p.id === provider);
        if (!config || !config.keyPrefix) return key.length > 10;
        return key.startsWith(config.keyPrefix);
      },

      getActiveApiKey: () => {
        const { selectedProvider, apiKeys } = get();
        return apiKeys[selectedProvider];
      },

      getActiveProvider: () => {
        const { selectedProvider } = get();
        return AI_PROVIDERS.find((p) => p.id === selectedProvider) || AI_PROVIDERS[0];
      },

      // Legacy compatibility - maps to apiKeys.anthropic
      get anthropicApiKey() {
        return get().apiKeys.anthropic;
      },

      setAnthropicApiKey: (key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, anthropic: key },
        })),

      isAnthropicConfigured: () => {
        const key = get().apiKeys.anthropic;
        return !!key && key.startsWith('sk-ant-');
      },
    }),
    {
      name: 'sat-erw-settings',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1 || version === 0) {
          // Migrate from old format
          const oldState = persistedState as { anthropicApiKey?: string; guardianApiKey?: string };
          return {
            apiKeys: {
              ...initialApiKeys,
              anthropic: oldState.anthropicApiKey || null,
            },
            selectedProvider: 'anthropic',
            selectedModel: 'claude-sonnet-4-20250514',
            guardianApiKey: oldState.guardianApiKey || null,
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        guardianApiKey: state.guardianApiKey,
      }),
    }
  )
);

/**
 * Hook to get headers with API key for fetch requests
 */
export function useApiHeaders(): () => HeadersInit {
  const getActiveApiKey = useSettingsStore((state) => state.getActiveApiKey);
  const selectedProvider = useSettingsStore((state) => state.selectedProvider);

  return () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const apiKey = getActiveApiKey();
    if (apiKey) {
      // Use provider-specific header
      switch (selectedProvider) {
        case 'anthropic':
          headers['X-Anthropic-Key'] = apiKey;
          break;
        case 'openai':
          headers['X-OpenAI-Key'] = apiKey;
          break;
        case 'mistral':
          headers['X-Mistral-Key'] = apiKey;
          break;
        case 'deepseek':
          headers['X-DeepSeek-Key'] = apiKey;
          break;
        case 'groq':
          headers['X-Groq-Key'] = apiKey;
          break;
        case 'grok':
          headers['X-Grok-Key'] = apiKey;
          break;
        case 'qwen':
          headers['X-Qwen-Key'] = apiKey;
          break;
      }
      headers['X-AI-Provider'] = selectedProvider;
    }

    return headers;
  };
}
