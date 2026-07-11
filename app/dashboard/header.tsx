'use client'
import { UserButton } from '@clerk/nextjs'

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
      <UserButton />
    </div>
  )
}
