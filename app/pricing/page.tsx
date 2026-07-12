'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(priceId: string, planName: string) {
    setLoading(planName)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
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
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '3rem', color: '#6B6B76', textDecoration: 'none', fontSize: '0.9rem' }}>Back to home</Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing</h1>
        <p style={{ color: '#6B6B76', marginBottom: '3rem', fontSize: '1.1rem' }}>Start free. Scale as you grow. Cancel anytime.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Starter</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.75rem 0' }}>Free</div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>Perfect to try PolyCast</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['3 languages', '30 mins/month', 'Generic TTS voice', 'Basic analytics'].map(f => (
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
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1D9E75', margin: '0.75rem 0' }}>£29<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For growing channels</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['15 languages', '10 hours/month', 'Voice cloning included', 'Audience dashboard', 'No watermark', 'Priority support'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!, 'creator')}
              disabled={loading === 'creator'}
              style={{ display: 'block', width: '100%', background: loading === 'creator' ? '#ccc' : '#1D9E75', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'creator' ? 'not-allowed' : 'pointer' }}>
              {loading === 'creator' ? 'Loading...' : 'Subscribe now — £29/mo'}
            </button>
          </div>

          <div style={{ background: '#F2F0FC', border: '1px solid #533AB7', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#533AB7', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>PREMIUM</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Pro</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED', margin: '0.75rem 0' }}>£149<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For serious creators</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['50+ languages', 'Unlimited audio', 'Live stream translation', 'Lip sync coming soon', 'Auto YouTube upload', 'Dedicated support'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#7C3AED' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, 'pro')}
              disabled={loading === 'pro'}
              style={{ display: 'block', width: '100%', background: loading === 'pro' ? '#ccc' : '#533AB7', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'pro' ? 'not-allowed' : 'pointer' }}>
              {loading === 'pro' ? 'Loading...' : 'Subscribe now — £149/mo'}
            </button>
          </div>

        </div>
        <p style={{ color: '#9A9AA4', fontSize: '0.85rem' }}>14-day money back guarantee · Secure payments by Stripe · Cancel anytime</p>
      </div>
    </main>
  )
}
