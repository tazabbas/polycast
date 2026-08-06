'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [showBusinessForm, setShowBusinessForm] = useState(false)

  async function handleCheckout(priceId: string, key: string, mode: 'subscription' | 'payment', extra?: { companyName?: string; companyWebsite?: string }) {
    setLoading(key)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode, ...extra })
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

  function handleBusinessSubscribe() {
    if (!companyName.trim()) {
      alert('Please enter your company name to continue.')
      return
    }
    handleCheckout(
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID!,
      'business',
      'subscription',
      { companyName: companyName.trim(), companyWebsite: companyWebsite.trim() }
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'sans-serif', color: '#1A1A1A', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '3rem', color: '#6B6B76', textDecoration: 'none', fontSize: '0.9rem' }}>Back to home</Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing</h1>
        <p style={{ color: '#6B6B76', marginBottom: '1rem', fontSize: '1.1rem' }}>Subscriptions include bundled lip sync minutes, plus unlimited transcription, translation, and voice cloning.</p>
        <p style={{ color: '#6B6B76', marginBottom: '3rem', fontSize: '1.1rem' }}>Need more lip sync? Buy extra minutes any time — they never expire.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Starter</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.75rem 0' }}>£15<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For getting started</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['3 languages', '3 min lip sync/month', 'Unlimited transcription & translation', '1 platform of your choice, 1 account'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_STARTER_V2_PRICE_ID!, 'starter', 'subscription')}
              disabled={loading === 'starter'}
              style={{ display: 'block', width: '100%', background: loading === 'starter' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'starter' ? 'not-allowed' : 'pointer' }}>
              {loading === 'starter' ? 'Loading...' : 'Subscribe now — £15/mo'}
            </button>
          </div>

          <div style={{ background: '#EAF7F1', border: '2px solid #1D9E75', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>MOST POPULAR</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Creator</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1D9E75', margin: '0.75rem 0' }}>£29<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For growing channels</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['15 languages', '8 min lip sync/month', 'Unlimited transcription & translation', 'No watermark', 'All 3 platforms, 2 accounts each'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_CREATOR_V2_PRICE_ID!, 'creator', 'subscription')}
              disabled={loading === 'creator'}
              style={{ display: 'block', width: '100%', background: loading === 'creator' ? '#ccc' : '#1D9E75', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'creator' ? 'not-allowed' : 'pointer' }}>
              {loading === 'creator' ? 'Loading...' : 'Subscribe now — £29/mo'}
            </button>
          </div>

          <div style={{ background: '#F2F0FC', border: '1px solid #533AB7', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#533AB7', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>PREMIUM</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Pro</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED', margin: '0.75rem 0' }}>£59<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>For serious creators</p>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
              {['37 languages (all)', '20 min lip sync/month', 'Unlimited transcription & translation', 'Priority processing', 'All 3 platforms, 5 accounts each'].map(f => (
                <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '5px 0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#7C3AED' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRO_V2_PRICE_ID!, 'pro', 'subscription')}
              disabled={loading === 'pro'}
              style={{ display: 'block', width: '100%', background: loading === 'pro' ? '#ccc' : '#533AB7', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'pro' ? 'not-allowed' : 'pointer' }}>
              {loading === 'pro' ? 'Loading...' : 'Subscribe now — £59/mo'}
            </button>
          </div>

        </div>

        <p style={{ color: '#9A9AA4', fontSize: '0.85rem', marginBottom: '4rem' }}>14-day money back guarantee · Secure payments by Stripe · Cancel anytime</p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Extra lip sync minutes</h2>
        <p style={{ color: '#6B6B76', marginBottom: '2.5rem', fontSize: '1rem' }}>Once your monthly minutes run out, top up any time. Credits never expire.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Trial</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£9</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>2 minutes · £4.50/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_TRIAL_V2_PRICE_ID!, 'lipsync_trial', 'payment')}
              disabled={loading === 'lipsync_trial'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_trial' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_trial' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_trial' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Small</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£19</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>5 minutes · £3.80/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_SMALL_V2_PRICE_ID!, 'lipsync_small', 'payment')}
              disabled={loading === 'lipsync_small'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_small' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_small' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_small' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Medium</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£45</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>15 minutes · £3.00/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_MEDIUM_V2_PRICE_ID!, 'lipsync_medium', 'payment')}
              disabled={loading === 'lipsync_medium'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_medium' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_medium' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_medium' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Large</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£100</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>40 minutes · £2.50/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_LARGE_V2_PRICE_ID!, 'lipsync_large', 'payment')}
              disabled={loading === 'lipsync_large'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_large' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_large' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_large' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

          <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bulk</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£220</div>
            <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>100 minutes · £2.20/min</p>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_LIPSYNC_BULK_V2_PRICE_ID!, 'lipsync_bulk', 'payment')}
              disabled={loading === 'lipsync_bulk'}
              style={{ display: 'block', width: '100%', background: loading === 'lipsync_bulk' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'lipsync_bulk' ? 'not-allowed' : 'pointer' }}>
              {loading === 'lipsync_bulk' ? 'Loading...' : 'Buy credits'}
            </button>
          </div>

        </div>

        <div id="business" style={{ padding: '2.5rem', background: '#F7F7F8', borderRadius: '16px', textAlign: 'left', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>For Businesses</h2>
          <p style={{ color: '#6B6B76', marginBottom: '2rem', textAlign: 'center' }}>Dub ad campaigns across every market. All 3 platforms, all 37 languages, 10 accounts per platform.</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#FFFFFF', border: '2px solid #1D9E75', borderRadius: '16px', padding: '2rem', maxWidth: '320px', width: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Business</h3>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1D9E75', margin: '0.75rem 0' }}>£19<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B6B76' }}>/mo</span></div>
              <p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.5rem' }}>Platform access, pay-as-you-go lip sync</p>

              {!showBusinessForm ? (
                <button
                  onClick={() => setShowBusinessForm(true)}
                  style={{ display: 'block', width: '100%', background: '#1D9E75', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
                  Get started
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Company name *"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ display: 'block', width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.85rem', marginBottom: '0.6rem', color: '#1A1A1A' }}
                  />
                  <input
                    type="text"
                    placeholder="Company website (optional)"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    style={{ display: 'block', width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.85rem', marginBottom: '1rem', color: '#1A1A1A' }}
                  />
                  <button
                    onClick={handleBusinessSubscribe}
                    disabled={loading === 'business'}
                    style={{ display: 'block', width: '100%', background: loading === 'business' ? '#ccc' : '#1D9E75', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading === 'business' ? 'not-allowed' : 'pointer' }}>
                    {loading === 'business' ? 'Loading...' : 'Subscribe now — £19/mo'}
                  </button>
                </>
              )}
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>Business lip sync packs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>

            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Small</h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£90</div>
              <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>20 minutes · £4.50/min</p>
              <button
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_BUSINESS_SMALL_PRICE_ID!, 'business_small', 'payment')}
                disabled={loading === 'business_small'}
                style={{ display: 'block', width: '100%', background: loading === 'business_small' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'business_small' ? 'not-allowed' : 'pointer' }}>
                {loading === 'business_small' ? 'Loading...' : 'Buy credits'}
              </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Medium</h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£225</div>
              <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>75 minutes · £3.00/min</p>
              <button
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MEDIUM_PRICE_ID!, 'business_medium', 'payment')}
                disabled={loading === 'business_medium'}
                style={{ display: 'block', width: '100%', background: loading === 'business_medium' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'business_medium' ? 'not-allowed' : 'pointer' }}>
                {loading === 'business_medium' ? 'Loading...' : 'Buy credits'}
              </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Large</h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>£630</div>
              <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>300 minutes · £2.10/min</p>
              <button
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_BUSINESS_LARGE_PRICE_ID!, 'business_large', 'payment')}
                disabled={loading === 'business_large'}
                style={{ display: 'block', width: '100%', background: loading === 'business_large' ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: loading === 'business_large' ? 'not-allowed' : 'pointer' }}>
                {loading === 'business_large' ? 'Loading...' : 'Buy credits'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
