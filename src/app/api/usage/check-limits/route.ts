import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TIER_LIMITS } from '@/types/subscription'
import type { Database } from '@/types/database'
import type { SubscriptionTier } from '@/types/subscription'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // DEMO MODE: Always return demo data (Supabase not configured)
    return NextResponse.json({
      tier: 'free',
      usage: {
        analyses_this_month: 0,
        analyses_limit: 10,
        limit_reached: false,
      },
      subscription_active: false,
    })

    // Original Supabase Code (auskommentiert für Demo)
    /*
    // Fallback: Return demo data if Supabase not configured
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('example')) {
      return NextResponse.json({
        tier: 'free',
        usage: {
          analyses_this_month: 0,
          analyses_limit: 10,
          limit_reached: false,
        },
        subscription_active: false,
      })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    */

    /*
    // Get user's subscription tier
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const tier = (userData.subscription_tier || 'free') as SubscriptionTier
    const limits = TIER_LIMITS[tier]

    // Get current month's usage
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const { count: analysesCount, error: countError } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count analyses' },
        { status: 500 }
      )
    }

    const usedAnalyses = analysesCount || 0
    const maxAnalyses = limits.analyses_per_month

    // Check if limit is reached
    const limitReached =
      maxAnalyses !== null && usedAnalyses >= maxAnalyses

    return NextResponse.json({
      tier,
      limits,
      usage: {
        analyses_this_month: usedAnalyses,
        analyses_limit: maxAnalyses,
        limit_reached: limitReached,
      },
      subscription_active: userData.subscription_status === 'active',
    })
    */
  } catch (error: any) {
    console.error('Check limits error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check limits' },
      { status: 500 }
    )
  }
}
