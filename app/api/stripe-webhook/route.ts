import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PLAN_PRICE_IDS: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_V2_PRICE_ID || '']: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_CREATOR_V2_PRICE_ID || '']: 'creator',
  [process.env.NEXT_PUBLIC_STRIPE_PRO_V2_PRICE_ID || '']: 'pro',
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || '']: 'business',
}

const BUNDLED_MINUTES: Record<string, number> = {
  starter: 3,
  creator: 8,
  pro: 20,
  business: 0,
}

const CREDIT_PACK_MINUTES: Record<string, number> = {
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_TRIAL_V2_PRICE_ID || '']: 2,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_SMALL_V2_PRICE_ID || '']: 5,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_MEDIUM_V2_PRICE_ID || '']: 15,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_LARGE_V2_PRICE_ID || '']: 40,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_BULK_V2_PRICE_ID || '']: 100,
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_SMALL_PRICE_ID || '']: 20,
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MEDIUM_PRICE_ID || '']: 75,
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_LARGE_PRICE_ID || '']: 300,
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handles first-time signups (both subscriptions and one-time credit pack purchases)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (!userId) {
      console.error('No userId in session metadata')
      return NextResponse.json({ received: true })
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const priceId = lineItems.data[0]?.price?.id

    if (!priceId) {
      return NextResponse.json({ received: true })
    }

    if (session.mode === 'subscription' && PLAN_PRICE_IDS[priceId]) {
      const plan = PLAN_PRICE_IDS[priceId]
      const bundledMinutes = BUNDLED_MINUTES[plan] || 0
      const companyName = session.metadata?.companyName
      const companyWebsite = session.metadata?.companyWebsite

      const { data: existing } = await supabase
        .from('user_credits')
        .select('minutes_balance')
        .eq('user_id', userId)
        .single()

      const newBalance = (existing?.minutes_balance || 0) + bundledMinutes

      await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          plan,
          minutes_balance: newBalance,
          updated_at: new Date().toISOString(),
          ...(companyName ? { company_name: companyName } : {}),
          ...(companyWebsite ? { company_website: companyWebsite } : {}),
        }, { onConflict: 'user_id' })
    }

    if (session.mode === 'payment' && CREDIT_PACK_MINUTES[priceId]) {
      const minutesToAdd = CREDIT_PACK_MINUTES[priceId]
      const { data: existing } = await supabase
        .from('user_credits')
        .select('minutes_balance')
        .eq('user_id', userId)
        .single()
      const newBalance = (existing?.minutes_balance || 0) + minutesToAdd
      await supabase
        .from('user_credits')
        .upsert({ user_id: userId, minutes_balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    }
  }

  // Handles monthly renewals — adds bundled minutes again each billing cycle (not on the very first payment, since checkout.session.completed already handled that)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice

    if (invoice.billing_reason === 'subscription_cycle') {
      const invoiceAny = invoice as unknown as {
        subscription?: string | { id: string } | null
        parent?: { subscription_details?: { subscription?: string | { id: string } | null } }
      }
      const rawSubscription =
        invoiceAny.subscription ?? invoiceAny.parent?.subscription_details?.subscription
      const subscriptionId =
        typeof rawSubscription === 'string' ? rawSubscription : rawSubscription?.id

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.userId
        const priceId = subscription.items.data[0]?.price?.id

        if (userId && priceId && PLAN_PRICE_IDS[priceId]) {
          const plan = PLAN_PRICE_IDS[priceId]
          const bundledMinutes = BUNDLED_MINUTES[plan] || 0

          if (bundledMinutes > 0) {
            const { data: existing } = await supabase
              .from('user_credits')
              .select('minutes_balance')
              .eq('user_id', userId)
              .single()

            const newBalance = (existing?.minutes_balance || 0) + bundledMinutes

            await supabase
              .from('user_credits')
              .upsert({ user_id: userId, minutes_balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
