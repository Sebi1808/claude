// ============================================
// SETTINGS STORE - Zustand State Management
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  APIKeys,
  LLMProvider,
  LLMModel,
  TargetAudience,
  OrganizationSettings
} from '@/types/storycheck'

interface SettingsStore {
  // LLM Settings
  apiKeys: APIKeys
  selectedProvider: LLMProvider
  selectedModel: LLMModel

  // Analysis Settings
  targetAudience: TargetAudience
  customTargetAudience: string
  organizationSettings: OrganizationSettings

  // Check Selection
  selectedChecks: number[] // 1-14
  analysisMode: 'quick' | 'deep'

  // UI State
  showWelcome: boolean

  // Actions
  setAPIKey: (provider: LLMProvider, apiKey: string) => void
  getAPIKey: (provider: LLMProvider) => string | undefined
  clearAPIKey: (provider: LLMProvider) => void

  setProvider: (provider: LLMProvider) => void
  setModel: (model: LLMModel) => void

  setTargetAudience: (audience: TargetAudience) => void
  setCustomTargetAudience: (value: string) => void

  setOrganizationSettings: (settings: Partial<OrganizationSettings>) => void

  setSelectedChecks: (checks: number[]) => void
  setAnalysisMode: (mode: 'quick' | 'deep') => void

  setShowWelcome: (show: boolean) => void

  resetSettings: () => void
}

const defaultOrganizationSettings: OrganizationSettings = {
  name: '',
  values: [],
  description: ''
}

// Default model for each provider
const defaultModels: Record<LLMProvider, LLMModel> = {
  claude: 'claude-sonnet-4-5',
  openai: 'gpt-5',
  gemini: 'gemini-2.5-pro'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial State
      apiKeys: {},
      selectedProvider: 'claude',
      selectedModel: 'claude-sonnet-4-5',

      targetAudience: 'oeffentlichkeit',
      customTargetAudience: '',
      organizationSettings: defaultOrganizationSettings,

      selectedChecks: [1, 2, 3, 4, 5, 6], // Default: Basic checks
      analysisMode: 'quick',

      showWelcome: true,

      // API Key Actions
      setAPIKey: (provider, apiKey) =>
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: apiKey
          }
        })),

      getAPIKey: (provider) => get().apiKeys[provider],

      clearAPIKey: (provider) =>
        set((state) => {
          const newKeys = { ...state.apiKeys }
          delete newKeys[provider]
          return { apiKeys: newKeys }
        }),

      // Provider & Model Actions
      setProvider: (provider) =>
        set({
          selectedProvider: provider,
          selectedModel: defaultModels[provider]
        }),

      setModel: (model) =>
        set({ selectedModel: model }),

      // Target Audience Actions
      setTargetAudience: (audience) =>
        set({ targetAudience: audience }),

      setCustomTargetAudience: (value) =>
        set({ customTargetAudience: value }),

      // Organization Settings Actions
      setOrganizationSettings: (settings) =>
        set((state) => ({
          organizationSettings: {
            ...state.organizationSettings,
            ...settings
          }
        })),

      // Check Selection Actions
      setSelectedChecks: (checks) =>
        set({ selectedChecks: checks }),

      setAnalysisMode: (mode) =>
        set({
          analysisMode: mode,
          selectedChecks: mode === 'quick'
            ? [1, 2, 3, 4, 5, 6]
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        }),

      // UI Actions
      setShowWelcome: (show) =>
        set({ showWelcome: show }),

      // Reset
      resetSettings: () =>
        set({
          apiKeys: {},
          selectedProvider: 'claude',
          selectedModel: 'claude-sonnet-4-5',
          targetAudience: 'oeffentlichkeit',
          customTargetAudience: '',
          organizationSettings: defaultOrganizationSettings,
          selectedChecks: [1, 2, 3, 4, 5, 6],
          analysisMode: 'quick',
          showWelcome: true
        })
    }),
    {
      name: 'storycheck-settings', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        apiKeys: state.apiKeys,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        targetAudience: state.targetAudience,
        customTargetAudience: state.customTargetAudience,
        organizationSettings: state.organizationSettings,
        selectedChecks: state.selectedChecks,
        analysisMode: state.analysisMode,
        showWelcome: state.showWelcome
      })
    }
  )
)

// Utility functions

/**
 * Get the human-readable name for a provider
 */
export function getProviderName(provider: LLMProvider): string {
  const names: Record<LLMProvider, string> = {
    claude: 'Anthropic Claude',
    openai: 'OpenAI',
    gemini: 'Google Gemini'
  }
  return names[provider]
}

/**
 * Get the human-readable name for a model
 */
export function getModelName(model: LLMModel): string {
  const names: Record<string, string> = {
    'claude-sonnet-4-5': 'Claude Sonnet 4.5',
    'claude-haiku-4-5': 'Claude Haiku 4.5',
    'claude-opus-4': 'Claude Opus 4',
    'gpt-5': 'GPT-5',
    'gpt-5-mini': 'GPT-5 Mini',
    'gpt-5-turbo': 'GPT-5 Turbo',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.5-flash': 'Gemini 2.5 Flash'
  }
  return names[model] || model
}

/**
 * Get available models for a provider
 */
export function getModelsForProvider(provider: LLMProvider): LLMModel[] {
  const models: Record<LLMProvider, LLMModel[]> = {
    claude: [
      'claude-sonnet-4-5',
      'claude-haiku-4-5',
      'claude-opus-4'
    ],
    openai: [
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-turbo'
    ],
    gemini: [
      'gemini-2.5-pro',
      'gemini-2.5-flash'
    ]
  }
  return models[provider]
}

/**
 * Get the human-readable name for target audience
 */
export function getTargetAudienceName(audience: TargetAudience): string {
  const names: Record<TargetAudience, string> = {
    spender: 'Spender*innen',
    politik: 'Politik/Entscheider*innen',
    community: 'Community/Mitglieder',
    medien: 'Medien',
    oeffentlichkeit: 'Allgemeine Öffentlichkeit',
    custom: 'Benutzerdefiniert'
  }
  return names[audience]
}

/**
 * Check if user has configured at least one API key
 */
export function hasAnyAPIKey(): boolean {
  const { apiKeys } = useSettingsStore.getState()
  return Object.values(apiKeys).some(key => key && key.length > 0)
}

/**
 * Check if current provider has API key configured
 */
export function hasCurrentProviderAPIKey(): boolean {
  const { selectedProvider, apiKeys } = useSettingsStore.getState()
  const key = apiKeys[selectedProvider]
  return !!(key && key.length > 0)
}

/**
 * Get current API key for selected provider
 */
export function getCurrentAPIKey(): string | undefined {
  const { selectedProvider, apiKeys } = useSettingsStore.getState()
  return apiKeys[selectedProvider]
}
