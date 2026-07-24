import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PLAN_PRICE_IDS: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '']: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID || '']: 'creator',
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '']: 'pro',
}

const CREDIT_PACK_MINUTES: Record<string, number> = {
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_TRIAL_PRICE_ID || '']: 2,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_SMALL_PRICE_ID || '']: 5,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_MEDIUM_PRICE_ID || '']: 15,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_LARGE_PRICE_ID || '']: 40,
  [process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_BULK_PRICE_ID || '']: 100,
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
      await supabase
        .from('user_credits')
        .upsert({ user_id: userId, plan, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
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

  return NextResponse.json({ received: true })
}
