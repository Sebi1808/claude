import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import type { Database } from '@/types/database'
import type { SubscriptionTier } from '@/types/subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Map subscription tiers to Stripe Price IDs
// TODO: Replace with your actual Stripe Price IDs from Stripe Dashboard
const PRICE_IDS: Record<SubscriptionTier, string> = {
  free: '', // Free tier doesn't need a price ID
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  professional: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional_placeholder',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
}

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

    const { tier } = await request.json()

    if (!tier || tier === 'free') {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[tier as SubscriptionTier]

    if (!priceId || priceId.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Subscription tier not configured. Please set up Stripe Price IDs.' },
        { status: 500 }
      )
    }

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        subscription_tier: tier,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
