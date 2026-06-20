import { UserButton } from '@clerk/nextjs'

export default function Dashboard() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>PolyCast Dashboard</h1>
        <UserButton />
      </div>
      <p style={{ color: '#666' }}>Welcome! This is where you&apos;ll manage your videos and translations.</p>
    </main>
  );
}