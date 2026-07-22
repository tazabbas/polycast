import DashboardHeader from './header'
import StudioKeepAlive from './StudioKeepAlive'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF' }}>
      <DashboardHeader />
      <div style={{ flex: 1, minWidth: 0 }}>
        <StudioKeepAlive>{children}</StudioKeepAlive>
      </div>
    </div>
  )
}
