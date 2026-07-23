import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FFFFFF', minHeight: '100vh', color: '#1A1A1A', overflowX: 'hidden' }}>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #E5E5EA', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.svg" alt="PolyCast logo" style={{ width: '36px', height: '36px' }} />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1D9E75' }}>PolyCast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ color: '#6B6B76', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
          <Link href="/watch" style={{ color: '#6B6B76', textDecoration: 'none', fontSize: '0.9rem' }}>Demo</Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button style={{ background: 'transparent', color: '#6B6B76', border: '1px solid #D1D1D8', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
                Get started free
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <button style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                Dashboard
              </button>
            </Link>
            <UserButton />
          </Show>
        </div>
      </nav>

      {/* HERO with animated tech background */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 2rem 4rem', background: '#F7FCFA' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} preserveAspectRatio="none">
            <defs>
              <pattern id="waveGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#1D9E75" opacity="0.25" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waveGrid)" />
          </svg>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${8 + i * 13}%`,
                bottom: 0,
                width: '4px',
                height: `${20 + (i % 3) * 18}%`,
                background: '#1D9E75',
                opacity: 0.12,
                borderRadius: '4px',
                animation: `polycastWave 2.${i}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#EAF7F1', border: '1px solid #1D9E75', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#1D9E75', marginBottom: '1.5rem', fontWeight: 500 }}>
            AI dubbing and lip sync, for every platform
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', color: '#1A1A1A' }}>Your voice.</span>
            <span style={{ display: 'block', color: '#1A1A1A' }}>Every platform.</span>
            <span style={{ display: 'block', color: '#1D9E75' }}>Every language.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#6B6B76', maxWidth: '640px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            PolyCast uses AI to transcribe, translate, dub, and lip-sync your videos in your own cloned voice —
            then publishes them back to YouTube, TikTok, or Instagram automatically.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.3)' }}>
                  I&apos;m a creator
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.3)' }}>
                  Go to dashboard
                </button>
              </Link>
            </Show>
            <Link href="/pricing#business">
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#4A4A54', border: '1px solid #D1D1D8', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer' }}>
                I run a business
              </button>
            </Link>
          </div>

          {/* Video demo placeholder */}
          <div style={{ maxWidth: '720px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', border: '1px solid #D6EEE3', background: '#0E1F19', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Once a demo video exists, replace this block with: <video controls src="/your-demo.mp4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(29,158,117,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '22px' }}>▶</div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>Demo video coming soon</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>One voice, spoken in six languages, perfectly lip-synced</p>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#8A8A94', marginTop: '1.5rem' }}>No credit card required · Free to start · Cancel anytime</p>
        </div>

        <style>{`
          @keyframes polycastWave {
            from { transform: scaleY(0.6); }
            to { transform: scaleY(1.4); }
          }
        `}</style>
      </section>

      {/* Platform strip */}
      <div style={{ background: '#F7F7F8', borderTop: '1px solid #E5E5EA', borderBottom: '1px solid #E5E5EA', padding: '1.5rem 2rem' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#8A8A94', marginBottom: '0.75rem' }}>Works with the platforms you already publish to</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'YouTube', color: '#FF0000' },
            { label: 'TikTok', color: '#1A1A1A' },
            { label: 'Instagram', color: '#D4537E' },
          ].map((p) => (
            <span key={p.label} style={{ fontSize: '0.95rem', fontWeight: 600, color: p.color }}>{p.label}</span>
          ))}
        </div>
      </div>

      {/* For Creators */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: '#EAF7F1', color: '#1D9E75', fontSize: '12px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>For creators</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>From one video to a global audience</h2>
          <p style={{ color: '#6B6B76' }}>Connect your channel, dub in your own voice, publish back automatically</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🔗', title: 'Connect your account', desc: 'Sign in with YouTube, TikTok, or Instagram and select any video to translate.' },
            { icon: '📝', title: 'AI transcribes it', desc: 'Whisper AI converts your speech to text in 99 languages with near-perfect accuracy.' },
            { icon: '🌍', title: 'DeepL translates', desc: 'Your transcript is translated into up to 50 languages with natural phrasing.' },
            { icon: '🎙', title: 'Your voice, dubbed', desc: 'ElevenLabs clones your voice and speaks the translation, lip-synced to match.' },
            { icon: '📤', title: 'Auto-published', desc: 'The dubbed video is uploaded back to the platform it came from.' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontSize: '11px', color: '#1D9E75', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Step {i + 1}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B6B76', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Businesses */}
      <section id="business" style={{ padding: '4rem 2rem', background: '#F7F7F8', borderTop: '1px solid #E5E5EA', borderBottom: '1px solid #E5E5EA' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', background: '#FFFFFF', color: '#1D9E75', fontSize: '12px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>For businesses</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Dub your ad campaigns into every market</h2>
            <p style={{ color: '#6B6B76', maxWidth: '600px', margin: '0 auto' }}>No re-shoots, no voice actors per language — one campaign, dubbed and lip-synced for every market you sell in.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '⚡', title: 'Fast turnaround', desc: 'Get dubbed campaign assets back in hours, not weeks.' },
              { icon: '🎯', title: 'Consistent brand voice', desc: 'The same voice and delivery across every language and market.' },
              { icon: '📦', title: 'Bulk pricing', desc: 'Volume-based plans built for campaigns, not single videos.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B6B76', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="mailto:tazabbas88@gmail.com" style={{ display: 'inline-block', background: '#1D9E75', color: 'white', padding: '0.85rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
              Talk to us about your campaign
            </a>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing for creators and businesses</h2>
        <p style={{ color: '#6B6B76', marginBottom: '2rem' }}>Start free. Scale as you grow.</p>
        <Link href="/pricing">
          <button style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600 }}>
            View pricing
          </button>
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid #E5E5EA', padding: '2rem', textAlign: 'center', color: '#9A9AA4', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ color: '#6B6B76', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/watch" style={{ color: '#6B6B76', textDecoration: 'none' }}>Watch demo</Link>
          <Link href="/dashboard" style={{ color: '#6B6B76', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/privacy" style={{ color: '#6B6B76', textDecoration: 'none' }}>Privacy</Link>
          <a href="mailto:tazabbas88@gmail.com" style={{ color: '#6B6B76', textDecoration: 'none' }}>Contact</a>
        </div>
        <p>© 2026 PolyCast. Built for creators and businesses, everywhere.</p>
      </footer>

    </main>
  )
}
