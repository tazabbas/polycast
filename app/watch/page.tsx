'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'ES-419', name: 'Spanish (Latin America)' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'PT-PT', name: 'Portuguese (Portugal)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' },{ code: 'NL', name: 'Dutch' },{ code: 'PL', name: 'Polish' },{ code: 'SV', name: 'Swedish' },{ code: 'DA', name: 'Danish' },{ code: 'FI', name: 'Finnish' },{ code: 'NB', name: 'Norwegian' },{ code: 'EL', name: 'Greek' },{ code: 'CS', name: 'Czech' },{ code: 'SK', name: 'Slovak' },{ code: 'RO', name: 'Romanian' },{ code: 'HU', name: 'Hungarian' },{ code: 'BG', name: 'Bulgarian' },{ code: 'UK', name: 'Ukrainian' },{ code: 'ID', name: 'Indonesian' },{ code: 'VI', name: 'Vietnamese' },{ code: 'TH', name: 'Thai' },{ code: 'HE', name: 'Hebrew' },{ code: 'ET', name: 'Estonian' },{ code: 'LV', name: 'Latvian' },{ code: 'LT', name: 'Lithuanian' },{ code: 'SL', name: 'Slovenian' }]
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}
export default function WatchPage() {
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('ES')
  const [status, setStatus] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [error, setError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  async function handleWatch() {
    const id = getYouTubeId(url)
    if (!id) { setError('Please enter a valid YouTube URL'); return }
    setVideoId(id)
    setError('')
    setAudioUrl('')
    setStatus('Fetching transcript...')
    try {
      const transcriptRes = await fetch(`/api/youtube-transcript?videoId=${id}`)
      const transcriptData = await transcriptRes.json()
      if (!transcriptData.transcript) { setError('Could not fetch transcript for this video'); setStatus(''); return }
      setStatus('Translating...')
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcriptData.transcript, target_language: selectedLanguage, transcription_id: null })
      })
      const translateData = await translateRes.json()
      if (!translateData.translated_text) { setError('Translation failed'); setStatus(''); return }
      setStatus('Generating dubbed audio...')
      const synthesizeRes = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translateData.translated_text })
      })
      const synthesizeData = await synthesizeRes.json()
      if (synthesizeRes.ok && synthesizeData.url) {
        setAudioUrl(synthesizeData.url)
        setStatus('Ready')
        setTimeout(() => { audioRef.current?.play() }, 500)
      } else { setError('Voice synthesis failed'); setStatus('') }
    } catch { setError('Something went wrong'); setStatus('') }
  }
  return (
    <main style={{ fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #E5E5EA' }}>
        <Link href="/" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1D9E75', textDecoration: 'none' }}>PolyCast</Link>
        <Link href="/" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4A4A54', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Watch in any language</h1>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Paste a YouTube URL and choose your language to hear the video dubbed in that language.</p>
      <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <input type="text" placeholder="Paste YouTube URL here..." value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', marginBottom: '1rem', display: 'block', width: '100%', maxWidth: '300px' }}>
          {LANGUAGES.map((lang) => (<option key={lang.code} value={lang.code}>{lang.name}</option>))}
        </select>
        <button onClick={handleWatch} disabled={!url || (!!status && status !== 'Ready')} style={{ background: url && (!status || status === 'Ready') ? '#1D9E75' : '#ccc', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' }}>
          {status && status !== 'Ready' ? status : 'Watch in my language'}
        </button>
      </div>
      {error && <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>}
      {videoId && (
        <div style={{ marginBottom: '1.5rem' }}>
          <iframe width="100%" height="400" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: '12px' }} />
        </div>
      )}
      {audioUrl && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Dubbed audio — {LANGUAGES.find(l => l.code === selectedLanguage)?.name}</p>
          <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.75rem' }}>Play the dubbed audio while watching the video above (video is muted)</p>
          <audio ref={audioRef} controls src={audioUrl} style={{ width: '100%' }} />
        </div>
      )}
      </div>
    </main>
  )
}
