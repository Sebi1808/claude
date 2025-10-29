-- ============================================
-- STORYCHECK DEMOCRACY - DATABASE SCHEMA
-- Migration 001: Initial Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Organization Profile
  values TEXT[] DEFAULT '{}',
  communication_style TEXT,
  target_audiences TEXT[] DEFAULT '{}',
  guidelines_summary TEXT,
  brand_voice JSONB DEFAULT '{}',

  -- Subscription (Team Plans)
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  seat_count INTEGER DEFAULT 1,
  stripe_subscription_id VARCHAR(255),
  subscription_ends_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT organizations_tier_check CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  CONSTRAINT organizations_status_check CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing', 'inactive'))
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_subscription_id);

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Subscription Info (Personal Plans)
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),

  -- Preferences
  default_llm_provider VARCHAR(50) DEFAULT 'claude',
  default_llm_model VARCHAR(100),
  notification_settings JSONB DEFAULT '{}',

  -- Organization
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'member',

  -- Constraints
  CONSTRAINT users_tier_check CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  CONSTRAINT users_status_check CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing', 'inactive')),
  CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- ============================================
-- API KEYS TABLE (Encrypted)
-- ============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_last_four CHAR(4),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Either user_id OR organization_id must be set
  CONSTRAINT api_keys_owner_check CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  ),
  CONSTRAINT api_keys_provider_check CHECK (provider IN ('claude', 'openai', 'gemini'))
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_provider ON api_keys(provider);

-- ============================================
-- ANALYSES TABLE (History)
-- ============================================

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Input
  input_text TEXT NOT NULL,
  input_image_url TEXT,
  target_audience VARCHAR(100),

  -- LLM Used
  llm_provider VARCHAR(50) NOT NULL,
  llm_model VARCHAR(100) NOT NULL,

  -- Results
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  checks_results JSONB NOT NULL DEFAULT '{}',

  -- Metadata
  duration_seconds FLOAT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- User Annotations
  user_notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_analyses_org ON analyses(organization_id);
CREATE INDEX idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX idx_analyses_favorite ON analyses(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_analyses_tags ON analyses USING GIN(tags);

-- ============================================
-- ORGANIZATION DOCUMENTS TABLE
-- ============================================

CREATE TABLE organization_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- File Info
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  storage_url TEXT NOT NULL,

  -- Processing Status
  processing_status VARCHAR(50) DEFAULT 'pending',

  -- Extracted Content
  extracted_text TEXT,

  -- Analysis Results
  analysis_results JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT org_docs_type_check CHECK (file_type IN ('pdf', 'docx', 'txt')),
  CONSTRAINT org_docs_status_check CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_org_docs_org ON organization_documents(organization_id);
CREATE INDEX idx_org_docs_status ON organization_documents(processing_status);

-- ============================================
-- USAGE STATS TABLE
-- ============================================

CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL, -- Format: YYYY-MM

  analyses_count INTEGER DEFAULT 0,
  tokens_used BIGINT DEFAULT 0,
  cost_total DECIMAL(10, 2) DEFAULT 0,

  -- Breakdown by provider/model
  by_provider JSONB DEFAULT '{}',
  by_model JSONB DEFAULT '{}',

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint per user/org per period
  UNIQUE(user_id, period),
  UNIQUE(organization_id, period),

  -- Either user_id OR organization_id must be set
  CONSTRAINT usage_stats_owner_check CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  )
);

CREATE INDEX idx_usage_user_period ON usage_stats(user_id, period);
CREATE INDEX idx_usage_org_period ON usage_stats(organization_id, period);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage stats
CREATE OR REPLACE FUNCTION increment_usage_stats(
  p_user_id UUID,
  p_organization_id UUID,
  p_analyses_count INTEGER DEFAULT 1,
  p_tokens_used INTEGER DEFAULT 0,
  p_cost DECIMAL DEFAULT 0,
  p_provider VARCHAR DEFAULT NULL,
  p_model VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_period VARCHAR(7);
  v_by_provider JSONB;
  v_by_model JSONB;
BEGIN
  v_period := TO_CHAR(NOW(), 'YYYY-MM');

  -- Initialize JSONB objects
  v_by_provider := COALESCE((
    SELECT by_provider FROM usage_stats
    WHERE (user_id = p_user_id OR organization_id = p_organization_id)
    AND period = v_period
  ), '{}'::JSONB);

  v_by_model := COALESCE((
    SELECT by_model FROM usage_stats
    WHERE (user_id = p_user_id OR organization_id = p_organization_id)
    AND period = v_period
  ), '{}'::JSONB);

  -- Update provider stats
  IF p_provider IS NOT NULL THEN
    v_by_provider := jsonb_set(
      v_by_provider,
      ARRAY[p_provider],
      to_jsonb((
        COALESCE((v_by_provider->p_provider->>'count')::INTEGER, 0) + p_analyses_count,
        COALESCE((v_by_provider->p_provider->>'tokens')::INTEGER, 0) + p_tokens_used,
        COALESCE((v_by_provider->p_provider->>'cost')::DECIMAL, 0) + p_cost
      ))
    );
  END IF;

  -- Insert or update usage stats
  INSERT INTO usage_stats (
    user_id,
    organization_id,
    period,
    analyses_count,
    tokens_used,
    cost_total,
    by_provider,
    by_model
  ) VALUES (
    p_user_id,
    p_organization_id,
    v_period,
    p_analyses_count,
    p_tokens_used,
    p_cost,
    v_by_provider,
    v_by_model
  )
  ON CONFLICT (user_id, period) WHERE user_id IS NOT NULL
  DO UPDATE SET
    analyses_count = usage_stats.analyses_count + p_analyses_count,
    tokens_used = usage_stats.tokens_used + p_tokens_used,
    cost_total = usage_stats.cost_total + p_cost,
    by_provider = v_by_provider,
    by_model = v_by_model,
    updated_at = NOW();

  -- Same for organization
  INSERT INTO usage_stats (
    user_id,
    organization_id,
    period,
    analyses_count,
    tokens_used,
    cost_total,
    by_provider,
    by_model
  ) VALUES (
    NULL,
    p_organization_id,
    v_period,
    p_analyses_count,
    p_tokens_used,
    p_cost,
    v_by_provider,
    v_by_model
  )
  ON CONFLICT (organization_id, period) WHERE organization_id IS NOT NULL
  DO UPDATE SET
    analyses_count = usage_stats.analyses_count + p_analyses_count,
    tokens_used = usage_stats.tokens_used + p_tokens_used,
    cost_total = usage_stats.cost_total + p_cost,
    by_provider = v_by_provider,
    by_model = v_by_model,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE organizations IS 'Organizations for team collaboration';
COMMENT ON TABLE users IS 'User accounts linked to Supabase Auth';
COMMENT ON TABLE api_keys IS 'Encrypted API keys for LLM providers';
COMMENT ON TABLE analyses IS 'Historical analyses with results';
COMMENT ON TABLE organization_documents IS 'Uploaded communication guidelines';
COMMENT ON TABLE usage_stats IS 'Monthly usage tracking per user/organization';
