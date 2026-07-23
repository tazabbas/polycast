import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

function MatrixOverlay() {
  const cols = Array.from({ length: 26 })
  const chars = '01アイウエオカキクケコ日語translate'
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
        {cols.map((_, i) => {
          const char = chars[(i * 5) % chars.length]
          const duration = 6 + (i % 6) * 1.5
          const delay = (i % 10) * -1.1
          return (
            <span
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 700,
                color: '#0F6E56',
                opacity: 0.4,
                animation: `matrixFallSlow ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
              }}
            >
              {char}
            </span>
          )
        })}
      </div>
      <style>{`
        @keyframes matrixFallSlow {
          0% { transform: translateY(-40px); opacity: 0; }
          10% { opacity: 0.45; }
          90% { opacity: 0.45; }
          100% { transform: translateY(600px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function DemoVideoBox({ label }: { label: string }) {
  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #D6EEE3', background: '#0E1F19', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
      {/* Once a demo video exists, replace this block with: <video controls src="/your-demo.mp4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(29,158,117,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontSize: '16px' }}>▶</div>
        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>Demo coming soon</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{label}</p>
      </div>
    </div>
  )
}

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

      {/* SECTION 1 — Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#08110D', padding: '4.5rem 2rem 3.5rem' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.9 }}>
            <defs>
              <pattern id="circuit" width="70" height="70" patternUnits="userSpaceOnUse">
                <path d="M0 35 H27 M43 35 H70 M35 0 V27 M35 43 V70" stroke="#1D9E75" strokeWidth="1.5" opacity="0.6" fill="none" />
                <circle cx="35" cy="35" r="3.5" fill="#5DCAA5" opacity="0.75" />
              </pattern>
              <radialGradient id="glow" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1000" height="500" fill="url(#circuit)" />
            <rect width="1000" height="500" fill="url(#glow)" />
            <path d="M0 380 L180 380 L220 320 L420 320 L460 260 L1000 260" stroke="#5DCAA5" strokeWidth="1.5" opacity="0.5" fill="none" />
            <path d="M0 120 L150 120 L190 180 L500 180 L540 240 L1000 240" stroke="#5DCAA5" strokeWidth="1.5" opacity="0.4" fill="none" />
          </svg>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${8 + i * 12}%`,
                top: `${12 + (i % 3) * 22}%`,
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#5DCAA5',
                boxShadow: '0 0 12px 4px rgba(93,202,165,0.8)',
                animation: `polycastPulse 2.${i}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(93,202,165,0.5)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#5DCAA5', marginBottom: '1.5rem', fontWeight: 500 }}>
            AI dubbing and lip sync, for every platform
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', color: '#FFFFFF' }}>Your voice.</span>
            <span style={{ display: 'block', color: '#FFFFFF' }}>Every platform.</span>
            <span style={{ display: 'block', color: '#5DCAA5' }}>Every language.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.65)', maxWidth: '640px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            PolyCast uses AI to transcribe, translate, dub, and lip-sync your videos in your own cloned voice —
            then publishes them back to YouTube, TikTok, or Instagram automatically.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.35)' }}>
                  I&apos;m a creator
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/pricing">
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.35)' }}>
                  Subscribe
                </button>
              </Link>
            </Show>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Works with the platforms you already publish to</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF3B3B' }}>YouTube</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>TikTok</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0709A' }}>Instagram</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5DCAA5' }}>Business Ads</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#5DCAA5', fontWeight: 500 }}>For creator content and business ad campaigns alike</p>
        </div>

        <style>{`
          @keyframes polycastPulse {
            from { opacity: 0.3; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1.3); }
          }
        `}</style>
      </section>

      {/* SECTION 2 — Business (left, own demo) | Creators (right, own demo) */}
      <section style={{ position: 'relative', padding: '3.5rem 2rem', overflow: 'hidden' }}>
        <MatrixOverlay />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>

          {/* Business — left */}
          <div>
            <DemoVideoBox label="A dubbed ad, spoken in six languages" />
            <div style={{ display: 'inline-block', background: '#EAF7F1', color: '#1D9E75', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px' }}>For businesses</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>Dub your ad campaigns into every market</h2>
            <p style={{ color: '#6B6B76', fontSize: '0.85rem', marginBottom: '1.25rem' }}>No re-shoots, no voice actors per language.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { icon: '⚡', title: 'Fast turnaround', desc: 'Dubbed campaign assets back in hours, not weeks.' },
                { icon: '🎯', title: 'Consistent brand voice', desc: 'The same voice and delivery across every language and market.' },
                { icon: '📦', title: 'Bulk pricing', desc: 'Volume-based plans built for campaigns, not single videos.' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '10px', padding: '0.75rem 0.9rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 2px' }}>{f.title}</p>
                    <p style={{ fontSize: '0.78rem', color: '#6B6B76', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="mailto:tazabbas88@gmail.com" style={{ display: 'inline-block', background: '#1D9E75', color: 'white', padding: '0.6rem 1.4rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
              Talk to us
            </a>
          </div>

          {/* Creators — right */}
          <div>
            <DemoVideoBox label="A dubbed short, lip-synced perfectly" />
            <div style={{ display: 'inline-block', background: '#EAF7F1', color: '#1D9E75', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px' }}>For creators</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>From one video to a global audience</h2>
            <p style={{ color: '#6B6B76', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Connect, dub, publish back automatically.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '🔗', title: 'Connect your account', desc: 'Sign in with YouTube, TikTok, or Instagram and select any video.' },
                { icon: '📝', title: 'AI transcribes it', desc: 'Whisper AI converts your speech to text in 99 languages.' },
                { icon: '🌍', title: 'DeepL translates', desc: 'Translated into up to 50 languages with natural phrasing.' },
                { icon: '🎙', title: 'Your voice, dubbed', desc: 'ElevenLabs clones your voice, lip-synced to match.' },
                { icon: '📤', title: 'Auto-published', desc: 'The dubbed video is uploaded back to the platform it came from.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '10px', padding: '0.75rem 0.9rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ fontSize: '0.78rem', color: '#6B6B76', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3 — Pricing */}
      <section style={{ position: 'relative', padding: '4rem 2rem', textAlign: 'center', overflow: 'hidden' }}>
        <MatrixOverlay />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing for creators and businesses</h2>
          <p style={{ color: '#6B6B76', marginBottom: '2rem' }}>Start free. Scale as you grow.</p>
          <Link href="/pricing">
            <button style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600 }}>
              View pricing
            </button>
          </Link>
        </div>
      </section>

      {/* Platform names, repeated much bigger near the bottom */}
      <section style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#08110D' }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Works with the platforms you already publish to</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#FF3B3B' }}>YouTube</span>
          <span style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#FFFFFF' }}>TikTok</span>
          <span style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#F0709A' }}>Instagram</span>
          <span style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#5DCAA5' }}>Business Ads</span>
        </div>
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
