'use client'
import { useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'
import DashboardHeader from '../header'
const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' }]

export default function TranscribePage() {
const [mode, setMode] = useState<'upload' | 'youtube'>('upload')

const [file, setFile] = useState<File | null>(null)
const [youtubeUrl, setYoutubeUrl] = useState('')
const [rightsConfirmed, setRightsConfirmed] = useState(false)

const [videoUrl, setVideoUrl] = useState('')
const [videoLabel, setVideoLabel] = useState('')
const [isVideoSource, setIsVideoSource] = useState(true)

const [transcript, setTranscript] = useState('')
const [transcriptionId, setTranscriptionId] = useState('')
const [selectedLanguage, setSelectedLanguage] = useState('ES')
const [translatedText, setTranslatedText] = useState('')
const [audioUrl, setAudioUrl] = useState('')
const [loading, setLoading] = useState(false)
const [loadingLabel, setLoadingLabel] = useState('')
const [translating, setTranslating] = useState(false)
const [synthesizing, setSynthesizing] = useState(false)
const [error, setError] = useState('')
const audioRef = useRef<HTMLAudioElement>(null)

const [lipSyncing, setLipSyncing] = useState(false)
const [lipSyncStatus, setLipSyncStatus] = useState('')
const [lipSyncVideoUrl, setLipSyncVideoUrl] = useState('')
const [lipSyncError, setLipSyncError] = useState('')

function resetAll() {
setVideoUrl(''); setVideoLabel('')
setTranscript(''); setTranslatedText(''); setAudioUrl('')
setLipSyncVideoUrl(''); setLipSyncError(''); setLipSyncStatus('')
setError('')
}

async function handleUploadFile() {
if (!file) return
setLoading(true); setError(''); resetAll()
try {
setLoadingLabel('Uploading...')
const blob = await upload(file.name, file, {
access: 'public',
handleUploadUrl: '/api/blob-upload',
})
setVideoUrl(blob.url)
setVideoLabel(file.name)
setIsVideoSource(file.type.startsWith('video/'))

await runTranscription(blob.url, file.name)
} catch {
setError('Failed to upload or transcribe the file')
setLoading(false); setLoadingLabel('')
}
}

async function handleFetchYoutube() {
if (!youtubeUrl || !rightsConfirmed) return
setLoading(true); setError(''); resetAll()
try {
setLoadingLabel('Fetching video...')
const fetchRes = await fetch('/api/youtube-fetch', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ youtubeUrl }),
})
const fetchData = await fetchRes.json()
if (!fetchRes.ok || !fetchData.videoUrl) {
setError(fetchData.error || 'Could not fetch that video')
setLoading(false); setLoadingLabel('')
return
}
setVideoUrl(fetchData.videoUrl)
setVideoLabel(fetchData.title || 'YouTube video')
setIsVideoSource(true)

await runTranscription(fetchData.videoUrl, fetchData.title || 'youtube-video')
} catch {
setError('Failed to fetch or transcribe that video')
setLoading(false); setLoadingLabel('')
}
}

async function runTranscription(url: string, label: string) {
setLoadingLabel('Transcribing...')
const res = await fetch('/api/transcribe', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ videoUrl: url }),
})
const data = await res.json()
if (data.transcript) {
setTranscript(data.transcript)
const saveRes = await fetch('/api/transcriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_name: label, transcript: data.transcript }) })
const saveData = await saveRes.json()
if (saveData.transcription?.id) setTranscriptionId(saveData.transcription.id)
} else {
setError(data.error || 'Something went wrong')
}
setLoading(false); setLoadingLabel('')
}

async function handleTranslate() {
if (!transcript || !selectedLanguage) return
setTranslating(true); setError(''); setTranslatedText(''); setAudioUrl('')
setLipSyncVideoUrl(''); setLipSyncError(''); setLipSyncStatus('')
try {
const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript, target_language: selectedLanguage, transcription_id: transcriptionId }) })
const data = await res.json()
if (data.translated_text) { setTranslatedText(data.translated_text) } else { setError(data.error || 'Translation failed') }
} catch { setError('Failed to connect to translation service') }
finally { setTranslating(false) }
}

async function handleSynthesize() {
if (!translatedText) return
setSynthesizing(true); setError(''); setAudioUrl('')
setLipSyncVideoUrl(''); setLipSyncError(''); setLipSyncStatus('')
try {
const res = await fetch('/api/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: translatedText }) })
const data = await res.json()
if (res.ok && data.url) {
setAudioUrl(data.url)
setTimeout(() => { audioRef.current?.play() }, 100)
} else {
setError(data.error || 'Voice synthesis failed')
}
} catch { setError('Failed to connect to voice synthesis service') }
finally { setSynthesizing(false) }
}

function getAudioDuration(url: string): Promise<number> {
return new Promise((resolve, reject) => {
const audio = new Audio()
audio.src = url
audio.addEventListener('loadedmetadata', () => resolve(audio.duration))
audio.addEventListener('error', () => reject(new Error('Could not read audio duration')))
})
}

async function handleLipSync() {
if (!videoUrl || !audioUrl) return
setLipSyncing(true); setLipSyncError(''); setLipSyncVideoUrl(''); setLipSyncStatus('Starting...')
try {
const durationSeconds = await getAudioDuration(audioUrl)

const res = await fetch('/api/lipsync', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ videoUrl, audioUrl, durationSeconds }),
})
const data = await res.json()

if (!res.ok || !data.id) {
setLipSyncError(data.error || 'Failed to start lip sync')
setLipSyncing(false)
return
}

setLipSyncStatus('Processing...')
pollLipSyncStatus(data.id)
} catch {
setLipSyncError('Failed to connect to lip sync service')
setLipSyncing(false)
}
}

async function pollLipSyncStatus(id: string) {
const maxAttempts = 60
let attempts = 0

const poll = async () => {
attempts++
try {
const res = await fetch(`/api/lipsync/status?id=${id}`)
const data = await res.json()

if (data.status === 'COMPLETED' && data.outputUrl) {
setLipSyncVideoUrl(data.outputUrl)
setLipSyncStatus('Complete')
setLipSyncing(false)
return
}

if (data.status === 'FAILED' || data.status === 'REJECTED') {
setLipSyncError(data.error || 'Lip sync generation failed')
setLipSyncing(false)
return
}

if (attempts >= maxAttempts) {
setLipSyncError('Lip sync is taking longer than expected. Check back later.')
setLipSyncing(false)
return
}

setLipSyncStatus(data.status === 'PENDING' ? 'Queued...' : 'Processing...')
setTimeout(poll, 10000)
} catch {
setLipSyncError('Lost connection while checking lip sync status')
setLipSyncing(false)
}
}

poll()
}

const tabStyle = (active: boolean) => ({
padding: '0.6rem 1.25rem',
borderRadius: '8px',
fontSize: '0.9rem',
fontWeight: 600,
cursor: 'pointer' as const,
border: active ? '1px solid #1D9E75' : '1px solid #E5E5EA',
background: active ? '#EAF7F1' : '#FFFFFF',
color: active ? '#1D9E75' : '#6B6B76',
})

return (
<main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
<DashboardHeader />
<div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
<h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dub a video</h2>
<p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>Upload a file or paste a YouTube link to transcribe, translate, and speak in your cloned voice.</p>

<div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
<button onClick={() => { setMode('upload'); resetAll() }} style={tabStyle(mode === 'upload')}>Upload file</button>
<button onClick={() => { setMode('youtube'); resetAll() }} style={tabStyle(mode === 'youtube')}>Paste YouTube URL</button>
</div>

<div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
{mode === 'upload' ? (
<>
<input type="file" accept="audio/*,video/*" onChange={(e) => { setFile(e.target.files?.[0] || null); resetAll() }} style={{ marginBottom: '1rem', display: 'block', fontSize: '0.9rem', color: '#1A1A1A' }} />
<button onClick={handleUploadFile} disabled={!file || loading} style={{ background: file && !loading ? '#1D9E75' : '#D1D1D8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: file && !loading ? 'pointer' : 'not-allowed' }}>
{loading ? loadingLabel || 'Working...' : 'Transcribe'}
</button>
</>
) : (
<>
<input type="text" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.9rem', marginBottom: '1rem', display: 'block', width: '100%', color: '#1A1A1A', background: '#FFFFFF' }} />
<label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1rem', cursor: 'pointer' }}>
<input type="checkbox" checked={rightsConfirmed} onChange={(e) => setRightsConfirmed(e.target.checked)} style={{ marginTop: '3px' }} />
I own this video or have the rights to dub and use it
</label>
<button onClick={handleFetchYoutube} disabled={!youtubeUrl || !rightsConfirmed || loading} style={{ background: youtubeUrl && rightsConfirmed && !loading ? '#1D9E75' : '#D1D1D8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: youtubeUrl && rightsConfirmed && !loading ? 'pointer' : 'not-allowed' }}>
{loading ? loadingLabel || 'Working...' : 'Fetch & Transcribe'}
</button>
</>
)}
</div>

{videoLabel && !error && (
<p style={{ fontSize: '0.8rem', color: '#6B6B76', marginTop: '-1rem', marginBottom: '1.25rem' }}>Source: {videoLabel}</p>
)}

{error && <p style={{ color: '#B54A2B', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

{transcript && (
<>
<div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '0.5rem' }}>Transcript</p>
<p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0, color: '#1A1A1A' }}>{transcript}</p>
</div>

<div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1A1A1A' }}>Translate into:</p>
<select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.9rem', marginBottom: '1rem', display: 'block', width: '100%', maxWidth: '300px', color: '#1A1A1A', background: '#FFFFFF' }}>
{LANGUAGES.map((lang) => (<option key={lang.code} value={lang.code}>{lang.name}</option>))}
</select>
<button onClick={handleTranslate} disabled={translating} style={{ background: translating ? '#D1D1D8' : '#533AB7', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: translating ? 'not-allowed' : 'pointer' }}>
{translating ? 'Translating...' : 'Translate with DeepL'}
</button>
</div>

{translatedText && (
<div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '0.5rem' }}>Translation — {LANGUAGES.find(l => l.code === selectedLanguage)?.name}</p>
<p style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem', color: '#1A1A1A' }}>{translatedText}</p>
<button onClick={handleSynthesize} disabled={synthesizing} style={{ background: synthesizing ? '#D1D1D8' : '#E8640A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: synthesizing ? 'not-allowed' : 'pointer' }}>
{synthesizing ? 'Generating voice...' : 'Speak in my cloned voice'}
</button>

{audioUrl && (
<div style={{ marginTop: '1.25rem' }}>
<p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '0.5rem' }}>Your cloned voice speaking the translation:</p>
<audio ref={audioRef} controls src={audioUrl} style={{ width: '100%' }} />

{isVideoSource ? (
<div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E5EA' }}>
<button onClick={handleLipSync} disabled={lipSyncing} style={{ background: lipSyncing ? '#D1D1D8' : '#1A1A1A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: lipSyncing ? 'not-allowed' : 'pointer' }}>
{lipSyncing ? (lipSyncStatus || 'Working...') : 'Lip sync my video'}
</button>
{lipSyncError && <p style={{ color: '#B54A2B', marginTop: '0.75rem', fontSize: '0.85rem' }}>{lipSyncError}</p>}
{lipSyncVideoUrl && (
<div style={{ marginTop: '1.25rem' }}>
<p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '0.5rem' }}>Your lip-synced video:</p>
<video controls src={lipSyncVideoUrl} style={{ width: '100%', borderRadius: '8px' }} />
</div>
)}
</div>
) : (
<p style={{ fontSize: '0.8rem', color: '#9A9AA4', marginTop: '1rem' }}>Lip sync requires a video file (you uploaded audio only).</p>
)}
</div>
)}
</div>
)}
</>
)}
</div>
</main>
)
}
