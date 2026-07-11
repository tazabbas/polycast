export default function SuccessPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '500px' }}>
        <div style={{ width: '80px', height: '80px', background: '#0d2e1e', border: '2px solid #1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2rem' }}>
          ✓
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
          Welcome to PolyCast!
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Your subscription is active. You can now start translating your videos into any language — in your own cloned voice.
        </p>
        <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', textDecoration: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 600 }}>
          ▶ Go to your dashboard
        </a>
        <p style={{ color: '#444', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          A confirmation email has been sent to you by Stripe.
        </p>
      </div>
    </main>
  )
}