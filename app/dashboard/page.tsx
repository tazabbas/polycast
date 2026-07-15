import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
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

  let plan = 'free'
  let minutesBalance = 0
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: credits } = await supabase
      .from('user_credits')
      .select('plan, minutes_balance')
      .eq('user_id', userId)
      .single()

    if (credits) {
      plan = credits.plan
      minutesBalance = credits.minutes_balance
    }
  } catch {
    // Defaults to free/0 if lookup fails
  }

  const planLabel = plan === 'creator' ? 'Creator' : plan === 'studio' ? 'Studio' : 'Free'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        color: '#1A1A1A',
        fontFamily: "'DM Sans', sans-serif",
        padding: '0 0 4rem',
      }}
    >
      <DashboardHeader />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 0' }}>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.8rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            marginBottom: '1.75rem',
            color: '#1A1A1A',
          }}
        >
          Dashboard
        </h1>

        {channelData ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 1.1fr) repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: '#F0FAF6',
                  border: '1px solid #1D9E75',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '14px',
                }}
              >
                <img
                  src={channelData.thumbnail}
                  alt="Channel avatar"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    border: '2px solid #1D9E75',
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.78rem', color: '#1D9E75', margin: 0, letterSpacing: '0.02em' }}>
                    Connected channel
                  </p>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: "'Syne', sans-serif",
                      color: '#1A1A1A',
                    }}
                  >
                    {channelData.title}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: '#F7F7F8',
                  border: '1px solid #E5E5EA',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p style={{ fontSize: '0.78rem', color: '#6B6B76', margin: '0 0 6px' }}>Videos synced</p>
                <p
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    margin: 0,
                    fontFamily: "'Syne', sans-serif",
                    color: '#1D9E75',
                  }}
                >
                  {videos.length}
                </p>
              </div>

              <div
                style={{
                  background: '#F7F7F8',
                  border: '1px solid #E5E5EA',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p style={{ fontSize: '0.78rem', color: '#6B6B76', margin: '0 0 6px' }}>Current plan</p>
                <p
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    margin: '0 0 6px',
                    fontFamily: "'Syne', sans-serif",
                    color: '#1A1A1A',
                  }}
                >
                  {planLabel}
                </p>
                <Link
                  href="/pricing"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1D9E75',
                    textDecoration: 'none',
                  }}
                >
                  {plan === 'free' ? 'Upgrade to Pro →' : 'Manage plan →'}
                </Link>
              </div>
            </div>

            <div
              style={{
                background: '#F7F7F8',
                border: '1px solid #E5E5EA',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.6rem',
                }}
              >
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#1A1A1A' }}>
                  Lip sync credits
                </p>
                <p style={{ fontSize: '0.8rem', margin: 0, color: '#6B6B76' }}>
                  {minutesBalance} mins remaining
                </p>
              </div>
              {minutesBalance === 0 && (
                <Link
                  href="/pricing"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1D9E75',
                    textDecoration: 'none',
                  }}
                >
                  Buy lip sync credits →
                </Link>
              )}
            </div>

            <Link
              href="/dashboard/transcribe"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1D9E75',
                color: 'white',
                padding: '0.9rem 1.75rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                marginBottom: '2.5rem',
                boxShadow: '0 4px 20px rgba(29, 158, 117, 0.2)',
              }}
            >
              Transcribe a video →
            </Link>

            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.1rem',
                color: '#1A1A1A',
              }}
            >
              Your videos
            </h2>

            {videos.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {videos.map((video) => (
                  <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer"
                    style={{
                      border: '1px solid #E5E5EA',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                    }}
                    className="polycast-video-card"
                  >
                    <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{ padding: '0.85rem 1rem' }}>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          margin: 0,
                          lineHeight: 1.4,
                          color: '#1A1A1A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {video.title}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div
                style={{
                  border: '1px dashed #D1D1D8',
                  borderRadius: '12px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: '#6B6B76',
                }}
              >
                <p style={{ margin: 0 }}>No videos found on this channel yet.</p>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              border: '1px solid #F0C4B4',
              background: '#FDF2EE',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#B54A2B',
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>

      <style>{`
        .polycast-video-card:hover {
          transform: translateY(-3px);
          border-color: #1D9E75 !important;
        }
      `}</style>
    </main>
  );
}
