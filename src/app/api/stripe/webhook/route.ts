import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Use service role key for webhook handler (needs to bypass RLS)
const supabase: any = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('Received Stripe event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  const userId = session.metadata?.supabase_user_id
  const tier = session.metadata?.subscription_tier

  if (!userId || !tier) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Update user subscription
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      stripe_subscription_id: session.subscription as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
  } else {
    console.log(`User ${userId} upgraded to ${tier}`)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)

  const userId = subscription.metadata?.supabase_user_id

  if (!userId) {
    // Try to find user by customer ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single()

    if (!user) {
      console.error('User not found for subscription:', subscription.id)
      return
    }
  }

  const status = subscription.status === 'active' ? 'active' : 'inactive'

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq(userId ? 'id' : 'stripe_customer_id', userId || (subscription.customer as string))

  if (error) {
    console.error('Error updating subscription status:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)

  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error handling subscription deletion:', error)
  } else {
    console.log(`Subscription ${subscription.id} downgraded to free`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)

  if (!invoice.subscription) return

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string)

  if (error) {
    console.error('Error updating payment status:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)

  if (!invoice.subscription) return

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription as string)

  if (error) {
    console.error('Error updating payment failure status:', error)
  }
}
