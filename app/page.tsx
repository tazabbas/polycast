import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FFFFFF', minHeight: '100vh', color: '#1A1A1A' }}>

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

      <div style={{ background: '#F7F7F8', borderBottom: '1px solid #E5E5EA', padding: '0.6rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
        <span style={{ fontSize: '12px', color: '#8A8A94', marginRight: '0.5rem', whiteSpace: 'nowrap' }}>Creators from:</span>
        {[
          { flag: '🇸🇦', label: 'Arabic' },
          { flag: '🇨🇳', label: 'Chinese' },
          { flag: '🇮🇳', label: 'Hindi' },
          { flag: '🇰🇷', label: 'Korean' },
          { flag: '🇯🇵', label: 'Japanese' },
          { flag: '🇪🇸', label: 'Spanish' },
          { flag: '🇫🇷', label: 'French' },
          { flag: '🇹🇷', label: 'Turkish' },
          { flag: '🇷🇺', label: 'Russian' },
          { flag: '🇧🇷', label: 'Portuguese' },
        ].map(l => (
          <span key={l.label} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', border: '1px solid #E5E5EA', color: '#6B6B76', whiteSpace: 'nowrap', background: '#FFFFFF' }}>
            {l.flag} {l.label}
          </span>
        ))}
        <span style={{ fontSize: '11px', color: '#9A9AA4', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>+ 40 more</span>
      </div>

      <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#EAF7F1', border: '1px solid #1D9E75', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#1D9E75', marginBottom: '1.5rem', fontWeight: 500 }}>
          🌍 Now supporting 50+ languages
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          <span style={{ display: 'block', color: '#1A1A1A' }}>Your voice.</span>
          <span style={{ display: 'block', color: '#1A1A1A' }}>Every language.</span>
          <span style={{ display: 'block', color: '#1D9E75' }}>Zero effort.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#6B6B76', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          PolyCast uses AI to transcribe, translate, and dub your YouTube videos in your own cloned voice — automatically uploaded back to your channel in every language you choose.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.3)' }}>
                <span style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>▶</span>
                Start dubbing for free
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 40px rgba(29,158,117,0.3)' }}>
                <span style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>▶</span>
                Go to dashboard
              </button>
            </Link>
          </Show>
          <Link href="/watch">
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#4A4A54', border: '1px solid #D1D1D8', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer' }}>
              Watch a demo
            </button>
          </Link>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#8A8A94' }}>No credit card required · Free to start · Cancel anytime</p>
      </section>

      <div style={{ background: '#F7F7F8', borderTop: '1px solid #E5E5EA', borderBottom: '1px solid #E5E5EA', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { flag: '🇸🇦', lang: 'Arabic', speakers: '400M+' },
            { flag: '🇨🇳', lang: 'Mandarin', speakers: '1.1B+' },
            { flag: '🇮🇳', lang: 'Hindi', speakers: '600M+' },
            { flag: '🇰🇷', lang: 'Korean', speakers: '80M+' },
            { flag: '🇯🇵', lang: 'Japanese', speakers: '125M+' },
            { flag: '🇪🇸', lang: 'Spanish', speakers: '500M+' },
          ].map(m => (
            <div key={m.lang}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{m.flag}</div>
              <div style={{ fontSize: '0.85rem', color: '#6B6B76' }}>{m.lang}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1D9E75' }}>{m.speakers}</div>
              <div style={{ fontSize: '11px', color: '#9A9AA4' }}>speakers</div>
            </div>
          ))}
        </div>
      </div>

      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>How PolyCast works</h2>
        <p style={{ textAlign: 'center', color: '#6B6B76', marginBottom: '3rem' }}>From one video to a global audience in minutes</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🎥', title: 'Upload your video', desc: 'Connect your YouTube channel and select any video to translate.' },
            { icon: '📝', title: 'AI transcribes it', desc: 'Whisper AI converts your speech to text in 99 languages with near-perfect accuracy.' },
            { icon: '🌍', title: 'DeepL translates', desc: 'Your transcript is translated into up to 50 languages with natural phrasing.' },
            { icon: '🎙', title: 'Your voice, dubbed', desc: 'ElevenLabs clones your voice and speaks the translation — it sounds like you.' },
            { icon: '📤', title: 'Auto-uploaded', desc: 'The dubbed video is automatically uploaded back to your YouTube channel.' },
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

      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>Why creators choose PolyCast</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🎙', title: 'Voice cloning', desc: 'Your audience hears you — not a robot. PolyCast clones your exact voice, tone, and personality.' },
            { icon: '⚡', title: 'Fully automated', desc: 'Upload once, get dubbed videos in every language automatically uploaded to your channel.' },
            { icon: '🌍', title: '50+ languages', desc: 'Reach Arabic, Hindi, Chinese, Korean, Japanese, Spanish speakers — and 45 more markets.' },
            { icon: '📊', title: 'Growth analytics', desc: 'See exactly which languages are driving new subscribers and watch time.' },
            { icon: '🔒', title: 'You own your voice', desc: 'Your voice model belongs to you. Enable or disable languages anytime. Delete anytime.' },
            { icon: '💰', title: 'Grow your revenue', desc: 'More views in more markets means more ad revenue, sponsorships, and subscribers.' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B6B76', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Simple pricing</h2>
        <p style={{ color: '#6B6B76', marginBottom: '3rem' }}>Start free. Scale as you grow.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { name: 'Starter', price: 'Free', desc: 'Perfect to try PolyCast', features: ['3 languages', '30 mins/month', 'Generic TTS voice', 'Basic analytics'], highlight: false },
            { name: 'Creator', price: '£29/mo', desc: 'For growing channels', features: ['15 languages', '10 hours/month', 'Voice cloning included', 'Audience dashboard', 'No watermark'], highlight: true },
            { name: 'Pro', price: '£149/mo', desc: 'For serious creators', features: ['50+ languages', 'Unlimited audio', 'Live stream translation', 'Priority support'], highlight: false },
          ].map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? '#EAF7F1' : '#F7F7F8', border: `1px solid ${plan.highlight ? '#1D9E75' : '#E5E5EA'}`, borderRadius: '16px', padding: '1.75rem', position: 'relative' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px' }}>MOST POPULAR</div>}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: plan.highlight ? '#1D9E75' : '#1A1A1A', margin: '0.5rem 0' }}>{plan.price}</div>
              <p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.85rem', color: '#4A4A54', padding: '4px 0', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#1D9E75' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" style={{ display: 'block', background: plan.highlight ? '#1D9E75' : 'transparent', color: plan.highlight ? 'white' : '#4A4A54', border: plan.highlight ? 'none' : '1px solid #D1D1D8', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', fontWeight: plan.highlight ? 600 : 400 }}>
                {plan.name === 'Starter' ? 'Get started free' : plan.name === 'Creator' ? 'Subscribe now' : 'Contact us'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#EAF7F1', border: '1px solid #1D9E75', borderRadius: '24px', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to go global?</h2>
          <p style={{ color: '#4A4A54', marginBottom: '2rem', lineHeight: 1.7 }}>Join creators worldwide reaching new audiences in every language — in their own voice.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600 }}>
                  <span>▶</span> Start for free
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1D9E75', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600 }}>
                  <span>▶</span> Go to dashboard
                </button>
              </Link>
            </Show>
            <Link href="/pricing">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#4A4A54', border: '1px solid #D1D1D8', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.05rem', cursor: 'pointer' }}>
                View pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #E5E5EA', padding: '2rem', textAlign: 'center', color: '#9A9AA4', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ color: '#6B6B76', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/watch" style={{ color: '#6B6B76', textDecoration: 'none' }}>Watch demo</Link>
          <Link href="/dashboard" style={{ color: '#6B6B76', textDecoration: 'none' }}>Dashboard</Link>
          <a href="mailto:hello@polycast.ai" style={{ color: '#6B6B76', textDecoration: 'none' }}>Contact</a>
        </div>
        <p>© 2026 PolyCast. Built for creators, by creators.</p>
      </footer>

    </main>
  )
}
