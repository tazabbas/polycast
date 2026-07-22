'use client'
import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { upload } from '@vercel/blob/client'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' }]



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

export default function DubVideo() {
const [mode, setMode] = useState<'upload' | 'youtube'>('upload')

const [file, setFile] = useState<File | null>(null)
const [localPreviewUrl, setLocalPreviewUrl] = useState('')
const [youtubeUrl, setYoutubeUrl] = useState('')
const [rightsConfirmed, setRightsConfirmed] = useState(false)

const [videoUrl, setVideoUrl] = useState('')
const [videoLabel, setVideoLabel] = useState('')
const [isVideoSource, setIsVideoSource] = useState(true)

const [trimDuration, setTrimDuration] = useState(0)
const [trimStart, setTrimStart] = useState(0)
const [trimEnd, setTrimEnd] = useState(0)

const [transcript, setTranscript] = useState('')
const [transcriptionId, setTranscriptionId] = useState('')
const [processing, setProcessing] = useState(false)
const [processingLabel, setProcessingLabel] = useState('')
const [error, setError] = useState('')

const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
const [results, setResults] = useState<Record<string, LangResult>>({})
const [dubbing, setDubbing] = useState(false)
const [activeLang, setActiveLang] = useState<string>('')

const [voices, setVoices] = useState<{ id: string; name: string }[]>([])
const [selectedVoiceId, setSelectedVoiceId] = useState('')

useEffect(() => {
fetch('/api/voices').then((r) => r.json()).then((data) => {
if (data.voices) setVoices(data.voices)
}).catch(() => {})
}, [])

const mainVideoRef = useRef<HTMLVideoElement>(null)
const audioTrackRefs = useRef<Record<string, HTMLAudioElement | null>>({})

const [isPlaying, setIsPlaying] = useState(false)
const [currentTime, setCurrentTime] = useState(0)
const [duration, setDuration] = useState(0)

function togglePlay() {
const video = mainVideoRef.current
if (!video) return
if (video.paused) {
video.play()
} else {
video.pause()
}
}

function handleSeek(e: ChangeEvent<HTMLInputElement>) {
const video = mainVideoRef.current
if (!video) return
const newTime = Number(e.target.value)
video.currentTime = newTime
setCurrentTime(newTime)
}

function formatTime(seconds: number): string {
if (!isFinite(seconds)) return '0:00'
const m = Math.floor(seconds / 60)
const s = Math.floor(seconds % 60)
return `${m}:${s.toString().padStart(2, '0')}`
}

useEffect(() => {
return () => {
if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
}
}, [localPreviewUrl])

// Keep the active language's audio track in sync with the video
useEffect(() => {
const video = mainVideoRef.current
if (!video) return

function syncActiveAudio() {
const activeAudio = audioTrackRefs.current[activeLang]
if (!activeAudio) return
if (Math.abs(activeAudio.currentTime - video!.currentTime) > 0.3) {
activeAudio.currentTime = video!.currentTime
}
}
function handlePlay() {
audioTrackRefs.current[activeLang]?.play().catch(() => {})
setIsPlaying(true)
}
function handlePauseVideo() {
audioTrackRefs.current[activeLang]?.pause()
setIsPlaying(false)
}
function handleSeeked() {
syncActiveAudio()
}
function handleTimeUpdate() {
syncActiveAudio()
setCurrentTime(video!.currentTime)
}
function handleLoadedMetadata() {
setDuration(video!.duration)
setTrimDuration((prev) => prev === 0 ? video!.duration : prev)
setTrimEnd((prev) => prev === 0 ? video!.duration : prev)
}

video.addEventListener('timeupdate', handleTimeUpdate)
video.addEventListener('play', handlePlay)
video.addEventListener('pause', handlePauseVideo)
video.addEventListener('seeked', handleSeeked)
video.addEventListener('loadedmetadata', handleLoadedMetadata)
return () => {
video.removeEventListener('timeupdate', handleTimeUpdate)
video.removeEventListener('play', handlePlay)
video.removeEventListener('pause', handlePauseVideo)
video.removeEventListener('seeked', handleSeeked)
video.removeEventListener('loadedmetadata', handleLoadedMetadata)
}
}, [activeLang])

useEffect(() => {
if (transcript) {
sessionStorage.setItem('polycast_unsaved_studio_work', 'true')
} else {
sessionStorage.removeItem('polycast_unsaved_studio_work')
}
return () => {
sessionStorage.removeItem('polycast_unsaved_studio_work')
}
}, [transcript])

useEffect(() => {
function handleBeforeUnload(e: BeforeUnloadEvent) {
if (transcript) {
e.preventDefault()
}
}
window.addEventListener('beforeunload', handleBeforeUnload)
return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [transcript])

function switchLanguage(code: string) {
const video = mainVideoRef.current
const oldAudio = audioTrackRefs.current[activeLang]
const newAudio = audioTrackRefs.current[code]
if (oldAudio) oldAudio.pause()
setActiveLang(code)
setSavedDub(false)
if (newAudio && video) {
newAudio.currentTime = video.currentTime
if (!video.paused) newAudio.play().catch(() => {})
}
}

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
setActiveLang('')
setError('')
setTrimStart(0); setTrimEnd(0); setTrimDuration(0)
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
const synthRes = await fetch('/api/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.translated_text, voiceId: selectedVoiceId || undefined }) })
const synthData = await synthRes.json()
if (synthRes.ok && synthData.url) {
updateResult(code, { audioUrl: synthData.url, synthesizing: false })
if (!activeLang) setActiveLang(code)
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
if (mainVideoRef.current) {
mainVideoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
}

const [savingVideo, setSavingVideo] = useState(false)
const [savedVideo, setSavedVideo] = useState(false)
const [savingDub, setSavingDub] = useState(false)
const [savedDub, setSavedDub] = useState(false)
const [saveDubError, setSaveDubError] = useState('')

async function handleSaveVideo(code: string) {
const r = results[code]
if (!r?.lipSyncVideoUrl) return
setSavingVideo(true)
try {
await fetch('/api/saved-videos', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
type: 'lipsync',
language: LANGUAGES.find((l) => l.code === code)?.name || code,
videoUrl: r.lipSyncVideoUrl,
sourceLabel: videoLabel,
}),
})
setSavedVideo(true)
} catch {
// silent fail, user can retry
} finally {
setSavingVideo(false)
}
}

async function handleSaveDub(code: string) {
const r = results[code]
if (!videoUrl || !r?.audioUrl || !isVideoSource) return
setSavingDub(true); setSaveDubError('')
try {
const ffmpeg = await getFFmpeg()
await ffmpeg.writeFile('save_video_in.mp4', await fetchFile(videoUrl))
await ffmpeg.writeFile(`save_audio_in_${code}.mp3`, await fetchFile(r.audioUrl))
await ffmpeg.exec(['-i', 'save_video_in.mp4', '-i', `save_audio_in_${code}.mp3`, '-c:v', 'copy', '-map', '0:v:0', '-map', '1:a:0', '-shortest', `save_out_${code}.mp4`])
const data = await ffmpeg.readFile(`save_out_${code}.mp4`)
const mergedBlob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
const mergedFile = new File([mergedBlob], `dub-${code}.mp4`, { type: 'video/mp4' })
const blob = await upload(`dub-${code}.mp4`, mergedFile, { access: 'public', handleUploadUrl: '/api/blob-upload' })

await fetch('/api/saved-videos', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
type: 'dub',
language: LANGUAGES.find((l) => l.code === code)?.name || code,
videoUrl: blob.url,
sourceLabel: videoLabel,
}),
})
setSavedDub(true)
} catch {
setSaveDubError('Could not save this dub. Try again.')
} finally {
setSavingDub(false)
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
setSavedVideo(false)
try {
const needsTrim = trimStart > 0.15 || (trimDuration > 0 && trimEnd < trimDuration - 0.15)
let finalVideoUrl = videoUrl
let finalAudioUrl = r.audioUrl
let durationSeconds = await getAudioDuration(r.audioUrl)

if (needsTrim) {
updateResult(code, { lipSyncStatus: 'Trimming clip...' })
const ffmpeg = await getFFmpeg()

await ffmpeg.writeFile('lip_video_in.mp4', await fetchFile(videoUrl))
await ffmpeg.exec(['-i', 'lip_video_in.mp4', '-ss', String(trimStart), '-to', String(trimEnd), '-c', 'copy', 'lip_video_out.mp4'])
const videoData = await ffmpeg.readFile('lip_video_out.mp4')
const trimmedVideoFile = new File([videoData as unknown as BlobPart], `trim-${code}.mp4`, { type: 'video/mp4' })
const videoBlob = await upload(`trim-${code}.mp4`, trimmedVideoFile, { access: 'public', handleUploadUrl: '/api/blob-upload' })
finalVideoUrl = videoBlob.url

await ffmpeg.writeFile('lip_audio_in.mp3', await fetchFile(r.audioUrl))
await ffmpeg.exec(['-i', 'lip_audio_in.mp3', '-ss', String(trimStart), '-to', String(trimEnd), '-c', 'copy', 'lip_audio_out.mp3'])
const audioData = await ffmpeg.readFile('lip_audio_out.mp3')
const trimmedAudioFile = new File([audioData as unknown as BlobPart], `trim-audio-${code}.mp3`, { type: 'audio/mpeg' })
const audioBlob = await upload(`trim-audio-${code}.mp3`, trimmedAudioFile, { access: 'public', handleUploadUrl: '/api/blob-upload' })
finalAudioUrl = audioBlob.url

durationSeconds = trimEnd - trimStart
}

updateResult(code, { lipSyncStatus: 'Starting...' })
const res = await fetch('/api/lipsync', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ videoUrl: finalVideoUrl, audioUrl: finalAudioUrl, durationSeconds }),
})
const data = await res.json()
if (!res.ok || !data.id) {
updateResult(code, { lipSyncError: data.error || 'Failed to start lip sync', lipSyncing: false })
return
}
updateResult(code, { lipSyncStatus: 'Processing...' })
pollLipSyncStatus(code, data.id)
} catch {
updateResult(code, { lipSyncError: 'Failed to trim or start lip sync', lipSyncing: false })
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

const trackChipStyle = (active: boolean) => ({
padding: '0.4rem 0.85rem',
borderRadius: '999px',
fontSize: '0.78rem',
fontWeight: 700,
cursor: 'pointer' as const,
border: 'none',
background: active ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
color: active ? '#FFFFFF' : '#1A1A1A',
})

const previewUrl = mode === 'upload' ? localPreviewUrl : videoUrl
const readyLanguages = selectedLanguages.filter((code) => results[code]?.audioUrl)

return (
<main style={{ background: '#FFFFFF', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
<div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
<h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dub a video</h2>
<p style={{ fontSize: '0.9rem', color: '#6B6B76', marginBottom: '1.5rem' }}>Upload a file or paste a YouTube link. We will transcribe and prep it automatically.</p>

<div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
<button onClick={() => { setMode('upload'); resetAll(); setFile(null); setLocalPreviewUrl('') }} style={tabStyle(mode === 'upload')}>Upload file</button>
<button onClick={() => { setMode('youtube'); resetAll(); setFile(null); setLocalPreviewUrl('') }} style={tabStyle(mode === 'youtube')}>Paste YouTube URL</button>
</div>

<div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
{mode === 'upload' ? (
<label style={{ display: 'block', border: '2px dashed #D1D1D8', borderRadius: '10px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#FFFFFF' }}>
<input type="file" accept="audio/*,video/*" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} style={{ display: 'none' }} />
<p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1D9E75' }}>Click to choose a video or audio file</p>
<p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#9A9AA4' }}>{file ? file.name : 'MP4, MOV, MP3, WAV supported'}</p>
</label>
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
<div style={{ position: 'relative', marginBottom: '1.25rem' }}>
<video ref={mainVideoRef} disablePictureInPicture muted={readyLanguages.length > 0} src={previewUrl} onClick={togglePlay} style={{ width: '100%', borderRadius: '12px', background: '#000', cursor: 'pointer', display: 'block' }} />

<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
<button onClick={togglePlay} style={{ background: '#1A1A1A', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '0.8rem' }}>
{isPlaying ? '❚❚' : '▶'}
</button>
<span style={{ fontSize: '0.75rem', color: '#6B6B76', minWidth: '38px' }}>{formatTime(currentTime)}</span>
<input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={handleSeek} style={{ flex: 1 }} />
<span style={{ fontSize: '0.75rem', color: '#6B6B76', minWidth: '38px' }}>{formatTime(duration)}</span>
</div>

{readyLanguages.length > 0 && (
<div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: 'calc(100% - 24px)', justifyContent: 'flex-end' }}>
{readyLanguages.map((code) => (
<button key={code} onClick={() => switchLanguage(code)} style={trackChipStyle(activeLang === code)}>
{LANGUAGES.find((l) => l.code === code)?.name}
</button>
))}
</div>
)}

{readyLanguages.map((code) => (
<audio key={code} ref={(el) => { audioTrackRefs.current[code] = el }} src={results[code].audioUrl} preload="auto" />
))}
</div>
)}

{readyLanguages.length > 0 && (
<p style={{ fontSize: '0.78rem', color: '#9A9AA4', marginTop: '-1rem', marginBottom: '1.25rem' }}>
This videos own audio stays off — sound comes from whichever language pill is selected above.
</p>
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
<div style={{ background: '#F7F7F8', border: '1px solid #E5E5EA', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
<p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: '#1A1A1A' }}>Voice to use:</p>
<a href="/dashboard/voices" style={{ fontSize: '0.8rem', color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>Manage voices →</a>
</div>
<select value={selectedVoiceId} onChange={(e) => setSelectedVoiceId(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #D1D1D8', fontSize: '0.9rem', display: 'block', width: '100%', maxWidth: '300px', color: '#1A1A1A', background: '#FFFFFF' }}>
<option value="">Default voice</option>
{voices.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
</select>
</div>

<div style={{ background: '#FDF2EE', border: '1px solid #F0C4B4', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.8rem', color: '#B54A2B', margin: 0 }}>
Work here is not saved automatically. Use a Save to My Videos button before leaving this page, or you will need to start over.
</p>
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

{readyLanguages.length > 0 && (
<p style={{ fontSize: '0.8rem', color: '#6B6B76', marginTop: '-0.75rem', marginBottom: '1.5rem' }}>
Use the language buttons on the video above to switch instantly, mid-playback.
</p>
)}

{readyLanguages.length > 0 && activeLang && results[activeLang] && (
<div style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
<p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1A1A1A', fontFamily: "'Syne', sans-serif" }}>
Lip sync — {LANGUAGES.find((l) => l.code === activeLang)?.name}
</p>
{isVideoSource ? (
<>
<div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E5E5EA' }}>
<p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: '#1A1A1A' }}>Free dub — save the video you are watching now</p>
<button onClick={() => handleSaveDub(activeLang)} disabled={savingDub || savedDub} style={{ background: savedDub ? '#EAF7F1' : '#1D9E75', color: savedDub ? '#1D9E75' : 'white', border: savedDub ? '1px solid #1D9E75' : 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: savingDub || savedDub ? 'not-allowed' : 'pointer' }}>
{savedDub ? 'Saved to My Videos ✓' : savingDub ? 'Saving...' : 'Save to My Videos'}
</button>
{saveDubError && <p style={{ color: '#B54A2B', marginTop: '0.6rem', fontSize: '0.8rem' }}>{saveDubError}</p>}
</div>
{trimDuration > 0 && (
<div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E5E5EA' }}>
<p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1A1A1A' }}>
Clip length for lip sync: {(trimEnd - trimStart).toFixed(1)}s
</p>
<p style={{ fontSize: '0.75rem', color: '#9A9AA4', marginBottom: '0.75rem' }}>
Pick the part of the video to lip sync — shorter clips cost less and process faster.
</p>
<div style={{ marginBottom: '0.5rem' }}>
<label style={{ fontSize: '0.75rem', color: '#6B6B76' }}>Start: {trimStart.toFixed(1)}s</label>
<input type="range" min={0} max={trimDuration} step={0.1} value={trimStart} onChange={(e) => { const v = Number(e.target.value); if (v < trimEnd) setTrimStart(v) }} style={{ width: '100%' }} />
</div>
<div>
<label style={{ fontSize: '0.75rem', color: '#6B6B76' }}>End: {trimEnd.toFixed(1)}s</label>
<input type="range" min={0} max={trimDuration} step={0.1} value={trimEnd} onChange={(e) => { const v = Number(e.target.value); if (v > trimStart) setTrimEnd(v) }} style={{ width: '100%' }} />
</div>
</div>
)}
<button onClick={() => handleLipSync(activeLang)} disabled={results[activeLang].lipSyncing} style={{ background: results[activeLang].lipSyncing ? '#D1D1D8' : '#1A1A1A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: results[activeLang].lipSyncing ? 'not-allowed' : 'pointer' }}>
{results[activeLang].lipSyncing ? (results[activeLang].lipSyncStatus || 'Working...') : 'Lip sync my video'}
</button>
{results[activeLang].lipSyncError && <p style={{ color: '#B54A2B', marginTop: '0.75rem', fontSize: '0.85rem' }}>{results[activeLang].lipSyncError}</p>}
{results[activeLang].lipSyncVideoUrl && (
<div style={{ marginTop: '1.25rem' }}>
<video controls src={results[activeLang].lipSyncVideoUrl} style={{ width: '100%', borderRadius: '8px' }} />
<button
onClick={() => handleSaveVideo(activeLang)}
disabled={savingVideo || savedVideo}
style={{ marginTop: '0.75rem', background: savedVideo ? '#EAF7F1' : '#1D9E75', color: savedVideo ? '#1D9E75' : 'white', border: savedVideo ? '1px solid #1D9E75' : 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: savingVideo || savedVideo ? 'not-allowed' : 'pointer' }}
>
{savedVideo ? 'Saved to My Videos ✓' : savingVideo ? 'Saving...' : 'Save to My Videos'}
</button>
</div>
)}
</>
) : (
<p style={{ fontSize: '0.8rem', color: '#9A9AA4' }}>Video dubbing requires a video file.</p>
)}
</div>
)}
</>
)}
</div>
</main>
)
}
