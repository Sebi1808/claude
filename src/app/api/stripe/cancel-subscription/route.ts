import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import type { Database } from '@/types/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription at period end (not immediately)
    await stripe.subscriptions.update(userData.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update database
    await supabase
      .from('users')
      .update({
        subscription_status: 'canceling',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({
      message: 'Subscription will be canceled at period end',
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
