'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ALWAYS_AVAILABLE = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
]

const GATED_ITEMS = [
  { href: '/dashboard/studio', label: 'Studio' },
  { href: '/dashboard/videos', label: 'My Videos' },
  { href: '/dashboard/voices', label: 'Voices' },
  { href: '/dashboard/bin', label: 'Bin' },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [plan, setPlan] = useState<string | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user-plan').then((r) => r.json()).then((data) => {
      setPlan(data.plan || null)
    }).catch(() => setPlan(null)).finally(() => setPlanLoading(false))
  }, [])

  const hasPlan = !planLoading && plan !== null

  return (
    <div
      style={{
        width: '220px',
        flexShrink: 0,
        minHeight: '100vh',
        background: '#F7F7F8',
        borderRight: '1px solid #E5E5EA',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
      }}
    >
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.15rem',
          fontWeight: 700,
          margin: '0 0 2rem',
          padding: '0 0.5rem',
          color: '#1D9E75',
        }}
      >
        PolyCast
      </h1>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {ALWAYS_AVAILABLE.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: active ? '#1D9E75' : '#4A4A54',
                background: active ? '#EAF7F1' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          )
        })}

        <div style={{ height: '1px', background: '#E5E5EA', margin: '0.5rem 0.5rem' }} />

        {GATED_ITEMS.map((item) => {
          const active = pathname === item.href
          if (hasPlan) {
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? '#1D9E75' : '#4A4A54',
                  background: active ? '#EAF7F1' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            )
          }
          return (
            <button
              key={item.href}
              onClick={() => router.push('/dashboard#choose-plan')}
              title="Choose a plan to unlock this"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                color: '#B0B0B8',
                cursor: 'pointer',
              }}
            >
              🔒 {item.label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '0.5rem' }}>
        <UserButton />
      </div>
    </div>
  )
}
