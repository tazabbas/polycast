'use client'
import { useState, useEffect } from 'react'
import { upload } from '@vercel/blob/client'
import DashboardHeader from '../header'

interface Voice {
  id: string
  name: string
  created_at: string
}

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [creatingLabel, setCreatingLabel] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadVoices()
  }, [])

  async function loadVoices() {
    setLoadingList(true)
    try {
      const res = await fetch('/api/voices')
      const data = await res.json()
      if (data.voices) setVoices(data.voices)
    } catch {
      // silently ignore, list stays empty
    }
    setLoadingList(false)
  }

  async function handleCreateVoice() {
    if (!name || !file) return
    setCreating(true); setError('')
    try {
      setCreatingLabel('Uploading sample...')
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      })

      setCreatingLabel('Creating voice clone...')
      const res = await fetch('/api/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: blob.url, name }),
      })
      const data = await res.json()
      if (res.ok && data.id) {
        setName('')
        setFile(null)
        await loadVoices()
      } else {
        setError(data.error || 'Failed to create voice')
      }
    } catch {
      setError('Failed to upload or create voice')
    } finally {
      setCreating(false); setCreatingLabel('')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
      <DashboardHeader />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your voices</h2>
        <p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>
          Add a new voice by uploading 1-2 minutes of clear, consistent audio. Use these voices when dubbing your videos.
        </p>

        <div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1A1A1A' }}>Add a new voice</p>
          <input
            type="text"
            placeholder="Voice name (e.g. My voice)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.9rem', marginBottom: '1rem', display: 'block', width: '100%', color: '#1A1A1A', background: '#FFFFFF' }}
          />
          <label style={{ display: 'block', border: '2px dashed #D1D1D8', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#FFFFFF', marginBottom: '1rem' }}>
            <input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1D9E75' }}>Click to choose an audio sample</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#9A9AA4' }}>{file ? file.name : '1-2 minutes of clear speech, no background noise'}</p>
          </label>
          <button
            onClick={handleCreateVoice}
            disabled={!name || !file || creating}
            style={{ background: name && file && !creating ? '#1D9E75' : '#D1D1D8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: name && file && !creating ? 'pointer' : 'not-allowed' }}
          >
            {creating ? (creatingLabel || 'Working...') : 'Create voice'}
          </button>
          {error && <p style={{ color: '#B54A2B', marginTop: '0.75rem', fontSize: '0.85rem' }}>{error}</p>}
        </div>

        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1A1A1A' }}>My voices</h3>

        {loadingList ? (
          <p style={{ fontSize: '0.85rem', color: '#6B6B76' }}>Loading...</p>
        ) : voices.length === 0 ? (
          <div style={{ border: '1px dashed #D1D1D8', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#6B6B76' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No voices yet. Add one above to use it when dubbing videos.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {voices.map((v) => (
              <div key={v.id} style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>{v.name}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9A9AA4' }}>{new Date(v.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
