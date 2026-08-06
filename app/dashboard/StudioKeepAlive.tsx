'use client'
import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import DubVideo from './DubVideo'
export default function StudioKeepAlive({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudio = pathname === '/dashboard/studio'
  return (
    <>
      <div style={{ display: isStudio ? 'block' : 'none' }}>
        <Suspense fallback={null}>
          <DubVideo />
        </Suspense>
      </div>
      <div style={{ display: isStudio ? 'none' : 'block' }}>
        {children}
      </div>
    </>
  )
}
