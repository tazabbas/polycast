'use client'
import { useState, useEffect } from 'react'

interface SavedVideo {
  id: string
  type: string
  language: string
  video_url: string
  source_label: string | null
  created_at: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    loadVideos()
  }, [])

  function loadVideos() {
    setLoading(true)
    fetch('/api/saved-videos')
      .then((r) => r.json())
      .then((data) => {
        if (data.videos) setVideos(data.videos)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this video? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/saved-videos?id=${id}`, { method: 'DELETE' })
      setVideos((prev) => prev.filter((v) => v.id !== id))
    } catch {
      // leave it in the list if delete failed, user can retry
    } finally {
      setDeletingId('')
    }
  }

  return (
    <main style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Videos</h2>
        <p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>
          Every dubbed and lip-synced video you have saved, ready to download or share.
        </p>

        {loading ? (
          <p style={{ fontSize: '0.85rem', color: '#6B6B76' }}>Loading...</p>
        ) : videos.length === 0 ? (
          <div style={{ border: '1px dashed #D1D1D8', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#6B6B76' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No saved videos yet. Dub a video and save it to see it here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {videos.map((v) => (
              <div key={v.id} style={{ border: '1px solid #E5E5EA', borderRadius: '12px', overflow: 'hidden', background: '#F7F7F8' }}>
                <video controls src={v.video_url} style={{ width: '100%', display: 'block', background: '#000' }} />
                <div style={{ padding: '0.85rem 1rem' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A' }}>
                    {v.language} · {v.type === 'lipsync' ? 'Lip synced' : 'Dubbed'}
                  </p>
                  {v.source_label && (
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#9A9AA4' }}>{v.source_label}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                      href={v.video_url}
                      download={`polycast-${v.language}-${v.id}.mp4`}
                      style={{ fontSize: '0.8rem', color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Download →
                    </a>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      style={{ background: 'transparent', border: 'none', color: '#B54A2B', fontSize: '0.8rem', fontWeight: 600, cursor: deletingId === v.id ? 'not-allowed' : 'pointer', padding: '0.25rem' }}
                    >
                      {deletingId === v.id ? 'Deleting...' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
