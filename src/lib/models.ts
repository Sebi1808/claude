// ============================================
// UPDATED LLM MODEL DEFINITIONS (2025)
// With GPT-5 and Gemini 2.5
// ============================================

import type { LLMProvider, LLMModel } from '@/types/storycheck'

export interface ModelInfo {
  display_name: string
  api_name: string
  snapshot?: string

  // Capabilities
  vision: boolean
  extended_thinking?: boolean
  context_awareness?: boolean
  reasoning?: boolean

  // Limits
  context_window: number
  context_window_max?: number
  output_tokens: number

  // Pricing (EUR per 1M tokens) - only for managed service
  price_input_managed?: number
  price_output_managed?: number

  // Estimated pricing for BYOK (user's own API keys)
  price_input_byok: number
  price_output_byok: number

  // Performance
  speed: 'very_fast' | 'fast' | 'medium' | 'slow'
  quality: 'good' | 'high' | 'highest' | 'top_tier'

  // Description
  description: string
  recommended_for: string[]
}

// ============================================
// ANTHROPIC CLAUDE MODELS
// ============================================

export const CLAUDE_MODELS: Record<string, ModelInfo> = {
  'claude-sonnet-4-5': {
    display_name: 'Claude Sonnet 4.5',
    api_name: 'claude-sonnet-4-5',
    snapshot: 'claude-sonnet-4-5-20250929',

    vision: true,
    extended_thinking: true,
    context_awareness: true,

    context_window: 200000,
    context_window_max: 1000000,
    output_tokens: 64000,

    price_input_byok: 3.00,
    price_output_byok: 15.00,

    speed: 'medium',
    quality: 'highest',

    description: 'Bestes Modell für komplexe Analysen. Höchste Qualität für alle 14 Checks.',
    recommended_for: ['deep_analysis', 'all_checks', 'vision_tasks']
  },

  'claude-haiku-4-5': {
    display_name: 'Claude Haiku 4.5',
    api_name: 'claude-haiku-4-5',
    snapshot: 'claude-haiku-4-5-20251001',

    vision: true,
    extended_thinking: true,
    context_awareness: true,

    context_window: 200000,
    output_tokens: 64000,

    price_input_byok: 1.00,
    price_output_byok: 5.00,

    speed: 'very_fast',
    quality: 'high',

    description: 'Schnell und kosteneffizient. Ideal für Quick Checks (1-6).',
    recommended_for: ['quick_checks', 'high_volume', 'real_time']
  },

  'claude-opus-4-1': {
    display_name: 'Claude Opus 4.1',
    api_name: 'claude-opus-4-1',

    vision: true,
    extended_thinking: true,
    context_awareness: true,

    context_window: 200000,
    output_tokens: 32000,

    price_input_byok: 15.00,
    price_output_byok: 75.00,

    speed: 'slow',
    quality: 'top_tier',

    description: 'Premium-Modell für höchste Anforderungen und kritische Analysen.',
    recommended_for: ['critical_reviews', 'final_checks', 'premium_quality']
  }
}

// ============================================
// OPENAI GPT-5 MODELS
// ============================================

export const OPENAI_MODELS: Record<string, ModelInfo> = {
  'gpt-5': {
    display_name: 'GPT-5',
    api_name: 'gpt-5',

    vision: true,
    reasoning: true,

    context_window: 256000,
    output_tokens: 32768,

    price_input_byok: 5.00,
    price_output_byok: 20.00,

    speed: 'medium',
    quality: 'highest',

    description: 'Neuestes OpenAI-Flaggschiff mit verbessertem Reasoning.',
    recommended_for: ['deep_analysis', 'complex_reasoning', 'vision_analysis']
  },

  'gpt-5-mini': {
    display_name: 'GPT-5 Mini',
    api_name: 'gpt-5-mini',

    vision: true,

    context_window: 256000,
    output_tokens: 32768,

    price_input_byok: 0.50,
    price_output_byok: 2.00,

    speed: 'fast',
    quality: 'high',

    description: 'Schnelle und günstige Variante für hohe Durchsätze.',
    recommended_for: ['quick_checks', 'high_volume', 'cost_effective']
  },

  'gpt-5-turbo': {
    display_name: 'GPT-5 Turbo',
    api_name: 'gpt-5-turbo',

    vision: true,

    context_window: 128000,
    output_tokens: 16384,

    price_input_byok: 2.50,
    price_output_byok: 10.00,

    speed: 'fast',
    quality: 'high',

    description: 'Ausgewogenes Preis-Leistungs-Verhältnis.',
    recommended_for: ['balanced_tasks', 'standard_analysis']
  }
}

// ============================================
// GOOGLE GEMINI 2.5 MODELS
// ============================================

export const GEMINI_MODELS: Record<string, ModelInfo> = {
  'gemini-2.5-pro': {
    display_name: 'Gemini 2.5 Pro',
    api_name: 'gemini-2.5-pro',

    vision: true,

    context_window: 2000000, // 2M tokens!
    output_tokens: 16384,

    price_input_byok: 1.50,
    price_output_byok: 6.00,

    speed: 'medium',
    quality: 'highest',

    description: 'Riesiger Context-Window für sehr lange Dokumente.',
    recommended_for: ['long_documents', 'comprehensive_analysis']
  },

  'gemini-2.5-flash': {
    display_name: 'Gemini 2.5 Flash',
    api_name: 'gemini-2.5-flash',

    vision: true,

    context_window: 1000000, // 1M tokens
    output_tokens: 16384,

    price_input_byok: 0.10,
    price_output_byok: 0.40,

    speed: 'very_fast',
    quality: 'high',

    description: 'Extrem schnell und günstig mit großem Context.',
    recommended_for: ['high_volume', 'budget_conscious', 'fast_checks']
  }
}

// ============================================
// ALL MODELS COMBINED
// ============================================

export const ALL_MODELS = {
  claude: CLAUDE_MODELS,
  openai: OPENAI_MODELS,
  gemini: GEMINI_MODELS
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get model info for a specific provider and model
 */
export function getModelInfo(provider: LLMProvider, model: LLMModel): ModelInfo | undefined {
  const providerModels = ALL_MODELS[provider]
  return providerModels?.[model]
}

/**
 * Get all available models for a provider
 */
export function getModelsForProvider(provider: LLMProvider): ModelInfo[] {
  const providerModels = ALL_MODELS[provider]
  return Object.values(providerModels || {})
}

/**
 * Calculate estimated cost for an analysis
 * @param provider LLM provider
 * @param model Model name
 * @param inputTokens Estimated input tokens
 * @param outputTokens Estimated output tokens
 * @param isByok true if user uses their own API key
 */
export function calculateAnalysisCost(
  provider: LLMProvider,
  model: LLMModel,
  inputTokens: number,
  outputTokens: number,
  isByok: boolean = true
): number {
  const modelInfo = getModelInfo(provider, model)
  if (!modelInfo) return 0

  const priceInput = isByok ? modelInfo.price_input_byok : (modelInfo.price_input_managed || modelInfo.price_input_byok)
  const priceOutput = isByok ? modelInfo.price_output_byok : (modelInfo.price_output_managed || modelInfo.price_output_byok)

  const inputCost = (inputTokens / 1000000) * priceInput
  const outputCost = (outputTokens / 1000000) * priceOutput

  return inputCost + outputCost
}

/**
 * Estimate tokens for a text (rough approximation)
 * 1 token ≈ 4 characters for English, ≈ 2-3 for German
 */
export function estimateTokens(text: string): number {
  // German text: roughly 1 token per 2.5 characters
  return Math.ceil(text.length / 2.5)
}

/**
 * Get recommended model for a specific use case
 */
export function getRecommendedModel(
  provider: LLMProvider,
  useCase: 'quick' | 'deep' | 'vision' | 'budget'
): LLMModel | undefined {
  switch (provider) {
    case 'claude':
      if (useCase === 'quick' || useCase === 'budget') return 'claude-haiku-4-5'
      if (useCase === 'vision') return 'claude-sonnet-4-5'
      return 'claude-sonnet-4-5'

    case 'openai':
      if (useCase === 'quick' || useCase === 'budget') return 'gpt-5-mini'
      return 'gpt-5'

    case 'gemini':
      if (useCase === 'quick' || useCase === 'budget') return 'gemini-2.5-flash'
      return 'gemini-2.5-pro'

    default:
      return undefined
  }
}

/**
 * Format price for display
 */
export function formatPrice(euros: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(euros)
}
