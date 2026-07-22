'use client'
import { useState, useRef, useEffect } from 'react'
import { upload } from '@vercel/blob/client'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import DashboardHeader from '../header'
const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' }]

let ffmpegSingleton: FFmpeg | null = null
async function getFFmpeg(): Promise<FFmpeg> {
if (ffmpegSingleton) return ffmpegSingleton
const ffmpeg = new FFmpeg()
const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
await ffmpeg.load({
coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
})
ffmpegSingleton = ffmpeg
return ffmpeg
}

interface LangResult {
translatedText: string
translating: boolean
translateError: string
audioUrl: string
synthesizing: boolean
synthError: string
merging: boolean
mergeStatus: string
mergedVideoUrl: string
mergeError: string
lipSyncing: boolean
lipSyncStatus: string
lipSyncVideoUrl: string
lipSyncError: string
}

function emptyResult(): LangResult {
return {
translatedText: '', translating: false, translateError: '',
audioUrl: '', synthesizing: false, synthError: '',
merging: false, mergeStatus: '', mergedVideoUrl: '', mergeError: '',
lipSyncing: false, lipSyncStatus: '', lipSyncVideoUrl: '', lipSyncError: '',
}
}

export default function TranscribePage() {
const [mode, setMode] = useState<'upload' | 'youtube'>('upload')

const [file, setFile] = useState<File | null>(null)
const [localPreviewUrl, setLocalPreviewUrl] = useState('')
const [youtubeUrl, setYoutubeUrl] = useState('')
const [rightsConfirmed, setRightsConfirmed] = useState(false)

const [videoUrl, setVideoUrl] = useState('')
const [videoLabel, setVideoLabel] = useState('')
const [isVideoSource, setIsVideoSource] = useState(true)

const [transcript, setTranscript] = useState('')
const [transcriptionId, setTranscriptionId] = useState('')
const [processing, setProcessing] = useState(false)
const [processingLabel, setProcessingLabel] = useState('')
const [error, setError] = useState('')
const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
const [results, setResults] = useState<Record<string, LangResult>>({})
const [dubbing, setDubbing] = useState(false)

useEffect(() => {
return () => {
if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
}
}, [localPreviewUrl])

function toggleLanguage(code: string) {
setSelectedLanguages((prev) =>
prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
)
}

function resetAll() {
setVideoUrl(''); setVideoLabel('')
setTranscript('')
setResults({})
setSelectedLanguages([])
setError('')
}

function handleFileSelect(selected: File | null) {
resetAll()
setFile(selected)
if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
if (selected) {
const preview = URL.createObjectURL(selected)
setLocalPreviewUrl(preview)
setIsVideoSource(selected.type.startsWith('video/'))
handleUploadFile(selected)
} else {
setLocalPreviewUrl('')
}
}

async function handleUploadFile(selectedFile: File) {
setProcessing(true); setError('')
try {
setProcessingLabel('Uploading...')
const blob = await upload(selectedFile.name, selectedFile, {
access: 'public',
handleUploadUrl: '/api/blob-upload',
})
setVideoUrl(blob.url)
setVideoLabel(selectedFile.name)

await runTranscription(blob.url, selectedFile.name)
} catch {
setError('Failed to upload or transcribe the file')
setProcessing(false); setProcessingLabel('')
}
}

async function handleFetchYoutube() {
if (!youtubeUrl || !rightsConfirmed) return
setProcessing(true); setError(''); resetAll()
try {
setProcessingLabel('Fetching video...')
const fetchRes = await fetch('/api/youtube-fetch', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ youtubeUrl }),
})
const fetchData = await fetchRes.json()
if (!fetchRes.ok || !fetchData.videoUrl) {
setError(fetchData.error || 'Could not fetch that video')
setProcessing(false); setProcessingLabel('')
return
}
setVideoUrl(fetchData.videoUrl)
setVideoLabel(fetchData.title || 'YouTube video')
setIsVideoSource(true)

await runTranscription(fetchData.videoUrl, fetchData.title || 'youtube-video')
} catch {
setError('Failed to fetch or transcribe that video')
setProcessing(false); setProcessingLabel('')
}
}

async function runTranscription(url: string, label: string) {
setProcessingLabel('Transcribing...')
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
setProcessing(false); setProcessingLabel('')
}

function updateResult(code: string, patch: Partial<LangResult>) {
setResults((prev) => ({ ...prev, [code]: { ...(prev[code] || emptyResult()), ...patch } }))
}

async function handleDubAll() {
if (!transcript || selectedLanguages.length === 0) return
setDubbing(true); setError('')

for (const code of selectedLanguages) {
updateResult(code, { ...emptyResult(), translating: true })
try {
const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript, target_language: code, transcription_id: transcriptionId }) })
const data = await res.json()
if (data.translated_text) {
updateResult(code, { translatedText: data.translated_text, translating: false })

updateResult(code, { synthesizing: true })
const synthRes = await fetch('/api/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.translated_text }) })
const synthData = await synthRes.json()
if (synthRes.ok && synthData.url) {
updateResult(code, { audioUrl: synthData.url, synthesizing: false })
} else {
updateResult(code, { synthError: synthData.error || 'Voice synthesis failed', synthesizing: false })
}
} else {
updateResult(code, { translateError: data.error || 'Translation failed', translating: false })
}
} catch {
updateResult(code, { translateError: 'Connection failed', translating: false })
}
}

setDubbing(false)
}

async function handleMergeVideo(code: string) {
const r = results[code]
if (!videoUrl || !r?.audioUrl || !isVideoSource) return
updateResult(code, { merging: true, mergeError: '', mergedVideoUrl: '', mergeStatus: 'Loading engine...' })
try {
const ffmpeg = await getFFmpeg()
updateResult(code, { mergeStatus: 'Preparing files...' })
await ffmpeg.writeFile('input_video.mp4', await fetchFile(videoUrl))
await ffmpeg.writeFile(`input_audio_${code}.mp3`, await fetchFile(r.audioUrl))

updateResult(code, { mergeStatus: 'Merging...' })
await ffmpeg.exec([
'-i', 'input_video.mp4',
'-i', `input_audio_${code}.mp3`,
'-c:v', 'copy',
'-map', '0:v:0',
'-map', '1:a:0',
'-shortest',
`output_${code}.mp4`,
])

const data = await ffmpeg.readFile(`output_${code}.mp4`)
const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
const url = URL.createObjectURL(blob)
updateResult(code, { mergedVideoUrl: url, mergeStatus: 'Complete', merging: false })
} catch {
updateResult(code, { mergeError: 'Could not merge video and audio. Try a shorter clip.', merging: false })
}
}

function getAudioDuration(url: string): Promise<number> {
return new Promise((resolve, reject) => {
const audio = new Audio()
audio.src = url
audio.addEventListener('loadedmetadata', () => resolve(audio.duration))
audio.addEventListener('error', () => reject(new Error('Could not read audio duration')))
})
}

async function handleLipSync(code: string) {
const r = results[code]
if (!videoUrl || !r?.audioUrl) return
updateResult(code, { lipSyncing: true, lipSyncError: '', lipSyncVideoUrl: '', lipSyncStatus: 'Starting...' })
try {
const durationSeconds = await getAudioDuration(r.audioUrl)
const res = await fetch('/api/lipsync', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ videoUrl, audioUrl: r.audioUrl, durationSeconds }),
})
const data = await res.json()
if (!res.ok || !data.id) {
updateResult(code, { lipSyncError: data.error || 'Failed to start lip sync', lipSyncing: false })
return
}
updateResult(code, { lipSyncStatus: 'Processing...' })
pollLipSyncStatus(code, data.id)
} catch {
updateResult(code, { lipSyncError: 'Failed to connect to lip sync service', lipSyncing: false })
}
}

async function pollLipSyncStatus(code: string, id: string) {
const maxAttempts = 60
let attempts = 0

const poll = async () => {
attempts++
try {
const res = await fetch(`/api/lipsync/status?id=${id}`)
const data = await res.json()

if (data.status === 'COMPLETED' && data.outputUrl) {
updateResult(code, { lipSyncVideoUrl: data.outputUrl, lipSyncStatus: 'Complete', lipSyncing: false })
return
}
if (data.status === 'FAILED' || data.status === 'REJECTED') {
updateResult(code, { lipSyncError: data.error || 'Lip sync generation failed', lipSyncing: false })
return
}
if (attempts >= maxAttempts) {
updateResult(code, { lipSyncError: 'Taking longer than expected. Check back later.', lipSyncing: false })
return
}
updateResult(code, { lipSyncStatus: data.status === 'PENDING' ? 'Queued...' : 'Processing...' })
setTimeout(poll, 10000)
} catch {
updateResult(code, { lipSyncError: 'Lost connection while checking status', lipSyncing: false })
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

const chipStyle = (active: boolean) => ({
padding: '0.5rem 1rem',
borderRadius: '999px',
fontSize: '0.85rem',
fontWeight: 600,
cursor: 'pointer' as const,
border: active ? '1px solid #1D9E75' : '1px solid #D1D1D8',
background: active ? '#1D9E75' : '#FFFFFF',
color: active ? '#FFFFFF' : '#4A4A54',
})

const previewUrl = mode === 'upload' ? localPreviewUrl : videoUrl

return (
<main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
<DashboardHeader />
<div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
<h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dub a video</h2>
<p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>Upload a file or paste a YouTube link. We will transcribe and prep it automatically.</p>

<div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
<button onClick={() => { setMode('upload'); resetAll(); setFile(null); setLocalPreviewUrl('') }} style={tabStyle(mode === 'upload')}>Upload file</button>
<button onClick={() => { setMode('youtube'); resetAll(); setFile(null); setLocalPreviewUrl('') }} style={tabStyle(mode === 'youtube')}>Paste YouTube URL</button>
</div>

<div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
{mode === 'upload' ? (
<input type="file" accept="audio/*,video/*" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} style={{ display: 'block', fontSize: '0.9rem', color: '#1A1A1A' }} />
) : (
<>
<input type="text" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.9rem', marginBottom: '1rem', display: 'block', width: '100%', color: '#1A1A1A', background: '#FFFFFF' }} />
<label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1rem', cursor: 'pointer' }}>
<input type="checkbox" checked={rightsConfirmed} onChange={(e) => setRightsConfirmed(e.target.checked)} style={{ marginTop: '3px' }} />
I own this video or have the rights to dub and use it
</label>
<button onClick={handleFetchYoutube} disabled={!youtubeUrl || !rightsConfirmed || processing} style={{ background: youtubeUrl && rightsConfirmed && !processing ? '#1D9E75' : '#D1D1D8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: youtubeUrl && rightsConfirmed && !processing ? 'pointer' : 'not-allowed' }}>
{processing ? processingLabel || 'Working...' : 'Fetch video'}
</button>
</>
)}
</div>

{previewUrl && isVideoSource && (
<div style={{ marginBottom: '1.25rem' }}>
<video controls src={previewUrl} style={{ width: '100%', borderRadius: '12px', background: '#000' }} />
</div>
)}

{videoLabel && !error && (
<p style={{ fontSize: '0.8rem', color: '#6B6B76', marginBottom: '1.25rem' }}>Source: {videoLabel}</p>
)}

{processing && (
<p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '1.25rem' }}>{processingLabel || 'Working...'}</p>
)}

{error && <p style={{ color: '#B54A2B', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

{transcript && (
<>
<div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.85rem', color: '#6B6B76', marginBottom: '0.5rem' }}>Transcript</p>
<p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0, color: '#1A1A1A' }}>{transcript}</p>
</div>

<div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1A1A1A' }}>Select languages to dub into:</p>
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
{LANGUAGES.map((lang) => (
<button key={lang.code} onClick={() => toggleLanguage(lang.code)} style={chipStyle(selectedLanguages.includes(lang.code))}>
{lang.name}
</button>
))}
</div>
<button onClick={handleDubAll} disabled={selectedLanguages.length === 0 || dubbing} style={{ background: selectedLanguages.length > 0 && !dubbing ? '#533AB7' : '#D1D1D8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: selectedLanguages.length > 0 && !dubbing ? 'pointer' : 'not-allowed' }}>
{dubbing ? 'Dubbing...' : `Translate & dub (${selectedLanguages.length || 0})`}
</button>
</div>

{selectedLanguages.map((code) => {
const lang = LANGUAGES.find((l) => l.code === code)!
const r = results[code] || emptyResult()
return (
<div key={code} style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1A1A1A', fontFamily: "'Syne', sans-serif" }}>{lang.name}</p>

{r.translating && <p style={{ fontSize: '0.85rem', color: '#6B6B76' }}>Translating...</p>}
{r.translateError && <p style={{ fontSize: '0.85rem', color: '#B54A2B' }}>{r.translateError}</p>}
{r.translatedText && <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#1A1A1A', marginBottom: '1rem' }}>{r.translatedText}</p>}

{r.synthesizing && <p style={{ fontSize: '0.85rem', color: '#6B6B76' }}>Generating voice...</p>}
{r.synthError && <p style={{ fontSize: '0.85rem', color: '#B54A2B' }}>{r.synthError}</p>}

{r.audioUrl && (
<div style={{ marginTop: '0.5rem' }}>
<audio ref={(el) => { audioRefs.current[code] = el }} controls src={r.audioUrl} style={{ width: '100%' }} />

{isVideoSource ? (
<>
<div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E5EA' }}>
<p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: '#1A1A1A' }}>Free: dubbed video</p>
<button onClick={() => handleMergeVideo(code)} disabled={r.merging} style={{ background: r.merging ? '#D1D1D8' : '#1D9E75', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: r.merging ? 'not-allowed' : 'pointer' }}>
{r.merging ? (r.mergeStatus || 'Working...') : 'Create dubbed video'}
</button>
{r.mergeError && <p style={{ color: '#B54A2B', marginTop: '0.6rem', fontSize: '0.8rem' }}>{r.mergeError}</p>}
{r.mergedVideoUrl && (
<div style={{ marginTop: '1rem' }}>
<video controls src={r.mergedVideoUrl} style={{ width: '100%', borderRadius: '8px' }} />
<a href={r.mergedVideoUrl} download={`dubbed-${code}.mp4`} style={{ display: 'inline-block', marginTop: '0.6rem', fontSize: '0.8rem', color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>Download video →</a>
</div>
)}
</div>

<div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E5EA' }}>
<p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: '#1A1A1A' }}>Paid: lip sync</p>
<button onClick={() => handleLipSync(code)} disabled={r.lipSyncing} style={{ background: r.lipSyncing ? '#D1D1D8' : '#1A1A1A', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: r.lipSyncing ? 'not-allowed' : 'pointer' }}>
{r.lipSyncing ? (r.lipSyncStatus || 'Working...') : 'Lip sync my video'}
</button>
{r.lipSyncError && <p style={{ color: '#B54A2B', marginTop: '0.6rem', fontSize: '0.8rem' }}>{r.lipSyncError}</p>}
{r.lipSyncVideoUrl && (
<div style={{ marginTop: '1rem' }}>
<video controls src={r.lipSyncVideoUrl} style={{ width: '100%', borderRadius: '8px' }} />
</div>
)}
</div>
</>
) : (
<p style={{ fontSize: '0.8rem', color: '#9A9AA4', marginTop: '0.75rem' }}>Video dubbing requires a video file.</p>
)}
</div>
)}
</div>
)
})}
</>
)}
</div>
</main>
)
}
