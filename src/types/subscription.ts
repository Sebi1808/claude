// ============================================
// SUBSCRIPTION & USER MANAGEMENT TYPES
// ============================================

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise'

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'inactive'

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

// ============================================
// TIER LIMITS & FEATURES
// ============================================

export interface TierLimits {
  analyses_per_month: number | null // null = unlimited
  checks_available: number[] | 'all' // array of check IDs or 'all'
  vision_analysis: boolean
  history_days: number | null // null = unlimited
  export_formats: Array<'pdf' | 'docx' | 'json' | 'csv'>
  org_profile: boolean
  document_upload_mb: number
  document_uploads_max: number | null
  team_members: number
  api_access: boolean
  api_requests_per_month: number | null
  priority_support: boolean
  custom_checks: boolean
  sso: boolean
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    analyses_per_month: 10,
    checks_available: [1, 2, 3, 4, 5, 6], // Only basic checks
    vision_analysis: false,
    history_days: 7,
    export_formats: [],
    org_profile: false,
    document_upload_mb: 0,
    document_uploads_max: 0,
    team_members: 1,
    api_access: false,
    api_requests_per_month: 0,
    priority_support: false,
    custom_checks: false,
    sso: false
  },

  starter: {
    analyses_per_month: 100,
    checks_available: 'all',
    vision_analysis: true,
    history_days: null, // unlimited
    export_formats: ['pdf'],
    org_profile: false,
    document_upload_mb: 0,
    document_uploads_max: 0,
    team_members: 1,
    api_access: false,
    api_requests_per_month: 0,
    priority_support: false,
    custom_checks: false,
    sso: false
  },

  professional: {
    analyses_per_month: 500,
    checks_available: 'all',
    vision_analysis: true,
    history_days: null,
    export_formats: ['pdf', 'docx', 'json'],
    org_profile: true,
    document_upload_mb: 50,
    document_uploads_max: 10,
    team_members: 1,
    api_access: true,
    api_requests_per_month: 1000,
    priority_support: false,
    custom_checks: false,
    sso: false
  },

  enterprise: {
    analyses_per_month: null, // unlimited
    checks_available: 'all',
    vision_analysis: true,
    history_days: null,
    export_formats: ['pdf', 'docx', 'json', 'csv'],
    org_profile: true,
    document_upload_mb: 100,
    document_uploads_max: null,
    team_members: 50,
    api_access: true,
    api_requests_per_month: null,
    priority_support: true,
    custom_checks: true,
    sso: true
  }
}

// ============================================
// PRICING
// ============================================

export interface PricingPlan {
  tier: SubscriptionTier
  name: string
  description: string
  price_monthly: number // EUR
  price_yearly: number // EUR
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  features: string[]
  popular?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Für Einsteiger und zum Ausprobieren',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      '10 Analysen pro Monat',
      'Basis-Checks (6 von 14)',
      'Text-Analyse',
      'Historie (7 Tage)'
    ]
  },
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Für regelmäßige Social Media Redakteure',
    price_monthly: 19,
    price_yearly: 190, // 2 months free
    stripe_price_id_monthly: 'price_starter_monthly',
    stripe_price_id_yearly: 'price_starter_yearly',
    features: [
      '100 Analysen pro Monat',
      'Alle 14 Checks',
      'Text & Bild-Analyse',
      'Unbegrenzte Historie',
      'PDF-Export'
    ],
    popular: true
  },
  {
    tier: 'professional',
    name: 'Professional',
    description: 'Für professionelle Kommunikationsteams',
    price_monthly: 49,
    price_yearly: 490,
    stripe_price_id_monthly: 'price_professional_monthly',
    stripe_price_id_yearly: 'price_professional_yearly',
    features: [
      '500 Analysen pro Monat',
      'Alle Features aus Starter',
      'Organisations-Profil',
      'Dokumenten-Upload (10 Dokumente)',
      'PDF, Word & JSON Export',
      'API-Zugang'
    ]
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Für große Organisationen und Teams',
    price_monthly: 199,
    price_yearly: 1990,
    stripe_price_id_monthly: 'price_enterprise_monthly',
    stripe_price_id_yearly: 'price_enterprise_yearly',
    features: [
      'Unbegrenzte Analysen',
      'Alle Features aus Professional',
      'Team-Management (bis 50 Mitglieder)',
      'Unbegrenzte Dokumente',
      'Priority Support',
      'Custom Checks',
      'SSO Integration'
    ]
  }
]

// ============================================
// USER & ORGANIZATION
// ============================================

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: Date
  updated_at: Date

  // Subscription
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  subscription_ends_at?: Date
  stripe_customer_id?: string

  // Preferences
  default_llm_provider?: string
  default_llm_model?: string
  notification_settings?: Record<string, boolean>

  // Organization
  organization_id?: string
  role?: TeamRole
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: Date
  updated_at: Date

  // Profile
  values: string[]
  communication_style?: string
  target_audiences: string[]
  guidelines_summary?: string
  brand_voice?: Record<string, any>

  // Subscription
  subscription_tier: SubscriptionTier
  seat_count: number
  stripe_subscription_id?: string
}

// ============================================
// API KEYS (Encrypted)
// ============================================

export interface APIKey {
  id: string
  user_id?: string
  organization_id?: string

  provider: string // 'claude', 'openai', 'gemini'
  encrypted_key: string
  key_last_four: string // Only last 4 chars for display

  is_active: boolean
  created_at: Date
  last_used_at?: Date
}

// ============================================
// ANALYSIS HISTORY
// ============================================

export interface SavedAnalysis {
  id: string
  user_id: string
  organization_id?: string

  // Input
  input_text: string
  input_image_url?: string
  target_audience: string

  // LLM Used
  llm_provider: string
  llm_model: string

  // Results
  overall_score: number
  checks_results: Record<string, any>

  // Metadata
  duration_seconds: number
  tokens_used?: number
  cost_usd?: number

  created_at: Date

  // User annotations
  user_notes?: string
  is_favorite: boolean
  tags: string[]
}

// ============================================
// ORGANIZATION DOCUMENTS
// ============================================

export interface OrganizationDocument {
  id: string
  organization_id: string
  uploaded_by: string

  // File Info
  file_name: string
  file_type: 'pdf' | 'docx' | 'txt'
  file_size_bytes: number
  storage_url: string

  // Processing
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  extracted_text?: string
  analysis_results?: {
    tonality: string[]
    core_values: string[]
    target_audiences: string[]
    key_messages: string[]
    dos: string[]
    donts: string[]
    preferred_terms: Record<string, string>
    forbidden_terms: string[]
  }

  created_at: Date
  processed_at?: Date
}

// ============================================
// USAGE TRACKING
// ============================================

export interface UsageStats {
  user_id: string
  organization_id?: string
  period: string // 'YYYY-MM'

  analyses_count: number
  tokens_used: number
  cost_total: number

  // Breakdown
  by_provider: Record<string, {
    count: number
    tokens: number
    cost: number
  }>

  by_model: Record<string, {
    count: number
    tokens: number
    cost: number
  }>

  updated_at: Date
}

// ============================================
// TEAM PERMISSIONS
// ============================================

export const ROLE_PERMISSIONS: Record<TeamRole, string[]> = {
  owner: [
    'manage_team',
    'manage_subscription',
    'manage_organization',
    'manage_api_keys',
    'delete_organization',
    'view_all_analyses',
    'create_analyses',
    'export_data',
    'manage_documents'
  ],

  admin: [
    'manage_team',
    'manage_organization',
    'view_all_analyses',
    'create_analyses',
    'export_data',
    'manage_documents'
  ],

  member: [
    'view_own_analyses',
    'view_team_analyses',
    'create_analyses'
  ],

  viewer: [
    'view_team_analyses'
  ]
}

export function hasPermission(role: TeamRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user can perform action based on tier limits
 */
export function canPerformAction(
  tier: SubscriptionTier,
  action: keyof TierLimits,
  currentUsage?: number
): boolean {
  const limits = TIER_LIMITS[tier]
  const limit = limits[action]

  // Boolean checks
  if (typeof limit === 'boolean') {
    return limit
  }

  // Number checks with usage
  if (typeof limit === 'number' && currentUsage !== undefined) {
    return currentUsage < limit
  }

  // null means unlimited
  if (limit === null) {
    return true
  }

  return false
}

/**
 * Get remaining analyses for current period
 */
export function getRemainingAnalyses(
  tier: SubscriptionTier,
  usedThisMonth: number
): number | null {
  const limit = TIER_LIMITS[tier].analyses_per_month
  if (limit === null) return null // unlimited
  return Math.max(0, limit - usedThisMonth)
}

/**
 * Calculate tier progress percentage
 */
export function calculateTierProgress(
  tier: SubscriptionTier,
  usedThisMonth: number
): number {
  const limit = TIER_LIMITS[tier].analyses_per_month
  if (limit === null) return 0 // unlimited, no progress bar
  return Math.min(100, (usedThisMonth / limit) * 100)
}
