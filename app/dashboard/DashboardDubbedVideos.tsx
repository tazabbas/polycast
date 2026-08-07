'use client'
import { useState, useEffect } from 'react'

interface SavedVideo {
  id: string
  type: string
  language: string
  video_url: string
  source_label: string | null
  created_at: string
  youtube_video_id?: string | null
  youtube_url?: string | null
  youtube_privacy_status?: string | null
}

export default function DashboardDubbedVideos() {
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState('')
  const [openPrivacyFor, setOpenPrivacyFor] = useState('')
  const [publishError, setPublishError] = useState('')

  useEffect(() => {
    fetch('/api/saved-videos')
      .then((r) => r.json())
      .then((data) => {
        if (data.videos) setVideos(data.videos)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handlePublish(video: SavedVideo, privacyStatus: string) {
    setPublishingId(video.id)
    setPublishError('')
    setOpenPrivacyFor('')
    try {
      const title = video.source_label || `${video.language} ${video.type === 'lipsync' ? 'Lip Synced' : 'Dubbed'} Video`
      const res = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          title,
          description: '',
          privacyStatus,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? { ...v, youtube_video_id: data.youtubeVideoId, youtube_url: data.youtubeUrl, youtube_privacy_status: privacyStatus }
              : v
          )
        )
      } else {
        setPublishError(data.error || 'Upload failed')
      }
    } catch {
      setPublishError('Failed to connect to YouTube')
    } finally {
      setPublishingId('')
    }
  }

  if (loading) {
    return <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Loading your dubbed videos...</p>
  }

  if (videos.length === 0) {
    return (
      <div style={{ border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>No dubbed videos yet. Click Edit on a video above, or upload one, to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {publishError && (
        <div style={{ background: 'rgba(240,168,140,0.12)', border: '1px solid rgba(240,168,140,0.4)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#F0A88C', fontSize: '0.85rem' }}>
          {publishError}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {videos.map((v) => (
          <div key={v.id} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
            <video controls src={v.video_url} style={{ width: '100%', display: 'block', background: '#000' }} />
            <div style={{ padding: '0.85rem 1rem' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                {v.language} · {v.type === 'lipsync' ? 'Lip synced' : 'Dubbed'}
              </p>

              {v.youtube_url ? (
                <a
                  href={v.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#FF6B6B', fontWeight: 600, textDecoration: 'none' }}
                >
                  ▶ View on YouTube ({v.youtube_privacy_status})
                </a>
              ) : openPrivacyFor === v.id ? (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['private', 'unlisted', 'public'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handlePublish(v, status)}
                      disabled={publishingId === v.id}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', cursor: publishingId === v.id ? 'not-allowed' : 'pointer', textTransform: 'capitalize' }}
                    >
                      {status}
                    </button>
                  ))}
                  <button
                    onClick={() => setOpenPrivacyFor('')}
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setOpenPrivacyFor(v.id)}
                  disabled={publishingId === v.id}
                  style={{ width: '100%', fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#FF3B3B', color: 'white', cursor: publishingId === v.id ? 'not-allowed' : 'pointer' }}
                >
                  {publishingId === v.id ? 'Publishing...' : 'Publish to YouTube'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
