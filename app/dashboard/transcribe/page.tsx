'use client'

import { useState } from 'react'
import DashboardHeader from '../header'

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError('')
    setTranscript('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.transcript) {
        setTranscript(data.transcript)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to connect to transcription service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <DashboardHeader />

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Transcribe a video</h2>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Upload a video or audio file and we will convert the speech to text using AI.</p>

      <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', maxWidth: '560px', marginBottom: '1.5rem' }}>
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '1rem', display: 'block', fontSize: '0.9rem' }}
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ background: file && !loading ? '#1D9E75' : '#ccc', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: file && !loading ? 'pointer' : 'not-allowed' }}
        >
          {loading ? 'Transcribing...' : 'Transcribe'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>
      )}

      {transcript && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', maxWidth: '560px' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Transcript</p>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{transcript}</p>
        </div>
      )}
    </main>
  )
}