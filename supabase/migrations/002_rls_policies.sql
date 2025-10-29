-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Migration 002: Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can view org members if in same org
CREATE POLICY "Users can view org members"
  ON users
  FOR SELECT
  USING (
    organization_id IS NOT NULL AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================

-- Organization members can view their org
CREATE POLICY "Members can view their organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Only owners can update organization
CREATE POLICY "Only owners can update organization"
  ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Only owners can delete organization
CREATE POLICY "Only owners can delete organization"
  ON organizations
  FOR DELETE
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- API KEYS TABLE POLICIES
-- ============================================

-- Users can view their own API keys
CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own API keys
CREATE POLICY "Users can insert own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own API keys
CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  USING (user_id = auth.uid());

-- Org owners and admins can view org API keys
CREATE POLICY "Org owners/admins can view org API keys"
  ON api_keys
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Org owners can manage org API keys
CREATE POLICY "Org owners can manage org API keys"
  ON api_keys
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- ANALYSES TABLE POLICIES
-- ============================================

-- Users can view their own analyses
CREATE POLICY "Users can view own analyses"
  ON analyses
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses"
  ON analyses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own analyses (notes, tags, favorite)
CREATE POLICY "Users can update own analyses"
  ON analyses
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON analyses
  FOR DELETE
  USING (user_id = auth.uid());

-- Org members can view team analyses
CREATE POLICY "Org members can view team analyses"
  ON analyses
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- ORGANIZATION DOCUMENTS TABLE POLICIES
-- ============================================

-- Org members can view org documents
CREATE POLICY "Org members can view org documents"
  ON organization_documents
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Org owners and admins can insert documents
CREATE POLICY "Org owners/admins can insert documents"
  ON organization_documents
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Org owners and admins can delete documents
CREATE POLICY "Org owners/admins can delete documents"
  ON organization_documents
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- USAGE STATS TABLE POLICIES
-- ============================================

-- Users can view their own usage stats
CREATE POLICY "Users can view own usage stats"
  ON usage_stats
  FOR SELECT
  USING (user_id = auth.uid());

-- Org owners can view org usage stats
CREATE POLICY "Org owners can view org usage stats"
  ON usage_stats
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- System can insert/update usage stats (via function)
CREATE POLICY "System can manage usage stats"
  ON usage_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS FOR PERMISSIONS
-- ============================================

-- Check if user has specific role in org
CREATE OR REPLACE FUNCTION user_has_org_role(p_org_id UUID, p_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND organization_id = p_org_id
    AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is org member
CREATE OR REPLACE FUNCTION user_is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND organization_id = p_org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's current tier
CREATE OR REPLACE FUNCTION get_user_tier()
RETURNS VARCHAR AS $$
BEGIN
  RETURN (
    SELECT subscription_tier FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can perform action based on tier limits
CREATE OR REPLACE FUNCTION can_perform_action(p_action VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier VARCHAR;
  v_usage INTEGER;
  v_limit INTEGER;
  v_period VARCHAR(7);
BEGIN
  v_tier := get_user_tier();
  v_period := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get current usage
  v_usage := COALESCE((
    SELECT analyses_count FROM usage_stats
    WHERE user_id = auth.uid() AND period = v_period
  ), 0);

  -- Get tier limit
  v_limit := CASE v_tier
    WHEN 'free' THEN 10
    WHEN 'starter' THEN 100
    WHEN 'professional' THEN 500
    WHEN 'enterprise' THEN NULL -- unlimited
  END;

  -- Check limit
  IF v_limit IS NULL THEN
    RETURN true; -- unlimited
  END IF;

  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
