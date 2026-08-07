'use client'
import { useState, useEffect, useRef } from 'react'
import { upload } from '@vercel/blob/client'

interface Voice {
  id: string
  name: string
  created_at: string
  audio_sample_url: string | null
}

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [creatingLabel, setCreatingLabel] = useState('')
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload')
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState('')
  const [micError, setMicError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function loadVoices() {
    try {
      const res = await fetch('/api/voices')
      const data = await res.json()
      if (data.voices) setVoices(data.voices)
    } catch {
      // silently ignore, list stays empty
    }
    setLoadingList(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVoices()
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startRecording() {
    setMicError('')
    setRecordedBlob(null)
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl('')
    setRecordSeconds(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setIsRecording(true)
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1)
      }, 1000)
    } catch {
      setMicError('Could not access your microphone. Check your browser permissions and try again.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function discardRecording() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedBlob(null)
    setRecordedUrl('')
    setRecordSeconds(0)
  }

  async function handleDeleteVoice(id: string) {
    if (!window.confirm('Delete this voice? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/voices?id=${id}`, { method: 'DELETE' })
      setVoices((prev) => prev.filter((v) => v.id !== id))
    } catch {
      // leave it in the list if delete failed, user can retry
    } finally {
      setDeletingId('')
    }
  }

  async function handleCreateVoice() {
    const fileToUpload = inputMode === 'record' && recordedBlob
      ? new File([recordedBlob], `recording-${Date.now()}.webm`, { type: recordedBlob.type || 'audio/webm' })
      : file

    if (!name || !fileToUpload) return
    setCreating(true); setError('')
    try {
      setCreatingLabel('Uploading sample...')
      const blob = await upload(fileToUpload.name, fileToUpload, {
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
        discardRecording()
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

  const readyToSubmit = inputMode === 'upload' ? !!file : !!recordedBlob

  return (
    <main style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your voices</h2>
        <p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>
          Add a new voice by uploading or recording clear, consistent audio. For best quality, aim for 5-10 minutes of natural speech. Use these voices when dubbing your videos.
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

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => { setInputMode('upload'); discardRecording() }}
              style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: inputMode === 'upload' ? '1px solid #1D9E75' : '1px solid #D1D1D8', background: inputMode === 'upload' ? '#EAF7F1' : '#FFFFFF', color: inputMode === 'upload' ? '#1D9E75' : '#6B6B76' }}
            >
              Upload a file
            </button>
            <button
              onClick={() => { setInputMode('record'); setFile(null) }}
              style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: inputMode === 'record' ? '1px solid #1D9E75' : '1px solid #D1D1D8', background: inputMode === 'record' ? '#EAF7F1' : '#FFFFFF', color: inputMode === 'record' ? '#1D9E75' : '#6B6B76' }}
            >
              Record here
            </button>
          </div>

          {inputMode === 'upload' ? (
            <label style={{ display: 'block', border: '2px dashed #D1D1D8', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#FFFFFF', marginBottom: '1rem' }}>
              <input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1D9E75' }}>Click to choose an audio sample</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#9A9AA4' }}>{file ? file.name : '5-10 minutes of clear speech, no background noise'}</p>
            </label>
          ) : (
            <div style={{ border: '1px solid #E5E5EA', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', background: '#FFFFFF', marginBottom: '1rem' }}>
              {!recordedUrl ? (
                <>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Syne', sans-serif", color: isRecording ? '#B54A2B' : '#1A1A1A', marginBottom: '1rem' }}>
                    {isRecording && <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#B54A2B', marginRight: '10px', verticalAlign: 'middle' }} />}
                    {formatTime(recordSeconds)}
                  </div>
                  {!isRecording ? (
                    <button onClick={startRecording} style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                      ● Start recording
                    </button>
                  ) : (
                    <button onClick={stopRecording} style={{ background: '#B54A2B', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                      ■ Stop recording
                    </button>
                  )}
                  <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', color: '#9A9AA4' }}>
                    Speak naturally, vary your tone, in a quiet room. Aim for at least 5 minutes.
                  </p>
                  {micError && <p style={{ color: '#B54A2B', marginTop: '0.75rem', fontSize: '0.82rem' }}>{micError}</p>}
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#1A1A1A' }}>
                    Recorded {formatTime(recordSeconds)} — listen back below
                  </p>
                  <audio controls src={recordedUrl} style={{ width: '100%', marginBottom: '0.85rem' }} />
                  <button onClick={discardRecording} style={{ background: 'transparent', border: '1px solid #D1D1D8', color: '#6B6B76', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    Discard & re-record
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleCreateVoice}
            disabled={!name || !readyToSubmit || creating}
            style={{ background: name && readyToSubmit && !creating ? '#1D9E75' : '#D1D1D8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: name && readyToSubmit && !creating ? 'pointer' : 'not-allowed' }}
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
              <div key={v.id} style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: v.audio_sample_url ? '0.6rem' : '0.4rem' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>{v.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9A9AA4' }}>{new Date(v.created_at).toLocaleDateString()}</p>
                    <button
                      onClick={() => handleDeleteVoice(v.id)}
                      disabled={deletingId === v.id}
                      style={{ background: 'transparent', border: 'none', color: '#B54A2B', fontSize: '0.78rem', fontWeight: 600, cursor: deletingId === v.id ? 'not-allowed' : 'pointer', padding: '0.15rem' }}
                    >
                      {deletingId === v.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                {v.audio_sample_url ? (
                  <audio controls src={v.audio_sample_url} style={{ width: '100%', height: '32px' }} />
                ) : (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#9A9AA4' }}>No sample saved for this voice.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
