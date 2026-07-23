'use client'
import { useState, useEffect } from 'react'

interface SavedVideo {
  id: string
  type: string
  language: string
  video_url: string
  source_label: string | null
}

interface Voice {
  id: string
  name: string
  audio_sample_url: string | null
}

export default function BinPage() {
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    loadTrash()
  }, [])

  async function loadTrash() {
    try {
      const [videosRes, voicesRes] = await Promise.all([
        fetch('/api/saved-videos?trash=true'),
        fetch('/api/voices?trash=true'),
      ])
      const videosData = await videosRes.json()
      const voicesData = await voicesRes.json()
      if (videosData.videos) setVideos(videosData.videos)
      if (voicesData.voices) setVoices(voicesData.voices)
    } catch {
      // leave lists empty on failure
    }
    setLoading(false)
  }

  async function restoreVideo(id: string) {
    setBusyId(id)
    await fetch(`/api/saved-videos?id=${id}`, { method: 'PATCH' })
    setVideos((prev) => prev.filter((v) => v.id !== id))
    setBusyId('')
  }

  async function deleteVideoForever(id: string) {
    if (!window.confirm('Permanently delete this video? This cannot be undone.')) return
    setBusyId(id)
    await fetch(`/api/saved-videos?id=${id}&permanent=true`, { method: 'DELETE' })
    setVideos((prev) => prev.filter((v) => v.id !== id))
    setBusyId('')
  }

  async function restoreVoice(id: string) {
    setBusyId(id)
    await fetch(`/api/voices?id=${id}`, { method: 'PATCH' })
    setVoices((prev) => prev.filter((v) => v.id !== id))
    setBusyId('')
  }

  async function deleteVoiceForever(id: string) {
    if (!window.confirm('Permanently delete this voice? This cannot be undone.')) return
    setBusyId(id)
    await fetch(`/api/voices?id=${id}&permanent=true`, { method: 'DELETE' })
    setVoices((prev) => prev.filter((v) => v.id !== id))
    setBusyId('')
  }

  return (
    <main style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bin</h2>
        <p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>
          Deleted videos and voices land here. Restore them, or delete permanently.
        </p>

        {loading ? (
          <p style={{ fontSize: '0.85rem', color: '#6B6B76' }}>Loading...</p>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1A1A1A' }}>Videos</h3>
            {videos.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9A9AA4', marginBottom: '2rem' }}>No deleted videos.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {videos.map((v) => (
                  <div key={v.id} style={{ border: '1px solid #E5E5EA', borderRadius: '12px', overflow: 'hidden', background: '#F7F7F8' }}>
                    <video controls src={v.video_url} style={{ width: '100%', display: 'block', background: '#000' }} />
                    <div style={{ padding: '0.85rem 1rem' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A' }}>
                        {v.language} · {v.type === 'lipsync' ? 'Lip synced' : 'Dubbed'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => restoreVideo(v.id)} disabled={busyId === v.id} style={{ background: 'transparent', border: 'none', color: '#1D9E75', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Restore</button>
                        <button onClick={() => deleteVideoForever(v.id)} disabled={busyId === v.id} style={{ background: 'transparent', border: 'none', color: '#B54A2B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Delete forever</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1A1A1A' }}>Voices</h3>
            {voices.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9A9AA4' }}>No deleted voices.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {voices.map((v) => (
                  <div key={v.id} style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>{v.name}</p>
                    {v.audio_sample_url && <audio controls src={v.audio_sample_url} style={{ width: '100%', height: '32px', marginBottom: '0.6rem' }} />}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => restoreVoice(v.id)} disabled={busyId === v.id} style={{ background: 'transparent', border: 'none', color: '#1D9E75', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Restore</button>
                      <button onClick={() => deleteVoiceForever(v.id)} disabled={busyId === v.id} style={{ background: 'transparent', border: 'none', color: '#B54A2B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Delete forever</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
