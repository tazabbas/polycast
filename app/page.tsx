import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.svg" alt="PolyCast logo" style={{ width: '36px', height: '36px' }} />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>PolyCast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
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

      <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#1a2e1a', border: '1px solid #1D9E75', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#1D9E75', marginBottom: '1.5rem', fontWeight: 500 }}>
          🌍 Now supporting 50+ languages
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #999 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your voice.<br />Every language.<br />
          <span style={{ background: 'linear-gradient(135deg, #1D9E75, #0fd494)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero effort.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          PolyCast uses AI to transcribe, translate, and dub your YouTube videos in your own cloned voice — automatically uploaded back to your channel in every language you choose.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.4)' }}>
                <span style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>▶</span>
                Start dubbing for free
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.4)' }}>
                <span style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>▶</span>
                Go to dashboard
              </button>
            </Link>
          </Show>
          <Link href="/watch">
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#ccc', border: '1px solid #333', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer' }}>
              Watch a demo
            </button>
          </Link>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#555' }}>No credit card required · Free to start · Cancel anytime</p>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>How PolyCast works</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem', fontSize: '1rem' }}>From one video to a global audience in minutes</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { step: '1', icon: '🎥', title: 'Upload your video', desc: 'Connect your YouTube channel and select any video you want to translate.' },
            { step: '2', icon: '📝', title: 'AI transcribes it', desc: 'Whisper AI converts your speech to text with near-perfect accuracy.' },
            { step: '3', icon: '🌍', title: 'DeepL translates', desc: 'Your transcript is translated into up to 50 languages with natural phrasing.' },
            { step: '4', icon: '🎙', title: 'Your voice, dubbed', desc: 'ElevenLabs clones your voice and speaks the translation — it sounds like you.' },
            { step: '5', icon: '📤', title: 'Auto-uploaded', desc: 'The dubbed video is automatically uploaded to your YouTube channel.' },
          ].map((item) => (
            <div key={item.step} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontSize: '11px', color: '#1D9E75', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Step {item.step}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>Why creators choose PolyCast</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🎙', title: 'Voice cloning', desc: 'Your audience hears you — not a generic robot voice. PolyCast clones your exact voice, tone, and personality.' },
            { icon: '⚡', title: 'Fully automated', desc: 'Upload once, get dubbed videos in every language automatically uploaded back to your channel.' },
            { icon: '🌍', title: '50+ languages', desc: 'Reach Spanish, Hindi, Arabic, Chinese, French, Portuguese speakers — and 45 more language markets.' },
            { icon: '📊', title: 'Growth analytics', desc: 'See exactly which languages are driving new subscribers and watch time across every market.' },
            { icon: '🔒', title: 'You own your voice', desc: 'Your voice model belongs to you. Enable or disable languages anytime. Delete your data anytime.' },
            { icon: '💰', title: 'Grow your revenue', desc: 'More views in more markets means more ad revenue, sponsorships, and subscribers — on autopilot.' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing</h2>
        <p style={{ color: '#666', marginBottom: '3rem' }}>Start free. Scale as you grow.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Starter', price: 'Free', desc: 'Perfect to try PolyCast', features: ['3 languages', '30 mins/month', 'Generic TTS voice', 'Basic analytics'], highlight: false },
            { name: 'Creator', price: '£29/mo', desc: 'For growing channels', features: ['15 languages', '10 hours/month', 'Voice cloning included', 'Audience dashboard', 'No watermark'], highlight: true },
            { name: 'Pro', price: '£149/mo', desc: 'For serious creators', features: ['50+ languages', 'Unlimited audio', 'Live stream translation', 'Priority support'], highlight: false },
          ].map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? '#0d2e1e' : '#111', border: `1px solid ${plan.highlight ? '#1D9E75' : '#1a1a1a'}`, borderRadius: '16px', padding: '1.75rem', position: 'relative' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px' }}>MOST POPULAR</div>}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: plan.highlight ? '#1D9E75' : 'white', margin: '0.5rem 0' }}>{plan.price}</div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.25rem' }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.85rem', color: '#999', padding: '4px 0', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#1D9E75' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, #0d2e1e, #111)', border: '1px solid #1D9E75', borderRadius: '24px', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to go global?</h2>
          <p style={{ color: '#888', marginBottom: '2rem', lineHeight: 1.7 }}>Join thousands of creators already reaching new audiences in every language — in their own voice.</p>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600 }}>
                <span>▶</span> Start for free today
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600 }}>
                <span>▶</span> Go to dashboard
              </button>
            </Link>
          </Show>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '2rem', textAlign: 'center', color: '#444', fontSize: '0.85rem' }}>
        <p>© 2026 PolyCast. Built for creators, by creators.</p>
      </footer>

    </main>
  )
}
