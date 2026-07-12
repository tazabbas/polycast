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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Free</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.75rem 0' }}>£0</div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>Perfect to try PolyCast</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['3 languages', '10 mins/month voice preview', 'Generic TTS voice', 'No lip sync'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" style={{ display: 'block', background: 'transparent', color: '#4A4A54', border: '1px solid #D1D1D8', padding: '0.875rem', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem' }}>
              Get started free
            </Link>
          </div>

          <div style={{ background: '#EAF7F1', border: '2px solid #1D9E75', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>MOST POPULAR</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Creator</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1D9E75', margin: '0.75rem 0' }}>£19<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
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
              {loading === 'creator' ? 'Loading...' : 'Subscribe now — £19/mo'}
            </button>
          </div>

          <div style={{ background: '#F2F0FC', border: '1px solid #533AB7', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#533AB7', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>PREMIUM</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Studio</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED', margin: '0.75rem 0' }}>£49<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For serious creators</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['50+ languages', 'Everything in Creator', '10% off all lip sync credit packs', 'Priority processing', 'Dedicated support'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#7C3AED' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID!, 'studio', 'subscription')}
              disabled={loading === 'studio'}
              style={{ display: 'block', width: '100%', background: loading === 'studio' ? '#ccc' : '#533AB7', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'studio' ? 'not-allowed' : 'pointer' }}>
              {loading === 'studio' ? 'Loading...' : 'Subscribe now — £49/mo'}
            </button>
          </div>

        </div>

        <p style={{ color: '#9A9AA4', fontSize: '0.85rem', marginBottom: '4rem' }}>14-day money back guarantee · Secure payments by Stripe · Cancel anytime</p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lip sync credits</h2>
        <p style={{ color: '#6B6B76', marginBottom: '2.5rem', fontSize: '1rem' }}>Buy minutes as you need them. Credits never expire.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Starter</h3>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0' }}>£45</div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>10 minutes · £4.50/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_STARTER_PRICE_ID!, 'lipsync_starter', 'payment')}
              disabled={loading === 'lipsync_starter'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_starter' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: loading === 'lipsync_starter' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_starter' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Growth</h3>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0' }}>£120</div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>30 minutes · £4.00/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_GROWTH_PRICE_ID!, 'lipsync_growth', 'payment')}
              disabled={loading === 'lipsync_growth'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_growth' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: loading === 'lipsync_growth' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_growth' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Scale</h3>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0' }}>£350</div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>100 minutes · £3.50/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_SCALE_PRICE_ID!, 'lipsync_scale', 'payment')}
              disabled={loading === 'lipsync_scale'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_scale' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: loading === 'lipsync_scale' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_scale' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

        </div>

        <p style={{ color: '#9A9AA4', fontSize: '0.8rem', marginTop: '2rem' }}>Studio subscribers save 10% on credit packs — discount applied manually for now, contact support to redeem.</p>
      </div>
    </main>
  )
}
