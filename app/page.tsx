import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>PolyCast</span>
        <div>
          <Show when="signed-out">
            <SignInButton mode="modal" />
            <span style={{ marginLeft: '1rem' }}>
              <SignUpButton mode="modal" />
            </span>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', maxWidth: '700px' }}>
        Break the language barrier on YouTube
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '500px', marginBottom: '2rem' }}>
        Stream and watch any video in your language with the creator&apos;s own cloned voice.
      </p>
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <button style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '0.875rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            Get started
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard">
          <button style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '0.875rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            Go to dashboard
          </button>
        </Link>
      </Show>
    </main>
  );
}