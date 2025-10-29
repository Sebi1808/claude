// ============================================
// SUPABASE CLIENT - Server
// For use in Server Components and API Routes
// ============================================

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Create Supabase client for Server Components
 */
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

/**
 * Create Supabase client for API Routes
 */
export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}
