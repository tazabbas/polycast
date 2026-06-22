import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardHeader from './header'
import Link from 'next/link'

interface VideoItem {
  id: string
  title: string
  thumbnail: string
}

interface PlaylistApiItem {
  snippet: {
    resourceId: { videoId: string }
    title: string
    thumbnails: {
      medium?: { url: string }
      default?: { url: string }
    }
  }
}

export default async function Dashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const client = await clerkClient()
  const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'google')
  const accessToken = tokenResponse.data[0]?.token

  let channelData: { title: string; thumbnail: string } | null = null
  let videos: VideoItem[] = []
  let errorMsg = null

  if (accessToken) {
    try {
      const channelRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const channelJson = await channelRes.json()

      if (channelJson.items && channelJson.items.length > 0) {
        const item = channelJson.items[0]
        channelData = {
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
        }

        const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads

        if (uploadsPlaylistId) {
          const videosRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=12&playlistId=${uploadsPlaylistId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          const videosJson = await videosRes.json()

          if (videosJson.items) {
            videos = videosJson.items.map((v: PlaylistApiItem) => ({
              id: v.snippet.resourceId.videoId,
              title: v.snippet.title,
              thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url || '',
            }))
          }
        }
      } else {
        errorMsg = 'No YouTube channel found on this Google account.'
      }
    } catch {
      errorMsg = 'Could not fetch YouTube channel data.'
    }
  } else {
    errorMsg = 'No Google access token found — try signing out and in again.'
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <DashboardHeader />

      {channelData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', maxWidth: '500px', marginBottom: '1.5rem' }}>
            <img src={channelData.thumbnail} alt="Channel avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Connected YouTube channel</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channelData.title}</p>
            </div>
          </div>

          <Link href="/dashboard/transcribe" style={{ display: 'inline-block', background: '#1D9E75', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Transcribe a video →
          </Link>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Your videos</h2>

          {videos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {videos.map((video) => (
                <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', background: '#fff', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <img src={video.thumbnail} alt={video.title} style={{ width: '100%', display: 'block' }} />
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{video.title}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No videos found on this channel yet.</p>
          )}
        </>
      ) : (
        <p style={{ color: '#c00' }}>{errorMsg}</p>
      )}
    </main>
  );
}