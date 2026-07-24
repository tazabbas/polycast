'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(priceId: string, key: string, mode: 'subscription' | 'payment') {
    setLoading(key)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'Unauthorized') {
        router.push('/sign-in')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'sans-serif', color: '#1A1A1A', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '3rem', color: '#6B6B76', textDecoration: 'none', fontSize: '0.9rem' }}>Back to home</Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing</h1>
        <p style={{ color: '#6B6B76', marginBottom: '1rem', fontSize: '1.1rem' }}>Low-cost subscription for transcription, translation, and voice cloning.</p>
        <p style={{ color: '#6B6B76', marginBottom: '3rem', fontSize: '1.1rem' }}>Lip sync is sold separately as credits — you only pay for what you use.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Starter</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.75rem 0' }}>£13<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For getting started</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['3 languages', 'Unlimited transcription & translation', 'Generic TTS voice', 'Lip sync credits sold separately'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!, 'starter', 'subscription')}
              disabled={loading === 'starter'}
              style={{ display: 'block', width: '100%', background: loading === 'starter' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'starter' ? 'not-allowed' : 'pointer' }}>
              {loading === 'starter' ? 'Loading...' : 'Subscribe now — £13/mo'}
            </button>
          </div>

          <div style={{ background: '#EAF7F1', border: '2px solid #1D9E75', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>MOST POPULAR</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Creator</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1D9E75', margin: '0.75rem 0' }}>£39<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For growing channels</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['15 languages', 'Unlimited transcription & translation', 'Unlimited voice cloning', 'No watermark', 'Auto YouTube upload', 'Lip sync credits sold separately'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID!, 'creator', 'subscription')}
              disabled={loading === 'creator'}
              style={{ display: 'block', width: '100%', background: loading === 'creator' ? '#ccc' : '#1D9E75', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'creator' ? 'not-allowed' : 'pointer' }}>
              {loading === 'creator' ? 'Loading...' : 'Subscribe now — £39/mo'}
            </button>
          </div>

          <div style={{ background: '#F2F0FC', border: '1px solid #533AB7', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#533AB7', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>PREMIUM</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Pro</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED', margin: '0.75rem 0' }}>£90<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For serious creators and businesses</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['35+ languages', 'Everything in Creator', '10% off all lip sync credit packs', 'Priority processing', 'Dedicated support'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#7C3AED' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, 'pro', 'subscription')}
              disabled={loading === 'pro'}
              style={{ display: 'block', width: '100%', background: loading === 'pro' ? '#ccc' : '#533AB7', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'pro' ? 'not-allowed' : 'pointer' }}>
              {loading === 'pro' ? 'Loading...' : 'Subscribe now — £90/mo'}
            </button>
          </div>

        </div>

        <p style={{ color: '#9A9AA4', fontSize: '0.85rem', marginBottom: '4rem' }}>14-day money back guarantee · Secure payments by Stripe · Cancel anytime</p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lip sync credits</h2>
        <p style={{ color: '#6B6B76', marginBottom: '2.5rem', fontSize: '1rem' }}>Buy minutes as you need them. Credits never expire.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Trial</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£7</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>2 minutes · £3.50/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_TRIAL_PRICE_ID!, 'lipsync_trial', 'payment')}
              disabled={loading === 'lipsync_trial'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_trial' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_trial' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_trial' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Small</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£15</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>5 minutes · £3.00/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_SMALL_PRICE_ID!, 'lipsync_small', 'payment')}
              disabled={loading === 'lipsync_small'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_small' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_small' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_small' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Medium</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£39</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>15 minutes · £2.60/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_MEDIUM_PRICE_ID!, 'lipsync_medium', 'payment')}
              disabled={loading === 'lipsync_medium'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_medium' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_medium' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_medium' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Large</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£92</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>40 minutes · £2.30/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_LARGE_PRICE_ID!, 'lipsync_large', 'payment')}
              disabled={loading === 'lipsync_large'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_large' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_large' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_large' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bulk</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£210</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>100 minutes · £2.10/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_BULK_PRICE_ID!, 'lipsync_bulk', 'payment')}
              disabled={loading === 'lipsync_bulk'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_bulk' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_bulk' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_bulk' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

        </div>

        <p style={{ color: '#9A9AA4', fontSize: '0.8rem', marginTop: '2rem' }}>Pro subscribers save 10% on credit packs — discount applied manually for now, contact support to redeem.</p>

        <div style={{ marginTop: '4rem', padding: '2.5rem', background: '#F7F7F8', borderRadius: '16px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Business ad campaigns</h2>
          <p style={{ color: '#6B6B76', marginBottom: '1.5rem', textAlign: 'center' }}>Dubbing multiple ads across markets? Bulk lip sync minutes at £2.10/min, with further volume discounts above 200 minutes/month.</p>
          <div style={{ textAlign: 'center' }}>
            <a href="mailto:tazabbas88@gmail.com" style={{ display: 'inline-block', background: '#1D9E75', color: 'white', padding: '0.85rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Talk to us about your campaign
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
