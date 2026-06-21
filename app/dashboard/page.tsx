import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardHeader from './header'

export default async function Dashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const client = await clerkClient()
  const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'google')
  const accessToken = tokenResponse.data[0]?.token

  let channelData = null
  let errorMsg = null

  if (accessToken) {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data = await res.json()

      if (data.items && data.items.length > 0) {
        channelData = {
          title: data.items[0].snippet.title,
          thumbnail: data.items[0].snippet.thumbnails.default.url,
        }
      } else {
        errorMsg = 'No YouTube channel found on this Google account.'
      }
    } catch (err) {
      errorMsg = 'Could not fetch YouTube channel data.'
    }
  } else {
    errorMsg = 'No Google access token found — try signing out and in again.'
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <DashboardHeader />

      {channelData ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', maxWidth: '500px' }}>
          <img src={channelData.thumbnail} alt="Channel avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Connected YouTube channel</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channelData.title}</p>
          </div>
        </div>
      ) : (
        <p style={{ color: '#c00' }}>{errorMsg}</p>
      )}
    </main>
  );
}