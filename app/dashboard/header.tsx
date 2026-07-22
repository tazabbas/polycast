'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/studio', label: 'Studio' },
  { href: '/dashboard/videos', label: 'My Videos' },
  { href: '/dashboard/voices', label: 'Voices' },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()

  function handleNavClick(e: MouseEvent, href: string) {
    e.preventDefault()
    if (typeof window !== 'undefined' && sessionStorage.getItem('polycast_unsaved_studio_work')) {
      const proceed = window.confirm('You have unsaved work in Studio. Leave anyway? It will be lost.')
      if (!proceed) {
        return
      }
      sessionStorage.removeItem('polycast_unsaved_studio_work')
    }
    router.push(href)
  }

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
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
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
      </nav>

      <div style={{ padding: '0.5rem' }}>
        <UserButton />
      </div>
    </div>
  )
}
