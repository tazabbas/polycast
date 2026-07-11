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
        borderBottom: '1px solid #26262F',
        background: '#101016',
        marginBottom: '0',
      }}
    >
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.15rem',
          fontWeight: 700,
          margin: 0,
          color: '#F2F2F5',
        }}
      >
        PolyCast
      </h1>
      <UserButton />
    </div>
  )
}
