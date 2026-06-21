'use client'

import { UserButton } from '@clerk/nextjs'

export default function DashboardHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>PolyCast Dashboard</h1>
      <UserButton />
    </div>
  )
}