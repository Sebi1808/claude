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
  claude: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o',
  gemini: 'gemini-1.5-pro'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial State
      apiKeys: {},
      selectedProvider: 'claude',
      selectedModel: 'claude-3-5-sonnet-20241022',

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
          selectedModel: 'claude-3-5-sonnet-20241022',
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
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'claude-3-opus-4-20250514': 'Claude 3 Opus 4',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental)',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash'
  }
  return names[model] || model
}

/**
 * Get available models for a provider
 */
export function getModelsForProvider(provider: LLMProvider): LLMModel[] {
  const models: Record<LLMProvider, LLMModel[]> = {
    claude: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-4-20250514'
    ],
    openai: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo'
    ],
    gemini: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp'
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
