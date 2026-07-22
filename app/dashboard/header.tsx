'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function DashboardHeader() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid #E5E5EA',
        background: '#FFFFFF',
        marginBottom: '0',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.15rem',
          fontWeight: 700,
          margin: 0,
          color: '#1D9E75',
        }}
      >
        PolyCast
      </h1>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/dashboard" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4A4A54', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Link href="/dashboard/transcribe" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4A4A54', textDecoration: 'none' }}>
          Dub a video
        </Link>
        <Link href="/dashboard/voices" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4A4A54', textDecoration: 'none' }}>
          Voices
        </Link>
        <UserButton />
      </nav>
    </div>
  )
}
