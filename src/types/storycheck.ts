// ============================================
// STORYCHECK DEMOCRACY - TYPE DEFINITIONS
// ============================================

// LLM Provider Types
export type LLMProvider = 'claude' | 'openai' | 'gemini'

export type ClaudeModel =
  | 'claude-sonnet-4-5'
  | 'claude-haiku-4-5'
  | 'claude-opus-4'

export type OpenAIModel =
  | 'gpt-5'
  | 'gpt-5-mini'
  | 'gpt-5-turbo'

export type GeminiModel =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'

export type LLMModel = ClaudeModel | OpenAIModel | GeminiModel

export interface LLMConfig {
  provider: LLMProvider
  model: LLMModel
  apiKey: string
}

// API Keys Management
export interface APIKeys {
  claude?: string
  openai?: string
  gemini?: string
}

// Target Audience Types
export type TargetAudience =
  | 'spender'           // Spender*innen
  | 'politik'           // Politik/Entscheider*innen
  | 'community'         // Community/Mitglieder
  | 'medien'            // Medien
  | 'oeffentlichkeit'   // Allgemeine Öffentlichkeit
  | 'custom'            // Benutzerdefiniert

// Organization Settings
export interface OrganizationSettings {
  name?: string
  values: string[]      // z.B. ["Nähe", "Solidarität", "Vielfalt"]
  description?: string  // Für corporate identity
}

// Check Status
export type CheckStatus = 'gut' | 'verbesserungswürdig' | 'problematisch'

// Individual Check Result
export interface CheckResult {
  checkId: number                    // 1-14
  checkName: string                  // Name des Checks
  score: number                      // 0-100
  status: CheckStatus                // gut/verbesserungswürdig/problematisch
  analysis: string                   // Begründung der Bewertung
  problems: string[]                 // Liste erkannter Probleme
  suggestions: string[]              // Konkrete Verbesserungsvorschläge
  alternativeFormulation?: string    // Optional: Bessere Formulierung
  details?: Record<string, any>      // Check-spezifische Details
}

// Complete Analysis Result
export interface AnalysisResult {
  overallScore: number               // 0-100 (gewichtet)
  overallStatus: CheckStatus
  summary: string                    // Zusammenfassung
  checks: CheckResult[]              // Einzelne Check-Ergebnisse
  timestamp: Date
  inputText: string
  inputImage?: string                // Base64 oder URL
}

// Analysis Input
export interface AnalysisInput {
  text: string
  image?: File | string
  targetAudience: TargetAudience
  organizationSettings?: OrganizationSettings
  selectedChecks: number[]           // Array of check IDs to run (1-14)
  analysisMode: 'quick' | 'deep'     // Quick = checks 1-6, Deep = all 14
}

// Image Analysis Result (for Check 8 + Vision)
export interface ImageAnalysis {
  personsCount: number
  diversity: {
    gender: string[]
    ageGroups: string[]
    ethnicity: string[]
  }
  poses: string[]                    // aktiv, passiv, dominant, gleichberechtigt
  setting: string                    // Büro, Natur, Stadt, etc.
  mood: string                       // fröhlich, ernst, hoffnungsvoll
  stereotypes: string[]              // Erkannte Stereotype
  accessibility: {
    altTextSuggestion: string
    contrast: string
    textReadability: string
  }
}

// Settings Store State
export interface SettingsState {
  // LLM Settings
  apiKeys: APIKeys
  selectedProvider: LLMProvider
  selectedModel: LLMModel

  // Analysis Settings
  targetAudience: TargetAudience
  customTargetAudience?: string
  organizationSettings: OrganizationSettings

  // Check Selection
  selectedChecks: number[]           // Which checks to run

  // UI Preferences
  theme: 'light' | 'dark'

  // Actions
  setAPIKey: (provider: LLMProvider, apiKey: string) => void
  setProvider: (provider: LLMProvider, model: LLMModel) => void
  setTargetAudience: (audience: TargetAudience) => void
  setOrganizationSettings: (settings: OrganizationSettings) => void
  setSelectedChecks: (checks: number[]) => void
  resetSettings: () => void
}

// App State
export interface AppState {
  // Current Analysis
  currentInput: {
    text: string
    image?: File
  }
  isAnalyzing: boolean
  currentResult?: AnalysisResult
  error?: string

  // History
  analysisHistory: AnalysisResult[]

  // Actions
  setInput: (text: string, image?: File) => void
  startAnalysis: () => Promise<void>
  clearResult: () => void
  saveToHistory: (result: AnalysisResult) => void
}

// Check Definitions (for reference and UI display)
export interface CheckDefinition {
  id: number
  name: string
  shortName: string
  description: string
  category: 'basic' | 'advanced'      // basic = 1-6, advanced = 7-14
  weight: number                      // Weight for overall score calculation
  icon: string                        // Lucide icon name
}

// All 14 Check Definitions
export const CHECK_DEFINITIONS: CheckDefinition[] = [
  {
    id: 1,
    name: 'Wertekongruenz',
    shortName: 'Werte',
    description: 'Passt die Sprache zu den Werten der Organisation?',
    category: 'basic',
    weight: 1.2,
    icon: 'Heart'
  },
  {
    id: 2,
    name: 'Zielgruppenpassung',
    shortName: 'Zielgruppe',
    description: 'Passt die Sprache zur avisierten Zielgruppe?',
    category: 'basic',
    weight: 1.0,
    icon: 'Users'
  },
  {
    id: 3,
    name: 'Geschichten-Qualität',
    shortName: 'Geschichte',
    description: 'Enthält der Post eine authentische Geschichte?',
    category: 'basic',
    weight: 1.1,
    icon: 'BookOpen'
  },
  {
    id: 4,
    name: 'Narrative Struktur (ATE)',
    shortName: 'ATE-Schema',
    description: 'Folgt der Post dem ATE-Schema (Ausgangszustand → Transformation → Endzustand)?',
    category: 'basic',
    weight: 1.1,
    icon: 'GitBranch'
  },
  {
    id: 5,
    name: 'Botschaft-Klarheit',
    shortName: 'Botschaft',
    description: 'Ist die Kern-Botschaft klar erkennbar?',
    category: 'basic',
    weight: 1.0,
    icon: 'MessageCircle'
  },
  {
    id: 6,
    name: 'Akteur-Analyse',
    shortName: 'Akteure',
    description: 'Wer kommt vor und in welcher Rolle?',
    category: 'basic',
    weight: 1.3,
    icon: 'UserCheck'
  },
  {
    id: 7,
    name: 'Marginalisierte Gruppen',
    shortName: 'Marginalisiert',
    description: 'Kommen unterrepräsentierte Gruppen vor und bekommen sie eine Stimme?',
    category: 'advanced',
    weight: 1.4,
    icon: 'Shield'
  },
  {
    id: 8,
    name: 'Diversitäts-Check',
    shortName: 'Diversität',
    description: 'Ist Vielfalt in verschiedenen Dimensionen abgebildet?',
    category: 'advanced',
    weight: 1.3,
    icon: 'Palette'
  },
  {
    id: 9,
    name: 'Komplexität der Menschen',
    shortName: 'Komplexität',
    description: 'Werden Menschen als Individuen oder nur als Gruppenmitglieder dargestellt?',
    category: 'advanced',
    weight: 1.2,
    icon: 'User'
  },
  {
    id: 10,
    name: 'Handlungs-Balance',
    shortName: 'Handlung',
    description: 'Wer macht was? Balance zwischen aktiv und passiv.',
    category: 'advanced',
    weight: 1.1,
    icon: 'Activity'
  },
  {
    id: 11,
    name: 'Normen und Werte',
    shortName: 'Normen',
    description: 'Was wird als "normal" gesetzt?',
    category: 'advanced',
    weight: 1.0,
    icon: 'Scale'
  },
  {
    id: 12,
    name: 'Inklusiver Sprachgebrauch',
    shortName: 'Sprache',
    description: 'Diskriminierungsfreie und inklusive Sprache?',
    category: 'advanced',
    weight: 1.5,
    icon: 'Languages'
  },
  {
    id: 13,
    name: 'Kontroversen-Umgang',
    shortName: 'Kontroversen',
    description: 'Wie wird mit kontroversen Themen umgegangen?',
    category: 'advanced',
    weight: 0.9,
    icon: 'AlertTriangle'
  },
  {
    id: 14,
    name: 'Partizipations-Möglichkeiten',
    shortName: 'Partizipation',
    description: 'Lädt der Post zur Beteiligung ein?',
    category: 'advanced',
    weight: 0.8,
    icon: 'MessageSquare'
  }
]

// Character limits for different platforms (for UI display)
export const PLATFORM_LIMITS = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
  threads: 500
}

// Toast Notification Type
export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}
