'use client'
import { useState, useRef } from 'react'
import DashboardHeader from '../header'
const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' }]

export default function TranscribePage() {
const [file, setFile] = useState<File | null>(null)
const [transcript, setTranscript] = useState('')
const [transcriptionId, setTranscriptionId] = useState('')
const [selectedLanguage, setSelectedLanguage] = useState('ES')
const [translatedText, setTranslatedText] = useState('')
const [audioUrl, setAudioUrl] = useState('')
const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
const [loading, setLoading] = useState(false)
const [translating, setTranslating] = useState(false)
const [synthesizing, setSynthesizing] = useState(false)
const [error, setError] = useState('')
const audioRef = useRef<HTMLAudioElement>(null)

// Lip sync state
const [lipSyncing, setLipSyncing] = useState(false)
const [lipSyncStatus, setLipSyncStatus] = useState('')
const [lipSyncVideoUrl, setLipSyncVideoUrl] = useState('')
const [lipSyncError, setLipSyncError] = useState('')

const isVideoFile = file?.type.startsWith('video/')
const MAX_LIPSYNC_SIZE = 20 * 1024 * 1024

async function handleUpload() {
if (!file) return
setLoading(true); setError(''); setTranscript(''); setTranslatedText(''); setAudioUrl(''); setAudioBlob(null)
setLipSyncVideoUrl(''); setLipSyncError(''); setLipSyncStatus('')
const formData = new FormData()
formData.append('file', file)
try {
const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
const data = await res.json()
if (data.transcript) {
setTranscript(data.transcript)
const saveRes = await fetch('/api/transcriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_name: file.name, transcript: data.transcript }) })
const saveData = await saveRes.json()
if (saveData.transcription?.id) setTranscriptionId(saveData.transcription.id)
} else { setError(data.error || 'Something went wrong') }
} catch { setError('Failed to connect to transcription service') }
finally { setLoading(false) }
}

async function handleTranslate() {
if (!transcript || !selectedLanguage) return
setTranslating(true); setError(''); setTranslatedText(''); setAudioUrl(''); setAudioBlob(null)
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
setSynthesizing(true); setError(''); setAudioUrl(''); setAudioBlob(null)
setLipSyncVideoUrl(''); setLipSyncError(''); setLipSyncStatus('')
try {
const res = await fetch('/api/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: translatedText }) })
if (res.ok) {
const blob = await res.blob()
setAudioBlob(blob)
const url = URL.createObjectURL(blob)
setAudioUrl(url)
setTimeout(() => { audioRef.current?.play() }, 100)
} else {
const data = await res.json()
setError(data.error || 'Voice synthesis failed')
}
} catch { setError('Failed to connect to voice synthesis service') }
finally { setSynthesizing(false) }
}

async function handleLipSync() {
if (!file || !audioBlob) return
setLipSyncing(true); setLipSyncError(''); setLipSyncVideoUrl(''); setLipSyncStatus('Uploading...')
try {
const formData = new FormData()
formData.append('video', file)
formData.append('audio', audioBlob, 'dubbed-audio.mp3')

const res = await fetch('/api/lipsync', { method: 'POST', body: formData })
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
const maxAttempts = 60 // ~10 minutes at 10s intervals
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

return (
<main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '680px' }}>
<DashboardHeader />
<h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Transcribe & Translate</h2>
<p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Upload a video or audio file to transcribe it with AI, then translate and speak in your cloned voice.</p>
<div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
<input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: '1rem', display: 'block', fontSize: '0.9rem' }} />
<button onClick={handleUpload} disabled={!file || loading} style={{ background: file && !loading ? '#1D9E75' : '#ccc', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: file && !loading ? 'pointer' : 'not-allowed' }}>
{loading ? 'Transcribing...' : 'Transcribe'}
</button>
</div>
{error && <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>}
{transcript && (
<>
<div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Transcript</p>
<p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{transcript}</p>
</div>
<div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.75rem' }}>Translate into:</p>
<select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', marginBottom: '1rem', display: 'block', width: '100%', maxWidth: '300px' }}>
{LANGUAGES.map((lang) => (<option key={lang.code} value={lang.code}>{lang.name}</option>))}
</select>
<button onClick={handleTranslate} disabled={translating} style={{ background: translating ? '#ccc' : '#533AB7', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: translating ? 'not-allowed' : 'pointer' }}>
{translating ? 'Translating...' : 'Translate with DeepL'}
</button>
</div>
{translatedText && (
<div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Translation — {LANGUAGES.find(l => l.code === selectedLanguage)?.name}</p>
<p style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{translatedText}</p>
<button onClick={handleSynthesize} disabled={synthesizing} style={{ background: synthesizing ? '#ccc' : '#E8640A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: synthesizing ? 'not-allowed' : 'pointer' }}>
{synthesizing ? 'Generating voice...' : 'Speak in my cloned voice'}
</button>
{audioUrl && (
<div style={{ marginTop: '1.25rem' }}>
<p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Your cloned voice speaking the translation:</p>
<audio ref={audioRef} controls src={audioUrl} style={{ width: '100%' }} />

{isVideoFile ? (
<div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
{file && file.size > MAX_LIPSYNC_SIZE ? (
<p style={{ fontSize: '0.85rem', color: '#c00' }}>Video is over 20MB — too large for lip sync right now.</p>
) : (
<>
<button onClick={handleLipSync} disabled={lipSyncing} style={{ background: lipSyncing ? '#ccc' : '#1A1A1A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', cursor: lipSyncing ? 'not-allowed' : 'pointer' }}>
{lipSyncing ? (lipSyncStatus || 'Working...') : 'Lip sync my video'}
</button>
{lipSyncError && <p style={{ color: '#c00', marginTop: '0.75rem', fontSize: '0.85rem' }}>{lipSyncError}</p>}
{lipSyncVideoUrl && (
<div style={{ marginTop: '1.25rem' }}>
<p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Your lip-synced video:</p>
<video controls src={lipSyncVideoUrl} style={{ width: '100%', borderRadius: '8px' }} />
</div>
)}
</>
)}
</div>
) : (
<p style={{ fontSize: '0.8rem', color: '#999', marginTop: '1rem' }}>Lip sync requires a video file (you uploaded audio only).</p>
)}
</div>
)}
</div>
)}
</>
)}
</main>
)
}
